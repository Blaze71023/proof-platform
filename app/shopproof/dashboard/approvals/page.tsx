"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  ClipboardList,
  Copy,
  LoaderCircle,
  MessageSquare,
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
  textDim: "#5C7A8F",
  border: "1px solid rgba(109, 142, 176, 0.24)",
  borderSoft: "1px solid rgba(255,255,255,0.085)",
  shellShadow: "0 34px 90px rgba(0,0,0,0.5)",
  panelShadow: "0 18px 42px rgba(0,0,0,0.24)",
  cardShadow: "0 10px 22px rgba(0,0,0,0.16)",
  blue: "#3B82F6",
  orange: "#F59E42",
  emerald: "#34D399",
  red: "#F87171",
  buttonBlue:
    "linear-gradient(180deg, rgba(36,126,255,1) 0%, rgba(21,101,219,1) 100%)",
};

type ApprovalJob = {
  id: string;
  status: string;
  approval_token: string | null;
  approval_state: string | null;
  approval_signed_by: string | null;
  approval_signed_at: string | null;
  concern: string | null;
  created_at: string | null;
  customer: { name: string; phone: string } | null;
  vehicle: { year: string; make: string; model: string; vin: string } | null;
};

export default function ShopProofApprovalsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<ApprovalJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseClient();
      if (!supabase) { setLoading(false); return; }

      try {
        const { data } = await supabase
          .from("jobs")
          .select(`
            id, status, approval_token, approval_state,
            approval_signed_by, approval_signed_at,
            concern, created_at,
            customer:customers!jobs_customer_id_fkey(name, phone),
            vehicle:vehicles!jobs_vehicle_id_fkey(year, make, model, vin)
          `)
          .in("status", ["Waiting on Approval", "Approved", "New Intake", "In Progress"])
          .order("created_at", { ascending: false });

        setJobs((data as unknown as ApprovalJob[]) || []);
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
    const name = (j.customer as any)?.name || "";
    const vehicle = [(j.vehicle as any)?.year, (j.vehicle as any)?.make, (j.vehicle as any)?.model].join(" ");
    return name.toLowerCase().includes(q) || vehicle.toLowerCase().includes(q) || j.status.toLowerCase().includes(q);
  });

  const waiting = filtered.filter((j) => j.status === "Waiting on Approval" && !j.approval_signed_by);
  const needsLink = filtered.filter((j) => ["New Intake", "In Progress"].includes(j.status) && !j.approval_token);
  const signed = filtered.filter((j) => !!j.approval_signed_by);

  function copyLink(token: string) {
    const link = `${window.location.origin}/shopproof/sign/${token}`;
    navigator.clipboard.writeText(link).catch(() => {});
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(245,158,66,0.12) 0%, rgba(245,158,66,0.04) 18%, rgba(245,158,66,0) 40%),
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
          maxWidth: 1410,
          margin: "0 auto",
          borderRadius: 24,
          overflow: "hidden",
          background: THEME.shell,
          border: THEME.border,
          boxShadow: THEME.shellShadow,
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: THEME.shellInner, opacity: 0.95 }} />

        {/* Top bar */}
        <div
          style={{
            padding: "16px 18px",
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            gap: 14,
            alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 44, height: 44, borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: THEME.borderSoft,
              background: "linear-gradient(180deg, rgba(17,32,48,0.98) 0%, rgba(10,19,29,0.98) 100%)",
            }}
          >
            <ClipboardList size={22} strokeWidth={2.1} color={THEME.orange} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 4 }}>
              Approval Queue
            </div>
            <div style={{ fontSize: 13, color: THEME.textMuted, lineHeight: 1.5 }}>
              Jobs awaiting customer authorization, signed approvals, and pending decisions.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/shopproof/dashboard" style={ghostButton}>
              <ArrowLeft size={14} /> Dashboard
            </Link>
            <Link href="/shopproof/new" style={primaryButton}>
              <Plus size={14} /> New Job
            </Link>
          </div>
        </div>

        <div style={{ padding: 18, display: "grid", gap: 14, position: "relative", zIndex: 1 }}>
          {/* Search + stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 10 }}>
            <div
              style={{
                height: 44, borderRadius: 12, border: THEME.borderSoft,
                background: THEME.card, boxShadow: THEME.cardShadow,
                display: "flex", alignItems: "center", padding: "0 14px", gap: 10,
              }}
            >
              <Search size={15} color={THEME.textMuted} />
              <input
                type="text"
                placeholder="Search customer, vehicle, or status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: "transparent", border: "none", outline: "none",
                  color: THEME.text, fontSize: 13, width: "100%",
                }}
              />
            </div>
            <StatChip label="Waiting" count={waiting.length} color={THEME.orange} />
            <StatChip label="Signed" count={signed.length} color={THEME.emerald} />
            <StatChip label="No Link Yet" count={needsLink.length} color={THEME.textDim} />
          </div>

          {loading ? (
            <LoadingState />
          ) : (
            <>
              {/* Waiting on approval */}
              <Panel title="Waiting on Customer Approval" accent={THEME.orange}>
                {waiting.length === 0 ? (
                  <EmptyRow text="No jobs currently waiting on approval." />
                ) : (
                  waiting.map((j) => (
                    <ApprovalRow
                      key={j.id}
                      job={j}
                      copied={copied}
                      onCopy={copyLink}
                      onOpen={() => router.push(`/shopproof/jobs/${j.id}`)}
                      onSign={() => j.approval_token && router.push(`/shopproof/sign/${j.approval_token}`)}
                    />
                  ))
                )}
              </Panel>

              {/* Signed */}
              {signed.length > 0 && (
                <Panel title="Approval Signed" accent={THEME.emerald}>
                  {signed.map((j) => (
                    <ApprovalRow
                      key={j.id}
                      job={j}
                      copied={copied}
                      onCopy={copyLink}
                      onOpen={() => router.push(`/shopproof/jobs/${j.id}`)}
                      onSign={null}
                      showSigned
                    />
                  ))}
                </Panel>
              )}

              {/* Jobs without approval links */}
              {needsLink.length > 0 && (
                <Panel title="No Approval Link Generated Yet" accent={THEME.textDim}>
                  {needsLink.map((j) => (
                    <ApprovalRow
                      key={j.id}
                      job={j}
                      copied={copied}
                      onCopy={copyLink}
                      onOpen={() => router.push(`/shopproof/jobs/${j.id}`)}
                      onSign={null}
                      dimmed
                    />
                  ))}
                </Panel>
              )}

              {filtered.length === 0 && !loading && (
                <div
                  style={{
                    borderRadius: 18, border: THEME.borderSoft,
                    background: THEME.card, padding: 40,
                    textAlign: "center", color: THEME.textMuted,
                    fontSize: 14, lineHeight: 1.6,
                  }}
                >
                  No jobs match your search.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function ApprovalRow({
  job,
  copied,
  onCopy,
  onOpen,
  onSign,
  showSigned,
  dimmed,
}: {
  job: ApprovalJob;
  copied: string | null;
  onCopy: (token: string) => void;
  onOpen: () => void;
  onSign: (() => void) | null;
  showSigned?: boolean;
  dimmed?: boolean;
}) {
  const customer = (job.customer as any) || {};
  const vehicle = (job.vehicle as any) || {};
  const vehicleLine = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ") || "Unknown Vehicle";
  const isCopied = job.approval_token && copied === job.approval_token;

  return (
    <div
      style={{
        borderRadius: 14, border: THEME.borderSoft,
        background: dimmed ? "rgba(19,34,51,0.5)" : THEME.card,
        padding: "12px 14px", marginBottom: 10,
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 12, alignItems: "center",
        opacity: dimmed ? 0.7 : 1,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
          <span style={{ fontWeight: 900, fontSize: 14, color: THEME.text }}>{customer.name || "Unknown Customer"}</span>
          <span style={{ fontSize: 12, color: THEME.textMuted }}>{vehicleLine}</span>
          {showSigned && (
            <span style={{
              fontSize: 11, fontWeight: 900, padding: "2px 8px", borderRadius: 999,
              background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.22)",
              color: THEME.emerald,
            }}>
              Signed by {job.approval_signed_by}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: THEME.textMuted }}>
          {job.status} {job.concern ? `• ${job.concern.slice(0, 60)}${job.concern.length > 60 ? "…" : ""}` : ""}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        {job.approval_token && !showSigned && (
          <>
            <button
              type="button"
              onClick={() => onCopy(job.approval_token!)}
              title="Copy approval link"
              style={{
                height: 34, padding: "0 10px", borderRadius: 9,
                border: THEME.borderSoft,
                background: isCopied ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.05)",
                color: isCopied ? THEME.emerald : THEME.textMuted,
                fontSize: 12, fontWeight: 800, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <Copy size={12} />
              {isCopied ? "Copied" : "Copy Link"}
            </button>
            {onSign && (
              <button
                type="button"
                onClick={onSign}
                style={{
                  height: 34, padding: "0 10px", borderRadius: 9,
                  border: "1px solid rgba(245,158,66,0.28)",
                  background: "rgba(245,158,66,0.10)",
                  color: THEME.orange,
                  fontSize: 12, fontWeight: 800, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                <MessageSquare size={12} />
                Sign Now
              </button>
            )}
          </>
        )}
        <button
          type="button"
          onClick={onOpen}
          style={{
            height: 34, padding: "0 10px", borderRadius: 9,
            border: THEME.borderSoft,
            background: "rgba(255,255,255,0.05)",
            color: THEME.textSoft,
            fontSize: 12, fontWeight: 800, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          View Job <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

function Panel({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        borderRadius: 18, overflow: "hidden",
        background: THEME.panel, border: THEME.border, boxShadow: THEME.panelShadow,
      }}
    >
      <div
        style={{
          height: 48, padding: "0 14px",
          display: "flex", alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.055)",
          fontSize: 14, fontWeight: 900, gap: 10,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: 999, background: accent, display: "block", flexShrink: 0 }} />
        {title}
      </div>
      <div style={{ padding: 12 }}>{children}</div>
    </section>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div
      style={{
        borderRadius: 12, border: THEME.borderSoft,
        background: THEME.card, padding: "20px 16px",
        fontSize: 13, color: THEME.textMuted, textAlign: "center",
      }}
    >
      {text}
    </div>
  );
}

function StatChip({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div
      style={{
        height: 44, padding: "0 14px", borderRadius: 12,
        border: THEME.borderSoft, background: THEME.card,
        display: "flex", alignItems: "center", gap: 8,
        fontSize: 13, fontWeight: 900, color: THEME.textSoft,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: 18, fontWeight: 900, color }}>{count}</span>
      {label}
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48, gap: 12, color: THEME.textMuted, fontSize: 14 }}>
      <LoaderCircle size={18} style={{ animation: "spin 1s linear infinite" }} />
      Loading approval queue...
      <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
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
