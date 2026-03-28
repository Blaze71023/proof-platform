"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type ProductCard = {
  id: string;
  name: string;
  href?: string;
  image: string;
  description: string;
  bullets: string[];
  status: string;
  disabled?: boolean;
};

const availableProducts: ProductCard[] = [
  {
    id: "shopproof",
    name: "ShopPROOF",
    href: "/shopproof",
    image: "/images/shopproof-dashboard.png",
    description:
      "Repair shop documentation for service intake, workflow visibility, and customer vehicle accountability.",
    bullets: [
      "Vehicle intake and documentation workflow",
      "Service records and visual proof structure",
      "Active build with real system foundation",
    ],
    status: "Active Build",
  },
  {
    id: "towproof",
    name: "TowPROOF",
    href: "/towproof",
    image: "/images/towproof-hero.png",
    description:
      "Tow and recovery documentation for hook-up, transport, destination proof, and operator accountability.",
    bullets: [
      "Tow intake and hook-up documentation",
      "Destination and release accountability",
      "Preview dashboard direction is established",
    ],
    status: "Preview Build",
    disabled: false,
  },
  {
    id: "servproof",
    name: "ServPROOF",
    href: "/servproof",
    image: "/images/equipment-proof.jpg",
    description:
      "Restaurant equipment service documentation for maintenance issues, failures, repairs, and multi-location accountability.",
    bullets: [
      "Restaurant equipment condition capture",
      "Maintenance and failure reporting",
      "Multi-location service accountability",
    ],
    status: "Live",
  },
];

const comingSoonProducts: ProductCard[] = [
  {
    id: "driveproof",
    name: "DrivePROOF",
    image: "/images/driveproof-inspection.png",
    description:
      "Professional vehicle documentation for pickups, dropoffs, damage capture, and guest accountability.",
    bullets: [
      "Vehicle condition capture",
      "Pickup and dropoff inspections",
      "Claims and damage evidence",
    ],
    status: "Coming Soon",
    disabled: true,
  },
  {
    id: "rentproof",
    name: "RentPROOF",
    image: "/images/rentproof-property.jpeg",
    description:
      "Premium property documentation for stays, guest incidents, and room condition capture.",
    bullets: [
      "Property turnover records",
      "Guest incident documentation",
      "Cleaner and host coordination",
    ],
    status: "Coming Soon",
    disabled: true,
  },
  {
    id: "fleetproof",
    name: "FleetPROOF",
    image: "/images/fleetproof-equipment.jpg",
    description:
      "Inspection workflows for equipment, assignments, maintenance visibility, and service accountability.",
    bullets: [
      "Heavy equipment accountability",
      "Pre-trip and service workflows",
      "Downtime and maintenance visibility",
    ],
    status: "Coming Soon",
    disabled: true,
  },
];

const productThemeMap: Record<
  string,
  {
    primary: string;
    border: string;
    heroGradient: string;
    surfaceGlow: string;
    spotlight: string;
    heroGlow: string;
    button: string;
    buttonText: string;
    statusBg: string;
    statusBorder: string;
    statusText: string;
  }
