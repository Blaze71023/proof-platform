"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type AssetStatus = "operational" | "attention" | "down" | "offline" | "unknown";

type Asset = {
  id: string;
  name?: string;
  title?: string;
  label?: string;
  assetName?: string;
  equipmentName?: string;
  type?: string;
  category?: string;
  serialNumber?: string;
  location?: string;
  store?: string;
  site?: string;
  area?: string;
  notes?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ServiceRecord = {
  id: string;
  assetId?: string;
  equipmentId?: string;
  assetName?: string;
  title?: string;
  issueType?: string;
  status?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
};

const ASSET_STORAGE_KEYS = [
  "proof.assets.v1",
  "servproof.assets.v1",
  "proof.servproof.assets.v1",
];

const RECORD_STORAGE_KEYS = [
  "proof.records.v1",
  "servproof.records.v1",
  "proof.servproof.records.v1",
];

function readFirstAvailable<T>(keys: string[]): T[] {
  if (typeof window === "undefined") return [];

  for (const key of keys) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as T[];
    } catch {}
  }

  return [];
}

function writeToFirstAvailable<T>(keys: string[], value: T[]) {
  if (typeof window === "undefined") return;

  let targetKey = keys[0];

  for (const key of keys) {
    if (window.localStorage.getItem(key)) {
      targetKey = key;
      break;
    }
  }

  window.localStorage.setItem(targetKey, JSON.stringify(value));
}

function getAssetName(asset: Asset) {
  return (
    asset.name ||
    asset.assetName ||
    asset.equipmentName ||
    asset.title ||
    asset.label ||
    "Unnamed equipment"
  );
}

function getAssetLocation(asset: Asset) {
  return asset.location || asset.store || asset.site || asset.area || "Unassigned";
}

function normalizeAssetStatus(status?: string): AssetStatus {
  const value = (status || "").toLowerCase().trim();

  if (["operational", "active", "ok", "ready", "up"].includes(value)) return "operational";
  if (["attention", "warning", "issue", "needs attention"].includes(value)) return "attention";
  if (["down", "out", "out of service"].includes(value)) return "down";
  if (["offline"].includes(value)) return "offline";

  return "unknown";
}

