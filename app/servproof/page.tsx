"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Flag,
  MapPin,
  Package2,
  Plus,
  Settings2,
  ShieldCheck,
  Trash2,
  Wrench,
  X,
} from "lucide-react";

type AssetStatus = "working" | "issue" | "repair-scheduled" | "offline";

type Asset = {
  id: string;
  name: string;
  location?: string;
  serialNumber?: string;
  category?: string;
  modelNumber?: string;
  status?: AssetStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

type RecordEntry = {
  id: string;
  assetId: string;
  note: string;
  status: "working" | "issue";
  priority: "low" | "medium" | "high";
  createdAt: string;
  photos: string[];
  location?: string;
  reportedBy?: string;
  assignedTech?: string;
  scheduledFor?: string;
  repairStatus?: "scheduled" | "in-progress" | "completed";
};

type AddEquipmentDraft = {
  name: string;
  modelNumber: string;
  serialNumber: string;
  location: string;
  notes: string;
};

type RecordDraft = {
  assetId: string;
  note: string;
  priority: "low" | "medium" | "high";
  assignedTech: string;
  scheduledFor: string;
  repairStatus: "scheduled" | "in-progress" | "completed";
};

const USER_ROLE = "primary" as const;

const LOCATION_OPTIONS = [
  "All Locations",
  "Airline Drive",
  "Mansfield Road",
  "South Louisiana",
] as const;

const DEFAULT_ASSET_LOCATION = "Airline Drive";

const ASSET_STORAGE_KEYS = [
  "proof.assets.servproof.v1",
  "servproof.assets.v1",
  "proof.servproof.assets.v1",
  "proof.assets.v1",
] as const;

const RECORD_STORAGE_KEYS = [
  "proof.records.servproof.v1",
  "servproof.records.v1",
  "proof.servproof.records.v1",
  "proof.records.v1",
] as const;

const THEME = {
  bg: "linear-gradient(180deg, #06101A 0%, #08131E 42%, #040B12 100%)",
  glowA:
    "radial-gradient(circle at 14% 0%, rgba(39,217,191,0.16) 0%, rgba(39,217,191,0.07) 20%, rgba(39,217,191,0.02) 36%, rgba(39,217,191,0) 58%)",
  glowB:
    "radial-gradient(circle at 84% 8%, rgba(96,117,255,0.12) 0%, rgba(96,117,255,0.05) 22%, rgba(96,117,255,0.015) 36%, rgba(96,117,255,0) 58%)",
  grid:
    "repeating-linear-gradient(0deg, rgba(255,255,255,0.016) 0px, rgba(255,255,255,0.016) 1px, transparent 1px, transparent 46px)",
  shell:
    "linear-gradient(180deg, rgba(9,29,39,0.96) 0%, rgba(5,19,28,0.98) 100%)",
  panel:
    "linear-gradient(180deg, rgba(18,43,57,0.96) 0%, rgba(11,28,38,0.98) 100%)",
  inner:
    "linear-gradient(180deg, rgba(27,58,74,0.94) 0%, rgba(17,40,53,0.98) 100%)",
  darkInner:
    "linear-gradient(180deg, rgba(12,30,40,0.96) 0%, rgba(8,22,31,1) 100%)",
  card:
    "linear-gradient(180deg, rgba(23,52,67,0.94) 0%, rgba(14,34,45,0.98) 100%)",
  border: "1px solid rgba(90,226,204,0.18)",
  borderSoft: "1px solid rgba(255,255,255,0.09)",
  highlight:
    "linear-gradient(180deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0) 40%)",
  shadow: "0 16px 36px rgba(0,0,0,0.20)",
  shadowHeavy: "0 22px 54px rgba(0,0,0,0.28)",
  emerald: "#27D9BF",
  emeraldBright: "#7AF2E0",
  emeraldSoft2: "rgba(39,217,191,0.08)",
  blue: "#7D8BFF",
  danger: "#FF9AA6",
  dangerSoft: "rgba(255,154,166,0.10)",
  warning: "#FFC977",
  warningSoft: "rgba(255,201,119,0.10)",
  success: "#7AF2E0",
  successSoft: "rgba(122,242,224,0.10)",
  text: "#F5FBFF",
  textSoft: "#D6E4EC",
  textMuted: "#A7BDC9",
  textDim: "#8FA5B2",
  neutralSoft: "rgba(255,255,255,0.06)",
};

const BREAKPOINTS = {
  narrowMobile: 520,
  mobile: 768,
  desktop: 1100,
};

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeAssetStatus(status?: string): AssetStatus {
  if (
    status === "issue" ||
    status === "repair-scheduled" ||
    status === "offline"
  ) {
    return status;
  }
  return "working";
}

function readFirstAvailableArray<T>(keys: readonly string[]): T[] {
  if (typeof window === "undefined") return [];

  for (const key of keys) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as T[];
    } catch {
      // ignore bad localStorage payloads
    }
  }

  return [];
}

function writeArrayToStorage<T>(keys: readonly string[], value: T[]) {
  if (typeof window === "undefined") return;

  for (const key of keys) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore storage write errors per-key
    }
  }
}

