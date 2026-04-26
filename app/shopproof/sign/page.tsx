"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
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
const BLUE_SOFT = "rgba(219,234,254,0.86)";
const EMERALD = "#059669";
const EMERALD_SOFT = "#d1fae5";
const AMBER = "#d97706";
const AMBER_SOFT = "#fef3c7";
const RED = "#dc2626";
const RED_SOFT = "#fee2e2";

export default function SignPage() {
  const [jobs, setJobs] = useState<AnyJob[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const data = getJobs();
    setJobs(data || []);
  }, []);

  const job = useMemo(
    () => jobs.find((j) => String(j.id) === String(selectedId)) || null,
    [jobs, selectedId]
  );

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

  const handleSelectJob = (id: string) => {
    setSelectedId(id);
    setSubmitted(false);
    setName("");
    setError("");
  };

  const handleSubmit = () => {
    if (!job) return;

    if (!name.trim()) {
      setError("Please enter the customer's name to sign.");
      return;
    }

    const updated = {
      ...job,
      authorization: {
        ...job.authorization,
        authorizationStatus: "signed_in_person",
        signatureName: name.trim(),
        signatureTimestamp: new Date().toISOString(),
        signatureMethod: "in_person",
      },
    };

    updateJob(updated);

    setJobs((prev) =>
      prev.map((item) =>
        String(item.id) === String(updated.id) ? updated : item
      )
    );

    setSubmitted(true);
    setError("");
  };

  return (
    <div style={pageStyle}>
      <div style={pageInnerStyle}>
        <div style={shellStyle}>
          <div style={headerStyle}>
            <div>
              <div style={miniBrandStyle}>ShopPROOF</div>
              <h1 style={pageTitleStyle}>In-Shop Authorization</h1>
              <p style={pageIntroStyle}>
                Select the correct job below, review the authorization with the
                customer, and collect their signature directly on this device.
              </p>
            </div>

            <div style={headerBadgeStyle}>In-person signing</div>
          </div>

          <div style={layoutStyle}>
            <aside style={leftRailStyle}>
              <div style={leftSectionStyle}>
                <div style={leftSectionTitleStyle}>Select job</div>
                <div style={leftSectionTextStyle}>
                  Choose the active vehicle record the customer is authorizing.
                </div>

                <div style={jobListStyle}>
                  {jobs.length === 0 ? (
                    <div style={emptyListCardStyle}>
                      <div style={emptyListTitleStyle}>No jobs available</div>
                      <div style={emptyListTextStyle}>
                        There are no ShopPROOF jobs available to sign right now.
                      </div>
                    </div>
                  ) : (
                    jobs.map((item) => {
                      const isSelected =
                        String(item.id) === String(selectedId);

                      const itemVehicle = [
                        item?.vehicle?.year || "",
                        item?.vehicle?.make || "",
                        item?.vehicle?.model || "",
                      ]
                        .filter(Boolean)
                        .join(" ");

                      const itemCustomer = [
                        item?.customer?.firstName || "",
                        item?.customer?.lastName || "",
                      ]
                        .filter(Boolean)
                        .join(" ")
                        .trim() ||
                        item?.customer?.name ||
                        "Customer";

                      const itemConcern =
                        item?.visit?.concern ||
                        item?.concern ||
                        "No concern entered";

                      return (
                        <button
                          key={String(item.id)}
                          type="button"
                          onClick={() => handleSelectJob(String(item.id))}
                          style={{
                            ...jobCardStyle,
                            ...(isSelected ? selectedJobCardStyle : null),
                          }}
                        >
                          <div style={jobCardTopStyle}>
                            <div style={jobCardVehicleStyle}>
                              {itemVehicle || "Vehicle record"}
                            </div>
                            <div
                              style={{
                                ...jobCardStatusStyle,
                                ...(isSelected ? selectedJobCardStatusStyle : null),
                              }}
                            >
                              {isSelected ? "Selected" : "Open"}
                            </div>
                          </div>

                          <div style={jobCardMetaStyle}>
                            <div style={jobCardMetaLabelStyle}>Customer</div>
                            <div style={jobCardMetaValueStyle}>{itemCustomer}</div>
                          </div>

                          <div style={jobCardMetaStyle}>
                            <div style={jobCardMetaLabelStyle}>Concern</div>
                            <div style={jobCardConcernStyle}>{itemConcern}</div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div style={leftSectionStyle}>
                <div style={leftSectionTitleStyle}>How this is used</div>
                <div style={timelineItemStyle}>
                  <div style={timelineDotBlueStyle} />
                  <div>
                    <div style={timelineTitleStyle}>Select the correct job</div>
                    <div style={timelineTextStyle}>
                      Verify the vehicle and customer before handing over the
                      device.
                    </div>
                  </div>
                </div>

                <div style={timelineItemStyle}>
                  <div style={timelineDotAmberStyle} />
                  <div>
                    <div style={timelineTitleStyle}>Review authorization</div>
                    <div style={timelineTextStyle}>
                      Confirm the diagnostic authorization language with the
                      customer.
                    </div>
                  </div>
                </div>

                <div style={timelineItemLastStyle}>
                  <div style={timelineDotEmeraldStyle} />
                  <div>
                    <div style={timelineTitleStyle}>Capture signature</div>
                    <div style={timelineTextStyle}>
                      Save the in-person signature directly to the job record.
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <section style={mainPanelStyle}>
              {!job && (
                <div style={emptyStateStyle}>
                  <div style={emptyStateBadgeStyle}>Awaiting selection</div>
                  <h2 style={emptyStateTitleStyle}>
                    Choose a job to begin signing
                  </h2>
                  <p style={emptyStateTextStyle}>
                    Once a job is selected, the customer-facing authorization
                    document will appear here for review and signature.
                  </p>
                </div>
              )}

              {job && !submitted && (
                <div style={documentCardStyle}>
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
                      understand that diagnostic time, testing, and related
                      charges may apply whether or not repair work is ultimately
                      approved or completed.
                    </div>
                  </div>

                  <div style={signaturePanelStyle}>
                    <label style={inputLabelStyle} htmlFor="customer-signature">
                      Customer Name (Signature)
                    </label>

                    <input
                      id="customer-signature"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="Enter customer name"
                      style={inputStyle}
                    />

                    {error ? <div style={errorTextStyle}>{error}</div> : null}

                    <button
                      type="button"
                      onClick={handleSubmit}
                      style={submitButtonStyle}
                    >
                      Sign & Authorize
                    </button>

                    <div style={finePrintStyle}>
                      This record will be saved as an in-person authorization on
                      this job.
                    </div>
                  </div>
                </div>
              )}

              {job && submitted && (
                <div style={statusCardStyle}>
                  <div style={successBadgeStyle}>Authorization saved</div>
                  <h2 style={statusTitleStyle}>Authorization complete</h2>
                  <p style={statusTextStyle}>
                    The customer has signed this authorization and it has been
                    recorded to the selected vehicle record.
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
                    <div style={summaryRowLastStyle}>
                      <span style={summaryLabelStyle}>Signed by</span>
                      <span style={summaryValueStyle}>{name.trim()}</span>
                    </div>
                  </div>

                  <div style={statusActionsStyle}>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setName("");
                        setError("");
                      }}
                      style={secondaryButtonStyle}
                    >
                      Review Again
                    </button>
                  </div>
                </div>
              )}
            </section>
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
  maxWidth: 1240,
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

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 22,
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
  maxWidth: 720,
};

const headerBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 14px",
  borderRadius: 999,
  border: "1px solid rgba(37,99,235,0.14)",
  background: BLUE_SOFT,
  color: "#1d4ed8",
  fontSize: 12,
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const layoutStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "360px minmax(0, 1fr)",
  gap: 18,
};

const leftRailStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const leftSectionStyle: CSSProperties = {
  borderRadius: 22,
  border: PANEL_BORDER,
  background: PANEL_BG,
  boxShadow:
    "0 18px 40px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.75)",
  padding: 18,
};

const leftSectionTitleStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: TEXT_SOFT,
  marginBottom: 8,
};

const leftSectionTextStyle: CSSProperties = {
  fontSize: 13,
  lineHeight: 1.65,
  color: TEXT_MUTED,
  marginBottom: 14,
};

const jobListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const emptyListCardStyle: CSSProperties = {
  borderRadius: 18,
  border: "1px solid rgba(71,85,105,0.10)",
  background: "rgba(248,250,252,0.96)",
  padding: 16,
};

const emptyListTitleStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: TEXT_MAIN,
  marginBottom: 6,
};

