"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  AlertTriangle,
  Bell,
  Boxes,
  CarFront,
  ChevronDown,
  ChevronRight,
  Clock3,
  Package2,
  Plus,
  Shield,
  ShoppingCart,
  UserCircle2,
  Wrench,
} from "lucide-react";

type VehicleStatus =
  | "New Intake"
  | "Waiting on Approval"
  | "Approved"
  | "In Progress"
  | "Waiting on Parts"
  | "Ready for Pickup"
  | "Completed";

type ApprovalStatus = "Not Sent" | "Pending" | "Approved";
type Accent = "blue" | "orange" | "emerald";

interface VehicleCardData {
  id: string;
  year: string;
  make: string;
  model: string;
  vin: string;
  status: VehicleStatus;
  accent: Accent;
  img: string;
}

interface ApprovalCardData {
  id: string;
  vehicle: string;
  concern: string;
  estimate: string;
  status: ApprovalStatus;
  accent: Accent;
  img: string;
}

interface RepairCardData {
  id: string;
  title: string;
  vehicle: string;
  due: string;
  accent: Accent;
  img: string;
}

interface PartCardData {
  id: string;
  name: string;
  vehicle: string;
  due: string;
  img: string;
}

interface InventoryItemData {
  id: string;
  name: string;
  stock: string;
  threshold: string;
  accent: Accent;
}

interface TechCardData {
  id: string;
  name: string;
  role: string;
  vehicle: string;
  avatar: string;
}

interface AlertItem {
  id: string;
  text: string;
  tone: "warning" | "danger";
}

type VehicleRow = {
  id: string;
  shop_id: string | null;
  customer_id: string | null;
  year: string | null;
  make: string | null;
  model: string | null;
  vin: string | null;
  plate: string | null;
  created_at: string | null;
};

type JobRow = {
  id: string;
  shop_id: string | null;
  customer_id: string | null;
  vehicle_id: string | null;
  status: string | null;
  approval_status: string | null;
  assigned_to: string | null;
  notes: string | null;
  created_at: string | null;
  vehicle: VehicleRow | VehicleRow[] | null;
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
  thumb:
    "linear-gradient(180deg, rgba(34,44,56,0.46) 0%, rgba(15,21,29,0.8) 100%)",
  text: "#F5FAFF",
  textSoft: "#D7E5F0",
  textMuted: "#9CB1C1",
  textDim: "#73889A",
  line: "rgba(255,255,255,0.09)",
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
  red: "#FF6D7C",
  redSoft: "rgba(255,109,124,0.18)",
  buttonBlue:
    "linear-gradient(180deg, rgba(36,126,255,1) 0%, rgba(21,101,219,1) 100%)",
};

function getBrowserSupabaseClient(): SupabaseClient | null {
  if (typeof window === "undefined") return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  return createClient(url, anonKey);
}

