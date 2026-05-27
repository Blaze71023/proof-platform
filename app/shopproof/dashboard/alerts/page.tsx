"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TriangleAlert as AlertTriangle, ArrowLeft, ChevronRight, LoaderCircle, Plus, ShieldAlert } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";

const THEME = {
  pageBase:
    "linear-gradient(180deg, #02060B 0%, #030912 16%, #03101B 42%, #020912 72%, #02060B 100%)",
  shell:
    "linear-gradient(180deg, rgba(7,15,25,0.98) 0%, rgba(5,12,20,0.995) 42%, rgba(3,9,15,1) 100%)",
  shellInner:
    "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.012) 16%, rgba(255,255,255,0) 36%)",
  panel:
    "linear-gradient(180deg, rgba(13,24,37,0.98) 0%, rgba(8,16,27,0.99) 48%, rgba(7,13,22,1) 100%)",
  card:
    "linear-gradient(180deg, rgba(19,34,51,0.98) 0%, rgba(14,27,42,0.98) 44%, rgba(10,20,33,1) 100%)",
  text: "#F5FAFF",
  textSoft: "#D7E5F0",
  textMuted: "#9CB1C1",
  border: "1px solid rgba(109, 142, 176, 0.24)",
  borderSoft: "1px solid rgba(255,255,255,0.085)",
  shellShadow: "0 34px 90px rgba(0,0,0,0.5)",
  panelShadow: "0 18px 42px rgba(0,0,0,0.24)",
  cardShadow: "0 10px 22px rgba(0,0,0,0.16)",
  red: "#F87171",
  amber: "#FBBF24",
  blue: "#3B82F6",
  buttonBlue:
    "linear-gradient(180deg, rgba(36,126,255,1) 0%, rgba(21,101,219,1) 100%)",
};

type AlertJob = {
  id: string;
  status: string;
  concern: string | null;
  findings: string | null;
  approval_token: string | null;
  approval_state: string | null;
  created_at: string | null;
  updated_at: string | null;
  customer: { name: string } | null;
  vehicle: { year: string; make: string; model: string } | null;
};

type Alert = {
  type: "critical" | "warning";
  jobId: string;
  title: string;
  detail: string;
  action: string;
  actionPath: string;
  vehicleLine: string;
  customerName: string;
};

function buildAlerts(jobs: AlertJob[]): Alert[] {
  const alerts: Alert[] = [];
  const now = Date.now();

  for (const j of jobs) {
    const v = (j.vehicle as any) || {};
    const c = (j.customer as any) || {};
    const vehicleLine = [v.year, v.make, v.model].filter(Boolean).join(" ") || "Unknown Vehicle";
    const customerName = c.name || "Unknown Customer";
    const createdMs = j.created_at ? new Date(j.created_at).getTime() : 0;
    const updatedMs = j.updated_at ? new Date(j.updated_at).getTime() : 0;
    const daysSinceCreated = (now - createdMs) / (1000 * 60 * 60 * 24);
    const daysSinceUpdated = (now - updatedMs) / (1000 * 60 * 60 * 24);

    // New intake older than 1 day with no documentation
    if (j.status === "New Intake" && daysSinceCreated > 1 && !j.findings) {
      alerts.push({
        type: "warning",
        jobId: j.id,
        title: "Intake stale — no documentation",
        detail: `Job created ${Math.floor(daysSinceCreated)}d ago with no findings captured yet.`,
        action: "Open Work Record",
        actionPath: `/shopproof/jobs/${j.id}/work`,
        vehicleLine,
        customerName,
      });
    }

    // Waiting on approval for more than 2 days
    if (j.status === "Waiting on Approval" && daysSinceUpdated > 2) {
      alerts.push({
        type: "warning",
        jobId: j.id,
        title: "Approval overdue",
        detail: `Waiting on customer approval for ${Math.floor(daysSinceUpdated)} days.`,
        action: "View Job",
        actionPath: `/shopproof/jobs/${j.id}`,
        vehicleLine,
        customerName,
      });
    }

    // Approved but no work performed documented
    if (j.status === "Approved" && !j.findings) {
      alerts.push({
        type: "critical",
        jobId: j.id,
        title: "Approved — no technician documentation",
        detail: "Customer has approved work but no findings or work record has been captured.",
        action: "Document Work",
        actionPath: `/shopproof/jobs/${j.id}/work`,
        vehicleLine,
        customerName,
      });
    }

    // In progress for more than 5 days without update
    if (j.status === "In Progress" && daysSinceUpdated > 5) {
      alerts.push({
        type: "warning",
        jobId: j.id,
        title: "Repair stalled — no recent update",
        detail: `In progress for ${Math.floor(daysSinceUpdated)} days without status change.`,
        action: "View Job",
        actionPath: `/shopproof/jobs/${j.id}`,
        vehicleLine,
        customerName,
      });
    }

    // Ready for pickup older than 2 days
    if (j.status === "Ready for Pickup" && daysSinceUpdated > 2) {
      alerts.push({
        type: "warning",
        jobId: j.id,
        title: "Vehicle unclaimed — ready for pickup",
        detail: `Marked ready for pickup ${Math.floor(daysSinceUpdated)}d ago with no release signature.`,
        action: "Final Release",
        actionPath: `/shopproof/jobs/${j.id}/final`,
        vehicleLine,
        customerName,
      });
    }
  }

  // Sort critical first
  alerts.sort((a, b) => {
    if (a.type === "critical" && b.type !== "critical") return -1;
    if (b.type === "critical" && a.type !== "critical") return 1;
    return 0;
  });

  return alerts;
}

