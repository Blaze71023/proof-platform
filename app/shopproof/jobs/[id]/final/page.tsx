"use client";

import { CSSProperties, useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CircleCheck as CheckCircle, LoaderCircle, Printer, Shield } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";

type AnyJob = Record<string, any>;

const THEME = {
  page: "linear-gradient(180deg, #e4ecf5 0%, #dce5ef 42%, #d5dfe9 100%)",
  shell: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,249,252,0.98) 100%)",
  statusBar: "linear-gradient(135deg, #101f34 0%, #162b47 48%, #1c3558 100%)",
  panel: "linear-gradient(180deg, rgba(248,251,255,0.98) 0%, rgba(241,246,252,0.98) 100%)",
  card: "linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(247,251,254,0.98) 100%)",
  text: "#0f1e30",
  textSoft: "#1e3048",
  textMuted: "#5c7a96",
  textDim: "#8099b0",
  textOnDark: "#f0f6fc",
  textOnDarkMuted: "rgba(210,228,245,0.70)",
  shellBorder: "1px solid rgba(69,94,118,0.18)",
  panelBorder: "1px solid rgba(84,108,131,0.14)",
  cardBorder: "1px solid rgba(92,116,140,0.12)",
  shellShadow: "0 28px 70px rgba(20,35,55,0.14)",
  panelShadow: "0 14px 30px rgba(20,35,55,0.08)",
  cardShadow: "0 8px 20px rgba(20,35,55,0.05)",
  blue: "#1a5cbf",
  blueStrong: "#1547a3",
  blueSoft: "rgba(26,92,191,0.09)",
  blueLine: "rgba(26,92,191,0.24)",
  emerald: "#087a5c",
  emeraldSoft: "rgba(8,122,92,0.09)",
  emeraldLine: "rgba(8,122,92,0.20)",
  buttonBlue: "linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)",
  line: "rgba(28,47,67,0.10)",
};

