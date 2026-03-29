"use client";

import { useParams } from "next/navigation";

export default function ShopProofFinalPage() {
  const params = useParams();
  const jobId = params?.id as string;

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #02060B 0%, #030912 18%, #03101B 46%, #020912 76%, #02060B 100%)",
        color: "#F5FAFF",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          borderRadius: "24px",
          border: "1px solid rgba(109, 142, 176, 0.24)",
          background:
            "linear-gradient(180deg, rgba(7,15,25,0.98) 0%, rgba(5,12,20,0.995) 42%, rgba(3,9,15,1) 100%)",
          boxShadow: "0 34px 90px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              fontSize: "0.85rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(215,229,240,0.78)",
              marginBottom: "8px",
            }}
          >
            ShopPROOF
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "2rem",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              fontWeight: 900,
            }}
          >
            Final Condition
          </h1>

          <p
            style={{
              margin: "10px 0 0",
              color: "rgba(215,229,240,0.78)",
              fontSize: "1rem",
              lineHeight: 1.5,
            }}
          >
            Placeholder final-condition page for job{" "}
            <span style={{ color: "#78ABFF", fontWeight: 700 }}>
              {jobId || "unknown"}
            </span>
            .
          </p>
        </div>

        <div style={{ padding: "24px" }}>
          <div
            style={{
              borderRadius: "18px",
              border: "1px solid rgba(255,255,255,0.08)",
              background:
                "linear-gradient(180deg, rgba(19,34,51,0.98) 0%, rgba(14,27,42,0.98) 44%, rgba(10,20,33,1) 100%)",
              padding: "20px",
            }}
          >
            <div
              style={{
                fontSize: "1rem",
                fontWeight: 800,
                marginBottom: "8px",
              }}
            >
              Build-safe stub
            </div>

            <div
              style={{
                color: "rgba(215,229,240,0.78)",
                lineHeight: 1.5,
              }}
            >
              This page exists so the app can build cleanly. Replace it later
              with the full final-condition workflow.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}