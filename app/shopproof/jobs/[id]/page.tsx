"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getJobs } from "@/lib/shopproof";

type AnyJob = any;

type NormalizedJob = {
  id: string;
  status: string;
  approvalState: string;
  createdAt: string | null;
  updatedAt: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  vehicleYear: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleVin: string;
  vehiclePlate: string;
  vehicleColor: string;
  mileageIn: string;
  concern: string;
  requestedWork: string;
  notes: string;
  findings: string;
  diagnosticFee: string;
  writtenBy: string;
};

const THEME = {
  page:
    "linear-gradient(180deg, #dfe6ee 0%, #d7e0e9 18%, #ced8e3 44%, #cad4df 74%, #d1dbe5 100%)",
  shell:
    "linear-gradient(180deg, rgba(225,233,241,0.96) 0%, rgba(216,226,237,0.985) 48%, rgba(209,220,231,0.995) 100%)",
  panel:
    "linear-gradient(180deg, rgba(250,252,255,0.985) 0%, rgba(243,247,252,0.995) 54%, rgba(238,243,249,1) 100%)",
  card:
    "linear-gradient(180deg, rgba(247,250,254,0.98) 0%, rgba(239,245,251,1) 100%)",
  topbar:
    "linear-gradient(180deg, rgba(234,240,247,0.92) 0%, rgba(223,232,242,0.88) 100%)",
  statusBar:
    "linear-gradient(180deg, rgba(21,34,51,0.98) 0%, rgba(16,26,41,0.995) 100%)",
  text: "#132031",
  textSoft: "#223347",
  textMuted: "#61758a",
  line: "rgba(28,47,67,0.11)",
  shellBorder: "1px solid rgba(69, 94, 118, 0.20)",
  panelBorder: "1px solid rgba(84, 108, 131, 0.17)",
  cardBorder: "1px solid rgba(92, 116, 140, 0.14)",
  shellShadow: "0 30px 80px rgba(27, 39, 54, 0.16)",
  panelShadow: "0 16px 34px rgba(28, 42, 59, 0.09)",
  cardShadow: "0 12px 24px rgba(27, 40, 56, 0.06)",
  blueStrong: "#1d4ed8",
  blueSoft: "rgba(37,99,235,0.10)",
  blueLine: "rgba(37,99,235,0.28)",
  emerald: "#059669",
  emeraldSoft: "rgba(5,150,105,0.10)",
  emeraldLine: "rgba(5,150,105,0.22)",
  amber: "#ca8a04",
  amberSoft: "rgba(202,138,4,0.12)",
  amberLine: "rgba(202,138,4,0.22)",
  buttonBlue:
    "linear-gradient(180deg, rgba(37,99,235,1) 0%, rgba(29,78,216,1) 100%)",
};

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || "");

  const [rawJob, setRawJob] = useState<AnyJob | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    try {
      const jobs = getJobs();
      const found = Array.isArray(jobs)
        ? jobs.find((item: AnyJob) => String(item?.id) === id)
        : null;

      setRawJob(found || null);
    } catch (error) {
      console.warn("Job detail local load unavailable.", error);
      setRawJob(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const job = useMemo(() => (rawJob ? normalizeJob(rawJob) : null), [rawJob]);

  if (loading) {
    return <CenteredMessage title="Loading record..." />;
  }

  if (!job) {
    return (
      <CenteredMessage
        title="Job not found"
        detail="Return to the dashboard and open the job from the active list."
        actionLabel="Back to Dashboard"
        onAction={() => router.push("/shopproof/dashboard")}
      />
    );
  }

  const vehicleTitle =
    [job.vehicleYear, job.vehicleMake, job.vehicleModel]
      .filter(Boolean)
      .join(" ") || "Vehicle Record";

  const customerDisplay = job.customerName || "Unknown Customer";
  const phoneDisplay = job.customerPhone || "No Phone";

  return (
    <main style={pageStyle}>
      <div style={shellStyle}>
        <header style={topbarStyle}>
          <button
            type="button"
            onClick={() => router.push("/shopproof/dashboard")}
            style={backButtonStyle}
          >
            ← Dashboard
          </button>

          <div style={{ minWidth: 0 }}>
            <div style={eyebrowStyle}>ShopPROOF Job Record</div>
            <h1 style={titleStyle}>{vehicleTitle}</h1>
            <p style={subtitleStyle}>
              {customerDisplay} • {phoneDisplay}
            </p>
          </div>

          <div style={headerMetaStyle}>
            <div style={statusPillStyle(job.status)}>
              {job.status || "New Intake"}
            </div>
            <div style={smallMetaStyle}>ID: {job.id}</div>
          </div>
        </header>

        <section style={statusBarStyle}>
          <StatusBlock label="Record stage" value={job.status || "New Intake"} />
          <StatusBlock
            label="Approval state"
            value={job.approvalState || "Not Requested"}
          />
          <StatusBlock label="Created" value={formatDate(job.createdAt)} />
          <StatusBlock label="Updated" value={formatDate(job.updatedAt)} />
        </section>

        <div style={bodyGridStyle}>
          <main style={mainColumnStyle}>
            <Panel
              title="Vehicle Details"
              subtitle="Identity anchor for the job record."
            >
              <InfoGrid>
                <InfoItem label="Year" value={job.vehicleYear} />
                <InfoItem label="Make" value={job.vehicleMake} />
                <InfoItem label="Model" value={job.vehicleModel} />
                <InfoItem label="VIN" value={job.vehicleVin} mono wide />
                <InfoItem label="Plate" value={job.vehiclePlate} />
                <InfoItem label="Color" value={job.vehicleColor} />
                <InfoItem label="Mileage In" value={job.mileageIn} />
              </InfoGrid>
            </Panel>

            <Panel
              title="Customer Information"
              subtitle="Who the record is tied to."
            >
              <InfoGrid>
                <InfoItem label="Name" value={job.customerName} />
                <InfoItem label="Phone" value={job.customerPhone} />
                <InfoItem label="Email" value={job.customerEmail} />
                <InfoItem label="Address" value={job.customerAddress} wide />
              </InfoGrid>
            </Panel>

            <Panel
              title="Intake Snapshot"
              subtitle="The customer concern and intake context carried from creation."
            >
              <div style={{ display: "grid", gap: 14 }}>
                <TextBlock label="Primary Concern" value={job.concern} />
                <TextBlock label="Requested Work" value={job.requestedWork} />
                <TextBlock
                  label="Internal Notes / Intake Snapshot"
                  value={job.notes}
                  preserve
                />
                <TextBlock label="Findings" value={job.findings} preserve />
              </div>
            </Panel>
          </main>

          <aside style={sideColumnStyle}>
            <Panel
              title="Workflow Actions"
              subtitle="Keep the record moving without changing intake."
            >
              <div style={{ display: "grid", gap: 12 }}>
                <button
                  type="button"
                  onClick={() => router.push(`/shopproof/jobs/${job.id}/work`)}
                  style={primaryButtonStyle}
                >
                  Open Technician Work →
                </button>

                <button
                  type="button"
                  onClick={() => router.push(`/shopproof/jobs/${job.id}/final`)}
                  style={outlineButtonStyle}
                >
                  Proceed to Final Release →
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(`/shopproof/jobs/${job.id}/work-order`)
                  }
                  style={outlineButtonStyle}
                >
                  Print Work Order
                </button>

                <div style={helpBoxStyle}>
                  Work page captures technician notes and photo evidence. Final
                  Release reads this same normalized record shape so customer,
                  vehicle, concern, mileage, fee, and writer details do not
                  disappear.
                </div>
              </div>
            </Panel>

            <Panel title="Record Attribution" subtitle="Captured intake authority.">
              <InfoGrid single>
                <InfoItem
                  label="Diagnostic Fee"
                  value={job.diagnosticFee ? `$${job.diagnosticFee}` : ""}
                />
                <InfoItem label="Written By" value={job.writtenBy} />
              </InfoGrid>
            </Panel>
          </aside>
        </div>
      </div>
    </main>
  );
}

