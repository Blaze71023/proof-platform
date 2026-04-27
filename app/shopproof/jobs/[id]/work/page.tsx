"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Camera, FileText, Save, Wrench } from "lucide-react";
import { getJobs } from "@/lib/shopproof";

type AnyJob = any;

type WorkPhotos = {
  [key: string]: boolean;
};

type WorkData = {
  technician: string;
  findings: string;
  workPerformed: string;
  recommendedRepairs: string;
  internalNotes: string;
  photos: WorkPhotos;
  updatedAt?: string;
};

type NormalizedJob = {
  id: string;
  status: string;
  customerName: string;
  customerPhone: string;
  vehicleYear: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleVin: string;
  concern: string;
  work?: WorkData;
};

export default function ShopProofWorkPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || "");

  const [rawJob, setRawJob] = useState<AnyJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedMessage, setSavedMessage] = useState("");

  const [work, setWork] = useState<WorkData>({
    technician: "",
    findings: "",
    workPerformed: "",
    recommendedRepairs: "",
    internalNotes: "",
    photos: {},
  });

  useEffect(() => {
    if (!id) return;

    try {
      const jobs = getJobs();
      const found = Array.isArray(jobs)
        ? jobs.find((j: AnyJob) => String(j?.id) === id)
        : null;

      setRawJob(found || null);

      if (found?.work) {
        setWork({
          technician: found.work.technician || "",
          findings: found.work.findings || "",
          workPerformed: found.work.workPerformed || "",
          recommendedRepairs: found.work.recommendedRepairs || "",
          internalNotes: found.work.internalNotes || "",
          photos: found.work.photos || {},
          updatedAt: found.work.updatedAt,
        });
      } else {
        setWork((prev) => ({
          ...prev,
          technician: found?.writtenBy || found?.written_by || "",
        }));
      }
    } catch (err) {
      console.warn("Work page local load unavailable.", err);
      setRawJob(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const job = useMemo(() => normalizeJob(rawJob), [rawJob]);

  function updateWork(field: keyof WorkData, value: any) {
    setWork((prev) => ({ ...prev, [field]: value }));
    setSavedMessage("");
  }

  function togglePhoto(key: string) {
    setWork((prev) => ({
      ...prev,
      photos: {
        ...prev.photos,
        [key]: !prev.photos[key],
      },
    }));
    setSavedMessage("");
  }

  function saveWorkRecord() {
    try {
      const jobs = getJobs();

      const nextWork: WorkData = {
        ...work,
        updatedAt: new Date().toISOString(),
      };

      const updatedJobs = Array.isArray(jobs)
        ? jobs.map((j: AnyJob) => {
            if (String(j?.id) !== id) return j;

            return {
              ...j,
              status:
                String(j?.status || "").toLowerCase().includes("complete") ||
                String(j?.status || "").toLowerCase().includes("release")
                  ? j.status
                  : "In Progress",
              updatedAt: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              work: nextWork,
            };
          })
        : [];

      localStorage.setItem("shopproof_jobs", JSON.stringify(updatedJobs));
      localStorage.setItem("shopproofJobs", JSON.stringify(updatedJobs));

      const refreshed = updatedJobs.find((j: AnyJob) => String(j?.id) === id);
      setRawJob(refreshed || rawJob);
      setWork(nextWork);
      setSavedMessage("Work record saved.");
    } catch (err) {
      console.warn("Work page save unavailable.", err);
      setSavedMessage("Could not save work record.");
    }
  }

  if (loading) {
    return <CenteredMessage title="Loading work record..." />;
  }

  if (!job?.id) {
    return (
      <CenteredMessage
        title="Aww, Snap! Job not found"
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

  const completedPhotos = PHOTO_LIST.filter((p) => work.photos[p.key]).length;

  return (
    <main style={pageStyle}>
      <section style={shellStyle}>
        <header style={topbarStyle}>
          <button
            type="button"
            onClick={() => router.push(`/shopproof/jobs/${job.id}`)}
            style={backButtonStyle}
          >
            <ArrowLeft size={18} />
            Back to Job
          </button>

          <div>
            <div style={eyebrowStyle}>Technician Working Surface</div>
            <h1 style={titleStyle}>{vehicleTitle}</h1>
            <p style={subtitleStyle}>
              {job.customerName || "Unknown Customer"} •{" "}
              {job.customerPhone || "No Phone"}
            </p>
          </div>

          <div style={statusPillStyle}>
            <Wrench size={17} />
            Work Record
          </div>
        </header>

        <section style={bodyGridStyle}>
          <aside style={sidePanelStyle}>
            <PanelTitle title="Job Snapshot" />

            <Info label="Customer" value={job.customerName} />
            <Info label="Phone" value={job.customerPhone} />
            <Info label="Vehicle" value={vehicleTitle} />
            <Info label="VIN" value={job.vehicleVin} mono />
            <Info label="Concern" value={job.concern} />

            <div style={noticeBoxStyle}>
              This page adds technician documentation without overwriting the
              original intake record.
            </div>
          </aside>

          <section style={mainPanelStyle}>
            <PanelTitle title="Technician Record" />

            <label style={fieldStyle}>
              <span style={labelStyle}>Technician / Written By</span>
              <input
                style={inputStyle}
                value={work.technician}
                onChange={(e) => updateWork("technician", e.target.value)}
                placeholder="Technician name"
              />
            </label>

            <label style={fieldStyle}>
              <span style={labelStyle}>Findings / Diagnostics</span>
              <textarea
                style={textareaStyle}
                value={work.findings}
                onChange={(e) => updateWork("findings", e.target.value)}
                placeholder="What was found, verified, tested, confirmed, or ruled out?"
              />
            </label>

            <label style={fieldStyle}>
              <span style={labelStyle}>Work Performed</span>
              <textarea
                style={textareaStyle}
                value={work.workPerformed}
                onChange={(e) => updateWork("workPerformed", e.target.value)}
                placeholder="Work completed, parts installed, resets, test drives, adjustments, etc."
              />
            </label>

            <label style={fieldStyle}>
              <span style={labelStyle}>Recommended Repairs / Next Steps</span>
              <textarea
                style={textareaStyle}
                value={work.recommendedRepairs}
                onChange={(e) =>
                  updateWork("recommendedRepairs", e.target.value)
                }
                placeholder="Recommended repairs, declined items, safety concerns, or next diagnostic steps."
              />
            </label>

            <label style={fieldStyle}>
              <span style={labelStyle}>Internal Notes</span>
              <textarea
                style={textareaStyle}
                value={work.internalNotes}
                onChange={(e) => updateWork("internalNotes", e.target.value)}
                placeholder="Internal-only shop notes."
              />
            </label>
          </section>
        </section>

        <section style={photoPanelStyle}>
          <div style={photoHeaderStyle}>
            <div>
              <div style={panelTitleStyle}>Photo Evidence Checklist</div>
              <div style={panelSubtitleStyle}>
                Required intake/work evidence before final release.
              </div>
            </div>

            <div style={photoCountStyle}>
              <Camera size={17} />
              {completedPhotos}/{PHOTO_LIST.length}
            </div>
          </div>

          <div style={photoGridStyle}>
            {PHOTO_LIST.map((photo) => (
              <button
                key={photo.key}
                type="button"
                onClick={() => togglePhoto(photo.key)}
                style={{
                  ...photoCardStyle,
                  border: work.photos[photo.key]
                    ? "1px solid rgba(37,99,235,0.55)"
                    : photoCardStyle.border,
                  background: work.photos[photo.key]
                    ? "rgba(219,234,254,0.72)"
                    : photoCardStyle.background,
                }}
              >
                <div style={photoBoxStyle}>
                  <Camera size={22} />
                </div>
                <div style={photoLabelStyle}>{photo.label}</div>
                <div style={photoHintStyle}>{photo.group}</div>
                <div style={checkboxTextStyle}>
                  {work.photos[photo.key] ? "✓ Captured" : "○ Needed"}
                </div>
              </button>
            ))}
          </div>
        </section>

        <footer style={actionsStyle}>
          <button type="button" style={primaryButtonStyle} onClick={saveWorkRecord}>
            <Save size={18} />
            Save Work Record
          </button>

          <button
            type="button"
            style={outlineButtonStyle}
            onClick={() => router.push(`/shopproof/jobs/${job.id}/work-order`)}
          >
            <FileText size={18} />
            Print Technician Sheet
          </button>

          <button
            type="button"
            style={outlineButtonStyle}
            onClick={() => router.push(`/shopproof/jobs/${job.id}/final`)}
          >
            Open Final Release
          </button>
        </footer>

        {savedMessage ? <div style={savedBoxStyle}>{savedMessage}</div> : null}
      </section>
    </main>
  );
}

function normalizeJob(job: AnyJob): NormalizedJob {
  if (!job) {
    return {
      id: "",
      status: "",
      customerName: "",
      customerPhone: "",
      vehicleYear: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleVin: "",
      concern: "",
    };
  }

  const vehicle = job?.vehicles || job?.vehicle || {};
  const customer = job?.customers || job?.customer || {};
  const notes = stringValue(job?.notes || job?.intake_notes || "");

  return {
    id: stringValue(job?.id),
    status: stringValue(job?.status || "New Intake"),
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
    vehicleYear: firstNonEmpty(vehicle?.year, job?.vehicle_year, job?.vehicleYear),
    vehicleMake: firstNonEmpty(vehicle?.make, job?.vehicle_make, job?.vehicleMake),
    vehicleModel: firstNonEmpty(
      vehicle?.model,
      job?.vehicle_model,
      job?.vehicleModel
    ),
    vehicleVin: firstNonEmpty(vehicle?.vin, job?.vin, job?.vehicle_vin, job?.vehicleVin),
    concern: firstNonEmpty(
      job?.concern,
      job?.customerConcern,
      job?.complaint,
      parseSnapshotValue(notes, "Customer Concern"),
      parseSnapshotValue(notes, "Requested Work")
    ),
    work: job?.work,
  };
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

function PanelTitle({ title }: { title: string }) {
  return (
    <div style={panelHeaderStyle}>
      <div style={panelTitleStyle}>{title}</div>
    </div>
  );
}

function Info({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div style={infoBoxStyle}>
      <div style={labelStyle}>{label}</div>
      <div style={mono ? monoValueStyle : infoValueStyle}>{value || "—"}</div>
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
      <section style={centerCardStyle}>
        <h1 style={centerTitleStyle}>{title}</h1>
        {detail ? <p style={subtitleStyle}>{detail}</p> : null}
        {actionLabel && onAction ? (
          <button type="button" onClick={onAction} style={primaryButtonStyle}>
            {actionLabel}
          </button>
        ) : null}
      </section>
    </main>
  );
}

const PHOTO_LIST = [
  { key: "front", label: "Front Exterior", group: "Exterior" },
  { key: "rear", label: "Rear Exterior", group: "Exterior" },
  { key: "driverSide", label: "Driver Side", group: "Exterior" },
  { key: "passengerSide", label: "Passenger Side", group: "Exterior" },
  { key: "lfWheel", label: "LF Wheel", group: "Wheels" },
  { key: "rfWheel", label: "RF Wheel", group: "Wheels" },
  { key: "lrWheel", label: "LR Wheel", group: "Wheels" },
  { key: "rrWheel", label: "RR Wheel", group: "Wheels" },
  { key: "seatConsole", label: "Seat / Console", group: "Interior" },
  { key: "doorPanel", label: "Driver Door Panel", group: "Interior" },
  { key: "dash", label: "Dash / Odometer", group: "Interior" },
  { key: "underhood", label: "Underhood", group: "Optional" },
  { key: "damage", label: "Damage Close-Up", group: "Optional" },
  { key: "scanTool", label: "Scan Tool Screen", group: "Optional" },
  { key: "failedPart", label: "Failed Part", group: "Optional" },
  { key: "repairProgress", label: "Repair Progress", group: "Optional" },
];

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 12% 0%, rgba(37,99,235,0.12), transparent 34%), linear-gradient(180deg, #e8f0f8 0%, #d9e4ee 52%, #edf4fb 100%)",
  padding: 22,
  color: "#132031",
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
};

const shellStyle: CSSProperties = {
  maxWidth: 1220,
  margin: "0 auto",
};

const topbarStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto 1fr auto",
  gap: 16,
  alignItems: "center",
  marginBottom: 18,
};

const backButtonStyle: CSSProperties = {
  minHeight: 42,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  borderRadius: 14,
  border: "1px solid rgba(84,108,131,0.22)",
  background: "rgba(255,255,255,0.78)",
  color: "#132031",
  padding: "0 14px",
  fontSize: 13,
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 12px 24px rgba(27,40,56,0.07)",
};

const eyebrowStyle: CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#1d4ed8",
  fontWeight: 950,
};

const titleStyle: CSSProperties = {
  margin: "6px 0 0",
  fontSize: 34,
  lineHeight: 1,
  fontWeight: 950,
  letterSpacing: "-0.045em",
};

const subtitleStyle: CSSProperties = {
  margin: "7px 0 0",
  color: "#61758a",
  fontSize: 13,
  lineHeight: 1.5,
};

const statusPillStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  borderRadius: 999,
  border: "1px solid rgba(37,99,235,0.28)",
  background: "rgba(219,234,254,0.72)",
  color: "#1d4ed8",
  padding: "10px 13px",
  fontSize: 13,
  fontWeight: 950,
};

const bodyGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "340px 1fr",
  gap: 16,
  alignItems: "start",
};

const sidePanelStyle: CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(250,252,255,0.98) 0%, rgba(239,245,251,1) 100%)",
  border: "1px solid rgba(84,108,131,0.18)",
  borderRadius: 24,
  boxShadow: "0 16px 34px rgba(28,42,59,0.09)",
  padding: 16,
  display: "grid",
  gap: 10,
};

