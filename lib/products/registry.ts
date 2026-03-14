import { driveproofConfig } from "./driveproof";
import { fleetproofConfig } from "./fleetproof";
import { rentproofConfig } from "./rentproof";
import type { ProductConfig, ProductKey } from "./types";

export const productRegistry: Partial<Record<ProductKey, ProductConfig>> = {
  driveproof: driveproofConfig,
  fleetproof: fleetproofConfig,
  rentproof: rentproofConfig,
};

export function getProductConfig(productKey: string): ProductConfig {
  const config = productRegistry[productKey as ProductKey];

  if (!config) {
    throw new Error(`Unknown product key: ${productKey}`);
  }

  return config;
}