"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getJobs, updateJob } from "@/lib/shopproof";

type FinalPhoto = {
  id: string;
  name: string;
  url: string;
  addedAt: string;
};

type FinalChecklist = {
  allWorkCompleted: boolean;
  vehicleRoadTested: boolean;
  noToolsLeftInside: boolean;
  fluidsChecked: boolean;
  warningLightsReviewed: boolean;
  finalConditionPhotosTaken: boolean;
  customerItemsReturned: boolean;
};

type FinalState = {
  readyForPickup: boolean;
  completed: boolean;
  finalMileageOut: string;
  finalSummary: string;
  customerFacingNotes: string;
  internalCloseoutNotes: string;
  completedBy: string;
  completedAt: string;
  checklist: FinalChecklist;
  photos: FinalPhoto[];
};

const EMPTY_FINAL: FinalState = {
  readyForPickup: false,
  completed: false,
  finalMileageOut: "",
  finalSummary: "",
  customerFacingNotes: "",
  internalCloseoutNotes: "",
  completedBy: "",
  completedAt: "",
  checklist: {
    allWorkCompleted: false,
    vehicleRoadTested: false,
    noToolsLeftInside: false,
    fluidsChecked: false,
    warningLightsReviewed: false,
    finalConditionPhotosTaken: false,
    customerItemsReturned: false,
  },
  photos: [],
};

function isObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null;
}

function safeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function safeBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizePhotos(value: unknown): FinalPhoto[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      if (!isObject(item)) return null;

      const url =
        safeString(item.url) ||
        safeString(item.preview) ||
        safeString(item.src) ||
        safeString(item.dataUrl);

      if (!url) return null;

      return {
        id: safeString(item.id) || `final-photo-${index + 1}`,
        name: safeString(item.name) || `Final Photo ${index + 1}`,
        url,
        addedAt: safeString(item.addedAt) || new Date().toISOString(),
      };
    })
    .filter(Boolean) as FinalPhoto[];
}

function normalizeFinalState(job: any): FinalState {
  const rawFinal = isObject(job?.final) ? job.final : {};
  const rawChecklist = isObject(rawFinal.checklist) ? rawFinal.checklist : {};

  const photos = normalizePhotos(rawFinal.photos);

  return {
    readyForPickup:
      safeBoolean(rawFinal.readyForPickup) ||
      safeString(job?.status) === "Ready for Pickup",
    completed:
      safeBoolean(rawFinal.completed) || safeString(job?.status) === "Completed",
    finalMileageOut: safeString(rawFinal.finalMileageOut),
    finalSummary: safeString(rawFinal.finalSummary),
    customerFacingNotes: safeString(rawFinal.customerFacingNotes),
    internalCloseoutNotes: safeString(rawFinal.internalCloseoutNotes),
    completedBy: safeString(rawFinal.completedBy),
    completedAt: safeString(rawFinal.completedAt),
    checklist: {
      allWorkCompleted: safeBoolean(rawChecklist.allWorkCompleted),
      vehicleRoadTested: safeBoolean(rawChecklist.vehicleRoadTested),
      noToolsLeftInside: safeBoolean(rawChecklist.noToolsLeftInside),
      fluidsChecked: safeBoolean(rawChecklist.fluidsChecked),
      warningLightsReviewed: safeBoolean(rawChecklist.warningLightsReviewed),
      finalConditionPhotosTaken:
        safeBoolean(rawChecklist.finalConditionPhotosTaken) || photos.length > 0,
      customerItemsReturned: safeBoolean(rawChecklist.customerItemsReturned),
    },
    photos,
  };
}

function getCustomerName(job: any): string {
  return (
    safeString(job?.customerName) ||
    safeString(job?.customer?.name) ||
    safeString(job?.customer_full_name) ||
    "Unknown Customer"
  );
}

