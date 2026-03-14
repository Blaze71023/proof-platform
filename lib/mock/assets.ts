export type MockAsset = {
  id: string;
  product: "driveproof" | "fleetproof" | "rentproof";
  name: string;
  identifier: string;
  status: string;
  location: string;
  usageValue?: string;
  issueCount: number;
};

export const mockAssets: MockAsset[] = [
  {
    id: "veh_001",
    product: "driveproof",
    name: "2021 Tesla Model 3",
    identifier: "VIN • 5YJ3E1EA1MF000001",
    status: "Active Trip",
    location: "Shreveport, LA",
    usageValue: "42,188 mi",
    issueCount: 0,
  },
  {
    id: "veh_002",
    product: "driveproof",
    name: "2020 Toyota Camry SE",
    identifier: "VIN • 4T1G11AK7LU000002",
    status: "Pending Dropoff",
    location: "Bossier City, LA",
    usageValue: "67,014 mi",
    issueCount: 1,
  },
  {
    id: "veh_003",
    product: "driveproof",
    name: "2022 Ford Mustang EcoBoost",
    identifier: "VIN • 1FA6P8TH7N5000003",
    status: "Available",
    location: "Monroe, LA",
    usageValue: "18,944 mi",
    issueCount: 0,
  },
  {
    id: "eq_001",
    product: "fleetproof",
    name: "CAT 289D3 Compact Track Loader",
    identifier: "Unit • CTL-204",
    status: "On Assignment",
    location: "Minden Yard",
    usageValue: "2,184 hrs",
    issueCount: 2,
  },
  {
    id: "eq_002",
    product: "fleetproof",
    name: "John Deere 310SL Backhoe",
    identifier: "Unit • BH-117",
    status: "Pre-Trip Due",
    location: "Haughton Site",
    usageValue: "4,902 hrs",
    issueCount: 1,
  },
  {
    id: "eq_003",
    product: "fleetproof",
    name: "Felling Lowboy Trailer",
    identifier: "Unit • TR-88",
    status: "Available",
    location: "Bossier Yard",
    usageValue: "N/A",
    issueCount: 0,
  },
  {
    id: "prop_001",
    product: "rentproof",
    name: "Cypress Cottage",
    identifier: "Property • RP-101",
    status: "Occupied",
    location: "Broken Bow, OK",
    usageValue: "Check-out 11:00 AM",
    issueCount: 0,
  },
  {
    id: "prop_002",
    product: "rentproof",
    name: "Downtown Loft 2B",
    identifier: "Property • RP-204",
    status: "Cleaner Assigned",
    location: "Dallas, TX",
    usageValue: "Turnover today",
    issueCount: 1,
  },
  {
    id: "prop_003",
    product: "rentproof",
    name: "Lakeview Retreat",
    identifier: "Property • RP-311",
    status: "Ready",
    location: "Hot Springs, AR",
    usageValue: "Next stay Friday",
    issueCount: 0,
  },
];

export function getMockAssetsByProduct(product: string) {
  return mockAssets.filter((asset) => asset.product === product);
}