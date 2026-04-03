"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  AlertCircle,
  CarFront,
  Clock3,
  FileLock2,
  FileText,
  Headset,
  LoaderCircle,
  Search,
  Shield,
} from "lucide-react";

type ShopJobStatus =
  | "New Intake"
  | "Waiting on Approval"
  | "Approved"
  | "In Progress"
  | "Waiting on Parts"
  | "Ready for Pickup"
  | "Completed"
  | "Declined";

type Accent = "blue" | "orange" | "emerald";
type StatusTone = "red" | "yellow" | "green" | "blue";

type VehicleRow = {
  id?: string | null;
  year?: string | number | null;
  make?: string | null;
  model?: string | null;
  vin?: string | null;
  plate?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  created_at?: string | null;
};

type JobRow = {
  id: string;
  shop_id?: string | null;
  customer_id?: string | null;
  vehicle_id?: string | null;
  status?: string | null;
  approval_status?: string | null;
  approval_state?: string | null;
  assigned_to?: string | null;
  concern?: string | null;
  notes?: string | null;
  findings?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  vehicle?: VehicleRow | VehicleRow[] | null;
  vehicles?: VehicleRow | VehicleRow[] | null;
};

type DashboardJobCard = {
  id: string;
  status: ShopJobStatus;
  vehicleLabel: string;
  vin: string;
  concern: string;
  createdAt: string | null;
  updatedAt: string | null;
  assignedTo: string;
};

const THEME = {
  pageBase:
    "linear-gradient(180deg, #02060B 0%, #030912 18%, #03101B 46%, #020912 76%, #02060B 100%)",
  shell:
    "linear-gradient(180deg, rgba(7,15,25,0.98) 0%, rgba(5,12,20,0.995) 42%, rgba(3,9,15,1) 100%)",
  panel:
    "linear-gradient(180deg, rgba(13,24,37,0.98) 0%, rgba(8,16,27,0.99) 48%, rgba(7,13,22,1) 100%)",
  card:
    "linear-gradient(180deg, rgba(19,34,51,0.98) 0%, rgba(14,27,42,0.98) 44%, rgba(10,20,33,1) 100%)",
  cardSoft:
    "linear-gradient(180deg, rgba(14,27,44,0.76) 0%, rgba(8,16,27,0.68) 100%)",
  text: "#F5FAFF",
  textSoft: "#D7E5F0",
  textMuted: "#9CB1C1",
  lineSoft: "rgba(255,255,255,0.055)",
  lineFaint: "rgba(255,255,255,0.032)",
  border: "1px solid rgba(109, 142, 176, 0.24)",
  borderSoft: "1px solid rgba(255,255,255,0.085)",
  shellShadow: "0 34px 90px rgba(0,0,0,0.5)",
  panelShadow: "0 18px 42px rgba(0,0,0,0.24)",
  cardShadow: "0 10px 22px rgba(0,0,0,0.16)",
  blue: "#3B82F6",
  blueSoft: "rgba(59,130,246,0.16)",
  blueLine: "rgba(59,130,246,0.84)",
  orange: "#F59E42",
  orangeSoft: "rgba(245,158,66,0.18)",
  orangeLine: "rgba(245,158,66,0.84)",
  emerald: "#27D9BF",
  emeraldSoft: "rgba(39,217,191,0.18)",
  emeraldLine: "rgba(39,217,191,0.84)",
  red: "#FF6B7A",
  redSoft: "rgba(255,107,122,0.18)",
  redLine: "rgba(255,107,122,0.84)",
  yellow: "#F5C451",
  yellowSoft: "rgba(245,196,81,0.18)",
  yellowLine: "rgba(245,196,81,0.84)",
  buttonBlue:
    "linear-gradient(180deg, rgba(36,126,255,1) 0%, rgba(21,101,219,1) 100%)",
};

function getBrowserSupabaseClient(): SupabaseClient | null {
  if (typeof window === "undefined") return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createClient(url, key);
}