function normalizeJob(job: AnyJob): NormalizedJob {
  const vehicle = job?.vehicles || job?.vehicle || {};
  const customer = job?.customers || job?.customer || {};
  const visit = job?.visit || {};
  const notes = stringValue(job?.notes || job?.intake_notes || "");

  return {
    id: stringValue(job?.id),
    status: stringValue(job?.status || "New Intake"),
    approvalState: stringValue(
      job?.approval_state || job?.approvalState || "Not Requested"
    ),
    createdAt: stringValue(job?.created_at || job?.createdAt || "") || null,
    updatedAt: stringValue(job?.updated_at || job?.updatedAt || "") || null,

    customerName: firstNonEmpty(
      job?.customer_name,
      job?.customerName,
      customer?.name,
      joinName(customer?.firstName, customer?.lastName),
      vehicle?.customer_name
    ),
    customerPhone: firstNonEmpty(
      job?.customer_phone,
      job?.customerPhone,
      customer?.phone,
      vehicle?.customer_phone
    ),
    customerEmail: firstNonEmpty(
      job?.customer_email,
      job?.customerEmail,
      customer?.email
    ),
    customerAddress: firstNonEmpty(
      job?.customer_address,
      job?.customerAddress,
      customer?.address,
      parseSnapshotValue(notes, "Customer Address")
    ),

    vehicleYear: firstNonEmpty(vehicle?.year, job?.vehicle_year, job?.vehicleYear),
    vehicleMake: firstNonEmpty(vehicle?.make, job?.vehicle_make, job?.vehicleMake),
    vehicleModel: firstNonEmpty(
      vehicle?.model,
      job?.vehicle_model,
      job?.vehicleModel
    ),
    vehicleVin: firstNonEmpty(
      vehicle?.vin,
      job?.vin,
      job?.vehicle_vin,
      job?.vehicleVin
    ),
    vehiclePlate: firstNonEmpty(
      vehicle?.plate,
      job?.plate,
      job?.vehicle_plate,
      job?.vehiclePlate
    ),
    vehicleColor: firstNonEmpty(
      vehicle?.color,
      job?.color,
      job?.vehicle_color,
      job?.vehicleColor
    ),

    mileageIn: firstNonEmpty(
      vehicle?.mileage_in,
      vehicle?.mileageIn,
      visit?.mileageIn,
      job?.mileage_in,
      job?.mileageIn,
      parseSnapshotValue(notes, "Mileage In")
    ),

    concern: firstNonEmpty(job?.concern, job?.customerConcern, job?.complaint),
    requestedWork: firstNonEmpty(
      job?.requested_work,
      job?.requestedWork,
      parseSnapshotValue(notes, "Requested Work")
    ),
    notes,
    findings: stringValue(job?.findings || ""),
    diagnosticFee: firstNonEmpty(
      job?.diagnostic_fee,
      job?.diagnosticFee,
      parseSnapshotValue(notes, "Diagnostic Fee")
    ),
    writtenBy: firstNonEmpty(
      job?.written_by,
      job?.writtenBy,
      parseSnapshotValue(notes, "Written By")
    ),
  };
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section style={panelStyle}>
      <div style={panelHeaderStyle}>
        <div style={panelTitleStyle}>{title}</div>
        <div style={panelSubtitleStyle}>{subtitle}</div>
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </section>
  );
}

