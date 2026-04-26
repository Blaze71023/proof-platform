"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getJobs, updateJob } from "@/lib/shopproof";

type AnyJob = any;

const PAGE_BG = "linear-gradient(180deg, #e8eef5 0%, #dfe7f0 42%, #d8e1eb 100%)";
const PANEL_BG = "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,249,252,0.98) 100%)";
const STATUS_BAND_BG = "linear-gradient(135deg, #142235 0%, #1d334d 48%, #244463 100%)";

const TEXT_MAIN = "#0f172a";
const TEXT_SOFT = "#334155";
const TEXT_MUTED = "#64748b";

function formatMoney(value: any) {
  if (value === null || value === undefined || value === "") return "—";
  const num = Number(value);
  if (!Number.isNaN(num)) return "$" + num.toFixed(2);
  return "$" + String(value);
}

function formatDateTime(value: any) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

export default function FinalPage() {
  const params = useParams();
  const id = params?.id as string;

  const [job, setJob] = useState<AnyJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [releaseName, setReleaseName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const jobs = getJobs();
    const found = jobs.find((j: AnyJob) => String(j.id) === String(id));
    setJob(found || null);
    setLoading(false);
  }, [id]);

  const vehicleLabel = useMemo(() => {
    if (!job?.vehicle) return "Vehicle";
    const { year = "", make = "", model = "" } = job.vehicle;
    return `${year} ${make} ${model}`.trim() || "Vehicle record";
  }, [job]);

  // Combined name logic since intake uses firstName/lastName
  const displayName = useMemo(() => {
    if (!job?.customer) return "Customer";
    const { firstName = "", lastName = "", name = "" } = job.customer;
    return (firstName || lastName) ? `${firstName} ${lastName}`.trim() : name || "Customer";
  }, [job]);

  if (loading) return <div style={centerStyle}>Loading...</div>;
  if (!job) return <div style={centerStyle}>Record not found</div>;

  if (submitted) {
    return (
      <div style={centerStyle}>
        Final release recorded for {displayName}
      </div>
    );
  }

  const handleSubmit = () => {
    if (!releaseName.trim()) return;
    const updated = {
      ...job,
      final: {
        ...job.final,
        finalStatus: "released",
        releasedAt: new Date().toISOString(),
        releasedByCustomerName: releaseName.trim(),
      },
    };
    updateJob(updated);
    setJob(updated);
    setSubmitted(true);
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <h1 style={titleStyle}>Final Release</h1>

        <div style={statusBandStyle}>
          <div style={statusItem}>
            <div style={statusLabel}>Vehicle</div>
            <div style={statusValue}>{vehicleLabel}</div>
          </div>
          <div style={statusItem}>
            <div style={statusLabel}>Customer</div>
            <div style={statusValue}>{displayName}</div>
          </div>
          <div style={statusItem}>
            <div style={statusLabel}>Total</div>
            <div style={statusValue}>{formatMoney(job?.totals?.total || job?.estimate?.total)}</div>
          </div>
          <div style={statusItem}>
            <div style={statusLabel}>Created</div>
            <div style={statusValue}>{formatDateTime(job?.createdAt)}</div>
          </div>
        </div>

        <div style={cardStyle}>
          {/* Added VIN Section here */}
          <div style={{ marginBottom: 20, paddingBottom: 15, borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 10, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: 1 }}>Vehicle Identification Number</div>
            <div style={{ fontSize: 18, fontFamily: "monospace", fontWeight: 700, color: "#1e293b", marginTop: 4 }}>
              {job?.vehicle?.vin || "No VIN Recorded"}
            </div>
          </div>

          <p style={textStyle}>
            I acknowledge that I am receiving the vehicle and accept its
            condition as documented.
          </p>

          <input
            value={releaseName}
            onChange={(e) => setReleaseName(e.target.value)}
            placeholder="Sign your name"
            style={inputStyle}
          />

          <button onClick={handleSubmit} style={buttonStyle}>
            Complete Final Release
          </button>
        </div>
      </div>
    </div>
  );
}

/* STYLES */
const pageStyle: CSSProperties = { minHeight: "100vh", background: PAGE_BG, padding: 20, fontFamily: "Inter, sans-serif" };
const containerStyle: CSSProperties = { maxWidth: 900, margin: "0 auto" };
const titleStyle: CSSProperties = { fontSize: 32, marginBottom: 20, color: TEXT_MAIN, fontWeight: 800 };
const statusBandStyle: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", background: STATUS_BAND_BG, borderRadius: 12, padding: 16, marginBottom: 20, color: "white" };
const statusItem: CSSProperties = { textAlign: "left", padding: "0 10px" };
const statusLabel: CSSProperties = { fontSize: 10, opacity: 0.7, textTransform: "uppercase", marginBottom: 4 };
const statusValue: CSSProperties = { fontSize: 14, fontWeight: 700 };
const cardStyle: CSSProperties = { background: PANEL_BG, padding: 30, borderRadius: 16, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" };
const textStyle: CSSProperties = { marginBottom: 20, color: TEXT_SOFT, lineHeight: 1.5 };
const inputStyle: CSSProperties = { width: "100%", padding: 14, marginBottom: 16, borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 16 };
const buttonStyle: CSSProperties = { width: "100%", padding: 16, background: "#2563eb", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 16 };
const centerStyle: CSSProperties = { height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: TEXT_MAIN, fontWeight: 600 };