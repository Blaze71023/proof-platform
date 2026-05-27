"use client";

import { CSSProperties, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CircleCheck as CheckCircle,
  CreditCard,
  ExternalLink,
  LoaderCircle,
  Shield,
  TriangleAlert,
} from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import {
  formatPlanName,
  getPlanLimits,
  getShopSubscription,
  isTrialExpired,
  openBillingPortal,
  type Plan,
  type ShopSubscription,
} from "@/lib/subscription";

const T = {
  page: "linear-gradient(180deg, #dfe6ee 0%, #d7e0e9 18%, #ced8e3 44%, #cad4df 74%, #d1dbe5 100%)",
  shell: "linear-gradient(180deg, rgba(225,233,241,0.96) 0%, rgba(216,226,237,0.985) 48%, rgba(209,220,231,0.995) 100%)",
  panel: "linear-gradient(180deg, rgba(250,252,255,0.985) 0%, rgba(243,247,252,0.995) 54%, rgba(238,243,249,1) 100%)",
  card: "linear-gradient(180deg, rgba(247,250,254,0.98) 0%, rgba(239,245,251,1) 100%)",
  statusBar: "linear-gradient(180deg, rgba(21,34,51,0.98) 0%, rgba(16,26,41,0.995) 100%)",
  text: "#132031",
  textSoft: "#223347",
  textMuted: "#61758a",
  textOnDark: "#f3f7fb",
  textOnDarkMuted: "rgba(219,229,239,0.70)",
  line: "rgba(28,47,67,0.11)",
  shellBorder: "1px solid rgba(69,94,118,0.20)",
  panelBorder: "1px solid rgba(84,108,131,0.17)",
  cardBorder: "1px solid rgba(92,116,140,0.14)",
  shellShadow: "0 30px 80px rgba(27,39,54,0.16)",
  panelShadow: "0 16px 34px rgba(28,42,59,0.09)",
  blue: "#2563eb",
  blueStrong: "#1d4ed8",
  blueSoft: "rgba(37,99,235,0.10)",
  emerald: "#059669",
  emeraldSoft: "rgba(5,150,105,0.10)",
  emeraldLine: "rgba(5,150,105,0.22)",
  amber: "#ca8a04",
  amberSoft: "rgba(202,138,4,0.12)",
  amberLine: "rgba(202,138,4,0.22)",
  red: "#dc2626",
  redSoft: "rgba(220,38,38,0.10)",
  redLine: "rgba(220,38,38,0.22)",
  buttonBlue: "linear-gradient(180deg, rgba(37,99,235,1) 0%, rgba(29,78,216,1) 100%)",
};

const PLAN_COLORS: Record<Plan, { bg: string; border: string; text: string }> = {
  trial: { bg: T.blueSoft, border: "rgba(37,99,235,0.22)", text: T.blue },
  free: { bg: "rgba(100,116,139,0.10)", border: "rgba(100,116,139,0.22)", text: T.textMuted },
  solo: { bg: T.emeraldSoft, border: T.emeraldLine, text: T.emerald },
  pro: { bg: T.blueSoft, border: "rgba(37,99,235,0.22)", text: T.blue },
  business: { bg: T.amberSoft, border: T.amberLine, text: T.amber },
};

export default function BillingPageWrapper() {
  return (
    <Suspense fallback={null}>
      <BillingPage />
    </Suspense>
  );
}