function InfoGrid({
  children,
  single,
}: {
  children: React.ReactNode;
  single?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: single ? "1fr" : "repeat(2, minmax(0, 1fr))",
        gap: 12,
      }}
    >
      {children}
    </div>
  );
}

function InfoItem({
  label,
  value,
  mono,
  wide,
}: {
  label: string;
  value: string;
  mono?: boolean;
  wide?: boolean;
}) {
  return (
    <div style={{ ...infoBoxStyle, gridColumn: wide ? "1 / -1" : undefined }}>
      <div style={infoLabelStyle}>{label}</div>
      <div style={mono ? infoValueMonoStyle : infoValueStyle}>
        {value || "—"}
      </div>
    </div>
  );
}

function TextBlock({
  label,
  value,
  preserve,
}: {
  label: string;
  value: string;
  preserve?: boolean;
}) {
  return (
    <div style={textBlockStyle}>
      <div style={infoLabelStyle}>{label}</div>
      <div
        style={{
          ...textBlockValueStyle,
          whiteSpace: preserve ? "pre-wrap" : "normal",
        }}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function StatusBlock({ label, value }: { label: string; value: string }) {
  return (
    <div style={statusBlockStyle}>
      <div style={statusLabelStyle}>{label}</div>
      <div style={statusValueStyle}>{value || "—"}</div>
    </div>
  );
}

function CenteredMessage({
  title,
  detail,
  actionLabel,
  onAction,
}: {
  title: string;
  detail?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <main style={pageStyle}>
      <div style={centerCardStyle}>
        <div style={titleStyle}>{title}</div>
        {detail ? <div style={subtitleStyle}>{detail}</div> : null}
        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            style={{ ...primaryButtonStyle, marginTop: 16 }}
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </main>
  );
}

function firstNonEmpty(...values: unknown[]) {
  for (const value of values) {
    const clean = stringValue(value);
    if (clean && clean !== "N/A") return clean;
  }
  return "";
}

function stringValue(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function joinName(first?: unknown, last?: unknown) {
  return [stringValue(first), stringValue(last)].filter(Boolean).join(" ");
}

function parseSnapshotValue(notes: string, label: string) {
  if (!notes) return "";
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = notes.match(new RegExp(`${escaped}:\\s*(.*)`, "i"));
  return match?.[1]?.trim() || "";
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

function statusPillStyle(status: string): CSSProperties {
  const normalized = status.toLowerCase();
  const isComplete =
    normalized.includes("complete") || normalized.includes("released");
  const isProgress = normalized.includes("progress");

  return {
    borderRadius: 999,
    padding: "7px 11px",
    fontSize: 12,
    fontWeight: 900,
    color: isComplete
      ? THEME.emerald
      : isProgress
        ? THEME.blueStrong
        : THEME.amber,
    background: isComplete
      ? THEME.emeraldSoft
      : isProgress
        ? THEME.blueSoft
        : THEME.amberSoft,
    border: `1px solid ${
      isComplete
        ? THEME.emeraldLine
        : isProgress
          ? THEME.blueLine
          : THEME.amberLine
    }`,
    whiteSpace: "nowrap",
  };
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  backgroundImage: `
    radial-gradient(circle at 12% 0%, rgba(37,99,235,0.08) 0%, rgba(37,99,235,0.03) 24%, rgba(37,99,235,0) 44%),
    repeating-linear-gradient(0deg, rgba(19,32,49,0.026) 0px, rgba(19,32,49,0.026) 1px, transparent 1px, transparent 56px),
    repeating-linear-gradient(90deg, rgba(19,32,49,0.016) 0px, rgba(19,32,49,0.016) 1px, transparent 1px, transparent 88px),
    ${THEME.page}
  `,
  color: THEME.text,
  padding: 18,
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
};

const shellStyle: CSSProperties = {
  maxWidth: 1320,
  margin: "0 auto",
  background: THEME.shell,
  border: THEME.shellBorder,
  borderRadius: 30,
  boxShadow: THEME.shellShadow,
  overflow: "hidden",
};

const topbarStyle: CSSProperties = {
  padding: "16px 18px 14px",
  display: "grid",
  gridTemplateColumns: "auto 1fr auto",
  gap: 14,
  alignItems: "center",
  borderBottom: `1px solid ${THEME.line}`,
  background: THEME.topbar,
};

const backButtonStyle: CSSProperties = {
  minHeight: 40,
  borderRadius: 12,
  border: THEME.cardBorder,
  background: "rgba(255,255,255,0.78)",
  color: THEME.text,
  padding: "0 14px",
  fontSize: 13,
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: THEME.cardShadow,
};

const eyebrowStyle: CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: THEME.blueStrong,
  fontWeight: 900,
};

const titleStyle: CSSProperties = {
  fontSize: 30,
  lineHeight: 1,
  fontWeight: 950,
  letterSpacing: "-0.04em",
  margin: "7px 0 0",
  color: THEME.text,
};

const subtitleStyle: CSSProperties = {
  margin: "7px 0 0",
  fontSize: 13,
  color: THEME.textMuted,
};

const headerMetaStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  justifyItems: "end",
};

const smallMetaStyle: CSSProperties = {
  fontSize: 11,
  color: THEME.textMuted,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
};

const statusBarStyle: CSSProperties = {
  background: THEME.statusBar,
  padding: "14px 18px",
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 12,
};

const statusBlockStyle: CSSProperties = {
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.04)",
  padding: "10px 12px",
};

const statusLabelStyle: CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  fontWeight: 900,
  color: "rgba(218,230,243,0.66)",
};

