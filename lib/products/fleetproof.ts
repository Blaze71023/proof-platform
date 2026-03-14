import type { ProductConfig } from "./types";

export const fleetproofConfig: ProductConfig = {
  key: "fleetproof",
  name: "FleetPROOF",
  tagline: "Accountability for every machine.",
  labels: {
    asset: "Equipment",
    assetPlural: "Equipment",
    event: "Assignment",
    eventPlural: "Assignments",
    inspection: "Inspection",
    party: "Operator",
    usageMetric: "Engine Hours",
    issue: "Maintenance Item",
    claim: "Incident Case",
  },
  theme: {
    primary: "#FF8A1F",
    primaryForeground: "#FFF3E6",
    accent: "#FFB05F",
    background: "#0E0C09",
    panel: "#191510",
    border: "#4B3420",
    sidebar: "#120F0B",
    heroGradient:
      "linear-gradient(135deg, rgba(93,47,14,0.95) 0%, rgba(52,30,14,0.96) 34%, rgba(13,12,10,0.98) 100%)",
    heroGlow: "rgba(255,138,31,0.24)",
    surfaceGlow: "rgba(255,138,31,0.16)",
    spotlight: "rgba(255,138,31,0.2)",
    softTint: "rgba(255,138,31,0.08)",
  },
  navItems: [
    { label: "Overview", href: "/fleetproof" },
    { label: "Equipment", href: "/fleetproof/assets" },
    { label: "Assignments", href: "/fleetproof/events" },
    { label: "Pre-Trips", href: "/fleetproof/inspections" },
    { label: "Incidents", href: "/fleetproof/claims" },
  ],
  dashboardCards: [
    { id: "units-active", title: "Units Active Today", metricKey: "unitsActive" },
    { id: "pretrips-due", title: "Pre-Trips Due", metricKey: "preTripsDue" },
    {
      id: "service-alerts",
      title: "Service Alerts",
      metricKey: "serviceAlerts",
    },
    {
      id: "downtime-flags",
      title: "Downtime Flags",
      metricKey: "downtimeFlags",
    },
  ],
  templates: [
    {
      id: "pretrip",
      name: "Pre-Trip Inspection",
      description: "Operational and safety check before use.",
    },
    {
      id: "posttrip",
      name: "Post-Trip Inspection",
      description: "Condition and issue capture after use.",
    },
    {
      id: "service-check",
      name: "Service Check",
      description: "Maintenance-focused inspection template.",
    },
  ],
};