"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getProductConfig } from "@/lib/products/registry";

const liveProducts = [
  getProductConfig("servproof"),
  getProductConfig("driveproof"),
  getProductConfig("fleetproof"),
  getProductConfig("rentproof"),
].filter(Boolean) as ReturnType<typeof getProductConfig>[];

const liveProductImageMap: Record<string, string> = {
  servproof: "/images/equipment-proof.jpg",
  driveproof: "/images/driveproof-inspection.png",
  fleetproof: "/images/fleetproof-equipment.jpg",
  rentproof: "/images/rentproof-property.jpeg",
};

const productThemeMap: Record<
  string,
  {
    primary: string;
    border: string;
    heroGradient: string;
    surfaceGlow: string;
    spotlight: string;
    heroGlow: string;
  }
> = {
  servproof: {
    primary: "#18D3A4",
    border: "rgba(24,211,164,0.26)",
    heroGradient:
      "linear-gradient(180deg, rgba(24,211,164,0.14), rgba(255,255,255,0.04))",
    surfaceGlow: "rgba(24,211,164,0.16)",
    spotlight: "rgba(24,211,164,0.18)",
    heroGlow: "rgba(24,211,164,0.24)",
  },
  driveproof: {
    primary: "#7D7BFF",
    border: "rgba(125,123,255,0.26)",
    heroGradient:
      "linear-gradient(180deg, rgba(125,123,255,0.14), rgba(255,255,255,0.04))",
    surfaceGlow: "rgba(125,123,255,0.16)",
    spotlight: "rgba(125,123,255,0.18)",
    heroGlow: "rgba(125,123,255,0.24)",
  },
  fleetproof: {
    primary: "#FF8A1F",
    border: "rgba(255,138,31,0.26)",
    heroGradient:
      "linear-gradient(180deg, rgba(255,138,31,0.14), rgba(255,255,255,0.04))",
    surfaceGlow: "rgba(255,138,31,0.16)",
    spotlight: "rgba(255,138,31,0.18)",
    heroGlow: "rgba(255,138,31,0.24)",
  },
  rentproof: {
    primary: "#38BDF8",
    border: "rgba(56,189,248,0.26)",
    heroGradient:
      "linear-gradient(180deg, rgba(56,189,248,0.14), rgba(255,255,255,0.04))",
    surfaceGlow: "rgba(56,189,248,0.16)",
    spotlight: "rgba(56,189,248,0.18)",
    heroGlow: "rgba(56,189,248,0.24)",
  },
};

const liveProductDescriptions: Record<string, string> = {
  servproof:
    "Restaurant equipment service documentation for maintenance issues, failures, repairs, and multi-location accountability.",
  driveproof:
    "Professional vehicle documentation for pickups, dropoffs, damage capture, and guest accountability.",
  fleetproof:
    "Inspection workflows for equipment, assignments, maintenance visibility, and service accountability.",
  rentproof:
    "Premium property documentation for stays, guest incidents, and room condition capture.",
};