export default function FinalReleasePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [rawJob, setRawJob] = useState<AnyJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [releaseName, setReleaseName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [width, setWidth] = useState(1440);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = width < 820;

  const loadJob = useCallback(async () => {
    if (!id) { setLoading(false); return; }

    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data, error: qErr } = await supabase
          .from("jobs")
          .select(`
            *,
            customer:customers!jobs_customer_id_fkey(id, name, phone, email),
            vehicle:vehicles!jobs_vehicle_id_fkey(id, vin, year, make, model, mileage_in, plate)
          `)
          .eq("id", id)
          .maybeSingle();

        if (!qErr && data) {
          setRawJob(data);
          if (data.release_signed_by) {
            setReleaseName(data.release_signed_by);
            setSubmitted(true);
          }
          setLoading(false);
          return;
        }
      } catch {
        // fall through
      }
    }

    // Local fallback
    try {
      const raw = localStorage.getItem("shopproof_jobs");
      const jobs = raw ? JSON.parse(raw) : [];
      const found = jobs.find((j: AnyJob) => String(j?.id) === String(id)) || null;
      setRawJob(found);
      if (found?.final?.releasedByCustomerName || found?.release_signed_by) {
        setReleaseName(found?.release_signed_by || found?.final?.releasedByCustomerName || "");
        setSubmitted(true);
      }
    } catch {
      setRawJob(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadJob(); }, [loadJob]);

  const job = useMemo(() => rawJob ? normalizeJob(rawJob) : null, [rawJob]);

  async function handleRelease() {
    if (!releaseName.trim()) {
      setError("Customer name is required to complete the final release.");
      return;
    }

    setSubmitting(true);
    setError("");
    const now = new Date().toISOString();

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from("jobs")
          .update({
            release_signed_by: releaseName.trim(),
            release_signed_at: now,
            status: "Completed",
            updated_at: now,
          })
          .eq("id", id);
      } catch {
        // ignore
      }
    }

    // Local update
    try {
      const raw = localStorage.getItem("shopproof_jobs");
      const jobs = raw ? JSON.parse(raw) : [];
      const updated = jobs.map((j: AnyJob) =>
        String(j?.id) === String(id)
          ? {
              ...j,
              release_signed_by: releaseName.trim(),
              release_signed_at: now,
              status: "Completed",
              updated_at: now,
              final: {
                ...(j.final || {}),
                finalStatus: "released",
                releasedAt: now,
                releasedByCustomerName: releaseName.trim(),
              },
            }
          : j
      );
      localStorage.setItem("shopproof_jobs", JSON.stringify(updated));
    } catch {
      // ignore
    }

    setSubmitting(false);
    setSubmitted(true);
  }

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={centerStyle}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, color: THEME.textMuted, fontWeight: 800, fontSize: 14 }}>
            <LoaderCircle size={17} className="spin" />
            Loading release record...
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={pageStyle}>
        <div style={centerStyle}>
          <div style={noticeCardStyle}>
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 8, color: THEME.text }}>Record not found</div>
            <p style={{ fontSize: 13, color: THEME.textMuted, marginBottom: 16, lineHeight: 1.5 }}>
              Open this page from a real job record or return to the dashboard.
            </p>
            <button type="button" onClick={() => router.push("/shopproof/dashboard")} style={backActionStyle}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={pageStyle}>
        <div style={centerStyle}>
          <div style={noticeCardStyle}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 999,
                background: THEME.emeraldSoft,
                border: `1px solid ${THEME.emeraldLine}`,
                color: THEME.emerald,
                fontSize: 12,
                fontWeight: 900,
                padding: "7px 12px",
                marginBottom: 16,
              }}
            >
              <CheckCircle size={14} />
              Final Release Recorded
            </div>
            <div style={{ fontWeight: 950, fontSize: 20, letterSpacing: "-0.04em", marginBottom: 8, color: THEME.text }}>
              Vehicle released to {releaseName}
            </div>
            <p style={{ fontSize: 13, color: THEME.textMuted, marginBottom: 16, lineHeight: 1.5 }}>
              The final release has been recorded on this job. The record is now marked as Completed.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" onClick={() => router.push(`/shopproof/jobs/${id}`)} style={backActionStyle}>
                View Job Record
              </button>
              <button type="button" onClick={() => window.print()} style={backActionStyle}>
                Print Release
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* Top actions */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 20,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            onClick={() => router.push(`/shopproof/jobs/${id}`)}
            style={topActionStyle}
          >
            <ArrowLeft size={14} />
            Back to Job
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            style={topActionStyle}
          >
            <Printer size={14} />
            Print / Save PDF
          </button>
          <div style={{ flex: 1 }} />
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 999,
              border: `1px solid ${THEME.blueLine}`,
              background: THEME.blueSoft,
              color: THEME.blueStrong,
              padding: "8px 12px",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            <Shield size={13} />
            ShopPROOF Final Release
          </div>
        </div>

        <div
          style={{
            borderRadius: 28,
            border: THEME.shellBorder,
            background: THEME.shell,
            boxShadow: THEME.shellShadow,
            overflow: "hidden",
          }}
        >
          {/* Document header */}
          <div
            style={{
              padding: isMobile ? "20px 16px" : "28px 32px 24px",
              borderBottom: `1px solid ${THEME.line}`,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: THEME.blueStrong, marginBottom: 8 }}>
              Final Release Documentation
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: isMobile ? 28 : 36,
                fontWeight: 950,
                letterSpacing: "-0.04em",
                color: THEME.text,
                lineHeight: 1.08,
              }}
            >
              {job.vehicleLabel}
            </h1>
            <p style={{ margin: "8px 0 0", fontSize: 14, color: THEME.textMuted, lineHeight: 1.5 }}>
              {job.customerName} • {job.customerPhone}
            </p>
          </div>

          {/* Status band */}
          <div
            style={{
              background: THEME.statusBar,
              padding: isMobile ? "14px 16px" : "16px 32px",
              display: "grid",
              gridTemplateColumns: `repeat(${isMobile ? 2 : 4}, minmax(0, 1fr))`,
              gap: 12,
            }}
          >
            {[
              { label: "Vehicle", value: job.vehicleLabel },
              { label: "Customer", value: job.customerName },
              { label: "Current Status", value: job.status },
              { label: "Created", value: formatDate(job.createdAt) },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: "4px 8px" }}>
                <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.10em", textTransform: "uppercase", color: THEME.textOnDarkMuted }}>
                  {label}
                </div>
                <div style={{ marginTop: 5, fontSize: 13, fontWeight: 900, color: THEME.textOnDark, lineHeight: 1.2 }}>
                  {value || "—"}
                </div>
              </div>
            ))}
          </div>

          {/* Document body */}
          <div style={{ padding: isMobile ? "16px" : "28px 32px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 14,
                marginBottom: 20,
              }}
            >
              {[
                { label: "Vehicle Identification Number (VIN)", value: job.vin, mono: true },
                { label: "License Plate", value: job.plate },
                { label: "Mileage In", value: job.mileageIn },
                { label: "Color", value: job.vehicleColor },
                { label: "Phone", value: job.customerPhone },
                { label: "Email", value: job.customerEmail },
              ].map(({ label, value, mono }) => (
                <div
                  key={label}
                  style={{
                    borderRadius: 16,
                    border: THEME.cardBorder,
                    background: THEME.card,
                    padding: "12px 14px",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.10em", textTransform: "uppercase", color: THEME.textMuted, marginBottom: 5 }}>
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: THEME.textSoft,
                      wordBreak: "break-all",
                      fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : undefined,
                    }}
                  >
                    {value || "—"}
                  </div>
                </div>
              ))}
            </div>

            {/* Customer concern */}
            <div
              style={{
                borderRadius: 18,
                border: THEME.panelBorder,
                background: THEME.panel,
                padding: "14px 16px",
                marginBottom: 14,
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.10em", textTransform: "uppercase", color: THEME.textMuted, marginBottom: 8 }}>
                Customer Concern
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.65, color: THEME.textSoft }}>
                {job.concern || "—"}
              </div>
            </div>

            {/* Work summary */}
            {(job.findings || job.workPerformed) && (
              <div
                style={{
                  borderRadius: 18,
                  border: THEME.panelBorder,
                  background: THEME.panel,
                  padding: "14px 16px",
                  marginBottom: 14,
                  display: "grid",
                  gap: 12,
                }}
              >
                {job.findings && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.10em", textTransform: "uppercase", color: THEME.textMuted, marginBottom: 6 }}>
                      Technician Findings
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.65, color: THEME.textSoft, whiteSpace: "pre-wrap" }}>
                      {job.findings}
                    </div>
                  </div>
                )}
                {job.workPerformed && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.10em", textTransform: "uppercase", color: THEME.textMuted, marginBottom: 6 }}>
                      Work Performed
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.65, color: THEME.textSoft, whiteSpace: "pre-wrap" }}>
                      {job.workPerformed}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Authorization statement */}
            <div
              style={{
                borderRadius: 18,
                border: `1px solid ${THEME.blueLine}`,
                background: THEME.blueSoft,
                padding: "16px 18px",
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: THEME.blue, marginBottom: 10 }}>
                Release Authorization Statement
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.78, color: THEME.textSoft }}>
                I acknowledge that I am receiving the vehicle described in this record and accept its
                condition as documented herein. I confirm that the work described above has been reviewed
                and I am authorizing the release of this vehicle from the shop's care and custody.
                By signing below, I confirm that the vehicle has been returned to my possession.
              </p>
            </div>

            {/* Signature area */}
            <div
              style={{
                borderRadius: 20,
                border: THEME.panelBorder,
                background: THEME.panel,
                padding: "18px",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: THEME.textSoft, marginBottom: 10 }}>
                Customer Signature — Full Name
              </div>

              <input
                value={releaseName}
                onChange={(e) => { setReleaseName(e.target.value); setError(""); }}
                placeholder="Customer prints / signs their full name"
                style={{
                  width: "100%",
                  height: 54,
                  borderRadius: 14,
                  border: "1px solid rgba(84,108,131,0.24)",
                  background: "#ffffff",
                  color: THEME.text,
                  fontSize: 16,
                  fontWeight: 800,
                  padding: "0 16px",
                  boxSizing: "border-box",
                  outline: "none",
                  marginBottom: 12,
                  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
                }}
              />

              {error ? (
                <div
                  style={{
                    marginBottom: 12,
                    borderRadius: 12,
                    border: "1px solid rgba(220,38,38,0.24)",
                    background: "rgba(220,38,38,0.08)",
                    color: "#dc2626",
                    fontSize: 13,
                    fontWeight: 800,
                    padding: "9px 12px",
                  }}
                >
                  {error}
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleRelease}
                disabled={submitting || !releaseName.trim()}
                style={{
                  width: "100%",
                  height: 54,
                  borderRadius: 14,
                  border: "1px solid rgba(29,78,216,0.36)",
                  background: THEME.buttonBlue,
                  color: "#ffffff",
                  fontSize: 15,
                  fontWeight: 950,
                  cursor: submitting || !releaseName.trim() ? "not-allowed" : "pointer",
                  opacity: submitting || !releaseName.trim() ? 0.60 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  boxShadow: "0 14px 32px rgba(37,99,235,0.22)",
                }}
              >
                {submitting ? (
                  <><LoaderCircle size={17} className="spin" /> Recording Release...</>
                ) : (
                  <><CheckCircle size={17} /> Complete Final Release</>
                )}
              </button>

              <p style={{ margin: "12px 0 0", fontSize: 12, color: THEME.textDim, lineHeight: 1.65, fontWeight: 700 }}>
                The customer's printed name serves as their signature acknowledgment. Date and time will
                be automatically recorded with this release.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .spin {
          animation: spin 1s linear infinite;
          display: inline-block;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input::placeholder {
          color: ${THEME.textDim};
          font-weight: 600;
        }
        input {
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
        }
        @media print {
          button { display: none !important; }
          input { pointer-events: none; }
        }
      `}</style>
    </div>
  );
}

function normalizeJob(job: AnyJob) {
  const vehicle = job?.vehicle || job?.vehicles || {};
  const customer = job?.customer || job?.customers || {};

  const year = fne(vehicle?.year, job?.vehicle_year);
  const make = fne(vehicle?.make, job?.vehicle_make);
  const model = fne(vehicle?.model, job?.vehicle_model);

  return {
    status: sv(job?.status || "—"),
    vehicleLabel: [year, make, model].filter(Boolean).join(" ") || "Vehicle record",
    vin: fne(vehicle?.vin, job?.vin),
    plate: fne(vehicle?.plate, job?.plate, job?.vehicle_plate),
    vehicleColor: fne(vehicle?.color, job?.color, job?.vehicle_color),
    mileageIn: fne(vehicle?.mileage_in, vehicle?.mileageIn, job?.mileage_in, job?.mileageIn),
    customerName: fne(job?.customer_name, job?.customerName, customer?.name),
    customerPhone: fne(job?.customer_phone, job?.customerPhone, customer?.phone),
    customerEmail: fne(job?.customer_email, job?.customerEmail, customer?.email),
    concern: fne(job?.concern, job?.customerConcern),
    findings: sv(job?.findings || job?.work?.findings || ""),
    workPerformed: sv(job?.work_performed || job?.workPerformed || job?.work?.workPerformed || ""),
    createdAt: sv(job?.created_at || job?.createdAt || "") || null,
  };
}

function sv(value: unknown) {
  if (value == null) return "";
  return String(value).trim();
}

function fne(...values: unknown[]) {
  for (const v of values) {
    const c = sv(v);
    if (c && c !== "N/A") return c;
  }
  return "";
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  backgroundImage: THEME.page,
  color: THEME.text,
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  padding: 20,
};

const containerStyle: CSSProperties = {
  maxWidth: 900,
  margin: "0 auto",
};

const centerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "80vh",
};

const noticeCardStyle: CSSProperties = {
  width: "min(560px, 100%)",
  borderRadius: 24,
  border: "1px solid rgba(69,94,118,0.16)",
  background: "rgba(255,255,255,0.94)",
  padding: "22px 24px",
  boxShadow: "0 20px 50px rgba(15,30,50,0.10)",
};

const topActionStyle: CSSProperties = {
  height: 38,
  borderRadius: 12,
  border: "1px solid rgba(69,94,118,0.18)",
  background: "rgba(255,255,255,0.86)",
  color: THEME.textSoft,
  padding: "0 13px",
  fontSize: 13,
  fontWeight: 900,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
};

const backActionStyle: CSSProperties = {
  height: 40,
  borderRadius: 12,
  border: "1px solid rgba(69,94,118,0.18)",
  background: "rgba(255,255,255,0.86)",
  color: THEME.textSoft,
  padding: "0 14px",
  fontSize: 13,
  fontWeight: 900,
  cursor: "pointer",
};