function normalizeJobStatus(status: string | null | undefined): ShopJobStatus {
  if (status === "New Intake") return "New Intake";
  if (status === "Waiting on Approval") return "Waiting on Approval";
  if (status === "Approved") return "Approved";
  if (status === "In Progress") return "In Progress";
  if (status === "Waiting on Parts") return "Waiting on Parts";
  if (status === "Ready for Pickup") return "Ready for Pickup";
  if (status === "Completed") return "Completed";
  if (status === "Declined") return "Declined";
  return "New Intake";
}

function pickVehicle(job: JobRow): VehicleRow | null {
  const source = job.vehicle ?? job.vehicles ?? null;
  if (!source) return null;
  return Array.isArray(source) ? source[0] ?? null : source;
}

function formatVehicleLabel(vehicle: VehicleRow | null) {
  if (!vehicle) return "Unknown Vehicle";

  const label = [vehicle.year, vehicle.make, vehicle.model]
    .filter(Boolean)
    .map((value) => String(value).trim())
    .join(" ")
    .trim();

  return label || "Unknown Vehicle";
}

function extractConcern(job: JobRow) {
  if (job.concern?.trim()) return job.concern.trim();

  if (job.notes?.trim()) {
    const concernLine = job.notes
      .split("\n")
      .find((line) => line.toLowerCase().startsWith("concern:"));

    if (concernLine) {
      return concernLine.replace(/^concern:\s*/i, "").trim();
    }

    return job.notes.trim();
  }

  if (job.findings?.trim()) return job.findings.trim();

  return "No concern entered";
}

