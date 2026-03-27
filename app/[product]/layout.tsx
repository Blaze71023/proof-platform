import Link from "next/link";
import type { ReactNode } from "react";
import { getProductConfig } from "@/lib/products/registry";

type Props = {
  children: ReactNode;
  params: Promise<{
    product: string;
  }>;
};

const switcher = [
  { label: "ServPROOF", href: "/servproof" },
  { label: "DrivePROOF", href: "/driveproof" },
  { label: "FleetPROOF", href: "/fleetproof" },
  { label: "RentPROOF", href: "/rentproof" },
];

const productThemeMap: Record<
  string,
  {
    background: string;
    spotlight: string;
    softTint: string;
    border: string;
    primary: string;
    surfaceGlow: string;
  }
> = {
  servproof: {
    background: "linear-gradient(180deg,#07111D 0%,#081423 46%,#09182A 100%)",
    spotlight: "rgba(24,211,164,0.14)",
    softTint: "rgba(24,211,164,0.10)",
    border: "rgba(24,211,164,0.22)",
    primary: "#18D3A4",
    surfaceGlow: "rgba(24,211,164,0.16)",
  },
  driveproof: {
    background: "linear-gradient(180deg,#07111D 0%,#081423 46%,#09182A 100%)",
    spotlight: "rgba(125,123,255,0.14)",
    softTint: "rgba(125,123,255,0.10)",
    border: "rgba(125,123,255,0.22)",
    primary: "#7D7BFF",
    surfaceGlow: "rgba(125,123,255,0.16)",
  },
  fleetproof: {
    background: "linear-gradient(180deg,#07111D 0%,#081423 46%,#09182A 100%)",
    spotlight: "rgba(255,138,31,0.14)",
    softTint: "rgba(255,138,31,0.10)",
    border: "rgba(255,138,31,0.22)",
    primary: "#FF8A1F",
    surfaceGlow: "rgba(255,138,31,0.16)",
  },
  rentproof: {
    background: "linear-gradient(180deg,#07111D 0%,#081423 46%,#09182A 100%)",
    spotlight: "rgba(56,189,248,0.14)",
    softTint: "rgba(56,189,248,0.10)",
    border: "rgba(56,189,248,0.22)",
    primary: "#38BDF8",
    surfaceGlow: "rgba(56,189,248,0.16)",
  },
};

export default async function ProductLayout({ children, params }: Props) {
  const { product } = await params;
  const config = getProductConfig(product);

  if (!config) {
    return (
      <div
        style={{
          minHeight: "100vh",
          color: "white",
          background: "linear-gradient(180deg,#07111D 0%,#081423 46%,#09182A 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <div style={{ maxWidth: 640, textAlign: "center" }}>
          <h1
            style={{
              fontSize: 40,
              lineHeight: 1,
              letterSpacing: -1.4,
              margin: "0 0 10px 0",
            }}
          >
            Product not found
          </h1>

          <p
            style={{
              color: "#C2CCD8",
              fontSize: 18,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            The requested product configuration is missing or incomplete.
          </p>
        </div>
      </div>
    );
  }

  const theme = productThemeMap[product] ?? {
    background: "linear-gradient(180deg,#07111D 0%,#081423 46%,#09182A 100%)",
    spotlight: "rgba(24,211,164,0.14)",
    softTint: "rgba(24,211,164,0.10)",
    border: "rgba(24,211,164,0.22)",
    primary: "#18D3A4",
    surfaceGlow: "rgba(24,211,164,0.16)",
  };

  const navItems = [
    { label: "Overview", href: `/${product}` },
    { label: "Assets", href: `/${product}/assets` },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        color: "white",
        background: theme.background,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background: `
            radial-gradient(circle at 10% 10%, ${theme.spotlight}, transparent 22%),
            radial-gradient(circle at 85% 14%, ${theme.softTint}, transparent 26%),
            radial-gradient(circle at 62% 78%, ${theme.softTint}, transparent 30%)
          `,
        }}
      />

      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          borderBottom: `1px solid ${theme.border}`,
          background: "rgba(5,10,18,0.70)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 10px 26px rgba(0,0,0,0.18)",
        }}
      >
        <div
          style={{
            maxWidth: 1440,
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 16px",
              borderRadius: 999,
              border: `1px solid ${theme.border}`,
              background: "rgba(255,255,255,0.04)",
              color: theme.primary,
              fontWeight: 900,
              letterSpacing: 0.4,
              boxShadow: `0 0 0 1px rgba(255,255,255,0.02), 0 14px 34px ${theme.surfaceGlow}`,
            }}
          >
            {config.name}
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {switcher.map((item) => {
              const active = item.href === `/${product}`;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    textDecoration: "none",
                    padding: "10px 14px",
                    borderRadius: 999,
                    border: `1px solid ${active ? theme.primary : theme.border}`,
                    background: active ? theme.softTint : "rgba(255,255,255,0.03)",
                    color: active ? "white" : "#C6D0DE",
                    fontWeight: 800,
                    boxShadow: active ? `0 12px 30px ${theme.surfaceGlow}` : "none",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  textDecoration: "none",
                  padding: "10px 14px",
                  borderRadius: 999,
                  border: `1px solid ${theme.border}`,
                  background: "rgba(255,255,255,0.03)",
                  color: "#E5E7EB",
                  fontWeight: 700,
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
}