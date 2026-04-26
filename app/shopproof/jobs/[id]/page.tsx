"use client";

import { CSSProperties, useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { getJobs } from "@/lib/shopproof";

type AnyJob = any;

// THEME SYSTEM
const THEME = {
  bg: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
  cardBg: "#ffffff",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  textMain: "#0f172a",
  textSoft: "#475569",
  textMuted: "#94a3b8",
  blue: "#2563eb",
  blueSoft: "#eff6ff",
  emerald: "#10b981",
  amber: "#f59e0b",
};

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [job, setJob] = useState<AnyJob | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const jobs = getJobs();
    const found = jobs.find((j: AnyJob) => String(j.id) === String(id));
    setJob(found || null);
    setLoading(false);
  }, [id]);

  const vehicleLabel = useMemo(() => {
    if (!job?.vehicle) return "Vehicle";
    const { year = "", make = "", model = "" } = job.vehicle;
    return `${year} ${make} ${model}`.trim() || "Vehicle Record";
  }, [job]);

  if (loading) return <div style={centerStyle}>Loading record...</div>;
  if (!job) return <div style={centerStyle}>Job not found</div>;

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        
        {/* HEADER AREA */}
        <header style={headerStyle}>
          <div>
            <div style={badgeStyle}>Job Record</div>
            <h1 style={titleStyle}>{vehicleLabel}</h1>
            <p style={subtitleStyle}>ID: {job.id} • Created {new Date(job.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div style={headerActionsStyle}>
             <button onClick={() => router.push('/shopproof/jobs')} style={secondaryButtonStyle}>
                ← Back to List
             </button>
          </div>
        </header>

        <div style={layoutGridStyle}>
          
          {/* LEFT COLUMN: JOB DATA */}
          <main style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* VEHICLE INFO CARD */}
            <section style={cardStyle}>
              <h3 style={sectionTitleStyle}>Vehicle Details</h3>
              <div style={infoGridStyle}>
                <div style={infoBox}>
                  <label style={infoLabel}>VIN</label>
                  <div style={infoValueMono}>{job.vehicle?.vin || "—"}</div>
                </div>
                <div style={infoBox}>
                  <label style={infoLabel}>Plate</label>
                  <div style={infoValue}>{job.vehicle?.plate || "—"}</div>
                </div>
                <div style={infoBox}>
                  <label style={infoLabel}>Mileage In</label>
                  <div style={infoValue}>{job.visit?.mileageIn || "—"}</div>
                </div>
              </div>
            </section>

            {/* CUSTOMER CARD */}
            <section style={cardStyle}>
              <h3 style={sectionTitleStyle}>Customer Information</h3>
              <div style={infoGridStyle}>
                <div style={infoBox}>
                  <label style={infoLabel}>Name</label>
                  <div style={infoValue}>{job.customer?.firstName} {job.customer?.lastName}</div>
                </div>
                <div style={infoBox}>
                  <label style={infoLabel}>Phone</label>
                  <div style={infoValue}>{job.customer?.phone || "—"}</div>
                </div>
              </div>
            </section>
          </main>

          {/* RIGHT COLUMN: WORKFLOW ACTIONS */}
          <aside>
            <div style={sidebarCardStyle}>
              <h3 style={sectionTitleStyle}>Workflow Status</h3>
              <div style={statusTagStyle}>
                {job.status || "In Progress"}
              </div>

              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                
                {/* PRIMARY ACTION: PROCEED TO FINAL RELEASE */}
                <button
                  onClick={() => router.push(`/shopproof/jobs/${id}/final`)}
                  style={primaryActionButtonStyle}
                >
                  Proceed to Final Release →
                </button>

                <div style={{ height: '1px', background: '#e2e8f0', margin: '8px 0' }} />

                <button style={outlineButtonStyle} onClick={() => window.print()}>
                  Print Work Order
                </button>
                
                <p style={helpTextStyle}>
                  Proceed to Final Release to document the vehicle exit and capture the customer signature.
                </p>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

/* STYLES */

const pageStyle: CSSProperties = { minHeight: "100vh", background: THEME.bg, padding: "40px 20px", fontFamily: "Inter, sans-serif", color: THEME.textMain };
const containerStyle: CSSProperties = { maxWidth: 1100, margin: "0 auto" };
const headerStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 };
const titleStyle: CSSProperties = { fontSize: 32, fontWeight: 800, margin: "8px 0" };
const subtitleStyle: CSSProperties = { color: THEME.textSoft, fontSize: 14 };
const badgeStyle: CSSProperties = { display: "inline-block", padding: "4px 10px", background: THEME.blueSoft, color: THEME.blue, borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: "uppercase" };

const layoutGridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 };
const cardStyle: CSSProperties = { background: THEME.cardBg, borderRadius: 16, border: THEME.border, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" };
const sidebarCardStyle: CSSProperties = { ...cardStyle, position: "sticky", top: 20 };

const sectionTitleStyle: CSSProperties = { fontSize: 13, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16 };
const infoGridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 };
const infoBox: CSSProperties = { display: "flex", flexDirection: "column", gap: 4 };
const infoLabel: CSSProperties = { fontSize: 11, color: THEME.textMuted };
const infoValue: CSSProperties = { fontSize: 15, fontWeight: 600 };
const infoValueMono: CSSProperties = { fontSize: 14, fontWeight: 700, fontFamily: "monospace", background: "#f8fafc", padding: "4px 8px", borderRadius: 4, display: "inline-block" };

const statusTagStyle: CSSProperties = { display: "inline-block", padding: "6px 12px", background: "#fef3c7", color: "#92400e", borderRadius: 999, fontSize: 12, fontWeight: 700 };

const primaryActionButtonStyle: CSSProperties = {
  width: "100%",
  padding: "16px",
  borderRadius: 12,
  background: THEME.blue,
  color: "#fff",
  fontSize: 15,
  fontWeight: 700,
  border: "none",
  cursor: "pointer",
  boxShadow: "0 8px 18px rgba(37,99,235,0.18)",
};

const secondaryButtonStyle: CSSProperties = { background: "none", border: "none", color: THEME.textSoft, cursor: "pointer", fontSize: 14, fontWeight: 600 };
const outlineButtonStyle: CSSProperties = { width: "100%", padding: "12px", borderRadius: 10, background: "none", border: "1px solid #e2e8f0", color: THEME.textSoft, fontSize: 14, fontWeight: 600, cursor: "pointer" };
const helpTextStyle: CSSProperties = { fontSize: 12, color: THEME.textMuted, textAlign: "center", lineHeight: 1.4 };
const centerStyle: CSSProperties = { height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" };