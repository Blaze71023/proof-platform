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
const SOFT_BORDER = "1px solid rgba(71,85,105,0.14)";
const PANEL_BORDER = "1px solid rgba(71,85,105,0.12)";
const TEXT_MAIN = "#0f172a";
const TEXT_SOFT = "#334155";
const TEXT_MUTED = "#64748b";
const BLUE = "#2563eb";
const EMERALD = "#059669";
const EMERALD_SOFT = "#d1fae5";
const AMBER = "#d97706";
const AMBER_SOFT = "#fef3c7";
const RED = "#dc2626";
const RED_SOFT = "#fee2e2";

export default function SignPage() {
  const params = useParams();
  const token = params?.token as string;

  const [job, setJob] = useState<AnyJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setJob(null);
      setLoading(false);
      return;
    }

    const jobs = getJobs();
    const found =
      jobs.find((j: AnyJob) => j?.authorization?.token === token) || null;

    setJob(found);
    setLoading(false);
  }, [token]);

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
    null;

  const handleSubmit = () => {
    if (!job) return;

    if (!name.trim()) {
      setError("Please enter your name to sign this authorization.");
      return;
    }

    const updated = {
      ...job,
      authorization: {
        ...job.authorization,
        authorizationStatus: "signed_remote",
        signatureName: name.trim(),
        signatureTimestamp: new Date().toISOString(),
        signatureMethod: "digital",
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
            <div style={miniBrandStyle}>ShopPROOF Authorization</div>
            <h2 style={statusTitleStyle}>Loading authorization request...</h2>
            <p style={statusTextStyle}>
              Please wait while we verify this request.
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
            <div style={invalidBadgeStyle}>Link unavailable</div>
            <h1 style={statusTitleStyle}>Invalid or expired authorization link</h1>
            <p style={statusTextStyle}>
              This request may have already been completed, removed, or the link
              may no longer be active. Please contact the shop directly if you
              still need to review or sign your authorization.
            </p>

            <div style={supportPanelStyle}>
              <div style={supportTitleStyle}>Need help?</div>
              <div style={supportTextStyle}>
                Reach out to the shop that sent you this link so they can resend
                the authorization request or assist you in person.
              </div>
            </div>
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
            <div style={successBadgeStyle}>Authorization received</div>
            <h1 style={statusTitleStyle}>You are all set</h1>
            <p style={statusTextStyle}>
              Your authorization has been submitted successfully. The shop now
              has your signed approval on file for this vehicle.
            </p>

            <div style={summaryPanelStyle}>
              <div style={summaryRowStyle}>
                <span style={summaryLabelStyle}>Vehicle</span>
                <span style={summaryValueStyle}>{vehicleLabel}</span>
              </div>
              <div style={summaryRowStyle}>
                <span style={summaryLabelStyle}>Signed by</span>
                <span style={summaryValueStyle}>{name.trim()}</span>
              </div>
              <div style={summaryRowLastStyle}>
                <span style={summaryLabelStyle}>Method</span>
                <span style={summaryValueStyle}>Digital authorization</span>
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
              <div style={miniBrandStyle}>ShopPROOF Secure Authorization</div>
              <h1 style={pageTitleStyle}>Diagnostic Authorization</h1>
              <p style={pageIntroStyle}>
                Please review the information below and enter your name to
                authorize diagnostic inspection for the vehicle listed on this
                record.
              </p>
            </div>

            <div style={headerBadgeStyle}>Customer authorization</div>
          </div>

          <div style={documentGridStyle}>
            <section style={documentCardStyle}>
              <div style={documentTopStyle}>
                <div>
                  <div style={sectionEyebrowStyle}>Vehicle record</div>
                  <h2 style={documentTitleStyle}>{vehicleLabel}</h2>
                </div>

                <div style={awaitingBadgeStyle}>Awaiting signature</div>
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

                <div style={infoCardStyle}>
                  <div style={infoLabelStyle}>Mileage In</div>
                  <div style={infoValueStyle}>
                    {job?.vehicle?.mileageIn || job?.visit?.mileageIn || "—"}
                  </div>
                </div>

                <div style={infoCardStyle}>
                  <div style={infoLabelStyle}>Diagnostics Fee</div>
                  <div style={infoValueStyle}>
                    {diagnosticsFee ? `$${diagnosticsFee}` : "—"}
                  </div>
                </div>
              </div>

              <div style={sectionPanelStyle}>
                <div style={panelLabelStyle}>Reported Concern</div>
                <div style={panelTextStyle}>{concernText}</div>
              </div>

              <div style={authorizationPanelStyle}>
                <div style={panelLabelBlueStyle}>Authorization Statement</div>
                <div style={legalTextStyle}>
                  I authorize this shop to perform diagnostic inspection and
                  related evaluation on the vehicle identified above. I
                  understand that diagnostic time, testing, and related charges
                  may apply whether or not repair work is ultimately approved or
                  completed. By signing below, I acknowledge that I am
                  authorizing the shop to begin the diagnostic process for this
                  vehicle.
                </div>
              </div>

              <div style={signaturePanelStyle}>
                <label style={inputLabelStyle} htmlFor="signature-name">
                  Full Name (Digital Signature)
                </label>

                <input
                  id="signature-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter your full name"
                  style={inputStyle}
                />

                {error ? <div style={errorTextStyle}>{error}</div> : null}

                <button onClick={handleSubmit} style={submitButtonStyle}>
                  Sign & Authorize Diagnostics
                </button>

                <div style={finePrintStyle}>
                  By submitting this form, your name will be recorded as your
                  digital signature together with the date and time of
                  authorization.
                </div>
              </div>
            </section>

            <aside style={sideCardStyle}>
              <div style={sideSectionStyle}>
                <div style={sideSectionTitleStyle}>What happens next</div>

                <div style={timelineItemStyle}>
                  <div style={timelineDotBlueStyle} />
                  <div>
                    <div style={timelineTitleStyle}>Authorization received</div>
                    <div style={timelineTextStyle}>
                      The shop receives your signed approval on this vehicle
                      record.
                    </div>
                  </div>
                </div>

                <div style={timelineItemStyle}>
                  <div style={timelineDotAmberStyle} />
                  <div>
                    <div style={timelineTitleStyle}>Diagnostic inspection begins</div>
                    <div style={timelineTextStyle}>
                      The shop documents findings, notes, and related record
                      details during the diagnostic process.
                    </div>
                  </div>
                </div>

                <div style={timelineItemLastStyle}>
                  <div style={timelineDotEmeraldStyle} />
                  <div>
                    <div style={timelineTitleStyle}>Further approval if needed</div>
                    <div style={timelineTextStyle}>
                      If repair work is recommended beyond diagnostics, separate
                      customer approval should be obtained before proceeding.
                    </div>
                  </div>
                </div>
              </div>

              <div style={sideSectionStyle}>
                <div style={sideSectionTitleStyle}>Important</div>
                <div style={sideTextStyle}>
                  This page is for diagnostic authorization only. Additional
                  repairs, labor, or parts beyond diagnostics should be
                  separately approved by the customer before being performed.
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: PAGE_BG,
  color: TEXT_MAIN,
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const pageInnerStyle: CSSProperties = {
  width: "100%",
  maxWidth: 1180,
  margin: "0 auto",
  padding: "28px 20px 44px",
};

const shellStyle: CSSProperties = {
  borderRadius: 30,
  border: SOFT_BORDER,
  background: SHELL_BG,
  boxShadow:
    "0 24px 60px rgba(15,23,42,0.10), inset 0 1px 0 rgba(255,255,255,0.72)",
  padding: 24,
};

const centerWrapStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 20,
  padding: "8px 4px 4px",
};

const miniBrandStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: BLUE,
};

const pageTitleStyle: CSSProperties = {
  margin: "6px 0 10px",
  fontSize: 34,
  lineHeight: 1.08,
  fontWeight: 800,
  letterSpacing: "-0.03em",
  color: TEXT_MAIN,
};

const pageIntroStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.65,
  color: TEXT_SOFT,
  maxWidth: 700,
};

const headerBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 14px",
  borderRadius: 999,
  border: "1px solid rgba(37,99,235,0.14)",
  background: "rgba(219,234,254,0.86)",
  color: "#1d4ed8",
  fontSize: 12,
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const documentGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.7fr) minmax(280px, 0.95fr)",
  gap: 18,
};

const documentCardStyle: CSSProperties = {
  borderRadius: 26,
  border: PANEL_BORDER,
  background: PANEL_BG,
  boxShadow:
    "0 18px 40px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.75)",
  padding: 22,
};

const sideCardStyle: CSSProperties = {
  borderRadius: 26,
  border: PANEL_BORDER,
  background: PANEL_BG,
  boxShadow:
    "0 18px 40px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.75)",
  padding: 18,
  alignSelf: "start",
};

const documentTopStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 18,
};

const sectionEyebrowStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: TEXT_MUTED,
  marginBottom: 8,
};

const documentTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 28,
  lineHeight: 1.12,
  fontWeight: 800,
  letterSpacing: "-0.03em",
  color: TEXT_MAIN,
};

const awaitingBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "9px 12px",
  borderRadius: 999,
  background: AMBER_SOFT,
  border: "1px solid rgba(217,119,6,0.16)",
  color: AMBER,
  fontSize: 12,
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const infoGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 14,
  marginBottom: 16,
};

