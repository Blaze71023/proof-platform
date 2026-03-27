import type { ProductConfig } from "./types";

export const servproofConfig: ProductConfig = {
  key: "servproof",
  name: "ServPROOF",
  tagline:
    "Restaurant equipment service documentation for maintenance, failures, repairs, and multi-location accountability.",

  labels: {
    asset: "Equipment Asset",
    assetPlural: "Equipment Assets",
    event: "Service Record",
    eventPlural: "Service Records",
    inspection: "Inspection",
    party: "Location",
    usageMetric: "Assets tracked",
    issue: "Issue",
    claim: "Claim",
  },

  theme: {
    primary: "#FACC15",
    primaryForeground: "#0B1220",
    accent: "#F59E0B",
    background:
      "linear-gradient(180deg, #07111D 0%, #081423 46%, #09182A 100%)",
    panel: "rgba(255,255,255,0.06)",
    border: "rgba(250,204,21,0.24)",
    sidebar: "rgba(8,18,33,0.92)",
    heroGradient:
      "linear-gradient(140deg, rgba(32,24,4,0.96) 0%, rgba(19,16,6,0.98) 52%, rgba(10,10,12,1) 100%)",
    heroGlow: "rgba(250,204,21,0.28)",
    surfaceGlow: "rgba(250,204,21,0.16)",
    spotlight: "rgba(250,204,21,0.18)",
    softTint: "rgba(250,204,21,0.12)",
  },

  navItems: [
    { label: "Assets", href: "/servproof/assets" },
    { label: "Inspections", href: "/servproof/inspections" },
    { label: "Records", href: "/servproof/records" },
  ],

  dashboardCards: [
    { id: "assets", title: "Assets", metricKey: "assets" },
    { id: "inspections", title: "Inspections", metricKey: "inspections" },
    { id: "issues", title: "Open Issues", metricKey: "issues" },
  ],

  templates: [
    {
      id: "equipment-intake",
      name: "Equipment Intake",
      description:
        "Document restaurant equipment condition when assets are added or assigned.",
    },
    {
      id: "maintenance-check",
      name: "Maintenance Check",
      description:
        "Capture service status, photos, technician notes, and repair documentation.",
    },
    {
      id: "failure-report",
      name: "Failure Report",
      description:
        "Document equipment failures, breakdowns, and service incidents.",
    },
  ],
};