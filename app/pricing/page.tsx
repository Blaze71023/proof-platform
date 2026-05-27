"use client";

import { CSSProperties, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CircleCheck as CheckCircle,
  LoaderCircle,
  Shield,
  Zap,
} from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import { startCheckout, PLAN_PRICES } from "@/lib/subscription";

const T = {
  page: "linear-gradient(180deg, #0a1628 0%, #0d1d33 42%, #091422 100%)",
  card: "linear-gradient(180deg, rgba(17,30,50,0.98) 0%, rgba(12,22,40,0.99) 100%)",
  cardHover: "linear-gradient(180deg, rgba(22,38,62,0.99) 0%, rgba(16,28,48,1) 100%)",
  featured: "linear-gradient(180deg, rgba(37,99,235,0.22) 0%, rgba(29,78,216,0.14) 100%)",
  text: "#f0f7ff",
  textSoft: "rgba(220,235,252,0.85)",
  textMuted: "rgba(165,195,230,0.65)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderFeatured: "1px solid rgba(59,130,246,0.45)",
  blue: "#3b82f6",
  blueStrong: "#2563eb",
  emerald: "#34d399",
  amber: "#fbbf24",
  buttonBlue: "linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)",
  buttonDark: "linear-gradient(180deg, rgba(28,44,68,0.98) 0%, rgba(18,30,50,0.99) 100%)",
};

