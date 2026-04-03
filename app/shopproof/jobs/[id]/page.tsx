"use client";

import { CSSProperties, ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type JobStatus =
  | "New Intake"
  | "Waiting on Approval"
  | "Approved"
  | "In Progress"
  | "Waiting on Parts"
  | "Ready for Pickup"
  | "Completed"
  | "Declined";

type ApprovalState =
  | "Not Requested"
  | "Pending"
  | "Approved"
  | "Declined";

type VehicleRecord = {
  year?: number | string | null;
  make?: string | null;
  model?: string | null;
  vin?: string | null;
  plate?: string | null;
  color?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
};

type JobRecord = {
  id: string;
  status: JobStatus;
  assigned_to?: string | null;
  notes?: string | null;
  concern?: string | null;
  findings?: string | null;
  approval_state?: ApprovalState | null;
  created_at?: string | null;
  updated_at?: string | null;
  vehicle_id?: string | null;
  vehicle?: VehicleRecord | null;
  vehicles?: VehicleRecord | null;
};

const JOB_STORAGE_KEY = "shopproof_jobs";

const STATUS_OPTIONS: JobStatus[] = [
  "New Intake",
  "Waiting on Approval",
  "Approved",
  "In Progress",
  "Waiting on Parts",
  "Ready for Pickup",
  "Completed",
  "Declined",
];

const APPROVAL_OPTIONS: ApprovalState[] = [
  "Not Requested",
  "Pending",
  "Approved",
  "Declined",
];

const THEME = {
  bg: "#07111f",
  bgGlowTop: "radial-gradient(circle at top, rgba(59,130,246,0.20), transparent 34%)",
  bgGlowBottom: "radial-gradient(circle at bottom right, rgba(14,165,233,0.16), transparent 28%)",
  shell: "rgba(8, 15, 28, 0.92)",
  shellBorder: "rgba(148, 163, 184, 0.18)",
  panel: "rgba(11, 21, 38, 0.92)",
  panelAlt: "rgba(15, 27, 48, 0.88)",
  panelBorder: "rgba(148, 163, 184, 0.16)",
  softBorder: "rgba(148, 163, 184, 0.12)",
  text: "#e5eefb",
  textMuted: "#9fb2cc",
  textSoft: "#7f95b3",
  blue: "#3b82f6",
  blueStrong: "#2563eb",
  blueGlow: "rgba(37, 99, 235, 0.34)",
  cyan: "#38bdf8",
  emerald: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
  shadowLg: "0 22px 60px rgba(0, 0, 0, 0.42)",
  shadowMd: "0 14px 34px rgba(0, 0, 0, 0.28)",
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function normalizeStatus(value?: string | null): JobStatus {
  if (!value) return "New Intake";
  const found = STATUS_OPTIONS.find((item) => item === value);
  return found ?? "New Intake";
}

function normalizeApproval(value?: string | null): ApprovalState {
  if (!value) return "Not Requested";
  const found = APPROVAL_OPTIONS.find((item) => item === value);
  return found ?? "Not Requested";
}

function readLocalJobs(): JobRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(JOB_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalJobs(jobs: JobRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(JOB_STORAGE_KEY, JSON.stringify(jobs));
}

function getStatusPillStyle(status: JobStatus): CSSProperties {
  const map: Record<JobStatus, CSSProperties> = {
    "New Intake": {
      color: "#fde68a",
      background: "rgba(245, 158, 11, 0.14)",
      border: "1px solid rgba(245, 158, 11, 0.28)",
    },
    "Waiting on Approval": {
      color: "#fdba74",
      background: "rgba(251, 146, 60, 0.14)",
      border: "1px solid rgba(251, 146, 60, 0.28)",
    },
    Approved: {
      color: "#93c5fd",
      background: "rgba(59, 130, 246, 0.14)",
      border: "1px solid rgba(59, 130, 246, 0.28)",
    },
    "In Progress": {
      color: "#93c5fd",
      background: "rgba(37, 99, 235, 0.16)",
      border: "1px solid rgba(37, 99, 235, 0.30)",
    },
    "Waiting on Parts": {
      color: "#c4b5fd",
      background: "rgba(139, 92, 246, 0.16)",
      border: "1px solid rgba(139, 92, 246, 0.28)",
    },
    "Ready for Pickup": {
      color: "#86efac",
      background: "rgba(34, 197, 94, 0.16)",
      border: "1px solid rgba(34, 197, 94, 0.30)",
    },
    Completed: {
      color: "#86efac",
      background: "rgba(22, 163, 74, 0.16)",
      border: "1px solid rgba(22, 163, 74, 0.30)",
    },
    Declined: {
      color: "#fca5a5",
      background: "rgba(239, 68, 68, 0.14)",
      border: "1px solid rgba(239, 68, 68, 0.28)",
    },
  };

  return {
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: "0.82rem",
    fontWeight: 800,
    letterSpacing: "0.02em",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    width: "fit-content",
    ...map[status],
  };
}

export default function ShopProofJobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [job, setJob] = useState<JobRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [loadMessage, setLoadMessage] = useState<string>("");
  const [usingFallback, setUsingFallback] = useState(false);

  const [status, setStatus] = useState<JobStatus>("New Intake");
  const [assignedTo, setAssignedTo] = useState("");
  const [findings, setFindings] = useState("");
  const [approvalState, setApprovalState] = useState<ApprovalState>("Not Requested");

  useEffect(() => {
    if (!jobId) return;

    let cancelled = false;

    async function loadJob() {
      setLoading(true);
      setLoadMessage("");
      setUsingFallback(false);

      try {
        const { data, error } = await supabase
          .from("jobs")
          .select(
            `
              *,
              vehicles:vehicles!jobs_vehicle_id_fkey (
                year,
                make,
                model,
                vin,
                plate,
                color,
                customer_name,
                customer_phone
              )
            `
          )
          .eq("id", jobId)
          .single();

        if (error) throw error;

        if (!cancelled && data) {
          const normalized: JobRecord = {
            ...data,
            status: normalizeStatus(data.status),
            approval_state: normalizeApproval(data.approval_state),
            concern: data.concern ?? data.notes ?? "",
            findings: data.findings ?? "",
            vehicles: data.vehicles ?? null,
          };

          setJob(normalized);
          setStatus(normalized.status);
          setAssignedTo(normalized.assigned_to ?? "");
          setFindings(normalized.findings ?? "");
          setApprovalState(normalizeApproval(normalized.approval_state));
          setLoading(false);
          return;
        }
      } catch {
        const localJobs = readLocalJobs();
        const localJob = localJobs.find((item) => item.id === jobId) ?? null;

        if (!cancelled && localJob) {
          const normalizedLocal: JobRecord = {
            ...localJob,
            status: normalizeStatus(localJob.status),
            approval_state: normalizeApproval(localJob.approval_state),
            concern: localJob.concern ?? localJob.notes ?? "",
            findings: localJob.findings ?? "",
          };

          setUsingFallback(true);
          setLoadMessage("Loaded from local fallback.");
          setJob(normalizedLocal);
          setStatus(normalizedLocal.status);
          setAssignedTo(normalizedLocal.assigned_to ?? "");
          setFindings(normalizedLocal.findings ?? "");
          setApprovalState(normalizeApproval(normalizedLocal.approval_state));
          setLoading(false);
          return;
        }

        if (!cancelled) {
          setLoadMessage("Job not found.");
          setJob(null);
          setLoading(false);
        }
      }
    }

    loadJob();

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const vehicle = useMemo(() => {
    if (!job) return null;
    return job.vehicles ?? job.vehicle ?? null;
  }, [job]);

  const vehicleLabel = useMemo(() => {
    if (!vehicle) return "Vehicle Record";
    const parts = [vehicle.year, vehicle.make, vehicle.model]
      .map((item) => (item ?? "").toString().trim())
      .filter(Boolean);

    return parts.length ? parts.join(" ") : "Vehicle Record";
  }, [vehicle]);

  async function handleSave() {
    if (!job) return;

    setSaving(true);
    setSaveMessage("");

    const payload = {
      status,
      assigned_to: assignedTo.trim() || null,
      findings: findings.trim() || null,
      approval_state: approvalState,
      updated_at: new Date().toISOString(),
    };

    let savedToSupabase = false;

    try {
      const { error } = await supabase.from("jobs").update(payload).eq("id", job.id);

      if (error) throw error;
      savedToSupabase = true;
    } catch {
      savedToSupabase = false;
    }

    const nextJob: JobRecord = {
      ...job,
      status,
      assigned_to: assignedTo.trim() || null,
      findings: findings.trim() || null,
      approval_state: approvalState,
      updated_at: new Date().toISOString(),
    };

    setJob(nextJob);

    const localJobs = readLocalJobs();
    const existingIndex = localJobs.findIndex((item) => item.id === nextJob.id);

    if (existingIndex >= 0) {
      localJobs[existingIndex] = {
        ...localJobs[existingIndex],
        ...nextJob,
      };
    } else {
      localJobs.unshift(nextJob);
    }

    writeLocalJobs(localJobs);

    setUsingFallback(!savedToSupabase);
    setSaveMessage(savedToSupabase ? "Job updated." : "Saved to local fallback.");
    setSaving(false);
  }

  function handleFindingsChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setFindings(event.target.value);
  }

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={backdropStyle} />
        <div style={shellStyle}>
          <div style={loadingWrapStyle}>
            <div style={loadingCardStyle}>
              <div style={eyebrowStyle}>ShopPROOF</div>
              <h1 style={loadingTitleStyle}>Loading job record...</h1>
              <p style={loadingTextStyle}>
                Pulling the live record from ShopPROOF.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={pageStyle}>
        <div style={backdropStyle} />
        <div style={shellStyle}>
          <div style={topBarStyle}>
            <Link href="/shopproof/dashboard" style={ghostButtonStyle}>
              ← Back to Dashboard
            </Link>
          </div>

          <div style={notFoundWrapStyle}>
            <div style={notFoundCardStyle}>
              <div style={eyebrowStyle}>Job Record</div>
              <h1 style={notFoundTitleStyle}>Job not found</h1>
              <p style={notFoundTextStyle}>
                This ShopPROOF record could not be loaded from Supabase or local
                fallback.
              </p>

              {loadMessage ? (
                <div style={messageMutedStyle}>{loadMessage}</div>
              ) : null}

              <button
                type="button"
                onClick={() => router.push("/shopproof/dashboard")}
                style={primaryButtonStyle}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={backdropStyle} />

      <div style={shellStyle}>
        <div style={topBarStyle}>
          <div style={brandBlockStyle}>
            <div style={brandBadgeStyle}>SP</div>
            <div>
              <div style={brandTitleStyle}>ShopPROOF</div>
              <div style={brandSubStyle}>Evidence-Based Repair Workflow</div>
            </div>
          </div>

          <div style={topBarActionsStyle}>
            <Link href="/shopproof/dashboard" style={ghostButtonStyle}>
              ← Dashboard
            </Link>
            <Link href="/shopproof/new" style={primaryButtonStyle}>
              + New Intake
            </Link>
          </div>
        </div>

        <div style={heroGridStyle}>
          <section style={heroCardStyle}>
            <div style={heroHeaderRowStyle}>
              <div>
                <div style={eyebrowStyle}>Job Record</div>
                <h1 style={heroTitleStyle}>{vehicleLabel}</h1>
              </div>

              <div style={getStatusPillStyle(status)}>{status}</div>
            </div>

            <div style={heroMetaGridStyle}>
              <div style={metaBlockStyle}>
                <div style={metaLabelStyle}>Customer</div>
                <div style={metaValueStyle}>
                  {vehicle?.customer_name?.trim() || "Walk-in / Unassigned"}
                </div>
              </div>

              <div style={metaBlockStyle}>
                <div style={metaLabelStyle}>VIN</div>
                <div style={metaValueStyle}>{vehicle?.vin?.trim() || "—"}</div>
              </div>

              <div style={metaBlockStyle}>
                <div style={metaLabelStyle}>Plate</div>
                <div style={metaValueStyle}>{vehicle?.plate?.trim() || "—"}</div>
              </div>

              <div style={metaBlockStyle}>
                <div style={metaLabelStyle}>Color</div>
                <div style={metaValueStyle}>{vehicle?.color?.trim() || "—"}</div>
              </div>
            </div>
          </section>

          <aside style={snapshotCardStyle}>
            <div style={snapshotTitleStyle}>Record Snapshot</div>

            <div style={snapshotItemStyle}>
              <span style={snapshotLabelStyle}>Created</span>
              <span style={snapshotValueStyle}>{formatDate(job.created_at)}</span>
            </div>

            <div style={snapshotItemStyle}>
              <span style={snapshotLabelStyle}>Updated</span>
              <span style={snapshotValueStyle}>{formatDate(job.updated_at)}</span>
            </div>

            <div style={snapshotItemStyle}>
              <span style={snapshotLabelStyle}>Assigned To</span>
              <span style={snapshotValueStyle}>
                {assignedTo.trim() || "Not Assigned"}
              </span>
            </div>

            <div style={snapshotItemStyle}>
              <span style={snapshotLabelStyle}>Approval</span>
              <span style={snapshotValueStyle}>{approvalState}</span>
            </div>

            {usingFallback ? (
              <div style={fallbackBadgeStyle}>Local fallback active</div>
            ) : (
              <div style={liveBadgeStyle}>Live Supabase record</div>
            )}
          </aside>
        </div>

        <div style={contentGridStyle}>
          <section style={mainColumnStyle}>
            <div style={panelStyle}>
              <div style={panelHeaderStyle}>
                <div>
                  <div style={panelEyebrowStyle}>Core Controls</div>
                  <h2 style={panelTitleStyle}>Status + Assignment</h2>
                </div>
                <div style={panelHeaderNoteStyle}>
                  This is the primary job-control area.
                </div>
              </div>

              <div style={fieldGridStyle}>
                <div style={fieldGroupStyle}>
                  <label htmlFor="status" style={labelStyle}>
                    Job Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value as JobStatus)}
                    style={selectStyle}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={fieldGroupStyle}>
                  <label htmlFor="assignedTo" style={labelStyle}>
                    Assigned To
                  </label>
                  <input
                    id="assignedTo"
                    type="text"
                    value={assignedTo}
                    onChange={(event) => setAssignedTo(event.target.value)}
                    placeholder="Technician or staff name"
                    style={inputStyle}
                  />
                </div>

                <div style={{ ...fieldGroupStyle, gridColumn: "1 / -1" }}>
                  <label htmlFor="approvalState" style={labelStyle}>
                    Approval State
                  </label>
                  <select
                    id="approvalState"
                    value={approvalState}
                    onChange={(event) =>
                      setApprovalState(event.target.value as ApprovalState)
                    }
                    style={selectStyle}
                  >
                    {APPROVAL_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div style={panelStyle}>
              <div style={panelHeaderStyle}>
                <div>
                  <div style={panelEyebrowStyle}>Intake Concern</div>
                  <h2 style={panelTitleStyle}>Customer / Intake Notes</h2>
                </div>
              </div>

              <div style={readOnlyBoxStyle}>
                {(job.concern ?? job.notes ?? "").trim() || "No concern captured yet."}
              </div>
            </div>

            <div style={panelStyle}>
              <div style={panelHeaderStyle}>
                <div>
                  <div style={panelEyebrowStyle}>Tech Input</div>
                  <h2 style={panelTitleStyle}>Findings</h2>
                </div>
                <div style={panelHeaderNoteStyle}>
                  Diagnosis, inspection notes, and repair findings.
                </div>
              </div>

              <textarea
                value={findings}
                onChange={handleFindingsChange}
                placeholder="Add technician findings, test results, inspection notes, or repair updates..."
                style={textareaStyle}
              />
            </div>
          </section>

          <aside style={sideColumnStyle}>
            <div style={panelAltStyle}>
              <div style={panelHeaderStyle}>
                <div>
                  <div style={panelEyebrowStyle}>Workflow</div>
                  <h2 style={panelTitleStyle}>Stage Guide</h2>
                </div>
              </div>

              <div style={flowListStyle}>
                <div style={flowItemStyle}>
                  <div style={flowDotStyle(THEME.blue)} />
                  <div>
                    <div style={flowTitleStyle}>Intake</div>
                    <div style={flowTextStyle}>Vehicle and concern captured.</div>
                  </div>
                </div>

                <div style={flowItemStyle}>
                  <div style={flowDotStyle(THEME.cyan)} />
                  <div>
                    <div style={flowTitleStyle}>Diagnose</div>
                    <div style={flowTextStyle}>
                      Findings entered and reviewed.
                    </div>
                  </div>
                </div>

                <div style={flowItemStyle}>
                  <div style={flowDotStyle(THEME.amber)} />
                  <div>
                    <div style={flowTitleStyle}>Approve</div>
                    <div style={flowTextStyle}>
                      Approval state tracks the decision.
                    </div>
                  </div>
                </div>

                <div style={flowItemStyle}>
                  <div style={flowDotStyle(THEME.emerald)} />
                  <div>
                    <div style={flowTitleStyle}>Repair → Complete</div>
                    <div style={flowTextStyle}>
                      Move the job through live status updates.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={panelAltStyle}>
              <div style={panelHeaderStyle}>
                <div>
                  <div style={panelEyebrowStyle}>Record Status</div>
                  <h2 style={panelTitleStyle}>Save State</h2>
                </div>
              </div>

              {saveMessage ? (
                <div style={messageLiveStyle}>{saveMessage}</div>
              ) : (
                <div style={messageMutedStyle}>
                  Changes are staged here before saving.
                </div>
              )}

              {loadMessage && !saveMessage ? (
                <div style={{ ...messageMutedStyle, marginTop: 10 }}>
                  {loadMessage}
                </div>
              ) : null}
            </div>
          </aside>
        </div>

        <div style={bottomBarStyle}>
          <button
            type="button"
            onClick={() => router.push("/shopproof/dashboard")}
            style={ghostButtonStyle}
          >
            Back to Dashboard
          </button>

          <div style={bottomBarRightStyle}>
            <Link href="/shopproof/new" style={ghostButtonStyle}>
              New Intake
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                ...primaryButtonStyle,
                opacity: saving ? 0.7 : 1,
                cursor: saving ? "wait" : "pointer",
              }}
            >
              {saving ? "Saving..." : "Save Job Updates"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  position: "relative",
  background: THEME.bg,
  color: THEME.text,
  overflow: "hidden",
};

const backdropStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: `${THEME.bgGlowTop}, ${THEME.bgGlowBottom}`,
  pointerEvents: "none",
};