export default function ShopProofDashboardPage() {
  const router = useRouter();
  const [width, setWidth] = useState(1440);

  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);

  const [parts] = useState<PartCardData[]>([]);
  const [inventory] = useState<InventoryItemData[]>([]);
  const [techs] = useState<TechCardData[]>([]);
  const [alerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onResize = () => setWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardJobs() {
      setLoadingJobs(true);
      setJobsError(null);

      const client = getBrowserSupabaseClient();

      if (!client) {
        if (!isMounted) return;
        setJobs([]);
        setJobsError("Supabase environment variables are missing.");
        setLoadingJobs(false);
        return;
      }

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
          notes,
          created_at,
          vehicle:vehicles!jobs_vehicle_id_fkey (
            id,
            shop_id,
            customer_id,
            year,
            make,
            model,
            vin,
            plate,
            created_at
          )
        `)
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        console.error("Error fetching dashboard jobs:", error);
        setJobs([]);
        setJobsError(error.message);
      } else {
        setJobs((data as JobRow[]) || []);
      }

      setLoadingJobs(false);
    }

    fetchDashboardJobs();

    return () => {
      isMounted = false;
    };
  }, []);

  const isMobile = width < 920;
  const isTablet = width >= 920 && width < 1320;

  const normalizedJobs = useMemo(() => {
    return jobs.map((job) => {
      const vehicle = Array.isArray(job.vehicle) ? job.vehicle[0] ?? null : job.vehicle;
      return {
        ...job,
        vehicle,
      };
    });
  }, [jobs]);

  const vehicles = useMemo<VehicleCardData[]>(() => {
    return normalizedJobs
      .filter((job) => {
        const status = normalizeVehicleStatus(job.status);
        return !!job.vehicle && !!status && status !== "Completed";
      })
      .map((job) => {
        const vehicle = job.vehicle as VehicleRow;
        const status = normalizeVehicleStatus(job.status) as VehicleStatus;

        return {
          id: job.id,
          year: vehicle.year || "",
          make: vehicle.make || "",
          model: vehicle.model || "",
          vin: vehicle.vin || "No VIN",
          status,
          accent: getVehicleAccent(status),
          img: getVehicleImage(status),
        };
      });
  }, [normalizedJobs]);

  const approvals = useMemo<ApprovalCardData[]>(() => {
    return normalizedJobs
      .filter((job) => {
        const approvalStatus = normalizeApprovalStatus(job.approval_status);
        return !!job.vehicle && approvalStatus === "Pending";
      })
      .map((job) => {
        const vehicle = job.vehicle as VehicleRow;
        const vehicleLabel = formatVehicleLabel(vehicle);
        const concern = extractConcern(job.notes) || "Estimate details pending";
        const approvalStatus = normalizeApprovalStatus(job.approval_status) as ApprovalStatus;

        return {
          id: job.id,
          vehicle: vehicleLabel,
          concern,
          estimate: "Pending Estimate",
          status: approvalStatus,
          accent: "orange",
          img: getApprovalImage(),
        };
      });
  }, [normalizedJobs]);

  const activeRepairs = useMemo<RepairCardData[]>(() => {
    return normalizedJobs
      .filter((job) => {
        const status = normalizeVehicleStatus(job.status);
        return (
          status === "Approved" ||
          status === "In Progress" ||
          status === "Waiting on Parts"
        );
      })
      .map((job) => {
        const vehicle = job.vehicle as VehicleRow | null;
        const status = normalizeVehicleStatus(job.status) as VehicleStatus;
        const created = formatDueText(job.created_at);

        return {
          id: job.id,
          title: status,
          vehicle: vehicle ? formatVehicleLabel(vehicle) : "Unknown Vehicle",
          due: created,
          accent: status === "Waiting on Parts" ? "orange" : "blue",
          img: getRepairImage(status),
        };
      });
  }, [normalizedJobs]);

  const intakeCount = vehicles.filter((vehicle) => vehicle.status === "New Intake").length;
  const partsCount = activeRepairs.filter(
    (repair) => repair.title === "Waiting on Parts",
  ).length;
  const pickupCount = vehicles.filter(
    (vehicle) => vehicle.status === "Ready for Pickup",
  ).length;

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
        padding: isMobile ? "12px" : "22px",
      }}
    >
      <div
        style={{
          maxWidth: 1410,
          margin: "0 auto",
          borderRadius: 24,
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
            position: "absolute",
            left: 22,
            right: 22,
            top: 64,
            height: 2,
            background:
              "linear-gradient(90deg, rgba(59,130,246,0) 0%, rgba(59,130,246,0.38) 22%, rgba(59,130,246,0.72) 50%, rgba(59,130,246,0.38) 78%, rgba(59,130,246,0) 100%)",
            boxShadow: "0 0 22px rgba(59,130,246,0.28)",
            pointerEvents: "none",
          }}
        />

        <TopBar
          isMobile={isMobile}
          intakeCount={intakeCount}
          partsCount={partsCount}
          pickupCount={pickupCount}
          onCreateJob={() => router.push("/shopproof/new")}
        />

        <div
          style={{
            padding: isMobile ? "12px" : "18px",
            display: "grid",
            gap: 14,
            position: "relative",
            zIndex: 1,
          }}
        >
          <section
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : isTablet
                  ? "1fr"
                  : "0.92fr 1.52fr 0.84fr",
              gap: 14,
              alignItems: "start",
            }}
          >
            <Panel
              title="Vehicles In Shop"
              icon={<CarFront size={15} strokeWidth={2.2} />}
              href="/shopproof/dashboard/vehicles"
            >
              {loadingJobs ? (
                <EmptyState
                  icon={<CarFront size={28} strokeWidth={2.2} color={THEME.blue} />}
                  title="Loading live shop vehicles"
                  text="Pulling active vehicle jobs from Supabase now."
                />
              ) : jobsError ? (
                <EmptyState
                  icon={<AlertTriangle size={28} strokeWidth={2.2} color={THEME.red} />}
                  title="Could not load vehicles"
                  text={`Live job data did not load. ${jobsError}`}
                  actionLabel="Open Vehicles"
                  onAction={() => router.push("/shopproof/dashboard/vehicles")}
                />
              ) : vehicles.length === 0 ? (
                <EmptyState
                  icon={<CarFront size={28} strokeWidth={2.2} color={THEME.blue} />}
                  title="No vehicles in shop yet"
                  text="Customer vehicles will appear here once records are created and moved into the shop workflow."
                  actionLabel="Start Intake"
                  onAction={() => router.push("/shopproof/new")}
                />
              ) : (
                <>
                  <div style={{ display: "grid", gap: 10 }}>
                    {vehicles.map((vehicle) => (
                      <VehicleCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        onOpen={() => router.push(`/shopproof/jobs/${vehicle.id}`)}
                      />
                    ))}
                  </div>
                  <PanelFooter onClick={() => router.push("/shopproof/dashboard/vehicles")} />
                </>
              )}
            </Panel>

            <Panel
              title="Jobs Waiting for Approval"
              icon={<Bell size={15} strokeWidth={2.2} />}
              href="/shopproof/dashboard/approvals"
            >
              {loadingJobs ? (
                <EmptyState
                  icon={<Bell size={28} strokeWidth={2.2} color={THEME.orange} />}
                  title="Loading approval queue"
                  text="Checking live jobs for pending customer approvals."
                />
              ) : jobsError ? (
                <EmptyState
                  icon={<AlertTriangle size={28} strokeWidth={2.2} color={THEME.red} />}
                  title="Could not load approvals"
                  text={`Live approval data did not load. ${jobsError}`}
                  actionLabel="Open Approvals"
                  onAction={() => router.push("/shopproof/dashboard/approvals")}
                />
              ) : approvals.length === 0 ? (
                <EmptyState
                  icon={<Bell size={28} strokeWidth={2.2} color={THEME.orange} />}
                  title="No jobs waiting for approval"
                  text="Pending approvals will show here when estimates are ready for customer review."
                  actionLabel="Open Approvals"
                  onAction={() => router.push("/shopproof/dashboard/approvals")}
                />
              ) : (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
                      gap: 10,
                    }}
                  >
                    {approvals.map((job) => (
                      <ApprovalCard
                        key={job.id}
                        job={job}
                        onOpen={() => router.push(`/shopproof/jobs/${job.id}`)}
                      />
                    ))}
                  </div>
                  <PanelFooter onClick={() => router.push("/shopproof/dashboard/approvals")} />
                </>
              )}
            </Panel>

            <Panel
              title="Active Repairs"
              icon={<Wrench size={15} strokeWidth={2.2} />}
              href="/shopproof/dashboard/repairs"
            >
              {loadingJobs ? (
                <EmptyState
                  compact
                  icon={<Wrench size={26} strokeWidth={2.2} color={THEME.blue} />}
                  title="Loading active repairs"
                  text="Pulling current repair status from live jobs."
                  actionLabel="Open Repairs"
                  onAction={() => router.push("/shopproof/dashboard/repairs")}
                />
              ) : jobsError ? (
                <EmptyState
                  compact
                  icon={<AlertTriangle size={26} strokeWidth={2.2} color={THEME.red} />}
                  title="Could not load repairs"
                  text={`Live repair data did not load. ${jobsError}`}
                  actionLabel="Open Repairs"
                  onAction={() => router.push("/shopproof/dashboard/repairs")}
                />
              ) : activeRepairs.length === 0 ? (
                <EmptyState
                  compact
                  icon={<Wrench size={26} strokeWidth={2.2} color={THEME.blue} />}
                  title="No active repairs right now"
                  text="Vehicles currently in service will appear here so the shop can monitor work in progress."
                  actionLabel="Open Repairs"
                  onAction={() => router.push("/shopproof/dashboard/repairs")}
                />
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {activeRepairs.map((repair) => (
                    <RepairCard
                      key={repair.id}
                      repair={repair}
                      onOpen={() => router.push(`/shopproof/jobs/${repair.id}`)}
                    />
                  ))}
                </div>
              )}
            </Panel>
          </section>

          <section
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : isTablet
                  ? "1fr"
                  : "0.92fr 0.92fr 1.16fr",
              gap: 14,
              alignItems: "start",
            }}
          >
            <Panel
              title="Parts"
              icon={<Package2 size={15} strokeWidth={2.2} />}
              href="/shopproof/dashboard/parts"
            >
              {parts.length === 0 ? (
                <EmptyState
                  icon={<ShoppingCart size={28} strokeWidth={2.2} color={THEME.orange} />}
                  title="No parts activity yet"
                  text="Track parts needed, ordered, received, and attached to customer jobs or quick walk-in tickets."
                  actionLabel="Open Parts Desk"
                  onAction={() => router.push("/shopproof/dashboard/parts")}
                />
              ) : (
                <>
                  <div style={{ display: "grid", gap: 10 }}>
                    {parts.map((part) => (
                      <PartsCard key={part.id} part={part} />
                    ))}
                  </div>
                  <PanelFooter onClick={() => router.push("/shopproof/dashboard/parts")} />
                </>
              )}
            </Panel>

            <Panel
              title="Inventory"
              icon={<Boxes size={15} strokeWidth={2.2} />}
              href="/shopproof/dashboard/inventory"
            >
              {inventory.length === 0 ? (
                <EmptyState
                  icon={<Boxes size={28} strokeWidth={2.2} color={THEME.emerald} />}
                  title="No inventory tracked yet"
                  text="Monitor shelf stock like oil, filters, brake cleaner, silicone, and other shop supplies separately from customer parts."
                  actionLabel="Open Inventory"
                  onAction={() => router.push("/shopproof/dashboard/inventory")}
                />
              ) : (
                <>
                  <div style={{ display: "grid", gap: 10 }}>
                    {inventory.map((item) => (
                      <InventoryRow key={item.id} item={item} />
                    ))}
                  </div>
                  <PanelFooter onClick={() => router.push("/shopproof/dashboard/inventory")} />
                </>
              )}
            </Panel>

            <Panel
              title="Technician Assignments"
              icon={<UserCircle2 size={15} strokeWidth={2.2} />}
              href="/shopproof/dashboard/team"
            >
              {techs.length === 0 ? (
                <EmptyState
                  icon={<UserCircle2 size={28} strokeWidth={2.2} color={THEME.emerald} />}
                  title="No technician assignments yet"
                  text="As jobs are assigned to your team, technician workload and repair visibility will populate here."
                  actionLabel="Open Team Board"
                  onAction={() => router.push("/shopproof/dashboard/team")}
                />
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {techs.map((tech) => (
                    <TechRow key={tech.id} tech={tech} />
                  ))}
                </div>
              )}
            </Panel>
          </section>

          <section>
            <Panel
              title="Alerts & Issues"
              icon={<AlertTriangle size={15} strokeWidth={2.2} />}
              href="/shopproof/dashboard/alerts"
            >
              {alerts.length === 0 ? (
                <EmptyState
                  compact
                  icon={<AlertTriangle size={26} strokeWidth={2.2} color={THEME.red} />}
                  title="No alerts or issues"
                  text="Warnings, urgent concerns, and high-priority items will surface here when they need attention."
                  actionLabel="Open Alerts"
                  onAction={() => router.push("/shopproof/dashboard/alerts")}
                />
              ) : (
                <div style={{ display: "grid", gap: 0 }}>
                  {alerts.map((alert, index) => (
                    <AlertRow
                      key={alert.id}
                      alert={alert}
                      isLast={index === alerts.length - 1}
                    />
                  ))}
                </div>
              )}
            </Panel>
          </section>
        </div>
      </div>
    </main>
  );
}

function TopBar({
  isMobile,
  intakeCount,
  partsCount,
  pickupCount,
  onCreateJob,
}: {
  isMobile: boolean;
  intakeCount: number;
  partsCount: number;
  pickupCount: number;
  onCreateJob: () => void;
}) {
  return (
    <div
      style={{
        minHeight: isMobile ? "auto" : 84,
        padding: isMobile ? "14px 14px 12px" : "15px 18px",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "auto 1fr auto",
        gap: isMobile ? 12 : 14,
        alignItems: "center",
        borderBottom: `1px solid ${THEME.lineFaint}`,
        position: "relative",
        background:
          "linear-gradient(180deg, rgba(10,20,31,0.86) 0%, rgba(6,13,22,0.5) 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `
            linear-gradient(180deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.008) 22%, rgba(255,255,255,0) 54%),
            radial-gradient(circle at 50% 0%, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0.04) 24%, rgba(59,130,246,0) 54%)
          `,
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          minWidth: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
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
          <Shield size={22} strokeWidth={2.1} color={THEME.blue} />
        </div>

        <div
          style={{
            fontSize: isMobile ? 22 : 28,
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            whiteSpace: "nowrap",
            textShadow: "0 2px 18px rgba(0,0,0,0.28)",
          }}
        >
          <span style={{ color: THEME.text }}>Shop</span>
          <span style={{ color: "#78ABFF" }}>PROOF</span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 10,
          minWidth: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        <TopMetric value={String(intakeCount)} label="New Intake" />
        <TopMetric value={String(partsCount)} label="Waiting on Parts" />
        <TopMetric value={String(pickupCount)} label="Ready for Pickup" />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: isMobile ? "flex-start" : "flex-end",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <button type="button" style={primaryActionButton} onClick={onCreateJob}>
          <Plus size={13} strokeWidth={2.7} />
          Intake
        </button>

        <SquareActionButton>
          <Bell size={14} strokeWidth={2.2} />
        </SquareActionButton>

        <AvatarAction />
      </div>
    </div>
  );
}

function TopMetric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div
      style={{
        height: 46,
        borderRadius: 10,
        background:
          "linear-gradient(180deg, rgba(21,31,44,0.98) 0%, rgba(13,23,35,0.98) 100%)",
        border: THEME.borderSoft,
        display: "flex",
        alignItems: "center",
        padding: "0 13px",
        gap: 8,
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 18px rgba(0,0,0,0.12)",
        minWidth: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.008) 26%, rgba(255,255,255,0) 60%)",
        }}
      />

      <span
        style={{
          fontSize: 18,
          lineHeight: 1,
          fontWeight: 900,
          letterSpacing: "-0.03em",
          whiteSpace: "nowrap",
          flexShrink: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        {value}
      </span>

      <span
        style={{
          fontSize: 11,
          color: THEME.textSoft,
          fontWeight: 800,
          lineHeight: 1.05,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          minWidth: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function Panel({
  title,
  icon,
  children,
  href,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  href?: string;
}) {
  const router = useRouter();

  return (
    <section
      onClick={() => href && router.push(href)}
      style={{
        borderRadius: 18,
        overflow: "hidden",
        background: THEME.panel,
        border: THEME.border,
        boxShadow: THEME.panelShadow,
        position: "relative",
        cursor: href ? "pointer" : "default",
        transition: "transform 160ms ease, box-shadow 160ms ease",
      }}
      onMouseEnter={(e) => {
        if (!href) return;
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 22px 48px rgba(0,0,0,0.28)";
      }}
      onMouseLeave={(e) => {
        if (!href) return;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = THEME.panelShadow;
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `${THEME.panelTop}, ${THEME.panelEdgeGlow}`,
          opacity: 0.95,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 1,
          borderRadius: 17,
          pointerEvents: "none",
          border: "1px solid rgba(255,255,255,0.035)",
        }}
      />

      <div
        style={{
          height: 50,
          padding: "0 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${THEME.lineSoft}`,
          position: "relative",
          zIndex: 1,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 60%, rgba(255,255,255,0) 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
          }}
        >
          <span
            style={{
              color: THEME.textSoft,
              display: "inline-flex",
              flexShrink: 0,
              opacity: 0.95,
            }}
          >
            {icon}
          </span>

          <h2
            style={{
              margin: 0,
              fontSize: 15,
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: THEME.text,
              whiteSpace: "nowrap",
              textShadow: "0 2px 10px rgba(0,0,0,0.22)",
            }}
          >
            {title}
          </h2>
        </div>

        {href ? (
          <MiniHeaderIcon>
            <ChevronRight size={12} strokeWidth={2.6} />
          </MiniHeaderIcon>
        ) : null}
      </div>

      <div style={{ padding: 12, position: "relative", zIndex: 1 }}>{children}</div>
    </section>
  );
}