const infoCardStyle: CSSProperties = {
  borderRadius: 18,
  border: "1px solid rgba(71,85,105,0.10)",
  background: "rgba(248,250,252,0.96)",
  padding: "14px 15px",
};

const infoLabelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: TEXT_MUTED,
  marginBottom: 8,
};

const infoValueStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: TEXT_MAIN,
};

const infoMonoStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: TEXT_MAIN,
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  wordBreak: "break-all",
};

const sectionPanelStyle: CSSProperties = {
  marginBottom: 16,
  borderRadius: 20,
  border: "1px solid rgba(71,85,105,0.10)",
  background: "rgba(248,250,252,0.98)",
  padding: "16px 17px",
};

const panelLabelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: TEXT_MUTED,
  marginBottom: 10,
};

const panelTextStyle: CSSProperties = {
  fontSize: 15,
  lineHeight: 1.7,
  color: TEXT_SOFT,
};

const authorizationPanelStyle: CSSProperties = {
  marginBottom: 16,
  borderRadius: 22,
  border: "1px solid rgba(37,99,235,0.14)",
  background: ACCENT_PANEL_BG,
  padding: "18px 18px 16px",
};

const panelLabelBlueStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: BLUE,
  marginBottom: 10,
};

const legalTextStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: 1.78,
  color: TEXT_SOFT,
};

const signaturePanelStyle: CSSProperties = {
  borderRadius: 22,
  border: "1px solid rgba(71,85,105,0.10)",
  background: "rgba(255,255,255,0.96)",
  padding: 18,
};

const inputLabelStyle: CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: TEXT_SOFT,
  marginBottom: 10,
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "14px 14px",
  borderRadius: 14,
  border: "1px solid rgba(71,85,105,0.18)",
  background: "#ffffff",
  color: TEXT_MAIN,
  outline: "none",
  fontSize: 15,
  marginBottom: 10,
  boxShadow: "inset 0 1px 2px rgba(15,23,42,0.04)",
};

const errorTextStyle: CSSProperties = {
  fontSize: 13,
  lineHeight: 1.5,
  color: RED,
  marginBottom: 12,
};

const submitButtonStyle: CSSProperties = {
  width: "100%",
  padding: "16px 16px",
  borderRadius: 14,
  border: "1px solid rgba(37,99,235,0.16)",
  background:
    "linear-gradient(180deg, rgba(37,99,235,0.96) 0%, rgba(29,78,216,0.96) 100%)",
  color: "#eff6ff",
  fontSize: 15,
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 10px 22px rgba(37,99,235,0.16)",
};