const shellStyle: CSSProperties = {
  position: "relative",
  zIndex: 1,
  maxWidth: 1440,
  margin: "0 auto",
  padding: "28px 20px 48px",
};

const topBarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 22,
  flexWrap: "wrap",
};

const brandBlockStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
};

const brandBadgeStyle: CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 14,
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(135deg, rgba(37, 99, 235, 0.95), rgba(56, 189, 248, 0.85))",
  color: "#eff6ff",
  fontWeight: 900,
  letterSpacing: "0.04em",
  boxShadow: `0 12px 28px ${THEME.blueGlow}`,
};

const brandTitleStyle: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 900,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const brandSubStyle: CSSProperties = {
  marginTop: 3,
  color: THEME.textMuted,
  fontSize: "0.9rem",
};

const topBarActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const heroGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.8fr) minmax(320px, 0.9fr)",
  gap: 18,
  alignItems: "stretch",
  marginBottom: 18,
};

const heroCardStyle: CSSProperties = {
  background: `linear-gradient(180deg, rgba(15, 27, 48, 0.96), rgba(9, 18, 33, 0.96))`,
  border: `1px solid ${THEME.panelBorder}`,
  borderRadius: 24,
  padding: 24,
  boxShadow: THEME.shadowLg,
};

const snapshotCardStyle: CSSProperties = {
  background: `linear-gradient(180deg, rgba(12, 23, 42, 0.94), rgba(9, 16, 31, 0.96))`,
  border: `1px solid ${THEME.panelBorder}`,
  borderRadius: 24,
  padding: 22,
  boxShadow: THEME.shadowMd,
};

const heroHeaderRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 18,
  flexWrap: "wrap",
  marginBottom: 20,
};

const eyebrowStyle: CSSProperties = {
  color: THEME.cyan,
  fontSize: "0.76rem",
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  marginBottom: 8,
};

const heroTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
  lineHeight: 1.04,
  fontWeight: 900,
  letterSpacing: "-0.03em",
};

const heroMetaGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 14,
};

const metaBlockStyle: CSSProperties = {
  background: "rgba(8, 16, 30, 0.62)",
  border: `1px solid ${THEME.softBorder}`,
  borderRadius: 18,
  padding: "14px 16px",
};

const metaLabelStyle: CSSProperties = {
  color: THEME.textSoft,
  fontSize: "0.76rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  marginBottom: 8,
};

const metaValueStyle: CSSProperties = {
  color: THEME.text,
  fontSize: "1rem",
  fontWeight: 700,
  lineHeight: 1.4,
};

const snapshotTitleStyle: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 900,
  marginBottom: 14,
};

const snapshotItemStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 14,
  alignItems: "center",
  padding: "12px 0",
  borderBottom: `1px solid ${THEME.softBorder}`,
};

const snapshotLabelStyle: CSSProperties = {
  color: THEME.textMuted,
  fontSize: "0.86rem",
  fontWeight: 700,
};

