"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

type JobBucket = "intake_needed" | "in_progress" | "completed";

type ShopJob = {
  id: string;
  roNumber: string;
  customerName: string;
  vehicleYear: string;
  vehicleMake: string;
  vehicleModel: string;
  vin: string;
  concern: string;
  statusLabel: string;
  bucket: JobBucket;
  assignedTo: string;
  updatedAt: string;
  createdAt: string;
  photoCount: number;
  needsAttention: boolean;
};

const THEME = {
  bg: "#06110f",
  bg2: "#081614",
  panel: "rgba(10, 24, 21, 0.80)",
  panelStrong: "rgba(9, 22, 19, 0.92)",
  card: "linear-gradient(180deg, rgba(20,40,35,0.94) 0%, rgba(10,22,19,0.96) 100%)",
  cardSoft: "linear-gradient(180deg, rgba(17,34,30,0.90) 0%, rgba(9,20,18,0.95) 100%)",
  border: "rgba(130, 255, 210, 0.14)",
  borderStrong: "rgba(130, 255, 210, 0.22)",
  text: "#ecfffb",
  textSoft: "rgba(236,255,251,0.72)",
  textMute: "rgba(236,255,251,0.52)",
  emerald: "#7fffd4",
  emeraldSoft: "rgba(127,255,212,0.18)",
  emeraldGlow: "rgba(73, 255, 188, 0.30)",
  amber: "#ffcf70",
  amberSoft: "rgba(255, 207, 112, 0.16)",
  blue: "#8bc5ff",
  blueSoft: "rgba(139, 197, 255, 0.14)",
  red: "#ff8f8f",
  redSoft: "rgba(255, 143, 143, 0.14)",
};

const PAGE_PADDING_X = "clamp(18px, 3vw, 34px)";
const MAX_WIDTH = "1440px";

function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createClient(url, key);
}

