import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PRICE_IDS: Record<string, Record<string, string>> = {
  solo: {
    monthly: Deno.env.get("STRIPE_PRICE_SOLO_MONTHLY") || "",
    yearly: Deno.env.get("STRIPE_PRICE_SOLO_YEARLY") || "",
  },
  pro: {
    monthly: Deno.env.get("STRIPE_PRICE_PRO_MONTHLY") || "",
    yearly: Deno.env.get("STRIPE_PRICE_PRO_YEARLY") || "",
  },
  business: {
    monthly: Deno.env.get("STRIPE_PRICE_BUSINESS_MONTHLY") || "",
    yearly: Deno.env.get("STRIPE_PRICE_BUSINESS_YEARLY") || "",
  },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/stripe-checkout/, "");

    // POST /create — create a Stripe Checkout session
    if (req.method === "POST" && (path === "" || path === "/" || path === "/create")) {
      const body = await req.json();
      const { plan, billing_cycle, success_url, cancel_url, shop_id } = body;

      if (!plan || !billing_cycle || !success_url || !cancel_url || !shop_id) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const priceId = PRICE_IDS[plan]?.[billing_cycle];
      if (!priceId) {
        return new Response(
          JSON.stringify({ error: `No price configured for ${plan}/${billing_cycle}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check for existing Stripe customer
      let stripeCustomerId: string | undefined;
      const { data: existingSub } = await supabase
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingSub?.stripe_customer_id) {
        stripeCustomerId = existingSub.stripe_customer_id;
      } else {
        // Create Stripe customer
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { user_id: user.id, shop_id },
        });
        stripeCustomerId = customer.id;
      }

      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url,
        subscription_data: {
          metadata: { user_id: user.id, shop_id, plan, billing_cycle },
        },
        metadata: { user_id: user.id, shop_id, plan, billing_cycle },
      });

      return new Response(
        JSON.stringify({ url: session.url, session_id: session.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST /portal — create a Stripe customer portal session
    if (req.method === "POST" && path === "/portal") {
      const body = await req.json();
      const { return_url } = body;

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!sub?.stripe_customer_id) {
        return new Response(
          JSON.stringify({ error: "No billing account found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: sub.stripe_customer_id,
        return_url: return_url || `${req.headers.get("origin")}/account/billing`,
      });

      return new Response(
        JSON.stringify({ url: portalSession.url }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /status — get current subscription status
    if (req.method === "GET" && path === "/status") {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      const { data: shop } = await supabase
        .from("shops")
        .select("plan, trial_ends_at")
        .eq("owner_id", user.id)
        .maybeSingle();

      return new Response(
        JSON.stringify({ subscription: sub, shop }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("stripe-checkout error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