const mainPanelStyle: CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(250,252,255,0.98) 0%, rgba(239,245,251,1) 100%)",
  border: "1px solid rgba(84,108,131,0.18)",
  borderRadius: 24,
  boxShadow: "0 16px 34px rgba(28,42,59,0.09)",
  padding: 18,
};

const panelHeaderStyle: CSSProperties = {
  marginBottom: 8,
};

const panelTitleStyle: CSSProperties = {
  fontSize: 18,
  lineHeight: 1.1,
  fontWeight: 950,
  letterSpacing: "-0.03em",
};

const panelSubtitleStyle: CSSProperties = {
  marginTop: 5,
  color: "#61758a",
  fontSize: 13,
};

const infoBoxStyle: CSSProperties = {
  borderRadius: 16,
  border: "1px solid rgba(92,116,140,0.14)",
  background:
    "linear-gradient(180deg, rgba(247,250,254,0.98) 0%, rgba(239,245,251,1) 100%)",
  padding: "12px 13px",
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 11,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  fontWeight: 900,
  color: "#61758a",
  marginBottom: 6,
};

const infoValueStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 850,
  color: "#223347",
  lineHeight: 1.35,
  wordBreak: "break-word",
};

const monoValueStyle: CSSProperties = {
  ...infoValueStyle,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
};

