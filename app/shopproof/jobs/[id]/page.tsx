"use client";

import {
  CSSProperties,
  ChangeEvent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

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

type CustomerRecord = {
  id?: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
};

type VehicleRecord = {
  id?: string | null;
  year?: number | string | null;
  make?: string | null;
  model?: string | null;
  vin?: string | null;
  plate?: string | null;
  color?: string | null;
  customer_id?: string | null;
  mileage_in?: string | null;
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
  customer_id?: string | null;
  customer?: CustomerRecord | CustomerRecord[] | null;
  customers?: CustomerRecord | CustomerRecord[] | null;
  vehicle?: VehicleRecord | VehicleRecord[] | null;
  vehicles?: VehicleRecord | VehicleRecord[] | null;
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
  page:
    "linear-gradient(180deg, #dfe6ee 0%, #d7e0e9 18%, #ced8e3 44%, #cad4df 74%, #d1dbe5 100%)",
  shell:
    "linear-gradient(180deg, rgba(225,233,241,0.96) 0%, rgba(216,226,237,0.985) 48%, rgba(209,220,231,0.995) 100%)",
  shellOverlay:
    "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 22%, rgba(255,255,255,0) 48%)",
  topbar:
    "linear-gradient(180deg, rgba(234,240,247,0.92) 0%, rgba(223,232,242,0.88) 100%)",
  hero:
    "linear-gradient(180deg, rgba(21,34,51,0.98) 0%, rgba(16,26,41,0.995) 100%)",
  panel:
    "linear-gradient(180deg, rgba(250,252,255,0.985) 0%, rgba(243,247,252,0.995) 54%, rgba(238,243,249,1) 100%)",
  card:
    "linear-gradient(180deg, rgba(247,250,254,0.98) 0%, rgba(239,245,251,1) 100%)",
  input:
    "linear-gradient(180deg, rgba(253,254,255,0.98) 0%, rgba(245,249,253,1) 100%)",
  text: "#132031",
  textSoft: "#223347",
  textMuted: "#61758a",
  textOnDark: "#f3f7fb",
  textOnDarkMuted: "rgba(219,229,239,0.76)",
  line: "rgba(28,47,67,0.11)",
  lineFaint: "rgba(28,47,67,0.07)",
  shellBorder: "1px solid rgba(69, 94, 118, 0.20)",
  panelBorder: "1px solid rgba(84, 108, 131, 0.17)",
  cardBorder: "1px solid rgba(92, 116, 140, 0.14)",
  inputBorder: "1px solid rgba(101, 126, 151, 0.18)",
  shellShadow: "0 30px 80px rgba(27, 39, 54, 0.16)",
  panelShadow: "0 16px 34px rgba(28, 42, 59, 0.09)",
  cardShadow: "0 12px 24px rgba(27, 40, 56, 0.06)",
  inputInset:
    "inset 0 1px 0 rgba(255,255,255,0.78), inset 0 -1px 0 rgba(215,226,237,0.32)",
  blue: "#2563eb",
  blueStrong: "#1d4ed8",
  blueSoft: "rgba(37,99,235,0.10)",
  blueLine: "rgba(37,99,235,0.28)",
  blueGlow: "rgba(37,99,235,0.18)",
  emerald: "#059669",
  emeraldSoft: "rgba(5,150,105,0.10)",
  emeraldLine: "rgba(5,150,105,0.22)",
  amber: "#d97706",
  amberSoft: "rgba(217,119,6,0.10)",
  amberLine: "rgba(217,119,6,0.22)",
  red: "#dc2626",
  redSoft: "rgba(220,38,38,0.10)",
  redLine: "rgba(220,38,38,0.22)",
  statusBar:
    "linear-gradient(180deg, rgba(26,40,58,0.98) 0%, rgba(19,30,46,0.995) 100%)",
  buttonBlue:
    "linear-gradient(180deg, rgba(37,99,235,1) 0%, rgba(29,78,216,1) 100%)",
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

function pickVehicle(job: JobRecord): VehicleRecord | null {
  const primary = Array.isArray(job.vehicle) ? job.vehicle[0] ?? null : job.vehicle ?? null;
  const fallback = Array.isArray(job.vehicles) ? job.vehicles[0] ?? null : job.vehicles ?? null;
  return primary || fallback || null;
}

function pickCustomer(job: JobRecord): CustomerRecord | null {
  const primary = Array.isArray(job.customer) ? job.customer[0] ?? null : job.customer ?? null;
  const fallback = Array.isArray(job.customers) ? job.customers[0] ?? null : job.customers ?? null;
  return primary || fallback || null;
}

function vehicleLabelFrom(vehicle: VehicleRecord | null) {
  if (!vehicle) return "Vehicle Record";
  const parts = [vehicle.year, vehicle.make, vehicle.model]
    .map((item) => (item ?? "").toString().trim())
    .filter(Boolean);

  return parts.length ? parts.join(" ") : "Vehicle Record";
}

function intakeTextFrom(job: JobRecord) {
  const directConcern = `${job.concern ?? ""}`.trim();
  if (directConcern) return directConcern;

  const notes = `${job.notes ?? ""}`.trim();
  if (!notes) return "No concern captured yet.";

  const concernLine = notes
    .split("\n")
    .find((line) => line.toLowerCase().startsWith("concern:"));

  if (concernLine) {
    const clean = concernLine.replace(/^concern:\s*/i, "").trim();
    if (clean) return clean;
  }

  return notes;
}

function parseNotesField(notes?: string | null) {
  const text = `${notes ?? ""}`.trim();
  if (!text) {
    return {
      address: "",
      email: "",
      mileageIn: "",
      requestedWork: "",
      internalNotes: "",
      diagnosticFee: "",
      writtenBy: "",
    };
  }

  const lines = text.split("\n");

  const getValue = (label: string) => {
    const line = lines.find((entry) => entry.toLowerCase().startsWith(label.toLowerCase()));
    if (!line) return "";
    return line.replace(new RegExp(`^${label}:\\s*`, "i"), "").trim();
  };

  return {
    address: getValue("Customer Address"),
    email: getValue("Customer Email"),
    mileageIn: getValue("Mileage In"),
    requestedWork: getValue("Requested Work"),
    internalNotes: getValue("Internal Notes"),
    diagnosticFee: getValue("Diagnostic Fee"),
    writtenBy: getValue("Written By"),
  };
}

function getStatusTone(status: JobStatus): "blue" | "amber" | "emerald" | "red" {
  if (status === "Completed" || status === "Ready for Pickup") return "emerald";
  if (status === "Declined") return "red";
  if (status === "New Intake" || status === "Waiting on Approval") return "amber";
  return "blue";
}

function getApprovalTone(approval: ApprovalState): "blue" | "amber" | "emerald" | "red" {
  if (approval === "Approved") return "emerald";
  if (approval === "Declined") return "red";
  if (approval === "Pending") return "amber";
  return "blue";
}

function getToneTokens(tone: "blue" | "amber" | "emerald" | "red") {
  if (tone === "emerald") {
    return {
      text: THEME.emerald,
      soft: THEME.emeraldSoft,
      line: THEME.emeraldLine,
    };
  }

  if (tone === "amber") {
    return {
      text: THEME.amber,
      soft: THEME.amberSoft,
      line: THEME.amberLine,
    };
  }

  if (tone === "red") {
    return {
      text: THEME.red,
      soft: THEME.redSoft,
      line: THEME.redLine,
    };
  }

  return {
    text: THEME.blueStrong,
    soft: THEME.blueSoft,
    line: THEME.blueLine,
  };
}

function statusBadgeStyle(status: JobStatus): CSSProperties {
  const tokens = getToneTokens(getStatusTone(status));

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
    color: tokens.text,
    background: tokens.soft,
    border: `1px solid ${tokens.line}`,
  };
}

function approvalBadgeStyle(approval: ApprovalState): CSSProperties {
  const tokens = getToneTokens(getApprovalTone(approval));

  return {
    borderRadius: 999,
    padding: "7px 11px",
    fontSize: "0.78rem",
    fontWeight: 800,
    letterSpacing: "0.03em",
    display: "inline-flex",
    alignItems: "center",
    width: "fit-content",
    color: tokens.text,
    background: tokens.soft,
    border: `1px solid ${tokens.line}`,
  };
}

export default function ShopProofJobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [job, setJob] = useState<JobRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [loadMessage, setLoadMessage] = useState("");
  const [usingFallback, setUsingFallback] = useState(false);
  const [width, setWidth] = useState(1440);

  const [status, setStatus] = useState<JobStatus>("New Intake");
  const [assignedTo, setAssignedTo] = useState("");
  const [findings, setFindings] = useState("");
  const [approvalState, setApprovalState] = useState<ApprovalState>("Not Requested");

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!jobId) return;

    let cancelled = false;

    async function loadJob() {
      setLoading(true);
      setLoadMessage("");
      setUsingFallback(false);

      try {
        const supabase = getSupabaseClient();

        if (!supabase) {
          throw new Error("Supabase not configured.");
        }

        const { data, error } = await supabase
          .from("jobs")
          .select(
            `
              id,
              status,
              assigned_to,
              notes,
              concern,
              findings,
              approval_state,
              created_at,
              updated_at,
              vehicle_id,
              customer_id,
              customer:customers!jobs_customer_id_fkey (
                id,
                name,
                phone,
                email,
                address
              ),
              vehicle:vehicles!jobs_vehicle_id_fkey (
                id,
                year,
                make,
                model,
                vin,
                plate,
                color,
                customer_id
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
            concern: data.concern ?? "",
            findings: data.findings ?? "",
            customer: data.customer ?? null,
            vehicle: data.vehicle ?? null,
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
            concern: localJob.concern ?? "",
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

  const isMobile = width < 900;
  const vehicle = useMemo(() => (job ? pickVehicle(job) : null), [job]);
  const customer = useMemo(() => (job ? pickCustomer(job) : null), [job]);
  const vehicleLabel = useMemo(() => vehicleLabelFrom(vehicle), [vehicle]);
  const parsedNotes = useMemo(() => parseNotesField(job?.notes), [job?.notes]);

  async function handleSave() {
    if (!job) return;

    setSaving(true);
    setSaveMessage("");

    const nextTimestamp = new Date().toISOString();

    const payload = {
      status,
      assigned_to: assignedTo.trim() || null,
      findings: findings.trim() || null,
      approval_state: approvalState,
      updated_at: nextTimestamp,
    };

    let savedToSupabase = false;

    try {
      const supabase = getSupabaseClient();

      if (!supabase) {
        throw new Error("Supabase not configured.");
      }

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
      updated_at: nextTimestamp,
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
      <main style={pageStyle}>
        <div style={{ ...shellStyle, marginTop: 18 }}>
          <section style={loadingCardStyle}>
            <div style={eyebrowDarkStyle}>ShopPROOF Record</div>
            <h1 style={loadingTitleStyle}>Loading job record...</h1>
            <p style={loadingTextStyle}>
              Pulling the active ShopPROOF record and related vehicle/customer data.
            </p>
          </section>
        </div>
      </main>
    );
  }

  if (!job) {
    return (
      <main style={pageStyle}>
        <div style={{ ...shellStyle, marginTop: 18 }}>
          <div style={topBarStyle}>
            <button
              type="button"
              onClick={() => router.push("/shopproof/dashboard")}
              style={ghostButtonStyle}
            >
              Back to Dashboard
            </button>
          </div>

          <section style={notFoundCardStyle}>
            <div style={eyebrowDarkStyle}>Job Record</div>
            <h1 style={notFoundTitleStyle}>Job not found</h1>
            <p style={notFoundTextStyle}>
              This ShopPROOF record could not be loaded from Supabase or local fallback.
            </p>

            {loadMessage ? <div style={messageMutedStyle}>{loadMessage}</div> : null}

            <div style={{ marginTop: 16 }}>
              <button
                type="button"
                onClick={() => router.push("/shopproof/dashboard")}
                style={primaryButtonStyle}
              >
                Return to Dashboard
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        ...pageStyle,
        padding: isMobile ? 8 : 18,
      }}
    >
      <div style={shellStyle}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `
              ${THEME.shellOverlay},
              radial-gradient(circle at 14% 0%, rgba(37,99,235,0.08), transparent 28%),
              radial-gradient(circle at 86% 0%, rgba(5,150,105,0.05), transparent 24%)
            `,
          }}
        />

        <header style={topHeaderStyle}>
          <div style={brandWrapStyle}>
            <button
              type="button"
              onClick={() => router.push("/shopproof/dashboard")}
              style={iconButtonStyle()}
            >
              ←
            </button>

            <div style={brandShieldStyle()}>
              <span style={{ fontWeight: 900, color: THEME.blueStrong }}>SP</span>
            </div>

            <div>
              <div style={brandTitleStyle}>ShopPROOF Record</div>
              <div style={brandSubStyle}>Single vehicle record command page</div>
            </div>
          </div>

          <div style={headerActionsStyle}>
            <Link href="/shopproof/new" style={ghostButtonStyle}>
              New Intake
            </Link>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                ...primaryButtonStyle,
                opacity: saving ? 0.8 : 1,
                cursor: saving ? "wait" : "pointer",
              }}
            >
              {saving ? "Saving..." : "Save Record"}
            </button>
          </div>
        </header>

        <section style={heroStyle}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1.35fr 0.95fr",
              gap: 16,
              alignItems: "start",
            }}
          >
            <div>
              <div style={eyebrowDarkStyle}>Active Vehicle Record</div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 14,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h1 style={heroTitleStyle}>{vehicleLabel}</h1>
                  <div style={heroSubStyle}>
                    {customer?.name?.trim() || "Customer not attached"} ·{" "}
                    {vehicle?.vin?.trim() || "VIN not attached"}
                  </div>
                </div>

                <div style={statusBadgeStyle(status)}>{status}</div>
              </div>

              <div style={heroMetaGridStyle(isMobile)}>
                <MetaCard label="Customer" value={customer?.name?.trim() || "—"} dark />
                <MetaCard label="Phone" value={customer?.phone?.trim() || "—"} dark />
                <MetaCard label="Plate" value={vehicle?.plate?.trim() || "—"} dark />
                <MetaCard label="Color" value={vehicle?.color?.trim() || "—"} dark />
                <MetaCard label="Mileage In" value={parsedNotes.mileageIn || "—"} dark />
                <MetaCard label="Written By" value={parsedNotes.writtenBy || "—"} dark />
              </div>
            </div>

            <div style={heroSnapshotStyle}>
              <div style={snapshotTitleStyle}>Record Snapshot</div>

              <SnapshotRow label="Created" value={formatDate(job.created_at)} />
              <SnapshotRow label="Updated" value={formatDate(job.updated_at)} />
              <SnapshotRow
                label="Approval"
                valueNode={
                  <span style={approvalBadgeStyle(approvalState)}>{approvalState}</span>
                }
              />
              <SnapshotRow label="Assigned To" value={assignedTo.trim() || "Not assigned"} />
              <SnapshotRow
                label="Data Source"
                value={usingFallback ? "Local fallback" : "Live Supabase"}
              />

              <div style={{ marginTop: 14 }}>
                {usingFallback ? (
                  <InlineBadge tone="amber" text="Local fallback active" />
                ) : (
                  <InlineBadge tone="emerald" text="Live Supabase record" />
                )}
              </div>
            </div>
          </div>
        </section>

        <section style={statusBandStyle}>
          <div style={statusBandGridStyle(isMobile)}>
            <BandField
              label="Job Status"
              control={
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as JobStatus)}
                  style={inputStyle(true)}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              }
            />

            <BandField
              label="Assigned To"
              control={
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(event) => setAssignedTo(event.target.value)}
                  placeholder="Technician or staff name"
                  style={inputStyle()}
                />
              }
            />

            <BandField
              label="Approval State"
              control={
                <select
                  value={approvalState}
                  onChange={(event) => setApprovalState(event.target.value as ApprovalState)}
                  style={inputStyle(true)}
                >
                  {APPROVAL_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              }
            />

            <div style={statusBandNoteStyle}>
              <div style={statusBandNoteTitleStyle}>Control layer</div>
              <div style={statusBandNoteTextStyle}>
                This section updates the live record status, assignment, and approval state.
              </div>
            </div>
          </div>
        </section>

        <div
          style={{
            padding: isMobile ? 10 : 18,
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.35fr 0.95fr",
            gap: isMobile ? 10 : 16,
            alignItems: "start",
          }}
        >
          <div style={{ display: "grid", gap: isMobile ? 10 : 14 }}>
            <Panel
              title="Customer concern"
              subtitle="What was brought in, reported, or documented at intake."
              accent="blue"
            >
              <div style={readOnlyBoxStyle}>{intakeTextFrom(job)}</div>
            </Panel>

            <Panel
              title="Technician findings"
              subtitle="Diagnosis, inspection notes, test results, and repair observations."
              accent="emerald"
            >
              <textarea
                value={findings}
                onChange={handleFindingsChange}
                placeholder="Add technician findings, test results, inspection notes, or repair updates..."
                style={textareaStyle}
              />
            </Panel>

            <Panel
              title="Intake support details"
              subtitle="Supplemental intake information carried forward from the original intake record."
              accent="blue"
            >
              <div style={detailsGridStyle(isMobile)}>
                <InfoCard
                  label="Customer Address"
                  value={customer?.address?.trim() || parsedNotes.address || "—"}
                />
                <InfoCard
                  label="Customer Email"
                  value={customer?.email?.trim() || parsedNotes.email || "—"}
                />
                <InfoCard
                  label="Requested Work"
                  value={parsedNotes.requestedWork || "—"}
                />
                <InfoCard
                  label="Diagnostic Fee"
                  value={parsedNotes.diagnosticFee || "—"}
                />
                <InfoCard
                  label="Internal Notes"
                  value={parsedNotes.internalNotes || "—"}
                  wide
                />
              </div>
            </Panel>
          </div>

          <div style={{ display: "grid", gap: isMobile ? 10 : 14 }}>
            <Panel
              title="Workflow reference"
              subtitle="This page anchors the record between intake, approval, and final release."
              accent="blue"
            >
              <div style={flowListStyle}>
                <FlowItem
                  tone="amber"
                  title="Intake created"
                  text="Customer, vehicle, concern, and intake-side details were captured."
                />
                <FlowItem
                  tone="blue"
                  title="Findings added here"
                  text="Use this page to document technician findings and live record state."
                />
                <FlowItem
                  tone="amber"
                  title="Approval downstream"
                  text="Approval belongs in the authorization / work-order flow, not inside intake."
                />
                <FlowItem
                  tone="emerald"
                  title="Final release later"
                  text="Final release and completed documentation happen at the end of the chain."
                />
              </div>
            </Panel>

            <Panel
              title="Record state"
              subtitle="Current save/load state for this record."
              accent="emerald"
            >
              {saveMessage ? (
                <div style={messageLiveStyle}>{saveMessage}</div>
              ) : (
                <div style={messageMutedStyle}>
                  Changes are staged here until you save the record.
                </div>
              )}

              {loadMessage && !saveMessage ? (
                <div style={{ ...messageMutedStyle, marginTop: 10 }}>{loadMessage}</div>
              ) : null}
            </Panel>

            <Panel
              title="Next actions"
              subtitle="Move deliberately into the next real record step."
              accent="blue"
            >
              <div style={{ display: "grid", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => router.push(`/shopproof/jobs/${job.id}/work-order`)}
                  style={ghostButtonStyle}
                >
                  Continue to Work Order
                </button>

                <button
                  type="button"
                  onClick={() => router.push(`/shopproof/jobs/${job.id}/final`)}
                  style={ghostButtonStyle}
                >
                  Complete Final Release
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/shopproof/dashboard")}
                  style={ghostButtonStyle}
                >
                  Back to Dashboard
                </button>

                <Link href="/shopproof/new" style={ghostButtonStyle}>
                  Start Another Intake
                </Link>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    ...primaryButtonStyle,
                    opacity: saving ? 0.8 : 1,
                    cursor: saving ? "wait" : "pointer",
                  }}
                >
                  {saving ? "Saving..." : "Save Record"}
                </button>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </main>
  );
}

function Panel({
  title,
  subtitle,
  children,
  accent = "blue",
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  accent?: "blue" | "emerald";
}) {
  const accentColor = accent === "emerald" ? THEME.emeraldLine : THEME.blueLine;
  const accentGlow =
    accent === "emerald" ? "rgba(5,150,105,0.08)" : "rgba(37,99,235,0.08)";

  return (
    <section
      style={{
        borderRadius: 24,
        border: THEME.panelBorder,
        background: THEME.panel,
        boxShadow: THEME.panelShadow,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: accentColor,
          opacity: 0.9,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 72,
          pointerEvents: "none",
          background: `linear-gradient(180deg, ${accentGlow} 0%, rgba(255,255,255,0) 100%)`,
        }}
      />

      <div
        style={{
          position: "relative",
          padding: "15px 16px 13px",
          borderBottom: `1px solid ${THEME.lineFaint}`,
        }}
      >
        <div style={panelEyebrowStyle}>Record Section</div>
        <h2 style={panelTitleStyle}>{title}</h2>
        <div style={panelSubtitleStyle}>{subtitle}</div>
      </div>

      <div style={{ position: "relative", padding: 16 }}>{children}</div>
    </section>
  );
}

function MetaCard({
  label,
  value,
  dark,
}: {
  label: string;
  value: string;
  dark?: boolean;
}) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: dark ? "1px solid rgba(255,255,255,0.10)" : THEME.cardBorder,
        background: dark ? "rgba(255,255,255,0.04)" : THEME.card,
        padding: "12px 13px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          fontWeight: 800,
          color: dark ? "rgba(219,229,239,0.64)" : THEME.textMuted,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: dark ? THEME.textOnDark : THEME.textSoft,
          lineHeight: 1.4,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SnapshotRow({
  label,
  value,
  valueNode,
}: {
  label: string;
  value?: string;
  valueNode?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 14,
        alignItems: "center",
        padding: "11px 0",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          color: "rgba(219,229,239,0.70)",
          fontSize: "0.86rem",
          fontWeight: 700,
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: THEME.textOnDark,
          fontSize: "0.9rem",
          fontWeight: 700,
          textAlign: "right",
        }}
      >
        {valueNode ?? value}
      </div>
    </div>
  );
}

function InlineBadge({
  tone,
  text,
}: {
  tone: "blue" | "amber" | "emerald" | "red";
  text: string;
}) {
  const tokens = getToneTokens(tone);

  return (
    <div
      style={{
        width: "fit-content",
        padding: "8px 12px",
        borderRadius: 999,
        background: tokens.soft,
        border: `1px solid ${tokens.line}`,
        color: tokens.text,
        fontSize: "0.8rem",
        fontWeight: 800,
      }}
    >
      {text}
    </div>
  );
}

function BandField({
  label,
  control,
}: {
  label: string;
  control: ReactNode;
}) {
  return (
    <div style={{ display: "grid", gap: 7 }}>
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          fontWeight: 800,
          color: "rgba(219,229,239,0.70)",
        }}
      >
        {label}
      </div>
      {control}
    </div>
  );
}

function InfoCard({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div
      style={{
        gridColumn: wide ? "1 / -1" : undefined,
        borderRadius: 18,
        border: THEME.cardBorder,
        background: THEME.card,
        boxShadow: THEME.cardShadow,
        padding: 14,
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          fontWeight: 800,
          color: THEME.textMuted,
          marginBottom: 7,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.5,
          color: THEME.textSoft,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function FlowItem({
  tone,
  title,
  text,
}: {
  tone: "blue" | "amber" | "emerald" | "red";
  title: string;
  text: string;
}) {
  const tokens = getToneTokens(tone);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 12,
        alignItems: "start",
        paddingBottom: 14,
        borderBottom: `1px solid ${THEME.lineFaint}`,
      }}
    >
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: 999,
          marginTop: 5,
          background: tokens.text,
          boxShadow: `0 0 0 6px ${tokens.soft}`,
          flexShrink: 0,
        }}
      />
      <div>
        <div
          style={{
            fontSize: "0.96rem",
            fontWeight: 800,
            color: THEME.textSoft,
            marginBottom: 4,
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: THEME.textMuted,
            fontSize: "0.9rem",
            lineHeight: 1.5,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

function inputStyle(hasSelectArrow?: boolean): CSSProperties {
  return {
    width: "100%",
    minHeight: 46,
    borderRadius: 14,
    border: THEME.inputBorder,
    background: THEME.input,
    color: THEME.text,
    padding: hasSelectArrow ? "0 38px 0 14px" : "0 14px",
    fontSize: 14,
    outline: "none",
    boxShadow: THEME.inputInset,
    appearance: hasSelectArrow ? "none" : undefined,
    WebkitAppearance: hasSelectArrow ? "none" : undefined,
  };
}

function iconButtonStyle(): CSSProperties {
  return {
    width: 40,
    height: 40,
    borderRadius: 12,
    border: THEME.cardBorder,
    background: "rgba(255,255,255,0.78)",
    color: THEME.text,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: THEME.cardShadow,
  };
}

function brandShieldStyle(): CSSProperties {
  return {
    width: 42,
    height: 42,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: THEME.cardBorder,
    background: "rgba(255,255,255,0.80)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.76)",
    flexShrink: 0,
  };
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  backgroundImage: `
    radial-gradient(circle at 12% 0%, rgba(37,99,235,0.08) 0%, rgba(37,99,235,0.03) 24%, rgba(37,99,235,0) 44%),
    radial-gradient(circle at 100% 0%, rgba(5,150,105,0.05) 0%, rgba(5,150,105,0.02) 18%, rgba(5,150,105,0) 34%),
    linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.03) 22%, rgba(255,255,255,0) 42%),
    repeating-linear-gradient(
      0deg,
      rgba(19,32,49,0.026) 0px,
      rgba(19,32,49,0.026) 1px,
      transparent 1px,
      transparent 56px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(19,32,49,0.016) 0px,
      rgba(19,32,49,0.016) 1px,
      transparent 1px,
      transparent 88px
    ),
    ${THEME.page}
  `,
  color: THEME.text,
};

const shellStyle: CSSProperties = {
  maxWidth: 1380,
  margin: "0 auto",
  background: THEME.shell,
  border: THEME.shellBorder,
  borderRadius: 30,
  boxShadow: THEME.shellShadow,
  overflow: "hidden",
  position: "relative",
};

const topHeaderStyle: CSSProperties = {
  position: "relative",
  padding: "16px 18px 14px",
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: 14,
  alignItems: "center",
  borderBottom: `1px solid ${THEME.line}`,
  background: THEME.topbar,
};

const topBarStyle: CSSProperties = {
  padding: "18px",
  display: "flex",
  justifyContent: "flex-start",
};

const brandWrapStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  minWidth: 0,
  flexWrap: "wrap",
};

const brandTitleStyle: CSSProperties = {
  fontSize: 28,
  lineHeight: 1,
  fontWeight: 900,
  letterSpacing: "-0.04em",
  color: THEME.text,
};

const brandSubStyle: CSSProperties = {
  marginTop: 5,
  fontSize: 13,
  color: THEME.textMuted,
};

const headerActionsStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  flexWrap: "wrap",
};

const heroStyle: CSSProperties = {
  position: "relative",
  background: THEME.hero,
  borderBottom: `1px solid rgba(255,255,255,0.08)`,
  padding: "18px",
};

const heroTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
  lineHeight: 1.04,
  fontWeight: 900,
  letterSpacing: "-0.03em",
  color: THEME.textOnDark,
};

const heroSubStyle: CSSProperties = {
  marginTop: 7,
  color: THEME.textOnDarkMuted,
  fontSize: "0.96rem",
  lineHeight: 1.5,
};

const heroSnapshotStyle: CSSProperties = {
  borderRadius: 20,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.04)",
  padding: 16,
};

const snapshotTitleStyle: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 900,
  color: THEME.textOnDark,
  marginBottom: 6,
};

const statusBandStyle: CSSProperties = {
  position: "relative",
  background: THEME.statusBar,
  borderBottom: `1px solid rgba(255,255,255,0.08)`,
  padding: "14px 18px",
};

const statusBandNoteStyle: CSSProperties = {
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.04)",
  padding: "10px 12px",
};

const statusBandNoteTitleStyle: CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  fontWeight: 800,
  color: "rgba(219,229,239,0.66)",
  marginBottom: 5,
};

const statusBandNoteTextStyle: CSSProperties = {
  fontSize: 13,
  lineHeight: 1.45,
  color: "rgba(240,246,252,0.92)",
};

const panelEyebrowStyle: CSSProperties = {
  color: THEME.blueStrong,
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
  color: THEME.text,
};

const panelSubtitleStyle: CSSProperties = {
  marginTop: 7,
  color: THEME.textMuted,
  fontSize: "0.9rem",
  lineHeight: 1.5,
};

const readOnlyBoxStyle: CSSProperties = {
  minHeight: 110,
  borderRadius: 18,
  border: THEME.cardBorder,
  background: THEME.card,
  boxShadow: THEME.cardShadow,
  padding: 18,
  color: THEME.textSoft,
  fontSize: "0.98rem",
  lineHeight: 1.6,
  whiteSpace: "pre-wrap",
};

const textareaStyle: CSSProperties = {
  width: "100%",
  minHeight: 260,
  resize: "vertical",
  borderRadius: 18,
  border: THEME.inputBorder,
  background: THEME.input,
  color: THEME.text,
  padding: "16px 16px",
  outline: "none",
  fontSize: "0.96rem",
  lineHeight: 1.55,
  boxShadow: THEME.inputInset,
};

const flowListStyle: CSSProperties = {
  display: "grid",
  gap: 14,
};

const messageLiveStyle: CSSProperties = {
  borderRadius: 16,
  padding: "14px 16px",
  background: THEME.blueSoft,
  border: `1px solid ${THEME.blueLine}`,
  color: THEME.blueStrong,
  fontSize: "0.92rem",
  fontWeight: 700,
};

const messageMutedStyle: CSSProperties = {
  borderRadius: 16,
  padding: "14px 16px",
  background: THEME.card,
  border: THEME.cardBorder,
  color: THEME.textMuted,
  fontSize: "0.9rem",
  lineHeight: 1.5,
};

const primaryButtonStyle: CSSProperties = {
  borderRadius: 14,
  border: "1px solid rgba(29,78,216,0.36)",
  background: THEME.buttonBlue,
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
  border: THEME.cardBorder,
  background: "rgba(255,255,255,0.78)",
  color: THEME.text,
  textDecoration: "none",
  padding: "11px 15px",
  fontSize: "0.94rem",
  fontWeight: 800,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  boxShadow: THEME.cardShadow,
};

const loadingCardStyle: CSSProperties = {
  width: "100%",
  maxWidth: 620,
  margin: "80px auto",
  borderRadius: 28,
  padding: 30,
  background: THEME.panel,
  border: THEME.panelBorder,
  boxShadow: THEME.panelShadow,
};

const loadingTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "2rem",
  fontWeight: 900,
  color: THEME.text,
};

const loadingTextStyle: CSSProperties = {
  marginTop: 10,
  marginBottom: 0,
  color: THEME.textMuted,
  lineHeight: 1.6,
};

const notFoundCardStyle: CSSProperties = {
  width: "100%",
  maxWidth: 620,
  margin: "24px auto 60px",
  borderRadius: 28,
  padding: 30,
  background: THEME.panel,
  border: THEME.panelBorder,
  boxShadow: THEME.panelShadow,
};

const notFoundTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "2.1rem",
  fontWeight: 900,
  letterSpacing: "-0.03em",
  color: THEME.text,
};

const notFoundTextStyle: CSSProperties = {
  marginTop: 10,
  marginBottom: 18,
  color: THEME.textMuted,
  lineHeight: 1.65,
};

const eyebrowDarkStyle: CSSProperties = {
  color: THEME.blueStrong,
  fontSize: "0.76rem",
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  marginBottom: 8,
};

function heroMetaGridStyle(isMobile: boolean): CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
    gap: 12,
    marginTop: 16,
  };
}

function statusBandGridStyle(isMobile: boolean): CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr 1fr",
    gap: 12,
    alignItems: "end",
  };
}

function detailsGridStyle(isMobile: boolean): CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    gap: 12,
  };
}