function getVehicleLine(job: any): string {
  const year =
    safeString(job?.vehicleYear) ||
    safeString(job?.vehicle?.year) ||
    safeString(job?.year);
  const make =
    safeString(job?.vehicleMake) ||
    safeString(job?.vehicle?.make) ||
    safeString(job?.make);
  const model =
    safeString(job?.vehicleModel) ||
    safeString(job?.vehicle?.model) ||
    safeString(job?.model);

  const assembled = [year, make, model].filter(Boolean).join(" ").trim();
  return assembled || "Unknown Vehicle";
}

function getVin(job: any): string {
  return (
    safeString(job?.vin) ||
    safeString(job?.vehicleVin) ||
    safeString(job?.vehicle?.vin) ||
    "—"
  );
}

function getPlate(job: any): string {
  return (
    safeString(job?.plate) ||
    safeString(job?.vehiclePlate) ||
    safeString(job?.vehicle?.plate) ||
    "—"
  );
}

function getConcern(job: any): string {
  return (
    safeString(job?.concern) ||
    safeString(job?.customerConcern) ||
    safeString(job?.requestedWork) ||
    safeString(job?.complaint) ||
    "No concern recorded."
  );
}

function getAssignedTech(job: any): string {
  return (
    safeString(job?.assignedTech) ||
    safeString(job?.assigned_to) ||
    safeString(job?.technician) ||
    safeString(job?.advisor) ||
    "Unassigned"
  );
}

function getCreatedAt(job: any): string {
  return safeString(job?.createdAt) || safeString(job?.created_at);
}

function formatDateTime(value: string): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString();
}

function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read file."));
      }
    };

    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

