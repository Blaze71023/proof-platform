"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

export default function ShopProofPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 20% 20%, #0f172a, #020617 60%)",
        color: "#ffffff",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "13px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
                marginBottom: "8px",
              }}
            >
              PROOF Platform
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "34px",
                fontWeight: 700,
                lineHeight: 1.1,
              }}
            >
              ShopPROOF
            </h1>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <Link href="/shopproof/dashboard" style={{ textDecoration: "none" }}>
              <span style={primaryButtonStyle}>Open Dashboard</span>
            </Link>

            <Link href="/" style={{ textDecoration: "none" }}>
              <span style={ghostButtonStyle}>Back to PROOF Platform</span>
            </Link>
          </div>
        </div>

        <div
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "18px",
            padding: "32px",
            backdropFilter: "blur(12px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "28px",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(59,130,246,0.12)",
                  border: "1px solid rgba(59,130,246,0.25)",
                  color: "#93c5fd",
                  borderRadius: "999px",
                  padding: "8px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  marginBottom: "18px",
                }}
              >
                Evidence-first repair documentation
              </div>

              <h2
                style={{
                  margin: "0 0 14px 0",
                  fontSize: "38px",
                  lineHeight: 1.08,
                  fontWeight: 700,
                }}
              >
                Protect the shop.
                <br />
                Prove the work.
              </h2>

              <p
                style={{
                  margin: 0,
                  fontSize: "15px",
                  color: "rgba(255,255,255,0.72)",
                  lineHeight: 1.7,
                  maxWidth: "560px",
                }}
              >
                ShopPROOF gives repair shops a clean intake → findings →
                approval → release workflow with required condition photos,
                signed authorizations, and permanent records tied to the
                vehicle.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginTop: "24px",
                }}
              >
                <Link
                  href="/shopproof/dashboard"
                  style={{ textDecoration: "none" }}
                >
                  <span style={primaryButtonStyle}>Enter ShopPROOF</span>
                </Link>

                <Link href="/shopproof/new" style={{ textDecoration: "none" }}>
                  <span style={secondaryButtonStyle}>Start New Intake</span>
                </Link>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              <div style={featureCardStyle}>
                <div style={featureTitleStyle}>Required intake + release photos</div>
                <div style={featureBodyStyle}>
                  Exterior, wheels, interior, and engine bay captured into the
                  permanent job record.
                </div>
              </div>

              <div style={featureCardStyle}>
                <div style={featureTitleStyle}>Signed approvals tied to the job</div>
                <div style={featureBodyStyle}>
                  Intake authorizations, repair approvals, added authorizations,
                  and final release all stay attached to one record.
                </div>
              </div>

              <div style={featureCardStyle}>
                <div style={featureTitleStyle}>Built for real shops</div>
                <div style={featureBodyStyle}>
                  Mobile and tablet friendly for the floor, but still clean and
                  usable on desktop in the office.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
          }}
        >
          <Link href="/shopproof/dashboard" style={{ textDecoration: "none" }}>
            <div style={quickCardStyle}>
              <div style={quickCardLabelStyle}>Dashboard</div>
              <div style={quickCardBodyStyle}>
                View intake-needed, in-progress, and completed vehicles.
              </div>
            </div>
          </Link>

          <Link href="/shopproof/new" style={{ textDecoration: "none" }}>
            <div style={quickCardStyle}>
              <div style={quickCardLabelStyle}>New Intake</div>
              <div style={quickCardBodyStyle}>
                Start a new customer and vehicle record with VIN decode and
                intake authorization.
              </div>
            </div>
          </Link>
        </div>

        <div
          style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.48)",
            lineHeight: 1.6,
            padding: "0 4px",
          }}
        >
          Every job should end with a full record: intake authorization,
          findings, approvals, release photos, and final release — all saved in
          one place.
        </div>
      </div>
    </div>
  );
}

const primaryButtonStyle: CSSProperties = {
  display: "inline-block",
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  border: "none",
  padding: "12px 18px",
  borderRadius: "10px",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButtonStyle: CSSProperties = {
  display: "inline-block",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.14)",
  padding: "12px 18px",
  borderRadius: "10px",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const ghostButtonStyle: CSSProperties = {
  display: "inline-block",
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.12)",
  padding: "12px 18px",
  borderRadius: "10px",
  color: "rgba(255,255,255,0.78)",
  fontWeight: 600,
  cursor: "pointer",
};

const featureCardStyle: CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "14px",
  padding: "16px",
};

const featureTitleStyle: CSSProperties = {
  fontSize: "15px",
  fontWeight: 600,
  marginBottom: "8px",
  color: "#ffffff",
};

const featureBodyStyle: CSSProperties = {
  fontSize: "14px",
  lineHeight: 1.6,
  color: "rgba(255,255,255,0.68)",
};

const quickCardStyle: CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "14px",
  padding: "18px",
  minHeight: "110px",
};

const quickCardLabelStyle: CSSProperties = {
  fontSize: "15px",
  fontWeight: 600,
  color: "#ffffff",
  marginBottom: "8px",
};

const quickCardBodyStyle: CSSProperties = {
  fontSize: "14px",
  lineHeight: 1.6,
  color: "rgba(255,255,255,0.68)",
};