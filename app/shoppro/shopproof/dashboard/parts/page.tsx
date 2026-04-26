"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Package2,
  Plus,
  Search,
  Truck,
} from "lucide-react";

const THEME = {
  pageBase:
    "linear-gradient(180deg, #02060B 0%, #030912 16%, #03101B 42%, #020912 72%, #02060B 100%)",
  shell:
    "linear-gradient(180deg, rgba(7,15,25,0.98) 0%, rgba(5,12,20,0.995) 42%, rgba(3,9,15,1) 100%)",
  shellInner:
    "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.012) 16%, rgba(255,255,255,0) 36%)",
  panel:
    "linear-gradient(180deg, rgba(13,24,37,0.98) 0%, rgba(8,16,27,0.99) 48%, rgba(7,13,22,1) 100%)",
  card:
    "linear-gradient(180deg, rgba(19,34,51,0.98) 0%, rgba(14,27,42,0.98) 44%, rgba(10,20,33,1) 100%)",
  text: "#F5FAFF",
  textSoft: "#D7E5F0",
  textMuted: "#9CB1C1",
  border: "1px solid rgba(109, 142, 176, 0.24)",
  borderSoft: "1px solid rgba(255,255,255,0.085)",
  shellShadow: "0 34px 90px rgba(0,0,0,0.5)",
  panelShadow: "0 18px 42px rgba(0,0,0,0.24)",
  cardShadow: "0 10px 22px rgba(0,0,0,0.16)",
  orange: "#F59E42",
  buttonBlue:
    "linear-gradient(180deg, rgba(36,126,255,1) 0%, rgba(21,101,219,1) 100%)",
};

export default function ShopProofPartsPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(245,158,66,0.12) 0%, rgba(245,158,66,0.04) 18%, rgba(245,158,66,0) 40%),
          repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 46px),
          repeating-linear-gradient(90deg, rgba(255,255,255,0.006) 0px, rgba(255,255,255,0.006) 1px, transparent 1px, transparent 74px),
          ${THEME.pageBase}
        `,
        color: THEME.text,
        padding: "22px",
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
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: THEME.shellInner }} />

        <TopBar />
        <div style={{ padding: 18, display: "grid", gap: 14, position: "relative", zIndex: 1 }}>
          <ActionRow />
          <Panel title="Parts Queue">
            <EmptyState />
          </Panel>
        </div>
      </div>
    </main>
  );
}

function TopBar() {
  return (
    <div
      style={{
        padding: "16px 18px",
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 14,
        alignItems: "center",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: THEME.borderSoft,
          background:
            "linear-gradient(180deg, rgba(17,32,48,0.98) 0%, rgba(10,19,29,0.98) 100%)",
        }}
      >
        <Package2 size={22} strokeWidth={2.1} color={THEME.orange} />
      </div>

      <div>
        <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 4 }}>
          Parts On Order
        </div>
        <div style={{ fontSize: 13, color: THEME.textMuted, lineHeight: 1.5 }}>
          Ordered parts, expected arrivals, and inventory-related delays.
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href="/shopproof/dashboard" style={ghostButton}>
          <ArrowLeft size={14} strokeWidth={2.4} />
          Dashboard
        </Link>

        <Link href="/shopproof/new" style={primaryButton}>
          <Plus size={14} strokeWidth={2.6} />
          New Job
        </Link>
      </div>
    </div>
  );
}

function ActionRow() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12 }}>
      <div
        style={{
          height: 44,
          borderRadius: 12,
          border: THEME.borderSoft,
          background: THEME.card,
          boxShadow: THEME.cardShadow,
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          gap: 10,
        }}
      >
        <Search size={15} strokeWidth={2.2} color={THEME.textMuted} />
        <span style={{ fontSize: 13, color: THEME.textMuted }}>
          Search ordered parts, vendors, or arrival status...
        </span>
      </div>

      <Link href="/shopproof/new" style={primaryButton}>
        <Plus size={14} strokeWidth={2.6} />
        New Job
      </Link>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        borderRadius: 18,
        overflow: "hidden",
        background: THEME.panel,
        border: THEME.border,
        boxShadow: THEME.panelShadow,
      }}
    >
      <div
        style={{
          height: 50,
          padding: "0 14px",
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.055)",
          fontSize: 15,
          fontWeight: 900,
        }}
      >
        {title}
      </div>
      <div style={{ padding: 12 }}>{children}</div>
    </section>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        minHeight: 340,
        borderRadius: 14,
        border: THEME.borderSoft,
        background: THEME.card,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 28,
        boxShadow: THEME.cardShadow,
      }}
    >
      <div style={{ maxWidth: 420, display: "grid", justifyItems: "center" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            border: THEME.borderSoft,
            background:
              "linear-gradient(180deg, rgba(20,33,47,0.98) 0%, rgba(11,20,30,0.98) 100%)",
          }}
        >
          <Truck size={30} strokeWidth={2.1} color={THEME.orange} />
        </div>

        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 10 }}>
          No parts on order
        </div>

        <div style={{ fontSize: 14, color: THEME.textMuted, lineHeight: 1.65, marginBottom: 18 }}>
          Parts waiting on vendors or delivery will appear here once the shop starts tracking them.
        </div>

        <Link href="/shopproof/new" style={primaryButton}>
          <Plus size={14} strokeWidth={2.6} />
          Create New Job
        </Link>
      </div>
    </div>
  );
}

const primaryButton: React.CSSProperties = {
  height: 42,
  padding: "0 16px",
  borderRadius: 10,
  background: THEME.buttonBlue,
  border: "1px solid rgba(59,130,246,0.34)",
  color: "#F7FBFF",
  fontSize: 13,
  fontWeight: 900,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  textDecoration: "none",
};

const ghostButton: React.CSSProperties = {
  height: 42,
  padding: "0 14px",
  borderRadius: 10,
  border: THEME.borderSoft,
  background:
    "linear-gradient(180deg, rgba(18,29,41,0.98) 0%, rgba(10,18,28,0.98) 100%)",
  color: THEME.textSoft,
  fontSize: 13,
  fontWeight: 800,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  textDecoration: "none",
};