> = {
  shopproof: {
    primary: "#3B82F6",
    border: "rgba(59,130,246,0.26)",
    heroGradient:
      "linear-gradient(180deg, rgba(59,130,246,0.14), rgba(255,255,255,0.04))",
    surfaceGlow: "rgba(59,130,246,0.16)",
    spotlight: "rgba(59,130,246,0.18)",
    heroGlow: "rgba(59,130,246,0.24)",
    button: "linear-gradient(180deg, #60A5FA, #3B82F6)",
    buttonText: "#06111D",
    statusBg:
      "linear-gradient(180deg, rgba(59,130,246,0.18), rgba(59,130,246,0.10))",
    statusBorder: "rgba(59,130,246,0.26)",
    statusText: "#93C5FD",
  },
  towproof: {
    primary: "#FACC15",
    border: "rgba(250,204,21,0.26)",
    heroGradient:
      "linear-gradient(180deg, rgba(250,204,21,0.14), rgba(255,255,255,0.04))",
    surfaceGlow: "rgba(250,204,21,0.16)",
    spotlight: "rgba(250,204,21,0.18)",
    heroGlow: "rgba(250,204,21,0.22)",
    button: "linear-gradient(180deg, #FCD34D, #FACC15)",
    buttonText: "#1B1603",
    statusBg:
      "linear-gradient(180deg, rgba(250,204,21,0.18), rgba(250,204,21,0.10))",
    statusBorder: "rgba(250,204,21,0.26)",
    statusText: "#FDE68A",
  },
  servproof: {
    primary: "#18D3A4",
    border: "rgba(24,211,164,0.26)",
    heroGradient:
      "linear-gradient(180deg, rgba(24,211,164,0.14), rgba(255,255,255,0.04))",
    surfaceGlow: "rgba(24,211,164,0.16)",
    spotlight: "rgba(24,211,164,0.18)",
    heroGlow: "rgba(24,211,164,0.24)",
    button: "linear-gradient(180deg, #24E1B4, #18D3A4)",
    buttonText: "#041017",
    statusBg:
      "linear-gradient(180deg, rgba(24,211,164,0.18), rgba(24,211,164,0.10))",
    statusBorder: "rgba(24,211,164,0.26)",
    statusText: "#8CF0D1",
  },
  driveproof: {
    primary: "#7D7BFF",
    border: "rgba(125,123,255,0.26)",
    heroGradient:
      "linear-gradient(180deg, rgba(125,123,255,0.14), rgba(255,255,255,0.04))",
    surfaceGlow: "rgba(125,123,255,0.16)",
    spotlight: "rgba(125,123,255,0.18)",
    heroGlow: "rgba(125,123,255,0.24)",
    button:
      "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05))",
    buttonText: "#DDE6F3",
    statusBg:
      "linear-gradient(180deg, rgba(125,123,255,0.18), rgba(125,123,255,0.10))",
    statusBorder: "rgba(125,123,255,0.26)",
    statusText: "#BCBAFF",
  },
  rentproof: {
    primary: "#38BDF8",
    border: "rgba(56,189,248,0.26)",
    heroGradient:
      "linear-gradient(180deg, rgba(56,189,248,0.14), rgba(255,255,255,0.04))",
    surfaceGlow: "rgba(56,189,248,0.16)",
    spotlight: "rgba(56,189,248,0.18)",
    heroGlow: "rgba(56,189,248,0.24)",
    button:
      "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05))",
    buttonText: "#DDE6F3",
    statusBg:
      "linear-gradient(180deg, rgba(56,189,248,0.18), rgba(56,189,248,0.10))",
    statusBorder: "rgba(56,189,248,0.26)",
    statusText: "#7DD3FC",
  },
  fleetproof: {
    primary: "#FF8A1F",
    border: "rgba(255,138,31,0.26)",
    heroGradient:
      "linear-gradient(180deg, rgba(255,138,31,0.14), rgba(255,255,255,0.04))",
    surfaceGlow: "rgba(255,138,31,0.16)",
    spotlight: "rgba(255,138,31,0.18)",
    heroGlow: "rgba(255,138,31,0.24)",
    button:
      "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05))",
    buttonText: "#DDE6F3",
    statusBg:
      "linear-gradient(180deg, rgba(255,138,31,0.18), rgba(255,138,31,0.10))",
    statusBorder: "rgba(255,138,31,0.26)",
    statusText: "#FDBA74",
  },
};

const engineCards = [
  {
    title: "Asset",
    text: "A vehicle, machine, property, or object being documented.",
    accent: "#18D3A4",
  },
  {
    title: "Inspection",
    text: "Structured documentation capturing condition, photos, and notes at a specific moment.",
    accent: "#7D7BFF",
  },
  {
    title: "Record",
    text: "A permanent history of inspections stored safely outside personal phones.",
    accent: "#FF8A1F",
  },
] as const;

