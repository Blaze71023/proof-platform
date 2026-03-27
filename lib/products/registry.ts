export type ProductConfig = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  labels: {
    assetSingular: string;
    assetPlural: string;
  };
};

const productRegistry: Record<string, ProductConfig> = {
  driveproof: {
    id: "driveproof",
    name: "DrivePROOF",
    tagline: "Vehicle documentation and accountability",
    description:
      "Professional vehicle documentation for pickups, dropoffs, damage capture, guest accountability, and dispute-ready records.",
    labels: {
      assetSingular: "vehicle",
      assetPlural: "vehicles",
    },
  },

  fleetproof: {
    id: "fleetproof",
    name: "FleetPROOF",
    tagline: "Equipment and fleet inspection workflows",
    description:
      "Industrial inspection workflows for equipment, assignments, maintenance visibility, service discipline, and operational accountability.",
    labels: {
      assetSingular: "asset",
      assetPlural: "assets",
    },
  },

  rentproof: {
    id: "rentproof",
    name: "RentPROOF",
    tagline: "Property documentation and turnover records",
    description:
      "Premium property turnover documentation for stays, guest incidents, room condition capture, and hospitality-grade records.",
    labels: {
      assetSingular: "property",
      assetPlural: "properties",
    },
  },

  servproof: {
    id: "servproof",
    name: "ServPROOF",
    tagline: "Restaurant equipment service documentation",
    description:
      "Restaurant equipment service documentation for maintenance issues, failures, repairs, and multi-location accountability.",
    labels: {
      assetSingular: "equipment item",
      assetPlural: "equipment items",
    },
  },
};

export function getProductConfig(product: string): ProductConfig {
  return productRegistry[product];
}

export function getAllProductConfigs(): ProductConfig[] {
  return Object.values(productRegistry);
}