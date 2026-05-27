"use client";

import { CSSProperties, useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Camera, CircleCheck as CheckCircle, ChevronRight, Clock, FileText, LoaderCircle, Shield, Wrench } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";

type AnyJob = Record<string, any>;

type NormalizedJob = {
  id: string;
  status: string;
  approvalState: string;
  createdAt: string | null;
  updatedAt: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
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
  workPerformed: string;
  recommendedRepairs: string;
  diagnosticFee: string;
  writtenBy: string;
  assignedTo: string;
  approvalToken: string;
  approvalSignedBy: string;
  approvalSignedAt: string | null;
  approvalMethod: string;
  releaseSignedBy: string;
  releaseSignedAt: string | null;
};

const THEME = {
  page: "linear-gradient(180deg, #dfe6ee 0%, #d7e0e9 18%, #ced8e3 44%, #cad4df 74%, #d1dbe5 100%)",
  shell: "linear-gradient(180deg, rgba(225,233,241,0.96) 0%, rgba(216,226,237,0.985) 48%, rgba(209,220,231,0.995) 100%)",
  panel: "linear-gradient(180deg, rgba(250,252,255,0.985) 0%, rgba(243,247,252,0.995) 54%, rgba(238,243,249,1) 100%)",
  card: "linear-gradient(180deg, rgba(247,250,254,0.98) 0%, rgba(239,245,251,1) 100%)",
  topbar: "linear-gradient(180deg, rgba(234,240,247,0.92) 0%, rgba(223,232,242,0.88) 100%)",
  statusBar: "linear-gradient(180deg, rgba(21,34,51,0.98) 0%, rgba(16,26,41,0.995) 100%)",
  text: "#132031",
  textSoft: "#223347",
  textMuted: "#61758a",
  textDim: "#8099b0",
  textOnDark: "#f3f7fb",
  textOnDarkMuted: "rgba(219,229,239,0.70)",
  line: "rgba(28,47,67,0.11)",
  shellBorder: "1px solid rgba(69,94,118,0.20)",
  panelBorder: "1px solid rgba(84,108,131,0.17)",
  cardBorder: "1px solid rgba(92,116,140,0.14)",
  shellShadow: "0 30px 80px rgba(27,39,54,0.16)",
  panelShadow: "0 16px 34px rgba(28,42,59,0.09)",
  cardShadow: "0 12px 24px rgba(27,40,56,0.06)",
  blue: "#2563eb",
  blueStrong: "#1d4ed8",
  blueSoft: "rgba(37,99,235,0.10)",
  blueLine: "rgba(37,99,235,0.28)",
  emerald: "#059669",
  emeraldSoft: "rgba(5,150,105,0.10)",
  emeraldLine: "rgba(5,150,105,0.22)",
  amber: "#ca8a04",
  amberSoft: "rgba(202,138,4,0.12)",
  amberLine: "rgba(202,138,4,0.22)",
  red: "#dc2626",
  redSoft: "rgba(220,38,38,0.10)",
  redLine: "rgba(220,38,38,0.22)",
  buttonBlue: "linear-gradient(180deg, rgba(37,99,235,1) 0%, rgba(29,78,216,1) 100%)",
};

