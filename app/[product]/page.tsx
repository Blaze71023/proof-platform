import Link from "next/link";
import Image from "next/image";
import { getProductConfig } from "@/lib/products/registry";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    product: string;
  }>;
};

const heroImageMap: Record<string, string> = {
  driveproof: "/images/driveproof-inspection.png",
  fleetproof: "/images/fleetproof-inspection.png",
  rentproof: "/images/rentproof-property.jpeg",
};

const detailImageMap: Record<string, string> = {
  driveproof: "/images/driveproof-damage.jpg",
  fleetproof: "/images/fleetproof-equipment.jpg",
  rentproof: "/images/rentproof-1.jpg",
};

function getHeroEyebrow(product: string) {
  switch (product) {
    case "driveproof":
      return "Vehicle evidence platform";
    case "fleetproof":
      return "Fleet and equipment accountability";
    case "rentproof":
      return "Property turnover documentation";
    default:
      return "PROOF product";
  }
}

function getHeroDescription(product: string) {
  switch (product) {
    case "driveproof":
      return "Structured inspections, time-stamped photo evidence, pickup and dropoff documentation, and claims-ready records built for rentals, dealers, and shared vehicles.";
    case "fleetproof":
      return "Industrial workflows for heavy equipment, machine assignments, pre-trip inspections, service awareness, and operational accountability in the field.";
    case "rentproof":
      return "Premium turnover documentation for stays, guest incident capture, property condition records, and hospitality-grade workflows that feel commercially ready.";
    default:
      return "Professional documentation workflows built on the shared PROOF engine.";
  }
}

function getStatCards(product: string) {
  switch (product) {
    case "driveproof":
      return [
        { label: "Inspection flow", value: "Pickup → Dropoff" },
        { label: "Core asset", value: "Vehicle" },
        { label: "Primary issue", value: "Damage" },
      ];
    case "fleetproof":
      return [
        { label: "Inspection flow", value: "Pre-Trip → Post-Trip" },
        { label: "Core asset", value: "Equipment" },
        { label: "Primary issue", value: "Maintenance Item" },
      ];
    case "rentproof":
      return [
        { label: "Inspection flow", value: "Check-In → Check-Out" },
        { label: "Core asset", value: "Property" },
        { label: "Primary issue", value: "Incident" },
      ];
    default:
      return [
        { label: "Inspection flow", value: "Workflow" },
        { label: "Core asset", value: "Asset" },
        { label: "Primary issue", value: "Issue" },
      ];
  }
}

function getFeatureCards(product: string) {
  switch (product) {
    case "driveproof":
      return [
        {
          title: "Trip-ready inspections",
          text: "A polished, repeatable flow for before-and-after condition capture with real visual evidence and product-grade credibility.",
        },
        {
          title: "Claims defense",
          text: "Photos, timestamps, and structured records designed to support reimbursement, dispute handling, and host protection.",
        },
        {
          title: "Professional host workflows",
          text: "Built to look and feel serious enough for real customer-facing use, free trials, and paid subscriptions.",
        },
      ];
    case "fleetproof":
      return [
        {
          title: "Industrial accountability",
          text: "Purpose-built for operations where equipment condition, availability, and responsibility directly affect revenue and downtime.",
        },
        {
          title: "Field inspection discipline",
          text: "Pre-trip, post-trip, and service-focused workflows that feel native to the way operators and crews actually work.",
        },
        {
          title: "Operational visibility",
          text: "A command-surface experience for machine readiness, maintenance items, downtime flags, and equipment status.",
        },
      ];
    case "rentproof":
      return [
        {
          title: "Property turnover confidence",
          text: "A calm, premium product experience for documenting conditions before and after every guest stay.",
        },
        {
          title: "Guest incident clarity",
          text: "Capture missing items, damage, and turnover exceptions with stronger records and more professional presentation.",
        },
        {
          title: "Hospitality-grade polish",
          text: "Designed to feel trustworthy and productized enough for hosts, property managers, teams, and paid memberships.",
        },
      ];
    default:
      return [
        {
          title: "Professional workflows",
          text: "Built for serious operations.",
        },
      ];
  }
}