function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justSubscribed = searchParams.get("success") === "1";

  const [sub, setSub] = useState<ShopSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState("");
  const [shopName, setShopName] = useState("Your Shop");
  const [activeJobCount, setActiveJobCount] = useState(0);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseClient();
      if (!supabase) { setLoading(false); return; }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login?next=/account/billing"); return; }

      const [subscription, { data: shop }, { count }] = await Promise.all([
        getShopSubscription(),
        supabase.from("shops").select("name").eq("owner_id", user.id).maybeSingle(),
        supabase.from("jobs").select("id", { count: "exact", head: true })
          .not("status", "in", '("Completed","Declined")'),
      ]);

      setSub(subscription);
      if (shop?.name) setShopName(shop.name);
      setActiveJobCount(count || 0);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handlePortal() {
    setPortalError("");
    setPortalLoading(true);
    const result = await openBillingPortal(`${window.location.origin}/account/billing`);
    if ("error" in result) {
      setPortalError(result.error.includes("configured")
        ? "Stripe billing portal is not yet configured."
        : result.error);
      setPortalLoading(false);
    } else {
      window.location.href = result.url;
    }
  }

  if (loading) {
    return (
      <main style={{ ...pageStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: T.textMuted, fontSize: 14, fontWeight: 800 }}>
          <LoaderCircle size={18} style={{ animation: "spin 1s linear infinite" }} />
          Loading billing...
        </div>
        <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </main>
    );
  }

  const plan = sub?.plan || "trial";
  const limits = getPlanLimits(plan);
  const planColor = PLAN_COLORS[plan] || PLAN_COLORS.trial;
  const trialExpired = isTrialExpired(sub?.trialEndsAt || null);
  const isActive = sub?.status === "active" || sub?.status === "trialing";
  const isPastDue = sub?.status === "past_due";
  const isCanceled = sub?.status === "canceled" || sub?.status === "none";
  const jobUsagePct = limits.maxActiveJobs < 999 ? Math.min(100, Math.round((activeJobCount / limits.maxActiveJobs) * 100)) : 0;

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 900, margin: "0 auto", background: T.shell, border: T.shellBorder, borderRadius: 28, boxShadow: T.shellShadow, overflow: "hidden" }}>
        {/* Header */}
        <header style={{ background: T.statusBar, padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button type="button" onClick={() => router.push("/shopproof/dashboard")} style={darkBackBtn}>
              <ArrowLeft size={14} />
            </button>
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, color: T.textOnDarkMuted, textTransform: "uppercase", letterSpacing: "0.10em" }}>Account</div>
              <div style={{ fontSize: 20, fontWeight: 950, color: T.textOnDark, letterSpacing: "-0.03em" }}>Billing & Subscription</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: T.textOnDarkMuted, fontWeight: 700 }}>{shopName}</div>
        </header>

        {/* Success banner */}
        {justSubscribed && (
          <div style={{ padding: "14px 22px", background: T.emeraldSoft, borderBottom: `1px solid ${T.emeraldLine}`, display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 800, color: T.emerald }}>
            <CheckCircle size={16} />
            Subscription activated successfully. Welcome to ShopPROOF {formatPlanName(plan)}!
          </div>
        )}

        <div style={{ padding: 22, display: "grid", gap: 16 }}>
          {/* Current plan */}
          <section style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div style={{ fontSize: 16, fontWeight: 950, color: T.text }}>Current Plan</div>
              <span style={{ fontSize: 11, fontWeight: 900, padding: "4px 10px", borderRadius: 999, background: planColor.bg, border: `1px solid ${planColor.border}`, color: planColor.text }}>
                {formatPlanName(plan)}
              </span>
            </div>
            <div style={{ padding: 14 }}>
              {/* Status */}
              {isPastDue && (
                <div style={{ marginBottom: 14, borderRadius: 12, border: `1px solid ${T.redLine}`, background: T.redSoft, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 800, color: T.red }}>
                  <TriangleAlert size={15} /> Payment failed. Please update your payment method to restore access.
                </div>
              )}
              {trialExpired && plan === "trial" && (
                <div style={{ marginBottom: 14, borderRadius: 12, border: `1px solid ${T.amberLine}`, background: T.amberSoft, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 800, color: T.amber }}>
                  <TriangleAlert size={15} /> Your trial has expired. Upgrade to continue creating jobs.
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 16 }}>
                <InfoCard label="Plan" value={formatPlanName(plan)} />
                <InfoCard label="Status" value={
                  sub?.status === "trialing" ? "Free Trial" :
                  sub?.status === "active" ? "Active" :
                  sub?.status === "past_due" ? "Past Due" :
                  sub?.status === "canceled" ? "Canceled" : "No Subscription"
                } />
                <InfoCard label="Billing" value={sub?.billingCycle === "yearly" ? "Annual" : sub?.billingCycle === "monthly" ? "Monthly" : "—"} />
                {sub?.currentPeriodEnd && (
                  <InfoCard label={sub.cancelAtPeriodEnd ? "Ends" : "Renews"} value={new Date(sub.currentPeriodEnd).toLocaleDateString()} />
                )}
                {sub?.trialEndsAt && plan === "trial" && (
                  <InfoCard label="Trial Ends" value={new Date(sub.trialEndsAt).toLocaleDateString()} />
                )}
              </div>

              {sub?.cancelAtPeriodEnd && (
                <div style={{ marginBottom: 14, borderRadius: 12, border: `1px solid ${T.amberLine}`, background: T.amberSoft, padding: "12px 14px", fontSize: 13, fontWeight: 800, color: T.amber }}>
                  Your subscription will cancel at the end of the current billing period. You can reactivate it in the billing portal.
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {(isCanceled || plan === "trial" || plan === "free") ? (
                  <Link href="/pricing" style={primaryBtnStyle}>
                    <Shield size={15} /> Upgrade Plan
                  </Link>
                ) : (
                  <button type="button" onClick={handlePortal} disabled={portalLoading} style={primaryBtnStyle}>
                    {portalLoading ? <LoaderCircle size={15} style={{ animation: "spin 1s linear infinite" }} /> : <CreditCard size={15} />}
                    Manage Billing
                    <ExternalLink size={13} style={{ marginLeft: "auto", opacity: 0.6 }} />
                  </button>
                )}
                {isActive && !isCanceled && (
                  <Link href="/pricing" style={outlineBtnStyle}>
                    View Plans
                  </Link>
                )}
              </div>
              {portalError && (
                <div style={{ marginTop: 10, fontSize: 12, color: T.red, fontWeight: 700 }}>{portalError}</div>
              )}
            </div>
          </section>

          {/* Usage */}
          <section style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div style={{ fontSize: 16, fontWeight: 950, color: T.text }}>Usage</div>
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ display: "grid", gap: 14 }}>
                <UsageRow
                  label="Active Jobs"
                  used={activeJobCount}
                  max={limits.maxActiveJobs < 999 ? limits.maxActiveJobs : null}
                  pct={jobUsagePct}
                />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                  <FeatureChip label="Users" value={`Up to ${limits.maxUsers}`} />
                  <FeatureChip label="Branded Links" value={limits.brandedLinks ? "Included" : "Not available"} active={limits.brandedLinks} />
                  <FeatureChip label="Team Features" value={limits.teamFeatures ? "Included" : "Not available"} active={limits.teamFeatures} />
                  <FeatureChip label="Audit Records" value={limits.auditRecords ? "Included" : "Not available"} active={limits.auditRecords} />
                </div>
              </div>
            </div>
          </section>

          {/* Plan comparison quick reference */}
          <section style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div style={{ fontSize: 16, fontWeight: 950, color: T.text }}>Plan Comparison</div>
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ display: "grid", gap: 10 }}>
                {[
                  { plan: "solo" as Plan, price: "$15/mo or $150/yr", jobs: "5 jobs", users: "1 user" },
                  { plan: "pro" as Plan, price: "$39/mo or $390/yr", jobs: "25 jobs", users: "3 users" },
                  { plan: "business" as Plan, price: "$79/mo or $790/yr", jobs: "50+ jobs", users: "10 users" },
                ].map((p) => {
                  const isCurrent = p.plan === plan;
                  const c = PLAN_COLORS[p.plan];
                  return (
                    <div key={p.plan} style={{ borderRadius: 14, border: isCurrent ? `1px solid ${c.border}` : T.cardBorder, background: isCurrent ? c.bg : T.card, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontWeight: 900, fontSize: 14, color: isCurrent ? c.text : T.text }}>{formatPlanName(p.plan)}</span>
                        {isCurrent && <span style={{ fontSize: 11, fontWeight: 900, padding: "2px 8px", borderRadius: 999, background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>Current</span>}
                      </div>
                      <div style={{ display: "flex", gap: 16, fontSize: 12, color: T.textMuted, fontWeight: 700 }}>
                        <span>{p.jobs}</span>
                        <span>{p.users}</span>
                        <span>{p.price}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 12 }}>
                <Link href="/pricing" style={{ ...outlineBtnStyle, display: "inline-flex" }}>View full pricing</Link>
              </div>
            </div>
          </section>
        </div>
      </div>
      <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ borderRadius: 12, border: T.cardBorder, background: T.card, padding: "10px 12px" }}>
      <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: T.textMuted, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 800, color: T.textSoft }}>{value}</div>
    </div>
  );
}