const noticeBoxStyle: CSSProperties = {
  marginTop: 4,
  borderRadius: 16,
  border: "1px solid rgba(37,99,235,0.28)",
  background: "rgba(37,99,235,0.10)",
  color: "#223347",
  fontSize: 12,
  lineHeight: 1.5,
  padding: "11px 12px",
  fontWeight: 750,
};

const fieldStyle: CSSProperties = {
  display: "block",
  marginBottom: 14,
};

const inputStyle: CSSProperties = {
  width: "100%",
  height: 46,
  borderRadius: 14,
  border: "1px solid rgba(84,108,131,0.22)",
  background: "#ffffff",
  color: "#132031",
  padding: "0 13px",
  fontSize: 14,
  fontWeight: 750,
  boxSizing: "border-box",
};

const textareaStyle: CSSProperties = {
  width: "100%",
  minHeight: 110,
  borderRadius: 16,
  border: "1px solid rgba(84,108,131,0.22)",
  background: "#ffffff",
  color: "#132031",
  padding: 13,
  fontSize: 14,
  lineHeight: 1.5,
  resize: "vertical",
  boxSizing: "border-box",
};

const photoPanelStyle: CSSProperties = {
  marginTop: 16,
  background:
    "linear-gradient(180deg, rgba(250,252,255,0.98) 0%, rgba(239,245,251,1) 100%)",
  border: "1px solid rgba(84,108,131,0.18)",
  borderRadius: 24,
  boxShadow: "0 16px 34px rgba(28,42,59,0.09)",
  padding: 18,
};

const photoHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 14,
  alignItems: "center",
  marginBottom: 14,
};

const photoCountStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  borderRadius: 999,
  background: "rgba(15,23,42,0.92)",
  color: "#ffffff",
  padding: "9px 12px",
  fontSize: 13,
  fontWeight: 950,
};

const photoGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 10,
};

const photoCardStyle: CSSProperties = {
  textAlign: "left",
  borderRadius: 16,
  border: "1px solid rgba(92,116,140,0.16)",
  background: "rgba(255,255,255,0.78)",
  padding: 10,
  cursor: "pointer",
};

const photoBoxStyle: CSSProperties = {
  height: 54,
  borderRadius: 12,
  border: "1px dashed rgba(84,108,131,0.35)",
  background: "rgba(226,236,246,0.58)",
  display: "grid",
  placeItems: "center",
  color: "#61758a",
  marginBottom: 8,
};

const photoLabelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 950,
  color: "#132031",
};

const photoHintStyle: CSSProperties = {
  marginTop: 3,
  fontSize: 11,
  color: "#61758a",
  fontWeight: 800,
};

const checkboxTextStyle: CSSProperties = {
  marginTop: 8,
  fontSize: 12,
  fontWeight: 950,
  color: "#1d4ed8",
};

const actionsStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 16,
};