export default function ServProofOverviewPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [records, setRecords] = useState<RecordEntry[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<string>("All Locations");
  const [viewportWidth, setViewportWidth] = useState<number>(1440);

  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const [equipmentDraft, setEquipmentDraft] = useState<AddEquipmentDraft>({
    name: "",
    modelNumber: "",
    serialNumber: "",
    location: DEFAULT_ASSET_LOCATION,
    notes: "",
  });

  const [recordDraft, setRecordDraft] = useState<RecordDraft>({
    assetId: "",
    note: "",
    priority: "medium",
    assignedTech: "",
    scheduledFor: "",
    repairStatus: "scheduled",
  });

  const [equipmentError, setEquipmentError] = useState("");
  const [recordError, setRecordError] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  function loadAll() {
    try {
      const parsedAssets = readFirstAvailableArray<Asset>(ASSET_STORAGE_KEYS);
      const parsedRecords =
        readFirstAvailableArray<RecordEntry>(RECORD_STORAGE_KEYS);

      setAssets(Array.isArray(parsedAssets) ? parsedAssets : []);
      setRecords(Array.isArray(parsedRecords) ? parsedRecords : []);
    } catch (error) {
      console.error("Failed to load ServPROOF overview data:", error);
      setAssets([]);
      setRecords([]);
    }
  }

  useEffect(() => {
    const updateWidth = () => setViewportWidth(window.innerWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    window.addEventListener("focus", loadAll);
    window.addEventListener("storage", loadAll);

    return () => {
      window.removeEventListener("resize", updateWidth);
      window.removeEventListener("focus", loadAll);
      window.removeEventListener("storage", loadAll);
    };
  }, []);

  const isNarrowMobile = viewportWidth < BREAKPOINTS.narrowMobile;
  const isMobile = viewportWidth < BREAKPOINTS.mobile;
  const isDesktop = viewportWidth >= BREAKPOINTS.desktop;

  const normalizedAssets = useMemo(
    () =>
      assets.map((asset) => ({
        ...asset,
        location: asset.location || DEFAULT_ASSET_LOCATION,
        serialNumber: asset.serialNumber || "",
        category: asset.category || "",
        modelNumber: asset.modelNumber || asset.category || "",
        status: normalizeAssetStatus(asset.status),
        notes: asset.notes || "",
      })),
    [assets]
  );

  const normalizedRecords = useMemo<RecordEntry[]>(
  () =>
    records.map((record) => {
      const normalizedPriority: "low" | "medium" | "high" =
        record.priority === "high"
          ? "high"
          : record.priority === "medium"
            ? "medium"
            : "low";

      const normalizedRepairStatus: "scheduled" | "in-progress" | "completed" =
        record.repairStatus === "in-progress"
          ? "in-progress"
          : record.repairStatus === "completed"
            ? "completed"
            : "scheduled";

      return {
        ...record,
        location: record.location || "",
        photos: Array.isArray(record.photos) ? record.photos : [],
        status:
          record.status === "issue" || record.status === "working"
            ? record.status
            : "working",
        priority: normalizedPriority,
        reportedBy:
          typeof record.reportedBy === "string" ? record.reportedBy : "",
        assignedTech:
          typeof record.assignedTech === "string" ? record.assignedTech : "",
        scheduledFor:
          typeof record.scheduledFor === "string" ? record.scheduledFor : "",
        repairStatus: normalizedRepairStatus,
      };
    }),
  [records]
);

  const locationOptions = LOCATION_OPTIONS as readonly string[];

  useEffect(() => {
    if (USER_ROLE === "primary") return;
    setSelectedLocation(DEFAULT_ASSET_LOCATION);
  }, []);

  useEffect(() => {
    if (!locationOptions.includes(selectedLocation as never)) {
      setSelectedLocation("All Locations");
    }
  }, [locationOptions, selectedLocation]);

  const filteredAssets = useMemo(
    () =>
      normalizedAssets.filter((asset) => {
        if (USER_ROLE !== "primary") {
          return asset.location === DEFAULT_ASSET_LOCATION;
        }

        if (selectedLocation === "All Locations") return true;
        return asset.location === selectedLocation;
      }),
    [normalizedAssets, selectedLocation]
  );

  const filteredAssetIds = useMemo(
    () => new Set(filteredAssets.map((asset) => asset.id)),
    [filteredAssets]
  );

  const recordsByAsset = useMemo(() => {
    const map = new Map<string, RecordEntry[]>();

    for (const record of normalizedRecords) {
      const list = map.get(record.assetId) || [];
      list.push(record);
      map.set(record.assetId, list);
    }

    for (const [, list] of map) {
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return map;
  }, [normalizedRecords]);

  const latestRecordsForLocationAssets = useMemo(() => {
    return filteredAssets
      .map((asset) => {
        const assetRecords = recordsByAsset.get(asset.id) || [];
        return assetRecords[0] || null;
      })
      .filter((record): record is RecordEntry => Boolean(record));
  }, [filteredAssets, recordsByAsset]);

  const totalAssets = filteredAssets.length;

  const totalRecords =
    selectedLocation === "All Locations"
      ? USER_ROLE === "primary"
        ? normalizedRecords.length
        : normalizedRecords.filter((record) =>
            filteredAssetIds.has(record.assetId)
          ).length
      : normalizedRecords.filter((record) => filteredAssetIds.has(record.assetId))
          .length;

  const notWorkingAssets = filteredAssets.filter((asset) => {
    const latest = (recordsByAsset.get(asset.id) || [])[0];
    if (latest) return latest.status === "issue";
    return asset.status === "issue" || asset.status === "repair-scheduled";
  }).length;

  const highPriorityIssues = latestRecordsForLocationAssets.filter(
    (record) => record.status === "issue" && record.priority === "high"
  ).length;

  const operationalAssets = Math.max(totalAssets - notWorkingAssets, 0);

  const scheduledRepairs = normalizedRecords.filter((record) => {
    const assetMatch =
      selectedLocation === "All Locations"
        ? USER_ROLE === "primary"
        : filteredAssetIds.has(record.assetId);
    return assetMatch && record.repairStatus === "scheduled";
  }).length;

  const recentRecords = useMemo(() => {
    const sourceRecords =
      selectedLocation === "All Locations"
        ? USER_ROLE === "primary"
          ? normalizedRecords
          : normalizedRecords.filter((record) =>
              filteredAssetIds.has(record.assetId)
            )
        : normalizedRecords.filter((record) =>
            filteredAssetIds.has(record.assetId)
          );

    return [...sourceRecords]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [normalizedRecords, filteredAssetIds, selectedLocation]);

  const modelSummary = useMemo(() => {
    const counts = new Map<string, number>();

    for (const asset of filteredAssets) {
      const model = asset.modelNumber?.trim() || "No Model Number";
      counts.set(model, (counts.get(model) || 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
      .slice(0, 6);
  }, [filteredAssets]);

  const needsAttention = useMemo(() => {
    return filteredAssets
      .map((asset) => {
        const latest = (recordsByAsset.get(asset.id) || [])[0] || null;

        if (latest) {
          return latest.status === "issue"
            ? {
                asset,
                record: latest,
              }
            : null;
        }

        return asset.status === "issue" || asset.status === "repair-scheduled"
          ? {
              asset,
              record: {
                id: `derived-${asset.id}`,
                assetId: asset.id,
                note:
                  asset.notes?.trim() ||
                  "Equipment flagged from operations center.",
                status: "issue",
                priority:
                  asset.status === "repair-scheduled" ? "medium" : "high",
                createdAt:
                  asset.updatedAt ||
                  asset.createdAt ||
                  new Date().toISOString(),
                photos: [],
                location: asset.location,
                reportedBy: "",
                assignedTech: "",
                scheduledFor: "",
                repairStatus:
                  asset.status === "repair-scheduled"
                    ? "scheduled"
                    : "in-progress",
              } as RecordEntry,
            }
          : null;
      })
      .filter(
        (
          item
        ): item is {
          asset: Asset & {
            location: string;
            serialNumber: string;
            category: string;
            modelNumber: string;
            status: AssetStatus;
            notes: string;
          };
          record: RecordEntry;
        } => Boolean(item)
      )
      .sort((a, b) => {
        const priorityRank = { high: 3, medium: 2, low: 1 };
        const priorityDiff =
          priorityRank[b.record.priority] - priorityRank[a.record.priority];

        if (priorityDiff !== 0) return priorityDiff;

        return (
          new Date(b.record.createdAt).getTime() -
          new Date(a.record.createdAt).getTime()
        );
      });
  }, [filteredAssets, recordsByAsset]);

  function persistAssets(nextAssets: Asset[]) {
    setAssets(nextAssets);
    writeArrayToStorage(ASSET_STORAGE_KEYS, nextAssets);
  }

  function persistRecords(nextRecords: RecordEntry[]) {
    setRecords(nextRecords);
    writeArrayToStorage(RECORD_STORAGE_KEYS, nextRecords);
  }

  function openAddEquipmentModal() {
    setEquipmentError("");
    setEquipmentDraft({
      name: "",
      modelNumber: "",
      serialNumber: "",
      location:
        selectedLocation !== "All Locations"
          ? selectedLocation
          : DEFAULT_ASSET_LOCATION,
      notes: "",
    });
    setShowAddEquipment(true);
  }

  function handleAddEquipmentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = equipmentDraft.name.trim();
    const modelNumber = equipmentDraft.modelNumber.trim();
    const serialNumber = equipmentDraft.serialNumber.trim();
    const location = equipmentDraft.location.trim();
    const notes = equipmentDraft.notes.trim();

    if (!name) {
      setEquipmentError("Equipment name is required.");
      return;
    }

    if (!modelNumber) {
      setEquipmentError("Model number is required.");
      return;
    }

    if (!location || location === "All Locations") {
      setEquipmentError("Please choose a real store/location.");
      return;
    }

    const newAsset: Asset = {
      id: createId("asset"),
      name,
      modelNumber,
      serialNumber,
      category: modelNumber,
      location,
      status: "working",
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextAssets = [newAsset, ...assets];
    persistAssets(nextAssets);
    setEquipmentError("");
    setShowAddEquipment(false);
    loadAll();
  }

  function handleDeleteAsset(assetId: string) {
    const nextAssets = assets.filter((asset) => asset.id !== assetId);
    const nextRecords = records.filter((record) => record.assetId !== assetId);

    persistAssets(nextAssets);
    persistRecords(nextRecords);
    setPendingDeleteId(null);
    loadAll();
  }

  function updateAssetStatus(assetId: string, status: AssetStatus) {
    const nextAssets = assets.map((asset) =>
      asset.id === assetId
        ? {
            ...asset,
            status,
            updatedAt: new Date().toISOString(),
          }
        : asset
    );

    persistAssets(nextAssets);
    loadAll();
  }

  function openRecordModal(assetId?: string) {
    setRecordError("");
    setRecordDraft({
      assetId: assetId || "",
      note: "",
      priority: "medium",
      assignedTech: "",
      scheduledFor: "",
      repairStatus: "scheduled",
    });
    setShowRecordModal(true);
  }

  function handleCreateRecordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const asset = normalizedAssets.find((item) => item.id === recordDraft.assetId);

    if (!asset) {
      setRecordError("Please choose the equipment for this repair record.");
      return;
    }

    if (!recordDraft.note.trim()) {
      setRecordError("Issue / repair note is required.");
      return;
    }

    const issueRecord: RecordEntry = {
      id: createId("record"),
      assetId: asset.id,
      note: recordDraft.note.trim(),
      status: "issue",
      priority: recordDraft.priority,
      createdAt: new Date().toISOString(),
      photos: [],
      location: asset.location,
      reportedBy: "Primary User",
      assignedTech: recordDraft.assignedTech.trim(),
      scheduledFor: recordDraft.scheduledFor.trim(),
      repairStatus: recordDraft.repairStatus,
    };

    const nextAssets: Asset[] = assets.map((item) =>
  item.id === asset.id
    ? {
        ...item,
        status:
          recordDraft.repairStatus === "scheduled"
            ? ("repair-scheduled" as AssetStatus)
            : ("issue" as AssetStatus),
        updatedAt: new Date().toISOString(),
      }
    : item
);

    persistAssets(nextAssets);
    setRecordError("");
    setShowRecordModal(false);
    loadAll();
  }

  function getAssetName(assetId: string) {
    const asset =
      normalizedAssets.find((item) => item.id === assetId) ||
      assets.find((item) => item.id === assetId);

    return asset?.name || "Unknown Asset";
  }

  function getAssetMeta(assetId: string) {
    const asset =
      normalizedAssets.find((item) => item.id === assetId) ||
      assets.find((item) => item.id === assetId);

    return {
      modelNumber: asset?.modelNumber?.trim() || "",
      serialNumber: asset?.serialNumber?.trim() || "",
      location: asset?.location?.trim() || "",
      status: normalizeAssetStatus(asset?.status),
    };
  }

  function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown date";
    return date.toLocaleDateString();
  }

  function getStatusLabel(status: "working" | "issue") {
    return status === "issue" ? "Not Working" : "Operational";
  }

  function getPriorityLabel(priority: "low" | "medium" | "high") {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  }

  const allowedRecordAssets = filteredAssets;

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundImage: `
          ${THEME.glowA},
          ${THEME.glowB},
          ${THEME.grid},
          ${THEME.bg}
        `,
        color: THEME.text,
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
            "radial-gradient(circle at 50% 18%, rgba(39,217,191,0.05) 0%, rgba(39,217,191,0.015) 30%, rgba(39,217,191,0) 64%)",
        }}
      />

      <div
        style={{
          position: "relative",
          maxWidth: 1260,
          margin: "0 auto",
          padding: isMobile ? "14px 12px 22px" : "18px 18px 28px",
        }}
      >
        <section
          style={{
            border: THEME.border,
            borderRadius: isMobile ? 20 : 24,
            background: THEME.shell,
            boxShadow: `0 0 0 1px rgba(255,255,255,0.04) inset, ${THEME.shadowHeavy}, 0 0 32px rgba(39,217,191,0.07)`,
            padding: isMobile ? 12 : 14,
            marginBottom: 10,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -60,
              right: -60,
              width: isMobile ? 124 : 164,
              height: isMobile ? 124 : 164,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(125,139,255,0.11) 0%, rgba(125,139,255,0.04) 42%, rgba(125,139,255,0) 72%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isDesktop
                ? "minmax(0, 1.5fr) 320px"
                : "1fr",
              gap: 10,
              alignItems: "start",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "6px 10px",
                    borderRadius: 999,
                    background:
                      "linear-gradient(180deg, rgba(39,217,191,0.16) 0%, rgba(39,217,191,0.08) 100%)",
                    border: "1px solid rgba(39,217,191,0.18)",
                  }}
                >
                  <ShieldCheck
                    size={14}
                    strokeWidth={2.2}
                    color={THEME.emeraldBright}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: THEME.emeraldBright,
                    }}
                  >
                    ServPROOF
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 7,
                    color: THEME.textDim,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  <span>Operations Center</span>
                  <span style={{ opacity: 0.45 }}>•</span>
                  <span>{selectedLocation}</span>
                  <span style={{ opacity: 0.45 }}>•</span>
                  <span>Primary Access</span>
                </div>
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: isNarrowMobile ? 26 : isMobile ? 30 : 34,
                  lineHeight: 0.98,
                  letterSpacing: "-0.045em",
                  fontWeight: 900,
                  color: THEME.text,
                }}
              >
                Equipment Operations Center
              </h1>

              <p
                style={{
                  margin: "7px 0 0",
                  maxWidth: 760,
                  fontSize: isMobile ? 13.5 : 14.5,
                  lineHeight: 1.48,
                  color: THEME.textSoft,
                }}
              >
                Add equipment, change status, schedule repairs, and manage all
                stores from one place.
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 7,
                  marginTop: 10,
                  marginBottom: 10,
                }}
              >
                <HeroChip icon={Package2} label="Equipment" />
                <HeroChip icon={AlertTriangle} label="Issues" />
                <HeroChip icon={Wrench} label="Repairs" />
                <HeroChip icon={Settings2} label="Maintenance" />
                <HeroChip icon={ClipboardList} label="Logs" />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isNarrowMobile
                    ? "1fr"
                    : "repeat(2, minmax(0, 1fr))",
                  gap: 8,
                  width: "100%",
                  maxWidth: 620,
                }}
              >
                <button
                  type="button"
                  onClick={openAddEquipmentModal}
                  style={primaryButtonStyle}
                >
                  <span
                    style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                  >
                    <Plus size={15} strokeWidth={2.6} />
                    Add Equipment
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => openRecordModal()}
                  style={secondaryButtonStyle}
                >
                  <span
                    style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                  >
                    <Wrench size={15} strokeWidth={2.6} />
                    Schedule / Log Repair
                  </span>
                </button>

                <Link href="/servproof/assets" style={linkButtonStyle(false)}>
                  Open Equipment Board
                  <ArrowRight size={15} strokeWidth={2.6} />
                </Link>

                <Link href="/servproof/records" style={linkButtonStyle(true)}>
                  View Service Records
                  <ArrowRight size={15} strokeWidth={2.6} />
                </Link>
              </div>
            </div>

            <div
              style={{
                border: "1px solid rgba(39,217,191,0.14)",
                borderRadius: 18,
                background: THEME.panel,
                padding: 12,
                boxShadow:
                  "inset 0 0 0 1px rgba(255,255,255,0.03), 0 14px 26px rgba(0,0,0,0.16)",
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
                    "radial-gradient(circle at 100% 0%, rgba(125,139,255,0.08) 0%, rgba(125,139,255,0.02) 28%, rgba(125,139,255,0) 54%)",
                }}
              />

              <div style={{ position: "relative" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.10em",
                      textTransform: "uppercase",
                      color: THEME.textMuted,
                    }}
                  >
                    Active View
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: THEME.textDim,
                    }}
                  >
                    Admin control
                  </div>
                </div>

                <div style={{ position: "relative", marginBottom: 8 }}>
                  <MapPin
                    size={13}
                    strokeWidth={2}
                    color={THEME.emeraldBright}
                    style={{
                      position: "absolute",
                      left: 11,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  />
                  <select
                    value={selectedLocation}
                    onChange={(event) => setSelectedLocation(event.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px 10px 34px",
                      borderRadius: 11,
                      background: THEME.darkInner,
                      color: THEME.text,
                      border: "1px solid rgba(39,217,191,0.14)",
                      fontSize: 13,
                      fontWeight: 800,
                      outline: "none",
                      appearance: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                    }}
                  >
                    {locationOptions.map((location) => (
                      <option
                        key={location}
                        value={location}
                        style={{
                          background: "#102A31",
                          color: "#F4FBFF",
                        }}
                      >
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 7,
                    marginBottom: 8,
                  }}
                >
                  <CompactMetric
                    label="Equipment"
                    value={totalAssets}
                    color={THEME.text}
                  />
                  <CompactMetric
                    label="Not Working"
                    value={notWorkingAssets}
                    color={THEME.danger}
                  />
                  <CompactMetric
                    label="Operational"
                    value={operationalAssets}
                    color={THEME.success}
                  />
                  <CompactMetric
                    label="Scheduled"
                    value={scheduledRepairs}
                    color={THEME.warning}
                  />
                </div>

                <div
                  style={{
                    paddingTop: 8,
                    borderTop: "1px solid rgba(255,255,255,0.07)",
                    fontSize: 11.5,
                    lineHeight: 1.45,
                    color: THEME.textSoft,
                  }}
                >
                  You are viewing primary access, so all locations can be managed
                  from here.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "repeat(2, minmax(0, 1fr))"
              : "repeat(4, minmax(0, 1fr))",
            gap: 8,
            marginBottom: 10,
          }}
        >
          <StatusCard
            label="Not Working"
            value={notWorkingAssets}
            sublabel="Needs attention"
            icon={AlertTriangle}
            tone="danger"
            compact={isMobile}
          />
          <StatusCard
            label="High Priority"
            value={highPriorityIssues}
            sublabel="Urgent issues"
            icon={Flag}
            tone="warning"
            compact={isMobile}
          />
          <StatusCard
            label="Operational"
            value={operationalAssets}
            sublabel="Working state"
            icon={CheckCircle2}
            tone="success"
            compact={isMobile}
          />
          <StatusCard
            label="Equipment"
            value={totalAssets}
            sublabel={`${totalRecords} records`}
            icon={Package2}
            tone="neutral"
            compact={isMobile}
          />
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop
              ? "minmax(0, 1.72fr) minmax(286px, 0.92fr)"
              : "1fr",
            gap: 10,
            alignItems: "start",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: 10,
              order: 1,
            }}
          >
            <PrimaryPanel title="Needs Attention" icon={AlertTriangle}>
              <p
                style={{
                  margin: "0 0 10px 0",
                  color: THEME.textSoft,
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                Current issues for {selectedLocation}, ranked by urgency and
                latest activity.
              </p>

              {needsAttention.length === 0 ? (
                <EmptyState message="No active issue records for this location." />
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {needsAttention.map(({ asset, record }) => (
                    <AttentionCard
                      key={`${asset.id}-${record.id}`}
                      asset={asset}
                      record={record}
                      formatDate={formatDate}
                      getPriorityLabel={getPriorityLabel}
                      getStatusLabel={getStatusLabel}
                      onSetWorking={() => updateAssetStatus(asset.id, "working")}
                      onSetIssue={() => updateAssetStatus(asset.id, "issue")}
                      onScheduleRepair={() => {
                        setRecordError("");
                        setRecordDraft({
                          assetId: asset.id,
                          note: asset.notes || record.note || "",
                          priority: record.priority,
                          assignedTech: record.assignedTech || "",
                          scheduledFor: record.scheduledFor || "",
                          repairStatus: "scheduled",
                        });
                        setShowRecordModal(true);
                      }}
                      onDelete={() => setPendingDeleteId(asset.id)}
                    />
                  ))}
                </div>
              )}
            </PrimaryPanel>

            <Panel title="Equipment Control" icon={Package2}>
              <p
                style={{
                  margin: "0 0 10px 0",
                  color: THEME.textSoft,
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                Quick equipment actions for the active location view.
              </p>

              {filteredAssets.length === 0 ? (
                <EmptyState message="No equipment loaded for this location." />
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {filteredAssets.slice(0, 8).map((asset) => (
                    <EquipmentRow
                      key={asset.id}
                      asset={asset}
                      onSetWorking={() => updateAssetStatus(asset.id, "working")}
                      onSetIssue={() => updateAssetStatus(asset.id, "issue")}
                      onSetScheduled={() =>
                        updateAssetStatus(asset.id, "repair-scheduled")
                      }
                      onDelete={() => setPendingDeleteId(asset.id)}
                      onOpenRecord={() => openRecordModal(asset.id)}
                    />
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Recent Activity" icon={ClipboardList}>
              <p
                style={{
                  margin: "0 0 10px 0",
                  color: THEME.textSoft,
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                Latest records tied to assets in {selectedLocation}.
              </p>

              {recentRecords.length === 0 ? (
                <EmptyState message="No records yet for this location." />
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {recentRecords.map((record) => {
                    const assetMeta = getAssetMeta(record.assetId);

                    return (
                      <ActivityCard key={record.id}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 10,
                            alignItems: "flex-start",
                            marginBottom: 6,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 800,
                              color: THEME.text,
                            }}
                          >
                            {getAssetName(record.assetId)}
                          </div>

                          <div
                            style={{
                              fontSize: 11,
                              color: THEME.textMuted,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatDate(record.createdAt)}
                          </div>
                        </div>

                        <div
                          style={{
                            fontSize: 11,
                            color: THEME.textMuted,
                            marginBottom: 6,
                          }}
                        >
                          {assetMeta.modelNumber || "No Model Number"}
                          {assetMeta.serialNumber
                            ? ` • Serial ${assetMeta.serialNumber}`
                            : ""}
                          {assetMeta.location ? ` • ${assetMeta.location}` : ""}
                        </div>

                        <div
                          style={{
                            fontSize: 13,
                            lineHeight: 1.48,
                            color: THEME.text,
                            marginBottom: 8,
                          }}
                        >
                          {record.note?.trim() || "No note provided."}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 6,
                          }}
                        >
                          <Pill
                            text={getStatusLabel(record.status)}
                            background={
                              record.status === "issue"
                                ? THEME.dangerSoft
                                : THEME.successSoft
                            }
                            color={
                              record.status === "issue"
                                ? THEME.danger
                                : THEME.success
                            }
                            border={
                              record.status === "issue"
                                ? "1px solid rgba(255,154,166,0.18)"
                                : "1px solid rgba(122,242,224,0.18)"
                            }
                          />
                          <Pill
                            text={`Priority: ${getPriorityLabel(record.priority)}`}
                            background={THEME.neutralSoft}
                            color={THEME.text}
                            border={THEME.borderSoft}
                          />
                          <Pill
                            text={`${record.photos.length} photo${
                              record.photos.length === 1 ? "" : "s"
                            }`}
                            background={THEME.neutralSoft}
                            color={THEME.text}
                            border={THEME.borderSoft}
                          />
                          {record.scheduledFor ? (
                            <Pill
                              text={`Scheduled: ${record.scheduledFor}`}
                              background={THEME.warningSoft}
                              color={THEME.warning}
                              border="1px solid rgba(255,201,119,0.18)"
                            />
                          ) : null}
                        </div>

                        {(record.reportedBy?.trim() ||
                          record.assignedTech?.trim()) && (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 12,
                              fontSize: 11,
                              color: THEME.textMuted,
                              marginTop: 8,
                            }}
                          >
                            {record.reportedBy?.trim() && (
                              <span>Reported by {record.reportedBy.trim()}</span>
                            )}
                            {record.assignedTech?.trim() && (
                              <span>
                                Assigned tech: {record.assignedTech.trim()}
                              </span>
                            )}
                          </div>
                        )}
                      </ActivityCard>
                    );
                  })}
                </div>
              )}
            </Panel>
          </div>

          <div
            style={{
              display: "grid",
              gap: 10,
              order: isDesktop ? 2 : 3,
            }}
          >
            <Panel title="Quick Actions" icon={ShieldCheck}>
              <p
                style={{
                  margin: "0 0 10px 0",
                  color: THEME.textSoft,
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                Move directly into the working parts of the system.
              </p>

              <div style={{ display: "grid", gap: 8 }}>
                <ActionButton
                  label="Add Equipment"
                  primary={false}
                  onClick={openAddEquipmentModal}
                />
                <ActionButton
                  label="Schedule / Log Repair"
                  primary={true}
                  onClick={() => openRecordModal()}
                />
                <ActionLink
                  href="/servproof/assets"
                  label="View Equipment Board"
                  primary={false}
                />
                <ActionLink
                  href="/servproof/records"
                  label="View Service Records"
                  primary={false}
                />
              </div>
            </Panel>

            <Panel title="Operational Snapshot" icon={Activity}>
              <p
                style={{
                  margin: "0 0 10px 0",
                  color: THEME.textSoft,
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                Current operating state for {selectedLocation}.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 7,
                  marginBottom: 10,
                }}
              >
                <MiniMetric
                  label="Operational"
                  value={operationalAssets}
                  tone="success"
                  icon={CheckCircle2}
                />
                <MiniMetric
                  label="Attention"
                  value={notWorkingAssets}
                  tone="danger"
                  icon={AlertTriangle}
                />
                <MiniMetric
                  label="Recent"
                  value={recentRecords.length}
                  tone="neutral"
                  icon={ClipboardList}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                }}
              >
                {modelSummary.length === 0 ? (
                  <span
                    style={{
                      fontSize: 12,
                      color: THEME.textMuted,
                    }}
                  >
                    No equipment model numbers yet for this location.
                  </span>
                ) : (
                  modelSummary.map((item) => (
                    <Pill
                      key={item.label}
                      text={`${item.label}: ${item.value}`}
                      background={THEME.emeraldSoft2}
                      color={THEME.text}
                      border={THEME.borderSoft}
                    />
                  ))
                )}
              </div>
            </Panel>

            <Panel title="Overview" icon={Package2}>
              <p
                style={{
                  margin: "0 0 10px 0",
                  color: THEME.textSoft,
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                High-level operating totals for the active location.
              </p>

              <div style={{ display: "grid", gap: 8 }}>
                <OverviewRow
                  label="Equipment tracked"
                  value={String(totalAssets)}
                />
                <OverviewRow
                  label="Records stored"
                  value={String(totalRecords)}
                />
                <OverviewRow
                  label="Assets needing attention"
                  value={String(notWorkingAssets)}
                  tone="danger"
                />
                <OverviewRow
                  label="High-priority issues"
                  value={String(highPriorityIssues)}
                  tone="warning"
                />
                <OverviewRow
                  label="Scheduled repairs"
                  value={String(scheduledRepairs)}
                  tone="warning"
                />
              </div>
            </Panel>
          </div>
        </section>
      </div>

      {showAddEquipment ? (
        <ModalShell
          title="Add Equipment"
          subtitle="Create equipment and assign it to a store from the operations center."
          onClose={() => setShowAddEquipment(false)}
          isMobile={isMobile}
        >
          <form onSubmit={handleAddEquipmentSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(2,minmax(0,1fr))",
                gap: 10,
              }}
            >
              <Field
                label="Equipment Name"
                value={equipmentDraft.name}
                onChange={(value) =>
                  setEquipmentDraft((prev) => ({ ...prev, name: value }))
                }
                placeholder="Fryer 2"
              />
              <Field
                label="Model Number"
                value={equipmentDraft.modelNumber}
                onChange={(value) =>
                  setEquipmentDraft((prev) => ({ ...prev, modelNumber: value }))
                }
                placeholder="Henny Penny OFE-321"
              />
              <Field
                label="Serial Number"
                value={equipmentDraft.serialNumber}
                onChange={(value) =>
                  setEquipmentDraft((prev) => ({ ...prev, serialNumber: value }))
                }
                placeholder="Optional"
              />
              <SelectField
                label="Store / Location"
                value={equipmentDraft.location}
                onChange={(value) =>
                  setEquipmentDraft((prev) => ({ ...prev, location: value }))
                }
                options={LOCATION_OPTIONS.filter((item) => item !== "All Locations")}
              />
              <TextAreaField
                label="Notes"
                value={equipmentDraft.notes}
                onChange={(value) =>
                  setEquipmentDraft((prev) => ({ ...prev, notes: value }))
                }
                placeholder="Optional install or condition notes"
                full
              />
            </div>

            {equipmentError ? (
              <div
                style={{
                  marginTop: 12,
                  borderRadius: 12,
                  border: "1px solid rgba(255,154,166,0.18)",
                  background: THEME.dangerSoft,
                  color: THEME.danger,
                  padding: "10px 12px",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {equipmentError}
              </div>
            ) : null}

            <ModalActions
              onCancel={() => setShowAddEquipment(false)}
              confirmLabel="Add Equipment"
            />
          </form>
        </ModalShell>
      ) : null}

      {showRecordModal ? (
        <ModalShell
          title="Schedule / Log Repair"
          subtitle="Create an issue record from the operations center and tie it to a specific asset."
          onClose={() => setShowRecordModal(false)}
          isMobile={isMobile}
        >
          <form onSubmit={handleCreateRecordSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(2,minmax(0,1fr))",
                gap: 10,
              }}
            >
              <SelectField
                label="Equipment"
                value={recordDraft.assetId}
                onChange={(value) =>
                  setRecordDraft((prev) => ({ ...prev, assetId: value }))
                }
                options={allowedRecordAssets.map((asset) => ({
                  value: asset.id,
                  label: `${asset.name} • ${asset.location}`,
                }))}
              />
              <SelectField
                label="Priority"
                value={recordDraft.priority}
                onChange={(value) =>
                  setRecordDraft((prev) => ({
                    ...prev,
                    priority: value as "low" | "medium" | "high",
                  }))
                }
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                ]}
              />
              <Field
                label="Assigned Tech"
                value={recordDraft.assignedTech}
                onChange={(value) =>
                  setRecordDraft((prev) => ({ ...prev, assignedTech: value }))
                }
                placeholder="Optional"
              />
              <Field
                label="Scheduled For"
                value={recordDraft.scheduledFor}
                onChange={(value) =>
                  setRecordDraft((prev) => ({ ...prev, scheduledFor: value }))
                }
                placeholder="2026-03-23 2:00 PM"
              />
              <SelectField
                label="Repair Status"
                value={recordDraft.repairStatus}
                onChange={(value) =>
                  setRecordDraft((prev) => ({
                    ...prev,
                    repairStatus: value as "scheduled" | "in-progress" | "completed",
                  }))
                }
                options={[
                  { value: "scheduled", label: "Scheduled" },
                  { value: "in-progress", label: "In Progress" },
                  { value: "completed", label: "Completed" },
                ]}
                full
              />
              <TextAreaField
                label="Issue / Repair Note"
                value={recordDraft.note}
                onChange={(value) =>
                  setRecordDraft((prev) => ({ ...prev, note: value }))
                }
                placeholder="Describe the issue, scheduled repair, or maintenance need"
                full
              />
            </div>

            {recordError ? (
              <div
                style={{
                  marginTop: 12,
                  borderRadius: 12,
                  border: "1px solid rgba(255,154,166,0.18)",
                  background: THEME.dangerSoft,
                  color: THEME.danger,
                  padding: "10px 12px",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {recordError}
              </div>
            ) : null}

            <ModalActions
              onCancel={() => setShowRecordModal(false)}
              confirmLabel="Create Record"
            />
          </form>
        </ModalShell>
      ) : null}

      {pendingDeleteId ? (
        <ModalShell
          title="Delete Equipment"
          subtitle="This will remove the equipment and any linked records."
          onClose={() => setPendingDeleteId(null)}
          isMobile={isMobile}
        >
          <div
            style={{
              color: THEME.textSoft,
              fontSize: 14,
              lineHeight: 1.55,
            }}
          >
            Are you sure you want to permanently delete this equipment entry?
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 14,
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => setPendingDeleteId(null)}
              style={secondaryButtonStyle}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleDeleteAsset(pendingDeleteId)}
              style={dangerButtonStyle}
            >
              Delete Equipment
            </button>
          </div>
        </ModalShell>
      ) : null}
    </main>
  );
}

function HeroChip({
  icon: Icon,
  label,
}: {
  icon: ComponentType<{
    size?: number;
    strokeWidth?: number;
    color?: string;
  }>;
  label: string;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
      }}
    >
      <Icon size={13} strokeWidth={2.1} color={THEME.emeraldBright} />
      <span
        style={{
          color: THEME.textSoft,
          fontWeight: 700,
          fontSize: 12,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function CompactMetric({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      style={{
        borderRadius: 12,
        padding: "9px 9px 8px",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: THEME.textMuted,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 19,
          lineHeight: 1,
          fontWeight: 900,
          color,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ComponentType<{
    size?: number;
    strokeWidth?: number;
    color?: string;
  }>;
  children: ReactNode;
}) {
  return (
    <section
      style={{
        border: THEME.border,
        borderRadius: 18,
        background: THEME.panel,
        boxShadow: `${THEME.shadow}, 0 0 20px rgba(39,217,191,0.035)`,
        padding: 13,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: THEME.highlight,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 2,
          background: "rgba(39,217,191,0.56)",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 5,
          position: "relative",
        }}
      >
        <Icon size={16} strokeWidth={2.2} color={THEME.emeraldBright} />
        <h2
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 900,
            color: THEME.text,
          }}
        >
          {title}
        </h2>
      </div>
      <div style={{ position: "relative" }}>{children}</div>
    </section>
  );
}

function PrimaryPanel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ComponentType<{
    size?: number;
    strokeWidth?: number;
    color?: string;
  }>;
  children: ReactNode;
}) {
  return (
    <section
      style={{
        border: "1px solid rgba(39,217,191,0.16)",
        borderRadius: 20,
        background:
          "linear-gradient(180deg, rgba(18,44,58,0.98) 0%, rgba(11,28,38,1) 100%)",
        boxShadow:
          "0 20px 42px rgba(0,0,0,0.24), 0 0 24px rgba(125,139,255,0.04)",
        padding: 14,
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
            "radial-gradient(circle at 100% 0%, rgba(125,139,255,0.10) 0%, rgba(125,139,255,0.03) 42%, rgba(125,139,255,0) 72%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: "rgba(39,217,191,0.70)",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 5,
          position: "relative",
        }}
      >
        <Icon size={16} strokeWidth={2.2} color={THEME.blue} />
        <h2
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 900,
            color: THEME.text,
          }}
        >
          {title}
        </h2>
      </div>
      <div style={{ position: "relative" }}>{children}</div>
    </section>
  );
}

function StatusCard({
  label,
  value,
  sublabel,
  icon: Icon,
  tone,
  compact = false,
}: {
  label: string;
  value: number;
  sublabel: string;
  icon: ComponentType<{
    size?: number;
    strokeWidth?: number;
    color?: string;
  }>;
  tone: "danger" | "warning" | "success" | "neutral";
  compact?: boolean;
}) {
  const accent =
    tone === "danger"
      ? THEME.danger
      : tone === "warning"
        ? THEME.warning
        : tone === "success"
          ? THEME.success
          : THEME.text;

  const soft =
    tone === "danger"
      ? THEME.dangerSoft
      : tone === "warning"
        ? THEME.warningSoft
        : tone === "success"
          ? THEME.successSoft
          : THEME.neutralSoft;

  const edge =
    tone === "danger"
      ? "rgba(255,154,166,0.56)"
      : tone === "warning"
        ? "rgba(255,201,119,0.54)"
        : tone === "success"
          ? "rgba(39,217,191,0.62)"
          : "rgba(39,217,191,0.42)";

  return (
    <div
      style={{
        border: THEME.borderSoft,
        borderRadius: 16,
        padding: compact ? "10px 10px" : "12px 12px",
        background: THEME.card,
        boxShadow: `${THEME.shadow}, 0 0 18px rgba(39,217,191,0.03)`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
        position: "relative",
        overflow: "hidden",
        minHeight: compact ? 82 : 94,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: edge,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: THEME.highlight,
        }}
      />
      <div style={{ position: "relative", minWidth: 0 }}>
        <div
          style={{
            fontSize: 10,
            color: THEME.textMuted,
            marginBottom: 6,
            fontWeight: 800,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: compact ? 29 : 32,
            lineHeight: 0.94,
            fontWeight: 900,
            color: accent,
            marginBottom: 3,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: 11,
            color: THEME.textSoft,
            lineHeight: 1.3,
          }}
        >
          {sublabel}
        </div>
      </div>

      <div
        style={{
          width: compact ? 38 : 42,
          height: compact ? 38 : 42,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: soft,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <Icon size={compact ? 16 : 17} strokeWidth={2.1} color={accent} />
      </div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: "success" | "danger" | "neutral";
  icon: ComponentType<{
    size?: number;
    strokeWidth?: number;
    color?: string;
  }>;
}) {
  const color =
    tone === "success"
      ? THEME.success
      : tone === "danger"
        ? THEME.danger
        : THEME.text;

  const background =
    tone === "success"
      ? "linear-gradient(180deg, rgba(122,242,224,0.10) 0%, rgba(122,242,224,0.04) 100%)"
      : tone === "danger"
        ? "linear-gradient(180deg, rgba(255,154,166,0.10) 0%, rgba(255,154,166,0.04) 100%)"
        : "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)";

  const border =
    tone === "success"
      ? "1px solid rgba(122,242,224,0.14)"
      : tone === "danger"
        ? "1px solid rgba(255,154,166,0.14)"
        : "1px solid rgba(255,255,255,0.08)";

  return (
    <div
      style={{
        borderRadius: 12,
        border,
        background,
        padding: "9px 9px 8px",
      }}
    >
      <div
        style={{
          fontSize: 9.5,
          fontWeight: 700,
          color: THEME.textSoft,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 7,
        }}
      >
        <div
          style={{
            fontSize: 21,
            lineHeight: 0.95,
            fontWeight: 900,
            color,
          }}
        >
          {value}
        </div>
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border,
          }}
        >
          <Icon size={11} strokeWidth={2.2} color={color} />
        </div>
      </div>
    </div>
  );
}

function ActionLink({
  href,
  label,
  primary,
}: {
  href: string;
  label: string;
  primary: boolean;
}) {
  return (
    <Link href={href} style={linkButtonStyle(primary)}>
      <span>{label}</span>
      <ArrowRight size={15} strokeWidth={2.5} />
    </Link>
  );
}

function ActionButton({
  label,
  primary,
  onClick,
}: {
  label: string;
  primary: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={primary ? primaryButtonStyle : secondaryButtonStyle}
    >
      <span>{label}</span>
      <ArrowRight size={15} strokeWidth={2.5} />
    </button>
  );
}

function Pill({
  text,
  background,
  color,
  border,
}: {
  text: string;
  background: string;
  color: string;
  border: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 9px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 800,
        background,
        color,
        border,
      }}
    >
      {text}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        borderRadius: 14,
        padding: 12,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.012) 100%)",
        border: "1px dashed rgba(255,255,255,0.08)",
        color: THEME.textSoft,
        fontSize: 12,
      }}
    >
      {message}
    </div>
  );
}