export default function ShopProofFinalPage() {
  const params = useParams();
  const router = useRouter();

  const jobId = Array.isArray(params?.id) ? params.id[0] : params?.id || "";

  const [job, setJob] = useState<any | null>(null);
  const [finalState, setFinalState] = useState<FinalState>(EMPTY_FINAL);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const jobs = getJobs();
    const found = jobs.find((item: any) => String(item?.id) === String(jobId));

    if (!found) {
      setJob(null);
      setLoading(false);
      return;
    }

    setJob(found);
    setFinalState(normalizeFinalState(found));
    setLoading(false);
  }, [jobId]);

  const completionScore = useMemo(() => {
    const checks = Object.values(finalState.checklist);
    const total = checks.length;
    const completedChecks = checks.filter(Boolean).length;

    const textFields = [
      finalState.finalMileageOut.trim(),
      finalState.finalSummary.trim(),
      finalState.customerFacingNotes.trim(),
    ];
    const textScore = textFields.filter(Boolean).length;

    const score = Math.round(
      ((completedChecks + textScore) / (total + textFields.length)) * 100
    );

    return score;
  }, [finalState]);

  const canMarkReady =
    finalState.checklist.allWorkCompleted &&
    finalState.checklist.finalConditionPhotosTaken &&
    finalState.photos.length > 0 &&
    finalState.finalMileageOut.trim().length > 0 &&
    finalState.finalSummary.trim().length > 0;

  const canComplete = canMarkReady && finalState.customerFacingNotes.trim().length > 0;

  function updateChecklistField(key: keyof FinalChecklist, value: boolean) {
    setFinalState((current) => ({
      ...current,
      checklist: {
        ...current.checklist,
        [key]: value,
      },
    }));
    setSaveMessage("");
  }

  function updateField<K extends keyof FinalState>(key: K, value: FinalState[K]) {
    setFinalState((current) => ({
      ...current,
      [key]: value,
    }));
    setSaveMessage("");
  }

  async function saveFinalState(nextOverrides?: Partial<FinalState>, nextStatus?: string) {
    if (!job) return;

    const mergedFinal: FinalState = {
      ...finalState,
      ...nextOverrides,
      checklist: {
        ...finalState.checklist,
        ...(nextOverrides?.checklist || {}),
      },
      photos: nextOverrides?.photos || finalState.photos,
    };

    const payload: any = {
      ...job,
      final: mergedFinal,
    };

    if (nextStatus) {
      payload.status = nextStatus;
    } else if (mergedFinal.completed) {
      payload.status = "Completed";
    } else if (mergedFinal.readyForPickup) {
      payload.status = "Ready for Pickup";
    }

    try {
      setSaving(true);
      setErrorMessage("");
      updateJob(job.id, payload);
      setJob(payload);
      setFinalState(mergedFinal);
      setSaveMessage("Final page saved.");
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not save final page.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    try {
      setUploading(true);
      setErrorMessage("");

      const newPhotos: FinalPhoto[] = [];

      for (const file of files) {
        const url = await toDataUrl(file);

        newPhotos.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          name: file.name,
          url,
          addedAt: new Date().toISOString(),
        });
      }

      const mergedPhotos = [...finalState.photos, ...newPhotos];
      const nextFinal: FinalState = {
        ...finalState,
        photos: mergedPhotos,
        checklist: {
          ...finalState.checklist,
          finalConditionPhotosTaken: mergedPhotos.length > 0,
        },
      };

      await saveFinalState(nextFinal);
      event.target.value = "";
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not add photos.");
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto(photoId: string) {
    const remaining = finalState.photos.filter((photo) => photo.id !== photoId);

    await saveFinalState({
      ...finalState,
      photos: remaining,
      checklist: {
        ...finalState.checklist,
        finalConditionPhotosTaken: remaining.length > 0,
      },
    });
  }

  async function markReadyForPickup() {
    const nextFinal: FinalState = {
      ...finalState,
      readyForPickup: true,
      completed: false,
      completedAt: "",
    };

    await saveFinalState(nextFinal, "Ready for Pickup");
  }

  async function markCompleted() {
    const completedAt = new Date().toISOString();

    const nextFinal: FinalState = {
      ...finalState,
      readyForPickup: true,
      completed: true,
      completedAt,
    };

    await saveFinalState(nextFinal, "Completed");
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #02060B 0%, #030912 18%, #03101B 46%, #020912 76%, #02060B 100%)",
          color: "#F5FAFF",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            borderRadius: "24px",
            border: "1px solid rgba(109, 142, 176, 0.22)",
            background:
              "linear-gradient(180deg, rgba(8,15,24,0.98) 0%, rgba(4,10,18,1) 100%)",
            padding: "28px",
          }}
        >
          Loading final condition…
        </div>
      </main>
    );
  }

  if (!job) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #02060B 0%, #030912 18%, #03101B 46%, #020912 76%, #02060B 100%)",
          color: "#F5FAFF",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            borderRadius: "24px",
            border: "1px solid rgba(109, 142, 176, 0.22)",
            background:
              "linear-gradient(180deg, rgba(8,15,24,0.98) 0%, rgba(4,10,18,1) 100%)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "22px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                fontSize: "0.82rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(215,229,240,0.7)",
                marginBottom: "8px",
              }}
            >
              ShopPROOF
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "2rem",
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
                fontWeight: 900,
              }}
            >
              Final Condition
            </h1>
          </div>

          <div style={{ padding: "24px" }}>
            <div
              style={{
                borderRadius: "18px",
                border: "1px solid rgba(255,255,255,0.08)",
                background:
                  "linear-gradient(180deg, rgba(20,32,48,0.94) 0%, rgba(11,19,30,0.98) 100%)",
                padding: "22px",
              }}
            >
              <div
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  marginBottom: "10px",
                }}
              >
                Job not found
              </div>

              <p
                style={{
                  margin: 0,
                  color: "rgba(215,229,240,0.78)",
                  lineHeight: 1.6,
                }}
              >
                We could not find a job for ID{" "}
                <span style={{ color: "#78ABFF", fontWeight: 700 }}>
                  {jobId || "unknown"}
                </span>
                .
              </p>

              <div style={{ marginTop: "18px" }}>
                <button
                  onClick={() => router.push("/shopproof/dashboard")}
                  style={{
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    cursor: "pointer",
                    fontWeight: 800,
                    color: "#04111C",
                    background:
                      "linear-gradient(135deg, #7EE0FF 0%, #6AC2FF 48%, #90B7FF 100%)",
                  }}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #02060B 0%, #030912 18%, #03101B 46%, #020912 76%, #02060B 100%)",
        color: "#F5FAFF",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          display: "grid",
          gap: "18px",
        }}
      >
        <section
          style={{
            borderRadius: "26px",
            border: "1px solid rgba(109, 142, 176, 0.22)",
            background:
              "linear-gradient(180deg, rgba(7,15,25,0.985) 0%, rgba(5,12,20,0.995) 42%, rgba(3,9,15,1) 100%)",
            boxShadow: "0 34px 90px rgba(0,0,0,0.5)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "14px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(215,229,240,0.72)",
                  marginBottom: "8px",
                }}
              >
                ShopPROOF • Final Condition
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: "2.15rem",
                  lineHeight: 1.02,
                  letterSpacing: "-0.045em",
                  fontWeight: 900,
                }}
              >
                {getVehicleLine(job)}
              </h1>

              <p
                style={{
                  margin: "10px 0 0",
                  color: "rgba(215,229,240,0.78)",
                  lineHeight: 1.55,
                  maxWidth: "760px",
                }}
              >
                Close out the job cleanly with final condition photos, customer-ready
                notes, mileage out, and delivery status.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <Link
                href={`/shopproof/jobs/${jobId}`}
                style={{
                  textDecoration: "none",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#EAF6FF",
                  fontWeight: 800,
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                Back to Job
              </Link>

              <Link
                href={`/shopproof/sign/${job?.authorizationToken || job?.token || ""}`}
                style={{
                  textDecoration: "none",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  border: "1px solid rgba(124, 190, 255, 0.25)",
                  color: "#DFF3FF",
                  fontWeight: 800,
                  background:
                    "linear-gradient(180deg, rgba(28,58,90,0.72) 0%, rgba(18,40,63,0.88) 100%)",
                }}
              >
                Open Sign Flow
              </Link>

              <button
                onClick={() => saveFinalState()}
                disabled={saving}
                style={{
                  border: "none",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  cursor: saving ? "default" : "pointer",
                  fontWeight: 900,
                  color: "#04111C",
                  background:
                    "linear-gradient(135deg, #7EE0FF 0%, #6AC2FF 45%, #90B7FF 100%)",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? "Saving..." : "Save Final Page"}
              </button>
            </div>
          </div>

          <div
            style={{
              padding: "20px 24px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {[
              { label: "Job ID", value: String(job?.id || "—") },
              { label: "Customer", value: getCustomerName(job) },
              { label: "VIN", value: getVin(job) },
              { label: "Plate", value: getPlate(job) },
              { label: "Assigned", value: getAssignedTech(job) },
              {
                label: "Created",
                value: formatDateTime(getCreatedAt(job)),
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.07)",
                  background:
                    "linear-gradient(180deg, rgba(18,31,46,0.72) 0%, rgba(10,19,30,0.9) 100%)",
                  padding: "14px 14px 12px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(215,229,240,0.6)",
                    marginBottom: "8px",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontWeight: 800,
                    lineHeight: 1.35,
                    color: "#F3FAFF",
                    wordBreak: "break-word",
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              padding: "18px 24px 22px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "12px",
            }}
          >
            <div
              style={{
                borderRadius: "18px",
                border: "1px solid rgba(107, 228, 171, 0.16)",
                background:
                  "linear-gradient(180deg, rgba(17,41,34,0.62) 0%, rgba(8,22,18,0.92) 100%)",
                padding: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "0.78rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 800,
                  color: "rgba(173,255,223,0.72)",
                  marginBottom: "8px",
                }}
              >
                Final Readiness
              </div>
              <div
                style={{
                  fontSize: "1.9rem",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                }}
              >
                {completionScore}%
              </div>
              <div
                style={{
                  marginTop: "8px",
                  color: "rgba(220,245,235,0.76)",
                  lineHeight: 1.45,
                }}
              >
                Final wrap-up progress based on checklist, notes, and required closeout
                fields.
              </div>
            </div>

            <div
              style={{
                borderRadius: "18px",
                border: "1px solid rgba(120,171,255,0.18)",
                background:
                  "linear-gradient(180deg, rgba(20,36,63,0.7) 0%, rgba(10,18,31,0.94) 100%)",
                padding: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "0.78rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 800,
                  color: "rgba(176,208,255,0.72)",
                  marginBottom: "8px",
                }}
              >
                Job Status
              </div>
              <div
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 900,
                }}
              >
                {safeString(job?.status) || "New Intake"}
              </div>
              <div
                style={{
                  marginTop: "8px",
                  color: "rgba(215,229,240,0.76)",
                  lineHeight: 1.45,
                }}
              >
                Use this page to move the job to <strong>Ready for Pickup</strong> or{" "}
                <strong>Completed</strong>.
              </div>
            </div>

            <div
              style={{
                borderRadius: "18px",
                border: "1px solid rgba(255,255,255,0.08)",
                background:
                  "linear-gradient(180deg, rgba(26,35,48,0.72) 0%, rgba(12,18,26,0.94) 100%)",
                padding: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "0.78rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 800,
                  color: "rgba(215,229,240,0.68)",
                  marginBottom: "8px",
                }}
              >
                Concern
              </div>
              <div
                style={{
                  color: "#F3FAFF",
                  lineHeight: 1.5,
                }}
              >
                {getConcern(job)}
              </div>
            </div>
          </div>
        </section>

        {(saveMessage || errorMessage) && (
          <div
            style={{
              borderRadius: "16px",
              border: `1px solid ${
                errorMessage
                  ? "rgba(255,120,120,0.22)"
                  : "rgba(126,224,255,0.18)"
              }`,
              background: errorMessage
                ? "linear-gradient(180deg, rgba(54,17,21,0.92) 0%, rgba(28,9,12,0.98) 100%)"
                : "linear-gradient(180deg, rgba(18,36,52,0.92) 0%, rgba(8,17,28,0.98) 100%)",
              padding: "14px 16px",
              color: errorMessage ? "#FFD4D4" : "#DDF5FF",
              fontWeight: 700,
            }}
          >
            {errorMessage || saveMessage}
          </div>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.25fr) minmax(320px, 0.75fr)",
            gap: "18px",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: "18px",
            }}
          >
            <div
              style={{
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.08)",
                background:
                  "linear-gradient(180deg, rgba(9,17,28,0.98) 0%, rgba(5,11,18,1) 100%)",
                boxShadow: "0 28px 70px rgba(0,0,0,0.35)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "18px 20px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 900,
                    marginBottom: "6px",
                  }}
                >
                  Final condition photos
                </div>
                <div
                  style={{
                    color: "rgba(215,229,240,0.75)",
                    lineHeight: 1.5,
                  }}
                >
                  Final vehicle overall condition photos are required before closeout.
                </div>
              </div>

              <div style={{ padding: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    alignItems: "center",
                    marginBottom: "18px",
                  }}
                >
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "12px",
                      padding: "12px 16px",
                      cursor: uploading ? "default" : "pointer",
                      fontWeight: 900,
                      color: "#04111C",
                      background:
                        "linear-gradient(135deg, #7EE0FF 0%, #6AC2FF 45%, #90B7FF 100%)",
                      opacity: uploading ? 0.7 : 1,
                    }}
                  >
                    {uploading ? "Uploading..." : "Add Final Photos"}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      style={{ display: "none" }}
                      disabled={uploading}
                    />
                  </label>

                  <div
                    style={{
                      color: "rgba(215,229,240,0.72)",
                      fontSize: "0.95rem",
                    }}
                  >
                    {finalState.photos.length} photo
                    {finalState.photos.length === 1 ? "" : "s"} attached
                  </div>
                </div>

                {finalState.photos.length === 0 ? (
                  <div
                    style={{
                      borderRadius: "18px",
                      border: "1px dashed rgba(255,255,255,0.14)",
                      padding: "22px",
                      color: "rgba(215,229,240,0.72)",
                      lineHeight: 1.55,
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    No final photos yet. Add clear exterior and any important delivery
                    condition photos before marking the vehicle ready.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                      gap: "14px",
                    }}
                  >
                    {finalState.photos.map((photo) => (
                      <div
                        key={photo.id}
                        style={{
                          borderRadius: "18px",
                          border: "1px solid rgba(255,255,255,0.08)",
                          overflow: "hidden",
                          background:
                            "linear-gradient(180deg, rgba(16,29,42,0.92) 0%, rgba(9,17,26,0.98) 100%)",
                        }}
                      >
                        <div
                          style={{
                            aspectRatio: "4 / 3",
                            backgroundImage: `url(${photo.url})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />

                        <div style={{ padding: "12px" }}>
                          <div
                            style={{
                              fontWeight: 800,
                              lineHeight: 1.35,
                              marginBottom: "6px",
                              wordBreak: "break-word",
                            }}
                          >
                            {photo.name}
                          </div>

                          <div
                            style={{
                              color: "rgba(215,229,240,0.62)",
                              fontSize: "0.88rem",
                              marginBottom: "10px",
                            }}
                          >
                            Added {formatDateTime(photo.addedAt)}
                          </div>

                          <button
                            onClick={() => removePhoto(photo.id)}
                            style={{
                              border: "1px solid rgba(255,120,120,0.22)",
                              borderRadius: "10px",
                              padding: "10px 12px",
                              cursor: "pointer",
                              fontWeight: 800,
                              color: "#FFD8D8",
                              background: "rgba(90,24,24,0.28)",
                              width: "100%",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.08)",
                background:
                  "linear-gradient(180deg, rgba(9,17,28,0.98) 0%, rgba(5,11,18,1) 100%)",
                boxShadow: "0 28px 70px rgba(0,0,0,0.35)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "18px 20px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 900,
                    marginBottom: "6px",
                  }}
                >
                  Final notes
                </div>
                <div
                  style={{
                    color: "rgba(215,229,240,0.75)",
                    lineHeight: 1.5,
                  }}
                >
                  Document what was completed and what the customer needs to know at
                  pickup.
                </div>
              </div>

              <div
                style={{
                  padding: "20px",
                  display: "grid",
                  gap: "14px",
                }}
              >
                <div style={{ display: "grid", gap: "8px" }}>
                  <label style={{ fontWeight: 800, color: "#EAF6FF" }}>
                    Mileage Out
                  </label>
                  <input
                    value={finalState.finalMileageOut}
                    onChange={(event) =>
                      updateField("finalMileageOut", event.target.value)
                    }
                    placeholder="Enter mileage out"
                    style={{
                      width: "100%",
                      borderRadius: "14px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.04)",
                      color: "#F5FAFF",
                      padding: "14px 16px",
                      outline: "none",
                      fontSize: "1rem",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gap: "8px" }}>
                  <label style={{ fontWeight: 800, color: "#EAF6FF" }}>
                    Final Summary
                  </label>
                  <textarea
                    value={finalState.finalSummary}
                    onChange={(event) =>
                      updateField("finalSummary", event.target.value)
                    }
                    placeholder="Summarize the repair result and current vehicle state"
                    rows={4}
                    style={{
                      width: "100%",
                      borderRadius: "14px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.04)",
                      color: "#F5FAFF",
                      padding: "14px 16px",
                      outline: "none",
                      fontSize: "1rem",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gap: "8px" }}>
                  <label style={{ fontWeight: 800, color: "#EAF6FF" }}>
                    Customer-Facing Notes
                  </label>
                  <textarea
                    value={finalState.customerFacingNotes}
                    onChange={(event) =>
                      updateField("customerFacingNotes", event.target.value)
                    }
                    placeholder="Anything the customer needs to know at pickup"
                    rows={4}
                    style={{
                      width: "100%",
                      borderRadius: "14px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.04)",
                      color: "#F5FAFF",
                      padding: "14px 16px",
                      outline: "none",
                      fontSize: "1rem",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gap: "8px" }}>
                  <label style={{ fontWeight: 800, color: "#EAF6FF" }}>
                    Internal Closeout Notes
                  </label>
                  <textarea
                    value={finalState.internalCloseoutNotes}
                    onChange={(event) =>
                      updateField("internalCloseoutNotes", event.target.value)
                    }
                    placeholder="Internal notes, delivery reminders, or follow-up items"
                    rows={4}
                    style={{
                      width: "100%",
                      borderRadius: "14px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.04)",
                      color: "#F5FAFF",
                      padding: "14px 16px",
                      outline: "none",
                      fontSize: "1rem",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "14px",
                  }}
                >
                  <div style={{ display: "grid", gap: "8px" }}>
                    <label style={{ fontWeight: 800, color: "#EAF6FF" }}>
                      Completed By
                    </label>
                    <input
                      value={finalState.completedBy}
                      onChange={(event) =>
                        updateField("completedBy", event.target.value)
                      }
                      placeholder="Tech, advisor, or manager"
                      style={{
                        width: "100%",
                        borderRadius: "14px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.04)",
                        color: "#F5FAFF",
                        padding: "14px 16px",
                        outline: "none",
                        fontSize: "1rem",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      borderRadius: "14px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.03)",
                      padding: "14px 16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "rgba(215,229,240,0.62)",
                        marginBottom: "8px",
                      }}
                    >
                      Completed At
                    </div>
                    <div style={{ fontWeight: 800 }}>
                      {finalState.completedAt
                        ? formatDateTime(finalState.completedAt)
                        : "Not completed yet"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: "18px",
            }}
          >
            <div
              style={{
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.08)",
                background:
                  "linear-gradient(180deg, rgba(9,17,28,0.98) 0%, rgba(5,11,18,1) 100%)",
                boxShadow: "0 28px 70px rgba(0,0,0,0.35)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "18px 20px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 900,
                    marginBottom: "6px",
                  }}
                >
                  Closeout checklist
                </div>
                <div
                  style={{
                    color: "rgba(215,229,240,0.75)",
                    lineHeight: 1.5,
                  }}
                >
                  Confirm final-condition and delivery-readiness items before closing
                  the job.
                </div>
              </div>

              <div
                style={{
                  padding: "12px",
                  display: "grid",
                  gap: "10px",
                }}
              >
                {[
                  ["allWorkCompleted", "All approved work completed"],
                  ["vehicleRoadTested", "Vehicle road-tested / verified if applicable"],
                  ["noToolsLeftInside", "No tools, parts, or shop items left inside"],
                  ["fluidsChecked", "Fluids checked / corrected if applicable"],
                  ["warningLightsReviewed", "Warning lights reviewed before delivery"],
                  ["finalConditionPhotosTaken", "Final condition photos taken"],
                  ["customerItemsReturned", "Customer items / keys ready to return"],
                ].map(([key, label]) => {
                  const typedKey = key as keyof FinalChecklist;
                  const checked = finalState.checklist[typedKey];

                  return (
                    <label
                      key={key}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                        borderRadius: "16px",
                        border: `1px solid ${
                          checked
                            ? "rgba(107,228,171,0.18)"
                            : "rgba(255,255,255,0.07)"
                        }`,
                        background: checked
                          ? "linear-gradient(180deg, rgba(15,43,34,0.68) 0%, rgba(8,21,17,0.94) 100%)"
                          : "linear-gradient(180deg, rgba(18,28,40,0.72) 0%, rgba(9,16,24,0.95) 100%)",
                        padding: "14px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) =>
                          updateChecklistField(typedKey, event.target.checked)
                        }
                        style={{
                          width: "18px",
                          height: "18px",
                          marginTop: "2px",
                        }}
                      />

                      <div>
                        <div
                          style={{
                            fontWeight: 800,
                            color: "#F3FAFF",
                            lineHeight: 1.4,
                          }}
                        >
                          {label}
                        </div>
                        <div
                          style={{
                            marginTop: "4px",
                            fontSize: "0.9rem",
                            color: checked
                              ? "rgba(189,255,226,0.72)"
                              : "rgba(215,229,240,0.6)",
                          }}
                        >
                          {checked ? "Checked off" : "Still needs confirmation"}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.08)",
                background:
                  "linear-gradient(180deg, rgba(9,17,28,0.98) 0%, rgba(5,11,18,1) 100%)",
                boxShadow: "0 28px 70px rgba(0,0,0,0.35)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "18px 20px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 900,
                    marginBottom: "6px",
                  }}
                >
                  Status actions
                </div>
                <div
                  style={{
                    color: "rgba(215,229,240,0.75)",
                    lineHeight: 1.5,
                  }}
                >
                  Move the job forward only when final condition is truly ready.
                </div>
              </div>

              <div
                style={{
                  padding: "18px",
                  display: "grid",
                  gap: "12px",
                }}
              >
                <button
                  onClick={markReadyForPickup}
                  disabled={saving || !canMarkReady}
                  style={{
                    border: "none",
                    borderRadius: "14px",
                    padding: "14px 16px",
                    cursor: saving || !canMarkReady ? "default" : "pointer",
                    fontWeight: 900,
                    color: "#04111C",
                    background: canMarkReady
                      ? "linear-gradient(135deg, #7EF0C0 0%, #6CD9A9 48%, #9FF5D1 100%)"
                      : "linear-gradient(135deg, rgba(114,128,140,0.45) 0%, rgba(95,107,118,0.45) 100%)",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  Mark Ready for Pickup
                </button>

                <button
                  onClick={markCompleted}
                  disabled={saving || !canComplete}
                  style={{
                    border: "none",
                    borderRadius: "14px",
                    padding: "14px 16px",
                    cursor: saving || !canComplete ? "default" : "pointer",
                    fontWeight: 900,
                    color: "#04111C",
                    background: canComplete
                      ? "linear-gradient(135deg, #FFD37A 0%, #FFB95C 46%, #FFDFA3 100%)"
                      : "linear-gradient(135deg, rgba(114,128,140,0.45) 0%, rgba(95,107,118,0.45) 100%)",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  Mark Completed
                </button>

                <div
                  style={{
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background:
                      "linear-gradient(180deg, rgba(18,28,40,0.72) 0%, rgba(9,16,24,0.95) 100%)",
                    padding: "14px",
                    color: "rgba(215,229,240,0.75)",
                    lineHeight: 1.55,
                    fontSize: "0.94rem",
                  }}
                >
                  <strong style={{ color: "#F5FAFF" }}>Ready for Pickup</strong> requires
                  completed work, final photos, mileage out, and final summary.
                  <br />
                  <br />
                  <strong style={{ color: "#F5FAFF" }}>Completed</strong> also requires
                  customer-facing notes.
                </div>
              </div>
            </div>

            <div
              style={{
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.08)",
                background:
                  "linear-gradient(180deg, rgba(9,17,28,0.98) 0%, rgba(5,11,18,1) 100%)",
                boxShadow: "0 28px 70px rgba(0,0,0,0.35)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "18px 20px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 900,
                    marginBottom: "6px",
                  }}
                >
                  Related pages
                </div>
                <div
                  style={{
                    color: "rgba(215,229,240,0.75)",
                    lineHeight: 1.5,
                  }}
                >
                  Jump back into the main job workflow.
                </div>
              </div>

              <div
                style={{
                  padding: "12px",
                  display: "grid",
                  gap: "10px",
                }}
              >
                {[
                  {
                    href: `/shopproof/jobs/${jobId}`,
                    title: "Job Command Center",
                    text: "Review job details, customer info, and overall status.",
                  },
                  {
                    href: `/shopproof/jobs/${jobId}/work-order`,
                    title: "Work Order",
                    text: "Open the work-order layer tied to this repair.",
                  },
                  {
                    href: `/shopproof/sign/${job?.authorizationToken || job?.token || ""}`,
                    title: "Customer Sign Flow",
                    text: "Open the token-based acknowledgment or authorization flow.",
                  },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      textDecoration: "none",
                      borderRadius: "16px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      background:
                        "linear-gradient(180deg, rgba(18,28,40,0.72) 0%, rgba(9,16,24,0.95) 100%)",
                      padding: "14px",
                      color: "#F5FAFF",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 900,
                        marginBottom: "6px",
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        color: "rgba(215,229,240,0.72)",
                        lineHeight: 1.5,
                      }}
                    >
                      {item.text}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}