"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CarFront,
  ChevronRight,
  LoaderCircle,
  Plus,
  Search,
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
  red: "#F87171",
  buttonBlue:
    "linear-gradient(180deg, rgba(36,126,255,1) 0%, rgba(21,101,219,1) 100%)",
};

type VehicleJob = {
  id: string;
  status: string;
  concern: string | null;
  created_at: string | null;
  customer: { name: string; phone: string } | null;
  vehicle: { id: string; year: string; make: string; model: string; vin: string; plate: string; color: string; mileage_in: string } | null;
};

const STATUS_COLOR: Record<string, string> = {
  "New Intake": THEME.blue,
  "In Progress": THEME.amber,
  "Waiting on Approval": THEME.amber,
  "Approved": THEME.emerald,
  "Waiting on Parts": THEME.amber,
  "Ready for Pickup": THEME.emerald,
  "Completed": THEME.emerald,
  "Declined": THEME.red,
};

export default function ShopProofVehiclesPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<VehicleJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"active" | "all">("active");

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseClient();
      if (!supabase) { setLoading(false); return; }

      try {
        let query = supabase
          .from("jobs")
          .select(`
            id, status, concern, created_at,
            customer:customers!jobs_customer_id_fkey(name, phone),
            vehicle:vehicles!jobs_vehicle_id_fkey(id, year, make, model, vin, plate, color, mileage_in)
          `)
          .order("created_at", { ascending: false });

        if (filter === "active") {
          query = query.not("status", "in", '("Completed","Declined")');
        }

        const { data } = await query;
        setJobs((data as unknown as VehicleJob[]) || []);
      } catch {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filter]);

  const filtered = jobs.filter((j) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const v = (j.vehicle as any) || {};
    const c = (j.customer as any) || {};
    const vehicleLine = [v.year, v.make, v.model, v.vin, v.plate].join(" ").toLowerCase();
    return vehicleLine.includes(q) || (c.name || "").toLowerCase().includes(q) || j.status.toLowerCase().includes(q);
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(57,122,255,0.18) 0%, rgba(57,122,255,0.06) 18%, rgba(57,122,255,0) 40%),
          repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 46px),
          repeating-linear-gradient(90deg, rgba(255,255,255,0.006) 0px, rgba(255,255,255,0.006) 1px, transparent 1px, transparent 74px),
          ${THEME.pageBase}
        `,
        color: THEME.text,
        padding: "22px",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1410, margin: "0 auto", borderRadius: 24, overflow: "hidden",
          background: THEME.shell, border: THEME.border, boxShadow: THEME.shellShadow, position: "relative",
        }}
      >
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: THEME.shellInner, opacity: 0.95 }} />

        {/* Top bar */}
        <div
          style={{
            padding: "16px 18px", display: "grid",
            gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.05)", position: "relative", zIndex: 1,
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", border: THEME.borderSoft, background: "linear-gradient(180deg, rgba(17,32,48,0.98) 0%, rgba(10,19,29,0.98) 100%)" }}>
            <CarFront size={22} strokeWidth={2.1} color={THEME.blue} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 4 }}>Vehicles In Shop</div>
            <div style={{ fontSize: 13, color: THEME.textMuted, lineHeight: 1.5 }}>Customer vehicles currently in service, with intake status and documentation state.</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/shopproof/dashboard" style={ghostButton}><ArrowLeft size={14} /> Dashboard</Link>
            <Link href="/shopproof/new" style={primaryButton}><Plus size={14} /> New Job</Link>
          </div>
        </div>

        <div style={{ padding: 18, display: "grid", gap: 14, position: "relative", zIndex: 1 }}>
          {/* Search + filter */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 10 }}>
            <div style={{ height: 44, borderRadius: 12, border: THEME.borderSoft, background: THEME.card, display: "flex", alignItems: "center", padding: "0 14px", gap: 10 }}>
              <Search size={15} color={THEME.textMuted} />
              <input
                type="text"
                placeholder="Search vehicle, VIN, plate, customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", color: THEME.text, fontSize: 13, width: "100%" }}
              />
            </div>
            <FilterBtn label="Active" active={filter === "active"} onClick={() => setFilter("active")} />
            <FilterBtn label="All" active={filter === "all"} onClick={() => setFilter("all")} />
          </div>

          {loading ? (
            <LoadingState />
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <section style={{ borderRadius: 18, overflow: "hidden", background: THEME.panel, border: THEME.border, boxShadow: THEME.panelShadow }}>
              <div style={{ height: 48, padding: "0 14px", display: "flex", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.055)", fontSize: 14, fontWeight: 900 }}>
                {filtered.length} Vehicle{filtered.length !== 1 ? "s" : ""}
              </div>
              <div style={{ padding: 12, display: "grid", gap: 10 }}>
                {filtered.map((j) => {
                  const v = (j.vehicle as any) || {};
                  const c = (j.customer as any) || {};
                  const vehicleLine = [v.year, v.make, v.model].filter(Boolean).join(" ") || "Unknown Vehicle";
                  const statusColor = STATUS_COLOR[j.status] || THEME.blue;

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
                      {/* Vehicle icon */}
                      <div style={{ width: 42, height: 42, borderRadius: 10, border: THEME.borderSoft, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <CarFront size={20} color={statusColor} />
                      </div>

                      {/* Info */}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                          <span style={{ fontWeight: 900, fontSize: 14 }}>{vehicleLine}</span>
                          <span style={{
                            fontSize: 11, fontWeight: 900, padding: "2px 8px", borderRadius: 999,
                            background: `${statusColor}18`, border: `1px solid ${statusColor}38`,
                            color: statusColor,
                          }}>{j.status}</span>
                        </div>
                        <div style={{ fontSize: 12, color: THEME.textMuted, display: "flex", gap: 12, flexWrap: "wrap" }}>
                          {c.name && <span>{c.name}</span>}
                          {v.vin && <span style={{ fontFamily: "ui-monospace, monospace" }}>VIN: {v.vin}</span>}
                          {v.plate && <span>Plate: {v.plate}</span>}
                          {v.color && <span>{v.color}</span>}
                        </div>
                      </div>

                      {/* Action */}
                      <button
                        type="button"
                        onClick={() => router.push(`/shopproof/jobs/${j.id}`)}
                        style={{
                          height: 34, padding: "0 12px", borderRadius: 9,
                          border: THEME.borderSoft, background: "rgba(255,255,255,0.05)",
                          color: THEME.textSoft, fontSize: 12, fontWeight: 800,
                          cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                          flexShrink: 0,
                        }}
                      >
                        View Job <ChevronRight size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

function FilterBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 44, padding: "0 16px", borderRadius: 12,
        border: active ? "1px solid rgba(59,130,246,0.40)" : THEME.borderSoft,
        background: active ? "rgba(59,130,246,0.12)" : THEME.card,
        color: active ? THEME.blue : THEME.textMuted,
        fontSize: 13, fontWeight: 900, cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function LoadingState() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48, gap: 12, color: THEME.textMuted, fontSize: 14 }}>
      <LoaderCircle size={18} style={{ animation: "spin 1s linear infinite" }} />
      Loading vehicles...
      <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ borderRadius: 18, border: THEME.borderSoft, background: THEME.card, minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 28 }}>
      <div style={{ maxWidth: 380, display: "grid", justifyItems: "center", gap: 12 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, border: THEME.borderSoft, background: "linear-gradient(180deg, rgba(20,33,47,0.98) 0%, rgba(11,20,30,0.98) 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CarFront size={26} color={THEME.blue} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.03em" }}>No vehicles found</div>
        <div style={{ fontSize: 13, color: THEME.textMuted, lineHeight: 1.6 }}>Active customer vehicles appear here once jobs are created.</div>
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