export default async function ProductPage({ params }: Props) {
  const { product } = await params;

  try {
    const config = getProductConfig(product);
    const statCards = getStatCards(product);
    const featureCards = getFeatureCards(product);

    return (
      <main
        style={{
          padding: "28px 24px 56px",
        }}
      >
        <div
          style={{
            maxWidth: 1440,
            margin: "0 auto",
          }}
        >
          <section
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 34,
              border: `1px solid ${config.theme.border}`,
              background: config.theme.heroGradient,
              boxShadow: `0 28px 90px ${config.theme.heroGlow}`,
              padding: "38px 36px",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `
                  radial-gradient(circle at 8% 14%, ${config.theme.spotlight}, transparent 24%),
                  radial-gradient(circle at 82% 16%, ${config.theme.softTint}, transparent 26%),
                  linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0))
                `,
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "1.08fr 0.92fr",
                gap: 24,
                alignItems: "stretch",
              }}
            >
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    borderRadius: 999,
                    border: `1px solid ${config.theme.border}`,
                    background: "rgba(255,255,255,0.04)",
                    color: config.theme.primary,
                    fontWeight: 900,
                    marginBottom: 18,
                    boxShadow: `0 16px 40px ${config.theme.surfaceGlow}`,
                  }}
                >
                  {config.name}
                </div>

                <div
                  style={{
                    color: config.theme.accent,
                    fontSize: 13,
                    fontWeight: 900,
                    letterSpacing: 1.8,
                    textTransform: "uppercase",
                    marginBottom: 14,
                  }}
                >
                  {getHeroEyebrow(product)}
                </div>

                <h1
                  style={{
                    fontSize: 76,
                    lineHeight: 0.96,
                    letterSpacing: -2.8,
                    margin: 0,
                    marginBottom: 16,
                    textShadow: "0 12px 40px rgba(0,0,0,0.22)",
                  }}
                >
                  {config.name}
                </h1>

                <p
                  style={{
                    fontSize: 28,
                    lineHeight: 1.35,
                    color: "#E8EDF4",
                    maxWidth: 860,
                    marginTop: 0,
                    marginBottom: 14,
                  }}
                >
                  {config.tagline}
                </p>

                <p
                  style={{
                    fontSize: 18,
                    lineHeight: 1.7,
                    color: "#BCC6D5",
                    maxWidth: 860,
                    marginTop: 0,
                    marginBottom: 0,
                  }}
                >
                  {getHeroDescription(product)}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    flexWrap: "wrap",
                    marginTop: 26,
                  }}
                >
                  <Link
                    href={`/${product}/assets`}
                    style={{
                      textDecoration: "none",
                      padding: "15px 22px",
                      borderRadius: 14,
                      background: config.theme.primary,
                      color: "#061018",
                      fontWeight: 900,
                      boxShadow: `0 18px 40px ${config.theme.heroGlow}`,
                    }}
                  >
                    View {config.labels.assetPlural}
                  </Link>

                  <div
                    style={{
                      padding: "15px 20px",
                      borderRadius: 14,
                      border: `1px solid ${config.theme.border}`,
                      background: "rgba(255,255,255,0.04)",
                      color: "#EDF2F8",
                      fontWeight: 800,
                    }}
                  >
                    Ready for trials and subscriptions
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    position: "relative",
                    minHeight: 290,
                    borderRadius: 24,
                    overflow: "hidden",
                    border: `1px solid ${config.theme.border}`,
                    boxShadow: `0 20px 50px ${config.theme.surfaceGlow}`,
                    background: "#0A1422",
                  }}
                >
                  <Image
                    src={heroImageMap[product]}
                    alt={`${config.name} hero`}
                    fill
                    style={{ objectFit: "cover" }}
                    priority
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `
                        linear-gradient(180deg, rgba(0,0,0,0.03), rgba(0,0,0,0.44)),
                        radial-gradient(circle at top left, ${config.theme.spotlight}, transparent 30%)
                      `,
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: 12,
                  }}
                >
                  {statCards.map((card) => (
                    <div
                      key={card.label}
                      style={{
                        borderRadius: 18,
                        border: `1px solid ${config.theme.border}`,
                        background: "rgba(255,255,255,0.04)",
                        padding: "16px 18px",
                        boxShadow: `0 16px 40px ${config.theme.surfaceGlow}`,
                      }}
                    >
                      <div
                        style={{
                          color: "#9CA3AF",
                          fontSize: 12,
                          textTransform: "uppercase",
                          letterSpacing: 1,
                          marginBottom: 8,
                        }}
                      >
                        {card.label}
                      </div>
                      <div
                        style={{
                          fontSize: 28,
                          fontWeight: 900,
                          letterSpacing: -0.8,
                        }}
                      >
                        {card.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "1.04fr 0.96fr",
              gap: 20,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                position: "relative",
                minHeight: 360,
                borderRadius: 28,
                overflow: "hidden",
                border: `1px solid ${config.theme.border}`,
                boxShadow: `0 24px 60px ${config.theme.surfaceGlow}`,
                background: "#0A1422",
              }}
            >
              <Image
                src={detailImageMap[product]}
                alt={`${config.name} detail`}
                fill
                style={{ objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `
                    linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.48)),
                    radial-gradient(circle at 14% 16%, ${config.theme.spotlight}, transparent 30%)
                  `,
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gap: 18,
              }}
            >
              {featureCards.map((item) => (
                <article
                  key={item.title}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 24,
                    border: `1px solid ${config.theme.border}`,
                    background: `linear-gradient(180deg, ${config.theme.softTint}, rgba(255,255,255,0.02))`,
                    boxShadow: `0 20px 56px ${config.theme.surfaceGlow}`,
                    padding: 24,
                  }}
                >
                  <div
                    style={{
                      width: 74,
                      height: 4,
                      borderRadius: 999,
                      background: config.theme.primary,
                      marginBottom: 18,
                      boxShadow: `0 0 20px ${config.theme.heroGlow}`,
                    }}
                  />
                  <h2
                    style={{
                      fontSize: 28,
                      lineHeight: 1.08,
                      letterSpacing: -0.8,
                      marginTop: 0,
                      marginBottom: 10,
                    }}
                  >
                    {item.title}
                  </h2>
                  <p
                    style={{
                      color: "#BBC5D4",
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
              marginBottom: 24,
            }}
          >
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
                Dashboard surface
              </h2>

              <div
                style={{
                  color: config.theme.accent,
                  fontWeight: 800,
                }}
              >
                Shared engine · division-grade presentation
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 18,
              }}
            >
              {config.dashboardCards.map((card) => (
                <div
                  key={card.id}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 24,
                    border: `1px solid ${config.theme.border}`,
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))",
                    boxShadow: `0 22px 60px ${config.theme.surfaceGlow}`,
                    padding: 24,
                    minHeight: 184,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `radial-gradient(circle at top left, ${config.theme.softTint}, transparent 36%)`,
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    style={{
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        color: "#A7B0BE",
                        fontSize: 14,
                        marginBottom: 28,
                      }}
                    >
                      {card.title}
                    </div>

                    <div
                      style={{
                        fontSize: 40,
                        fontWeight: 900,
                        letterSpacing: -1.2,
                        color: config.theme.primaryForeground,
                      }}
                    >
                      --
                    </div>

                    <div
                      style={{
                        marginTop: 18,
                        height: 5,
                        width: 90,
                        borderRadius: 999,
                        background: config.theme.primary,
                        boxShadow: `0 0 22px ${config.theme.heroGlow}`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
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
                {config.labels.inspection} templates
              </h2>

              <div
                style={{
                  color: "#A7B0BE",
                  fontWeight: 700,
                }}
              >
                Product-specific workflows
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 18,
              }}
            >
              {config.templates.map((template) => (
                <article
                  key={template.id}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 24,
                    border: `1px solid ${config.theme.border}`,
                    background: `linear-gradient(180deg, ${config.theme.softTint}, rgba(255,255,255,0.02))`,
                    boxShadow: `0 20px 56px ${config.theme.surfaceGlow}`,
                    padding: 24,
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      padding: "8px 12px",
                      borderRadius: 999,
                      border: `1px solid ${config.theme.border}`,
                      background: "rgba(255,255,255,0.04)",
                      color: config.theme.accent,
                      fontWeight: 900,
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                      marginBottom: 16,
                    }}
                  >
                    Template
                  </div>

                  <h3
                    style={{
                      fontSize: 34,
                      lineHeight: 1.02,
                      letterSpacing: -1,
                      marginTop: 0,
                      marginBottom: 12,
                    }}
                  >
                    {template.name}
                  </h3>

                  <p
                    style={{
                      color: "#BBC5D4",
                      fontSize: 17,
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {template.description}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    );
  } catch {
    notFound();
  }
}
