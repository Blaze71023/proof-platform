export type ProductKey =
  | "driveproof"
  | "fleetproof"
  | "rentproof"
  | "shopproof"
  | "assetproof"
  | "claimproof";

export type ProductLabels = {
  asset: string;
  assetPlural: string;
  event: string;
  eventPlural: string;
  inspection: string;
  party: string;
  usageMetric?: string;
  issue: string;
  claim?: string;
};

export type ProductTheme = {
  primary: string;
  primaryForeground: string;
  accent: string;
  background: string;
  panel: string;
  border: string;
  sidebar: string;
  heroGradient: string;
  heroGlow: string;
  surfaceGlow: string;
  spotlight: string;
  softTint: string;
};

export type DashboardCard = {
  id: string;
  title: string;
  metricKey: string;
};

export type InspectionTemplateSummary = {
  id: string;
  name: string;
  description: string;
};

export type ProductNavItem = {
  label: string;
  href: string;
};

export type ProductConfig = {
  key: ProductKey;
  name: string;
  tagline: string;
  labels: ProductLabels;
  theme: ProductTheme;
  navItems: ProductNavItem[];
  dashboardCards: DashboardCard[];
  templates: InspectionTemplateSummary[];
};