function OverviewRow({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "danger" | "warning";
}) {
  const color =
    tone === "danger"
      ? THEME.danger
      : tone === "warning"
        ? THEME.warning
        : THEME.text;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        borderRadius: 12,
        padding: "10px 11px",
        background: THEME.inner,
        border: THEME.borderSoft,
        boxShadow: "0 6px 14px rgba(0,0,0,0.09)",
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: THEME.textSoft,
          fontWeight: 700,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 14,
          color,
          fontWeight: 900,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ActivityCard({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        border: THEME.borderSoft,
        borderRadius: 14,
        padding: 12,
        background: THEME.inner,
        boxShadow: "0 12px 22px rgba(0,0,0,0.12)",
      }}
    >
      {children}
    </div>
  );
}

function AttentionCard({
  asset,
  record,
  formatDate,
  getPriorityLabel,
  getStatusLabel,
  onSetWorking,
  onSetIssue,
  onScheduleRepair,
  onDelete,
}: {
  asset: Asset & {
    location?: string;
    serialNumber?: string;
    category?: string;
    modelNumber?: string;
  };
  record: RecordEntry;
  formatDate: (value: string) => string;
  getPriorityLabel: (value: "low" | "medium" | "high") => string;
  getStatusLabel: (value: "working" | "issue") => string;
  onSetWorking: () => void;
  onSetIssue: () => void;
  onScheduleRepair: () => void;
  onDelete: () => void;
}) {
  const isHigh = record.priority === "high";

  return (
    <div
      style={{
        border: THEME.borderSoft,
        borderLeft: isHigh
          ? "3px solid rgba(255,201,119,0.72)"
          : "3px solid rgba(39,217,191,0.70)",
        borderRadius: 16,
        padding: 12,
        background:
          "linear-gradient(180deg, rgba(20,47,61,0.95) 0%, rgba(11,28,38,1) 100%)",
        boxShadow: "0 14px 24px rgba(0,0,0,0.16)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: isHigh
            ? "radial-gradient(circle at 0% 0%, rgba(255,201,119,0.09) 0%, rgba(255,201,119,0.02) 28%, rgba(255,201,119,0) 54%)"
            : "radial-gradient(circle at 0% 0%, rgba(39,217,191,0.10) 0%, rgba(39,217,191,0.02) 28%, rgba(39,217,191,0) 54%)",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          alignItems: "flex-start",
          marginBottom: 6,
          position: "relative",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 900,
              color: THEME.text,
              marginBottom: 3,
            }}
          >
            {asset.name}
          </div>

          <div
            style={{
              fontSize: 11,
              color: THEME.textMuted,
            }}
          >
            {asset.modelNumber?.trim() || "No Model Number"}
            {asset.serialNumber?.trim()
              ? ` • Serial ${asset.serialNumber.trim()}`
              : ""}
            {asset.location?.trim() ? ` • ${asset.location.trim()}` : ""}
          </div>
        </div>

        <div
          style={{
            fontSize: 11,
            color: THEME.textMuted,
            whiteSpace: "nowrap",
          }}
        >
          {formatDate(record.createdAt)}
        </div>
      </div>

      <div
        style={{
          fontSize: 13,
          lineHeight: 1.48,
          color: THEME.text,
          marginBottom: 8,
          position: "relative",
        }}
      >
        {record.note?.trim() || "No note provided."}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          position: "relative",
          marginBottom: 10,
        }}
      >
        <Pill
          text={getStatusLabel(record.status)}
          background={THEME.dangerSoft}
          color={THEME.danger}
          border="1px solid rgba(255,154,166,0.18)"
        />
        <Pill
          text={`Priority: ${getPriorityLabel(record.priority)}`}
          background={isHigh ? THEME.warningSoft : THEME.emeraldSoft2}
          color={isHigh ? THEME.warning : THEME.text}
          border={
            isHigh
              ? "1px solid rgba(255,201,119,0.18)"
              : THEME.borderSoft
          }
        />
        <Pill
          text={`${record.photos.length} photo${
            record.photos.length === 1 ? "" : "s"
          }`}
          background={THEME.neutralSoft}
          color={THEME.text}
          border={THEME.borderSoft}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          position: "relative",
        }}
      >
        <button type="button" onClick={onSetWorking} style={tinySuccessButton}>
          Mark Working
        </button>
        <button type="button" onClick={onSetIssue} style={tinyWarningButton}>
          Keep Issue
        </button>
        <button type="button" onClick={onScheduleRepair} style={tinyNeutralButton}>
          Schedule Repair
        </button>
        <button type="button" onClick={onDelete} style={tinyDangerButton}>
          <Trash2 size={13} strokeWidth={2.1} />
          Delete
        </button>
      </div>

      {(record.reportedBy?.trim() || record.assignedTech?.trim()) && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            fontSize: 11,
            color: THEME.textMuted,
            marginTop: 8,
            position: "relative",
          }}
        >
          {record.reportedBy?.trim() && (
            <span>Reported by {record.reportedBy.trim()}</span>
          )}
          {record.assignedTech?.trim() && (
            <span>Assigned tech: {record.assignedTech.trim()}</span>
          )}
        </div>
      )}
    </div>
  );
}

