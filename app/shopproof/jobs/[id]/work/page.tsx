"use client";

import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Camera, CircleCheck as CheckCircle, FileText, LoaderCircle, Save, Trash2, Upload, Wrench } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";

type AnyJob = Record<string, any>;

type EvidenceItem = {
  id?: string;
  label: string;
  category: string;
  key: string;
  publicUrl?: string;
  capturedAt?: string;
};

const PHOTO_LIST = [
  { key: "front", label: "Front Exterior", category: "exterior" },
  { key: "rear", label: "Rear Exterior", category: "exterior" },
  { key: "driver_side", label: "Driver Side", category: "exterior" },
  { key: "passenger_side", label: "Passenger Side", category: "exterior" },
  { key: "lf_wheel", label: "LF Wheel", category: "wheels" },
  { key: "rf_wheel", label: "RF Wheel", category: "wheels" },
  { key: "lr_wheel", label: "LR Wheel", category: "wheels" },
  { key: "rr_wheel", label: "RR Wheel", category: "wheels" },
  { key: "seat_console", label: "Seat / Console", category: "interior" },
  { key: "door_panel", label: "Driver Door Panel", category: "interior" },
  { key: "dash_odometer", label: "Dash / Odometer", category: "interior" },
  { key: "underhood", label: "Underhood", category: "underhood" },
  { key: "damage_closeup", label: "Damage Close-Up", category: "damage" },
  { key: "scan_tool", label: "Scan Tool Screen", category: "scan_tool" },
  { key: "failed_part", label: "Failed Part", category: "damage" },
  { key: "repair_progress", label: "Repair Progress", category: "general" },
];

const THEME = {
  page: "linear-gradient(180deg, #dfe6ee 0%, #d7e0e9 18%, #ced8e3 44%, #cad4df 74%, #d1dbe5 100%)",
  shell: "linear-gradient(180deg, rgba(225,233,241,0.96) 0%, rgba(216,226,237,0.985) 48%, rgba(209,220,231,0.995) 100%)",
  panel: "linear-gradient(180deg, rgba(250,252,255,0.985) 0%, rgba(243,247,252,0.995) 54%, rgba(238,243,249,1) 100%)",
  card: "linear-gradient(180deg, rgba(247,250,254,0.98) 0%, rgba(239,245,251,1) 100%)",
  topbar: "linear-gradient(180deg, rgba(234,240,247,0.92) 0%, rgba(223,232,242,0.88) 100%)",
  text: "#132031",
  textSoft: "#223347",
  textMuted: "#61758a",
  textDim: "#8099b0",
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
  red: "#dc2626",
  redSoft: "rgba(220,38,38,0.10)",
  redLine: "rgba(220,38,38,0.22)",
  buttonBlue: "linear-gradient(180deg, rgba(37,99,235,1) 0%, rgba(29,78,216,1) 100%)",
};