function statusStyles(status: AssetStatus) {
  switch (status) {
    case "operational":
      return {
        color: "#24E1B4",
        border: "1px solid rgba(36,225,180,0.22)",
        background: "linear-gradient(180deg, rgba(36,225,180,0.14), rgba(36,225,180,0.06))",
      };
    case "attention":
      return {
        color: "#FACC15",
        border: "1px solid rgba(250,204,21,0.22)",
        background: "linear-gradient(180deg, rgba(250,204,21,0.14), rgba(250,204,21,0.06))",
      };
    case "down":
    case "offline":
      return {
        color: "#F87171",
        border: "1px solid rgba(248,113,113,0.22)",
        background: "linear-gradient(180deg, rgba(248,113,113,0.14), rgba(248,113,113,0.06))",
      };
    default:
      return {
        color: "#C3CEDD",
        border: "1px solid rgba(255,255,255,0.10)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))",
      };
  }
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function useViewport() {
  const [width, setWidth] = useState(1440);

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return {
    width,
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1180,
  };
}

export default function ServproofAssetsPage() {
  const { isMobile, isTablet } = useViewport();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Asset>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const load = () => {
      setAssets(readFirstAvailable<Asset>(ASSET_STORAGE_KEYS));
      setRecords(readFirstAvailable<ServiceRecord>(RECORD_STORAGE_KEYS));
      setHydrated(true);
    };

    load();
    window.addEventListener("focus", load);
    window.addEventListener("storage", load);

    return () => {
      window.removeEventListener("focus", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const locationOptions = useMemo(() => {
    const unique = new Set<string>();

    for (const asset of assets) {
      unique.add(getAssetLocation(asset));
    }

    return ["all", ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [assets]);

  const recordsByAssetId = useMemo(() => {
    const map = new Map<string, ServiceRecord[]>();

    for (const record of records) {
      const key = record.assetId || record.equipmentId;
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(record);
    }

    for (const [, list] of map) {
      list.sort((a, b) => {
        const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return bTime - aTime;
      });
    }

    return map;
  }, [records]);

  const filteredAssets = useMemo(() => {
    const term = search.trim().toLowerCase();

    return [...assets]
      .filter((asset) => {
        const location = getAssetLocation(asset);

        if (selectedLocation !== "all" && location !== selectedLocation) return false;

        if (!term) return true;

        const haystack = [
          getAssetName(asset),
          asset.type,
          asset.category,
          asset.serialNumber,
          location,
          asset.notes,
          asset.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(term);
      })
      .sort((a, b) => {
        const locationCompare = getAssetLocation(a).localeCompare(getAssetLocation(b));
        if (locationCompare !== 0) return locationCompare;
        return getAssetName(a).localeCompare(getAssetName(b));
      });
  }, [assets, search, selectedLocation]);

  const totals = useMemo(() => {
    const total = assets.length;
    const operational = assets.filter(
      (asset) => normalizeAssetStatus(asset.status) === "operational"
    ).length;
    const attention = assets.filter(
      (asset) => normalizeAssetStatus(asset.status) === "attention"
    ).length;
    const down = assets.filter((asset) => {
      const status = normalizeAssetStatus(asset.status);
      return status === "down" || status === "offline";
    }).length;

    return { total, operational, attention, down };
  }, [assets]);

  function startEdit(asset: Asset) {
    setEditingAssetId(asset.id);
    setEditDraft({
      name: getAssetName(asset),
      type: asset.type || asset.category || "",
      serialNumber: asset.serialNumber || "",
      location: getAssetLocation(asset),
      status: normalizeAssetStatus(asset.status),
      notes: asset.notes || "",
    });
  }

  function cancelEdit() {
    setEditingAssetId(null);
    setEditDraft({});
  }

  function saveEdit() {
    if (!editingAssetId) return;

    const nextAssets = assets.map((asset) => {
      if (asset.id !== editingAssetId) return asset;

      return {
        ...asset,
        name: String(editDraft.name || "").trim(),
        type: String(editDraft.type || "").trim(),
        serialNumber: String(editDraft.serialNumber || "").trim(),
        location: String(editDraft.location || "").trim(),
        status: String(editDraft.status || "unknown").trim(),
        notes: String(editDraft.notes || ""),
        updatedAt: new Date().toISOString(),
      };
    });

    setAssets(nextAssets);
    writeToFirstAvailable(ASSET_STORAGE_KEYS, nextAssets);
    cancelEdit();
  }

  const containerPadding = isMobile
    ? "14px 12px 28px"
    : isTablet
      ? "18px 16px 34px"
      : "20px 18px 40px";

  const heroPadding = isMobile
    ? "16px 14px 14px"
    : isTablet
      ? "18px 16px 16px"
      : "20px 18px 18px";

  const summaryGrid = isMobile ? "repeat(2,minmax(0,1fr))" : "repeat(4,minmax(0,1fr))";
  const utilityGrid = isMobile || isTablet ? "1fr" : "minmax(0,1fr) 220px";
  const cardGrid = isMobile
    ? "1fr"
    : isTablet
      ? "repeat(2,minmax(0,1fr))"
      : "repeat(3,minmax(0,1fr))";

  return (
    <main
      style={{
        minHeight: "100vh",
        color: "white",
        background: `
          radial-gradient(circle at 0% 0%, rgba(24,211,164,0.12), transparent 24%),
          radial-gradient(circle at 100% 0%, rgba(255,138,31,0.08), transparent 22%),
          radial-gradient(circle at 80% 100%, rgba(125,123,255,0.10), transparent 28%),
          linear-gradient(180deg, #07111D 0%, #081423 46%, #09182A 100%)
        `,
      }}
    >
      <div
        style={{
          maxWidth: 1360,
          margin: "0 auto",
          padding: containerPadding,
        }}
      >
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.10)",
            background:
              "linear-gradient(140deg, rgba(8,22,38,0.96) 0%, rgba(5,15,28,0.98) 52%, rgba(5,11,20,1) 100%)",
            boxShadow: "0 22px 60px rgba(0,0,0,0.24)",
            padding: heroPadding,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `
                radial-gradient(circle at 10% 14%, rgba(24,211,164,0.18), transparent 26%),
                radial-gradient(circle at 76% 12%, rgba(255,138,31,0.12), transparent 24%),
                radial-gradient(circle at 72% 84%, rgba(125,123,255,0.14), transparent 30%),
                linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0))
              `,
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 14,
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 10,
                }}
              >
                <Link
                  href="/servproof"
                  style={{
                    textDecoration: "none",
                    color: "#E7EDF6",
                    padding: "8px 12px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                    fontWeight: 800,
                    fontSize: 12,
                    boxShadow:
                      "0 8px 18px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                >
                  ← Back to Operations Center
                </Link>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: "1px solid rgba(24,211,164,0.22)",
                    background:
                      "linear-gradient(180deg, rgba(24,211,164,0.18), rgba(24,211,164,0.10))",
                    color: "#24E1B4",
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                    boxShadow: "0 8px 18px rgba(24,211,164,0.10)",
                  }}
                >
                  Equipment Board
                </div>
              </div>

              <h1
                style={{
                  fontSize: isMobile ? 30 : isTablet ? 40 : 46,
                  lineHeight: 0.96,
                  letterSpacing: isMobile ? -1 : -1.6,
                  margin: 0,
                }}
              >
                Equipment across all locations.
              </h1>

              <p
                style={{
                  fontSize: isMobile ? 14 : 16,
                  lineHeight: 1.55,
                  color: "#C3CEDD",
                  maxWidth: 760,
                  marginTop: 12,
                  marginBottom: 0,
                }}
              >
                Fast-scanning operational visibility with denser layout, editable equipment,
                and direct access to related service activity.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/servproof/new"
                style={{
                  textDecoration: "none",
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "linear-gradient(180deg, #24E1B4, #18D3A4)",
                  color: "#041017",
                  fontWeight: 900,
                  fontSize: 13,
                  boxShadow:
                    "0 14px 28px rgba(24,211,164,0.22), inset 0 1px 0 rgba(255,255,255,0.24)",
                }}
              >
                + Add Equipment
              </Link>

              <Link
                href="/servproof/records"
                style={{
                  textDecoration: "none",
                  color: "#E7EDF6",
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                  fontWeight: 800,
                  fontSize: 13,
                  boxShadow:
                    "0 8px 18px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.06)",
                }}
              >
                View Service Records
              </Link>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: summaryGrid,
              gap: 10,
            }}
          >
            {[
              { label: "Total Equipment", value: String(totals.total), color: "#F3F6FB" },
              { label: "Operational", value: String(totals.operational), color: "#24E1B4" },
              { label: "Needs Attention", value: String(totals.attention), color: "#FACC15" },
              { label: "Down / Offline", value: String(totals.down), color: "#F87171" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  borderRadius: 15,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
                  padding: "12px 12px",
                  boxShadow:
                    "0 10px 22px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    color: "#9CA3AF",
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: 0.9,
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: isMobile ? 20 : 24,
                    lineHeight: 1,
                    color: item.color,
                    fontWeight: 900,
                    letterSpacing: -0.8,
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            borderRadius: 22,
            border: "1px solid rgba(255,255,255,0.10)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
            boxShadow: "0 18px 46px rgba(0,0,0,0.18)",
            padding: isMobile ? 14 : 16,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: utilityGrid,
              gap: 10,
            }}
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search equipment, type, serial, notes, location..."
              style={{
                width: "100%",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(7,14,24,0.70)",
                color: "white",
                padding: "11px 12px",
                fontSize: 14,
                outline: "none",
                boxShadow:
                  "0 10px 22px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            />

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              style={{
                width: "100%",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(7,14,24,0.70)",
                color: "white",
                padding: "11px 12px",
                fontSize: 14,
                outline: "none",
                boxShadow:
                  "0 10px 22px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              {locationOptions.map((location) => (
                <option key={location} value={location}>
                  {location === "all" ? "All locations" : location}
                </option>
              ))}
            </select>
          </div>
        </section>

        {!hydrated ? (
          <section
            style={{
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.10)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
              boxShadow: "0 16px 38px rgba(0,0,0,0.16)",
              padding: 18,
              color: "#C3CEDD",
              fontSize: 14,
            }}
          >
            Loading equipment board…
          </section>
        ) : filteredAssets.length === 0 ? (
          <section
            style={{
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.10)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
              boxShadow: "0 16px 38px rgba(0,0,0,0.16)",
              padding: 18,
            }}
          >
            <h2
              style={{
                fontSize: 22,
                letterSpacing: -0.6,
                marginTop: 0,
                marginBottom: 8,
              }}
            >
              No equipment found
            </h2>
            <p
              style={{
                color: "#C3CEDD",
                fontSize: 14,
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              Nothing matches the current filters.
            </p>
          </section>
        ) : (
          <section
            style={{
              display: "grid",
              gridTemplateColumns: cardGrid,
              gap: 12,
            }}
          >
            {filteredAssets.map((asset) => {
              const assetName = getAssetName(asset);
              const location = getAssetLocation(asset);
              const status = normalizeAssetStatus(asset.status);
              const pill = statusStyles(status);
              const assetRecords = recordsByAssetId.get(asset.id) || [];
              const openRecordCount = assetRecords.filter((record) => {
                const value = (record.status || "").toLowerCase();
                return !["closed", "resolved", "completed", "done"].includes(value);
              }).length;
              const latestRecord = assetRecords[0];

              return (
                <article
                  key={asset.id}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 20,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                    boxShadow: "0 16px 38px rgba(0,0,0,0.16)",
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "radial-gradient(circle at top left, rgba(24,211,164,0.10), transparent 28%)",
                      pointerEvents: "none",
                    }}
                  />

                  <div style={{ position: "relative" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 10,
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <h2
                          style={{
                            fontSize: isMobile ? 22 : 24,
                            lineHeight: 1,
                            letterSpacing: -0.8,
                            marginTop: 0,
                            marginBottom: 6,
                          }}
                        >
                          {assetName}
                        </h2>

                        <div
                          style={{
                            color: "#B9C5D4",
                            fontSize: 12,
                            lineHeight: 1.45,
                          }}
                        >
                          {location}
                        </div>
                      </div>

                      <div
                        style={{
                          ...pill,
                          borderRadius: 999,
                          padding: "6px 10px",
                          fontSize: 11,
                          fontWeight: 900,
                          letterSpacing: 0.4,
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                          boxShadow: "0 8px 18px rgba(0,0,0,0.10)",
                        }}
                      >
                        {status}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      {[
                        {
                          label: "Type",
                          value: asset.type || asset.category || "—",
                        },
                        {
                          label: "Serial",
                          value: asset.serialNumber || "—",
                        },
                        {
                          label: "Open Records",
                          value: String(openRecordCount),
                        },
                        {
                          label: "Last Activity",
                          value: latestRecord
                            ? formatDate(latestRecord.updatedAt || latestRecord.createdAt)
                            : formatDate(asset.updatedAt || asset.createdAt),
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          style={{
                            borderRadius: 12,
                            border: "1px solid rgba(255,255,255,0.10)",
                            background:
                              "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
                            padding: "10px 10px",
                            boxShadow:
                              "0 8px 18px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.06)",
                          }}
                        >
                          <div
                            style={{
                              color: "#9CA3AF",
                              fontSize: 10,
                              fontWeight: 900,
                              letterSpacing: 0.8,
                              textTransform: "uppercase",
                              marginBottom: 5,
                            }}
                          >
                            {item.label}
                          </div>
                          <div
                            style={{
                              color: "#F3F6FB",
                              fontSize: 13,
                              lineHeight: 1.35,
                              fontWeight: 800,
                              wordBreak: "break-word",
                            }}
                          >
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    {latestRecord ? (
                      <div
                        style={{
                          borderRadius: 12,
                          border: "1px solid rgba(255,255,255,0.10)",
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
                          padding: "11px 12px",
                          marginBottom: 12,
                          boxShadow:
                            "0 8px 18px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.06)",
                        }}
                      >
                        <div
                          style={{
                            color: "#9CA3AF",
                            fontSize: 10,
                            fontWeight: 900,
                            letterSpacing: 0.8,
                            textTransform: "uppercase",
                            marginBottom: 5,
                          }}
                        >
                          Latest Service Activity
                        </div>
                        <div
                          style={{
                            color: "#F3F6FB",
                            fontSize: 13,
                            lineHeight: 1.45,
                            fontWeight: 800,
                          }}
                        >
                          {latestRecord.title || latestRecord.issueType || "Untitled record"}
                        </div>
                      </div>
                    ) : null}

                    {asset.notes ? (
                      <div
                        style={{
                          borderRadius: 12,
                          border: "1px solid rgba(255,255,255,0.10)",
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
                          padding: "11px 12px",
                          marginBottom: 12,
                          boxShadow:
                            "0 8px 18px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.06)",
                        }}
                      >
                        <div
                          style={{
                            color: "#9CA3AF",
                            fontSize: 10,
                            fontWeight: 900,
                            letterSpacing: 0.8,
                            textTransform: "uppercase",
                            marginBottom: 5,
                          }}
                        >
                          Notes
                        </div>
                        <div
                          style={{
                            color: "#C3CEDD",
                            fontSize: 13,
                            lineHeight: 1.5,
                          }}
                        >
                          {asset.notes}
                        </div>
                      </div>
                    ) : null}

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => startEdit(asset)}
                        style={{
                          cursor: "pointer",
                          border: "1px solid rgba(255,255,255,0.10)",
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                          color: "#E7EDF6",
                          padding: "10px 12px",
                          borderRadius: 12,
                          fontWeight: 800,
                          fontSize: 13,
                          boxShadow:
                            "0 8px 18px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.06)",
                        }}
                      >
                        Edit Equipment
                      </button>

                      <Link
                        href={`/servproof/records?assetId=${encodeURIComponent(asset.id)}`}
                        style={{
                          textDecoration: "none",
                          padding: "10px 12px",
                          borderRadius: 12,
                          background: "linear-gradient(180deg, #24E1B4, #18D3A4)",
                          color: "#041017",
                          fontWeight: 900,
                          fontSize: 13,
                          boxShadow:
                            "0 14px 28px rgba(24,211,164,0.22), inset 0 1px 0 rgba(255,255,255,0.24)",
                        }}
                      >
                        View Records
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>

      {editingAssetId ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(0,0,0,0.60)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 760,
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.10)",
              background:
                "linear-gradient(140deg, rgba(8,22,38,0.98) 0%, rgba(5,15,28,0.99) 52%, rgba(5,11,20,1) 100%)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.34)",
              padding: isMobile ? 16 : 18,
              color: "white",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: "1px solid rgba(24,211,164,0.22)",
                    background:
                      "linear-gradient(180deg, rgba(24,211,164,0.18), rgba(24,211,164,0.10))",
                    color: "#24E1B4",
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                    marginBottom: 10,
                  }}
                >
                  Edit Equipment
                </div>

                <h2
                  style={{
                    fontSize: isMobile ? 26 : 30,
                    lineHeight: 1,
                    letterSpacing: -0.9,
                    marginTop: 0,
                    marginBottom: 8,
                  }}
                >
                  Update equipment details
                </h2>

                <p
                  style={{
                    color: "#C3CEDD",
                    fontSize: 14,
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  Quick in-place editing restored without leaving the board.
                </p>
              </div>

              <button
                type="button"
                onClick={cancelEdit}
                style={{
                  cursor: "pointer",
                  border: "1px solid rgba(255,255,255,0.10)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                  color: "#E7EDF6",
                  padding: "9px 12px",
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: 12,
                }}
              >
                Close
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(2,minmax(0,1fr))",
                gap: 10,
              }}
            >
              <label style={{ display: "block" }}>
                <div
                  style={{
                    color: "#9CA3AF",
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  Equipment Name
                </div>
                <input
                  value={String(editDraft.name || "")}
                  onChange={(e) => setEditDraft((prev) => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(7,14,24,0.70)",
                    color: "white",
                    padding: "11px 12px",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </label>

              <label style={{ display: "block" }}>
                <div
                  style={{
                    color: "#9CA3AF",
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  Type
                </div>
                <input
                  value={String(editDraft.type || "")}
                  onChange={(e) => setEditDraft((prev) => ({ ...prev, type: e.target.value }))}
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(7,14,24,0.70)",
                    color: "white",
                    padding: "11px 12px",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </label>

              <label style={{ display: "block" }}>
                <div
                  style={{
                    color: "#9CA3AF",
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  Serial Number
                </div>
                <input
                  value={String(editDraft.serialNumber || "")}
                  onChange={(e) =>
                    setEditDraft((prev) => ({ ...prev, serialNumber: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(7,14,24,0.70)",
                    color: "white",
                    padding: "11px 12px",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </label>

              <label style={{ display: "block" }}>
                <div
                  style={{
                    color: "#9CA3AF",
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  Location
                </div>
                <input
                  value={String(editDraft.location || "")}
                  onChange={(e) => setEditDraft((prev) => ({ ...prev, location: e.target.value }))}
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(7,14,24,0.70)",
                    color: "white",
                    padding: "11px 12px",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </label>

              <label
                style={{
                  display: "block",
                  gridColumn: isMobile ? "auto" : "1 / -1",
                }}
              >
                <div
                  style={{
                    color: "#9CA3AF",
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  Status
                </div>
                <select
                  value={String(editDraft.status || "unknown")}
                  onChange={(e) => setEditDraft((prev) => ({ ...prev, status: e.target.value }))}
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(7,14,24,0.70)",
                    color: "white",
                    padding: "11px 12px",
                    fontSize: 14,
                    outline: "none",
                  }}
                >
                  <option value="operational">Operational</option>
                  <option value="attention">Needs Attention</option>
                  <option value="down">Down</option>
                  <option value="offline">Offline</option>
                  <option value="unknown">Unknown</option>
                </select>
              </label>

              <label
                style={{
                  display: "block",
                  gridColumn: isMobile ? "auto" : "1 / -1",
                }}
              >
                <div
                  style={{
                    color: "#9CA3AF",
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  Notes
                </div>
                <textarea
                  rows={4}
                  value={String(editDraft.notes || "")}
                  onChange={(e) => setEditDraft((prev) => ({ ...prev, notes: e.target.value }))}
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(7,14,24,0.70)",
                    color: "white",
                    padding: "11px 12px",
                    fontSize: 14,
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </label>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                flexWrap: "wrap",
                marginTop: 14,
              }}
            >
              <button
                type="button"
                onClick={cancelEdit}
                style={{
                  cursor: "pointer",
                  border: "1px solid rgba(255,255,255,0.10)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                  color: "#E7EDF6",
                  padding: "10px 13px",
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveEdit}
                style={{
                  cursor: "pointer",
                  border: "none",
                  background: "linear-gradient(180deg, #24E1B4, #18D3A4)",
                  color: "#041017",
                  padding: "10px 14px",
                  borderRadius: 12,
                  fontWeight: 900,
                  fontSize: 13,
                  boxShadow:
                    "0 14px 28px rgba(24,211,164,0.22), inset 0 1px 0 rgba(255,255,255,0.24)",
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}