const emptyListTextStyle: CSSProperties = {
  fontSize: 13,
  lineHeight: 1.6,
  color: TEXT_SOFT,
};

const jobCardStyle: CSSProperties = {
  width: "100%",
  textAlign: "left",
  borderRadius: 18,
  border: "1px solid rgba(71,85,105,0.10)",
  background: "rgba(248,250,252,0.96)",
  padding: 14,
  cursor: "pointer",
};

const selectedJobCardStyle: CSSProperties = {
  border: "1px solid rgba(37,99,235,0.22)",
  background:
    "linear-gradient(180deg, rgba(239,246,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
  boxShadow: "0 10px 24px rgba(37,99,235,0.08)",
};

const jobCardTopStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 10,
};

const jobCardVehicleStyle: CSSProperties = {
  fontSize: 15,
  lineHeight: 1.35,
  fontWeight: 700,
  color: TEXT_MAIN,
};

const jobCardStatusStyle: CSSProperties = {
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(148,163,184,0.12)",
  color: TEXT_MUTED,
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const selectedJobCardStatusStyle: CSSProperties = {
  background: BLUE_SOFT,
  color: BLUE,
};

const jobCardMetaStyle: CSSProperties = {
  marginBottom: 8,
};

const jobCardMetaLabelStyle: CSSProperties = {
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: TEXT_MUTED,
  marginBottom: 4,
};

const jobCardMetaValueStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: TEXT_SOFT,
};