const snapshotValueStyle: CSSProperties = {
  color: THEME.text,
  fontSize: "0.9rem",
  fontWeight: 700,
  textAlign: "right",
};

const liveBadgeStyle: CSSProperties = {
  marginTop: 16,
  width: "fit-content",
  padding: "8px 12px",
  borderRadius: 999,
  background: "rgba(34, 197, 94, 0.14)",
  border: "1px solid rgba(34, 197, 94, 0.24)",
  color: "#86efac",
  fontSize: "0.8rem",
  fontWeight: 800,
};

const fallbackBadgeStyle: CSSProperties = {
  marginTop: 16,
  width: "fit-content",
  padding: "8px 12px",
  borderRadius: 999,
  background: "rgba(245, 158, 11, 0.14)",
  border: "1px solid rgba(245, 158, 11, 0.24)",
  color: "#fde68a",
  fontSize: "0.8rem",
  fontWeight: 800,
};

const contentGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.55fr) minmax(300px, 0.82fr)",
  gap: 18,
  alignItems: "start",
};

const mainColumnStyle: CSSProperties = {
  display: "grid",
  gap: 18,
};

const sideColumnStyle: CSSProperties = {
  display: "grid",
  gap: 18,
};

const panelStyle: CSSProperties = {
  background: THEME.panel,
  border: `1px solid ${THEME.panelBorder}`,
  borderRadius: 24,
  padding: 22,
  boxShadow: THEME.shadowMd,
};

