"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, LoaderCircle, Plus, CircleUser as UserCircle2, Users } from "lucide-react";
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
  emerald: "#34D399",
  blue: "#3B82F6",
  amber: "#FBBF24",
  buttonBlue:
    "linear-gradient(180deg, rgba(36,126,255,1) 0%, rgba(21,101,219,1) 100%)",
};

type TeamJob = {
  id: string;
  status: string;
  assigned_to: string | null;
  written_by: string | null;
  concern: string | null;
  findings: string | null;
  created_at: string | null;
  customer: { name: string } | null;
  vehicle: { year: string; make: string; model: string } | null;
};

type TechGroup = {
  name: string;
  jobs: TeamJob[];
  documented: number;
  total: number;
};

function groupByTechnician(jobs: TeamJob[]): TechGroup[] {
  const map = new Map<string, TeamJob[]>();

  for (const j of jobs) {
    const key = j.assigned_to || j.written_by || "Unassigned";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(j);
  }

  const groups: TechGroup[] = [];
  map.forEach((techJobs, name) => {
    groups.push({
      name,
      jobs: techJobs,
      documented: techJobs.filter((j) => !!j.findings).length,
      total: techJobs.length,
    });
  });

  // Sort by active job count desc, Unassigned last
  groups.sort((a, b) => {
    if (a.name === "Unassigned") return 1;
    if (b.name === "Unassigned") return -1;
    return b.total - a.total;
  });

  return groups;
}

export default function ShopProofTeamPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<TeamJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseClient();
      if (!supabase) { setLoading(false); return; }

      try {
        const { data } = await supabase
          .from("jobs")
          .select(`
            id, status, assigned_to, written_by, concern, findings, created_at,
            customer:customers!jobs_customer_id_fkey(name),
            vehicle:vehicles!jobs_vehicle_id_fkey(year, make, model)
          `)
          .not("status", "in", '("Completed","Declined")')
          .order("created_at", { ascending: false });

        setJobs((data as unknown as TeamJob[]) || []);
      } catch {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const groups = groupByTechnician(jobs);

  const avatarColor = (name: string) => {
    const colors = [THEME.emerald, THEME.blue, THEME.amber, "#C084FC", "#FB923C", "#38BDF8"];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % colors.length;
    return colors[h];
  };

  const initials = (name: string) =>
    name === "Unassigned"
      ? "?"
      : name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(39,217,191,0.12) 0%, rgba(39,217,191,0.04) 18%, rgba(39,217,191,0) 40%),
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
            <UserCircle2 size={22} strokeWidth={2.1} color={THEME.emerald} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 4 }}>Technician Assignments</div>
            <div style={{ fontSize: 13, color: THEME.textMuted, lineHeight: 1.5 }}>Active job attribution by technician. Documentation status and workload visibility.</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/shopproof/dashboard" style={ghostButton}><ArrowLeft size={14} /> Dashboard</Link>
            <Link href="/shopproof/new" style={primaryButton}><Plus size={14} /> New Job</Link>
          </div>
        </div>

        <div style={{ padding: 18, display: "grid", gap: 14, position: "relative", zIndex: 1 }}>
          {loading ? (
            <LoadingState />
          ) : jobs.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {groups.map((g) => {
                const color = avatarColor(g.name);
                const pct = g.total > 0 ? Math.round((g.documented / g.total) * 100) : 0;

                return (
                  <section key={g.name} style={{ borderRadius: 18, overflow: "hidden", background: THEME.panel, border: THEME.border, boxShadow: THEME.panelShadow }}>
                    {/* Tech header */}
                    <div style={{ padding: "14px 16px", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.055)" }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}1C`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, color }}>
                        {initials(g.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 900, fontSize: 15 }}>{g.name}</div>
                        <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 2 }}>
                          {g.total} active job{g.total !== 1 ? "s" : ""}
                          {" · "}
                          {g.documented}/{g.total} documented
                        </div>
                      </div>
                      {/* Documentation progress bar */}
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 13, fontWeight: 900, color, marginBottom: 6 }}>{pct}%</div>
                        <div style={{ width: 80, height: 5, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999, transition: "width 0.3s" }} />
                        </div>
                      </div>
                    </div>

                    {/* Jobs */}
                    <div style={{ padding: 12, display: "grid", gap: 8 }}>
                      {g.jobs.map((j) => {
                        const v = (j.vehicle as any) || {};
                        const c = (j.customer as any) || {};
                        const vehicleLine = [v.year, v.make, v.model].filter(Boolean).join(" ") || "Unknown Vehicle";
                        const documented = !!j.findings;

                        return (
                          <div
                            key={j.id}
                            style={{
                              borderRadius: 12, border: THEME.borderSoft,
                              background: THEME.card, padding: "10px 12px",
                              display: "grid", gridTemplateColumns: "1fr auto",
                              gap: 12, alignItems: "center",
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <span style={{ fontWeight: 800, fontSize: 13 }}>{vehicleLine}</span>
                                {c.name && <span style={{ fontSize: 12, color: THEME.textMuted }}>{c.name}</span>}
                                <span style={{
                                  fontSize: 11, fontWeight: 800, padding: "2px 7px", borderRadius: 999,
                                  background: documented ? "rgba(52,211,153,0.10)" : "rgba(251,191,36,0.10)",
                                  border: `1px solid ${documented ? "rgba(52,211,153,0.22)" : "rgba(251,191,36,0.22)"}`,
                                  color: documented ? THEME.emerald : THEME.amber,
                                }}>
                                  {documented ? "Documented" : "Needs docs"}
                                </span>
                              </div>
                              <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 3 }}>{j.status}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => router.push(`/shopproof/jobs/${j.id}`)}
                              style={{
                                height: 30, padding: "0 10px", borderRadius: 8,
                                border: THEME.borderSoft, background: "rgba(255,255,255,0.05)",
                                color: THEME.textSoft, fontSize: 11, fontWeight: 800,
                                cursor: "pointer", display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
                              }}
                            >
                              View <ChevronRight size={11} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function LoadingState() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48, gap: 12, color: THEME.textMuted, fontSize: 14 }}>
      <LoaderCircle size={18} style={{ animation: "spin 1s linear infinite" }} />
      Loading assignments...
      <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ borderRadius: 18, border: THEME.borderSoft, background: THEME.card, minHeight: 280, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 28 }}>
      <div style={{ maxWidth: 380, display: "grid", justifyItems: "center", gap: 12 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, border: THEME.borderSoft, background: "linear-gradient(180deg, rgba(20,33,47,0.98) 0%, rgba(11,20,30,0.98) 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Users size={26} color={THEME.emerald} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.03em" }}>No assignments yet</div>
        <div style={{ fontSize: 13, color: THEME.textMuted, lineHeight: 1.6 }}>Create jobs and assign technicians to build the team attribution board.</div>
        <Link href="/shopproof/new" style={primaryButton}><Plus size={14} /> New Job</Link>
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
