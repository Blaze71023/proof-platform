"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import {
  ArrowRight,
  Camera,
  CarFront,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Search,
  Shield,
  Wrench,
} from "lucide-react";

const THEME = {
  pageBase:
    "linear-gradient(180deg, #02060B 0%, #030912 16%, #03101B 42%, #020912 72%, #02060B 100%)",
  shell:
    "linear-gradient(180deg, rgba(7,15,25,0.98) 0%, rgba(5,12,20,0.995) 42%, rgba(3,9,15,1) 100%)",
  shellInner:
    "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.012) 16%, rgba(255,255,255,0) 36%)",
  panel:
    "linear-gradient(180deg, rgba(13,24,37,0.98) 0%, rgba(8,16,27,0.99) 48%, rgba(7,13,22,1) 100%)",
  panelTop:
    "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.012) 24%, rgba(255,255,255,0) 56%)",
  panelEdgeGlow:
    "radial-gradient(circle at 50% 0%, rgba(70,130,255,0.08) 0%, rgba(70,130,255,0.03) 28%, rgba(70,130,255,0) 58%)",
  card:
    "linear-gradient(180deg, rgba(19,34,51,0.98) 0%, rgba(14,27,42,0.98) 44%, rgba(10,20,33,1) 100%)",
  cardTop:
    "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.014) 26%, rgba(255,255,255,0) 58%)",
  text: "#F5FAFF",
  textSoft: "#D7E5F0",
  textMuted: "#9CB1C1",
  textDim: "#73889A",
  lineFaint: "rgba(255,255,255,0.032)",
  border: "1px solid rgba(109, 142, 176, 0.24)",
  borderSoft: "1px solid rgba(255,255,255,0.085)",
  shellShadow: "0 34px 90px rgba(0,0,0,0.5)",
  panelShadow: "0 18px 42px rgba(0,0,0,0.24)",
  cardShadow: "0 10px 22px rgba(0,0,0,0.16)",
  blue: "#3B82F6",
  blueSoft: "rgba(59,130,246,0.16)",
  blueLine: "rgba(59,130,246,0.84)",
  emerald: "#27D9BF",
  emeraldSoft: "rgba(39,217,191,0.18)",
  emeraldLine: "rgba(39,217,191,0.84)",
  orange: "#F59E42",
  orangeSoft: "rgba(245,158,66,0.18)",
  orangeLine: "rgba(245,158,66,0.84)",
  buttonBlue:
    "linear-gradient(180deg, rgba(36,126,255,1) 0%, rgba(21,101,219,1) 100%)",
  buttonEmerald:
    "linear-gradient(180deg, rgba(39,217,191,1) 0%, rgba(18,173,150,1) 100%)",
};

const workflow = [
  {
    label: "Intake",
    sub: "Check-in vehicle",
    icon: <CarFront size={18} strokeWidth={2.2} />,
  },
  {
    label: "Findings",
    sub: "Document issues",
    icon: <Search size={18} strokeWidth={2.2} />,
  },
  {
    label: "Approval",
    sub: "Get approval",
    icon: <FileCheck2 size={18} strokeWidth={2.2} />,
  },
  {
    label: "Repair",
    sub: "Complete repair",
    icon: <Wrench size={18} strokeWidth={2.2} />,
  },
  {
    label: "Release",
    sub: "Deliver vehicle",
    icon: <CheckCircle2 size={18} strokeWidth={2.2} />,
  },
];

const problemCards = [
  {
    title: "Pre-existing damage becomes an argument",
    body: "Without consistent intake photos and condition records, shops get dragged into disputes that should have been settled at drop-off.",
    accent: "blue",
  },
  {
    title: "Approvals live in texts, calls, and memory",
    body: "When findings and approvals are not tied cleanly to the job, the story gets messy fast.",
    accent: "orange",
  },
  {
    title: "Release documentation is often too thin",
    body: "If the vehicle leaves and the record is weak, the shop loses clarity, leverage, and confidence.",
    accent: "emerald",
  },
];