const panelAltStyle: CSSProperties = {
  background: THEME.panelAlt,
  border: `1px solid ${THEME.panelBorder}`,
  borderRadius: 24,
  padding: 22,
  boxShadow: THEME.shadowMd,
};

const panelHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
  marginBottom: 16,
};

const panelEyebrowStyle: CSSProperties = {
  color: THEME.cyan,
  fontSize: "0.74rem",
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  marginBottom: 8,
};

const panelTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "1.2rem",
  fontWeight: 900,
  letterSpacing: "-0.02em",
};

const panelHeaderNoteStyle: CSSProperties = {
  color: THEME.textMuted,
  fontSize: "0.88rem",
  maxWidth: 300,
  lineHeight: 1.45,
};

const fieldGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 16,
};

const fieldGroupStyle: CSSProperties = {
  display: "grid",
  gap: 8,
};

const labelStyle: CSSProperties = {
  color: THEME.textMuted,
  fontSize: "0.84rem",
  fontWeight: 700,
};

const inputStyle: CSSProperties = {
  width: "100%",
  minHeight: 46,
  borderRadius: 14,
  border: `1px solid ${THEME.panelBorder}`,
  background: "rgba(5, 11, 22, 0.88)",
  color: THEME.text,
  padding: "0 14px",
  outline: "none",
  fontSize: "0.96rem",
};