function EmptyState({
  icon,
  title,
  text,
  actionLabel,
  compact = false,
  onAction,
}: {
  icon?: ReactNode;
  title: string;
  text: string;
  actionLabel?: string;
  compact?: boolean;
  onAction?: () => void;
}) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onAction?.();
  };

  return (
    <div
      style={{
        minHeight: compact ? 180 : 250,
        borderRadius: 14,
        border: THEME.borderSoft,
        background: THEME.card,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: compact ? 20 : 28,
        position: "relative",
        overflow: "hidden",
        boxShadow: `${THEME.cardShadow}, inset 0 1px 0 rgba(255,255,255,0.03)`,
      }}
    >
      <CardTexture />

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `
            radial-gradient(circle at 50% 0%, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0.05) 20%, rgba(59,130,246,0) 54%),
            linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 40%)
          `,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 360,
          display: "grid",
          justifyItems: "center",
        }}
      >
        {icon ? (
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
              border: THEME.borderSoft,
              background:
                "linear-gradient(180deg, rgba(20,33,47,0.98) 0%, rgba(11,20,30,0.98) 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.04), 0 12px 24px rgba(0,0,0,0.16)",
            }}
          >
            {icon}
          </div>
        ) : null}

        <div
          style={{
            fontSize: compact ? 16 : 18,
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: 8,
            letterSpacing: "-0.03em",
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 13,
            color: THEME.textMuted,
            lineHeight: 1.55,
            marginBottom: actionLabel ? 16 : 0,
            maxWidth: 320,
          }}
        >
          {text}
        </div>

        {actionLabel ? (
          <button
            type="button"
            onClick={handleClick}
            style={{
              height: 38,
              padding: "0 14px",
              borderRadius: 10,
              background:
                "linear-gradient(180deg, rgba(24,39,56,0.98) 0%, rgba(11,20,30,0.98) 100%)",
              border: THEME.borderSoft,
              color: THEME.textSoft,
              fontSize: 13,
              fontWeight: 900,
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              cursor: "pointer",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.04), 0 10px 18px rgba(0,0,0,0.14)",
            }}
          >
            {actionLabel}
            <ChevronRight size={13} strokeWidth={2.4} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function VehicleCard({
  vehicle,
  onOpen,
}: {
  vehicle: VehicleCardData;
  onOpen: () => void;
}) {
  const accent = getAccent(vehicle.accent);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      style={{
        minHeight: 108,
        display: "grid",
        gridTemplateColumns: "1fr 138px",
        gap: 10,
        padding: 8,
        borderRadius: 14,
        background: THEME.card,
        border: THEME.borderSoft,
        position: "relative",
        overflow: "hidden",
        boxShadow: `${THEME.cardShadow}, inset 0 1px 0 rgba(255,255,255,0.03)`,
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <CardTexture />
      <AccentLine color={accent.line} />

      <div
        style={{
          minWidth: 0,
          paddingLeft: 8,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              color: THEME.textMuted,
              marginBottom: 5,
              fontWeight: 700,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
            }}
          >
            Vehicle
          </div>

          <div
            style={{
              fontSize: 17,
              lineHeight: 1.03,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              marginBottom: 6,
              color: THEME.text,
            }}
          >
            {vehicle.year} {vehicle.make} {vehicle.model}
          </div>

          <div
            style={{
              fontSize: 12,
              color: THEME.textMuted,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            VIN: {vehicle.vin}
          </div>
        </div>

        <VehicleStatusBadge text={vehicle.status} accent={vehicle.accent} />
      </div>

      <ImageThumb img={vehicle.img} />
    </button>
  );
}

function ApprovalCard({
  job,
  onOpen,
}: {
  job: ApprovalCardData;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      style={{
        minHeight: 118,
        display: "grid",
        gridTemplateColumns: "1fr 124px",
        gap: 10,
        padding: 8,
        borderRadius: 14,
        background: THEME.card,
        border: THEME.borderSoft,
        overflow: "hidden",
        position: "relative",
        boxShadow: `${THEME.cardShadow}, inset 0 1px 0 rgba(255,255,255,0.03)`,
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <CardTexture />

      <div
        style={{
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 15,
              lineHeight: 1.04,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              marginBottom: 4,
              color: THEME.text,
            }}
          >
            {job.vehicle}
          </div>

          <div
            style={{
              fontSize: 13,
              color: THEME.textSoft,
              marginBottom: 7,
            }}
          >
            {job.concern}
          </div>

          <div
            style={{
              fontSize: 15,
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              marginBottom: 8,
              color: THEME.text,
            }}
          >
            Estimate: {job.estimate}
          </div>
        </div>

        <ApprovalStatusBadge text={job.status} compact />
      </div>

      <ImageThumb img={job.img} />
    </button>
  );
}

function RepairCard({
  repair,
  onOpen,
}: {
  repair: RepairCardData;
  onOpen: () => void;
}) {
  const accent = getAccent(repair.accent);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      style={{
        minHeight: 102,
        display: "grid",
        gridTemplateColumns: "1fr 108px",
        gap: 10,
        padding: 8,
        borderRadius: 14,
        background: THEME.card,
        border: THEME.borderSoft,
        position: "relative",
        overflow: "hidden",
        boxShadow: `${THEME.cardShadow}, inset 0 1px 0 rgba(255,255,255,0.03)`,
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <CardTexture />
      <AccentLine color={accent.line} />

      <div
        style={{
          minWidth: 0,
          paddingLeft: 8,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 900,
            marginBottom: 4,
            color: THEME.text,
          }}
        >
          {repair.title}
        </div>

        <div
          style={{
            fontSize: 13,
            color: THEME.textSoft,
            marginBottom: 7,
          }}
        >
          {repair.vehicle}
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: THEME.textMuted,
            fontWeight: 800,
          }}
        >
          <Clock3 size={13} strokeWidth={2.2} />
          Due: {repair.due}
        </div>
      </div>

      <ImageThumb img={repair.img} />
    </button>
  );
}

function PartsCard({ part }: { part: PartCardData }) {
  return (
    <div
      style={{
        minHeight: 92,
        display: "grid",
        gridTemplateColumns: "74px 1fr",
        gap: 10,
        padding: 8,
        borderRadius: 14,
        background: THEME.card,
        border: THEME.borderSoft,
        overflow: "hidden",
        boxShadow: `${THEME.cardShadow}, inset 0 1px 0 rgba(255,255,255,0.03)`,
        position: "relative",
      }}
    >
      <CardTexture />
      <SmallImageThumb img={part.img} />

      <div
        style={{
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 900,
            marginBottom: 3,
          }}
        >
          {part.name}
        </div>

        <div
          style={{
            fontSize: 13,
            color: THEME.textSoft,
            marginBottom: 6,
          }}
        >
          {part.vehicle}
        </div>

        <div
          style={{
            fontSize: 12,
            color: THEME.textMuted,
            fontWeight: 800,
          }}
        >
          Due: {part.due}
        </div>
      </div>
    </div>
  );
}

function InventoryRow({ item }: { item: InventoryItemData }) {
  const tone = getAccent(item.accent);

  return (
    <div
      style={{
        minHeight: 86,
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 10,
        padding: 10,
        borderRadius: 14,
        background: THEME.card,
        border: THEME.borderSoft,
        position: "relative",
        overflow: "hidden",
        boxShadow: `${THEME.cardShadow}, inset 0 1px 0 rgba(255,255,255,0.03)`,
      }}
    >
      <CardTexture />
      <AccentLine color={tone.line} />

      <div
        style={{
          minWidth: 0,
          paddingLeft: 8,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 6,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 900,
            letterSpacing: "-0.02em",
          }}
        >
          {item.name}
        </div>

        <div
          style={{
            fontSize: 12,
            color: THEME.textMuted,
            fontWeight: 800,
          }}
        >
          In Stock: {item.stock}
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            minHeight: 28,
            padding: "0 10px",
            borderRadius: 8,
            background: tone.soft,
            color: tone.color,
            border: `1px solid ${tone.border}`,
            fontSize: 12,
            fontWeight: 900,
            whiteSpace: "nowrap",
            boxShadow: `0 0 14px ${tone.glow}`,
          }}
        >
          Reorder at {item.threshold}
        </span>
      </div>
    </div>
  );
}

function TechRow({ tech }: { tech: TechCardData }) {
  return (
    <div
      style={{
        minHeight: 66,
        display: "grid",
        gridTemplateColumns: "58px 1fr 112px",
        gap: 10,
        padding: 8,
        borderRadius: 14,
        background: THEME.card,
        border: THEME.borderSoft,
        overflow: "hidden",
        alignItems: "center",
        boxShadow: `${THEME.cardShadow}, inset 0 1px 0 rgba(255,255,255,0.03)`,
        position: "relative",
      }}
    >
      <CardTexture />

      <img
        src={tech.avatar}
        alt=""
        style={{
          width: 50,
          height: 50,
          borderRadius: 999,
          objectFit: "cover",
          border: "1px solid rgba(255,255,255,0.12)",
          background: "#1B2B3B",
          position: "relative",
          zIndex: 1,
        }}
      />

      <div style={{ minWidth: 0, position: "relative", zIndex: 1 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 900,
            marginBottom: 2,
          }}
        >
          {tech.name}
        </div>
        <div
          style={{
            fontSize: 13,
            color: THEME.textSoft,
            marginBottom: 2,
          }}
        >
          {tech.role}
        </div>
        <div
          style={{
            fontSize: 12,
            color: THEME.textMuted,
            fontWeight: 800,
          }}
        >
          {tech.vehicle}
        </div>
      </div>

      <div
        style={{
          fontSize: 12,
          color: THEME.textSoft,
          lineHeight: 1.35,
          fontWeight: 800,
          position: "relative",
          zIndex: 1,
        }}
      >
        {tech.role}
        <br />
        {tech.vehicle}
      </div>
    </div>
  );
}

function AlertRow({
  alert,
  isLast,
}: {
  alert: AlertItem;
  isLast: boolean;
}) {
  const toneColor = alert.tone === "warning" ? THEME.orange : THEME.red;
  const toneSoft = alert.tone === "warning" ? THEME.orangeSoft : THEME.redSoft;

  return (
    <div
      style={{
        minHeight: 50,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 12px",
        borderBottom: isLast ? "none" : `1px solid ${THEME.lineSoft}`,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0) 100%)",
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: 999,
          background: toneSoft,
          border: `1px solid ${toneColor}66`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: `0 0 12px ${toneColor}20`,
        }}
      >
        <Bell size={9} strokeWidth={2.5} color={toneColor} />
      </span>

      <span
        style={{
          fontSize: 13,
          color: THEME.textSoft,
          fontWeight: 800,
          lineHeight: 1.35,
          minWidth: 0,
        }}
      >
        {alert.text}
      </span>

      <ChevronRight
        size={16}
        strokeWidth={2.3}
        color={THEME.textDim}
        style={{ marginLeft: "auto", flexShrink: 0 }}
      />
    </div>
  );
}

function ImageThumb({ img }: { img: string }) {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
        minHeight: 90,
        border: "1px solid rgba(255,255,255,0.09)",
        background: THEME.thumb,
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.03), 0 10px 18px rgba(0,0,0,0.18)",
      }}
    >
      <img
        src={img}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "contrast(1.06) saturate(0.92) brightness(0.92)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            linear-gradient(90deg, rgba(12,21,31,0.42) 0%, rgba(12,21,31,0.08) 42%, rgba(12,21,31,0.28) 100%),
            linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 36%)
          `,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 1,
          borderRadius: 11,
          border: "1px solid rgba(255,255,255,0.035)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

function SmallImageThumb({ img }: { img: string }) {
  return (
    <div
      style={{
        position: "relative",
        width: 70,
        minHeight: 70,
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.09)",
        background: THEME.thumb,
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.03), 0 8px 16px rgba(0,0,0,0.16)",
        zIndex: 1,
      }}
    >
      <img
        src={img}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "contrast(1.05) saturate(0.92) brightness(0.92)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(13,24,36,0.16) 38%, rgba(13,24,36,0.3) 100%)",
        }}
      />
    </div>
  );
}

function PanelFooter({ onClick }: { onClick?: () => void }) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onClick?.();
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: 12,
      }}
    >
      <button
        type="button"
        onClick={handleClick}
        style={{
          height: 34,
          minWidth: 118,
          borderRadius: 10,
          background:
            "linear-gradient(180deg, rgba(22,33,47,0.98) 0%, rgba(12,21,31,0.98) 100%)",
          border: THEME.borderSoft,
          color: THEME.textSoft,
          fontSize: 12,
          fontWeight: 800,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          cursor: "pointer",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 16px rgba(0,0,0,0.14)",
        }}
      >
        View All
        <ChevronRight size={13} strokeWidth={2.4} />
      </button>
    </div>
  );
}

function VehicleStatusBadge({
  text,
  accent,
}: {
  text: string;
  accent: Accent;
}) {
  const tone = getAccent(accent);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        alignSelf: "flex-start",
        maxWidth: "100%",
        minHeight: 28,
        padding: "0 10px",
        borderRadius: 8,
        background: tone.soft,
        color: tone.color,
        border: `1px solid ${tone.border}`,
        fontSize: 12,
        fontWeight: 900,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        lineHeight: 1,
        boxShadow: `0 0 14px ${tone.glow}`,
      }}
      title={text}
    >
      {text}
    </span>
  );
}

function ApprovalStatusBadge({
  text,
  compact = false,
}: {
  text: ApprovalStatus;
  compact?: boolean;
}) {
  const tone = getApprovalTone(text);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        alignSelf: "flex-start",
        maxWidth: "100%",
        minHeight: compact ? 24 : 28,
        padding: compact ? "0 8px" : "0 10px",
        borderRadius: 8,
        background: tone.soft,
        color: tone.color,
        border: `1px solid ${tone.border}`,
        fontSize: compact ? 11 : 12,
        fontWeight: 900,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        lineHeight: 1,
        boxShadow: `0 0 14px ${tone.glow}`,
      }}
      title={text}
    >
      {text}
    </span>
  );
}

function AccentLine({ color }: { color: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        background: color,
        boxShadow: `0 0 12px ${color}`,
      }}
    />
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
          borderRadius: 13,
          pointerEvents: "none",
          border: "1px solid rgba(255,255,255,0.03)",
        }}
      />
    </>
  );
}

function SquareActionButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={(e) => e.stopPropagation()}
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        border: THEME.borderSoft,
        background:
          "linear-gradient(180deg, rgba(18,29,41,0.98) 0%, rgba(10,18,28,0.98) 100%)",
        color: THEME.textSoft,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.04), 0 10px 18px rgba(0,0,0,0.14)",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

function MiniHeaderIcon({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        border: THEME.borderSoft,
        background:
          "linear-gradient(180deg, rgba(18,29,41,0.98) 0%, rgba(10,18,28,0.98) 100%)",
        color: THEME.textSoft,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 16px rgba(0,0,0,0.12)",
      }}
    >
      {children}
    </span>
  );
}

function AvatarAction() {
  return (
    <button
      type="button"
      onClick={(e) => e.stopPropagation()}
      style={{
        height: 40,
        padding: "0 9px 0 7px",
        borderRadius: 12,
        border: THEME.borderSoft,
        background:
          "linear-gradient(180deg, rgba(18,29,41,0.98) 0%, rgba(10,18,28,0.98) 100%)",
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        cursor: "pointer",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.04), 0 10px 18px rgba(0,0,0,0.14)",
        flexShrink: 0,
      }}
    >
      <img
        src="/images/proof-platform.png"
        alt=""
        style={{
          width: 26,
          height: 26,
          borderRadius: 999,
          objectFit: "cover",
          border: "1px solid rgba(255,255,255,0.12)",
          background: "#1B2B3B",
        }}
      />
      <ChevronDown size={13} strokeWidth={2.4} color={THEME.textSoft} />
    </button>
  );
}

function getAccent(accent: Accent) {
  if (accent === "orange") {
    return {
      color: THEME.orange,
      soft: THEME.orangeSoft,
      line: THEME.orangeLine,
      border: "rgba(245,158,66,0.34)",
      glow: "rgba(245,158,66,0.18)",
    };
  }

  if (accent === "emerald") {
    return {
      color: THEME.emerald,
      soft: THEME.emeraldSoft,
      line: THEME.emeraldLine,
      border: "rgba(39,217,191,0.34)",
      glow: "rgba(39,217,191,0.18)",
    };
  }

  return {
    color: THEME.blue,
    soft: THEME.blueSoft,
    line: THEME.blueLine,
    border: "rgba(59,130,246,0.34)",
    glow: "rgba(59,130,246,0.18)",
  };
}

function getApprovalTone(status: ApprovalStatus) {
  if (status === "Approved") {
    return {
      color: THEME.emerald,
      soft: THEME.emeraldSoft,
      border: "rgba(39,217,191,0.34)",
      glow: "rgba(39,217,191,0.18)",
    };
  }

  if (status === "Pending") {
    return {
      color: THEME.orange,
      soft: THEME.orangeSoft,
      border: "rgba(245,158,66,0.34)",
      glow: "rgba(245,158,66,0.18)",
    };
  }

  return {
    color: THEME.blue,
    soft: THEME.blueSoft,
    border: "rgba(59,130,246,0.34)",
    glow: "rgba(59,130,246,0.18)",
  };
}

function normalizeVehicleStatus(status: string | null): VehicleStatus | null {
  if (status === "New Intake") return "New Intake";
  if (status === "Waiting on Approval") return "Waiting on Approval";
  if (status === "Approved") return "Approved";
  if (status === "In Progress") return "In Progress";
  if (status === "Waiting on Parts") return "Waiting on Parts";
  if (status === "Ready for Pickup") return "Ready for Pickup";
  if (status === "Completed") return "Completed";
  return null;
}

function normalizeApprovalStatus(status: string | null): ApprovalStatus | null {
  if (status === "Not Sent") return "Not Sent";
  if (status === "Pending") return "Pending";
  if (status === "Approved") return "Approved";
  return null;
}

function formatVehicleLabel(vehicle: VehicleRow) {
  return (
    [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ").trim() ||
    "Unknown Vehicle"
  );
}

function formatDueText(createdAt: string | null) {
  if (!createdAt) return "Recently created";

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Recently created";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function extractConcern(notes: string | null) {
  if (!notes) return "";

  const concernLine = notes
    .split("\n")
    .find((line) => line.toLowerCase().startsWith("concern:"));

  return concernLine ? concernLine.replace(/^Concern:\s*/i, "").trim() : "";
}

function getVehicleAccent(status: VehicleStatus): Accent {
  if (status === "Waiting on Parts") return "orange";
  if (status === "Ready for Pickup") return "emerald";
  if (status === "New Intake" || status === "Waiting on Approval") return "blue";
  return "blue";
}

function getVehicleImage(status: VehicleStatus) {
  if (status === "Waiting on Parts") return "/images/fleetproof-inspection.png";
  if (status === "Ready for Pickup") return "/images/equipment-proof.jpg";
  return "/images/driveproof-damage.jpg";
}

function getApprovalImage() {
  return "/images/driveproof-damage.jpg";
}

function getRepairImage(status: VehicleStatus) {
  if (status === "Waiting on Parts") return "/images/equipment-proof.jpg";
  return "/images/driveproof-damage.jpg";
}

const primaryActionButton: CSSProperties = {
  height: 40,
  padding: "0 14px",
  borderRadius: 10,
  background: THEME.buttonBlue,
  border: "1px solid rgba(59,130,246,0.34)",
  color: "#F7FBFF",
  fontSize: 13,
  fontWeight: 900,
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  cursor: "pointer",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.12), 0 0 18px rgba(59,130,246,0.22), 0 10px 20px rgba(0,0,0,0.16)",
  whiteSpace: "nowrap",
  flexShrink: 0,
};