const jobCardConcernStyle: CSSProperties = {
  fontSize: 13,
  lineHeight: 1.55,
  color: TEXT_SOFT,
};

const mainPanelStyle: CSSProperties = {
  minHeight: 520,
};

const emptyStateStyle: CSSProperties = {
  height: "100%",
  minHeight: 520,
  borderRadius: 26,
  border: PANEL_BORDER,
  background: PANEL_BG,
  boxShadow:
    "0 18px 40px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.75)",
  padding: 28,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "center",
};

const emptyStateBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 12px",
  borderRadius: 999,
  background: AMBER_SOFT,
  border: "1px solid rgba(217,119,6,0.14)",
  color: AMBER,
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 14,
};

const emptyStateTitleStyle: CSSProperties = {
  margin: "0 0 10px",
  fontSize: 30,
  lineHeight: 1.12,
  fontWeight: 800,
  letterSpacing: "-0.03em",
  color: TEXT_MAIN,
};

const emptyStateTextStyle: CSSProperties = {
  margin: 0,
  maxWidth: 560,
  fontSize: 14,
  lineHeight: 1.75,
  color: TEXT_SOFT,
};

const documentCardStyle: CSSProperties = {
  borderRadius: 26,
  border: PANEL_BORDER,
  background: PANEL_BG,
  boxShadow:
    "0 18px 40px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.75)",
  padding: 22,
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

const statusCardStyle: CSSProperties = {
  borderRadius: 26,
  border: PANEL_BORDER,
  background: PANEL_BG,
  boxShadow:
    "0 18px 40px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.75)",
  padding: 24,
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

const statusActionsStyle: CSSProperties = {
  marginTop: 18,
  display: "flex",
  gap: 10,
};

const secondaryButtonStyle: CSSProperties = {
  padding: "12px 16px",
  borderRadius: 12,
  border: "1px solid rgba(71,85,105,0.14)",
  background: "rgba(248,250,252,0.98)",
  color: TEXT_MAIN,
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};