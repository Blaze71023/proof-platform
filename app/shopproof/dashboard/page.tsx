"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  LoaderCircle,
  Search,
  Shield,
  Wrench,
} from "lucide-react";

type Accent = "blue" | "orange" | "emerald";
type StatusTone = "blue" | "yellow" | "green" | "red";

type ShopJobStatus =
  | "New Intake"
  | "Waiting on Approval"
  | "Approved"
  | "In Progress"
  | "Waiting on Parts"
  | "Ready for Pickup"
  | "Completed"
  | "Declined";

type VehicleRow = {
  id?: string | null;
  year?: number | string | null;
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
    "linear-gradient(180deg, #02060B 0%, #030912 16%, #03101B 42%, #020912 72%, #02060B 100%)",
  shell:
    "linear-gradient(180deg, rgba(7,15,25,0.98) 0%, rgba(5,12,20,0.995) 42%, rgba(3,9,15,1) 100%)",
  shellInner:
    "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.012) 16%, rgba(255,255,255,0) 36%)",
  panel:
    "linear-gradient(180deg, rgba(13,24,37,0.98) 0%, rgba(8,16,27,0.99) 48%, rgba(7,13,22,1) 100%)",
  panelTop:
    "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.012) 24%, rgba(255,255,255,0) 56%)",
  panelEdgeGlow:
    "radial-gradient(circle at 50% 0%, rgba(70,130,255,0.08) 0%, rgba(70,130,255,0.03) 28%, rgba(70,130,255,0) 58%)",
  card:
    "linear-gradient(180deg, rgba(19,34,51,0.98) 0%, rgba(14,27,42,0.98) 44%, rgba(10,20,33,1) 100%)",
  cardTop:
    "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.014) 26%, rgba(255,255,255,0) 58%)",
  text: "#F5FAFF",
  textSoft: "#D7E5F0",
  textMuted: "#9CB1C1",
  textDim: "#73889A",
  lineFaint: "rgba(255,255,255,0.032)",
  lineSoft: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(109, 142, 176, 0.24)",
  borderSoft: "1px solid rgba(255,255,255,0.085)",
  shellShadow: "0 34px 90px rgba(0,0,0,0.5)",
  panelShadow: "0 18px 42px rgba(0,0,0,0.24)",
  cardShadow: "0 10px 22px rgba(0,0,0,0.16)",
  blue: "#3B82F6",
  blueSoft: "rgba(59,130,246,0.16)",
  blueLine: "rgba(59,130,246,0.84)",
  emerald: "#27D9BF",
  emeraldSoft: "rgba(39,217,191,0.18)",
  emeraldLine: "rgba(39,217,191,0.84)",
  orange: "#F59E42",
  orangeSoft: "rgba(245,158,66,0.18)",
  orangeLine: "rgba(245,158,66,0.84)",
  yellow: "#F6C454",
  yellowSoft: "rgba(246,196,84,0.16)",
  yellowLine: "rgba(246,196,84,0.84)",
  red: "#FF8792",
  redSoft: "rgba(255,135,146,0.16)",
  redLine: "rgba(255,135,146,0.84)",
  buttonBlue:
    "linear-gradient(180deg, rgba(36,126,255,1) 0%, rgba(21,101,219,1) 100%)",
};

let browserSupabase: SupabaseClient | null = null;

function getBrowserSupabaseClient() {
  if (typeof window === "undefined") return null;

  if (browserSupabase) return browserSupabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) return null;

  browserSupabase = createClient(url, anon);
  return browserSupabase;
}

function normalizeJobStatus(status?: string | null): ShopJobStatus {
  const value = (status || "").trim().toLowerCase();

  if (value === "waiting on approval") return "Waiting on Approval";
  if (value === "approved") return "Approved";
  if (value === "in progress") return "In Progress";
  if (value === "waiting on parts") return "Waiting on Parts";
  if (value === "ready for pickup") return "Ready for Pickup";
  if (value === "completed") return "Completed";
  if (value === "declined") return "Declined";
  return "New Intake";
}

function pickVehicle(job: JobRow): VehicleRow | null {
  const primary = Array.isArray(job.vehicle) ? job.vehicle[0] ?? null : job.vehicle ?? null;
  const fallback = Array.isArray(job.vehicles) ? job.vehicles[0] ?? null : job.vehicles ?? null;
  return primary || fallback || null;
}

