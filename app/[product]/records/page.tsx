"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getProductConfig } from "@/lib/products/registry";

type Asset = {
  id: string;
  name: string;
  location?: string;
  serialNumber?: string;
};

type RecordEntry = {
  id: string;
  assetId: string;
  note: string;
  status: "working" | "issue";
  priority: "low" | "medium" | "high";
  createdAt: string;
  photos: string[];
};

export default function RecordsPage({
  params,
}: {
  params: Promise<{ product: string }>;
}) {
  const { product } = use(params);
  const config = getProductConfig(product);
  const searchParams = useSearchParams();
  const assetId = searchParams.get("assetId") ?? "";

  const assetStorageKey = `proof.assets.${product}.v1`;
  const recordsStorageKey = `proof.records.${product}.v1`;

  const [assets, setAssets] = useState<Asset[]>([]);
  const [records, setRecords] = useState<RecordEntry[]>([]);

  const [newNote, setNewNote] = useState("");
  const [newStatus, setNewStatus] = useState<"working" | "issue">("working");
  const [newPriority, setNewPriority] =
    useState<"low" | "medium" | "high">("low");

  useEffect(() => {
    const a = localStorage.getItem(assetStorageKey);
    const r = localStorage.getItem(recordsStorageKey);

    setAssets(a ? JSON.parse(a) : []);
    setRecords(r ? JSON.parse(r) : []);
  }, [assetStorageKey, recordsStorageKey]);

  const activeAsset = useMemo(
    () => assets.find((a) => a.id === assetId),
    [assets, assetId]
  );

  const assetRecords = useMemo(
    () =>
      records
        .filter((r) => r.assetId === assetId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        ),
    [records, assetId]
  );

  const saveRecords = (next: RecordEntry[]) => {
    setRecords(next);
    localStorage.setItem(recordsStorageKey, JSON.stringify(next));
  };

  const handleCreate = () => {
    if (!assetId || !newNote.trim()) return;

    const record: RecordEntry = {
      id: crypto.randomUUID(),
      assetId,
      note: newNote.trim(),
      status: newStatus,
      priority: newPriority,
      createdAt: new Date().toISOString(),
      photos: [],
    };

    saveRecords([record, ...records]);

    setNewNote("");
    setNewStatus("working");
    setNewPriority("low");
  };

  const statusColor = (status: string) =>
    status === "issue" ? "#FF6B6B" : "#27D9BF";

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
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#7AF2E0" }}>
            ServPROOF
          </div>

          <h1 style={{ margin: 0, fontSize: 28 }}>
            Service Records
          </h1>

          <p style={{ color: "#9FB0C4", marginTop: 6 }}>
            {activeAsset
              ? `Tracking ${activeAsset.name}`
              : "Select equipment to view records"}
          </p>
        </div>

        <Link
          href={`/${product}/assets`}
          style={{
            color: "#27D9BF",
            fontWeight: 700,
            display: "inline-block",
            marginBottom: 16,
          }}
        >
          ← Back to Equipment
        </Link>

        {activeAsset && (
          <div
            style={{
              borderRadius: 16,
              border: "1px solid rgba(39,217,191,0.18)",
              background: "rgba(15,40,55,0.7)",
              padding: 14,
              marginBottom: 16,
            }}
          >
            <textarea
              placeholder="Log what is happening..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              style={{
                width: "100%",
                minHeight: 90,
                padding: 12,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.05)",
                color: "white",
                marginBottom: 10,
              }}
            />

            <div style={{ display: "flex", gap: 10 }}>
              <select
                value={newStatus}
                onChange={(e) =>
                  setNewStatus(e.target.value as "working" | "issue")
                }
                style={input}
              >
                <option value="working">Operational</option>
                <option value="issue">Not Working</option>
              </select>

              <select
                value={newPriority}
                onChange={(e) =>
                  setNewPriority(
                    e.target.value as "low" | "medium" | "high"
                  )
                }
                style={input}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <button onClick={handleCreate} style={btn}>
                Save
              </button>
            </div>
          </div>
        )}

        {/* RECORD LIST */}
        <div style={{ display: "grid", gap: 10 }}>
          {assetRecords.map((r) => (
            <div
              key={r.id}
              style={{
                borderRadius: 14,
                padding: 14,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(10,30,40,0.7)",
              }}
            >
              <div style={{ fontSize: 12, color: "#7B93A8" }}>
                {new Date(r.createdAt).toLocaleString()}
              </div>

              <div style={{ margin: "6px 0", fontWeight: 700 }}>
                {r.note}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <span
                  style={{
                    color: statusColor(r.status),
                    fontWeight: 700,
                  }}
                >
                  {r.status}
                </span>

                <span style={{ color: "#AAB4C3" }}>
                  {r.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

const input = {
  padding: "8px 10px",
  borderRadius: 8,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "white",
};

const btn = {
  padding: "8px 12px",
  borderRadius: 8,
  background: "#27D9BF",
  border: "none",
  color: "#041116",
  fontWeight: 800,
  cursor: "pointer",
};