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
  if (!Number.isNaN(num)) return `$${num.toFixed(2)}`;
  return `$${value}`;
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
              The final release has been recorded to this ShopPROOF job. This
              record now includes the customer release acknowledgment and final
              documentation state.
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
                Review the completed vehicle record, confirm the release
                details, and capture the customer acknowledgment at vehicle
                pickup.
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

                  <div style={infoCardStyle}>
                    <div style={infoLabelStyle}>Mileage In</div>
                    <div style={infoValueStyle}>{mileageIn}</div>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={infoLabelStyle}>Mileage Out</div>
                    <div style={infoValueStyle}>{mileageOut}</div>
                  </div>
                </div>

                <div style={sectionPanelStyle}>
                  <div style={panelLabelStyle}>Customer Concern</div>
                  <div style={panelTextStyle}>{concernText}</div>
                </div>

                <div style={authorizationPanelStyle}>
                  <div style={panelLabelBlueStyle}>Authorization Summary</div>
                  <div style={legalTextStyle}>
                    Diagnostics authorization status:{" "}
                    <strong>{cleanStatus(authStatus)}</strong>. Diagnostics fee
                    on record:{" "}
                    <strong>
                      {diagnosticsFee ? formatMoney(diagnosticsFee) : "—"}
                    </strong>
                    .
                  </div>
                </div>

                <div style={sectionPanelStyle}>
                  <div style={panelLabelStyle}>Technician Findings</div>

                  {findingsList.length > 0 ? (
                    <div style={stackStyle}>
                      {findingsList.map((item, index) => {
                        const label =
                          item?.title ||
                          item?.finding ||
                          item?.summary ||
                          item?.notes ||
                          `Finding ${index + 1}`;

                        const by =
                          item?.by ||
                          item?.findingsBy ||
                          item?.author ||
                          item?.tech ||
                          "";

                        return (
                          <div key={index} style={stackItemStyle}>
                            <div style={stackItemTitleStyle}>{label}</div>
                            {by ? (
                              <div style={stackItemMetaStyle}>
                                Recorded by {by}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={emptyRecordTextStyle}>
                      No technician findings were added to this record.
                    </div>
                  )}
                </div>

                <div style={sectionPanelStyle}>
                  <div style={panelLabelStyle}>Approved / Documented Work</div>

                  {recommendedRepairs.length > 0 ? (
                    <div style={subSectionStyle}>
                      <div style={subSectionTitleStyle}>
                        Recommended Repairs
                      </div>
                      <div style={stackStyle}>
                        {recommendedRepairs.map((item, index) => (
                          <div key={index} style={stackItemStyle}>
                            <div style={stackItemTitleStyle}>
                              {item?.title || item?.description || String(item)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={emptyRecordTextStyle}>
                      No recommended repairs were added to this record.
                    </div>
                  )}

                  {partsList.length > 0 && (
                    <div style={subSectionStyle}>
                      <div style={subSectionTitleStyle}>Parts</div>
                      <div style={stackStyle}>
                        {partsList.map((item, index) => (
                          <div key={index} style={lineItemStyle}>
                            <span style={lineItemTitleStyle}>
                              {item?.name ||
                                item?.description ||
                                `Part ${index + 1}`}
                            </span>
                            <span style={lineItemValueStyle}>
                              {formatMoney(item?.total || item?.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {laborList.length > 0 && (
                    <div style={subSectionStyle}>
                      <div style={subSectionTitleStyle}>Labor</div>
                      <div style={stackStyle}>
                        {laborList.map((item, index) => (
                          <div key={index} style={lineItemStyle}>
                            <span style={lineItemTitleStyle}>
                              {item?.name ||
                                item?.description ||
                                `Labor ${index + 1}`}
                            </span>
                            <span style={lineItemValueStyle}>
                              {formatMoney(item?.total || item?.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={totalsPanelStyle}>
                    <div style={totalsRowStyle}>
                      <span style={totalsLabelStyle}>Parts</span>
                      <span style={totalsValueStyle}>
                        {formatMoney(totals.parts)}
                      </span>
                    </div>
                    <div style={totalsRowStyle}>
                      <span style={totalsLabelStyle}>Labor</span>
                      <span style={totalsValueStyle}>
                        {formatMoney(totals.labor)}
                      </span>
                    </div>
                    <div style={totalsRowLastStyle}>
                      <span style={totalsGrandLabelStyle}>Total</span>
                      <span style={totalsGrandValueStyle}>
                        {formatMoney(totals.total)}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={releasePanelStyle}>
                  <div style={releasePanelHeaderStyle}>
                    <div>
                      <div style={panelLabelGreenStyle}>
                        Final Release Statement
                      </div>
                      <div style={releaseTitleStyle}>
                        Customer acknowledgment at pickup
                      </div>
                    </div>
                    <div style={releaseBadgeStyle}>Required</div>
                  </div>

                  <div style={legalTextStyle}>
                    I acknowledge that I am receiving the vehicle identified on
                    this record. I understand that this final release reflects
                    the documented intake, authorization, findings, approvals,
                    and release status recorded by the shop. If repairs were
                    declined or not completed, I acknowledge that the vehicle is
                    being released in its current documented condition.
                  </div>
                </div>

                <div style={signaturePanelStyle}>
                  <div style={signatureHeaderStyle}>
                    <div>
                      <div style={panelLabelStyle}>Release Signature</div>
                      <div style={signatureTitleStyle}>
                        Complete final customer release
                      </div>
                    </div>
                    <div style={requiredTextStyle}>Name required</div>
                  </div>

                  <label style={inputLabelStyle} htmlFor="release-signature">
                    Customer Name
                  </label>

                  <input
                    id="release-signature"
                    value={releaseName}
                    onChange={(e) => {
                      setReleaseName(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Enter customer name"
                    style={inputStyle}
                  />

                  <label style={inputLabelStyle} htmlFor="release-notes">
                    Release Notes Optional
                  </label>

                  <textarea
                    id="release-notes"
                    value={releaseNotes}
                    onChange={(e) => setReleaseNotes(e.target.value)}
                    placeholder="Add release notes, declined-work notes, or pickup notes if needed"
                    style={textareaStyle}
                  />

                  {error ? <div style={errorTextStyle}>{error}</div> : null}

                  <button
                    type="button"
                    onClick={handleSubmit}
                    style={submitButtonStyle}
                  >
                    Sign & Complete Final Release
                  </button>

                  <div style={finePrintStyle}>
                    This records the customer release acknowledgment and
                    timestamps it into the ShopPROOF vehicle record.
                  </div>
                </div>
              </div>
            </section>

            <aside style={sideColumnStyle}>
              <div style={sideCardStyle}>
                <div style={sideSectionTitleStyle}>
                  What this final page proves
                </div>

                <div style={timelineItemStyle}>
                  <div style={timelineDotBlueStyle} />
                  <div>
                    <div style={timelineTitleStyle}>Vehicle identity</div>
                    <div style={timelineTextStyle}>
                      Which vehicle was received, documented, and released.
                    </div>
                  </div>
                </div>

                <div style={timelineItemStyle}>
                  <div style={timelineDotAmberStyle} />
                  <div>
                    <div style={timelineTitleStyle}>Authorization chain</div>
                    <div style={timelineTextStyle}>
                      That diagnostics and related work were documented through
                      the job record.
                    </div>
                  </div>
                </div>

                <div style={timelineItemLastStyle}>
                  <div style={timelineDotEmeraldStyle} />
                  <div>
                    <div style={timelineTitleStyle}>Final release</div>
                    <div style={timelineTextStyle}>
                      That the vehicle was acknowledged and released at pickup.
                    </div>
                  </div>
                </div>
              </div>

              <div style={sideCardStyle}>
                <div style={sideSectionTitleStyle}>Record snapshot</div>

                <div style={snapshotRowStyle}>
                  <span style={snapshotLabelStyle}>Diagnostics Fee</span>
                  <span style={snapshotValueStyle}>
                    {diagnosticsFee ? formatMoney(diagnosticsFee) : "—"}
                  </span>
                </div>

                <div style={snapshotRowStyle}>
                  <span style={snapshotLabelStyle}>Authorization</span>
                  <span style={snapshotValueStyle}>
                    {cleanStatus(authStatus)}
                  </span>
                </div>

                <div style={snapshotRowStyle}>
                  <span style={snapshotLabelStyle}>Findings</span>
                  <span style={snapshotValueStyle}>{findingsList.length}</span>
                </div>

                <div style={snapshotRowLastStyle}>
                  <span style={snapshotLabelStyle}>Recorded Total</span>
                  <span style={snapshotValueStyle}>
                    {formatMoney(totals.total)}
                  </span>
                </div>
              </div>

              <div style={sideGuidanceCardStyle}>
                <div style={sideSectionTitleStyle}>Final guidance</div>
                <div style={sideTextStyle}>
                  Confirm the customer name before completing release. This page
                  closes the documentation chain and should reflect the final
                  condition, approval state, and customer acknowledgment for this
                  vehicle.
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
  maxWidth: 1280,
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
  marginBottom: 18,
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
  maxWidth: 760,
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
  fontWeight: 800,
  whiteSpace: "nowrap",
};

const statusBandStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 0,
  overflow: "hidden",
  borderRadius: 24,
  border: "1px solid rgba(15,23,42,0.18)",
  background: STATUS_BAND_BG,
  boxShadow:
    "0 18px 36px rgba(15,23,42,0.14), inset 0 1px 0 rgba(255,255,255,0.10)",
  marginBottom: 18,
};

const statusBandItemStyle: CSSProperties = {
  padding: "17px 18px",
  borderRight: "1px solid rgba(226,232,240,0.14)",
};

const statusBandItemLastStyle: CSSProperties = {
  padding: "17px 18px",
};

const statusBandLabelStyle: CSSProperties = {
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "rgba(226,232,240,0.72)",
  marginBottom: 7,
};

const statusBandValueStyle: CSSProperties = {
  fontSize: 15,
  lineHeight: 1.35,
  fontWeight: 800,
  color: "#f8fafc",
};

const layoutStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.7fr) 340px",
  gap: 18,
};

const mainColumnStyle: CSSProperties = {
  minWidth: 0,
};

const sideColumnStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
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
  borderRadius: 22,
  border: PANEL_BORDER,
  background: PANEL_BG,
  boxShadow:
    "0 18px 40px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.75)",
  padding: 18,
};

const sideGuidanceCardStyle: CSSProperties = {
  borderRadius: 22,
  border: "1px solid rgba(37,99,235,0.14)",
  background: ACCENT_PANEL_BG,
  boxShadow:
    "0 18px 40px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.75)",
  padding: 18,
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
  fontWeight: 800,
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

const panelLabelBlueStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: BLUE,
  marginBottom: 10,
};

const panelLabelGreenStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: EMERALD,
  marginBottom: 7,
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

const releasePanelStyle: CSSProperties = {
  marginBottom: 16,
  borderRadius: 22,
  border: "1px solid rgba(5,150,105,0.14)",
  background: SUCCESS_PANEL_BG,
  padding: "18px 18px 16px",
};

const releasePanelHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 14,
  marginBottom: 12,
};

const releaseTitleStyle: CSSProperties = {
  fontSize: 18,
  lineHeight: 1.25,
  fontWeight: 800,
  color: TEXT_MAIN,
};

const releaseBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "7px 10px",
  borderRadius: 999,
  background: EMERALD_SOFT,
  border: "1px solid rgba(5,150,105,0.14)",
  color: EMERALD,
  fontSize: 11,
  fontWeight: 800,
  whiteSpace: "nowrap",
};

const legalTextStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: 1.78,
  color: TEXT_SOFT,
};

const emptyRecordTextStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: 1.65,
  color: TEXT_MUTED,
  borderRadius: 14,
  border: "1px dashed rgba(100,116,139,0.22)",
  background: "rgba(255,255,255,0.54)",
  padding: "12px 13px",
};

const subSectionStyle: CSSProperties = {
  marginTop: 14,
};

const subSectionTitleStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: TEXT_SOFT,
  marginBottom: 10,
};

const stackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const stackItemStyle: CSSProperties = {
  borderRadius: 14,
  border: "1px solid rgba(71,85,105,0.08)",
  background: "rgba(255,255,255,0.72)",
  padding: "12px 13px",
};

const stackItemTitleStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: 1.55,
  fontWeight: 700,
  color: TEXT_MAIN,
};

const stackItemMetaStyle: CSSProperties = {
  marginTop: 5,
  fontSize: 12,
  color: TEXT_MUTED,
};

const lineItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  borderRadius: 14,
  border: "1px solid rgba(71,85,105,0.08)",
  background: "rgba(255,255,255,0.72)",
  padding: "12px 13px",
};

const lineItemTitleStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: 1.5,
  fontWeight: 600,
  color: TEXT_MAIN,
};

const lineItemValueStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: TEXT_MAIN,
  whiteSpace: "nowrap",
};

const totalsPanelStyle: CSSProperties = {
  marginTop: 16,
  borderRadius: 18,
  border: "1px solid rgba(71,85,105,0.10)",
  background: "rgba(255,255,255,0.82)",
  padding: 14,
};

const totalsRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "8px 0",
  borderBottom: "1px solid rgba(71,85,105,0.08)",
};

const totalsRowLastStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "10px 0 0",
};

const totalsLabelStyle: CSSProperties = {
  fontSize: 13,
  color: TEXT_SOFT,
};

const totalsValueStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: TEXT_MAIN,
};

const totalsGrandLabelStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  color: TEXT_MAIN,
};

const totalsGrandValueStyle: CSSProperties = {
  fontSize: 16,
  fontWeight: 800,
  color: TEXT_MAIN,
};

const signaturePanelStyle: CSSProperties = {
  borderRadius: 22,
  border: "1px solid rgba(71,85,105,0.10)",
  background: "rgba(255,255,255,0.96)",
  padding: 18,
};

const signatureHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 14,
  marginBottom: 16,
};

const signatureTitleStyle: CSSProperties = {
  fontSize: 18,
  lineHeight: 1.25,
  fontWeight: 800,
  color: TEXT_MAIN,
};

const requiredTextStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "7px 10px",
  borderRadius: 999,
  background: RED_SOFT,
  border: "1px solid rgba(220,38,38,0.14)",
  color: RED,
  fontSize: 11,
  fontWeight: 800,
  whiteSpace: "nowrap",
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
  marginBottom: 14,
  boxShadow: "inset 0 1px 2px rgba(15,23,42,0.04)",
};

const textareaStyle: CSSProperties = {
  width: "100%",
  minHeight: 110,
  resize: "vertical",
  padding: "14px 14px",
  borderRadius: 14,
  border: "1px solid rgba(71,85,105,0.18)",
  background: "#ffffff",
  color: TEXT_MAIN,
  outline: "none",
  fontSize: 15,
  marginBottom: 12,
  boxShadow: "inset 0 1px 2px rgba(15,23,42,0.04)",
  fontFamily: "inherit",
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

const snapshotRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "9px 0",
  borderBottom: "1px solid rgba(71,85,105,0.08)",
};

const snapshotRowLastStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "9px 0 0",
};

const snapshotLabelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: TEXT_MUTED,
};

const snapshotValueStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: TEXT_MAIN,
  textAlign: "right",
};

const sideTextStyle: CSSProperties = {
  fontSize: 13,
  lineHeight: 1.7,
  color: TEXT_SOFT,
};

const statusCardStyle: CSSProperties = {
  width: "100%",
  maxWidth: 720,
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
```