function formatCreatedAt(dateString: string | null | undefined) {
  if (!dateString) return "No date";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "No date";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getRelativeAge(dateString: string | null | undefined) {
  if (!dateString) return "Unknown";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Unknown";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));

  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getJobTone(status: ShopJobStatus): StatusTone {
  if (status === "Ready for Pickup" || status === "Completed") return "green";
  if (status === "Waiting on Approval" || status === "Waiting on Parts") return "yellow";
  if (status === "Declined") return "red";
  if (status === "Approved" || status === "In Progress") return "blue";
  return "blue";
}

function toneColor(tone: StatusTone) {
  if (tone === "green") {
    return {
      text: THEME.emerald,
      soft: THEME.emeraldSoft,
      line: THEME.emeraldLine,
    };
  }

  if (tone === "yellow") {
    return {
      text: THEME.yellow,
      soft: THEME.yellowSoft,
      line: THEME.yellowLine,
    };
  }

  if (tone === "blue") {
    return {
      text: THEME.blue,
      soft: THEME.blueSoft,
      line: THEME.blueLine,
    };
  }

  return {
    text: THEME.red,
    soft: THEME.redSoft,
    line: THEME.redLine,
  };
}

function getSectionAccent(title: string): Accent {
  if (title === "Intake Needed") return "orange";
  if (title === "Completed") return "emerald";
  return "blue";
}

const ghostButton: CSSProperties = {
  height: 50,
  borderRadius: 16,
  border: THEME.borderSoft,
  background:
    "linear-gradient(180deg, rgba(18,31,47,0.92) 0%, rgba(11,21,33,0.94) 100%)",
  color: THEME.text,
  padding: "0 16px",
  fontSize: "0.94rem",
  fontWeight: 800,
  letterSpacing: "-0.02em",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 9,
  cursor: "pointer",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 18px rgba(0,0,0,0.18)",
};

const primaryButton: CSSProperties = {
  height: 50,
  borderRadius: 16,
  border: "1px solid rgba(104, 164, 255, 0.72)",
  background: THEME.buttonBlue,
  color: "#F8FBFF",
  padding: "0 20px",
  fontSize: "0.96rem",
  fontWeight: 900,
  letterSpacing: "-0.02em",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 9,
  cursor: "pointer",
  boxShadow:
    "0 14px 24px rgba(21,101,219,0.24), inset 0 1px 0 rgba(255,255,255,0.14)",
};

export default function ShopProofDashboardPage() {
  const router = useRouter();

  const [width, setWidth] = useState(1440);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = width < 820;

  const loadJobs = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const client = getBrowserSupabaseClient();

      if (client) {
        const { data, error } = await client
          .from("jobs")
          .select(`
            id,
            shop_id,
            customer_id,
            vehicle_id,
            status,
            approval_status,
            assigned_to,
            concern,
            notes,
            findings,
            created_at,
            updated_at,
            vehicle:vehicles!jobs_vehicle_id_fkey (
              id,
              year,
              make,
              model,
              vin,
              plate,
              created_at
            )
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setJobs((data as JobRow[]) || []);
      } else {
        const localRaw = window.localStorage.getItem("shopproof_jobs");
        const parsed = localRaw ? JSON.parse(localRaw) : [];
        setJobs(Array.isArray(parsed) ? parsed : []);
      }
    } catch (err: any) {
      console.error("Dashboard load error:", err);

      try {
        const localRaw = window.localStorage.getItem("shopproof_jobs");
        const parsed = localRaw ? JSON.parse(localRaw) : [];

        if (Array.isArray(parsed) && parsed.length > 0) {
          setJobs(parsed);
          setError("Loaded local backup data.");
        } else {
          setJobs([]);
          setError(err?.message || "Unable to load ShopPROOF jobs.");
        }
      } catch {
        setJobs([]);
        setError(err?.message || "Unable to load ShopPROOF jobs.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const normalizedJobs = useMemo<DashboardJobCard[]>(() => {
    return jobs.map((job) => {
      const vehicle = pickVehicle(job);
      const status = normalizeJobStatus(job.status);

      return {
        id: job.id,
        status,
        vehicleLabel: formatVehicleLabel(vehicle),
        vin: vehicle?.vin?.trim() || "No VIN",
        concern: extractConcern(job),
        createdAt: job.created_at ?? null,
        updatedAt: job.updated_at ?? null,
        assignedTo: job.assigned_to?.trim() || "Unassigned",
      };
    });
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return normalizedJobs;

    return normalizedJobs.filter((job) => {
      return (
        job.vehicleLabel.toLowerCase().includes(term) ||
        job.vin.toLowerCase().includes(term) ||
        job.concern.toLowerCase().includes(term) ||
        job.status.toLowerCase().includes(term) ||
        job.assignedTo.toLowerCase().includes(term)
      );
    });
  }, [normalizedJobs, search]);

  const intakeNeeded = filteredJobs.filter(
    (job) => job.status === "New Intake" || job.status === "Waiting on Approval"
  );

  const inProgress = filteredJobs.filter(
    (job) =>
      job.status === "Approved" ||
      job.status === "In Progress" ||
      job.status === "Waiting on Parts"
  );

  const completed = filteredJobs.filter(
    (job) =>
      job.status === "Ready for Pickup" ||
      job.status === "Completed" ||
      job.status === "Declined"
  );

  const totalVisible = filteredJobs.length;
  const needsAttentionCount = intakeNeeded.length;
  const hasAnyJobs = normalizedJobs.length > 0;

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(57,122,255,0.18) 0%, rgba(57,122,255,0.06) 18%, rgba(57,122,255,0) 40%),
          radial-gradient(circle at 0% 100%, rgba(39,217,191,0.06) 0%, rgba(39,217,191,0.02) 18%, rgba(39,217,191,0) 36%),
          radial-gradient(circle at 100% 12%, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.012) 12%, rgba(255,255,255,0) 30%),
          repeating-linear-gradient(
            0deg,
            rgba(255,255,255,0.012) 0px,
            rgba(255,255,255,0.012) 1px,
            transparent 1px,
            transparent 46px
          ),
          repeating-linear-gradient(
            90deg,
            rgba(255,255,255,0.006) 0px,
            rgba(255,255,255,0.006) 1px,
            transparent 1px,
            transparent 74px
          ),
          ${THEME.pageBase}
        `,
        color: THEME.text,
        padding: isMobile ? "8px" : "18px",
      }}
    >
      <div
        style={{
          maxWidth: "1360px",
          margin: "0 auto",
          background: THEME.shell,
          border: THEME.border,
          borderRadius: "30px",
          boxShadow: THEME.shellShadow,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(circle at 22% 0%, rgba(59,130,246,0.18), transparent 32%), radial-gradient(circle at 78% 0%, rgba(39,217,191,0.10), transparent 24%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: isMobile ? 12 : 22,
            right: isMobile ? 12 : 22,
            top: isMobile ? 56 : 64,
            height: 2,
            background:
              "linear-gradient(90deg, rgba(59,130,246,0) 0%, rgba(59,130,246,0.38) 22%, rgba(59,130,246,0.72) 50%, rgba(59,130,246,0.38) 78%, rgba(59,130,246,0) 100%)",
            boxShadow: "0 0 22px rgba(59,130,246,0.28)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            minHeight: isMobile ? "auto" : 84,
            padding: isMobile ? "10px 10px 8px" : "15px 18px",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "auto 1fr auto",
            gap: isMobile ? 10 : 12,
            alignItems: "center",
            borderBottom: `1px solid ${THEME.lineFaint}`,
            position: "relative",
            background:
              "linear-gradient(180deg, rgba(10,20,31,0.86) 0%, rgba(6,13,22,0.5) 100%)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 10 : 12,
              minWidth: 0,
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: isMobile ? 38 : 42,
                height: isMobile ? 38 : 42,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: THEME.borderSoft,
                background:
                  "linear-gradient(180deg, rgba(17,32,48,0.98) 0%, rgba(10,19,29,0.98) 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 20px rgba(0,0,0,0.18)",
                flexShrink: 0,
              }}
            >
              <Shield size={isMobile ? 20 : 22} strokeWidth={2.1} color={THEME.blue} />
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: isMobile ? 18 : 28,
                  lineHeight: 1,
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ color: THEME.text }}>Shop</span>
                <span style={{ color: "#78ABFF" }}>PROOF</span>
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: THEME.textMuted,
                  marginTop: 5,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Internal operations dashboard
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "repeat(2, minmax(0, 1fr))"
                : "repeat(4, minmax(0, 1fr))",
              gap: 8,
              minWidth: 0,
              position: "relative",
              zIndex: 1,
            }}
          >
            <TopStatusBox title={`${totalVisible}`} value="Visible Jobs" />
            <TopStatusBox title={`${intakeNeeded.length}`} value="Intake Needed" />
            <TopStatusBox title={`${inProgress.length}`} value="In Progress" />
            <TopStatusBox title={`${completed.length}`} value="Completed" />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: isMobile ? "stretch" : "flex-end",
              position: "relative",
              zIndex: 1,
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              style={{ ...ghostButton, width: isMobile ? "100%" : undefined }}
              onClick={() => loadJobs(true)}
              disabled={refreshing}
            >
              {refreshing ? <LoaderCircle size={15} className="spin" /> : <Clock3 size={15} />}
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              style={{ ...primaryButton, width: isMobile ? "100%" : undefined }}
              onClick={() => router.push("/shopproof/new")}
            >
              New Intake
            </button>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            padding: isMobile ? "14px 10px 16px" : "16px",
          }}
        >
          <div
            style={{
              background: THEME.panel,
              border: THEME.borderSoft,
              borderRadius: "24px",
              boxShadow: THEME.panelShadow,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: isMobile ? "14px 14px" : "16px 20px",
                borderBottom: `1px solid ${THEME.lineSoft}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FileText size={16} color={THEME.textSoft} />
                <div>
                  <div
                    style={{
                      fontWeight: 800,
                      letterSpacing: "-0.03em",
                      fontSize: "1.06rem",
                    }}
                  >
                    Dashboard
                  </div>
                  <div
                    style={{
                      fontSize: "0.84rem",
                      color: THEME.textMuted,
                      marginTop: 2,
                    }}
                  >
                    Intake, active work, and completed records in one operational view
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: isMobile ? "12px 10px 14px" : "12px" }}>
              <div style={{ display: "grid", gap: "12px" }}>
                <SectionCard
                  icon={<Search size={17} />}
                  title="Search + Snapshot"
                  subtitle="Find jobs fast and keep the shop's current workload visible"
                  accent="blue"
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile
                        ? "1fr"
                        : "minmax(0, 1.6fr) minmax(260px, 0.8fr)",
                      gap: "10px",
                      alignItems: "end",
                    }}
                  >
                    <InputBlock
                      label="Search Jobs"
                      value={search}
                      onChange={setSearch}
                      placeholder="Search vehicle, VIN, concern, tech, status, or customer"
                    />

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        gap: "10px",
                      }}
                    >
                      <SummaryTile label="Needs Attention" value={`${needsAttentionCount}`} />
                      <SummaryTile label="All Visible" value={`${totalVisible}`} />
                    </div>
                  </div>

                  {error ? (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "10px 12px",
                        borderRadius: "12px",
                        background: "rgba(255,107,122,0.12)",
                        border: "1px solid rgba(255,107,122,0.28)",
                        color: THEME.red,
                        fontSize: "0.82rem",
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  ) : null}
                </SectionCard>

                {!loading && !hasAnyJobs ? (
                  <FirstRunCard
                    onCreate={() => router.push("/shopproof/new")}
                  />
                ) : null}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
                    gap: "12px",
                  }}
                >
                  <DashboardSection
                    title="Intake Needed"
                    subtitle="New arrivals and jobs still waiting to be pushed forward."
                    accent={getSectionAccent("Intake Needed")}
                    items={intakeNeeded}
                    emptyText={
                      loading ? "Loading intake-needed vehicles..." : "No intake-needed vehicles right now."
                    }
                    onOpen={(id) => router.push(`/shopproof/jobs/${id}`)}
                  />

                  <DashboardSection
                    title="In Progress"
                    subtitle="Vehicles actively being diagnosed, approved, repaired, or waiting on parts."
                    accent={getSectionAccent("In Progress")}
                    items={inProgress}
                    emptyText={loading ? "Loading active jobs..." : "No active jobs in progress."}
                    onOpen={(id) => router.push(`/shopproof/jobs/${id}`)}
                  />

                  <DashboardSection
                    title="Completed"
                    subtitle="Ready for pickup, completed, or declined jobs with final closeout."
                    accent={getSectionAccent("Completed")}
                    items={completed}
                    emptyText={
                      loading ? "Loading completed jobs..." : "No completed or released jobs yet."
                    }
                    onOpen={(id) => router.push(`/shopproof/jobs/${id}`)}
                  />
                </div>

                <InternalFooter isMobile={isMobile} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}

function TopStatusBox({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      style={{
        minHeight: "50px",
        borderRadius: "14px",
        border: `1px solid ${THEME.lineSoft}`,
        background:
          "linear-gradient(180deg, rgba(14,27,44,0.72) 0%, rgba(8,16,27,0.62) 100%)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "0 12px",
      }}
    >
      <span
        style={{
          fontWeight: 900,
          color: THEME.text,
          fontSize: "0.92rem",
          letterSpacing: "-0.03em",
        }}
      >
        {title}
      </span>
      <span
        style={{
          color: THEME.textSoft,
          fontSize: "0.8rem",
          fontWeight: 700,
          opacity: 0.92,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  subtitle,
  accent,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  accent: Accent;
  children: ReactNode;
}) {
  const accentMap: Record<Accent, string> = {
    blue: THEME.blueLine,
    orange: THEME.orangeLine,
    emerald: THEME.emeraldLine,
  };

  return (
    <section
      style={{
        background: THEME.card,
        border: THEME.borderSoft,
        borderRadius: "20px",
        boxShadow: THEME.cardShadow,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "0 auto 0 0",
          width: "3px",
          background: accentMap[accent],
        }}
      />

      <div style={{ padding: "13px 14px 12px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <div
            style={{
              color: THEME.textSoft,
              marginTop: "2px",
              flexShrink: 0,
            }}
          >
            {icon}
          </div>

          <div>
            <div
              style={{
                fontSize: "1rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: THEME.text,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: "0.84rem",
                color: THEME.textMuted,
                marginTop: "2px",
              }}
            >
              {subtitle}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "10px" }}>{children}</div>
      </div>
    </section>
  );
}

function DashboardSection({
  title,
  subtitle,
  accent,
  items,
  emptyText,
  onOpen,
}: {
  title: string;
  subtitle: string;
  accent: Accent;
  items: DashboardJobCard[];
  emptyText: string;
  onOpen: (id: string) => void;
}) {
  const accentMap: Record<Accent, string> = {
    blue: THEME.blueLine,
    orange: THEME.orangeLine,
    emerald: THEME.emeraldLine,
  };

  return (
    <section
      style={{
        background: THEME.card,
        border: THEME.borderSoft,
        borderRadius: "20px",
        boxShadow: THEME.cardShadow,
        overflow: "hidden",
        position: "relative",
        minHeight: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "0 auto 0 0",
          width: "3px",
          background: accentMap[accent],
        }}
      />

      <div style={{ padding: "14px 14px 14px 16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "10px",
            alignItems: "flex-start",
            marginBottom: "10px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.98rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: THEME.text,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: "0.84rem",
                color: THEME.textMuted,
                marginTop: "2px",
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </div>
          </div>

          <div
            style={{
              minWidth: 34,
              height: 34,
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                accent === "blue"
                  ? THEME.blueSoft
                  : accent === "orange"
                  ? THEME.orangeSoft
                  : THEME.emeraldSoft,
              border: `1px solid ${accentMap[accent]}`,
              color:
                accent === "blue"
                  ? THEME.blue
                  : accent === "orange"
                  ? THEME.orange
                  : THEME.emerald,
              fontWeight: 900,
              fontSize: "0.84rem",
              flexShrink: 0,
            }}
          >
            {items.length}
          </div>
        </div>

        {items.length === 0 ? (
          <div
            style={{
              borderRadius: "14px",
              border: `1px solid ${THEME.lineSoft}`,
              background:
                "linear-gradient(180deg, rgba(8,16,27,0.78) 0%, rgba(5,12,20,0.7) 100%)",
              padding: "16px 14px",
              color: THEME.textMuted,
              fontSize: "0.9rem",
              lineHeight: 1.45,
              minHeight: 72,
              display: "flex",
              alignItems: "center",
            }}
          >
            {emptyText}
          </div>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {items.map((job) => (
              <JobCard key={job.id} job={job} onOpen={() => onOpen(job.id)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function JobCard({
  job,
  onOpen,
}: {
  job: DashboardJobCard;
  onOpen: () => void;
}) {
  const tone = getJobTone(job.status);
  const colors = toneColor(tone);

  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        width: "100%",
        textAlign: "left",
        borderRadius: "16px",
        border: `1px solid ${THEME.lineSoft}`,
        background:
          "linear-gradient(180deg, rgba(8,16,27,0.78) 0%, rgba(5,12,20,0.7) 100%)",
        padding: "12px 12px",
        cursor: "pointer",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "10px",
          alignItems: "flex-start",
          marginBottom: "10px",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "4px",
            }}
          >
            <CarFront size={14} color={THEME.textSoft} />
            <span
              style={{
                color: THEME.text,
                fontSize: "0.94rem",
                fontWeight: 800,
                lineHeight: 1.25,
                wordBreak: "break-word",
              }}
            >
              {job.vehicleLabel}
            </span>
          </div>

          <div
            style={{
              color: THEME.textMuted,
              fontSize: "0.78rem",
              fontWeight: 700,
            }}
          >
            VIN: {job.vin}
          </div>
        </div>

        <span
          style={{
            borderRadius: "999px",
            padding: "7px 10px",
            border: `1px solid ${colors.line}`,
            background: colors.soft,
            color: colors.text,
            fontSize: "0.76rem",
            fontWeight: 800,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {job.status}
        </span>
      </div>

      <div
        style={{
          color: THEME.textSoft,
          fontSize: "0.84rem",
          lineHeight: 1.5,
          marginBottom: "10px",
        }}
      >
        {job.concern}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "8px",
          marginBottom: "10px",
        }}
      >
        <MiniMeta label="Assigned" value={job.assignedTo} />
        <MiniMeta label="Created" value={formatCreatedAt(job.createdAt)} />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "10px",
          alignItems: "center",
          color: THEME.textMuted,
          fontSize: "0.78rem",
          fontWeight: 700,
        }}
      >
        <span>{getRelativeAge(job.updatedAt ?? job.createdAt)}</span>
        <span style={{ color: "#78ABFF" }}>Open Job →</span>
      </div>
    </button>
  );
}

function MiniMeta({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        borderRadius: "12px",
        border: `1px solid ${THEME.lineFaint}`,
        background: "rgba(255,255,255,0.02)",
        padding: "9px 10px",
      }}
    >
      <div
        style={{
          color: THEME.textMuted,
          fontSize: "0.68rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "3px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: THEME.textSoft,
          fontSize: "0.8rem",
          fontWeight: 800,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
}: {
  label: string;