const PLANS = [
  {
    key: "solo" as const,
    name: "Solo",
    tagline: "One tech. Complete protection.",
    icon: <Shield size={22} />,
    color: T.emerald,
    featured: false,
    features: [
      "5 active jobs",
      "Single-user shop",
      "Full evidence documentation",
      "Digital customer approvals",
      "Release signatures",
      "Printable work orders",
      "Supabase-backed storage",
    ],
  },
  {
    key: "pro" as const,
    name: "Pro",
    tagline: "Small team. Enterprise-grade proof.",
    icon: <Zap size={22} />,
    color: T.blue,
    featured: true,
    features: [
      "25 active jobs",
      "Up to 3 users",
      "Everything in Solo",
      "Branded shareable links",
      "Team assignment board",
      "Priority approval queue",
      "Advanced technician attribution",
    ],
  },
  {
    key: "business" as const,
    name: "Business",
    tagline: "High-volume. Audit-ready.",
    icon: <Shield size={22} />,
    color: T.amber,
    featured: false,
    features: [
      "50+ active jobs",
      "Up to 10 users",
      "Everything in Pro",
      "Audit-ready records",
      "Chain-of-custody documentation",
      "Full team features",
      "Business reporting",
    ],
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [shopId, setShopId] = useState<string | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    async function check() {
      const supabase = getSupabaseClient();
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setIsAuthed(true);
      const { data: shop } = await supabase
        .from("shops")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();
      if (shop?.id) setShopId(shop.id);
    }
    check();
  }, []);

  async function handleSelect(plan: "solo" | "pro" | "business") {
    if (!isAuthed) {
      router.push("/login?next=/pricing");
      return;
    }
    if (!shopId) {
      router.push("/shopproof/new");
      return;
    }

    setError("");
    setLoading(plan);

    const origin = window.location.origin;
    const result = await startCheckout({
      plan,
      billingCycle: cycle,
      shopId,
      successUrl: `${origin}/account/billing?success=1`,
      cancelUrl: `${origin}/pricing`,
    });

    if ("error" in result) {
      // If Stripe isn't configured yet, show a friendly message
      setError(result.error.includes("configured")
        ? "Stripe billing is not yet configured. Add your Stripe keys to enable subscriptions."
        : result.error);
      setLoading(null);
    } else {
      window.location.href = result.url;
    }
  }

  const yearSavings = (plan: "solo" | "pro" | "business") => {
    const monthly = PLAN_PRICES[plan].monthly * 12;
    const yearly = PLAN_PRICES[plan].yearly;
    return Math.round(((monthly - yearly) / monthly) * 100);
  };

  return (
    <main style={{ minHeight: "100vh", background: T.page, color: T.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      {/* Nav */}
      <nav style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: T.text }}>
          <Shield size={20} color={T.blue} />
          <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: "-0.02em" }}>ShopPROOF</span>
        </Link>
        <div style={{ display: "flex", gap: 12 }}>
          {isAuthed ? (
            <Link href="/shopproof/dashboard" style={navLinkStyle}>Dashboard</Link>
          ) : (
            <>
              <Link href="/login" style={navLinkStyle}>Log In</Link>
              <Link href="/login?mode=signup" style={{ ...navLinkStyle, background: T.buttonBlue, border: "1px solid rgba(59,130,246,0.4)", color: "#fff" }}>
                Start Free Trial
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "72px 24px 48px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, border: "1px solid rgba(59,130,246,0.28)", background: "rgba(59,130,246,0.10)", fontSize: 12, fontWeight: 800, color: T.blue, marginBottom: 22, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          <Shield size={13} /> Evidence-grade liability protection
        </div>
        <h1 style={{ margin: "0 0 16px", fontSize: "clamp(34px,5vw,56px)", fontWeight: 950, letterSpacing: "-0.04em", lineHeight: 1.05 }}>
          Simple, honest pricing
        </h1>
        <p style={{ margin: "0 auto 36px", maxWidth: 520, fontSize: 17, color: T.textMuted, lineHeight: 1.65 }}>
          Every plan includes the full ShopPROOF evidence chain. No feature gating on documentation, approvals, or signatures.
        </p>

        {/* Billing toggle */}
        <div style={{ display: "inline-flex", borderRadius: 14, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)", padding: 4, gap: 4 }}>
          <button type="button" onClick={() => setCycle("monthly")} style={toggleBtn(cycle === "monthly")}>Monthly</button>
          <button type="button" onClick={() => setCycle("yearly")} style={toggleBtn(cycle === "yearly")}>
            Yearly <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 800, padding: "2px 7px", borderRadius: 999, background: "rgba(52,211,153,0.16)", color: T.emerald, border: "1px solid rgba(52,211,153,0.22)" }}>Save 17%</span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 24px 80px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        {PLANS.map((plan) => {
          const price = PLAN_PRICES[plan.key][cycle];
          const savings = yearSavings(plan.key);
          const isLoading = loading === plan.key;

          return (
            <div
              key={plan.key}
              style={{
                borderRadius: 24,
                border: plan.featured ? T.borderFeatured : T.border,
                background: plan.featured ? T.featured : T.card,
                padding: "28px 24px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 0,
                position: "relative",
                boxShadow: plan.featured ? "0 0 60px rgba(59,130,246,0.14)" : "none",
              }}
            >
              {plan.featured && (
                <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: T.buttonBlue, color: "#fff", fontSize: 11, fontWeight: 900, padding: "5px 14px", borderRadius: 999, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(59,130,246,0.28)" }}>
                  Most Popular
                </div>
              )}

              {/* Plan header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: `${plan.color}18`, border: `1px solid ${plan.color}30`, display: "flex", alignItems: "center", justifyContent: "center", color: plan.color }}>
                  {plan.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.02em" }}>{plan.name}</div>
                  <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{plan.tagline}</div>
                </div>
              </div>

              {/* Price */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 13, color: T.textMuted, fontWeight: 700, marginTop: 4 }}>$</span>
                  <span style={{ fontSize: 48, fontWeight: 950, letterSpacing: "-0.04em", lineHeight: 1, color: T.text }}>{price}</span>
                  <span style={{ fontSize: 13, color: T.textMuted, fontWeight: 700 }}>/{cycle === "yearly" ? "yr" : "mo"}</span>
                </div>
                {cycle === "yearly" && (
                  <div style={{ marginTop: 6, fontSize: 12, color: T.emerald, fontWeight: 800 }}>
                    Save {savings}% vs monthly
                  </div>
                )}
              </div>

              {/* Features */}
              <ul style={{ margin: "0 0 24px", padding: 0, listStyle: "none", display: "grid", gap: 10, flex: 1 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: T.textSoft, lineHeight: 1.4 }}>
                    <CheckCircle size={15} color={plan.color} style={{ flexShrink: 0, marginTop: 1 }} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                type="button"
                onClick={() => handleSelect(plan.key)}
                disabled={!!loading}
                style={{
                  width: "100%",
                  height: 48,
                  borderRadius: 13,
                  border: plan.featured ? "1px solid rgba(59,130,246,0.44)" : "1px solid rgba(255,255,255,0.12)",
                  background: plan.featured ? T.buttonBlue : T.buttonDark,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: loading && !isLoading ? 0.5 : 1,
                  boxShadow: plan.featured ? "0 8px 28px rgba(59,130,246,0.28)" : "none",
                  transition: "opacity 0.15s",
                }}
              >
                {isLoading ? <LoaderCircle size={16} style={{ animation: "spin 1s linear infinite" }} /> : null}
                {isAuthed ? `Start ${plan.name}` : "Start Free Trial"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div style={{ maxWidth: 600, margin: "-48px auto 48px", padding: "0 24px" }}>
          <div style={{ borderRadius: 14, border: "1px solid rgba(220,38,38,0.28)", background: "rgba(220,38,38,0.10)", padding: "14px 16px", fontSize: 13, color: "#fca5a5", fontWeight: 700 }}>
            {error}
          </div>
        </div>
      )}

      {/* Free trial note */}
      <div style={{ textAlign: "center", padding: "0 24px 80px", color: T.textMuted, fontSize: 13, lineHeight: 1.6 }}>
        All plans start with a <strong style={{ color: T.textSoft }}>14-day free trial</strong>. No credit card required to start.
        <br />
        Cancel anytime from your billing portal.
      </div>

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}

function toggleBtn(active: boolean): CSSProperties {
  return {
    height: 38,
    padding: "0 18px",
    borderRadius: 10,
    border: "none",
    background: active ? "rgba(59,130,246,0.18)" : "transparent",
    color: active ? T.text : T.textMuted,
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    transition: "background 0.15s, color 0.15s",
  };
}

const navLinkStyle: CSSProperties = {
  height: 38,
  padding: "0 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.04)",
  color: T.textSoft,
  fontSize: 13,
  fontWeight: 800,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
};