const selectStyle: CSSProperties = {
  width: "100%",
  minHeight: 46,
  borderRadius: 14,
  border: `1px solid ${THEME.panelBorder}`,
  background: "rgba(5, 11, 22, 0.88)",
  color: THEME.text,
  padding: "0 14px",
  outline: "none",
  fontSize: "0.96rem",
};

const textareaStyle: CSSProperties = {
  width: "100%",
  minHeight: 220,
  resize: "vertical",
  borderRadius: 18,
  border: `1px solid ${THEME.panelBorder}`,
  background: "rgba(5, 11, 22, 0.88)",
  color: THEME.text,
  padding: "16px 16px",
  outline: "none",
  fontSize: "0.96rem",
  lineHeight: 1.55,
};

const readOnlyBoxStyle: CSSProperties = {
  minHeight: 110,
  borderRadius: 18,
  border: `1px solid ${THEME.softBorder}`,
  background: "rgba(7, 14, 27, 0.72)",
  padding: 18,
  color: THEME.text,
  fontSize: "0.98rem",
  lineHeight: 1.6,
  whiteSpace: "pre-wrap",
};

const flowListStyle: CSSProperties = {
  display: "grid",
  gap: 16,
};

const flowItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  paddingBottom: 14,
  borderBottom: `1px solid ${THEME.softBorder}`,
};