function useViewport() {
  const [width, setWidth] = useState<number>(1440);

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

export default function HomePage() {
  const { isMobile, isTablet } = useViewport();

  const containerPadding = isMobile
    ? "18px 12px 28px"
    : isTablet
      ? "20px 16px 34px"
      : "24px 18px 40px";

  const heroPadding = isMobile
    ? "18px 14px 16px"
    : isTablet
      ? "22px 18px 18px"
      : "28px 26px 24px";

  const heroGridColumns = isMobile || isTablet ? "1fr" : "1.08fr 0.92fr";
  const heroHeadingSize = isMobile ? 34 : isTablet ? 46 : 58;
  const heroTextSize = isMobile ? 15 : isTablet ? 17 : 18;
  const heroImageMinHeight = isMobile ? 220 : isTablet ? 300 : 420;

  const statsGridColumns = isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))";
  const problemGridColumns = isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))";
  const engineGridColumns = isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))";
  const availableGridColumns = isMobile
    ? "1fr"
    : isTablet
      ? "repeat(2, minmax(0, 1fr))"
      : "repeat(3, minmax(0, 1fr))";
  const comingSoonGridColumns = isMobile
    ? "1fr"
    : isTablet
      ? "repeat(2, minmax(0, 1fr))"
      : "repeat(3, minmax(0, 1fr))";

  const sectionTitleSize = isMobile ? 22 : 28;
  const productTitleSize = isMobile ? 26 : isTablet ? 30 : 34;

  const renderProductCard = (product: ProductCard) => {
    const theme = productThemeMap[product.id];
    if (!theme) return null;

    const buttonLabel = product.disabled
      ? `View ${product.name}`
      : `Open ${product.name}`;

    return (
      <article
        key={product.id}
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 24,
          border: `1px solid ${theme.border}`,
          background: theme.heroGradient,
          boxShadow: `0 18px 42px ${theme.surfaceGlow}`,
          padding: 16,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(circle at top left, ${theme.spotlight}, transparent 30%),
              linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0))
            `,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              marginBottom: 14,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "7px 12px",
                borderRadius: 999,
                border: `1px solid ${theme.border}`,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
                color: theme.primary,
                fontWeight: 900,
                fontSize: 12,
                boxShadow: `0 8px 18px ${theme.surfaceGlow}`,
              }}
            >
              {product.name}
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "7px 11px",
                borderRadius: 999,
                border: `1px solid ${theme.statusBorder}`,
                background: theme.statusBg,
                color: theme.statusText,
                fontWeight: 900,
                fontSize: 11,
                letterSpacing: 0.7,
                textTransform: "uppercase",
                boxShadow: `0 8px 18px ${theme.surfaceGlow}`,
              }}
            >
              {product.status}
            </div>
          </div>

          <div
            style={{
              position: "relative",
              height: isMobile ? 180 : isTablet ? 190 : 210,
              borderRadius: 18,
              overflow: "hidden",
              border: `1px solid ${theme.border}`,
              boxShadow:
                "0 14px 30px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.05)",
              background: "#0A1422",
              marginBottom: 16,
            }}
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              style={{ objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `
                  linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.34)),
                  radial-gradient(circle at top left, ${theme.spotlight}, transparent 32%)
                `,
              }}
            />
          </div>

          <h3
            style={{
              fontSize: productTitleSize,
              lineHeight: 0.98,
              letterSpacing: -1,
              marginTop: 0,
              marginBottom: 10,
            }}
          >
            {product.name}
          </h3>

          <p
            style={{
              color: "#D4DDEA",
              lineHeight: 1.52,
              fontSize: isMobile ? 14 : 15,
              marginTop: 0,
              marginBottom: 14,
              minHeight: isMobile ? "auto" : 76,
            }}
          >
            {product.description}
          </p>

          <div
            style={{
              display: "grid",
              gap: 8,
              marginBottom: 16,
            }}
          >
            {product.bullets.map((item) => (
              <div
                key={item}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 12,
                  border: `1px solid ${theme.border}`,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
                  padding: "11px 12px 11px 16px",
                  color: "#EEF3F9",
                  fontWeight: 800,
                  fontSize: 13,
                  boxShadow:
                    "0 8px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.06)",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    background: theme.primary,
                    boxShadow: `0 0 14px ${theme.heroGlow}`,
                  }}
                />
                {item}
              </div>
            ))}
          </div>

          <div style={{ marginTop: "auto" }}>
            {product.disabled ? (
              <div
                style={{
                  display: "inline-block",
                  padding: "12px 18px",
                  borderRadius: 14,
                  border: `1px solid ${theme.border}`,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                  color: "#9FB0C6",
                  fontWeight: 900,
                  fontSize: 14,
                  opacity: 0.7,
                  cursor: "not-allowed",
                }}
              >
                {buttonLabel}
              </div>
            ) : (
              <Link
                href={product.href ?? "#"}
                style={{
                  display: "inline-block",
                  textDecoration: "none",
                  padding: "12px 18px",
                  borderRadius: 14,
                  background: theme.button,
                  color: theme.buttonText,
                  fontWeight: 900,
                  fontSize: 14,
                  boxShadow: `0 14px 28px ${theme.heroGlow}`,
                  transition: "all 0.2s ease",
                }}
              >
                {buttonLabel}
              </Link>
            )}
          </div>
        </div>
      </article>
    );
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        color: "white",
        background: `
          radial-gradient(circle at 0% 0%, rgba(24,211,164,0.12), transparent 24%),
          radial-gradient(circle at 100% 0%, rgba(125,123,255,0.10), transparent 22%),
          radial-gradient(circle at 80% 100%, rgba(255,138,31,0.10), transparent 30%),
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
            borderRadius: 26,
            border: "1px solid rgba(255,255,255,0.10)",
            background:
              "linear-gradient(140deg, rgba(8,22,38,0.96) 0%, rgba(5,15,28,0.98) 52%, rgba(5,11,20,1) 100%)",
            boxShadow: "0 22px 60px rgba(0,0,0,0.24)",
            padding: heroPadding,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `
                radial-gradient(circle at 10% 14%, rgba(24,211,164,0.20), transparent 26%),
                radial-gradient(circle at 76% 12%, rgba(125,123,255,0.16), transparent 24%),
                radial-gradient(circle at 72% 84%, rgba(255,138,31,0.14), transparent 30%),
                linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0))
              `,
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: heroGridColumns,
              gap: isMobile ? 14 : 18,
              alignItems: "stretch",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 10px",
                  borderRadius: 999,
                  marginBottom: 14,
                  background:
                    "linear-gradient(180deg, rgba(125,123,255,0.20), rgba(125,123,255,0.12))",
                  border: "1px solid rgba(165,164,255,0.26)",
                  color: "#BCBAFF",
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: 0.9,
                  textTransform: "uppercase",
                  boxShadow: "0 8px 18px rgba(125,123,255,0.10)",
                }}
              >
                Subscription-ready evidence infrastructure
              </div>

              <h1
                style={{
                  fontSize: heroHeadingSize,
                  lineHeight: 0.95,
                  letterSpacing: isMobile ? -1.2 : -2.1,
                  margin: 0,
                  maxWidth: 760,
                  textShadow: "0 12px 28px rgba(0,0,0,0.16)",
                }}
              >
                One PROOF platform.
                <br />
                Multiple professional products.
              </h1>

              <p
                style={{
                  fontSize: heroTextSize,
                  lineHeight: 1.52,
                  color: "#C3CEDD",
                  maxWidth: 720,
                  marginTop: 16,
                  marginBottom: 0,
                }}
              >
                Designed for real-world operations across vehicles, fleets,
                properties, shops, towing, and incident reporting.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginTop: 20,
                }}
              >
                <Link
                  href="/towproof"
                  style={{
                    textDecoration: "none",
                    padding: "12px 18px",
                    borderRadius: 12,
                    background: "linear-gradient(180deg, #24E1B4, #18D3A4)",
                    color: "#041017",
                    fontWeight: 900,
                    fontSize: 14,
                    boxShadow:
                      "0 14px 28px rgba(24,211,164,0.22), inset 0 1px 0 rgba(255,255,255,0.24)",
                  }}
                >
                  Explore the product family
                </Link>

                <Link
                  href="/towproof"
                  style={{
                    textDecoration: "none",
                    padding: "12px 18px",
                    borderRadius: 12,
                    border: "1px solid rgba(250,204,21,0.22)",
                    background:
                      "linear-gradient(180deg, rgba(250,204,21,0.16), rgba(250,204,21,0.08))",
                    color: "#FDE68A",
                    fontWeight: 900,
                    fontSize: 14,
                    boxShadow:
                      "0 10px 22px rgba(250,204,21,0.10), inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                >
                  Open TowPROOF Preview
                </Link>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: statsGridColumns,
                  gap: 10,
                  marginTop: 20,
                }}
              >
                {[
                  {
                    label: "Core model",
                    value: "Asset → Inspection → Record",
                  },
                  {
                    label: "Current focus",
                    value: "Shop + Tow + Serv",
                  },
                  {
                    label: "Platform direction",
                    value: "Live systems + preview builds",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      borderRadius: 15,
                      border: "1px solid rgba(255,255,255,0.10)",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
                      padding: "13px 13px",
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
                        fontSize: isMobile ? 14 : 15,
                        lineHeight: 1.4,
                        color: "#F3F6FB",
                        fontWeight: 800,
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                position: "relative",
                minHeight: heroImageMinHeight,
                borderRadius: 22,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow:
                  "0 20px 50px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.05)",
                background: "#081221",
              }}
            >
              <Image
                src="/images/proof-platform.png"
                alt="PROOF Platform documentation engine"
                fill
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
                priority
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `
                    linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.48)),
                    radial-gradient(circle at 18% 18%, rgba(24,211,164,0.16), transparent 28%),
                    radial-gradient(circle at 82% 16%, rgba(125,123,255,0.12), transparent 24%),
                    radial-gradient(circle at 78% 82%, rgba(255,138,31,0.12), transparent 26%)
                  `,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 14,
                  right: 14,
                  bottom: 14,
                  display: "grid",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    borderRadius: 15,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(7,14,24,0.70)",
                    backdropFilter: "blur(10px)",
                    padding: "12px 14px",
                    boxShadow:
                      "0 10px 22px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    style={{
                      color: "#A5A4FF",
                      fontSize: 10,
                      fontWeight: 900,
                      letterSpacing: 0.9,
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}
                  >
                    Platform positioning
                  </div>
                  <div
                    style={{
                      color: "#F2F6FB",
                      fontSize: isMobile ? 15 : 17,
                      lineHeight: 1.35,
                      fontWeight: 800,
                    }}
                  >
                    Documentation infrastructure designed to look like a real
                    product family, not a one-off app.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              marginBottom: 12,
              flexWrap: "wrap",
            }}
          >
            <h2
              style={{
                fontSize: sectionTitleSize,
                letterSpacing: -0.8,
                margin: 0,
              }}
            >
              The problem
            </h2>

            <div
              style={{
                color: "#B8C3D1",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              Why PROOF exists
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: problemGridColumns,
              gap: 12,
            }}
          >
            {[
              {
                title: "Camera roll chaos",
                text: "Inspection photos buried in personal phone galleries.",
              },
              {
                title: "Disputes become opinion",
                text: "Without structured records, damage becomes he-said/she-said.",
              },
              {
                title: "No operational memory",
                text: "Teams lose history because documentation was never organized.",
              },
            ].map((item) => (
              <article
                key={item.title}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 20,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                  boxShadow: "0 16px 38px rgba(0,0,0,0.16)",
                  padding: 18,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 4,
                    borderRadius: 999,
                    background: "linear-gradient(180deg,#18D3A4,#24E1B4)",
                    marginBottom: 12,
                    boxShadow: "0 0 14px rgba(24,211,164,0.32)",
                  }}
                />

                <h3
                  style={{
                    fontSize: isMobile ? 19 : 21,
                    letterSpacing: -0.5,
                    marginTop: 0,
                    marginBottom: 8,
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    margin: 0,
                    fontSize: 15,
                    lineHeight: 1.55,
                    color: "#C5CFDB",
                  }}
                >
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          style={{
            marginBottom: 22,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              marginBottom: 12,
              flexWrap: "wrap",
            }}
          >
            <h2
              style={{
                fontSize: sectionTitleSize,
                letterSpacing: -0.8,
                margin: 0,
              }}
            >
              The PROOF engine
            </h2>

            <div
              style={{
                color: "#B8C3D1",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              Shared structure behind current and future tools
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: engineGridColumns,
              gap: 12,
            }}
          >
            {engineCards.map((item) => (
              <article
                key={item.title}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 20,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                  boxShadow: "0 16px 38px rgba(0,0,0,0.16)",
                  padding: 18,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 4,
                    borderRadius: 999,
                    background: item.accent,
                    marginBottom: 12,
                    boxShadow: `0 0 14px ${item.accent}55`,
                  }}
                />

                <h3
                  style={{
                    fontSize: isMobile ? 19 : 21,
                    letterSpacing: -0.5,
                    marginTop: 0,
                    marginBottom: 8,
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    margin: 0,
                    fontSize: 15,
                    lineHeight: 1.55,
                    color: "#C5CFDB",
                  }}
                >
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          style={{
            marginBottom: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              marginBottom: 12,
              flexWrap: "wrap",
            }}
          >
            <h2
              style={{
                fontSize: sectionTitleSize,
                letterSpacing: -0.8,
                margin: 0,
              }}
            >
              Available now
            </h2>

            <div
              style={{
                color: "#B8C3D1",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              Current focus products
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: availableGridColumns,
              gap: 12,
              alignItems: "stretch",
            }}
          >
            {availableProducts.map(renderProductCard)}
          </div>
        </section>

        <section
          style={{
            marginBottom: 20,
          }}
        >
          <p
            style={{
              marginTop: 0,
              marginBottom: 14,
              color: "#B9C4D3",
              fontSize: isMobile ? 14 : 15,
              lineHeight: 1.55,
            }}
          >
            Next divisions planned for the PROOF ecosystem.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: comingSoonGridColumns,
              gap: 12,
              alignItems: "stretch",
            }}
          >
            {comingSoonProducts.map(renderProductCard)}
          </div>
        </section>
      </div>
    </main>
  );
}