function formatVehicleLabel(vehicle: VehicleRow | null) {
  if (!vehicle) return "Unknown Vehicle";

  const year = `${vehicle.year ?? ""}`.trim();
  const make = `${vehicle.make ?? ""}`.trim();
  const model = `${vehicle.model ?? ""}`.trim();

  const parts = [year, make, model].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Unknown Vehicle";
}

function extractConcern(job: JobRow) {
  const direct = `${job.concern ?? ""}`.trim();
  if (direct) return direct;

  const notes = `${job.notes ?? ""}`.trim();
  if (notes) return notes;

  const findings = `${job.findings ?? ""}`.trim();
  if (findings) return findings;

  return "No concern entered";
}

function formatDateLabel(value?: string | null) {
  if (!value) return "No date";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusTone(status: ShopJobStatus): StatusTone {
  if (status === "Completed" || status === "Ready for Pickup") return "green";
  if (status === "Waiting on Approval" || status === "Waiting on Parts") return "yellow";
  if (status === "Declined") return "red";
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
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

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
            approval_state,
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
              customer_name,
              customer_phone,
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
        padding: isMobile ? "12px" : "18px",
      }}
    >
      <div
        style={{
          maxWidth: 1380,
          margin: "0 auto",
          borderRadius: 28,
          overflow: "hidden",
          background: THEME.shell,
          border: THEME.border,
          boxShadow: THEME.shellShadow,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `
              ${THEME.shellInner},
              radial-gradient(circle at 50% 0%, rgba(71,123,255,0.14) 0%, rgba(71,123,255,0.05) 20%, rgba(71,123,255,0) 44%),
              repeating-linear-gradient(
                135deg,
                rgba(255,255,255,0.012) 0px,
                rgba(255,255,255,0.012) 1px,
                transparent 1px,
                transparent 9px
              )
            `,
            opacity: 0.95,
          }}
        />

        <div
          style={{
            minHeight: 66,
            padding: isMobile ? "0 14px" : "0 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            borderBottom: `1px solid ${THEME.lineFaint}`,
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                minHeight: 30,
                padding: "0 12px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "-0.01em",
                color: THEME.text,
                background:
                  "linear-gradient(180deg, rgba(19,34,51,0.98) 0%, rgba(10,20,33,1) 100%)",
                border: THEME.border,
                boxShadow: "0 0 18px rgba(59,130,246,0.18)",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              ShopPROOF
            </span>

            <span
              style={{
                minHeight: 28,
                padding: "0 12px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: THEME.textSoft,
                background:
                  "linear-gradient(180deg, rgba(14,24,36,0.88) 0%, rgba(9,17,27,0.95) 100%)",
                border: THEME.borderSoft,
              }}
            >
              Operational Dashboard
            </span>
          </div>

          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: THEME.textDim,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
            }}
          >
            Internal App
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
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, minmax(0, 1fr)) auto auto",
              gap: "10px",
              marginBottom: "14px",
            }}
          >
            <TopStatusBox label="Visible Jobs" value={totalVisible} />
            <TopStatusBox label="Intake Needed" value={intakeNeeded.length} />
            <TopStatusBox label="In Progress" value={inProgress.length} />
            <TopStatusBox label="Completed" value={completed.length} />

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
                  <FirstRunCard onCreate={() => router.push("/shopproof/new")} />
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

        input::placeholder {
          color: ${THEME.textDim};
        }
      `}</style>
    </main>
  );
}

function TopStatusBox({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div
      style={{
        minHeight: 92,
        borderRadius: 18,
        background: THEME.card,
        border: THEME.borderSoft,
        boxShadow: `${THEME.cardShadow}, inset 0 1px 0 rgba(255,255,255,0.03)`,
        padding: "14px 14px 12px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <CardTexture />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gap: 8,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: THEME.textDim,
            fontWeight: 900,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "1.8rem",
            lineHeight: 1,
            fontWeight: 950,
            letterSpacing: "-0.06em",
            color: THEME.text,
          }}
        >
          {value}
        </div>
      </div>
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
  const tone =
    accent === "emerald"
      ? {
          line: THEME.emeraldLine,
          soft: THEME.emeraldSoft,
          text: THEME.emerald,
        }
      : accent === "orange"
        ? {
            line: THEME.orangeLine,
            soft: THEME.orangeSoft,
            text: THEME.orange,
          }
        : {
            line: THEME.blueLine,
            soft: THEME.blueSoft,
            text: THEME.blue,
          };

  return (
    <div
      style={{
        background: THEME.card,
        border: THEME.borderSoft,
        borderRadius: "20px",
        boxShadow: THEME.cardShadow,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <CardTexture />

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: tone.line,
          boxShadow: `0 0 14px ${tone.line}`,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "14px",
          display: "grid",
          gap: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: tone.text,
              background: tone.soft,
              border: `1px solid ${tone.line}`,
              boxShadow: `0 0 12px ${tone.soft}`,
            }}
          >
            {icon}
          </span>

          <div style={{ display: "grid", gap: 2 }}>
            <div
              style={{
                fontSize: "1rem",
                fontWeight: 900,
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
                lineHeight: 1.5,
              }}
            >
              {subtitle}
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

function InputBlock({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label
      style={{
        display: "grid",
        gap: "8px",
      }}
    >
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

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          minHeight: 48,
          borderRadius: 14,
          padding: "0 14px",
          background:
            "linear-gradient(180deg, rgba(16,28,42,0.98) 0%, rgba(9,18,29,0.98) 100%)",
          border: "1px solid rgba(109, 142, 176, 0.24)",
          color: THEME.text,
          fontSize: 14,
          fontWeight: 700,
          outline: "none",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.04), 0 10px 18px rgba(0,0,0,0.12)",
        }}
      />
    </label>
  );
}

function SummaryTile({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div
      style={{
        minHeight: 78,
        borderRadius: 14,
        background: THEME.panel,
        border: THEME.borderSoft,
        boxShadow: THEME.cardShadow,
        padding: "12px 12px 10px",
        display: "grid",
        gap: 6,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: THEME.textDim,
          fontWeight: 900,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "1.3rem",
          lineHeight: 1,
          fontWeight: 950,
          letterSpacing: "-0.05em",
          color: THEME.text,
        }}
      >
        {value}
      </div>
    </div>
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
  const tone =
    accent === "emerald"
      ? {
          line: THEME.emeraldLine,
          soft: THEME.emeraldSoft,
          text: THEME.emerald,
        }
      : accent === "orange"
        ? {
            line: THEME.orangeLine,
            soft: THEME.orangeSoft,
            text: THEME.orange,
          }
        : {
            line: THEME.blueLine,
            soft: THEME.blueSoft,
            text: THEME.blue,
          };

  return (
    <div
      style={{
        background: THEME.card,
        border: THEME.borderSoft,
        borderRadius: "20px",
        boxShadow: THEME.cardShadow,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <CardTexture />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "14px",
          display: "grid",
          gap: "12px",
        }}
      >
        <div style={{ display: "grid", gap: 6 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontSize: "1rem",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                color: THEME.text,
              }}
            >
              {title}
            </div>

            <span
              style={{
                minHeight: 24,
                padding: "0 10px",
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: tone.text,
                background: tone.soft,
                border: `1px solid ${tone.line}`,
              }}
            >
              {items.length}
            </span>
          </div>

          <div
            style={{
              fontSize: "0.84rem",
              color: THEME.textMuted,
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </div>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {items.length === 0 ? (
            <div
              style={{
                minHeight: 144,
                borderRadius: 16,
                border: THEME.borderSoft,
                background:
                  "linear-gradient(180deg, rgba(16,28,42,0.72) 0%, rgba(10,18,29,0.88) 100%)",
                display: "grid",
                placeItems: "center",
                padding: "18px",
                textAlign: "center",
                color: THEME.textDim,
                fontSize: "0.9rem",
                fontWeight: 700,
                lineHeight: 1.6,
              }}
            >
              {emptyText}
            </div>
          ) : (
            items.map((item) => (
              <JobCard key={item.id} item={item} onOpen={() => onOpen(item.id)} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function JobCard({
  item,
  onOpen,
}: {
  item: DashboardJobCard;
  onOpen: () => void;
}) {
  const tone = toneColor(statusTone(item.status));

  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        width: "100%",
        textAlign: "left",
        borderRadius: 16,
        border: THEME.borderSoft,
        background:
          "linear-gradient(180deg, rgba(16,28,42,0.9) 0%, rgba(9,17,28,0.94) 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 18px rgba(0,0,0,0.14)",
        padding: "14px",
        cursor: "pointer",
        color: THEME.text,
        display: "grid",
        gap: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ display: "grid", gap: 6 }}>
          <div
            style={{
              fontSize: "1rem",
              lineHeight: 1.1,
              fontWeight: 900,
              letterSpacing: "-0.04em",
            }}
          >
            {item.vehicleLabel}
          </div>

          <div
            style={{
              fontSize: "0.78rem",
              color: THEME.textDim,
              fontWeight: 800,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {item.vin}
          </div>
        </div>

        <span
          style={{
            minHeight: 24,
            padding: "0 10px",
            borderRadius: 999,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: tone.text,
            background: tone.soft,
            border: `1px solid ${tone.line}`,
            flexShrink: 0,
          }}
        >
          {item.status}
        </span>
      </div>

      <div
        style={{
          fontSize: "0.9rem",
          lineHeight: 1.55,
          color: THEME.textSoft,
          fontWeight: 700,
        }}
      >
        {item.concern}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 10,
          alignItems: "center",
        }}
      >
        <div style={{ display: "grid", gap: 5 }}>
          <div
            style={{
              fontSize: "0.78rem",
              color: THEME.textMuted,
              fontWeight: 800,
            }}
          >
            Assigned: {item.assignedTo}
          </div>
          <div
            style={{
              fontSize: "0.76rem",
              color: THEME.textDim,
              fontWeight: 700,
            }}
          >
            Updated {formatDateLabel(item.updatedAt || item.createdAt)}
          </div>
        </div>

        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 999,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            border: THEME.borderSoft,
            background:
              "linear-gradient(180deg, rgba(18,30,44,0.96) 0%, rgba(10,17,28,0.98) 100%)",
            color: THEME.textSoft,
          }}
        >
          <ChevronRight size={16} />
        </span>
      </div>
    </button>
  );
}

function FirstRunCard({ onCreate }: { onCreate: () => void }) {
  return (
    <div
      style={{
        background: THEME.card,
        border: THEME.borderSoft,
        borderRadius: "20px",
        boxShadow: THEME.cardShadow,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <CardTexture />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "18px",
          display: "grid",
          gap: 10,
          justifyItems: "start",
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: THEME.blue,
            background: THEME.blueSoft,
            border: `1px solid ${THEME.blueLine}`,
          }}
        >
          <Shield size={18} />
        </div>

        <div
          style={{
            fontSize: "1.15rem",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            color: THEME.text,
          }}
        >
          No jobs yet
        </div>

        <div
          style={{
            fontSize: "0.92rem",
            lineHeight: 1.6,
            color: THEME.textMuted,
            maxWidth: 620,
          }}
        >
          Create your first intake to start tracking shop work through ShopPROOF.
        </div>

        <button type="button" style={primaryButton} onClick={onCreate}>
          New Intake
        </button>
      </div>
    </div>
  );
}

function InternalFooter({ isMobile }: { isMobile: boolean }) {
  return (
    <div
      style={{
        background: THEME.card,
        border: THEME.borderSoft,
        borderRadius: "20px",
        padding: isMobile ? "14px 12px" : "16px 18px",
        boxShadow: THEME.cardShadow,
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1.2fr) auto auto",
        gap: "14px",
        alignItems: "center",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "1rem",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            color: THEME.text,
          }}
        >
          ShopPROOF
        </div>
        <div
          style={{
            fontSize: "0.86rem",
            color: THEME.textMuted,
            marginTop: 4,
            lineHeight: 1.55,
          }}
        >
          Evidence-based repair workflow documentation for real-world shop operations.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <FooterLink href="/terms">Terms</FooterLink>
        <FooterLink href="/privacy">Privacy</FooterLink>
        <FooterLink href="/support">Support</FooterLink>
        <FooterLink href="/contact">Contact</FooterLink>
      </div>

      <div
        style={{
          fontSize: "0.8rem",
          color: THEME.textDim,
          fontWeight: 700,
          textAlign: isMobile ? "left" : "right",
        }}
      >
        © 2026 ZeroHour Systems
      </div>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: THEME.textSoft,
        fontSize: "0.84rem",
        fontWeight: 800,
      }}
    >
      {children}
    </Link>
  );
}

function CardTexture() {
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: THEME.cardTop,
          opacity: 0.95,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 1,
          borderRadius: 15,
          pointerEvents: "none",
          border: "1px solid rgba(255,255,255,0.03)",
        }}
      />
    </>
  );
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
    "0 14px 24px rgba(21,101,219,0.24), inset 0 1px 0 rgba(255,255,255,0.16)",
};