const finePrintStyle: CSSProperties = {
  marginTop: 12,
  fontSize: 12,
  lineHeight: 1.65,
  color: TEXT_MUTED,
};

const sideSectionStyle: CSSProperties = {
  borderRadius: 20,
  border: "1px solid rgba(71,85,105,0.10)",
  background: "rgba(250,252,255,0.98)",
  padding: 16,
  marginBottom: 14,
};

const sideSectionTitleStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: TEXT_SOFT,
  marginBottom: 14,
};

const timelineItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  marginBottom: 16,
};

const timelineItemLastStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
};

const timelineDotBaseStyle: CSSProperties = {
  width: 11,
  height: 11,
  borderRadius: 999,
  marginTop: 6,
  flexShrink: 0,
};

const timelineDotBlueStyle: CSSProperties = {
  ...timelineDotBaseStyle,
  background: BLUE,
  boxShadow: "0 0 0 4px rgba(37,99,235,0.10)",
};

const timelineDotAmberStyle: CSSProperties = {
  ...timelineDotBaseStyle,
  background: AMBER,
  boxShadow: "0 0 0 4px rgba(217,119,6,0.10)",
};

const timelineDotEmeraldStyle: CSSProperties = {
  ...timelineDotBaseStyle,
  background: EMERALD,
  boxShadow: "0 0 0 4px rgba(5,150,105,0.10)",
};

const timelineTitleStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: TEXT_MAIN,
  marginBottom: 4,
};

const timelineTextStyle: CSSProperties = {
  fontSize: 13,
  lineHeight: 1.6,
  color: TEXT_SOFT,
};

const sideTextStyle: CSSProperties = {
  fontSize: 13,
  lineHeight: 1.7,
  color: TEXT_SOFT,
};

const statusCardStyle: CSSProperties = {
  width: "100%",
  maxWidth: 680,
  borderRadius: 28,
  border: PANEL_BORDER,
  background: PANEL_BG,
  boxShadow:
    "0 20px 44px rgba(15,23,42,0.10), inset 0 1px 0 rgba(255,255,255,0.76)",
  padding: "28px 26px",
};

const invalidBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 12px",
  borderRadius: 999,
  background: RED_SOFT,
  border: "1px solid rgba(220,38,38,0.14)",
  color: RED,
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 14,
};

const successBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 12px",
  borderRadius: 999,
  background: EMERALD_SOFT,
  border: "1px solid rgba(5,150,105,0.14)",
  color: EMERALD,
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 14,
};

const statusTitleStyle: CSSProperties = {
  margin: "0 0 12px",
  fontSize: 30,
  lineHeight: 1.12,
  fontWeight: 800,
  letterSpacing: "-0.03em",
  color: TEXT_MAIN,
};

const statusTextStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.7,
  color: TEXT_SOFT,
};

const supportPanelStyle: CSSProperties = {
  marginTop: 18,
  borderRadius: 18,
  border: "1px solid rgba(71,85,105,0.10)",
  background: "rgba(248,250,252,0.98)",
  padding: 16,
};

const supportTitleStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: TEXT_SOFT,
  marginBottom: 8,
};

const supportTextStyle: CSSProperties = {
  fontSize: 13,
  lineHeight: 1.65,
  color: TEXT_SOFT,
};

const summaryPanelStyle: CSSProperties = {
  marginTop: 18,
  borderRadius: 18,
  border: "1px solid rgba(5,150,105,0.14)",
  background: "rgba(247,253,250,0.98)",
  padding: 16,
};

const summaryRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "10px 0",
  borderBottom: "1px solid rgba(71,85,105,0.08)",
};

const summaryRowLastStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "10px 0 0",
};

const summaryLabelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: TEXT_MUTED,
};

const summaryValueStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: TEXT_MAIN,
  textAlign: "right",
};