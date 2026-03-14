import Link from "next/link";
import Image from "next/image";
import { getProductConfig } from "@/lib/products/registry";

const liveProducts = [
  getProductConfig("driveproof"),
  getProductConfig("fleetproof"),
  getProductConfig("rentproof"),
] as const;

const liveProductImageMap: Record<string, string> = {
  driveproof: "/images/driveproof-inspection.png",
  fleetproof: "/images/fleetproof-equipment.jpg",
  rentproof: "/images/rentproof-property.jpeg",
};

const liveProductDescriptions: Record<string, string> = {
  driveproof:
    "Professional vehicle documentation for pickups, dropoffs, damage capture, guest accountability, and dispute-ready records.",
  fleetproof:
    "Industrial inspection workflows for equipment, assignments, maintenance visibility, service discipline, and operational accountability.",
  rentproof:
    "Premium property turnover documentation for stays, guest incidents, room condition capture, and hospitality-grade records.",
};

const liveProductBullets: Record<string, string[]> = {
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

const comingSoonProducts = [
  {
    name: "TowPROOF",
    color: "#FACC15",
    glow: "rgba(250,204,21,0.18)",
    border: "rgba(250,204,21,0.24)",
    description:
      "Built for tow operators, hot shot services, impounds, transport records, and condition-photo evidence that should not live forever in personal camera rolls.",
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
      "Built for accident-scene capture, exchanged driver information, incident records, and the first layer of truth before the story starts changing.",
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
      "Built for repair shops, service intake, before-and-after condition capture, repair-progress visibility, and customer-vehicle accountability.",
    bullets: [
      "Service intake documentation",
      "Before and after repair photos",
      "Featuring ClaimPROOF reporting",
    ],
  },
];

export default function HomePage() {
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
          maxWidth: 1460,
          margin: "0 auto",
          padding: "28px 24px 64px",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "11px 18px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.12)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
              boxShadow:
                "0 14px 34px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)",
              fontWeight: 900,
              letterSpacing: 0.4,
            }}
          >
            PROOF Platform
          </div>

          <nav
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {liveProducts.map((product) => (
              <Link
                key={product.key}
                href={`/${product.key}`}
                style={{
                  textDecoration: "none",
                  color: "#E7EDF6",
                  padding: "11px 16px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                  fontWeight: 800,
                  boxShadow:
                    "0 10px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
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
            borderRadius: 34,
            border: "1px solid rgba(255,255,255,0.10)",
            background:
              "linear-gradient(140deg, rgba(8,22,38,0.96) 0%, rgba(5,15,28,0.98) 52%, rgba(5,11,20,1) 100%)",
            boxShadow: "0 30px 90px rgba(0,0,0,0.26)",
            padding: "40px 40px 36px",
            marginBottom: 30,
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
              gridTemplateColumns: "1.12fr 0.88fr",
              gap: 26,
              alignItems: "stretch",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  borderRadius: 999,
                  marginBottom: 18,
                  background:
                    "linear-gradient(180deg, rgba(125,123,255,0.20), rgba(125,123,255,0.12))",
                  border: "1px solid rgba(165,164,255,0.26)",
                  color: "#BCBAFF",
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  boxShadow: "0 10px 24px rgba(125,123,255,0.10)",
                }}
              >
                Subscription-ready evidence infrastructure
              </div>

              <h1
                style={{
                  fontSize: 76,
                  lineHeight: 0.95,
                  letterSpacing: -2.8,
                  margin: 0,
                  maxWidth: 860,
                  textShadow: "0 16px 40px rgba(0,0,0,0.18)",
                }}
              >
                One PROOF platform.
                <br />
                Multiple professional products.
              </h1>

              <p
                style={{
                  fontSize: 23,
                  lineHeight: 1.58,
                  color: "#C3CEDD",
                  maxWidth: 820,
                  marginTop: 22,
                  marginBottom: 0,
                }}
              >
                Built to support free trials, memberships, subscriptions, and
                real operational workflows across vehicles, fleets, properties,
                shops, towing, and incident documentation.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 14,
                  flexWrap: "wrap",
                  marginTop: 28,
                }}
              >
                <Link
                  href="/driveproof"
                  style={{
                    textDecoration: "none",
                    padding: "15px 22px",
                    borderRadius: 14,
                    background: "linear-gradient(180deg, #24E1B4, #18D3A4)",
                    color: "#041017",
                    fontWeight: 900,
                    boxShadow:
                      "0 18px 40px rgba(24,211,164,0.24), inset 0 1px 0 rgba(255,255,255,0.28)",
                  }}
                >
                  Explore the product family
                </Link>

                <div
                  style={{
                    padding: "15px 20px",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))",
                    color: "#EFF4FA",
                    fontWeight: 800,
                    boxShadow:
                      "0 12px 28px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.08)",
                  }}
                >
                  Built for paid memberships and trials
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 14,
                  marginTop: 28,
                }}
              >
                {[
                  {
                    label: "Core model",
                    value: "Asset → Event → Inspection",
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
                      borderRadius: 18,
                      border: "1px solid rgba(255,255,255,0.10)",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
                      padding: "16px 16px",
                      boxShadow:
                        "0 12px 30px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
                    }}
                  >
                    <div
                      style={{
                        color: "#9CA3AF",
                        fontSize: 12,
                        fontWeight: 900,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        lineHeight: 1.45,
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
                minHeight: 560,
                borderRadius: 28,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow:
                  "0 30px 80px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06)",
                background: "#0A1422",
              }}
            >
              <Image
                src="/images/proof-hero.png"
                alt="PROOF platform hero"
                fill
                style={{
                  objectFit: "cover",
                }}
                priority
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `
                    linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.58)),
                    radial-gradient(circle at 15% 15%, rgba(24,211,164,0.18), transparent 28%),
                    radial-gradient(circle at 85% 15%, rgba(255,138,31,0.16), transparent 24%),
                    radial-gradient(circle at 70% 80%, rgba(125,123,255,0.18), transparent 28%)
                  `,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 20,
                  right: 20,
                  bottom: 20,
                  display: "grid",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    borderRadius: 18,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(7,14,24,0.66)",
                    backdropFilter: "blur(10px)",
                    padding: "16px 18px",
                    boxShadow:
                      "0 14px 34px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    style={{
                      color: "#A5A4FF",
                      fontSize: 12,
                      fontWeight: 900,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    Platform positioning
                  </div>
                  <div
                    style={{
                      color: "#F2F6FB",
                      fontSize: 21,
                      lineHeight: 1.4,
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
            marginBottom: 30,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 18,
              flexWrap: "wrap",
            }}
          >
            <h2
              style={{
                fontSize: 34,
                letterSpacing: -1,
                margin: 0,
              }}
            >
              The problem
            </h2>

            <div
              style={{
                color: "#B8C3D1",
                fontWeight: 700,
              }}
            >
              Documentation today is chaotic
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 18,
            }}
          >
            {[
              {
                title: "Camera roll chaos",
                text: "Critical inspection photos end up buried inside personal phone galleries mixed with family photos and everyday images.",
              },
              {
                title: "Disputes become opinion",
                text: 'Without structured evidence records, damage, incidents, and conditions quickly become "he said / she said" arguments.',
              },
              {
                title: "No operational memory",
                text: "Teams lose the history of vehicles, equipment, and properties because documentation was never organized properly.",
              },
            ].map((item) => (
              <article
                key={item.title}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 26,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                  boxShadow: "0 22px 60px rgba(0,0,0,0.18)",
                  padding: 24,
                }}
              >
                <div
                  style={{
                    width: 70,
                    height: 4,
                    borderRadius: 999,
                    background: "linear-gradient(180deg,#18D3A4,#24E1B4)",
                    marginBottom: 16,
                    boxShadow: "0 0 18px rgba(24,211,164,0.35)",
                  }}
                />

                <h3
                  style={{
                    fontSize: 28,
                    lineHeight: 1.05,
                    letterSpacing: -0.8,
                    marginTop: 0,
                    marginBottom: 10,
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    color: "#C5CFDB",
                    fontSize: 17,
                    lineHeight: 1.7,
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
            marginBottom: 34,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 18,
              flexWrap: "wrap",
            }}
          >
            <h2
              style={{
                fontSize: 34,
                letterSpacing: -1,
                margin: 0,
              }}
            >
              The PROOF engine
            </h2>

            <div
              style={{
                color: "#B8C3D1",
                fontWeight: 700,
              }}
            >
              One system powering every product
            </div>
          </div>

          <div
            style={{
              borderRadius: 30,
              border: "1px solid rgba(255,255,255,0.10)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
              boxShadow: "0 28px 80px rgba(0,0,0,0.20)",
              padding: 32,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, minmax(0,1fr))",
                gap: 18,
              }}
            >
              {[
                {
                  title: "Asset",
                  text: "A vehicle, machine, property, or object being documented.",
                },
                {
                  title: "Event",
                  text: "A trip, rental, assignment, stay, tow, service, or incident moment.",
                },
                {
                  title: "Inspection",
                  text: "Structured documentation capturing the condition at that moment.",
                },
                {
                  title: "Evidence",
                  text: "Photos, notes, and supporting media tied to the inspection.",
                },
                {
                  title: "Permanent Record",
                  text: "A time-ordered history stored safely outside personal phones.",
                },
              ].map((item, index) => (
                <div
                  key={item.title}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 22,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
                    padding: 22,
                    boxShadow:
                      "0 18px 46px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 4,
                      borderRadius: 999,
                      background:
                        index === 0
                          ? "#18D3A4"
                          : index === 1
                          ? "#7D7BFF"
                          : index === 2
                          ? "#FF8A1F"
                          : index === 3
                          ? "#FACC15"
                          : "#EF4444",
                      marginBottom: 14,
                    }}
                  />

                  <h3
                    style={{
                      fontSize: 24,
                      marginTop: 0,
                      marginBottom: 10,
                      letterSpacing: -0.6,
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    style={{
                      fontSize: 16,
                      color: "#C5CFDB",
                      lineHeight: 1.65,
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

        <section style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <h2
              style={{
                fontSize: 34,
                letterSpacing: -1,
                margin: 0,
              }}
            >
              Available now
            </h2>

            <div
              style={{
                color: "#B8C3D1",
                fontWeight: 700,
              }}
            >
              Live products in the PROOF family
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 18,
            }}
          >
            {liveProducts.map((product) => (
              <article
                key={product.key}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 28,
                  border: `1px solid ${product.theme.border}`,
                  background: product.theme.heroGradient,
                  boxShadow: `0 24px 70px ${product.theme.surfaceGlow}`,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `
                      radial-gradient(circle at top left, ${product.theme.spotlight}, transparent 28%),
                      linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0))
                    `,
                    pointerEvents: "none",
                  }}
                />

                <div style={{ position: "relative", padding: 22 }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "8px 12px",
                      borderRadius: 999,
                      marginBottom: 18,
                      border: `1px solid ${product.theme.border}`,
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05))",
                      color: product.theme.primary,
                      fontWeight: 900,
                      boxShadow: `0 10px 24px ${product.theme.surfaceGlow}`,
                    }}
                  >
                    {product.name}
                  </div>

                  <div
                    style={{
                      position: "relative",
                      height: 220,
                      borderRadius: 18,
                      overflow: "hidden",
                      border: `1px solid ${product.theme.border}`,
                      marginBottom: 18,
                      boxShadow:
                        "0 16px 40px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.05)",
                      background: "#0A1422",
                    }}
                  >
                    <Image
                      src={liveProductImageMap[product.key]}
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
                          radial-gradient(circle at top left, ${product.theme.spotlight}, transparent 30%)
                        `,
                      }}
                    />
                  </div>

                  <h3
                    style={{
                      fontSize: 44,
                      lineHeight: 1,
                      marginTop: 0,
                      marginBottom: 12,
                      letterSpacing: -1.4,
                    }}
                  >
                    {product.name}
                  </h3>

                  <p
                    style={{
                      color: "#D4DDEA",
                      lineHeight: 1.7,
                      fontSize: 17,
                      minHeight: 92,
                      marginBottom: 18,
                    }}
                  >
                    {liveProductDescriptions[product.key]}
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gap: 12,
                      marginBottom: 20,
                    }}
                  >
                    {liveProductBullets[product.key].map((item) => (
                      <div
                        key={item}
                        style={{
                          position: "relative",
                          overflow: "hidden",
                          borderRadius: 16,
                          border: `1px solid ${product.theme.border}`,
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05))",
                          padding: "14px 16px 14px 20px",
                          color: "#F2F6FB",
                          fontWeight: 800,
                          boxShadow:
                            "0 12px 28px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.08)",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 5,
                            background: product.theme.primary,
                            boxShadow: `0 0 18px ${product.theme.heroGlow}`,
                          }}
                        />
                        {item}
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/${product.key}`}
                    style={{
                      display: "inline-block",
                      textDecoration: "none",
                      padding: "14px 18px",
                      borderRadius: 14,
                      background: product.theme.primary,
                      color: "#081018",
                      fontWeight: 900,
                      boxShadow: `0 18px 36px ${product.theme.heroGlow}`,
                    }}
                  >
                    View {product.name}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 30 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <h2
              style={{
                fontSize: 34,
                letterSpacing: -1,
                margin: 0,
              }}
            >
              Coming soon
            </h2>

            <div
              style={{
                color: "#B8C3D1",
                fontWeight: 700,
              }}
            >
              Next divisions planned for the PROOF ecosystem — featuring
              ClaimPROOF reporting
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 18,
            }}
          >
            {comingSoonProducts.map((product) => (
              <article
                key={product.name}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 28,
                  border: `1px solid ${product.border}`,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                  boxShadow: `0 22px 60px ${product.glow}`,
                  padding: 24,
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
                      gap: 12,
                      marginBottom: 18,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "8px 12px",
                        borderRadius: 999,
                        border: `1px solid ${product.border}`,
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05))",
                        color: product.color,
                        fontWeight: 900,
                        boxShadow: `0 10px 24px ${product.glow}`,
                      }}
                    >
                      {product.name}
                    </div>

                    <div
                      style={{
                        padding: "7px 11px",
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.10)",
                        background: "rgba(255,255,255,0.05)",
                        color: "#F8FAFC",
                        fontSize: 12,
                        fontWeight: 900,
                        letterSpacing: 0.8,
                        textTransform: "uppercase",
                      }}
                    >
                      Coming Soon
                    </div>
                  </div>

                  <h3
                    style={{
                      fontSize: 40,
                      lineHeight: 1,
                      letterSpacing: -1.4,
                      marginTop: 0,
                      marginBottom: 14,
                    }}
                  >
                    {product.name}
                  </h3>

                  <p
                    style={{
                      color: "#D4DDEA",
                      lineHeight: 1.7,
                      fontSize: 17,
                      minHeight: 96,
                      marginBottom: 18,
                    }}
                  >
                    {product.description}
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gap: 12,
                    }}
                  >
                    {product.bullets.map((item) => (
                      <div
                        key={item}
                        style={{
                          position: "relative",
                          overflow: "hidden",
                          borderRadius: 16,
                          border: `1px solid ${product.border}`,
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04))",
                          padding: "14px 16px 14px 20px",
                          color: "#F2F6FB",
                          fontWeight: 800,
                          boxShadow:
                            "0 12px 28px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.08)",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 5,
                            background: product.color,
                            boxShadow: `0 0 18px ${product.glow}`,
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
            borderRadius: 30,
            border: "1px solid rgba(255,255,255,0.10)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
            boxShadow: "0 22px 70px rgba(0,0,0,0.20)",
            padding: 28,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.06fr 0.94fr",
              gap: 22,
              alignItems: "start",
            }}
          >
            <div>
              <div
                style={{
                  color: "#9CA3AF",
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                Final direction
              </div>

              <h2
                style={{
                  fontSize: 42,
                  letterSpacing: -1.4,
                  marginTop: 0,
                  marginBottom: 14,
                }}
              >
                Built as a product ecosystem, not a single feature app.
              </h2>

              <p
                style={{
                  color: "#C2CCD8",
                  fontSize: 18,
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                The platform now shows a credible present-day offering and a
                clear next-wave roadmap, including TowPROOF, IncidentPROOF, and
                ShopPROOF, all featuring ClaimPROOF reporting.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gap: 12,
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
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
                    padding: "16px 16px 16px 20px",
                    fontWeight: 800,
                    color: "#EEF2F7",
                    boxShadow:
                      "0 10px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.07)",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 5,
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