const engineCards = [
  {
    eyebrow: "Step 1",
    title: "Intake",
    body: "Capture the customer, vehicle, VIN, concern, required condition photos, and authorization at drop-off.",
    accent: "blue",
  },
  {
    eyebrow: "Step 2",
    title: "Findings + Approval",
    body: "Document what was found, what is recommended, and what the customer approved — all attached to the same job.",
    accent: "orange",
  },
  {
    eyebrow: "Step 3",
    title: "Repair + Release Record",
    body: "Move the job through the shop and close it with release documentation and a permanent record.",
    accent: "emerald",
  },
];

const featureCards = [
  {
    title: "Vehicle intake + VIN workflow",
    body: "Start a clean record for the visit with customer info, vehicle details, concern, and intake authorization.",
    accent: "blue",
  },
  {
    title: "Required condition photo capture",
    body: "Build a habit of consistent photos at drop-off so the shop has proof before work begins.",
    accent: "blue",
  },
  {
    title: "Findings and approvals attached to the job",
    body: "Keep approvals tied directly to what was found and what was authorized.",
    accent: "orange",
  },
  {
    title: "Live workflow visibility",
    body: "Track vehicles that need intake, are in progress, waiting on parts, or ready for pickup.",
    accent: "emerald",
  },
  {
    title: "Final release documentation",
    body: "Close the loop with release confirmation, final photos, and a cleaner handoff story.",
    accent: "emerald",
  },
  {
    title: "Built for real shops",
    body: "Made for office, service writer, porter, and shop-floor use — not just a pretty dashboard.",
    accent: "orange",
  },
];

const overviewCards = [
  {
    title: "What comes in",
    body: "Vehicle condition, concern, photos, findings, approvals, and release documentation all stay tied to one visit.",
    accent: "blue",
    image: "/images/driveproof-damage.jpg",
  },
  {
    title: "What the shop gets",
    body: "A cleaner workflow, stronger accountability, and a permanent story for what happened from drop-off to pickup.",
    accent: "emerald",
    image: "/images/equipment-proof.jpg",
  },
  {
    title: "What the record proves",
    body: "What the vehicle looked like, what was found, what was approved, and how it left the shop.",
    accent: "orange",
    image: "/images/fleetproof-inspection.png",
  },
];

