import { getSupabaseClient } from "@/lib/supabase";

export type Plan = "trial" | "free" | "solo" | "pro" | "business";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "none";

export type ShopSubscription = {
  plan: Plan;
  status: SubscriptionStatus;
  billingCycle: "monthly" | "yearly";
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialEndsAt: string | null;
};

export type PlanLimits = {
  maxActiveJobs: number;
  maxUsers: number;
  brandedLinks: boolean;
  auditRecords: boolean;
  teamFeatures: boolean;
};

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  trial: { maxActiveJobs: 5, maxUsers: 1, brandedLinks: false, auditRecords: false, teamFeatures: false },
  free: { maxActiveJobs: 2, maxUsers: 1, brandedLinks: false, auditRecords: false, teamFeatures: false },
  solo: { maxActiveJobs: 5, maxUsers: 1, brandedLinks: false, auditRecords: false, teamFeatures: false },
  pro: { maxActiveJobs: 25, maxUsers: 3, brandedLinks: true, auditRecords: false, teamFeatures: true },
  business: { maxActiveJobs: 999, maxUsers: 10, brandedLinks: true, auditRecords: true, teamFeatures: true },
};

export const PLAN_PRICES = {
  solo: { monthly: 15, yearly: 150 },
  pro: { monthly: 39, yearly: 390 },
  business: { monthly: 79, yearly: 790 },
};

export async function getShopSubscription(): Promise<ShopSubscription | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const [{ data: sub }, { data: shop }] = await Promise.all([
      supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("shops").select("plan, trial_ends_at").eq("owner_id", user.id).maybeSingle(),
    ]);

    const plan: Plan = (shop?.plan as Plan) || "trial";
    const status: SubscriptionStatus = sub?.status || (plan === "trial" ? "trialing" : "none");

    return {
      plan,
      status,
      billingCycle: sub?.billing_cycle || "monthly",
      stripeCustomerId: sub?.stripe_customer_id || "",
      stripeSubscriptionId: sub?.stripe_subscription_id || "",
      currentPeriodEnd: sub?.current_period_end || null,
      cancelAtPeriodEnd: sub?.cancel_at_period_end || false,
      trialEndsAt: shop?.trial_ends_at || null,
    };
  } catch {
    return null;
  }
}

export function isTrialExpired(trialEndsAt: string | null): boolean {
  if (!trialEndsAt) return false;
  return new Date(trialEndsAt) < new Date();
}

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

export function canCreateJob(plan: Plan, activeJobCount: number): boolean {
  const limits = getPlanLimits(plan);
  return activeJobCount < limits.maxActiveJobs;
}

export function formatPlanName(plan: Plan): string {
  const names: Record<Plan, string> = {
    trial: "Free Trial",
    free: "Free",
    solo: "Solo",
    pro: "Pro",
    business: "Business",
  };
  return names[plan] || plan;
}

export async function startCheckout(params: {
  plan: "solo" | "pro" | "business";
  billingCycle: "monthly" | "yearly";
  shopId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string } | { error: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: "Not configured" };

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { error: "Not authenticated" };

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const resp = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        plan: params.plan,
        billing_cycle: params.billingCycle,
        shop_id: params.shopId,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
      }),
    });

    const data = await resp.json();
    if (!resp.ok || data.error) return { error: data.error || "Checkout failed" };
    return { url: data.url };
  } catch (e: any) {
    return { error: e?.message || "Checkout failed" };
  }
}

export async function openBillingPortal(returnUrl: string): Promise<{ url: string } | { error: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: "Not configured" };

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { error: "Not authenticated" };

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const resp = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout/portal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ return_url: returnUrl }),
    });

    const data = await resp.json();
    if (!resp.ok || data.error) return { error: data.error || "Portal failed" };
    return { url: data.url };
  } catch (e: any) {
    return { error: e?.message || "Portal failed" };
  }
}
