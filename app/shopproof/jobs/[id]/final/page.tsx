"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getJobs, updateJob } from "@/lib/shopproof";

type AnyJob = any;

type FinalView = {
  customerName: string;
  customerPhone: string;
  vehicleLabel: string;
  vin: string;
  mileageIn: string;
  concern: string;
  notes: string;
  total: any;
  createdAt: any;
  status: string;
  releasedAt: any;
  releasedByCustomerName: string;
};

const PAGE_BG = "linear-gradient(180deg, #e8eef5 0%, #dfe7f0 42%, #d8e1eb 100%)";
const PANEL_BG = "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,249,252,0.98) 100%)";
const STATUS_BAND_BG = "linear-gradient(135deg, #142235 0%, #1d334d 48%, #244463 100%)";

const TEXT_MAIN = "#0f172a";
const TEXT_SOFT = "#334155";
const TEXT_MUTED = "#64748b";

const JOB_STORAGE_KEY = "shopproof_jobs";

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

function cleanText(value: any) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function firstNonEmpty(...values: any[]) {
  for (const value of values) {
    const cleaned = cleanText(value);
    if (cleaned) return cleaned;
  }
  return "";
}

function getVehicle(job: AnyJob) {
  return job?.vehicles || job?.vehicle || job?.Vehicle || {};
}

function getCustomer(job: AnyJob) {
  return job?.customer || job?.customers || job?.Customer || {};
}

function normalizeFinalView(job: AnyJob): FinalView {
  const vehicle = getVehicle(job);
  const customer = getCustomer(job);

  const customerName = firstNonEmpty(
    job?.customer_name,
    job?.customerName,
    customer?.name,
    [customer?.firstName, customer?.lastName].filter(Boolean).join(" "),
    [customer?.first_name, customer?.last_name].filter(Boolean).join(" "),
    vehicle?.customer_name,
    "Customer"
  );

  const customerPhone = firstNonEmpty(
    job?.customer_phone,
    job?.customerPhone,
    customer?.phone,
    vehicle?.customer_phone,
    "No Phone"
  );

  const year = firstNonEmpty(vehicle?.year, job?.year);
  const make = firstNonEmpty(vehicle?.make, job?.make);
  const model = firstNonEmpty(vehicle?.model, job?.model);
  const vehicleLabel = firstNonEmpty(
    [year, make, model].filter(Boolean).join(" "),
    job?.vehicle_label,
    job?.vehicleLabel,
    "Vehicle record"
  );

  return {
    customerName,
    customerPhone,
    vehicleLabel,
    vin: firstNonEmpty(vehicle?.vin, job?.vin, "No VIN Recorded"),
    mileageIn: firstNonEmpty(vehicle?.mileage_in, vehicle?.mileageIn, job?.mileage_in, job?.mileageIn, "—"),
    concern: firstNonEmpty(job?.concern, job?.customer_concern, job?.customerConcern, "—"),
    notes: firstNonEmpty(job?.notes, job?.intake_notes, job?.intakeNotes, "—"),
    total: job?.totals?.total ?? job?.estimate?.total ?? job?.total ?? job?.estimate_total ?? null,
    createdAt: job?.created_at ?? job?.createdAt ?? job?.created ?? null,
    status: firstNonEmpty(job?.status, "—"),
    releasedAt: job?.final?.releasedAt ?? job?.final?.released_at ?? null,
    releasedByCustomerName: firstNonEmpty(
      job?.final?.releasedByCustomerName,
      job?.final?.released_by_customer_name,
      ""
    ),
  };
}

