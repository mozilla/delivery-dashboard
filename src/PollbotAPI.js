// @flow
import { pollbotUrl } from "./index";
import type {
  APIVersionData,
  CheckResult,
  ProductVersions,
  Product,
  ReleaseInfo
} from "./types";

export async function getOngoingVersions(
  product: Product
): Promise<ProductVersions> {
  const response = await fetch(`${pollbotUrl}/${product}/ongoing-versions`);
  return response.json();
}

export async function getReleaseInfo(
  product: Product,
  version: string
): Promise<ReleaseInfo> {
  const response = await fetch(`${pollbotUrl}/${product}/${version}`);
  return response.json();
}

export async function checkStatus(url: string): Promise<CheckResult> {
  const response = await fetch(url);
  return response.json();
}

export async function getPollbotVersion(): Promise<APIVersionData> {
  const response = await fetch(`${pollbotUrl}/__version__`);
  return response.json();
}