function UsageRow({ label, used, max, pct }: { label: string; used: number; max: number | null; pct: number }) {
  const isHigh = pct > 80;
  const barColor = isHigh ? T.amber : T.blue;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, fontWeight: 800, color: T.textSoft }}>
        <span>{label}</span>
        <span style={{ color: isHigh ? T.amber : T.textMuted }}>{used}{max !== null ? ` / ${max}` : ""}</span>
      </div>
      {max !== null && (
        <div style={{ height: 6, borderRadius: 999, background: "rgba(84,108,131,0.14)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 999, transition: "width 0.4s" }} />
        </div>
      )}
    </div>
  );
}

function FeatureChip({ label, value, active }: { label: string; value: string; active?: boolean }) {
  return (
    <div style={{ borderRadius: 12, border: T.cardBorder, background: T.card, padding: "10px 12px" }}>
      <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: T.textMuted, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 800, color: active ? T.emerald : T.textMuted }}>{value}</div>
    </div>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: T.page,
  padding: 18,
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  color: T.text,
};

const panelStyle: CSSProperties = {
  borderRadius: 20,
  border: T.panelBorder,
  background: T.panel,
  boxShadow: T.panelShadow,
  overflow: "hidden",
};

const panelHeaderStyle: CSSProperties = {
  padding: "14px 16px 12px",
  borderBottom: `1px solid ${T.line}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const darkBackBtn: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 9,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.06)",
  color: T.textOnDark,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const primaryBtnStyle: CSSProperties = {
  height: 42,
  padding: "0 16px",
  borderRadius: 11,
  border: "1px solid rgba(29,78,216,0.36)",
  background: T.buttonBlue,
  color: "#fff",
  fontSize: 13,
  fontWeight: 900,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  textDecoration: "none",
  boxShadow: "0 6px 20px rgba(37,99,235,0.18)",
};

const outlineBtnStyle: CSSProperties = {
  height: 42,
  padding: "0 16px",
  borderRadius: 11,
  border: T.cardBorder,
  background: "rgba(255,255,255,0.78)",
  color: T.textSoft,
  fontSize: 13,
  fontWeight: 900,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  textDecoration: "none",
};