export default function ShopProofPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(57,122,255,0.18) 0%, rgba(57,122,255,0.06) 18%, rgba(57,122,255,0) 40%),
          radial-gradient(circle at 0% 100%, rgba(39,217,191,0.06) 0%, rgba(39,217,191,0.02) 18%, rgba(39,217,191,0) 36%),
          radial-gradient(circle at 100% 12%, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.012) 12%, rgba(255,255,255,0) 30%),
          repeating-linear-gradient(
            0deg,
            rgba(255,255,255,0.012) 0px,
            rgba(255,255,255,0.012) 1px,
            transparent 1px,
            transparent 46px
          ),
          repeating-linear-gradient(
            90deg,
            rgba(255,255,255,0.006) 0px,
            rgba(255,255,255,0.006) 1px,
            transparent 1px,
            transparent 74px
          ),
          ${THEME.pageBase}
        `,
        color: THEME.text,
        padding: "18px",
      }}
    >
      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          borderRadius: 24,
          overflow: "hidden",
          background: THEME.shell,
          border: THEME.border,
          boxShadow: THEME.shellShadow,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `
              ${THEME.shellInner},
              radial-gradient(circle at 50% 0%, rgba(71,123,255,0.14) 0%, rgba(71,123,255,0.05) 20%, rgba(71,123,255,0) 44%),
              repeating-linear-gradient(
                135deg,
                rgba(255,255,255,0.012) 0px,
                rgba(255,255,255,0.012) 1px,
                transparent 1px,
                transparent 9px
              )
            `,
            opacity: 0.95,
          }}
        />

        <TopBar />

        <div
          style={{
            padding: "18px",
            display: "grid",
            gap: 16,
            position: "relative",
            zIndex: 1,
          }}
        >
          <HeroSection />
          <WorkflowStrip />

          <SectionTitle title="The problem" rightText="Why ShopPROOF exists" />
          <ThreeCardGrid cards={problemCards} />

          <SectionTitle
            title="The ShopPROOF engine"
            rightText="Simple structure behind the workflow"
          />
          <ThreeCardGrid cards={engineCards} />

          <SectionTitle
            title="What ShopPROOF does"
            rightText="Core current product focus"
          />
          <FeatureGrid />

          <SectionTitle
            title="What ShopPROOF creates"
            rightText="Front-door overview"
          />
          <OverviewGrid />

          <BottomNote />
        </div>
      </div>
    </main>
  );
}

function TopBar() {
  return (
    <div
      style={{
        minHeight: 62,
        padding: "0 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        borderBottom: `1px solid ${THEME.lineFaint}`,
        position: "relative",
        zIndex: 2,
      }}
    >
      <Link href="/" style={{ textDecoration: "none" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              minHeight: 28,
              padding: "0 12px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "-0.01em",
              color: THEME.textSoft,
              background:
                "linear-gradient(180deg, rgba(14,24,36,0.88) 0%, rgba(9,17,27,0.95) 100%)",
              border: THEME.borderSoft,
            }}
          >
            PROOF
          </span>

          <span
            style={{
              minHeight: 28,
              padding: "0 12px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "-0.01em",
              color: THEME.text,
              background:
                "linear-gradient(180deg, rgba(19,34,51,0.98) 0%, rgba(10,20,33,1) 100%)",
              border: THEME.border,
              boxShadow: "0 0 18px rgba(59,130,246,0.18)",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            ShopPROOF
          </span>
        </div>
      </Link>

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <Link href="/login" style={{ textDecoration: "none" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 32,
              padding: "0 12px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 900,
              color: THEME.textSoft,
              border: THEME.borderSoft,
              background:
                "linear-gradient(180deg, rgba(18,29,41,0.98) 0%, rgba(10,18,28,0.98) 100%)",
            }}
          >
            Login
          </span>
        </Link>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "1.05fr 0.95fr",
        gap: 14,
      }}
    >
      <Panel>
        <div
          style={{
            display: "grid",
            gap: 14,
            alignContent: "start",
            minHeight: 300,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              alignSelf: "flex-start",
              minHeight: 28,
              padding: "0 12px",
              borderRadius: 999,
              background: "rgba(92,104,255,0.12)",
              border: "1px solid rgba(124,136,255,0.22)",
              color: "#C6D0FF",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              boxShadow: "0 0 18px rgba(92,104,255,0.16)",
            }}
          >
            Evidence-first shop workflow
          </span>

          <div
            style={{
              fontSize: 56,
              lineHeight: 0.94,
              fontWeight: 950,
              letterSpacing: "-0.06em",
              maxWidth: 620,
              textShadow: "0 4px 28px rgba(0,0,0,0.28)",
            }}
          >
            Document Every Vehicle.
            <br />
            Protect Every Repair.
          </div>

          <p
            style={{
              margin: 0,
              maxWidth: 620,
              fontSize: 15,
              lineHeight: 1.65,
              color: THEME.textSoft,
            }}
          >
            ShopPROOF is a repair shop workflow for intake, findings,
            approvals, repair visibility, and release documentation — built to
            create a clean permanent record for every vehicle visit.
          </p>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginTop: 2,
            }}
          >
            <span style={primaryButtonStyle}>Built for real shop intake</span>
            <span style={secondaryButtonStyle}>Permanent record focus</span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 10,
              marginTop: 6,
            }}
          >
            <MiniMetric
              label="Current model"
              value="Intake → Approval → Repair → Release"
            />
            <MiniMetric
              label="Built for"
              value="Real shop intake and accountability"
            />
            <MiniMetric
              label="Primary outcome"
              value="Clearer records and less argument"
            />
          </div>
        </div>
      </Panel>

      <VisualPanel />
    </section>
  );
}

function VisualPanel() {
  return (
    <Panel>
      <div
        style={{
          minHeight: 300,
          borderRadius: 18,
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.065)",
          background:
            "linear-gradient(180deg, rgba(5,15,24,0.94) 0%, rgba(4,10,18,0.98) 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.03), 0 14px 30px rgba(0,0,0,0.24)",
        }}
      >
        <img
          src="/images/driveproof-damage.jpg"
          alt="ShopPROOF visual"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "contrast(1.04) saturate(0.96) brightness(0.56) blur(0.4px)",
            transform: "scale(1.03)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
              linear-gradient(90deg, rgba(3,10,18,0.46) 0%, rgba(3,10,18,0.16) 34%, rgba(3,10,18,0.30) 100%),
              linear-gradient(180deg, rgba(6,14,22,0.18) 0%, rgba(6,14,22,0.12) 24%, rgba(6,14,22,0.54) 100%),
              radial-gradient(circle at 18% 18%, rgba(59,130,246,0.24) 0%, rgba(59,130,246,0.06) 24%, rgba(59,130,246,0) 48%),
              radial-gradient(circle at 80% 74%, rgba(39,217,191,0.14) 0%, rgba(39,217,191,0.04) 22%, rgba(39,217,191,0) 40%)
            `,
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 1,
            borderRadius: 17,
            border: "1px solid rgba(255,255,255,0.035)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            right: 16,
            display: "grid",
            gap: 10,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              alignSelf: "flex-start",
              minHeight: 28,
              padding: "0 10px",
              borderRadius: 999,
              background: "rgba(39,217,191,0.14)",
              border: "1px solid rgba(39,217,191,0.28)",
              color: "#9DF4E7",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              backdropFilter: "blur(10px)",
              boxShadow: "0 0 16px rgba(39,217,191,0.12)",
            }}
          >
            ShopPROOF visual focus
          </div>

          <div
            style={{
              maxWidth: 320,
              fontSize: 28,
              lineHeight: 1.02,
              fontWeight: 950,
              letterSpacing: "-0.05em",
              textShadow: "0 3px 16px rgba(0,0,0,0.32)",
            }}
          >
            Condition.
            <br />
            Approval.
            <br />
            Release.
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 16,
            bottom: 16,
            right: 16,
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 10,
            alignItems: "end",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: 10,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              <GlassChip
                icon={<Camera size={14} strokeWidth={2.2} />}
                label="Required photos"
              />
              <GlassChip
                icon={<ClipboardCheck size={14} strokeWidth={2.2} />}
                label="Signed approvals"
              />
              <GlassChip
                icon={<Shield size={14} strokeWidth={2.2} />}
                label="Permanent record"
              />
            </div>
          </div>

          <Link href="/shopproof/dashboard" style={{ textDecoration: "none" }}>
            <span
              title="Enter"
              style={{
                width: 42,
                height: 42,
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: THEME.text,
                border: "1px solid rgba(255,255,255,0.18)",
                background:
                  "linear-gradient(180deg, rgba(18,30,44,0.96) 0%, rgba(10,17,28,0.98) 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 18px rgba(59,130,246,0.18), 0 10px 18px rgba(0,0,0,0.18)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Wrench size={16} strokeWidth={2.2} />
            </span>
          </Link>
        </div>
      </div>
    </Panel>
  );
}

