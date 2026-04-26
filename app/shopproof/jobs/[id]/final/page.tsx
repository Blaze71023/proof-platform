"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getJobs, updateJob } from "@/lib/shopproof";

type AnyJob = any;

const PAGE_BG_VAL = "linear-gradient(180deg, #e8eef5 0%, #dfe7f0 42%, #d8e1eb 100%)";
const TEXT_MAIN = "#0f172a";
const BLUE = "#2563eb";
const AMBER = "#d97706";
const AMBER_SOFT = "#fef3c7";
const RED = "#dc2626";
const EMERALD = "#059669";
const EMERALD_SOFT = "#d1fae5";

function formatMoney(value: any) {
  if (value === null || value === undefined || value === "") return "—";
  const num = Number(value);
  if (!Number.isNaN(num)) return "$" + num.toFixed(2);
  return "$" + value;
}

function formatDateTime(value: any) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

function cleanStatus(value: any) {
  if (!value) return "Pending";
  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function FinalPage() {
  const params = useParams();
  const id = params?.id as string;

  const [job, setJob] = useState<AnyJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [releaseName, setReleaseName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setJob(null);
      setLoading(false);
      return;
    }
    const jobs = getJobs();
    const found = jobs.find((item: AnyJob) => String(item?.id) === String(id)) || null;
    setJob(found);
    setLoading(false);
  }, [id]);

  const vehicleLabel = useMemo(() => {
    if (!job?.vehicle) return "Vehicle record";
    const { year = "", make = "", model = "" } = job.vehicle;
    return [year, make, model].filter(Boolean).join(" ") || "Vehicle record";
  }, [job]);

  const handleSubmit = () => {
    if (!job) return;
    if (!releaseName.trim()) {
      setError("Please enter the customer's name.");
      return;
    }
    const updated = { ...job, final: { ...job.final, releasedByCustomerName: releaseName.trim(), releasedAt: new Date().toISOString() } };
    updateJob(updated);
    setJob(updated);
    setSubmitted(true);
  };

  if (loading) return <div style={pageStyle}><div style={centerWrapStyle}><div style={statusCardStyle}><h2>Loading...</h2></div></div></div>;

  if (!job) return <div style={pageStyle}><div style={centerWrapStyle}><div style={statusCardStyle}><h1>Record not found</h1></div></div></div>;

  if (submitted) {
    return (
      <div style={pageStyle}>
        <div style={centerWrapStyle}>
          <div style={statusCardStyle}>
            <div style={successBadgeStyle}>Final release saved</div>
            <h1 style={statusTitleStyle}>Vehicle release recorded</h1>
            <div style={summaryPanelStyle}>
              <div style={summaryRowStyle}><span>Vehicle</span><strong>{vehicleLabel}</strong></div>
              <div style={summaryRowLastStyle}><span>Released by</span><strong>{releaseName}</strong></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={pageInnerStyle}>
        <div style={shellStyle}>
          <div style={headerStyle}>
            <div style={miniBrandStyle}>ShopPROOF Final Record</div>
            <h1 style={pageTitleStyle}>Final Release</h1>
          </div>
          <div style={layoutStyle}>
            <div style={documentCardStyle}>
              <h2 style={documentTitleStyle}>{vehicleLabel}</h2>
              <div style={signaturePanelStyle}>
                <label style={inputLabelStyle}>Customer Name</label>
                <input style={inputStyle} value={releaseName} onChange={(e) => setReleaseName(e.target.value)} placeholder="Full Name" />
                {error && <div style={{ color: RED, marginBottom: 10 }}>{error}</div>}
                <button style={submitButtonStyle} onClick={handleSubmit}>Sign & Complete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const pageStyle: CSSProperties = { minHeight: "100vh", background: PAGE_BG_VAL, color: TEXT_MAIN, fontFamily: 'sans-serif' };
const pageInnerStyle: CSSProperties = { width: "100%", maxWidth: 1280, margin: "0 auto", padding: "28px 20px" };
const shellStyle: CSSProperties = { borderRadius: 30, background: "#fff", padding: 24 };
const centerWrapStyle: CSSProperties = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" };
const headerStyle: CSSProperties = { marginBottom: 18 };
const miniBrandStyle: CSSProperties = { fontSize: 11, fontWeight: 800, color: BLUE, textTransform: "uppercase" };
const pageTitleStyle: CSSProperties = { fontSize: 34, fontWeight: 800 };
const layoutStyle: CSSProperties = { display: "grid", gridTemplateColumns: "1fr", gap: 18 };
const documentCardStyle: CSSProperties = { borderRadius: 20, background: "#f8fafc", padding: 20, border: "1px solid #e2e8f0" };
const documentTitleStyle: CSSProperties = { fontSize: 24, fontWeight: 800, marginBottom: 15 };
const signaturePanelStyle: CSSProperties = { marginTop: 20 };
const inputLabelStyle: CSSProperties = { display: "block", fontSize: 12, marginBottom: 5, fontWeight: 700 };
const inputStyle: CSSProperties = { width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", marginBottom: 10 };
const submitButtonStyle: CSSProperties = { width: "100%", padding: 12, borderRadius: 10, background: BLUE, color: "#fff", fontWeight: 800, border: "none", cursor: "pointer" };
const statusCardStyle: CSSProperties = { background: "#fff", padding: 30, borderRadius: 20, textAlign: "center" };
const statusTitleStyle: CSSProperties = { fontSize: 22, fontWeight: 800 };
const summaryPanelStyle: CSSProperties = { marginTop: 15, background: "#f1f5f9", padding: 15, borderRadius: 10, textAlign: "left" };
const summaryRowStyle: CSSProperties = { display: "flex", justifyContent: "space-between", marginBottom: 10 };
const summaryRowLastStyle: CSSProperties = { display: "flex", justifyContent: "space-between" };
const successBadgeStyle: CSSProperties = { background: EMERALD_SOFT, color: EMERALD, padding: "5px 10px", borderRadius: 999, fontSize: 12, display: "inline-block" };