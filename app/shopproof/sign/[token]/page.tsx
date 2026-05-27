"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CircleCheck as CheckCircle, Clock, LoaderCircle, Shield } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";

type AnyJob = Record<string, any>;

const THEME = {
  page: "linear-gradient(180deg, #e8eef6 0%, #dfe7f1 42%, #d8e0eb 100%)",
  shell: "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(244,248,252,0.96) 100%)",
  panel: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,249,252,0.98) 100%)",
  accent: "linear-gradient(180deg, rgba(239,246,255,0.96) 0%, rgba(248,250,252,0.98) 100%)",
  text: "#0f172a",
  textSoft: "#334155",
  textMuted: "#64748b",
  textDim: "#94a3b8",
  shellBorder: "1px solid rgba(71,85,105,0.14)",
  panelBorder: "1px solid rgba(71,85,105,0.12)",
  cardBorder: "1px solid rgba(71,85,105,0.10)",
  shellShadow: "0 24px 60px rgba(15,23,42,0.10)",
  panelShadow: "0 18px 40px rgba(15,23,42,0.08)",
  blue: "#2563eb",
  blueStrong: "#1d4ed8",
  blueSoft: "rgba(37,99,235,0.09)",
  blueLine: "rgba(37,99,235,0.16)",
  emerald: "#059669",
  emeraldSoft: "rgba(5,150,105,0.09)",
  emeraldLine: "rgba(5,150,105,0.18)",
  amber: "#d97706",
  amberSoft: "rgba(217,119,6,0.09)",
  amberLine: "rgba(217,119,6,0.18)",
  red: "#dc2626",
  redSoft: "rgba(220,38,38,0.09)",
  redLine: "rgba(220,38,38,0.18)",
  buttonBlue: "linear-gradient(180deg, rgba(37,99,235,0.96) 0%, rgba(29,78,216,0.96) 100%)",
};