function EquipmentRow({
  asset,
  onSetWorking,
  onSetIssue,
  onSetScheduled,
  onDelete,
  onOpenRecord,
}: {
  asset: Asset;
  onSetWorking: () => void;
  onSetIssue: () => void;
  onSetScheduled: () => void;
  onDelete: () => void;
  onOpenRecord: () => void;
}) {
  return (
    <div
      style={{
        border: THEME.borderSoft,
        borderRadius: 14,
        padding: 12,
        background: THEME.inner,
        boxShadow: "0 12px 22px rgba(0,0,0,0.12)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 8,
          alignItems: "flex-start",
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 900, color: THEME.text }}>
            {asset.name}
          </div>
          <div
            style={{
              fontSize: 11,
              color: THEME.textMuted,
              marginTop: 3,
            }}
          >
            {asset.modelNumber?.trim() || "No Model Number"}
            {asset.serialNumber?.trim()
              ? ` • Serial ${asset.serialNumber.trim()}`
              : ""}
            {asset.location?.trim() ? ` • ${asset.location.trim()}` : ""}
          </div>
        </div>

        <Pill
          text={
            asset.status === "working"
              ? "Working"
              : asset.status === "repair-scheduled"
                ? "Repair Scheduled"
                : asset.status === "offline"
                  ? "Offline"
                  : "Issue"
          }
          background={
            asset.status === "working"
              ? THEME.successSoft
              : asset.status === "repair-scheduled"
                ? THEME.warningSoft
                : THEME.dangerSoft
          }
          color={
            asset.status === "working"
              ? THEME.success
              : asset.status === "repair-scheduled"
                ? THEME.warning
                : THEME.danger
          }
          border={
            asset.status === "working"
              ? "1px solid rgba(122,242,224,0.18)"
              : asset.status === "repair-scheduled"
                ? "1px solid rgba(255,201,119,0.18)"
                : "1px solid rgba(255,154,166,0.18)"
          }
        />
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <button type="button" onClick={onSetWorking} style={tinySuccessButton}>
          Working
        </button>
        <button type="button" onClick={onSetIssue} style={tinyWarningButton}>
          Issue
        </button>
        <button type="button" onClick={onSetScheduled} style={tinyNeutralButton}>
          Schedule
        </button>
        <button type="button" onClick={onOpenRecord} style={tinyNeutralButton}>
          Log Repair
        </button>
        <button type="button" onClick={onDelete} style={tinyDangerButton}>
          <Trash2 size={13} strokeWidth={2.1} />
          Delete
        </button>
      </div>
    </div>
  );
}

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  isMobile,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
  isMobile: boolean;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(3, 9, 16, 0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 100,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 760,
          borderRadius: 22,
          border: THEME.border,
          background: THEME.shell,
          boxShadow: THEME.shadowHeavy,
          padding: isMobile ? 14 : 16,
          position: "relative",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            right: 12,
            top: 12,
            width: 34,
            height: 34,
            borderRadius: 10,
            border: THEME.borderSoft,
            background: THEME.inner,
            color: THEME.text,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <X size={16} strokeWidth={2.4} />
        </button>

        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: THEME.text,
              marginBottom: 6,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 13,
              lineHeight: 1.5,
              color: THEME.textSoft,
              maxWidth: 620,
            }}
          >
            {subtitle}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

