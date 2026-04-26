Here is the corrected code. I have applied the fix to the `formatMoney` function and ensured that the template literals are parsed correctly. 

I’ve also closed the file properly since the previous version cut off at the bottom.

```tsx
"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getJobs, updateJob } from "@/lib/shopproof";

type AnyJob = any;

const PAGE_BG =
  "linear-gradient(180deg, #e8eef5 0%, #dfe7f0 42%, #d8e1eb 100%)";
const SHELL_BG =
  "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(244,248,252,0.96) 100%)";
const PANEL_BG =
  "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,249,252,0.98) 100%)";
const ACCENT_PANEL_BG =
  "linear-gradient(180deg, rgba(239,246,255,0.96) 0%, rgba(248,250,252,0.98) 100%)";
const SUCCESS_PANEL_BG =
  "linear-gradient(180deg, rgba(236,253,245,0.96) 0%, rgba(248,250,252,0.98) 100%)";
const STATUS_BAND_BG =
  "linear-gradient(135deg, #142235 0%, #1d334d 48%, #244463 100%)";

const SOFT_BORDER = "1px solid rgba(71,85,105,0.14)";
const PANEL_BORDER = "1px solid rgba(71,85,105,0.12)";

const TEXT_MAIN = "#0f172a";
const TEXT_SOFT = "#334155";
const TEXT_MUTED = "#64748b";

const BLUE = "#2563eb";
const BLUE_SOFT = "rgba(219,234,254,0.86)";

const EMERALD = "#059669";
const EMERALD_SOFT = "#d1fae5";

const AMBER = "#d97706";
const AMBER_SOFT = "#fef3c7";

const RED = "#dc2626";
const RED_SOFT = "#fee2e2";

function formatMoney(value: any) {
  if (value === null || value === undefined || value === "") return "—";
  const num = Number(value);
  // Escaping the $ to prevent Turbopack parsing errors
  if (!Number.isNaN(num)) return "$" + num.toFixed(2);
  return "$" + value;
}

function formatDateTime(value: any) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

function asArray<T = any>(value: any): T[] {
  return Array.isArray(value) ? value : [];
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
  const [releaseNotes, setReleaseNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setJob(null);
      setLoading(false);
      return;
    }

    const jobs = getJobs();
    const found =
      jobs.find((item: AnyJob) => String(item?.id) === String(id)) || null;

    setJob(found);
    setLoading(false);
  }, [id]);

  const vehicleLabel = useMemo(() => {
    if (!job?.vehicle) return "Vehicle record";
    const year = job.vehicle.year || "";
    const make = job.vehicle.make || "";
    const model = job.vehicle.model || "";
    return [year, make, model].filter(Boolean).join(" ") || "Vehicle record";
  }, [job]);

  const customerName = useMemo(() => {
    if (!job?.customer) return "Customer";
    const first = job.customer.firstName || "";
    const last = job.customer.lastName || "";
    const full = [first, last].filter(Boolean).join(" ").trim();
    return full || job.customer.name || "Customer";
  }, [job]);

  const concernText =
    job?.visit?.concern ||
    job?.concern ||
    "No concern was entered on this record.";

  const diagnosticsFee =
    job?.authorization?.diagnosticsFee ??
    job?.visit?.diagnosticsFee ??
    job?.intake?.diagnosticsFee ??
    null;

  const findingsList = useMemo(() => {
    if (!job?.findings) return [];
    if (Array.isArray(job.findings)) return job.findings;
    if (
      job.findings.notes ||
      job.findings.summary ||
      job.findings.title ||
      job.findings.finding
    ) {
      return [job.findings];
    }
    return [];
  }, [job]);

  const partsList = useMemo(() => {
    return [
      ...asArray(job?.estimate?.parts),
      ...asArray(job?.approval?.parts),
      ...asArray(job?.workOrder?.parts),
    ].filter(Boolean);
  }, [job]);

  const laborList = useMemo(() => {
    return [
      ...asArray(job?.estimate?.labor),
      ...asArray(job?.approval?.labor),
      ...asArray(job?.workOrder?.labor),
    ].filter(Boolean);
  }, [job]);

  const recommendedRepairs = useMemo(() => {
    return [
      ...asArray(job?.estimate?.recommendedRepairs),
      ...asArray(job?.approval?.recommendedRepairs),
      ...asArray(job?.workOrder?.recommendedRepairs),
    ].filter(Boolean);
  }, [job]);

  const totals = useMemo(() => {
    return {
      parts:
        job?.estimate?.partsTotal ??
        job?.approval?.partsTotal ??
        job?.workOrder?.partsTotal ??
        job?.totals?.parts ??
        null,
      labor:
        job?.estimate?.laborTotal ??
        job?.approval?.laborTotal ??
        job?.workOrder?.laborTotal ??
        job?.totals?.labor ??
        null,
      total:
        job?.estimate?.total ??
        job?.approval?.total ??
        job?.workOrder?.total ??
        job?.totals?.total ??
        job?.final?.total ??
        null,
    };
  }, [job]);

  const mileageIn = job?.vehicle?.mileageIn || job?.visit?.mileageIn || "—";
  const mileageOut =
    job?.final?.mileageOut ||
    job?.release?.mileageOut ||
    job?.vehicle?.mileageOut ||
    "—";

  const authStatus = job?.authorization?.authorizationStatus || "pending";
  const releaseStatus =
    job?.release?.releaseStatus || job?.final?.finalStatus || "awaiting_release";

  const handleSubmit = () => {
    if (!job) return;

    if (!releaseName.trim()) {
      setError("Please enter the customer's name to complete final release.");
      return;
    }

    const now = new Date().toISOString();
    const existingFinal = job.final || {};
    const existingRelease = job.release || {};

    const updated = {
      ...job,
      final: {
        ...existingFinal,
        finalStatus: "released",
        releasedAt: now,
        releasedByCustomerName: releaseName.trim(),
        releaseNotes: releaseNotes.trim(),
        releaseMethod: "digital_in_person",
        mileageOut:
          existingFinal.mileageOut ||
          existingRelease.mileageOut ||
          job?.vehicle?.mileageOut ||
          "",
      },
      release: {
        ...existingRelease,
        releaseStatus: "signed",
        signatureName: releaseName.trim(),
        signatureTimestamp: now,
        signatureMethod: "digital",
        notes: releaseNotes.trim(),
        mileageOut:
          existingRelease.mileageOut ||
          existingFinal.mileageOut ||
          job?.vehicle?.mileageOut ||
          "",
      },
    };

    updateJob(updated);
    setJob(updated);
    setSubmitted(true);
    setError("");
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={centerWrapStyle}>
          <div style={statusCardStyle}>
            <div style={miniBrandStyle}>ShopPROOF Final Record</div>
            <h2 style={statusTitleStyle}>Loading final release record...</h2>
            <p style={statusTextStyle}>
              Please wait while this vehicle record is prepared.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={pageStyle}>
        <div style={centerWrapStyle}>
          <div style={statusCardStyle}>
            <div style={invalidBadgeStyle}>Record unavailable</div>
            <h1 style={statusTitleStyle}>Final release record not found</h1>
            <p style={statusTextStyle}>
              This vehicle record could not be located. Please open the final
              page from a real ShopPROOF job record.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={pageStyle}>
        <div style={centerWrapStyle}>
          <div style={statusCardStyle}>
            <div style={successBadgeStyle}>Final release saved</div>
            <h1 style={statusTitleStyle}>Vehicle release recorded</h1>
            <p style={statusTextStyle}>
              The final release has been recorded to this ShopPROOF job.
            </p>

            <div style={summaryPanelStyle}>
              <div style={summaryRowStyle}>
                <span style={summaryLabelStyle}>Vehicle</span>
                <span style={summaryValueStyle}>{vehicleLabel}</span>
              </div>
              <div style={summaryRowStyle}>
                <span style={summaryLabelStyle}>Customer</span>
                <span style={summaryValueStyle}>{customerName}</span>
              </div>
              <div style={summaryRowStyle}>
                <span style={summaryLabelStyle}>Released by</span>
                <span style={summaryValueStyle}>{releaseName.trim()}</span>
              </div>
              <div style={summaryRowLastStyle}>
                <span style={summaryLabelStyle}>Recorded</span>
                <span style={summaryValueStyle}>
                  {formatDateTime(
                    job?.release?.signatureTimestamp || job?.final?.releasedAt
                  )}
                </span>
              </div>
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
            <div>
              <div style={miniBrandStyle}>ShopPROOF Final Record</div>
              <h1 style={pageTitleStyle}>Final Release & Vehicle Record</h1>
              <p style={pageIntroStyle}>
                Review the completed vehicle record and capture the customer acknowledgment.
              </p>
            </div>
            <div style={headerBadgeStyle}>Final release</div>
          </div>

          <div style={statusBandStyle}>
            <div style={statusBandItemStyle}>
              <div style={statusBandLabelStyle}>Stage</div>
              <div style={statusBandValueStyle}>Final Release</div>
            </div>
            <div style={statusBandItemStyle}>
              <div style={statusBandLabelStyle}>Authorization</div>
              <div style={statusBandValueStyle}>{cleanStatus(authStatus)}</div>
            </div>
            <div style={statusBandItemStyle}>
              <div style={statusBandLabelStyle}>Recorded Total</div>
              <div style={statusBandValueStyle}>{formatMoney(totals.total)}</div>
            </div>
            <div style={statusBandItemLastStyle}>
              <div style={statusBandLabelStyle}>Current State</div>
              <div style={statusBandValueStyle}>{cleanStatus(releaseStatus)}</div>
            </div>
          </div>

          <div style={layoutStyle}>
            <section style={mainColumnStyle}>
              <div style={documentCardStyle}>
                <div style={documentTopStyle}>
                  <div>
                    <div style={sectionEyebrowStyle}>Final vehicle record</div>
                    <h2 style={documentTitleStyle}>{vehicleLabel}</h2>
                  </div>
                  <div style={awaitingBadgeStyle}>Awaiting release</div>
                </div>

                <div style={infoGridStyle}>
                  <div style={infoCardStyle}>
                    <div style={infoLabelStyle}>Customer</div>
                    <div style={infoValueStyle}>{customerName}</div>
                  </div>
                  <div style={infoCardStyle}>
                    <div style={infoLabelStyle}>VIN</div>
                    <div style={infoMonoStyle}>{job?.vehicle?.vin || "—"}</div>
                  </div>
                </div>

                <div style={sectionPanelStyle}>
                  <div style={panelLabelStyle}>Customer Concern</div>
                  <div style={panelTextStyle}>{concernText}</div>
                </div>

                <div style={authorizationPanelStyle}>
                  <div style={panelLabelBlueStyle}>Authorization Summary</div>
                  <div style={legalTextStyle}>
                    Status: <strong>{cleanStatus(authStatus)}</strong>. Fee: <strong>{formatMoney(diagnosticsFee)}</strong>.
                  </div>
                </div>

                <div style={signaturePanelStyle}>
                  <label style={inputLabelStyle}>Customer Name</label>
                  <input
                    value={releaseName}
                    onChange={(e) => setReleaseName(e.target.value)}
                    placeholder="Enter customer name"
                    style={inputStyle}
                  />
                  {error && <div style={errorTextStyle}>{error}</div>}
                  <button onClick={handleSubmit} style={submitButtonStyle}>
                    Sign & Complete Final Release
                  </button>
                </div>
              </div>
            </section>

            <aside style={sideColumnStyle}>
              <div style={sideCardStyle}>
                <div style={sideSectionTitleStyle}>Record snapshot</div>
                <div style={snapshotRowLastStyle}>
                  <span style={snapshotLabelStyle}>Recorded Total</span>
                  <span style={snapshotValueStyle}>{formatMoney(totals.total)}</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

// STYLES
const pageStyle: CSSProperties = { minHeight: "100vh", background: PAGE_BG, color: TEXT_MAIN, fontFamily: 'Inter, sans-serif' };
const pageInnerStyle: CSSProperties = { width: "100%", maxWidth: 1280, margin: "0 auto", padding: "28px 20px" };
const shellStyle: CSSProperties = { borderRadius: 30, border: SOFT_BORDER, background: SHELL_BG, padding: 24 };
const centerWrapStyle: CSSProperties = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" };
const headerStyle: CSSProperties = { display: "flex", justifyContent: "space-between", marginBottom: 18 };
const miniBrandStyle: CSSProperties = { fontSize: 11, fontWeight: 800, color: BLUE, textTransform: "uppercase" };
const pageTitleStyle: CSSProperties = { fontSize: 34, fontWeight: 800, color: TEXT_MAIN };
const pageIntroStyle: CSSProperties = { fontSize: 14, color: TEXT_SOFT };
const headerBadgeStyle: CSSProperties = { padding: "10px 14px", borderRadius: 999, background: BLUE_SOFT, color: "#1d4ed8", fontSize: 12, fontWeight: 800 };
const statusBandStyle: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderRadius: 24, background: STATUS_BAND_BG, marginBottom: 18 };
const statusBandItemStyle: CSSProperties = { padding: 17, borderRight: "1px solid rgba(255,255,255,0.1)" };
const statusBandItemLastStyle: CSSProperties = { padding: 17 };
const statusBandLabelStyle: CSSProperties = { fontSize: 10, color: "rgba(255,255,255,0.7)", textTransform: "uppercase" };
const statusBandValueStyle: CSSProperties = { fontSize: 15, fontWeight: 800, color: "#fff" };
const layoutStyle: CSSProperties = { display: "grid", gridTemplateColumns: "1.7fr 340px", gap: 18 };
const mainColumnStyle: CSSProperties = { minWidth: 0 };
const sideColumnStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 16 };
const documentCardStyle: CSSProperties = { borderRadius: 26, background: PANEL_BG, padding: 22, border: PANEL_BORDER };
const sideCardStyle: CSSProperties = { borderRadius: 22, background: PANEL_BG, padding: 18, border: PANEL_BORDER };
const documentTopStyle: CSSProperties = { display: "flex", justifyContent: "space-between", marginBottom: 18 };
const sectionEyebrowStyle: CSSProperties = { fontSize: 11, color: TEXT_MUTED, textTransform: "uppercase" };
const documentTitleStyle: CSSProperties = { fontSize: 28, fontWeight: 800 };
const awaitingBadgeStyle: CSSProperties = { padding: "9px 12px", borderRadius: 999, background: AMBER_SOFT, color: AMBER, fontSize: 12, fontWeight: 800 };
const infoGridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 };
const infoCardStyle: CSSProperties = { borderRadius: 18, background: "#f8fafc", padding: 14, border: "1px solid rgba(0,0,0,0.05)" };
const infoLabelStyle: CSSProperties = { fontSize: 11, color: TEXT_MUTED, textTransform: "uppercase" };
const infoValueStyle: CSSProperties = { fontSize: 15, fontWeight: 700 };
const infoMonoStyle: CSSProperties = { fontSize: 14, fontFamily: "monospace" };
const sectionPanelStyle: CSSProperties = { marginBottom: 16, borderRadius: 20, background: "#f8fafc", padding: 16 };
const panelLabelStyle: CSSProperties = { fontSize: 11, color: TEXT_MUTED, textTransform: "uppercase" };
const panelLabelBlueStyle: CSSProperties = { fontSize: 11, color: BLUE, textTransform: "uppercase" };
const panelTextStyle: CSSProperties = { fontSize: 15, color: TEXT_SOFT };
const authorizationPanelStyle: CSSProperties = { marginBottom: 16, borderRadius: 22, background: ACCENT_PANEL_BG, padding: 18, border: "1px solid rgba(37,99,235,0.1)" };
const legalTextStyle: CSSProperties = { fontSize: 14, color: TEXT_SOFT };
const signaturePanelStyle: CSSProperties = { marginTop: 20 };
const inputLabelStyle: CSSProperties = { display: "block", fontSize: 12, marginBottom: 8, fontWeight: 700 };
const inputStyle: CSSProperties = { width: "100%", padding: 12, borderRadius: 10, border: "1px solid #cbd5e1", marginBottom: 12 };
const submitButtonStyle: CSSProperties = { width: "100%", padding: 14, borderRadius: 12, background: BLUE, color: "#fff", fontWeight: 800, border: "none", cursor: "pointer" };
const errorTextStyle: CSSProperties = { color: RED, fontSize: 13, marginBottom: 10 };
const statusCardStyle: CSSProperties = { background: "#fff", padding: 40, borderRadius: 30, textAlign: "center", maxWidth: 500 };
const statusTitleStyle: CSSProperties = { fontSize: 24, fontWeight: 800, margin: "10px 0" };
const statusTextStyle: CSSProperties = { color: TEXT_SOFT };
const successBadgeStyle: CSSProperties = { padding: "8px 16px", background: EMERALD_SOFT, color: EMERALD, borderRadius: 999, display: "inline-block", fontWeight: 800 };
const invalidBadgeStyle: CSSProperties = { padding: "8px 16px", background: RED_SOFT, color: RED, borderRadius: 999, display: "inline-block", fontWeight: 800 };
const summaryPanelStyle: CSSProperties = { marginTop: 20, textAlign: "left", background: "#f8fafc", padding: 20, borderRadius: 20 };
const summaryRowStyle: CSSProperties = { display: "flex", justifyContent: "space-between", paddingBottom: 10, marginBottom: 10, borderBottom: "1px solid #e2e8f0" };
const summaryRowLastStyle: CSSProperties = { display: "flex", justifyContent: "space-between" };
const summaryLabelStyle: CSSProperties = { color: TEXT_MUTED, fontSize: 13 };
const summaryValueStyle: CSSProperties = { fontWeight: 700 };
const snapshotRowLastStyle: CSSProperties = { display: "flex", justifyContent: "space-between" };
const snapshotLabelStyle: CSSProperties = { color: TEXT_MUTED };
const snapshotValueStyle: CSSProperties = { fontWeight: 800 };
const sideSectionTitleStyle: CSSProperties = { fontSize: 14, fontWeight: 800, marginBottom: 12 };
```