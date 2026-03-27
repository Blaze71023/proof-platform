"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { getProductConfig } from "@/lib/products/registry";

type Asset = {
  id: string;
  name: string;
  location?: string;
  serialNumber?: string;
  category?: string;
};

type RecordEntry = {
  id: string;
  assetId: string;
  note: string;
  status: "working" | "issue";
  priority: "low" | "medium" | "high";
  createdAt: string;
  photos: string[];
  reportedBy?: string;
  assignedTech?: string;
};

const LOCATION_OPTIONS = ["Main Location", "Store 2"];

export default function AssetsPage({
  params,
}: {
  params: Promise<{ product: string }>;
}) {
  const { product } = use(params);
  const config = getProductConfig(product);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [records, setRecords] = useState<RecordEntry[]>([]);

  const [newAssetName, setNewAssetName] = useState("");
  const [newAssetLocation, setNewAssetLocation] = useState("Main Location");
  const [newAssetSerialNumber, setNewAssetSerialNumber] = useState("");
  const [newAssetCategory, setNewAssetCategory] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [showIssuesOnly, setShowIssuesOnly] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("All Locations");

  const assetStorageKey = `proof.assets.${product}.v1`;
  const recordsStorageKey = `proof.records.${product}.v1`;

  useEffect(() => {
    const storedAssets = localStorage.getItem(assetStorageKey);
    if (storedAssets) {
      try {
        setAssets(JSON.parse(storedAssets));
      } catch {
        setAssets([]);
      }
    }

    const storedRecords = localStorage.getItem(recordsStorageKey);
    if (storedRecords) {
      try {
        setRecords(JSON.parse(storedRecords));
      } catch {
        setRecords([]);
      }
    }
  }, [assetStorageKey, recordsStorageKey]);

  const normalizedAssets = useMemo(() => {
    return assets.map((a) => ({
      ...a,
      location: a.location || "Main Location",
      serialNumber: a.serialNumber || "",
      category: a.category || "",
    }));
  }, [assets]);

  const recordsByAsset = useMemo(() => {
    const map = new Map<string, RecordEntry[]>();
    for (const r of records) {
      const list = map.get(r.assetId) || [];
      list.push(r);
      map.set(r.assetId, list);
    }
    for (const [, list] of map) {
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
    }
    return map;
  }, [records]);

  const filteredAssets = useMemo(() => {
    const q = searchQuery.toLowerCase();

    return normalizedAssets.filter((asset) => {
      const latest = (recordsByAsset.get(asset.id) || [])[0];
      const status = latest?.status || "working";

      if (showIssuesOnly && status !== "issue") return false;
      if (
        selectedLocation !== "All Locations" &&
        asset.location !== selectedLocation
      )
        return false;

      if (!q) return true;

      return (
        asset.name.toLowerCase().includes(q) ||
        asset.category.toLowerCase().includes(q) ||
        asset.serialNumber.toLowerCase().includes(q)
      );
    });
  }, [
    normalizedAssets,
    recordsByAsset,
    searchQuery,
    showIssuesOnly,
    selectedLocation,
  ]);

  const saveAssets = (next: Asset[]) => {
    setAssets(next);
    localStorage.setItem(assetStorageKey, JSON.stringify(next));
  };

  const handleAddAsset = () => {
    if (!newAssetName.trim()) return;

    const newAsset: Asset = {
      id: crypto.randomUUID(),
      name: newAssetName.trim(),
      location: newAssetLocation,
      serialNumber: newAssetSerialNumber.trim(),
      category: newAssetCategory.trim(),
    };

    saveAssets([newAsset, ...assets]);

    setNewAssetName("");
    setNewAssetSerialNumber("");
    setNewAssetCategory("");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#06101A 0%,#08131E 42%,#040B12 100%)",
        color: "white",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "#7AF2E0",
              marginBottom: 6,
            }}
          >
            ServPROOF
          </div>

          <h1
            style={{
              fontSize: 30,
              fontWeight: 900,
              margin: 0,
            }}
          >
            Equipment Board
          </h1>

          <p style={{ color: "#9FB0C4", marginTop: 6 }}>
            Manage equipment, track status, and jump directly into records.
          </p>
        </div>

        {/* ADD PANEL */}
        <div
          style={{
            border: "1px solid rgba(39,217,191,0.18)",
            borderRadius: 16,
            background: "rgba(15,40,55,0.7)",
            padding: 14,
            marginBottom: 14,
          }}
        >
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              placeholder="Equipment name"
              value={newAssetName}
              onChange={(e) => setNewAssetName(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Serial"
              value={newAssetSerialNumber}
              onChange={(e) => setNewAssetSerialNumber(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Category"
              value={newAssetCategory}
              onChange={(e) => setNewAssetCategory(e.target.value)}
              style={inputStyle}
            />

            <button onClick={handleAddAsset} style={primaryBtn}>
              + Add Equipment
            </button>
          </div>
        </div>

        {/* FILTER BAR */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={inputStyle}
          />

          <button
            onClick={() => setShowIssuesOnly((p) => !p)}
            style={showIssuesOnly ? dangerBtn : secondaryBtn}
          >
            Issues Only
          </button>
        </div>

        {/* TABLE */}
        <div
          style={{
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(10,30,40,0.7)",
          }}
        >
          {filteredAssets.map((asset) => {
            const latest = (recordsByAsset.get(asset.id) || [])[0];

            return (
              <div
                key={asset.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 800 }}>{asset.name}</div>
                  <div style={{ fontSize: 12, color: "#9FB0C4" }}>
                    {asset.category || "-"}
                  </div>
                </div>

                <Link
                  href={`/${product}/records?assetId=${asset.id}`}
                  style={{
                    color: "#27D9BF",
                    fontWeight: 800,
                  }}
                >
                  View →
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

/* STYLES */
const inputStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.05)",
  color: "white",
  fontSize: 14,
};

const primaryBtn = {
  padding: "10px 14px",
  borderRadius: 10,
  background: "#27D9BF",
  color: "#041116",
  fontWeight: 800,
  border: "none",
  cursor: "pointer",
};

const secondaryBtn = {
  padding: "10px 14px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.05)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.12)",
  cursor: "pointer",
};

const dangerBtn = {
  ...secondaryBtn,
  border: "1px solid rgba(255,107,107,0.4)",
  color: "#FF6B6B",
};