export default function CustomerSignPage() {
  const params = useParams();
  const token = params?.token as string;

  const [job, setJob] = useState<AnyJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
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

  useEffect(() => {
    if (!token) { setLoading(false); return; }

    async function findJob() {
      const supabase = getSupabaseClient();

      if (supabase) {
        try {
          const { data, error: qErr } = await supabase
            .from("jobs")
            .select(`
              *,
              customer:customers!jobs_customer_id_fkey(id, name, phone),
              vehicle:vehicles!jobs_vehicle_id_fkey(id, vin, year, make, model, mileage_in)
            `)
            .eq("approval_token", token)
            .maybeSingle();

          if (!qErr && data) {
            setJob(data);
            if (data.approval_signed_by) {
              setName(data.approval_signed_by);
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
        const found = jobs.find((j: AnyJob) =>
          j?.authorization?.token === token ||
          j?.approval_token === token
        ) || null;
        setJob(found);
        if (found?.approval_signed_by || found?.authorization?.signatureName) {
          setName(found.approval_signed_by || found.authorization.signatureName || "");
          setSubmitted(true);
        }
      } catch {
        setJob(null);
      } finally {
        setLoading(false);
      }
    }

    findJob();
  }, [token]);

  const vehicleLabel = useMemo(() => {
    if (!job) return "Vehicle record";
    const v = job?.vehicle || job?.vehicles || job?.vehicle || {};
    const year = v?.year || job?.vehicle_year || "";
    const make = v?.make || job?.vehicle_make || "";
    const model = v?.model || job?.vehicle_model || "";
    return [year, make, model].filter(Boolean).join(" ") || "Vehicle record";
  }, [job]);

  const customerName = useMemo(() => {
    if (!job) return "Customer";
    const c = job?.customer || job?.customers || {};
    return c?.name || job?.customer_name || "Customer";
  }, [job]);

  const vehicleVin = useMemo(() => {
    const v = job?.vehicle || job?.vehicles || {};
    return v?.vin || job?.vin || "—";
  }, [job]);

  const mileageIn = useMemo(() => {
    const v = job?.vehicle || job?.vehicles || {};
    return v?.mileage_in || v?.mileageIn || job?.mileage_in || "—";
  }, [job]);

  const diagnosticFee = useMemo(() => {
    return job?.diagnostic_fee || job?.diagnosticFee || job?.authorization?.diagnosticsFee || null;
  }, [job]);

  const concern = useMemo(() => {
    return job?.concern || job?.visit?.concern || "No concern entered.";
  }, [job]);

  async function handleSubmit() {
    if (!name.trim()) {
      setError("Please enter your name to authorize.");
      return;
    }

    setSubmitting(true);
    setError("");

    const now = new Date().toISOString();

    const supabase = getSupabaseClient();
    if (supabase && job?.id) {
      try {
        await supabase
          .from("jobs")
          .update({
            approval_state: "approved",
            approval_signed_by: name.trim(),
            approval_signed_at: now,
            approval_method: "digital",
            updated_at: now,
          })
          .eq("id", job.id);
      } catch {
        // ignore
      }
    }

    // Local update
    try {
      const raw = localStorage.getItem("shopproof_jobs");
      const jobs = raw ? JSON.parse(raw) : [];
      const updated = jobs.map((j: AnyJob) => {
        const match = String(j?.id) === String(job?.id) ||
          j?.authorization?.token === token ||
          j?.approval_token === token;
        if (!match) return j;
        return {
          ...j,
          approval_state: "approved",
          approval_signed_by: name.trim(),
          approval_signed_at: now,
          approval_method: "digital",
          updated_at: now,
          authorization: {
            ...(j.authorization || {}),
            authorizationStatus: "signed_remote",
            signatureName: name.trim(),
            signatureTimestamp: now,
            signatureMethod: "digital",
          },
        };
      });
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
          <div style={statusCardStyle}>
            <div style={miniBrandStyle}>ShopPROOF Authorization</div>
            <h2 style={statusTitleStyle}>Verifying authorization request...</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: THEME.textMuted, fontSize: 13, fontWeight: 700 }}>
              <LoaderCircle size={16} className="spin" />
              Please wait...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={pageStyle}>
        <div style={centerStyle}>
          <div style={statusCardStyle}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                borderRadius: 999,
                background: THEME.redSoft,
                border: `1px solid ${THEME.redLine}`,
                color: THEME.red,
                fontSize: 12,
                fontWeight: 900,
                padding: "7px 12px",
                marginBottom: 16,
              }}
            >
              Link unavailable
            </div>
            <h1 style={statusTitleStyle}>Invalid or expired link</h1>
            <p style={statusTextStyle}>
              This request may have already been completed, or the link may no longer be active.
              Please contact the shop directly if you need to sign an authorization.
            </p>
            <div
              style={{
                marginTop: 18,
                borderRadius: 18,
                border: THEME.cardBorder,
                background: "rgba(248,250,252,0.98)",
                padding: "14px 16px",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.10em", textTransform: "uppercase", color: THEME.textSoft, marginBottom: 8 }}>
                Need help?
              </div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: THEME.textSoft }}>
                Reach out to the shop that sent you this link and ask them to resend the authorization request
                or assist you in person.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={pageStyle}>
        <div style={centerStyle}>
          <div style={statusCardStyle}>
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
                padding: "8px 12px",
                marginBottom: 16,
              }}
            >
              <CheckCircle size={13} />
              Authorization received
            </div>
            <h1 style={statusTitleStyle}>You are all set</h1>
            <p style={statusTextStyle}>
              Your authorization has been submitted successfully. The shop now has your signed approval
              on file for this vehicle.
            </p>

            <div
              style={{
                marginTop: 18,
                borderRadius: 20,
                border: `1px solid ${THEME.emeraldLine}`,
                background: "rgba(247,253,250,0.98)",
                padding: "14px 16px",
              }}
            >
              {[
                { label: "Vehicle", value: vehicleLabel },
                { label: "Signed by", value: name.trim() },
                { label: "Method", value: "Digital authorization" },
              ].map(({ label, value }, i, arr) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    padding: "10px 0",
                    borderBottom: i < arr.length - 1 ? `1px solid rgba(5,150,105,0.10)` : undefined,
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.10em", textTransform: "uppercase", color: THEME.textMuted }}>
                    {label}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: THEME.text, textAlign: "right" }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
          padding: isMobile ? "20px 14px 40px" : "28px 20px 44px",
        }}
      >
        <div
          style={{
            borderRadius: isMobile ? 22 : 30,
            border: THEME.shellBorder,
            background: THEME.shell,
            boxShadow: THEME.shellShadow,
            padding: isMobile ? 16 : 24,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 14,
              marginBottom: 20,
              padding: "4px 2px",
            }}
          >
            <div>
              <div style={miniBrandStyle}>ShopPROOF Secure Authorization</div>
              <h1 style={{ margin: "8px 0 10px", fontSize: isMobile ? 28 : 36, lineHeight: 1.08, fontWeight: 900, letterSpacing: "-0.04em", color: THEME.text }}>
                Diagnostic Authorization
              </h1>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: THEME.textSoft, maxWidth: 600 }}>
                Please review the information below and enter your name to authorize diagnostic inspection
                for the vehicle listed on this record.
              </p>
            </div>
            <div
              style={{
                flexShrink: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 13px",
                borderRadius: 999,
                border: `1px solid ${THEME.blueLine}`,
                background: THEME.blueSoft,
                color: THEME.blueStrong,
                fontSize: 12,
                fontWeight: 800,
                whiteSpace: "nowrap",
              }}
            >
              <Shield size={13} />
              {isMobile ? "Awaiting" : "Customer authorization"}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1.7fr) minmax(260px, 0.9fr)",
              gap: 18,
            }}
          >
            {/* Main document */}
            <div
              style={{
                borderRadius: 24,
                border: THEME.panelBorder,
                background: THEME.panel,
                boxShadow: THEME.panelShadow,
                padding: 20,
              }}
            >
              {/* Vehicle/record header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 14,
                  marginBottom: 18,
                }}
              >
                <div>
                  <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: THEME.textMuted, marginBottom: 7 }}>
                    Vehicle record
                  </div>
                  <h2 style={{ margin: 0, fontSize: isMobile ? 24 : 30, fontWeight: 900, letterSpacing: "-0.04em", color: THEME.text }}>
                    {vehicleLabel}
                  </h2>
                </div>
                <div
                  style={{
                    flexShrink: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: THEME.amberSoft,
                    border: `1px solid ${THEME.amberLine}`,
                    color: THEME.amber,
                    fontSize: 12,
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Clock size={12} style={{ marginRight: 6 }} />
                  Awaiting signature
                </div>
              </div>

              {/* Info grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                {[
                  { label: "Customer", value: customerName },
                  { label: "VIN", value: vehicleVin, mono: true },
                  { label: "Mileage In", value: mileageIn },
                  { label: "Diagnostic Fee", value: diagnosticFee ? `$${diagnosticFee}` : "—" },
                ].map(({ label, value, mono }) => (
                  <div
                    key={label}
                    style={{
                      borderRadius: 16,
                      border: THEME.cardBorder,
                      background: "rgba(248,250,252,0.96)",
                      padding: "12px 14px",
                    }}
                  >
                    <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: THEME.textMuted, marginBottom: 7 }}>
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: THEME.text,
                        wordBreak: "break-all",
                        fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : undefined,
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Concern */}
              <div
                style={{
                  borderRadius: 18,
                  border: THEME.cardBorder,
                  background: "rgba(248,250,252,0.98)",
                  padding: "14px 16px",
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: THEME.textMuted, marginBottom: 8 }}>
                  Reported Concern
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.7, color: THEME.textSoft }}>
                  {concern}
                </div>
              </div>

              {/* Authorization statement */}
              <div
                style={{
                  borderRadius: 20,
                  border: `1px solid ${THEME.blueLine}`,
                  background: THEME.accent,
                  padding: "16px 18px",
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: THEME.blue, marginBottom: 10 }}>
                  Authorization Statement
                </div>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.78, color: THEME.textSoft }}>
                  I authorize this shop to perform diagnostic inspection and related evaluation on
                  the vehicle identified above. I understand that diagnostic time, testing, and related
                  charges may apply whether or not repair work is ultimately approved or completed.
                  By signing below, I acknowledge that I am authorizing the shop to begin the
                  diagnostic process for this vehicle.
                </p>
              </div>

              {/* Signature */}
              <div
                style={{
                  borderRadius: 20,
                  border: THEME.cardBorder,
                  background: "rgba(255,255,255,0.96)",
                  padding: "16px 18px",
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: THEME.textSoft,
                    marginBottom: 10,
                  }}
                  htmlFor="sig-name"
                >
                  Full Name (Digital Signature)
                </label>

                <input
                  id="sig-name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); if (error) setError(""); }}
                  placeholder="Enter your full name"
                  style={{
                    width: "100%",
                    height: 52,
                    borderRadius: 13,
                    border: "1px solid rgba(71,85,105,0.18)",
                    background: "#ffffff",
                    color: THEME.text,
                    fontSize: 16,
                    fontWeight: 800,
                    padding: "0 14px",
                    boxSizing: "border-box",
                    outline: "none",
                    marginBottom: 10,
                    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
                    boxShadow: "inset 0 1px 2px rgba(15,23,42,0.04)",
                  }}
                />

                {error ? (
                  <div style={{ marginBottom: 10, fontSize: 13, color: THEME.red, fontWeight: 800 }}>
                    {error}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !name.trim()}
                  style={{
                    width: "100%",
                    height: 52,
                    borderRadius: 13,
                    border: `1px solid ${THEME.blueLine}`,
                    background: THEME.buttonBlue,
                    color: "#eff6ff",
                    fontSize: 15,
                    fontWeight: 900,
                    cursor: submitting || !name.trim() ? "not-allowed" : "pointer",
                    opacity: submitting || !name.trim() ? 0.60 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    boxShadow: "0 10px 24px rgba(37,99,235,0.18)",
                  }}
                >
                  {submitting ? (
                    <><LoaderCircle size={16} className="spin" /> Submitting...</>
                  ) : (
                    <><CheckCircle size={16} /> Sign & Authorize Diagnostics</>
                  )}
                </button>

                <p style={{ margin: "10px 0 0", fontSize: 11, lineHeight: 1.65, color: THEME.textDim }}>
                  By submitting this form, your name will be recorded as your digital signature together
                  with the date and time of authorization.
                </p>
              </div>
            </div>

            {/* Sidebar */}
            {!isMobile && (
              <aside style={{ display: "grid", gap: 14, alignSelf: "start" }}>
                <div
                  style={{
                    borderRadius: 22,
                    border: THEME.panelBorder,
                    background: THEME.panel,
                    padding: "16px",
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: THEME.textSoft, marginBottom: 14 }}>
                    What happens next
                  </div>
                  {[
                    {
                      color: THEME.blue,
                      title: "Authorization received",
                      text: "The shop receives your signed approval on this vehicle record.",
                    },
                    {
                      color: THEME.amber,
                      title: "Diagnostic inspection begins",
                      text: "The shop documents findings, notes, and related record details.",
                    },
                    {
                      color: THEME.emerald,
                      title: "Further approval if needed",
                      text: "If repair work is recommended, separate approval should be obtained.",
                    },
                  ].map(({ color, title, text }, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        marginBottom: i < 2 ? 16 : 0,
                      }}
                    >
                      <div
                        style={{
                          width: 11,
                          height: 11,
                          borderRadius: 999,
                          marginTop: 6,
                          flexShrink: 0,
                          background: color,
                          boxShadow: `0 0 0 4px ${color}18`,
                        }}
                      />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: THEME.text, marginBottom: 3 }}>
                          {title}
                        </div>
                        <div style={{ fontSize: 12, lineHeight: 1.6, color: THEME.textSoft }}>
                          {text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    borderRadius: 20,
                    border: THEME.panelBorder,
                    background: THEME.panel,
                    padding: "14px 16px",
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: THEME.textSoft, marginBottom: 10 }}>
                    Important
                  </div>
                  <p style={{ margin: 0, fontSize: 12, lineHeight: 1.7, color: THEME.textSoft }}>
                    This page is for diagnostic authorization only. Additional repairs, labor, or parts
                    beyond diagnostics should be separately approved by the customer before being performed.
                  </p>
                </div>
              </aside>
            )}
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
      `}</style>
    </div>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  backgroundImage: THEME.page,
  color: THEME.text,
  fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
};

const centerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  padding: 20,
};

const statusCardStyle: CSSProperties = {
  width: "100%",
  maxWidth: 600,
  borderRadius: 26,
  border: "1px solid rgba(71,85,105,0.12)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,249,252,0.98) 100%)",
  boxShadow: "0 20px 44px rgba(15,23,42,0.10)",
  padding: "26px 24px",
};

const miniBrandStyle: CSSProperties = {
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: THEME.blue,
  marginBottom: 4,
};

const statusTitleStyle: CSSProperties = {
  margin: "0 0 12px",
  fontSize: 28,
  lineHeight: 1.12,
  fontWeight: 900,
  letterSpacing: "-0.04em",
  color: THEME.text,
};

const statusTextStyle: CSSProperties = {
  margin: 0,
  fontSize: 13,
  lineHeight: 1.7,
  color: THEME.textSoft,
};