export default function ShopProofAlertsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<AlertJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseClient();
      if (!supabase) { setLoading(false); return; }

      try {
        const { data } = await supabase
          .from("jobs")
          .select(`
            id, status, concern, findings,
            approval_token, approval_state,
            created_at, updated_at,
            customer:customers!jobs_customer_id_fkey(name),
            vehicle:vehicles!jobs_vehicle_id_fkey(year, make, model)
          `)
          .not("status", "in", '("Completed","Declined")')
          .order("updated_at", { ascending: true });

        setJobs((data as unknown as AlertJob[]) || []);
      } catch {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const alerts = buildAlerts(jobs);
  const critical = alerts.filter((a) => a.type === "critical");
  const warnings = alerts.filter((a) => a.type === "warning");

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(255,109,124,0.10) 0%, rgba(255,109,124,0.04) 18%, rgba(255,109,124,0) 40%),
          repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 46px),
          repeating-linear-gradient(90deg, rgba(255,255,255,0.006) 0px, rgba(255,255,255,0.006) 1px, transparent 1px, transparent 74px),
          ${THEME.pageBase}
        `,
        color: THEME.text,
        padding: "22px",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1410, margin: "0 auto", borderRadius: 24, overflow: "hidden", background: THEME.shell, border: THEME.border, boxShadow: THEME.shellShadow, position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: THEME.shellInner }} />

        {/* Top bar */}
        <div style={{ padding: "16px 18px", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "relative", zIndex: 1 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", border: THEME.borderSoft, background: "linear-gradient(180deg, rgba(17,32,48,0.98) 0%, rgba(10,19,29,0.98) 100%)" }}>
            <AlertTriangle size={22} strokeWidth={2.1} color={THEME.red} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 4 }}>Alerts & Issues</div>
            <div style={{ fontSize: 13, color: THEME.textMuted, lineHeight: 1.5 }}>
              Evidence gaps, stalled jobs, and documentation issues that need attention.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/shopproof/dashboard" style={ghostButton}><ArrowLeft size={14} /> Dashboard</Link>
            <Link href="/shopproof/new" style={primaryButton}><Plus size={14} /> New Job</Link>
          </div>
        </div>

        <div style={{ padding: 18, display: "grid", gap: 14, position: "relative", zIndex: 1 }}>
          {/* Counts */}
          <div style={{ display: "flex", gap: 10 }}>
            <StatChip label="Critical" count={critical.length} color={THEME.red} />
            <StatChip label="Warnings" count={warnings.length} color={THEME.amber} />
          </div>

          {loading ? (
            <LoadingState />
          ) : alerts.length === 0 ? (
            <CleanState />
          ) : (
            <>
              {critical.length > 0 && (
                <AlertSection title="Critical — Immediate Attention" alerts={critical} accent={THEME.red} onNavigate={(path) => router.push(path)} />
              )}
              {warnings.length > 0 && (
                <AlertSection title="Warnings" alerts={warnings} accent={THEME.amber} onNavigate={(path) => router.push(path)} />
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function AlertSection({ title, alerts, accent, onNavigate }: { title: string; alerts: Alert[]; accent: string; onNavigate: (path: string) => void }) {
  return (
    <section style={{ borderRadius: 18, overflow: "hidden", background: THEME.panel, border: THEME.border, boxShadow: THEME.panelShadow }}>
      <div style={{ height: 48, padding: "0 14px", display: "flex", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.055)", fontSize: 14, fontWeight: 900, gap: 10 }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: accent, flexShrink: 0 }} />
        {title}
      </div>
      <div style={{ padding: 12, display: "grid", gap: 10 }}>
        {alerts.map((a, i) => (
          <div
            key={`${a.jobId}-${i}`}
            style={{
              borderRadius: 14,
              border: `1px solid ${accent}28`,
              background: `${accent}08`,
              padding: "12px 14px",
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              gap: 14, alignItems: "center",
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 9, border: `1px solid ${accent}30`, background: `${accent}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={16} color={accent} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 900, fontSize: 14, color: THEME.text, marginBottom: 3 }}>{a.title}</div>
              <div style={{ fontSize: 12, color: THEME.textMuted, marginBottom: 4 }}>{a.detail}</div>
              <div style={{ fontSize: 11, color: THEME.textMuted }}>
                {a.customerName} — {a.vehicleLine}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate(a.actionPath)}
              style={{
                height: 34, padding: "0 12px", borderRadius: 9,
                border: `1px solid ${accent}30`, background: `${accent}10`,
                color: accent, fontSize: 12, fontWeight: 800,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                flexShrink: 0,
              }}
            >
              {a.action} <ChevronRight size={12} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatChip({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div style={{ height: 44, padding: "0 14px", borderRadius: 12, border: THEME.borderSoft, background: THEME.card, display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 900, color: THEME.textSoft, whiteSpace: "nowrap" }}>
      <span style={{ fontSize: 18, fontWeight: 900, color }}>{count}</span>
      {label}
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48, gap: 12, color: THEME.textMuted, fontSize: 14 }}>
      <LoaderCircle size={18} style={{ animation: "spin 1s linear infinite" }} />
      Checking for alerts...
      <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function CleanState() {
  return (
    <div style={{ borderRadius: 18, border: THEME.borderSoft, background: THEME.card, minHeight: 280, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 28 }}>
      <div style={{ maxWidth: 380, display: "grid", justifyItems: "center", gap: 12 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, border: THEME.borderSoft, background: "linear-gradient(180deg, rgba(20,33,47,0.98) 0%, rgba(11,20,30,0.98) 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ShieldAlert size={26} color={THEME.red} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.03em" }}>No alerts</div>
        <div style={{ fontSize: 13, color: THEME.textMuted, lineHeight: 1.6 }}>All active jobs are within normal parameters. No documentation gaps detected.</div>
      </div>
    </div>
  );
}

const primaryButton: React.CSSProperties = {
  height: 42, padding: "0 16px", borderRadius: 10,
  background: THEME.buttonBlue, border: "1px solid rgba(59,130,246,0.34)",
  color: "#F7FBFF", fontSize: 13, fontWeight: 900,
  display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
};

const ghostButton: React.CSSProperties = {
  height: 42, padding: "0 14px", borderRadius: 10,
  border: THEME.borderSoft,
  background: "linear-gradient(180deg, rgba(18,29,41,0.98) 0%, rgba(10,18,28,0.98) 100%)",
  color: THEME.textSoft, fontSize: 13, fontWeight: 800,
  display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
};