function readLocalJobs(): AnyJob[] {
  try {
    const raw = window.localStorage.getItem(JOB_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Final page local job read failed:", error);
    return [];
  }
}

function persistUpdatedJob(updated: AnyJob) {
  try {
    updateJob(updated);
  } catch (error) {
    console.warn("Primary job update failed; attempting local fallback update.", error);
  }

  try {
    const existing = readLocalJobs();
    const next = existing.map((item) =>
      String(item?.id) === String(updated?.id) ? updated : item
    );

    if (!next.some((item) => String(item?.id) === String(updated?.id))) {
      next.unshift(updated);
    }

    window.localStorage.setItem(JOB_STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.warn("Final page local fallback update failed:", error);
  }
}

export default function FinalPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [job, setJob] = useState<AnyJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [releaseName, setReleaseName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      const jobsFromStore = getJobs();
      const localJobs = readLocalJobs();
      const allJobs = Array.isArray(jobsFromStore)
        ? [...jobsFromStore, ...localJobs]
        : localJobs;

      const found = allJobs.find((item: AnyJob) => String(item?.id) === String(id));
      setJob(found || null);

      const existingReleaseName = firstNonEmpty(
        found?.final?.releasedByCustomerName,
        found?.final?.released_by_customer_name
      );

      if (existingReleaseName) {
        setReleaseName(existingReleaseName);
      }
    } catch (error) {
      console.warn("Final page load failed:", error);
      const found = readLocalJobs().find((item) => String(item?.id) === String(id));
      setJob(found || null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const view = useMemo(() => (job ? normalizeFinalView(job) : null), [job]);

  const handleSubmit = () => {
    if (!job || !releaseName.trim()) return;

    const now = new Date().toISOString();
    const updated = {
      ...job,
      status: job.status || "Completed",
      updated_at: now,
      updatedAt: now,
      final: {
        ...job.final,
        finalStatus: "released",
        final_status: "released",
        releasedAt: now,
        released_at: now,
        releasedByCustomerName: releaseName.trim(),
        released_by_customer_name: releaseName.trim(),
      },
    };

    persistUpdatedJob(updated);
    setJob(updated);
    setSubmitted(true);
  };

  if (loading) return <div style={centerStyle}>Loading...</div>;

  if (!job || !view) {
    return (
      <div style={centerStyle}>
        <div style={noticeBox}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Record not found</div>
          <div style={{ marginBottom: 14 }}>
            Open this page from a real job record or return to the dashboard to select the correct vehicle.
          </div>
          <button type="button" onClick={() => router.push("/shopproof/dashboard")} style={secondaryButtonStyle}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={centerStyle}>
        <div style={noticeBox}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Final release recorded</div>
          <div style={{ marginBottom: 14 }}>
            Final release recorded for {view.customerName}.
          </div>
          <button type="button" onClick={() => router.push(`/shopproof/jobs/${id}`)} style={secondaryButtonStyle}>
            Back to Job Detail
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={topActionsStyle}>
          <button type="button" onClick={() => router.push(`/shopproof/jobs/${id}`)} style={secondaryButtonStyle}>
            ← Back to Job
          </button>
          <button type="button" onClick={() => window.print()} style={secondaryButtonStyle}>
            Print / Save PDF
          </button>
        </div>

        <h1 style={titleStyle}>Final Release</h1>

        <div style={statusBandStyle}>
          <div style={statusItem}>
            <div style={statusLabel}>Vehicle</div>
            <div style={statusValue}>{view.vehicleLabel}</div>
          </div>
          <div style={statusItem}>
            <div style={statusLabel}>Customer</div>
            <div style={statusValue}>{view.customerName}</div>
          </div>
          <div style={statusItem}>
            <div style={statusLabel}>Total</div>
            <div style={statusValue}>{formatMoney(view.total)}</div>
          </div>
          <div style={statusItem}>
            <div style={statusLabel}>Created</div>
            <div style={statusValue}>{formatDateTime(view.createdAt)}</div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={sectionStyle}>
            <div style={sectionLabelStyle}>Vehicle Identification Number</div>
            <div style={vinStyle}>{view.vin}</div>
          </div>

          <div style={infoGridStyle}>
            <InfoBlock label="Phone" value={view.customerPhone} />
            <InfoBlock label="Mileage In" value={view.mileageIn} />
            <InfoBlock label="Current Status" value={view.status} />
            <InfoBlock label="Released At" value={formatDateTime(view.releasedAt)} />
          </div>

          <div style={sectionStyle}>
            <div style={sectionLabelStyle}>Customer Concern</div>
            <div style={bodyTextStyle}>{view.concern}</div>
          </div>

          <div style={sectionStyle}>
            <div style={sectionLabelStyle}>Intake / Record Notes</div>
            <pre style={notesStyle}>{view.notes}</pre>
          </div>

          <p style={textStyle}>
            I acknowledge that I am receiving the vehicle and accept its condition as documented in this ShopPROOF record.
          </p>

          <input
            value={releaseName}
            onChange={(event) => setReleaseName(event.target.value)}
            placeholder="Sign your name"
            style={inputStyle}
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!releaseName.trim()}
            style={{
              ...buttonStyle,
              opacity: releaseName.trim() ? 1 : 0.58,
              cursor: releaseName.trim() ? "pointer" : "not-allowed",
            }}
          >
            Complete Final Release
          </button>
        </div>
      </div>

      <style jsx>{`
        @media print {
          button,
          input {
            display: none !important;
          }

          div {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div style={infoBlockStyle}>
      <div style={sectionLabelStyle}>{label}</div>
      <div style={infoValueStyle}>{value || "—"}</div>
    </div>
  );
}

/* STYLES */
const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: PAGE_BG,
  padding: 20,
  fontFamily: "Inter, sans-serif",
};

const containerStyle: CSSProperties = {
  maxWidth: 900,
  margin: "0 auto",
};

const topActionsStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 16,
  flexWrap: "wrap",
};

const titleStyle: CSSProperties = {
  fontSize: 32,
  marginBottom: 20,
  color: TEXT_MAIN,
  fontWeight: 800,
};

const statusBandStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  background: STATUS_BAND_BG,
  borderRadius: 12,
  padding: 16,
  marginBottom: 20,
  color: "white",
  gap: 8,
};

const statusItem: CSSProperties = {
  textAlign: "left",
  padding: "0 10px",
  minWidth: 0,
};

const statusLabel: CSSProperties = {
  fontSize: 10,
  opacity: 0.7,
  textTransform: "uppercase",
  marginBottom: 4,
  letterSpacing: 1,
};

const statusValue: CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  overflowWrap: "anywhere",
};

const cardStyle: CSSProperties = {
  background: PANEL_BG,
  padding: 30,
  borderRadius: 16,
  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
  border: "1px solid rgba(148,163,184,0.28)",
};

const sectionStyle: CSSProperties = {
  marginBottom: 20,
  paddingBottom: 15,
  borderBottom: "1px solid #e2e8f0",
};

const sectionLabelStyle: CSSProperties = {
  fontSize: 10,
  color: TEXT_MUTED,
  textTransform: "uppercase",
  letterSpacing: 1,
  fontWeight: 800,
};

const vinStyle: CSSProperties = {
  fontSize: 18,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontWeight: 700,
  color: "#1e293b",
  marginTop: 4,
  overflowWrap: "anywhere",
};

const infoGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
  marginBottom: 20,
};

const infoBlockStyle: CSSProperties = {
  border: "1px solid rgba(148,163,184,0.32)",
  background: "rgba(255,255,255,0.72)",
  borderRadius: 12,
  padding: 12,
};

const infoValueStyle: CSSProperties = {
  marginTop: 5,
  color: TEXT_SOFT,
  fontSize: 14,
  fontWeight: 700,
  overflowWrap: "anywhere",
};

const bodyTextStyle: CSSProperties = {
  marginTop: 6,
  color: TEXT_SOFT,
  lineHeight: 1.5,
  fontSize: 14,
};

const notesStyle: CSSProperties = {
  marginTop: 8,
  whiteSpace: "pre-wrap",
  background: "rgba(241,245,249,0.92)",
  border: "1px solid rgba(148,163,184,0.28)",
  padding: 12,
  borderRadius: 10,
  color: TEXT_SOFT,
  lineHeight: 1.5,
  fontSize: 13,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
};

const textStyle: CSSProperties = {
  marginBottom: 20,
  color: TEXT_SOFT,
  lineHeight: 1.5,
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: 14,
  marginBottom: 16,
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  fontSize: 16,
};

const buttonStyle: CSSProperties = {
  width: "100%",
  padding: 16,
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 16,
};

const secondaryButtonStyle: CSSProperties = {
  padding: "10px 14px",
  background: "rgba(255,255,255,0.84)",
  color: TEXT_MAIN,
  border: "1px solid rgba(148,163,184,0.38)",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 800,
  fontSize: 13,
};

const noticeBox: CSSProperties = {
  width: "min(560px, calc(100vw - 32px))",
  borderRadius: 16,
  border: "1px solid rgba(28,47,67,0.12)",
  background: "rgba(255,255,255,0.88)",
  padding: "18px 20px",
  fontSize: 13,
  lineHeight: 1.5,
  color: "#1f2a37",
  boxShadow: "0 16px 40px rgba(15,23,42,0.10)",
};

const centerStyle: CSSProperties = {
  minHeight: "100vh",
  background: PAGE_BG,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: TEXT_MAIN,
  fontWeight: 600,
  padding: 20,
};
