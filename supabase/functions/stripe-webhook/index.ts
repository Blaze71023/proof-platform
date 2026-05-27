import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeKey) {
      return new Response("Stripe not configured", { status: 503 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

    const body = await req.text();
    let event: Stripe.Event;

    if (webhookSecret) {
      const signature = req.headers.get("stripe-signature");
      if (!signature) {
        return new Response("Missing signature", { status: 400 });
      }
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err: any) {
        return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
      }
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const planFromPriceId = (priceId: string): string => {
      const soloMonthly = Deno.env.get("STRIPE_PRICE_SOLO_MONTHLY") || "";
      const soloYearly = Deno.env.get("STRIPE_PRICE_SOLO_YEARLY") || "";
      const proMonthly = Deno.env.get("STRIPE_PRICE_PRO_MONTHLY") || "";
      const proYearly = Deno.env.get("STRIPE_PRICE_PRO_YEARLY") || "";
      const bizMonthly = Deno.env.get("STRIPE_PRICE_BUSINESS_MONTHLY") || "";
      const bizYearly = Deno.env.get("STRIPE_PRICE_BUSINESS_YEARLY") || "";
      if (priceId === soloMonthly || priceId === soloYearly) return "solo";
      if (priceId === proMonthly || priceId === proYearly) return "pro";
      if (priceId === bizMonthly || priceId === bizYearly) return "business";
      return "solo";
    };

    const cycleFromPriceId = (priceId: string): string => {
      const soloYearly = Deno.env.get("STRIPE_PRICE_SOLO_YEARLY") || "";
      const proYearly = Deno.env.get("STRIPE_PRICE_PRO_YEARLY") || "";
      const bizYearly = Deno.env.get("STRIPE_PRICE_BUSINESS_YEARLY") || "";
      if (priceId === soloYearly || priceId === proYearly || priceId === bizYearly) return "yearly";
      return "monthly";
    };

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const meta = session.metadata || {};
        const userId = meta.user_id;
        const shopId = meta.shop_id;
        const plan = meta.plan || "solo";
        const billingCycle = meta.billing_cycle || "monthly";

        if (!userId || !shopId) break;

        const stripeSubscriptionId = session.subscription as string;
        const stripeCustomerId = session.customer as string;

        // Upsert subscription record
        await supabase.from("subscriptions").upsert({
          user_id: userId,
          shop_id: shopId,
          plan,
          billing_cycle: billingCycle,
          status: "active",
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
          stripe_price_id: "",
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

        // Update shop plan
        await supabase.from("shops").update({ plan }).eq("id", shopId);

        // Log event
        await supabase.from("subscription_events").insert({
          shop_id: shopId,
          user_id: userId,
          event_type: "checkout.completed",
          plan_to: plan,
          stripe_event_id: event.id,
          metadata: { session_id: session.id },
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const meta = sub.metadata || {};
        const userId = meta.user_id;
        const shopId = meta.shop_id;

        if (!userId) break;

        const priceId = sub.items.data[0]?.price?.id || "";
        const plan = planFromPriceId(priceId);
        const billingCycle = cycleFromPriceId(priceId);

        await supabase.from("subscriptions").upsert({
          user_id: userId,
          shop_id: shopId,
          plan,
          billing_cycle: billingCycle,
          status: sub.status,
          stripe_customer_id: sub.customer as string,
          stripe_subscription_id: sub.id,
          stripe_price_id: priceId,
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

        if (shopId) {
          await supabase.from("shops").update({ plan }).eq("id", shopId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const meta = sub.metadata || {};
        const userId = meta.user_id;
        const shopId = meta.shop_id;

        if (!userId) break;

        await supabase.from("subscriptions").update({
          status: "canceled",
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        }).eq("user_id", userId);

        if (shopId) {
          await supabase.from("shops").update({ plan: "free" }).eq("id", shopId);
        }

        if (shopId) {
          await supabase.from("subscription_events").insert({
            shop_id: shopId,
            user_id: userId,
            event_type: "subscription.canceled",
            plan_from: meta.plan || "",
            plan_to: "free",
            stripe_event_id: event.id,
            metadata: {},
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await supabase.from("subscriptions")
          .update({ status: "past_due", updated_at: new Date().toISOString() })
          .eq("stripe_customer_id", customerId);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("stripe-webhook error:", err);
    return new Response(JSON.stringify({ error: err?.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