const STATUS_OPTIONS = [
  "New Intake",
  "In Progress",
  "Waiting on Approval",
  "Approved",
  "Waiting on Parts",
  "Ready for Pickup",
  "Completed",
  "Declined",
];

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || "");
  const [rawJob, setRawJob] = useState<AnyJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [width, setWidth] = useState(1440);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = width < 820;

  const loadJob = useCallback(async () => {
    if (!id) return;
    setLoading(true);

    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select(`
            *,
            customer:customers!jobs_customer_id_fkey (id, name, phone, email),
            vehicle:vehicles!jobs_vehicle_id_fkey (id, vin, year, make, model, plate, color, mileage_in)
          `)
          .eq("id", id)
          .maybeSingle();

        if (!error && data) {
          setRawJob(data);
          setLoading(false);
          return;
        }
      } catch {
        // fall through to local
      }
    }

    // Local fallback
    try {
      const raw = localStorage.getItem("shopproof_jobs");
      const jobs = raw ? JSON.parse(raw) : [];
      const found = Array.isArray(jobs)
        ? jobs.find((j: AnyJob) => String(j?.id) === id)
        : null;
      setRawJob(found || null);
    } catch {
      setRawJob(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadJob(); }, [loadJob]);

  const job = useMemo(() => (rawJob ? normalizeJob(rawJob) : null), [rawJob]);

  async function updateStatus(newStatus: string) {
    if (!rawJob || statusUpdating) return;
    setStatusUpdating(true);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from("jobs")
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq("id", id);
      } catch {
        // ignore
      }
    }

    // Update locally
    try {
      const raw = localStorage.getItem("shopproof_jobs");
      const jobs = raw ? JSON.parse(raw) : [];
      const updated = jobs.map((j: AnyJob) =>
        String(j?.id) === id
          ? { ...j, status: newStatus, updated_at: new Date().toISOString() }
          : j
      );
      localStorage.setItem("shopproof_jobs", JSON.stringify(updated));
    } catch {
      // ignore
    }

    setRawJob((prev: AnyJob | null) =>
      prev ? { ...prev, status: newStatus, updated_at: new Date().toISOString() } : prev
    );
    setStatusUpdating(false);
  }

  if (loading) {
    return (
      <CenteredMsg>
        <LoaderCircle size={18} className="spin" />
        Loading record...
      </CenteredMsg>
    );
  }

  if (!job) {
    return (
      <main style={pageStyle}>
        <div style={centerCardStyle}>
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 10, color: THEME.text }}>
            Job not found
          </div>
          <p style={{ fontSize: 13, color: THEME.textMuted, marginBottom: 16, lineHeight: 1.5 }}>
            Return to the dashboard and open the job from the active list.
          </p>
          <button
            type="button"
            onClick={() => router.push("/shopproof/dashboard")}
            style={primaryButtonStyle}
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  const vehicleTitle =
    [job.vehicleYear, job.vehicleMake, job.vehicleModel].filter(Boolean).join(" ") ||
    "Vehicle Record";

  const isReleased = !!job.releaseSignedBy;
  const isApproved = job.approvalState === "approved" || !!job.approvalSignedBy;

  return (
    <main style={pageStyle}>
      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          background: THEME.shell,
          border: THEME.shellBorder,
          borderRadius: 30,
          boxShadow: THEME.shellShadow,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <header
          style={{
            background: THEME.topbar,
            borderBottom: `1px solid ${THEME.line}`,
            padding: isMobile ? "14px 12px" : "16px 20px",
            display: "grid",
            gridTemplateColumns: isMobile ? "auto 1fr" : "auto 1fr auto",
            gap: 14,
            alignItems: "center",
          }}
        >
          <button
            type="button"
            onClick={() => router.push("/shopproof/dashboard")}
            style={backButtonStyle}
          >
            <ArrowLeft size={15} />
            {isMobile ? "" : "Dashboard"}
          </button>

          <div style={{ minWidth: 0 }}>
            <div style={eyebrowStyle}>ShopPROOF Job Record</div>
            <h1 style={isMobile ? { ...titleStyle, fontSize: 22 } : titleStyle}>{vehicleTitle}</h1>
            <p style={subtitleStyle}>
              {job.customerName || "Unknown Customer"} •{" "}
              {job.customerPhone || "No Phone"}
            </p>
          </div>

          {!isMobile && (
            <div style={{ display: "grid", gap: 6, justifyItems: "end" }}>
              <StatusPill status={job.status} />
              <div style={smallMetaStyle}>ID: {job.id.substring(0, 8)}</div>
            </div>
          )}
        </header>

        {/* Status bar */}
        <section
          style={{
            background: THEME.statusBar,
            padding: isMobile ? "12px 12px" : "14px 20px",
            display: "grid",
            gridTemplateColumns: `repeat(${isMobile ? 2 : 4}, minmax(0, 1fr))`,
            gap: 10,
          }}
        >
          <StatusBlock label="Record Stage" value={job.status || "New Intake"} />
          <StatusBlock label="Approval" value={job.approvalState === "not_requested" ? "Not Requested" : job.approvalState} />
          <StatusBlock label="Created" value={formatDate(job.createdAt)} />
          <StatusBlock label="Updated" value={formatDate(job.updatedAt)} />
        </section>

        {/* Body */}
        <div
          style={{
            padding: isMobile ? "12px 10px" : "18px",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 360px",
            gap: 16,
            alignItems: "start",
          }}
        >
          {/* Main column */}
          <div style={{ display: "grid", gap: 14 }}>
            <Panel title="Vehicle Details" subtitle="Identity anchor for the job record.">
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

            <Panel title="Customer Information" subtitle="Who the record is tied to.">
              <InfoGrid>
                <InfoItem label="Name" value={job.customerName} />
                <InfoItem label="Phone" value={job.customerPhone} />
                <InfoItem label="Email" value={job.customerEmail} wide />
              </InfoGrid>
            </Panel>

            <Panel title="Intake Snapshot" subtitle="The customer concern and intake context from creation.">
              <div style={{ display: "grid", gap: 12 }}>
                <TextBlock label="Customer Concern" value={job.concern} />
                <TextBlock label="Requested Work" value={job.requestedWork} />
                <TextBlock label="Internal Intake Notes" value={job.notes} preserve />
              </div>
            </Panel>

            {(job.findings || job.workPerformed || job.recommendedRepairs) && (
              <Panel title="Technician Documentation" subtitle="Findings and work attribution captured on the work record.">
                <div style={{ display: "grid", gap: 12 }}>
                  {job.findings && <TextBlock label="Findings / Diagnostics" value={job.findings} preserve />}
                  {job.workPerformed && <TextBlock label="Work Performed" value={job.workPerformed} preserve />}
                  {job.recommendedRepairs && <TextBlock label="Recommended Repairs" value={job.recommendedRepairs} preserve />}
                </div>
              </Panel>
            )}

            {/* Release/Approval record */}
            {(isApproved || isReleased) && (
              <Panel
                title="Authorization Record"
                subtitle="Customer acknowledgment and release verification."
              >
                <div style={{ display: "grid", gap: 12 }}>
                  {isApproved && (
                    <div
                      style={{
                        borderRadius: 16,
                        border: `1px solid ${THEME.emeraldLine}`,
                        background: THEME.emeraldSoft,
                        padding: "12px 14px",
                        display: "grid",
                        gap: 5,
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 900, color: THEME.emerald, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Approval Signed
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: THEME.textSoft }}>
                        {job.approvalSignedBy || "Signed"} • {job.approvalMethod || "in person"} • {formatDate(job.approvalSignedAt)}
                      </div>
                    </div>
                  )}
                  {isReleased && (
                    <div
                      style={{
                        borderRadius: 16,
                        border: `1px solid ${THEME.emeraldLine}`,
                        background: THEME.emeraldSoft,
                        padding: "12px 14px",
                        display: "grid",
                        gap: 5,
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 900, color: THEME.emerald, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Final Release Signed
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: THEME.textSoft }}>
                        {job.releaseSignedBy} • {formatDate(job.releaseSignedAt)}
                      </div>
                    </div>
                  )}
                </div>
              </Panel>
            )}
          </div>

          {/* Sidebar */}
          <aside style={{ display: "grid", gap: 14, position: isMobile ? undefined : "sticky", top: 18 }}>
            {/* Status update */}
            <Panel title="Job Status" subtitle="Update the current stage of this record.">
              <div style={{ display: "grid", gap: 10 }}>
                <select
                  value={job.status}
                  onChange={(e) => updateStatus(e.target.value)}
                  disabled={statusUpdating}
                  style={selectStyle}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {statusUpdating && (
                  <div style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                    <LoaderCircle size={13} className="spin" />
                    Updating status...
                  </div>
                )}
              </div>
            </Panel>

            {/* Workflow Actions */}
            <Panel title="Workflow Actions" subtitle="Move this record through the documentation lifecycle.">
              <div style={{ display: "grid", gap: 10 }}>
                <ActionButton
                  icon={<Wrench size={16} />}
                  label="Open Technician Work"
                  onClick={() => router.push(`/shopproof/jobs/${job.id}/work`)}
                  primary
                />
                <ActionButton
                  icon={<Camera size={16} />}
                  label="Evidence Gallery"
                  onClick={() => router.push(`/shopproof/jobs/${job.id}/work`)}
                />
                <ActionButton
                  icon={<CheckCircle size={16} />}
                  label="Customer Approval"
                  onClick={() => {
                    const token = job.approvalToken || generateToken();
                    router.push(`/shopproof/sign/${token}`);
                  }}
                />
                <ActionButton
                  icon={<Shield size={16} />}
                  label="Final Release"
                  onClick={() => router.push(`/shopproof/jobs/${job.id}/final`)}
                />
                <ActionButton
                  icon={<FileText size={16} />}
                  label="Print Work Order"
                  onClick={() => router.push(`/shopproof/jobs/${job.id}/work-order`)}
                />
              </div>
            </Panel>

            {/* Attribution */}
            <Panel title="Record Attribution" subtitle="Captured intake authority.">
              <div style={{ display: "grid", gap: 10 }}>
                <InfoItem label="Written By" value={job.writtenBy} />
                <InfoItem
                  label="Diagnostic Fee"
                  value={job.diagnosticFee ? `$${job.diagnosticFee}` : ""}
                />
                <InfoItem label="Assigned To" value={job.assignedTo} />
              </div>
            </Panel>
          </aside>
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
      `}</style>
    </main>
  );
}

function CenteredMsg({ children }: { children: React.ReactNode }) {
  return (
    <main style={pageStyle}>
      <div
        style={{
          ...centerCardStyle,
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          fontSize: 14,
          fontWeight: 800,
          color: THEME.textSoft,
          padding: "18px 22px",
        }}
      >
        {children}
      </div>
    </main>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        borderRadius: 24,
        border: THEME.panelBorder,
        background: THEME.panel,
        boxShadow: THEME.panelShadow,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 16px 12px",
          borderBottom: `1px solid ${THEME.line}`,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 950, letterSpacing: "-0.03em", color: THEME.text }}>
          {title}
        </div>
        <div style={{ marginTop: 4, fontSize: 12, color: THEME.textMuted, lineHeight: 1.45 }}>
          {subtitle}
        </div>
      </div>
      <div style={{ padding: 14 }}>{children}</div>
    </section>
  );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
      {children}
    </div>
  );
}

function InfoItem({ label, value, mono, wide }: { label: string; value: string; mono?: boolean; wide?: boolean }) {
  return (
    <div
      style={{
        borderRadius: 14,
        border: THEME.cardBorder,
        background: THEME.card,
        boxShadow: THEME.cardShadow,
        padding: "10px 12px",
        minWidth: 0,
        gridColumn: wide ? "1 / -1" : undefined,
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontWeight: 900,
          color: THEME.textMuted,
          marginBottom: 5,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: THEME.textSoft,
          lineHeight: 1.35,
          wordBreak: "break-word",
          fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : undefined,
        }}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function TextBlock({ label, value, preserve }: { label: string; value: string; preserve?: boolean }) {
  return (
    <div
      style={{
        borderRadius: 14,
        border: THEME.cardBorder,
        background: THEME.card,
        boxShadow: THEME.cardShadow,
        padding: "10px 12px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontWeight: 900,
          color: THEME.textMuted,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          lineHeight: 1.6,
          color: THEME.textSoft,
          wordBreak: "break-word",
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
    <div
      style={{
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
        padding: "10px 12px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          fontWeight: 900,
          color: "rgba(218,230,243,0.60)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 5,
          fontSize: 13,
          fontWeight: 900,
          color: THEME.textOnDark,
        }}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const s = status.toLowerCase();
  const isComplete = s.includes("complete") || s.includes("pickup");
  const isPending = s.includes("approval") || s.includes("waiting");
  const isDeclined = s.includes("declined");

  const color = isComplete
    ? THEME.emerald
    : isPending
    ? THEME.amber
    : isDeclined
    ? THEME.red
    : THEME.blue;
  const bg = isComplete
    ? THEME.emeraldSoft
    : isPending
    ? THEME.amberSoft
    : isDeclined
    ? THEME.redSoft
    : THEME.blueSoft;
  const border = isComplete
    ? THEME.emeraldLine
    : isPending
    ? THEME.amberLine
    : isDeclined
    ? THEME.redLine
    : THEME.blueLine;

  return (
    <span
      style={{
        borderRadius: 999,
        padding: "6px 11px",
        fontSize: 11,
        fontWeight: 900,
        color,
        background: bg,
        border: `1px solid ${border}`,
        whiteSpace: "nowrap",
      }}
    >
      {status || "New Intake"}
    </span>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  primary,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={primary ? primaryButtonStyle : outlineButtonStyle}
    >
      {icon}
      {label}
      <ChevronRight size={15} style={{ marginLeft: "auto" }} />
    </button>
  );
}

function normalizeJob(job: AnyJob): NormalizedJob {
  const vehicle = job?.vehicle || job?.vehicles || {};
  const customer = job?.customer || job?.customers || {};
  const notes = sv(job?.notes || job?.intake_notes || "");

  return {
    id: sv(job?.id),
    status: sv(job?.status || "New Intake"),
    approvalState: sv(job?.approval_state || job?.approvalState || "not_requested"),
    createdAt: sv(job?.created_at || job?.createdAt || "") || null,
    updatedAt: sv(job?.updated_at || job?.updatedAt || "") || null,
    customerName: fne(job?.customer_name, job?.customerName, customer?.name),
    customerPhone: fne(job?.customer_phone, job?.customerPhone, customer?.phone),
    customerEmail: fne(job?.customer_email, job?.customerEmail, customer?.email),
    vehicleYear: fne(vehicle?.year, job?.vehicle_year, job?.vehicleYear),
    vehicleMake: fne(vehicle?.make, job?.vehicle_make, job?.vehicleMake),
    vehicleModel: fne(vehicle?.model, job?.vehicle_model, job?.vehicleModel),
    vehicleVin: fne(vehicle?.vin, job?.vin, job?.vehicle_vin, job?.vehicleVin),
    vehiclePlate: fne(vehicle?.plate, job?.plate, job?.vehicle_plate, job?.vehiclePlate),
    vehicleColor: fne(vehicle?.color, job?.color, job?.vehicle_color, job?.vehicleColor),
    mileageIn: fne(vehicle?.mileage_in, vehicle?.mileageIn, job?.mileage_in, job?.mileageIn),
    concern: fne(job?.concern, job?.customerConcern, job?.complaint),
    requestedWork: fne(job?.requested_work, job?.requestedWork),
    notes,
    findings: sv(job?.findings || ""),
    workPerformed: sv(job?.work_performed || job?.workPerformed || job?.work?.workPerformed || ""),
    recommendedRepairs: sv(job?.recommended_repairs || job?.recommendedRepairs || job?.work?.recommendedRepairs || ""),
    diagnosticFee: fne(job?.diagnostic_fee, job?.diagnosticFee),
    writtenBy: fne(job?.written_by, job?.writtenBy, job?.work?.technician),
    assignedTo: sv(job?.assigned_to || job?.assignedTo || ""),
    approvalToken: sv(job?.approval_token || job?.approvalToken || job?.authorization?.token || ""),
    approvalSignedBy: sv(job?.approval_signed_by || job?.approvalSignedBy || job?.authorization?.signatureName || ""),
    approvalSignedAt: sv(job?.approval_signed_at || job?.approvalSignedAt || job?.authorization?.signatureTimestamp || "") || null,
    approvalMethod: sv(job?.approval_method || job?.approvalMethod || job?.authorization?.authorizationStatus || ""),
    releaseSignedBy: sv(job?.release_signed_by || job?.releaseSignedBy || job?.final?.releasedByCustomerName || ""),
    releaseSignedAt: sv(job?.release_signed_at || job?.releaseSignedAt || job?.final?.releasedAt || "") || null,
  };
}

function sv(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function fne(...values: unknown[]) {
  for (const v of values) {
    const c = sv(v);
    if (c && c !== "N/A") return c;
  }
  return "";
}

function generateToken() {
  return Math.random().toString(36).substring(2, 14);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  backgroundImage: `
    radial-gradient(circle at 12% 0%, rgba(37,99,235,0.07) 0%, rgba(37,99,235,0.02) 28%, transparent 46%),
    ${THEME.page}
  `,
  color: THEME.text,
  padding: 18,
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
};

const backButtonStyle: CSSProperties = {
  height: 38,
  borderRadius: 12,
  border: THEME.cardBorder,
  background: "rgba(255,255,255,0.78)",
  color: THEME.text,
  padding: "0 13px",
  fontSize: 13,
  fontWeight: 900,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
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
  margin: "5px 0 0",
  fontSize: 28,
  lineHeight: 1.05,
  fontWeight: 950,
  letterSpacing: "-0.04em",
  color: THEME.text,
};

const subtitleStyle: CSSProperties = {
  margin: "5px 0 0",
  fontSize: 12,
  color: THEME.textMuted,
};

const smallMetaStyle: CSSProperties = {
  fontSize: 10,
  color: THEME.textDim,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontWeight: 700,
};

const primaryButtonStyle: CSSProperties = {
  width: "100%",
  height: 46,
  borderRadius: 13,
  border: "1px solid rgba(29,78,216,0.36)",
  background: THEME.buttonBlue,
  color: "#ffffff",
  fontSize: 13,
  fontWeight: 950,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 9,
  padding: "0 14px",
  boxShadow: "0 10px 24px rgba(37,99,235,0.20)",
};

const outlineButtonStyle: CSSProperties = {
  width: "100%",
  height: 44,
  borderRadius: 12,
  border: THEME.cardBorder,
  background: "rgba(255,255,255,0.72)",
  color: THEME.textSoft,
  fontSize: 13,
  fontWeight: 900,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 9,
  padding: "0 14px",
};

const selectStyle: CSSProperties = {
  width: "100%",
  height: 46,
  borderRadius: 12,
  border: "1px solid rgba(84,108,131,0.22)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,249,253,0.98) 100%)",
  color: THEME.text,
  fontSize: 13,
  fontWeight: 800,
  padding: "0 13px",
  outline: "none",
  cursor: "pointer",
};

const centerCardStyle: CSSProperties = {
  maxWidth: 520,
  margin: "15vh auto 0",
  background: THEME.panel,
  border: THEME.panelBorder,
  borderRadius: 24,
  boxShadow: THEME.panelShadow,
  padding: 24,
};
