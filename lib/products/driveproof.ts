import type { ProductConfig } from "./types";

export const driveproofConfig: ProductConfig = {
  key: "driveproof",
  name: "DrivePROOF",
  tagline: "Know the condition before and after every trip.",
  labels: {
    asset: "Vehicle",
    assetPlural: "Vehicles",
    event: "Trip",
    eventPlural: "Trips",
    inspection: "Inspection",
    party: "Guest",
    usageMetric: "Mileage",
    issue: "Damage",
    claim: "Claim",
  },
  theme: {
    primary: "#18D3A4",
    primaryForeground: "#E9FFF9",
    accent: "#6EF0CD",
    background: "#03111D",
    panel: "#081A29",
    border: "#15344A",
    sidebar: "#071522",
    heroGradient:
      "linear-gradient(135deg, rgba(10,61,53,0.96) 0%, rgba(5,35,47,0.95) 36%, rgba(2,15,27,0.96) 100%)",
    heroGlow: "rgba(24,211,164,0.22)",
    surfaceGlow: "rgba(24,211,164,0.14)",
    spotlight: "rgba(24,211,164,0.18)",
    softTint: "rgba(24,211,164,0.08)",
  },
  navItems: [
    { label: "Overview", href: "/driveproof" },
    { label: "Vehicles", href: "/driveproof/assets" },
    { label: "Trips", href: "/driveproof/events" },
    { label: "Inspections", href: "/driveproof/inspections" },
    { label: "Claims", href: "/driveproof/claims" },
  ],
  dashboardCards: [
    { id: "active-trips", title: "Active Trips", metricKey: "activeTrips" },
    {
      id: "pending-dropoffs",
      title: "Pending Dropoffs",
      metricKey: "pendingDropoffs",
    },
    { id: "damage-flags", title: "Damage Flags", metricKey: "damageFlags" },
    {
      id: "vehicles-needing-review",
      title: "Vehicles Needing Review",
      metricKey: "vehiclesNeedingReview",
    },
  ],
  templates: [
    {
      id: "pickup",
      name: "Pickup Inspection",
      description: "Condition capture before guest takes possession.",
    },
    {
      id: "dropoff",
      name: "Dropoff Inspection",
      description: "Condition capture after trip completion.",
    },
  ],
};