const primaryButtonStyle: CSSProperties = {
  minHeight: 50,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 9,
  borderRadius: 14,
  border: "1px solid rgba(29,78,216,0.36)",
  background:
    "linear-gradient(180deg, rgba(37,99,235,1) 0%, rgba(29,78,216,1) 100%)",
  color: "#ffffff",
  padding: "0 16px",
  fontSize: 14,
  fontWeight: 950,
  cursor: "pointer",
  boxShadow: "0 12px 28px rgba(37,99,235,0.22)",
};

const outlineButtonStyle: CSSProperties = {
  minHeight: 50,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 9,
  borderRadius: 14,
  border: "1px solid rgba(84,108,131,0.22)",
  background: "rgba(255,255,255,0.78)",
  color: "#223347",
  padding: "0 16px",
  fontSize: 14,
  fontWeight: 900,
  cursor: "pointer",
};

const savedBoxStyle: CSSProperties = {
  marginTop: 14,
  borderRadius: 16,
  border: "1px solid rgba(5,150,105,0.25)",
  background: "rgba(5,150,105,0.10)",
  color: "#065f46",
  padding: "12px 13px",
  fontSize: 13,
  fontWeight: 900,
};

const centerCardStyle: CSSProperties = {
  maxWidth: 520,
  margin: "15vh auto 0",
  background:
    "linear-gradient(180deg, rgba(250,252,255,0.98) 0%, rgba(239,245,251,1) 100%)",
  border: "1px solid rgba(84,108,131,0.18)",
  borderRadius: 24,
  boxShadow: "0 16px 34px rgba(28,42,59,0.09)",
  padding: 24,
  textAlign: "center",
};

const centerTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 26,
  fontWeight: 950,
};