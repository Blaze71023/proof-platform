"use client";
import Link from "next/link";

export default function PlatformNav() {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        borderBottom: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(4,10,18,0.78)",
        backdropFilter: "blur(14px)",
      }}
    >
      <div
        style={{
          maxWidth: 1460,
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        {/* LEFT SIDE */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            style={{
              textDecoration: "none",
              fontWeight: 900,
              letterSpacing: 0.4,
              color: "white",
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.12)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
            }}
          >
            PROOF
          </Link>

          <Link
            href="/driveproof"
            style={navItem}
          >
            DrivePROOF
          </Link>

          <Link
            href="/fleetproof"
            style={navItem}
          >
            FleetPROOF
          </Link>

          <Link
            href="/rentproof"
            style={navItem}
          >
            RentPROOF
          </Link>

          <Link
            href="/pricing"
            style={navItem}
          >
            Pricing
          </Link>
        </div>

        {/* RIGHT SIDE */}
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/login"
            style={navItem}
          >
            Login
          </Link>

          <Link
            href="/signup"
            style={{
              textDecoration: "none",
              padding: "10px 16px",
              borderRadius: 12,
              background: "linear-gradient(180deg,#24E1B4,#18D3A4)",
              color: "#041017",
              fontWeight: 900,
              boxShadow: "0 12px 30px rgba(24,211,164,0.25)",
            }}
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
}

const navItem: React.CSSProperties = {
  textDecoration: "none",
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.10)",
  color: "#E7EDF6",
  fontWeight: 700,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))",
};
