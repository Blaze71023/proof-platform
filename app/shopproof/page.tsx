"use client";

import Link from "next/link";

export default function ShopProofEntry() {
  return (
    <main
      style={{
        minHeight: "100vh",
        color: "white",
        background: `
          radial-gradient(circle at 0% 0%, rgba(59,130,246,0.12), transparent 24%),
          radial-gradient(circle at 100% 0%, rgba(24,211,164,0.08), transparent 22%),
          linear-gradient(180deg, #07111D 0%, #081423 46%, #09182A 100%)
        `,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.10)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
          boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
          padding: 28,
        }}
      >
        {/* TITLE */}
        <h1
          style={{
            fontSize: 40,
            margin: 0,
            letterSpacing: -1.5,
          }}
        >
          ShopPROOF
        </h1>

        {/* SUBTEXT */}
        <p
          style={{
            marginTop: 12,
            marginBottom: 24,
            color: "#C3CEDD",
            fontSize: 16,
            lineHeight: 1.5,
            maxWidth: 640,
          }}
        >
          Shop operations control center for tracking vehicles, approvals,
          repairs, and accountability from intake to delivery.
        </p>

        {/* ACTIONS */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          <Link
            href="/shopproof/dashboard"
            style={{
              textDecoration: "none",
              padding: "14px 20px",
              borderRadius: 14,
              background: "linear-gradient(180deg, #60A5FA, #3B82F6)",
              color: "#06111D",
              fontWeight: 900,
              fontSize: 14,
              boxShadow:
                "0 14px 28px rgba(59,130,246,0.25), inset 0 1px 0 rgba(255,255,255,0.25)",
            }}
          >
            Enter Dashboard
          </Link>

          <Link
            href="/"
            style={{
              textDecoration: "none",
              padding: "14px 20px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
              color: "#EAF0F8",
              fontWeight: 900,
              fontSize: 14,
            }}
          >
            Back to PROOF Platform
          </Link>
        </div>

        {/* SIMPLE INFO BLOCKS */}
        <div
          style={{
            display: "grid",
            gap: 10,
          }}
        >
          {[
            "Track vehicles currently in shop",
            "Manage approvals and repair status",
            "Maintain visual and documented proof of work",
          ].map((item) => (
            <div
              key={item}
              style={{
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.10)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
                padding: "12px 14px",
                fontWeight: 700,
                fontSize: 14,
                color: "#EEF3F9",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}