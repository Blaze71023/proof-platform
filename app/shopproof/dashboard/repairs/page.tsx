"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  LoaderCircle,
  Plus,
  Search,
  Wrench,
} from "lucide-react";
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
  blue: "#3B82F6",
  emerald: "#34D399",
  amber: "#FBBF24",
  buttonBlue:
    "linear-gradient(180deg, rgba(36,126,255,1) 0%, rgba(21,101,219,1) 100%)",
};

type RepairJob = {
  id: string;
  status: string;
  concern: string | null;
  findings: string | null;
  work_performed: string | null;
  assigned_to: string | null;
  written_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  customer: { name: string; phone: string } | null;
  vehicle: { year: string; make: string; model: string; vin: string } | null;
};

export default function ShopProofRepairsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<RepairJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseClient();
      if (!supabase) { setLoading(false); return; }

      try {
        const { data } = await supabase
          .from("jobs")
          .select(`
            id, status, concern, findings, work_performed,
            assigned_to, written_by, created_at, updated_at,
            customer:customers!jobs_customer_id_fkey(name, phone),
            vehicle:vehicles!jobs_vehicle_id_fkey(year, make, model, vin)
          `)
          .in("status", ["In Progress", "Approved", "Waiting on Parts"])
          .order("updated_at", { ascending: false });

        setJobs((data as unknown as RepairJob[]) || []);
      } catch {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = jobs.filter((j) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const c = (j.customer as any) || {};
    const v = (j.vehicle as any) || {};
    const vehicleLine = [v.year, v.make, v.model].join(" ").toLowerCase();
    return vehicleLine.includes(q)
      || (c.name || "").toLowerCase().includes(q)
      || (j.assigned_to || "").toLowerCase().includes(q)
      || j.status.toLowerCase().includes(q);
  });

  const inProgress = filtered.filter((j) => j.status === "In Progress");
  const approved = filtered.filter((j) => j.status === "Approved");
  const waitingParts = filtered.filter((j) => j.status === "Waiting on Parts");

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(59,130,246,0.14) 0%, rgba(59,130,246,0.05) 18%, rgba(59,130,246,0) 40%),
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
            <Wrench size={22} strokeWidth={2.1} color={THEME.blue} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 4 }}>Active Repairs</div>
            <div style={{ fontSize: 13, color: THEME.textMuted, lineHeight: 1.5 }}>Jobs approved and in service — repair documentation and technician attribution.</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/shopproof/dashboard" style={ghostButton}><ArrowLeft size={14} /> Dashboard</Link>
            <Link href="/shopproof/new" style={primaryButton}><Plus size={14} /> New Job</Link>
          </div>
        </div>

        <div style={{ padding: 18, display: "grid", gap: 14, position: "relative", zIndex: 1 }}>
          {/* Search + counts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 10 }}>
            <div style={{ height: 44, borderRadius: 12, border: THEME.borderSoft, background: THEME.card, display: "flex", alignItems: "center", padding: "0 14px", gap: 10 }}>
              <Search size={15} color={THEME.textMuted} />
              <input
                type="text"
                placeholder="Search jobs, technician, or vehicle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", color: THEME.text, fontSize: 13, width: "100%" }}
              />
            </div>
            <StatChip label="In Progress" count={inProgress.length} color={THEME.blue} />
            <StatChip label="Approved" count={approved.length} color={THEME.emerald} />
            <StatChip label="Waiting Parts" count={waitingParts.length} color={THEME.amber} />
          </div>

          {loading ? (
            <LoadingState />
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {inProgress.length > 0 && <RepairSection title="In Progress" jobs={inProgress} accent={THEME.blue} onOpen={(id) => router.push(`/shopproof/jobs/${id}`)} onWork={(id) => router.push(`/shopproof/jobs/${id}/work`)} />}
              {approved.length > 0 && <RepairSection title="Approved — Ready to Start" jobs={approved} accent={THEME.emerald} onOpen={(id) => router.push(`/shopproof/jobs/${id}`)} onWork={(id) => router.push(`/shopproof/jobs/${id}/work`)} />}
              {waitingParts.length > 0 && <RepairSection title="Waiting on Parts" jobs={waitingParts} accent={THEME.amber} onOpen={(id) => router.push(`/shopproof/jobs/${id}`)} onWork={(id) => router.push(`/shopproof/jobs/${id}/work`)} />}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function RepairSection({
  title, jobs, accent, onOpen, onWork,
}: {
  title: string;
  jobs: RepairJob[];
  accent: string;
  onOpen: (id: string) => void;
  onWork: (id: string) => void;
}) {
  return (
    <section style={{ borderRadius: 18, overflow: "hidden", background: THEME.panel, border: THEME.border, boxShadow: THEME.panelShadow }}>
      <div style={{ height: 48, padding: "0 14px", display: "flex", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.055)", fontSize: 14, fontWeight: 900, gap: 10 }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: accent, display: "block", flexShrink: 0 }} />
        {title}
      </div>
      <div style={{ padding: 12, display: "grid", gap: 10 }}>
        {jobs.map((j) => {
          const v = (j.vehicle as any) || {};
          const c = (j.customer as any) || {};
          const vehicleLine = [v.year, v.make, v.model].filter(Boolean).join(" ") || "Unknown Vehicle";
          const hasFindings = !!j.findings;
          const hasWork = !!j.work_performed;

          return (
            <div
              key={j.id}
              style={{
                borderRadius: 14, border: THEME.borderSoft,
                background: THEME.card, padding: "12px 14px",
                display: "grid", gridTemplateColumns: "auto 1fr auto",
                gap: 14, alignItems: "center",
              }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 10, border: THEME.borderSoft, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Wrench size={18} color={accent} />
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontWeight: 900, fontSize: 14 }}>{vehicleLine}</span>
                  {c.name && <span style={{ fontSize: 12, color: THEME.textMuted }}>{c.name}</span>}
                  {j.assigned_to && (
                    <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: `${accent}14`, border: `1px solid ${accent}28`, color: accent }}>
                      {j.assigned_to}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: THEME.textMuted, display: "flex", gap: 12 }}>
                  {hasFindings && <span style={{ color: THEME.emerald }}>Findings documented</span>}
                  {hasWork && <span style={{ color: THEME.emerald }}>Work recorded</span>}
                  {!hasFindings && !hasWork && <span>No documentation yet</span>}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button type="button" onClick={() => onWork(j.id)} style={{ height: 34, padding: "0 10px", borderRadius: 9, border: `1px solid ${accent}30`, background: `${accent}10`, color: accent, fontSize: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <Wrench size={12} /> Work
                </button>
                <button type="button" onClick={() => onOpen(j.id)} style={{ height: 34, padding: "0 10px", borderRadius: 9, border: THEME.borderSoft, background: "rgba(255,255,255,0.05)", color: THEME.textSoft, fontSize: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  View <ChevronRight size={12} />
                </button>
              </div>
            </div>
          );
        })}
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
      Loading repairs...
      <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ borderRadius: 18, border: THEME.borderSoft, background: THEME.card, minHeight: 280, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 28 }}>
      <div style={{ maxWidth: 380, display: "grid", justifyItems: "center", gap: 12 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, border: THEME.borderSoft, background: "linear-gradient(180deg, rgba(20,33,47,0.98) 0%, rgba(11,20,30,0.98) 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Wrench size={26} color={THEME.blue} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.03em" }}>No active repairs</div>
        <div style={{ fontSize: 13, color: THEME.textMuted, lineHeight: 1.6 }}>Jobs that are approved and in service will appear here.</div>
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