function Field({
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
    <label style={{ display: "grid", gap: 6 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: THEME.textMuted,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={fieldInputStyle}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  full = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[] | { value: string; label: string }[];
  full?: boolean;
}) {
  const normalizedOptions =
    typeof options[0] === "string"
      ? (options as readonly string[]).map((item) => ({
          value: item,
          label: item,
        }))
      : (options as { value: string; label: string }[]);

  return (
    <label
      style={{
        display: "grid",
        gap: 6,
        gridColumn: full ? "1 / -1" : undefined,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: THEME.textMuted,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={fieldInputStyle}
      >
        <option value="">Select…</option>
        {normalizedOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  full = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  full?: boolean;
}) {
  return (
    <label
      style={{
        display: "grid",
        gap: 6,
        gridColumn: full ? "1 / -1" : undefined,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: THEME.textMuted,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        style={{
          ...fieldInputStyle,
          resize: "vertical",
          minHeight: 110,
        }}
      />
    </label>
  );
}

function ModalActions({
  onCancel,
  confirmLabel,
}: {
  onCancel: () => void;
  confirmLabel: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 8,
        marginTop: 14,
        flexWrap: "wrap",
      }}
    >
      <button type="button" onClick={onCancel} style={secondaryButtonStyle}>
        Cancel
      </button>
      <button type="submit" style={primaryButtonStyle}>
        {confirmLabel}
      </button>
    </div>
  );
}

const fieldInputStyle: CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 12,
  background: THEME.darkInner,
  color: THEME.text,
  border: "1px solid rgba(39,217,191,0.14)",
  fontSize: 14,
  fontWeight: 700,
  outline: "none",
};

const primaryButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "11px 14px",
  borderRadius: 12,
  background:
    "linear-gradient(180deg, rgba(39,217,191,1) 0%, rgba(29,197,171,0.98) 100%)",
  color: "#041116",
  textDecoration: "none",
  fontWeight: 900,
  fontSize: 14,
  border: "1px solid rgba(39,217,191,0.34)",
  boxShadow:
    "0 0 0 1px rgba(255,255,255,0.06) inset, 0 0 16px rgba(39,217,191,0.12), 0 12px 18px rgba(0,0,0,0.16)",
  whiteSpace: "nowrap",
  cursor: "pointer",
};

const secondaryButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "11px 14px",
  borderRadius: 12,
  background: THEME.inner,
  color: THEME.text,
  textDecoration: "none",
  fontWeight: 800,
  fontSize: 14,
  border: THEME.borderSoft,
  boxShadow: "0 8px 16px rgba(0,0,0,0.12)",
  whiteSpace: "nowrap",
  cursor: "pointer",
};

const dangerButtonStyle: CSSProperties = {
  ...primaryButtonStyle,
  background:
    "linear-gradient(180deg, rgba(255,154,166,0.95) 0%, rgba(240,110,130,0.98) 100%)",
  border: "1px solid rgba(255,154,166,0.34)",
  color: "#19070B",
};

function linkButtonStyle(primary: boolean): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "11px 14px",
    borderRadius: 12,
    background: primary
      ? "linear-gradient(180deg, rgba(39,217,191,1) 0%, rgba(29,197,171,0.98) 100%)"
      : THEME.inner,
    color: primary ? "#041116" : THEME.text,
    textDecoration: "none",
    fontWeight: primary ? 900 : 800,
    fontSize: 14,
    border: primary ? "1px solid rgba(39,217,191,0.34)" : THEME.borderSoft,
    boxShadow: primary
      ? "0 0 0 1px rgba(255,255,255,0.06) inset, 0 0 16px rgba(39,217,191,0.12), 0 12px 18px rgba(0,0,0,0.16)"
      : "0 8px 16px rgba(0,0,0,0.12)",
    whiteSpace: "nowrap",
  };
}

const tinySuccessButton: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "7px 10px",
  borderRadius: 10,
  border: "1px solid rgba(122,242,224,0.18)",
  background: THEME.successSoft,
  color: THEME.success,
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
};

const tinyWarningButton: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "7px 10px",
  borderRadius: 10,
  border: "1px solid rgba(255,201,119,0.18)",
  background: THEME.warningSoft,
  color: THEME.warning,
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
};

const tinyNeutralButton: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "7px 10px",
  borderRadius: 10,
  border: THEME.borderSoft,
  background: THEME.neutralSoft,
  color: THEME.text,
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
};

const tinyDangerButton: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "7px 10px",
  borderRadius: 10,
  border: "1px solid rgba(255,154,166,0.18)",
  background: THEME.dangerSoft,
  color: THEME.danger,
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
};