const statusValueStyle: CSSProperties = {
  marginTop: 5,
  fontSize: 13,
  fontWeight: 900,
  color: "#f7fbff",
};

const bodyGridStyle: CSSProperties = {
  padding: 18,
  display: "grid",
  gridTemplateColumns: "1fr 360px",
  gap: 16,
  alignItems: "start",
};

const mainColumnStyle: CSSProperties = {
  display: "grid",
  gap: 14,
};

const sideColumnStyle: CSSProperties = {
  display: "grid",
  gap: 14,
  position: "sticky",
  top: 18,
};

const panelStyle: CSSProperties = {
  borderRadius: 24,
  border: THEME.panelBorder,
  background: THEME.panel,
  boxShadow: THEME.panelShadow,
  overflow: "hidden",
};

const panelHeaderStyle: CSSProperties = {
  padding: "15px 16px 13px",
  borderBottom: `1px solid ${THEME.line}`,
};

const panelTitleStyle: CSSProperties = {
  fontSize: 18,
  lineHeight: 1.1,
  fontWeight: 950,
  letterSpacing: "-0.03em",
  color: THEME.text,
};

const panelSubtitleStyle: CSSProperties = {
  marginTop: 6,
  fontSize: 13,
  lineHeight: 1.45,
  color: THEME.textMuted,
};