function formatDate(dateString?: string): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatRelative(dateString?: string): string {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Unknown";

  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (mins < 60) return `${Math.max(mins, 1)}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

function normalizeStatus(raw: unknown): { label: string; bucket: JobBucket } {
  const value = String(raw ?? "").trim().toLowerCase();

  if (
    value.includes("complete") ||
    value.includes("released") ||
    value.includes("picked up") ||
    value.includes("closed")
  ) {
    return { label: "Completed", bucket: "completed" };
  }

  if (
    value.includes("repair") ||
    value.includes("progress") ||
    value.includes("parts") ||
    value.includes("diagnostic") ||
    value.includes("approval") ||
    value.includes("working")
  ) {
    return { label: "In Progress", bucket: "in_progress" };
  }

  return { label: "Intake Needed", bucket: "intake_needed" };
}

function buildVehicleLabel(job: Partial<ShopJob>): string {
  const parts = [job.vehicleYear, job.vehicleMake, job.vehicleModel].filter(Boolean);
  return parts.length ? parts.join(" ") : "Vehicle details pending";
}

function normalizeJobRow(row: Record<string, any>): ShopJob {
  const statusSource =
    row.status ??
    row.job_status ??
    row.vehicle_status ??
    row.phase ??
    row.workflow_status ??
    "Intake Needed";

  const normalized = normalizeStatus(statusSource);

  const roNumber =
    row.ro_number ??
    row.roNumber ??
    row.ticket_number ??
    row.ticketNumber ??
    row.job_number ??
    row.jobNumber ??
    row.id?.slice?.(0, 8)?.toUpperCase?.() ??
    "UNASSIGNED";

  const customerName =
    row.customer_name ??
    row.customerName ??
    row.owner_name ??
    row.ownerName ??
    row.customer ??
    "Customer Pending";

  const assignedTo =
    row.assigned_to ??
    row.assignedTo ??
    row.technician_name ??
    row.technicianName ??
    row.writer_name ??
    row.writerName ??
    "Unassigned";

  const concern =
    row.concern ??
    row.customer_concern ??
    row.customerConcern ??
    row.complaint ??
    row.notes ??
    "No concern entered yet.";

  const photoCount =
    Number(
      row.photo_count ??
        row.photoCount ??
        row.intake_photo_count ??
        row.intakePhotoCount ??
        row.photos?.length ??
        0
    ) || 0;

  const needsAttention =
    Boolean(row.missing_info) ||
    Boolean(row.missingInfo) ||
    Boolean(row.needs_attention) ||
    Boolean(row.needsAttention) ||
    normalized.bucket === "intake_needed";

  return {
    id: String(row.id ?? crypto.randomUUID()),
    roNumber: String(roNumber),
    customerName: String(customerName),
    vehicleYear: String(row.vehicle_year ?? row.year ?? ""),
    vehicleMake: String(row.vehicle_make ?? row.make ?? ""),
    vehicleModel: String(row.vehicle_model ?? row.model ?? ""),
    vin: String(row.vin ?? ""),
    concern: String(concern),
    statusLabel: normalized.label,
    bucket: normalized.bucket,
    assignedTo: String(assignedTo),
    updatedAt: String(row.updated_at ?? row.updatedAt ?? row.created_at ?? ""),
    createdAt: String(row.created_at ?? row.createdAt ?? ""),
    photoCount,
    needsAttention,
  };
}

const DEMO_JOBS: ShopJob[] = [
  {
    id: "demo-1",
    roNumber: "RO-1042",
    customerName: "James Sutton",
    vehicleYear: "2017",
    vehicleMake: "Ford",
    vehicleModel: "F-150",
    vin: "1FTEW1E50HFA00001",
    concern: "Customer states front end noise over bumps. Intake photos still needed.",
    statusLabel: "Intake Needed",
    bucket: "intake_needed",
    assignedTo: "Unassigned",
    updatedAt: new Date(Date.now() - 1000 * 60 * 19).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    photoCount: 2,
    needsAttention: true,
  },
  {
    id: "demo-2",
    roNumber: "RO-1041",
    customerName: "Michael Green",
    vehicleYear: "2012",
    vehicleMake: "Chevrolet",
    vehicleModel: "Tahoe",
    vin: "1GNSKBE09CR000002",
    concern: "A/C weak at idle. Technician confirming pressures and fan operation.",
    statusLabel: "In Progress",
    bucket: "in_progress",
    assignedTo: "Steve",
    updatedAt: new Date(Date.now() - 1000 * 60 * 63).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    photoCount: 11,
    needsAttention: false,
  },
  {
    id: "demo-3",
    roNumber: "RO-1039",
    customerName: "Angela West",
    vehicleYear: "2020",
    vehicleMake: "Toyota",
    vehicleModel: "Camry",
    vin: "4T1G11AK5LU000003",
    concern: "Brake pad replacement completed. Final release photos attached.",
    statusLabel: "Completed",
    bucket: "completed",
    assignedTo: "Chris",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    photoCount: 14,
    needsAttention: false,
  },
  {
    id: "demo-4",
    roNumber: "RO-1038",
    customerName: "Tyler Barnes",
    vehicleYear: "2015",
    vehicleMake: "Ram",
    vehicleModel: "1500",
    vin: "1C6RR7LT1FS000004",
    concern: "Engine light on. Customer approval pending on additional diagnostics.",
    statusLabel: "In Progress",
    bucket: "in_progress",
    assignedTo: "Dylan",
    updatedAt: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 11).toISOString(),
    photoCount: 7,
    needsAttention: false,
  },
];

export default function ShopProofDashboardPage() {
  const [jobs, setJobs] = useState<ShopJob[]>([]);
  const [shopName, setShopName] = useState("ShopPROOF");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mode, setMode] = useState<"live" | "demo">("demo");
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState("");

  const loadDashboard = useCallback(async () => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      setJobs(DEMO_JOBS);
      setShopName("ShopPROOF Demo Shop");
      setMode("demo");
      setError("");
      setLoading(false);
      return;
    }

    try {
      setError("");

      let resolvedShopName = "ShopPROOF";
      let resolvedShopId: string | null = null;

      const shopTry = await supabase
        .from("shops")
        .select("id, name, created_at")
        .order("created_at", { ascending: true })
        .limit(1);

      if (!shopTry.error && shopTry.data && shopTry.data.length > 0) {
        resolvedShopId = String(shopTry.data[0].id);
        resolvedShopName = String(shopTry.data[0].name || "ShopPROOF");
      }

      let jobRows: Record<string, any>[] | null = null;
      let jobErrorMessage = "";

      const primaryJobsQuery = resolvedShopId
        ? await supabase
            .from("shop_jobs")
            .select("*")
            .eq("shop_id", resolvedShopId)
            .order("updated_at", { ascending: false })
        : await supabase.from("shop_jobs").select("*").order("updated_at", { ascending: false });

      if (!primaryJobsQuery.error) {
        jobRows = primaryJobsQuery.data ?? [];
      } else {
        jobErrorMessage = primaryJobsQuery.error.message;

        const fallbackJobsQuery = await supabase.from("jobs").select("*").order("updated_at", {
          ascending: false,
        });

        if (!fallbackJobsQuery.error) {
          jobRows = fallbackJobsQuery.data ?? [];
        } else {
          jobErrorMessage = fallbackJobsQuery.error.message;
        }
      }

      if (!jobRows) {
        throw new Error(jobErrorMessage || "Unable to load dashboard jobs.");
      }

      const normalizedJobs = jobRows.map((row) => normalizeJobRow(row));

      setJobs(normalizedJobs.length ? normalizedJobs : DEMO_JOBS);
      setShopName(resolvedShopName);
      setMode(normalizedJobs.length ? "live" : "demo");
      setLoading(false);
    } catch (err) {
      console.error("Dashboard load failed:", err);
      setJobs(DEMO_JOBS);
      setShopName("ShopPROOF Demo Shop");
      setMode("demo");
      setError(
        err instanceof Error
          ? `${err.message} Showing demo data so the dashboard stays usable.`
          : "Unable to load live data. Showing demo data instead."
      );
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const refreshDashboard = useCallback(async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  }, [loadDashboard]);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return jobs;

    return jobs.filter((job) => {
      const haystack = [
        job.roNumber,
        job.customerName,
        buildVehicleLabel(job),
        job.vin,
        job.concern,
        job.assignedTo,
        job.statusLabel,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [jobs, search]);

  const grouped = useMemo(() => {
    return {
      intake_needed: filteredJobs.filter((job) => job.bucket === "intake_needed"),
      in_progress: filteredJobs.filter((job) => job.bucket === "in_progress"),
      completed: filteredJobs.filter((job) => job.bucket === "completed"),
    };
  }, [filteredJobs]);

  const totalCount = filteredJobs.length;
  const intakeCount = grouped.intake_needed.length;
  const progressCount = grouped.in_progress.length;
  const completeCount = grouped.completed.length;
  const attentionCount = filteredJobs.filter((job) => job.needsAttention).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        color: THEME.text,
        background: `
          radial-gradient(circle at top center, rgba(45, 110, 90, 0.22) 0%, rgba(6,17,15,0) 36%),
          radial-gradient(circle at 20% 18%, rgba(56, 255, 189, 0.08) 0%, rgba(6,17,15,0) 28%),
          radial-gradient(circle at 82% 10%, rgba(111, 221, 255, 0.08) 0%, rgba(6,17,15,0) 24%),
          linear-gradient(180deg, ${THEME.bg2} 0%, ${THEME.bg} 100%)
        `,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
          maskImage: "linear-gradient(180deg, rgba(0,0,0,0.48), rgba(0,0,0,0.1))",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: "-10% auto auto 50%",
          width: "62vw",
          height: "62vw",
          transform: "translateX(-50%)",
          background:
            "radial-gradient(circle, rgba(87,255,196,0.08) 0%, rgba(87,255,196,0.03) 26%, rgba(0,0,0,0) 62%)",
          filter: "blur(32px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: MAX_WIDTH,
          margin: "0 auto",
          padding: `28px ${PAGE_PADDING_X} 44px`,
        }}
      >
        <div
          style={{
            position: "relative",
            borderRadius: 30,
            border: `1px solid ${THEME.border}`,
            background: `
              linear-gradient(180deg, rgba(14,28,24,0.76) 0%, rgba(7,16,14,0.92) 100%)
            `,
            boxShadow: `
              0 22px 60px rgba(0,0,0,0.44),
              inset 0 1px 0 rgba(255,255,255,0.05),
              0 0 0 1px rgba(255,255,255,0.02)
            `,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at top center, rgba(99,255,201,0.10) 0%, rgba(0,0,0,0) 44%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              padding: "18px clamp(18px, 2.8vw, 34px)",
              borderBottom: `1px solid ${THEME.border}`,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  display: "grid",
                  placeItems: "center",
                  background: "linear-gradient(180deg, rgba(31,66,57,0.96), rgba(12,25,22,0.98))",
                  border: `1px solid ${THEME.borderStrong}`,
                  boxShadow: `0 0 28px ${THEME.emeraldSoft}`,
                  fontSize: 20,
                }}
              >
                🔧
              </div>

              <div>
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: THEME.textMute,
                    marginBottom: 4,
                  }}
                >
                  ShopPROOF Dashboard
                </div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "clamp(1.7rem, 3vw, 2.7rem)",
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                    fontWeight: 800,
                  }}
                >
                  {shopName}
                </h1>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/shopproof"
                style={{
                  textDecoration: "none",
                  color: THEME.textSoft,
                  border: `1px solid ${THEME.border}`,
                  background: "rgba(255,255,255,0.03)",
                  padding: "12px 14px",
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                Back to Landing
              </Link>

              <Link
                href="/shopproof/new"
                style={{
                  textDecoration: "none",
                  color: "#04110d",
                  background: "linear-gradient(180deg, #9cffdf 0%, #68f0c0 100%)",
                  padding: "12px 16px",
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 800,
                  boxShadow: `0 10px 26px ${THEME.emeraldGlow}`,
                }}
              >
                + Start New Intake
              </Link>
            </div>
          </div>

          <div
            style={{
              position: "relative",
              padding: "18px clamp(18px, 2.8vw, 34px) 22px",
              display: "grid",
              gridTemplateColumns: "1.35fr 0.85fr",
              gap: 18,
            }}
          >
            <div
              style={{
                borderRadius: 24,
                border: `1px solid ${THEME.border}`,
                background: `
                  radial-gradient(circle at top left, rgba(118,255,212,0.10) 0%, rgba(0,0,0,0) 36%),
                  ${THEME.card}
                `,
                padding: "22px",
                boxShadow: `
                  inset 0 1px 0 rgba(255,255,255,0.04),
                  0 20px 50px rgba(0,0,0,0.25)
                `,
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: mode === "live" ? THEME.emeraldSoft : THEME.amberSoft,
                  border: `1px solid ${mode === "live" ? THEME.borderStrong : "rgba(255,207,112,0.22)"}`,
                  color: mode === "live" ? THEME.emerald : THEME.amber,
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: mode === "live" ? THEME.emerald : THEME.amber,
                    boxShadow: `0 0 14px ${mode === "live" ? THEME.emerald : THEME.amber}`,
                  }}
                />
                {mode === "live" ? "Live shop data" : "Demo mode"}
              </div>

              <h2
                style={{
                  margin: "0 0 10px",
                  fontSize: "clamp(1.5rem, 2.1vw, 2.2rem)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.04em",
                }}
              >
                Intake to release, organized the way a shop actually works.
              </h2>

              <p
                style={{
                  margin: 0,
                  color: THEME.textSoft,
                  fontSize: 15,
                  lineHeight: 1.65,
                  maxWidth: 760,
                }}
              >
                Keep every active vehicle visible, keep incomplete jobs from getting buried, and
                keep finished work tied to a defensible record. This dashboard is built to show what
                needs attention first without flattening the rest of the workflow.
              </p>
            </div>

            <div
              style={{
                borderRadius: 24,
                border: `1px solid ${THEME.border}`,
                background: THEME.cardSoft,
                padding: "18px",
                boxShadow: `
                  inset 0 1px 0 rgba(255,255,255,0.04),
                  0 20px 50px rgba(0,0,0,0.25)
                `,
                display: "grid",
                gap: 12,
                alignContent: "start",
              }}
            >
              <label
                htmlFor="dashboard-search"
                style={{
                  fontSize: 12,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: THEME.textMute,
                  fontWeight: 800,
                }}
              >
                Search jobs
              </label>

              <input
                id="dashboard-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search RO, customer, vehicle, VIN, concern..."
                style={{
                  width: "100%",
                  borderRadius: 14,
                  border: `1px solid ${THEME.border}`,
                  background: "rgba(255,255,255,0.04)",
                  color: THEME.text,
                  padding: "14px 14px",
                  outline: "none",
                  fontSize: 14,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                }}
              />

              <button
                type="button"
                onClick={refreshDashboard}
                disabled={refreshing}
                style={{
                  borderRadius: 14,
                  border: `1px solid ${THEME.borderStrong}`,
                  background: "rgba(121,255,212,0.08)",
                  color: THEME.text,
                  padding: "13px 14px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {refreshing ? "Refreshing..." : "Refresh Dashboard"}
              </button>

              <div style={{ color: THEME.textMute, fontSize: 13, lineHeight: 1.5 }}>
                {error ? error : "Search narrows all three job sections in real time."}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 14,
          }}
        >
          <StatCard
            label="Total Visible Jobs"
            value={String(totalCount)}
            accent="emerald"
            sublabel={mode === "live" ? "Loaded from database" : "Showing demo fallback"}
          />
          <StatCard
            label="Intake Needed"
            value={String(intakeCount)}
            accent="amber"
            sublabel="Condition, photos, or basic intake still pending"
          />
          <StatCard
            label="In Progress"
            value={String(progressCount)}
            accent="blue"
            sublabel="Vehicles actively moving through diagnosis or repair"
          />
          <StatCard
            label="Needs Attention"
            value={String(attentionCount)}
            accent="red"
            sublabel="Jobs likely to need immediate eyes first"
          />
        </div>

        <div
          style={{
            marginTop: 20,
            display: "grid",
            gap: 18,
          }}
        >
          <DashboardSection
            title="Intake Needed"
            subtitle="New arrivals and incomplete intakes that need condition proof, photos, or basic setup before they disappear into the day."
            count={intakeCount}
            accent="amber"
            emptyMessage="No vehicles are waiting on intake right now."
          >
            {loading ? (
              <LoadingCardGroup />
            ) : (
              grouped.intake_needed.map((job) => <JobCard key={job.id} job={job} />)
            )}
          </DashboardSection>

          <DashboardSection
            title="In Progress"
            subtitle="Vehicles currently being diagnosed, approved, repaired, or waiting on the next operational step."
            count={progressCount}
            accent="blue"
            emptyMessage="No vehicles are currently marked in progress."
          >
            {loading ? (
              <LoadingCardGroup />
            ) : (
              grouped.in_progress.map((job) => <JobCard key={job.id} job={job} />)
            )}
          </DashboardSection>

          <DashboardSection
            title="Completed"
            subtitle="Finished jobs with final documentation in place and ready to reference later."
            count={completeCount}
            accent="emerald"
            emptyMessage="No completed jobs are visible yet."
          >
            {loading ? (
              <LoadingCardGroup />
            ) : (
              grouped.completed.map((job) => <JobCard key={job.id} job={job} />)
            )}
          </DashboardSection>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1180px) {
          div[style*="grid-template-columns: 1.35fr 0.85fr"] {
            grid-template-columns: 1fr !important;
          }

          div[style*="repeat(4, minmax(0, 1fr))"] {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 820px) {
          div[style*="repeat(2, minmax(0, 1fr))"] {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 760px) {
          div[style*="repeat(4, minmax(0, 1fr))"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function StatCard({
  label,
  value,
  sublabel,
  accent,
}: {
  label: string;
  value: string;
  sublabel: string;
  accent: "emerald" | "amber" | "blue" | "red";
}) {
  const accentMap = {
    emerald: {
      text: THEME.emerald,
      glow: THEME.emeraldGlow,
      bg: THEME.emeraldSoft,
      border: THEME.borderStrong,
    },
    amber: {
      text: THEME.amber,
      glow: "rgba(255, 207, 112, 0.22)",
      bg: THEME.amberSoft,
      border: "rgba(255, 207, 112, 0.18)",
    },
    blue: {
      text: THEME.blue,
      glow: "rgba(139, 197, 255, 0.22)",
      bg: THEME.blueSoft,
      border: "rgba(139, 197, 255, 0.18)",
    },
    red: {
      text: THEME.red,
      glow: "rgba(255, 143, 143, 0.20)",
      bg: THEME.redSoft,
      border: "rgba(255, 143, 143, 0.18)",
    },
  }[accent];

  return (
    <div
      style={{
        borderRadius: 22,
        border: `1px solid ${accentMap.border}`,
        background: `
          radial-gradient(circle at top left, ${accentMap.bg} 0%, rgba(0,0,0,0) 34%),
          ${THEME.cardSoft}
        `,
        padding: "18px 18px 16px",
        boxShadow: `
          0 18px 44px rgba(0,0,0,0.22),
          inset 0 1px 0 rgba(255,255,255,0.04)
        `,
      }}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: THEME.textMute,
          fontWeight: 800,
          marginBottom: 10,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
          fontWeight: 900,
          letterSpacing: "-0.05em",
          color: accentMap.text,
          textShadow: `0 0 24px ${accentMap.glow}`,
          lineHeight: 1,
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: 8,
          color: THEME.textSoft,
          fontSize: 13,
          lineHeight: 1.45,
        }}
      >
        {sublabel}
      </div>
    </div>
  );
}

function DashboardSection({
  title,
  subtitle,
  count,
  accent,
  emptyMessage,
  children,
}: {
  title: string;
  subtitle: string;
  count: number;
  accent: "emerald" | "amber" | "blue";
  emptyMessage: string;
  children: React.ReactNode;
}) {
  const color =
    accent === "emerald" ? THEME.emerald : accent === "amber" ? THEME.amber : THEME.blue;

  const glow =
    accent === "emerald"
      ? THEME.emeraldSoft
      : accent === "amber"
      ? THEME.amberSoft
      : THEME.blueSoft;

  const childArray = Array.isArray(children) ? children : [children];
  const hasContent = childArray.some(Boolean);

  return (
    <section
      style={{
        position: "relative",
        borderRadius: 28,
        border: `1px solid ${THEME.border}`,
        background: `
          radial-gradient(circle at top left, ${glow} 0%, rgba(0,0,0,0) 28%),
          linear-gradient(180deg, rgba(10,24,21,0.82) 0%, rgba(8,17,15,0.94) 100%)
        `,
        boxShadow: `
          0 24px 56px rgba(0,0,0,0.28),
          inset 0 1px 0 rgba(255,255,255,0.04)
        `,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "20px 22px 18px",
          borderBottom: `1px solid ${THEME.border}`,
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div style={{ maxWidth: 850 }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color,
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            {title}
          </div>
          <h3
            style={{
              margin: "0 0 6px",
              fontSize: "clamp(1.25rem, 2vw, 1.75rem)",
              lineHeight: 1.08,
              letterSpacing: "-0.04em",
            }}
          >
            {count} {count === 1 ? "job" : "jobs"}
          </h3>
          <p
            style={{
              margin: 0,
              color: THEME.textSoft,
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            {subtitle}
          </p>
        </div>

        <div
          style={{
            minWidth: 92,
            borderRadius: 999,
            padding: "10px 14px",
            border: `1px solid ${THEME.border}`,
            background: "rgba(255,255,255,0.03)",
            color: THEME.text,
            textAlign: "center",
            fontWeight: 800,
          }}
        >
          {count}
        </div>
      </div>

      <div
        style={{
          padding: "18px",
          display: "grid",
          gap: 14,
        }}
      >
        {hasContent && count > 0 ? (
          children
        ) : (
          <div
            style={{
              borderRadius: 22,
              border: `1px dashed ${THEME.borderStrong}`,
              background: "rgba(255,255,255,0.025)",
              padding: "22px",
              color: THEME.textSoft,
              fontSize: 14,
            }}
          >
            {emptyMessage}
          </div>
        )}
      </div>
    </section>
  );
}

function JobCard({ job }: { job: ShopJob }) {
  const statusAccent =
    job.bucket === "completed"
      ? { text: THEME.emerald, bg: THEME.emeraldSoft, border: THEME.borderStrong }
      : job.bucket === "in_progress"
      ? { text: THEME.blue, bg: THEME.blueSoft, border: "rgba(139,197,255,0.18)" }
      : { text: THEME.amber, bg: THEME.amberSoft, border: "rgba(255,207,112,0.18)" };

  return (
    <article
      style={{
        borderRadius: 24,
        border: `1px solid ${job.needsAttention ? "rgba(255, 207, 112, 0.24)" : THEME.border}`,
        background: `
          radial-gradient(circle at top left, ${
            job.needsAttention ? "rgba(255,207,112,0.08)" : "rgba(127,255,212,0.05)"
          } 0%, rgba(0,0,0,0) 30%),
          ${THEME.card}
        `,
        boxShadow: `
          0 18px 42px rgba(0,0,0,0.22),
          inset 0 1px 0 rgba(255,255,255,0.04)
        `,
        padding: "18px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 0.7fr",
          gap: 18,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 999,
                padding: "8px 12px",
                background: statusAccent.bg,
                border: `1px solid ${statusAccent.border}`,
                color: statusAccent.text,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: statusAccent.text,
                }}
              />
              {job.statusLabel}
            </span>

            <span
              style={{
                borderRadius: 999,
                padding: "8px 12px",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${THEME.border}`,
                color: THEME.textSoft,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {job.roNumber}
            </span>

            {job.needsAttention && (
              <span
                style={{
                  borderRadius: 999,
                  padding: "8px 12px",
                  background: THEME.amberSoft,
                  border: "1px solid rgba(255,207,112,0.22)",
                  color: THEME.amber,
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Needs Attention
              </span>
            )}
          </div>

          <h4
            style={{
              margin: "0 0 6px",
              fontSize: "clamp(1.05rem, 1.4vw, 1.25rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              fontWeight: 800,
            }}
          >
            {buildVehicleLabel(job)}
          </h4>

          <div
            style={{
              color: THEME.textSoft,
              fontSize: 14,
              marginBottom: 12,
            }}
          >
            {job.customerName}
            {job.vin ? ` • VIN ${job.vin.slice(-8)}` : ""}
          </div>

          <p
            style={{
              margin: 0,
              color: THEME.textSoft,
              fontSize: 14,
              lineHeight: 1.65,
            }}
          >
            {job.concern}
          </p>
        </div>

        <div
          style={{
            borderRadius: 20,
            border: `1px solid ${THEME.border}`,
            background: "rgba(255,255,255,0.03)",
            padding: "14px",
            display: "grid",
            gap: 12,
            alignContent: "start",
          }}
        >
          <MetaRow label="Assigned To" value={job.assignedTo} />
          <MetaRow label="Photos" value={String(job.photoCount)} />
          <MetaRow label="Updated" value={formatRelative(job.updatedAt)} />
          <MetaRow label="Timestamp" value={formatDate(job.updatedAt)} />

          <div
            style={{
              marginTop: 4,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <Link
              href={`/shopproof/new?id=${encodeURIComponent(job.id)}`}
              style={{
                textDecoration: "none",
                flex: 1,
                minWidth: 120,
                textAlign: "center",
                borderRadius: 14,
                padding: "12px 12px",
                background: "rgba(255,255,255,0.05)",
                color: THEME.text,
                border: `1px solid ${THEME.border}`,
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              Open Job
            </Link>

            <Link
              href="/shopproof/new"
              style={{
                textDecoration: "none",
                flex: 1,
                minWidth: 120,
                textAlign: "center",
                borderRadius: 14,
                padding: "12px 12px",
                background: "linear-gradient(180deg, rgba(140,255,219,0.18), rgba(90,230,185,0.10))",
                color: THEME.text,
                border: `1px solid ${THEME.borderStrong}`,
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              Add Intake
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 920px) {
          article > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </article>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "grid",
        gap: 4,
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: THEME.textMute,
          fontWeight: 800,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          color: THEME.text,
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function LoadingCardGroup() {
  return (
    <>
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            borderRadius: 24,
            border: `1px solid ${THEME.border}`,
            background: THEME.cardSoft,
            padding: "18px",
            minHeight: 150,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
              transform: "translateX(-100%)",
              animation: "shimmer 1.5s infinite",
            }}
          />
          <div
            style={{
              display: "grid",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 140,
                height: 24,
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
              }}
            />
            <div
              style={{
                width: "48%",
                height: 24,
                borderRadius: 10,
                background: "rgba(255,255,255,0.08)",
              }}
            />
            <div
              style={{
                width: "82%",
                height: 16,
                borderRadius: 10,
                background: "rgba(255,255,255,0.06)",
              }}
            />
            <div
              style={{
                width: "74%",
                height: 16,
                borderRadius: 10,
                background: "rgba(255,255,255,0.06)",
              }}
            />
          </div>

          <style jsx>{`
            @keyframes shimmer {
              100% {
                transform: translateX(100%);
              }
            }
          `}</style>
        </div>
      ))}
    </>
  );
}