function WorkflowStrip() {
  return (
    <Panel>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        {workflow.map((item, index) => (
          <div
            key={item.label}
            style={{
              position: "relative",
              minHeight: 92,
              padding: "12px 12px 12px 14px",
              borderRadius: 14,
              background: THEME.card,
              border: THEME.borderSoft,
              boxShadow: `${THEME.cardShadow}, inset 0 1px 0 rgba(255,255,255,0.03)`,
              overflow: "hidden",
            }}
          >
            <CardTexture />

            {index < workflow.length - 1 ? (
              <div
                style={{
                  position: "absolute",
                  right: -7,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 2,
                  color: THEME.textDim,
                }}
              >
                <ArrowRight size={16} strokeWidth={2.6} />
              </div>
            ) : null}

            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "grid",
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: THEME.blue,
                  background: THEME.blueSoft,
                  border: "1px solid rgba(59,130,246,0.24)",
                  boxShadow: "0 0 14px rgba(59,130,246,0.12)",
                }}
              >
                {item.icon}
              </span>

              <div
                style={{
                  fontSize: 16,
                  lineHeight: 1,
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                }}
              >
                {item.label}
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: THEME.textMuted,
                  fontWeight: 800,
                  lineHeight: 1.35,
                }}
              >
                {item.sub}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function SectionTitle({
  title,
  rightText,
}: {
  title: string;
  rightText?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        alignItems: "end",
        paddingTop: 2,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: 32,
          lineHeight: 1,
          fontWeight: 950,
          letterSpacing: "-0.05em",
          textShadow: "0 2px 14px rgba(0,0,0,0.22)",
        }}
      >
        {title}
      </h2>

      {rightText ? (
        <span
          style={{
            fontSize: 11,
            color: THEME.textDim,
            fontWeight: 900,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {rightText}
        </span>
      ) : null}
    </div>
  );
}

function ThreeCardGrid({
  cards,
}: {
  cards: { title: string; body: string; accent: string; eyebrow?: string }[];
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 14,
      }}
    >
      {cards.map((card) => (
        <FeatureCard
          key={card.title}
          title={card.title}
          body={card.body}
          accent={card.accent}
          eyebrow={card.eyebrow}
        />
      ))}
    </div>
  );
}

function FeatureGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 14,
      }}
    >
      {featureCards.map((card) => (
        <FeatureCard
          key={card.title}
          title={card.title}
          body={card.body}
          accent={card.accent}
        />
      ))}
    </div>
  );
}

function OverviewGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 14,
      }}
    >
      {overviewCards.map((card) => (
        <div
          key={card.title}
          style={{
            minHeight: 250,
            borderRadius: 18,
            overflow: "hidden",
            background: THEME.panel,
            border: THEME.border,
            boxShadow: THEME.panelShadow,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `${THEME.panelTop}, ${THEME.panelEdgeGlow}`,
              opacity: 0.95,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 1,
              borderRadius: 17,
              border: "1px solid rgba(255,255,255,0.035)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              padding: 16,
              display: "grid",
              gap: 12,
              height: "100%",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                alignSelf: "flex-start",
                minHeight: 24,
                padding: "0 10px",
                borderRadius: 999,
                background:
                  card.accent === "emerald"
                    ? THEME.emeraldSoft
                    : card.accent === "orange"
                      ? THEME.orangeSoft
                      : THEME.blueSoft,
                border:
                  card.accent === "emerald"
                    ? "1px solid rgba(39,217,191,0.22)"
                    : card.accent === "orange"
                      ? "1px solid rgba(245,158,66,0.22)"
                      : "1px solid rgba(59,130,246,0.22)",
                color:
                  card.accent === "emerald"
                    ? "#9DF4E7"
                    : card.accent === "orange"
                      ? "#FFD39E"
                      : "#AFCFFF",
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {card.title}
            </div>

            <div
              style={{
                height: 108,
                borderRadius: 14,
                overflow: "hidden",
                position: "relative",
                border: "1px solid rgba(255,255,255,0.07)",
                background:
                  "linear-gradient(180deg, rgba(15,27,40,0.96) 0%, rgba(7,14,24,0.98) 100%)",
              }}
            >
              <img
                src={card.image}
                alt=""
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "contrast(1.04) saturate(0.92) brightness(0.72)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(8,15,24,0.08) 26%, rgba(8,15,24,0.42) 100%)",
                }}
              />
            </div>

            <div
              style={{
                fontSize: 34,
                lineHeight: 0.96,
                fontWeight: 950,
                letterSpacing: "-0.05em",
                marginTop: 2,
              }}
            >
              {card.title}
            </div>

            <div
              style={{
                fontSize: 13,
                lineHeight: 1.6,
                color: THEME.textSoft,
              }}
            >
              {card.body}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FeatureCard({
  title,
  body,
  accent,
  eyebrow,
}: {
  title: string;
  body: string;
  accent: string;
  eyebrow?: string;
}) {
  const tone =
    accent === "emerald"
      ? {
          line: THEME.emeraldLine,
          soft: THEME.emeraldSoft,
          border: "rgba(39,217,191,0.22)",
          color: "#9DF4E7",
        }
      : accent === "orange"
        ? {
            line: THEME.orangeLine,
            soft: THEME.orangeSoft,
            border: "rgba(245,158,66,0.22)",
            color: "#FFD39E",
          }
        : {
            line: THEME.blueLine,
            soft: THEME.blueSoft,
            border: "rgba(59,130,246,0.22)",
            color: "#AFCFFF",
          };

  return (
    <div
      style={{
        minHeight: 190,
        borderRadius: 18,
        overflow: "hidden",
        background: THEME.panel,
        border: THEME.border,
        boxShadow: THEME.panelShadow,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `${THEME.panelTop}, ${THEME.panelEdgeGlow}`,
          opacity: 0.95,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: tone.line,
          boxShadow: `0 0 12px ${tone.line}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 1,
          borderRadius: 17,
          border: "1px solid rgba(255,255,255,0.035)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: 16,
          display: "grid",
          gap: 12,
        }}
      >
        {eyebrow ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              alignSelf: "flex-start",
              minHeight: 24,
              padding: "0 10px",
              borderRadius: 999,
              background: tone.soft,
              border: `1px solid ${tone.border}`,
              color: tone.color,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </span>
        ) : null}

        <div
          style={{
            fontSize: 28,
            lineHeight: 0.98,
            fontWeight: 950,
            letterSpacing: "-0.05em",
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 14,
            lineHeight: 1.65,
            color: THEME.textSoft,
          }}
        >
          {body}
        </div>
      </div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        minHeight: 74,
        borderRadius: 14,
        background: THEME.card,
        border: THEME.borderSoft,
        boxShadow: `${THEME.cardShadow}, inset 0 1px 0 rgba(255,255,255,0.03)`,
        padding: "12px 12px 10px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <CardTexture />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gap: 7,
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: THEME.textDim,
            fontWeight: 900,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 13,
            lineHeight: 1.35,
            color: THEME.textSoft,
            fontWeight: 900,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function GlassChip({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div
      style={{
        minHeight: 36,
        padding: "0 10px",
        borderRadius: 10,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        color: THEME.textSoft,
        fontSize: 12,
        fontWeight: 900,
        border: "1px solid rgba(255,255,255,0.12)",
        background:
          "linear-gradient(180deg, rgba(17,29,43,0.62) 0%, rgba(10,17,27,0.72) 100%)",
        backdropFilter: "blur(12px)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 16px rgba(0,0,0,0.16)",
      }}
    >
      {icon}
      {label}
    </div>
  );
}

function BottomNote() {
  return (
    <div
      style={{
        fontSize: 13,
        lineHeight: 1.65,
        color: THEME.textDim,
        padding: "4px 2px 2px",
      }}
    >
      Every ShopPROOF job should end with a stronger story: intake condition,
      documented findings, captured approvals, repair visibility, and a cleaner
      release record.
    </div>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <section
      style={{
        borderRadius: 18,
        overflow: "hidden",
        background: THEME.panel,
        border: THEME.border,
        boxShadow: THEME.panelShadow,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `${THEME.panelTop}, ${THEME.panelEdgeGlow}`,
          opacity: 0.95,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 1,
          borderRadius: 17,
          pointerEvents: "none",
          border: "1px solid rgba(255,255,255,0.035)",
        }}
      />
      <div style={{ padding: 16, position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </section>
  );
}

function CardTexture() {
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: THEME.cardTop,
          opacity: 0.95,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 1,
          borderRadius: 13,
          pointerEvents: "none",
          border: "1px solid rgba(255,255,255,0.03)",
        }}
      />
    </>
  );
}

const primaryButtonStyle: CSSProperties = {
  minHeight: 42,
  padding: "0 16px",
  borderRadius: 10,
  background: THEME.buttonBlue,
  border: "1px solid rgba(59,130,246,0.34)",
  color: "#F7FBFF",
  fontSize: 13,
  fontWeight: 900,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  whiteSpace: "nowrap",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.12), 0 0 18px rgba(59,130,246,0.22), 0 10px 20px rgba(0,0,0,0.16)",
};

const secondaryButtonStyle: CSSProperties = {
  minHeight: 42,
  padding: "0 16px",
  borderRadius: 10,
  background:
    "linear-gradient(180deg, rgba(24,39,56,0.98) 0%, rgba(11,20,30,0.98) 100%)",
  border: THEME.borderSoft,
  color: THEME.textSoft,
  fontSize: 13,
  fontWeight: 900,
  display: "inline-flex",
  alignItems: "center",
  whiteSpace: "nowrap",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.04), 0 10px 18px rgba(0,0,0,0.14)",
};