const flowDotStyle = (color: string): CSSProperties => ({
  width: 12,
  height: 12,
  borderRadius: 999,
  marginTop: 5,
  background: color,
  boxShadow: `0 0 0 6px ${color}22`,
  flexShrink: 0,
});

const flowTitleStyle: CSSProperties = {
  fontSize: "0.96rem",
  fontWeight: 800,
  marginBottom: 4,
};

const flowTextStyle: CSSProperties = {
  color: THEME.textMuted,
  fontSize: "0.9rem",
  lineHeight: 1.5,
};

const messageLiveStyle: CSSProperties = {
  borderRadius: 16,
  padding: "14px 16px",
  background: "rgba(37, 99, 235, 0.14)",
  border: "1px solid rgba(37, 99, 235, 0.24)",
  color: "#bfdbfe",
  fontSize: "0.92rem",
  fontWeight: 700,
};

const messageMutedStyle: CSSProperties = {
  borderRadius: 16,
  padding: "14px 16px",
  background: "rgba(8, 16, 30, 0.76)",
  border: `1px solid ${THEME.softBorder}`,
  color: THEME.textMuted,
  fontSize: "0.9rem",
  lineHeight: 1.5,
};

const bottomBarStyle: CSSProperties = {
  marginTop: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  padding: 18,
  borderRadius: 22,
  background: "rgba(7, 14, 27, 0.84)",
  border: `1px solid ${THEME.panelBorder}`,
  boxShadow: THEME.shadowMd,
};

const bottomBarRightStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const primaryButtonStyle: CSSProperties = {
  borderRadius: 14,
  border: "1px solid rgba(59, 130, 246, 0.28)",
  background: "linear-gradient(135deg, rgba(37, 99, 235, 0.98), rgba(56, 189, 248, 0.88))",
  color: "#eff6ff",
  textDecoration: "none",
  padding: "11px 15px",
  fontSize: "0.94rem",
  fontWeight: 800,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  boxShadow: `0 12px 28px ${THEME.blueGlow}`,
};

const ghostButtonStyle: CSSProperties = {
  borderRadius: 14,
  border: `1px solid ${THEME.panelBorder}`,
  background: "rgba(10, 18, 33, 0.82)",
  color: THEME.text,
  textDecoration: "none",
  padding: "11px 15px",
  fontSize: "0.94rem",
  fontWeight: 800,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

const loadingWrapStyle: CSSProperties = {
  minHeight: "80vh",
  display: "grid",
  placeItems: "center",
};

const loadingCardStyle: CSSProperties = {
  width: "100%",
  maxWidth: 560,
  borderRadius: 26,
  padding: 28,
  background: THEME.panel,
  border: `1px solid ${THEME.panelBorder}`,
  boxShadow: THEME.shadowLg,
};

const loadingTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "2rem",
  fontWeight: 900,
};

const loadingTextStyle: CSSProperties = {
  marginTop: 10,
  marginBottom: 0,
  color: THEME.textMuted,
  lineHeight: 1.6,
};

const notFoundWrapStyle: CSSProperties = {
  minHeight: "78vh",
  display: "grid",
  placeItems: "center",
};

const notFoundCardStyle: CSSProperties = {
  width: "100%",
  maxWidth: 620,
  borderRadius: 28,
  padding: 30,
  background: THEME.panel,
  border: `1px solid ${THEME.panelBorder}`,
  boxShadow: THEME.shadowLg,
};

const notFoundTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "2.1rem",
  fontWeight: 900,
  letterSpacing: "-0.03em",
};

const notFoundTextStyle: CSSProperties = {
  marginTop: 10,
  marginBottom: 18,
  color: THEME.textMuted,
  lineHeight: 1.65,
};