const liveProductBullets: Record<string, string[]> = {
  servproof: [
    "Restaurant equipment condition capture",
    "Maintenance and failure reporting",
    "Multi-location service accountability",
  ],
  driveproof: [
    "Vehicle condition capture",
    "Pickup and dropoff inspections",
    "Claims and damage evidence",
  ],
  fleetproof: [
    "Heavy equipment accountability",
    "Pre-trip and service workflows",
    "Downtime and maintenance visibility",
  ],
  rentproof: [
    "Property turnover records",
    "Guest incident documentation",
    "Cleaner and host coordination",
  ],
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

const comingSoonProducts = [
  {
    name: "TowPROOF",
    color: "#FACC15",
    glow: "rgba(250,204,21,0.18)",
    border: "rgba(250,204,21,0.24)",
    description:
      "Designed for tow operators, hot shot services, impounds, transport records, and vehicle condition documentation.",
    bullets: [
      "Tow intake and hookup photos",
      "Vehicle move and destination proof",
      "Featuring ClaimPROOF reporting",
    ],
  },
  {
    name: "IncidentPROOF",
    color: "#EF4444",
    glow: "rgba(239,68,68,0.18)",
    border: "rgba(239,68,68,0.24)",
    description:
      "Accident-scene documentation for driver information, photos, and incident reporting before the story changes.",
    bullets: [
      "Scene photos with time and location context",
      "Driver, insurance, and witness information capture",
      "Featuring ClaimPROOF reporting",
    ],
  },
  {
    name: "ShopPROOF",
    color: "#3B82F6",
    glow: "rgba(59,130,246,0.18)",
    border: "rgba(59,130,246,0.24)",
    description:
      "Repair shop documentation for service intake, before-and-after photos, and customer vehicle accountability.",
    bullets: [
      "Service intake documentation",
      "Before and after repair photos",
      "Featuring ClaimPROOF reporting",
    ],
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
    ? "14px 12px 28px"
    : isTablet
      ? "18px 16px 34px"
      : "20px 18px 40px";

  const heroPadding = isMobile
    ? "18px 14px 16px"
    : isTablet
      ? "22px 18px 18px"
      : "28px 26px 24px";

  const heroGridColumns = isMobile || isTablet ? "1fr" : "1.08fr 0.92fr";
  const heroHeadingSize = isMobile ? 34 : isTablet ? 46 : 60;
  const heroTextSize = isMobile ? 16 : isTablet ? 17 : 19;
  const heroImageMinHeight = isMobile ? 220 : isTablet ? 300 : 420;

  const statsGridColumns = isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))";
  const problemGridColumns = isMobile
    ? "1fr"
    : isTablet
      ? "repeat(2, minmax(0, 1fr))"
      : "repeat(3, minmax(0, 1fr))";
  const engineGridColumns = isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))";
  const liveGridColumns = isMobile
    ? "1fr"
    : isTablet
      ? "repeat(2, minmax(0, 1fr))"
      : "repeat(4, minmax(0, 1fr))";
  const comingSoonGridColumns = isMobile
    ? "1fr"
    : isTablet
      ? "repeat(2, minmax(0, 1fr))"
      : "repeat(3, minmax(0, 1fr))";
  const finalGridColumns = isMobile || isTablet ? "1fr" : "1.06fr 0.94fr";

  const sectionTitleSize = isMobile ? 22 : 28;
  const productTitleSize = isMobile ? 26 : isTablet ? 30 : 34;
  const comingSoonTitleSize = isMobile ? 24 : 30;
  const finalTitleSize = isMobile ? 25 : isTablet ? 30 : 34;

  return (
    <main
      style={{
        minHeight: "100vh",
        color: "white",
        background: `
          radial-gradient(circle at 0% 0%, rgba(24,211,164,0.12), transparent 24%),
          radial-gradient(circle at 100% 0%, rgba(255,138,31,0.12), transparent 24%),
          radial-gradient(circle at 80% 100%, rgba(125,123,255,0.12), transparent 30%),
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
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 14px 8px 10px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.12)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
              boxShadow:
                "0 10px 24px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.08)",
              fontWeight: 900,
              letterSpacing: 0.3,
              fontSize: 14,
            }}
          >
            <div
              style={{
                position: "relative",
                width: 24,
                height: 24,
                borderRadius: 999,
                overflow: "hidden",
                boxShadow: "0 0 16px rgba(24,211,164,0.22)",
                flexShrink: 0,
              }}
            >
              <Image
                src="/images/proof-platform.png"
                alt="PROOF Platform"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
            PROOF Platform
          </div>

          <nav
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {liveProducts.map((product) => (
              <Link
                key={product.id}
                href={`/${product.id}`}
                style={{
                  textDecoration: "none",
                  color: "#E7EDF6",
                  padding: "9px 13px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                  fontWeight: 800,
                  fontSize: 13,
                  boxShadow:
                    "0 8px 18px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.06)",
                }}
              >
                {product.name}
              </Link>
            ))}
          </nav>
        </header>

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
                radial-gradient(circle at 76% 12%, rgba(255,138,31,0.18), transparent 24%),
                radial-gradient(circle at 72% 84%, rgba(125,123,255,0.18), transparent 30%),
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
                  href="/servproof"
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

                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))",
                    color: "#EFF4FA",
                    fontWeight: 800,
                    fontSize: 14,
                    boxShadow:
                      "0 10px 22px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.08)",
                  }}
                >
                  Subscription-ready platform
                </div>
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
                    label: "Commercial use",
                    value: "Trials, subscriptions, onboarding",
                  },
                  {
                    label: "Platform direction",
                    value: "Live + coming soon product family",
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
                    fontSize: isMobile ? 20 : 22,
                    lineHeight: 1.06,
                    letterSpacing: -0.6,
                    marginTop: 0,
                    marginBottom: 8,
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    color: "#C5CFDB",
                    fontSize: isMobile ? 14 : 15,
                    lineHeight: 1.55,
                    margin: 0,
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
              One system powering every product
            </div>
          </div>

          <div
            style={{
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.10)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
              boxShadow: "0 18px 46px rgba(0,0,0,0.18)",
              padding: isMobile ? 14 : 20,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: engineGridColumns,
                gap: 12,
              }}
            >
              {engineCards.map((item) => (
                <div
                  key={item.title}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 18,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
                    padding: 17,
                    boxShadow:
                      "0 12px 30px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 4,
                      borderRadius: 999,
                      background: item.accent,
                      marginBottom: 10,
                    }}
                  />

                  <h3
                    style={{
                      fontSize: isMobile ? 18 : 19,
                      marginTop: 0,
                      marginBottom: 8,
                      letterSpacing: -0.4,
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    style={{
                      fontSize: 14,
                      color: "#C5CFDB",
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 14 }}>
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
              Live product family
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: liveGridColumns,
              gap: 12,
              alignItems: "stretch",
              marginBottom: 14,
            }}
          >
            {liveProducts.map((product) => {
              const theme = productThemeMap[product.id] ?? {
                primary: "#18D3A4",
                border: "rgba(24,211,164,0.26)",
                heroGradient:
                  "linear-gradient(180deg, rgba(24,211,164,0.14), rgba(255,255,255,0.04))",
                surfaceGlow: "rgba(24,211,164,0.16)",
                spotlight: "rgba(24,211,164,0.18)",
                heroGlow: "rgba(24,211,164,0.24)",
              };

              return (
                <article
                  key={product.id}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 20,
                    border: `1px solid ${theme.border}`,
                    background: theme.heroGradient,
                    boxShadow: `0 16px 42px ${theme.surfaceGlow}`,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `
                        radial-gradient(circle at top left, ${theme.spotlight}, transparent 28%),
                        linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0))
                      `,
                      pointerEvents: "none",
                    }}
                  />

                  <div
                    style={{
                      position: "relative",
                      padding: 16,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "6px 10px",
                        borderRadius: 999,
                        marginBottom: 12,
                        border: `1px solid ${theme.border}`,
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05))",
                        color: theme.primary,
                        fontWeight: 900,
                        fontSize: 12,
                        boxShadow: `0 8px 18px ${theme.surfaceGlow}`,
                        alignSelf: "flex-start",
                      }}
                    >
                      {product.name}
                    </div>

                    <div
                      style={{
                        position: "relative",
                        height: isMobile ? 150 : isTablet ? 165 : 170,
                        borderRadius: 14,
                        overflow: "hidden",
                        border: `1px solid ${theme.border}`,
                        marginBottom: 12,
                        boxShadow:
                          "0 12px 28px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.05)",
                        background: "#0A1422",
                      }}
                    >
                      <Image
                        src={liveProductImageMap[product.id]}
                        alt={product.name}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: `
                            linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.42)),
                            radial-gradient(circle at top left, ${theme.spotlight}, transparent 30%)
                          `,
                        }}
                      />
                    </div>

                    <h3
                      style={{
                        fontSize: productTitleSize,
                        lineHeight: 1,
                        marginTop: 0,
                        marginBottom: 9,
                        letterSpacing: -1,
                      }}
                    >
                      {product.name}
                    </h3>

                    <p
                      style={{
                        color: "#D4DDEA",
                        lineHeight: 1.55,
                        fontSize: isMobile ? 14 : 15,
                        marginTop: 0,
                        marginBottom: 12,
                        minHeight: isMobile ? "auto" : 64,
                      }}
                    >
                      {liveProductDescriptions[product.id] ?? product.description}
                    </p>

                    <div
                      style={{
                        display: "grid",
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      {(liveProductBullets[product.id] ?? []).map((item) => (
                        <div
                          key={item}
                          style={{
                            position: "relative",
                            overflow: "hidden",
                            borderRadius: 12,
                            border: `1px solid ${theme.border}`,
                            background:
                              "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05))",
                            padding: "11px 12px 11px 16px",
                            color: "#F2F6FB",
                            fontWeight: 800,
                            fontSize: 13,
                            boxShadow:
                              "0 8px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.08)",
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

                    <Link
                      href={`/${product.id}`}
                      style={{
                        display: "inline-block",
                        textDecoration: "none",
                        padding: "11px 14px",
                        borderRadius: 12,
                        background: theme.primary,
                        color: "#081018",
                        fontWeight: 900,
                        fontSize: 14,
                        boxShadow: `0 12px 24px ${theme.heroGlow}`,
                        alignSelf: "flex-start",
                      }}
                    >
                      View {product.name}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <p
            style={{
              color: "#C2CCD8",
              fontSize: isMobile ? 14 : 15,
              lineHeight: 1.55,
              marginTop: 0,
              marginBottom: 12,
            }}
          >
            Next divisions planned for the PROOF ecosystem — featuring
            ClaimPROOF reporting.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: comingSoonGridColumns,
              gap: 12,
            }}
          >
            {comingSoonProducts.map((product) => (
              <article
                key={product.name}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 20,
                  border: `1px solid ${product.border}`,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                  boxShadow: `0 16px 40px ${product.glow}`,
                  padding: 18,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(circle at top left, ${product.glow}, transparent 32%)`,
                    pointerEvents: "none",
                  }}
                />

                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      marginBottom: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "6px 10px",
                        borderRadius: 999,
                        border: `1px solid ${product.border}`,
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05))",
                        color: product.color,
                        fontWeight: 900,
                        fontSize: 12,
                        boxShadow: `0 8px 18px ${product.glow}`,
                      }}
                    >
                      {product.name}
                    </div>

                    <div
                      style={{
                        padding: "6px 9px",
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.10)",
                        background: "rgba(255,255,255,0.05)",
                        color: "#F8FAFC",
                        fontSize: 10,
                        fontWeight: 900,
                        letterSpacing: 0.7,
                        textTransform: "uppercase",
                      }}
                    >
                      Coming Soon
                    </div>
                  </div>

                  <h3
                    style={{
                      fontSize: comingSoonTitleSize,
                      lineHeight: 1,
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
                      lineHeight: 1.55,
                      fontSize: isMobile ? 14 : 15,
                      minHeight: isMobile ? "auto" : 78,
                      marginBottom: 12,
                    }}
                  >
                    {product.description}
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gap: 8,
                    }}
                  >
                    {product.bullets.map((item) => (
                      <div
                        key={item}
                        style={{
                          position: "relative",
                          overflow: "hidden",
                          borderRadius: 12,
                          border: `1px solid ${product.border}`,
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04))",
                          padding: "11px 12px 11px 16px",
                          color: "#F2F6FB",
                          fontWeight: 800,
                          fontSize: 13,
                          boxShadow:
                            "0 8px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.08)",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 4,
                            background: product.color,
                            boxShadow: `0 0 14px ${product.glow}`,
                          }}
                        />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          style={{
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.10)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
            boxShadow: "0 18px 46px rgba(0,0,0,0.18)",
            padding: isMobile ? 16 : 20,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: finalGridColumns,
              gap: 16,
              alignItems: "start",
            }}
          >
            <div>
              <div
                style={{
                  color: "#9CA3AF",
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Final direction
              </div>

              <h2
                style={{
                  fontSize: finalTitleSize,
                  letterSpacing: -1,
                  marginTop: 0,
                  marginBottom: 10,
                }}
              >
                Built as a product ecosystem, not a single feature app.
              </h2>

              <p
                style={{
                  color: "#C2CCD8",
                  fontSize: isMobile ? 14 : 15,
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                The platform now presents a credible live product family and a
                clear next-wave roadmap including TowPROOF, IncidentPROOF, and
                ShopPROOF.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gap: 8,
              }}
            >
              {[
                "Live products supported by one shared PROOF engine",
                "ClaimPROOF now positioned as a reporting layer across the ecosystem",
                "Ready to continue into trials, pricing, billing, and auth",
              ].map((item, index) => (
                <div
                  key={item}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
                    padding: "12px 12px 12px 16px",
                    fontWeight: 800,
                    fontSize: 13,
                    color: "#EEF2F7",
                    boxShadow:
                      "0 8px 18px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.07)",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      background:
                        index === 0
                          ? "linear-gradient(180deg, #18D3A4, #24E1B4)"
                          : index === 1
                            ? "linear-gradient(180deg, #FACC15, #FDE047)"
                            : "linear-gradient(180deg, #7D7BFF, #A5A4FF)",
                    }}
                  />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}