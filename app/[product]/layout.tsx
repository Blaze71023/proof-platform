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
  { label: "DrivePROOF", href: "/driveproof" },
  { label: "FleetPROOF", href: "/fleetproof" },
  { label: "RentPROOF", href: "/rentproof" },
];

export default async function ProductLayout({ children, params }: Props) {
  const { product } = await params;
  const config = getProductConfig(product);

  return (
    <div
      style={{
        minHeight: "100vh",
        color: "white",
        background: config.theme.background,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background: `
            radial-gradient(circle at 10% 10%, ${config.theme.spotlight}, transparent 22%),
            radial-gradient(circle at 85% 14%, ${config.theme.softTint}, transparent 26%),
            radial-gradient(circle at 62% 78%, ${config.theme.softTint}, transparent 30%)
          `,
        }}
      />

      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          borderBottom: `1px solid ${config.theme.border}`,
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
              border: `1px solid ${config.theme.border}`,
              background: "rgba(255,255,255,0.04)",
              color: config.theme.primary,
              fontWeight: 900,
              letterSpacing: 0.4,
              boxShadow: `0 0 0 1px rgba(255,255,255,0.02), 0 14px 34px ${config.theme.surfaceGlow}`,
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
                    border: `1px solid ${active ? config.theme.primary : config.theme.border}`,
                    background: active ? config.theme.softTint : "rgba(255,255,255,0.03)",
                    color: active ? "white" : "#C6D0DE",
                    fontWeight: 800,
                    boxShadow: active ? `0 12px 30px ${config.theme.surfaceGlow}` : "none",
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
            {config.navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  textDecoration: "none",
                  padding: "10px 14px",
                  borderRadius: 999,
                  border: `1px solid ${config.theme.border}`,
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