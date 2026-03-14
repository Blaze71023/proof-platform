import type { ProductConfig } from "./types";

export const rentproofConfig: ProductConfig = {
  key: "rentproof",
  name: "RentPROOF",
  tagline: "Document every stay.",
  labels: {
    asset: "Property",
    assetPlural: "Properties",
    event: "Stay",
    eventPlural: "Stays",
    inspection: "Inspection",
    party: "Guest",
    issue: "Incident",
    claim: "Recovery Case",
  },
  theme: {
    primary: "#7D7BFF",
    primaryForeground: "#F1F1FF",
    accent: "#A5A4FF",
    background: "#061229",
    panel: "#101B37",
    border: "#2A3C6D",
    sidebar: "#0B1630",
    heroGradient:
      "linear-gradient(135deg, rgba(40,50,122,0.95) 0%, rgba(19,32,82,0.96) 36%, rgba(5,18,41,0.98) 100%)",
    heroGlow: "rgba(125,123,255,0.24)",
    surfaceGlow: "rgba(125,123,255,0.14)",
    spotlight: "rgba(125,123,255,0.2)",
    softTint: "rgba(125,123,255,0.08)",
  },
  navItems: [
    { label: "Overview", href: "/rentproof" },
    { label: "Properties", href: "/rentproof/assets" },
    { label: "Stays", href: "/rentproof/events" },
    { label: "Inspections", href: "/rentproof/inspections" },
    { label: "Incidents", href: "/rentproof/claims" },
  ],
  dashboardCards: [
    { id: "active-stays", title: "Active Stays", metricKey: "activeStays" },
    {
      id: "checkouts-today",
      title: "Check-Outs Today",
      metricKey: "checkoutsToday",
    },
    {
      id: "cleaning-status",
      title: "Cleaning Status",
      metricKey: "cleaningStatus",
    },
    {
      id: "incident-reports",
      title: "Incident Reports",
      metricKey: "incidentReports",
    },
  ],
  templates: [
    {
      id: "checkin",
      name: "Check-In Inspection",
      description: "Condition record before guest stay.",
    },
    {
      id: "checkout",
      name: "Check-Out Inspection",
      description: "Condition record after guest stay.",
    },
    {
      id: "incident",
      name: "Incident Report",
      description: "Damage, missing item, or rule violation report.",
    },
  ],
};