export default function WorkPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || "");

  const [rawJob, setRawJob] = useState<AnyJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [shopId, setShopId] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [width, setWidth] = useState(1440);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activePhotoKeyRef = useRef<string | null>(null);

  const [technician, setTechnician] = useState("");
  const [findings, setFindings] = useState("");
  const [workPerformed, setWorkPerformed] = useState("");
  const [recommendedRepairs, setRecommendedRepairs] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

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
    let jobData: AnyJob | null = null;

    if (supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          setUserId(userData.user.id);
          const { data: shop } = await supabase
            .from("shops")
            .select("id")
            .eq("owner_id", userData.user.id)
            .maybeSingle();
          if (shop) setShopId(shop.id);
        }

        const { data, error } = await supabase
          .from("jobs")
          .select(`
            *,
            customer:customers!jobs_customer_id_fkey(id, name, phone),
            vehicle:vehicles!jobs_vehicle_id_fkey(id, vin, year, make, model)
          `)
          .eq("id", id)
          .maybeSingle();

        if (!error && data) {
          jobData = data;
        }

        // Load evidence
        const { data: evidenceData } = await supabase
          .from("evidence")
          .select("*")
          .eq("job_id", id)
          .order("created_at", { ascending: true });

        if (evidenceData) {
          setEvidence(
            evidenceData.map((e: any) => ({
              id: e.id,
              label: e.label,
              category: e.category,
              key: e.label.toLowerCase().replace(/[^a-z0-9]/g, "_"),
              publicUrl: e.public_url,
              capturedAt: e.captured_at,
            }))
          );
        }
      } catch {
        // fall through
      }
    }

    if (!jobData) {
      try {
        const raw = localStorage.getItem("shopproof_jobs");
        const jobs = raw ? JSON.parse(raw) : [];
        jobData = jobs.find((j: AnyJob) => String(j?.id) === id) || null;
      } catch {
        jobData = null;
      }
    }

    setRawJob(jobData);

    if (jobData) {
      setTechnician(sv(jobData?.written_by || jobData?.writtenBy || jobData?.work?.technician || ""));
      setFindings(sv(jobData?.findings || jobData?.work?.findings || ""));
      setWorkPerformed(sv(jobData?.work_performed || jobData?.workPerformed || jobData?.work?.workPerformed || ""));
      setRecommendedRepairs(sv(jobData?.recommended_repairs || jobData?.recommendedRepairs || jobData?.work?.recommendedRepairs || ""));
      setInternalNotes(sv(jobData?.internal_notes || jobData?.internalNotes || jobData?.work?.internalNotes || ""));
    }

    setLoading(false);
  }, [id]);

  useEffect(() => { loadJob(); }, [loadJob]);

  const job = useMemo(() => rawJob ? normalizeJob(rawJob) : null, [rawJob]);

  async function saveWork() {
    if (!id) return;
    setSaving(true);
    setSavedMsg("");

    const supabase = getSupabaseClient();
    const now = new Date().toISOString();

    const update = {
      findings,
      work_performed: workPerformed,
      recommended_repairs: recommendedRepairs,
      internal_notes: internalNotes,
      written_by: technician,
      status: "In Progress",
      updated_at: now,
    };

    if (supabase) {
      try {
        await supabase.from("jobs").update(update).eq("id", id);
      } catch {
        // ignore
      }
    }

    // Local update
    try {
      const raw = localStorage.getItem("shopproof_jobs");
      const jobs = raw ? JSON.parse(raw) : [];
      const updated = jobs.map((j: AnyJob) =>
        String(j?.id) === id
          ? {
              ...j,
              findings,
              work_performed: workPerformed,
              recommended_repairs: recommendedRepairs,
              internal_notes: internalNotes,
              written_by: technician,
              status: j.status === "Completed" || j.status === "Released" ? j.status : "In Progress",
              updated_at: now,
              work: {
                technician,
                findings,
                workPerformed,
                recommendedRepairs,
                internalNotes,
                updatedAt: now,
              },
            }
          : j
      );
      localStorage.setItem("shopproof_jobs", JSON.stringify(updated));
    } catch {
      // ignore
    }

    setSavedMsg("Work record saved.");
    setSaving(false);
    setTimeout(() => setSavedMsg(""), 3000);
  }

  function triggerPhotoUpload(photoKey: string) {
    activePhotoKeyRef.current = photoKey;
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const photoKey = activePhotoKeyRef.current;
    if (!file || !photoKey) return;

    const photoMeta = PHOTO_LIST.find((p) => p.key === photoKey);
    if (!photoMeta) return;

    setUploadingKey(photoKey);

    const supabase = getSupabaseClient();
    let publicUrl = "";

    if (supabase && userId) {
      try {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${userId}/${id}/${photoKey}_${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("evidence")
          .upload(path, file, { upsert: false });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("evidence")
            .getPublicUrl(path);
          publicUrl = urlData?.publicUrl || "";

          await supabase.from("evidence").insert({
            job_id: id,
            shop_id: shopId,
            uploaded_by: userId,
            category: photoMeta.category,
            label: photoMeta.label,
            storage_path: path,
            public_url: publicUrl,
            captured_at: new Date().toISOString(),
          });
        }
      } catch {
        // fall through to preview
      }
    }

    if (!publicUrl) {
      // Provide an object URL for local preview if upload failed
      publicUrl = URL.createObjectURL(file);
    }

    setEvidence((prev) => {
      const existing = prev.findIndex((e) => e.key === photoKey);
      const item: EvidenceItem = {
        label: photoMeta.label,
        category: photoMeta.category,
        key: photoKey,
        publicUrl,
        capturedAt: new Date().toISOString(),
      };
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = item;
        return next;
      }
      return [...prev, item];
    });

    setUploadingKey(null);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function removeEvidence(photoKey: string) {
    const item = evidence.find((e) => e.key === photoKey);
    if (!item?.id) {
      setEvidence((prev) => prev.filter((e) => e.key !== photoKey));
      return;
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from("evidence").delete().eq("id", item.id);
      } catch {
        // ignore
      }
    }
    setEvidence((prev) => prev.filter((e) => e.key !== photoKey));
  }

  const capturedCount = evidence.length;

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={centerCardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: THEME.textSoft, fontWeight: 800, fontSize: 14 }}>
            <LoaderCircle size={17} className="spin" />
            Loading work record...
          </div>
        </div>
      </main>
    );
  }

  if (!job?.id) {
    return (
      <main style={pageStyle}>
        <div style={centerCardStyle}>
          <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 10, color: THEME.text }}>Job not found</div>
          <p style={{ fontSize: 13, color: THEME.textMuted, marginBottom: 16, lineHeight: 1.5 }}>
            Return to the dashboard and open the job from the active list.
          </p>
          <button type="button" onClick={() => router.push("/shopproof/dashboard")} style={primaryButtonStyle}>
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  const vehicleTitle =
    [job.vehicleYear, job.vehicleMake, job.vehicleModel].filter(Boolean).join(" ") || "Vehicle Record";

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
            gridTemplateColumns: "auto 1fr auto",
            gap: 14,
            alignItems: "center",
          }}
        >
          <button
            type="button"
            onClick={() => router.push(`/shopproof/jobs/${id}`)}
            style={backButtonStyle}
          >
            <ArrowLeft size={15} />
            {isMobile ? "" : "Back to Job"}
          </button>

          <div>
            <div style={eyebrowStyle}>Technician Working Surface</div>
            <h1 style={isMobile ? { ...titleStyle, fontSize: 20 } : titleStyle}>{vehicleTitle}</h1>
            <p style={subtitleStyle}>
              {job.customerName} • {job.customerPhone}
            </p>
          </div>

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
              fontSize: 12,
              fontWeight: 950,
            }}
          >
            <Wrench size={14} />
            {isMobile ? "" : "Work Record"}
          </div>
        </header>

        {/* Body */}
        <div
          style={{
            padding: isMobile ? "12px 10px" : "18px",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "340px 1fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          {/* Sidebar snapshot */}
          <aside
            style={{
              display: "grid",
              gap: 14,
              position: isMobile ? undefined : "sticky",
              top: 18,
            }}
          >
            <div
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
                  padding: "13px 14px 11px",
                  borderBottom: `1px solid ${THEME.line}`,
                  fontSize: 15,
                  fontWeight: 950,
                  letterSpacing: "-0.03em",
                  color: THEME.text,
                }}
              >
                Job Snapshot
              </div>
              <div style={{ padding: "12px 14px", display: "grid", gap: 10 }}>
                {[
                  { label: "Customer", value: job.customerName },
                  { label: "Phone", value: job.customerPhone },
                  { label: "Vehicle", value: vehicleTitle },
                  { label: "VIN", value: job.vehicleVin, mono: true },
                  { label: "Concern", value: job.concern },
                ].map(({ label, value, mono }) => (
                  <div
                    key={label}
                    style={{
                      borderRadius: 12,
                      border: THEME.cardBorder,
                      background: THEME.card,
                      padding: "9px 11px",
                    }}
                  >
                    <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: THEME.textMuted, marginBottom: 4 }}>
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: THEME.textSoft,
                        wordBreak: "break-word",
                        fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : undefined,
                      }}
                    >
                      {value || "—"}
                    </div>
                  </div>
                ))}
                <div
                  style={{
                    borderRadius: 12,
                    border: `1px solid ${THEME.blueLine}`,
                    background: THEME.blueSoft,
                    color: THEME.textSoft,
                    fontSize: 11,
                    lineHeight: 1.5,
                    padding: "10px 11px",
                    fontWeight: 750,
                  }}
                >
                  Technician documentation is added here without overwriting the original intake record.
                </div>
              </div>
            </div>
          </aside>

          {/* Main panel */}
          <div style={{ display: "grid", gap: 14 }}>
            {/* Technician Record */}
            <div
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
                  padding: "13px 16px 11px",
                  borderBottom: `1px solid ${THEME.line}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: THEME.blue,
                    background: THEME.blueSoft,
                    border: `1px solid ${THEME.blueLine}`,
                  }}
                >
                  <Wrench size={15} />
                </span>
                <div style={{ fontSize: 15, fontWeight: 950, letterSpacing: "-0.03em", color: THEME.text }}>
                  Technician Record
                </div>
              </div>

              <div style={{ padding: "14px 16px", display: "grid", gap: 14 }}>
                <FieldGroup label="Technician / Written By">
                  <input
                    style={inputStyle}
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    placeholder="Technician name"
                  />
                </FieldGroup>

                <FieldGroup label="Findings / Diagnostics">
                  <textarea
                    style={textareaStyle}
                    value={findings}
                    onChange={(e) => setFindings(e.target.value)}
                    placeholder="What was found, verified, tested, confirmed, or ruled out?"
                    rows={4}
                  />
                </FieldGroup>

                <FieldGroup label="Work Performed">
                  <textarea
                    style={textareaStyle}
                    value={workPerformed}
                    onChange={(e) => setWorkPerformed(e.target.value)}
                    placeholder="Work completed, parts installed, resets, test drives, adjustments..."
                    rows={4}
                  />
                </FieldGroup>

                <FieldGroup label="Recommended Repairs / Next Steps">
                  <textarea
                    style={textareaStyle}
                    value={recommendedRepairs}
                    onChange={(e) => setRecommendedRepairs(e.target.value)}
                    placeholder="Recommended repairs, declined items, safety concerns, or next diagnostic steps."
                    rows={3}
                  />
                </FieldGroup>

                <FieldGroup label="Internal Notes (Shop Only)">
                  <textarea
                    style={textareaStyle}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Internal-only shop notes — not visible to customer."
                    rows={2}
                  />
                </FieldGroup>
              </div>
            </div>

            {/* Photo Evidence */}
            <div
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
                  padding: "13px 16px 11px",
                  borderBottom: `1px solid ${THEME.line}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 9,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: THEME.blue,
                      background: THEME.blueSoft,
                      border: `1px solid ${THEME.blueLine}`,
                    }}
                  >
                    <Camera size={15} />
                  </span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 950, letterSpacing: "-0.03em", color: THEME.text }}>
                      Photo Evidence
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>
                      Required intake and work evidence for final release
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    borderRadius: 999,
                    background: "rgba(15,23,42,0.88)",
                    color: "#fff",
                    padding: "7px 12px",
                    fontSize: 12,
                    fontWeight: 950,
                  }}
                >
                  <Camera size={13} />
                  {capturedCount}/{PHOTO_LIST.length}
                </div>
              </div>

              <div
                style={{
                  padding: "14px 16px",
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "repeat(2, minmax(0, 1fr))"
                    : "repeat(4, minmax(0, 1fr))",
                  gap: 10,
                }}
              >
                {PHOTO_LIST.map((photo) => {
                  const captured = evidence.find((e) => e.key === photo.key);
                  const isUploading = uploadingKey === photo.key;

                  return (
                    <div
                      key={photo.key}
                      style={{
                        borderRadius: 16,
                        border: captured
                          ? `1px solid ${THEME.emeraldLine}`
                          : THEME.cardBorder,
                        background: captured ? THEME.emeraldSoft : THEME.card,
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      {captured?.publicUrl ? (
                        <div style={{ position: "relative" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={captured.publicUrl}
                            alt={photo.label}
                            style={{
                              width: "100%",
                              height: 80,
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeEvidence(photo.key)}
                            style={{
                              position: "absolute",
                              top: 5,
                              right: 5,
                              width: 24,
                              height: 24,
                              borderRadius: 999,
                              background: "rgba(220,38,38,0.88)",
                              border: "none",
                              color: "#fff",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => triggerPhotoUpload(photo.key)}
                          disabled={!!uploadingKey}
                          style={{
                            width: "100%",
                            height: 80,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(226,236,246,0.58)",
                            border: "none",
                            cursor: uploadingKey ? "not-allowed" : "pointer",
                            color: THEME.textDim,
                          }}
                        >
                          {isUploading ? (
                            <LoaderCircle size={20} className="spin" />
                          ) : (
                            <Upload size={20} />
                          )}
                        </button>
                      )}

                      <div style={{ padding: "8px 10px 10px" }}>
                        <div style={{ fontSize: 11, fontWeight: 900, color: THEME.text, lineHeight: 1.2 }}>
                          {photo.label}
                        </div>
                        <div style={{ fontSize: 10, color: THEME.textMuted, fontWeight: 800, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          {photo.category}
                        </div>
                        <div
                          style={{
                            marginTop: 6,
                            fontSize: 10,
                            fontWeight: 950,
                            color: captured ? THEME.emerald : THEME.textDim,
                          }}
                        >
                          {captured ? "✓ Captured" : "○ Needed"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                paddingBottom: 6,
              }}
            >
              <button
                type="button"
                onClick={saveWork}
                disabled={saving}
                style={{
                  ...primaryButtonStyle,
                  opacity: saving ? 0.72 : 1,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? (
                  <><LoaderCircle size={16} className="spin" /> Saving...</>
                ) : (
                  <><Save size={16} /> Save Work Record</>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push(`/shopproof/jobs/${id}/work-order`)}
                style={outlineButtonStyle}
              >
                <FileText size={16} />
                Print Technician Sheet
              </button>

              <button
                type="button"
                onClick={() => router.push(`/shopproof/jobs/${id}/final`)}
                style={outlineButtonStyle}
              >
                <CheckCircle size={16} />
                Open Final Release
              </button>
            </div>

            {savedMsg ? (
              <div
                style={{
                  borderRadius: 14,
                  border: `1px solid ${THEME.emeraldLine}`,
                  background: THEME.emeraldSoft,
                  color: THEME.emerald,
                  fontSize: 13,
                  fontWeight: 900,
                  padding: "11px 13px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <CheckCircle size={15} />
                {savedMsg}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Hidden file input for photo capture */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleFileSelected}
      />

      <style jsx global>{`
        .spin {
          animation: spin 1s linear infinite;
          display: inline-block;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input::placeholder, textarea::placeholder {
          color: ${THEME.textDim};
          font-weight: 600;
        }
        input, textarea, select {
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
        }
      `}</style>
    </main>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 7 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: THEME.textDim,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function normalizeJob(job: AnyJob) {
  const vehicle = job?.vehicle || job?.vehicles || {};
  const customer = job?.customer || job?.customers || {};
  return {
    id: sv(job?.id),
    status: sv(job?.status || "New Intake"),
    customerName: fne(job?.customer_name, customer?.name),
    customerPhone: fne(job?.customer_phone, customer?.phone),
    vehicleYear: fne(vehicle?.year, job?.vehicle_year),
    vehicleMake: fne(vehicle?.make, job?.vehicle_make),
    vehicleModel: fne(vehicle?.model, job?.vehicle_model),
    vehicleVin: fne(vehicle?.vin, job?.vin),
    concern: fne(job?.concern, job?.customerConcern),
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

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  backgroundImage: THEME.page,
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

const inputStyle: CSSProperties = {
  width: "100%",
  height: 46,
  borderRadius: 12,
  border: "1px solid rgba(84,108,131,0.22)",
  background: "#ffffff",
  color: THEME.text,
  fontSize: 14,
  fontWeight: 700,
  padding: "0 13px",
  boxSizing: "border-box",
  outline: "none",
};

const textareaStyle: CSSProperties = {
  width: "100%",
  borderRadius: 14,
  border: "1px solid rgba(84,108,131,0.22)",
  background: "#ffffff",
  color: THEME.text,
  fontSize: 14,
  lineHeight: 1.55,
  padding: "11px 13px",
  resize: "vertical",
  boxSizing: "border-box",
  outline: "none",
};

const primaryButtonStyle: CSSProperties = {
  height: 50,
  borderRadius: 14,
  border: "1px solid rgba(29,78,216,0.36)",
  background: THEME.buttonBlue,
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 950,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "0 18px",
  boxShadow: "0 12px 24px rgba(37,99,235,0.22)",
};

const outlineButtonStyle: CSSProperties = {
  height: 50,
  borderRadius: 14,
  border: THEME.cardBorder,
  background: "rgba(255,255,255,0.78)",
  color: THEME.textSoft,
  fontSize: 14,
  fontWeight: 900,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "0 18px",
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