const infoBoxStyle: CSSProperties = {
  borderRadius: 16,
  border: THEME.cardBorder,
  background: THEME.card,
  boxShadow: THEME.cardShadow,
  padding: "12px 13px",
  minWidth: 0,
};

const infoLabelStyle: CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  fontWeight: 900,
  color: THEME.textMuted,
  marginBottom: 6,
};

const infoValueStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 850,
  color: THEME.textSoft,
  lineHeight: 1.35,
  wordBreak: "break-word",
};

const infoValueMonoStyle: CSSProperties = {
  ...infoValueStyle,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
};

const textBlockStyle: CSSProperties = {
  borderRadius: 16,
  border: THEME.cardBorder,
  background: THEME.card,
  boxShadow: THEME.cardShadow,
  padding: "12px 13px",
};

const textBlockValueStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: 1.55,
  color: THEME.textSoft,
  wordBreak: "break-word",
};

const primaryButtonStyle: CSSProperties = {
  minHeight: 50,
  borderRadius: 14,
  border: "1px solid rgba(29,78,216,0.36)",
  background: THEME.buttonBlue,
  color: "#ffffff",
  padding: "0 16px",
  fontSize: 14,
  fontWeight: 950,
  cursor: "pointer",
  boxShadow: "0 12px 28px rgba(37,99,235,0.22)",
};

const outlineButtonStyle: CSSProperties = {
  minHeight: 46,
  borderRadius: 14,
  border: THEME.cardBorder,
  background: "rgba(255,255,255,0.72)",
  color: THEME.textSoft,
  padding: "0 16px",
  fontSize: 14,
  fontWeight: 900,
  cursor: "pointer",
};

const helpBoxStyle: CSSProperties = {
  borderRadius: 16,
  border: `1px solid ${THEME.blueLine}`,
  background: THEME.blueSoft,
  color: THEME.textSoft,
  fontSize: 12,
  lineHeight: 1.5,
  padding: "11px 12px",
};

const centerCardStyle: CSSProperties = {
  maxWidth: 520,
  margin: "15vh auto 0",
  background: THEME.panel,
  border: THEME.panelBorder,
  borderRadius: 24,
  boxShadow: THEME.panelShadow,
  padding: 24,
  textAlign: "center",
};