// @flow
import type {
  APIVersionData,
  CheckResult,
  ProductVersions,
  Product,
  ReleaseInfo
} from "./types";

export const SERVER = process.env.REACT_APP_POLLBOT_URL || "https://pollbot.services.mozilla.com/v1";

export async function getOngoingVersions(
  product: Product
): Promise<ProductVersions> {
  const response = await fetch(`${SERVER}/${product}/ongoing-versions`);
  return response.json();
}

export async function getReleaseInfo(
  product: Product,
  version: string
): Promise<ReleaseInfo> {
  const response = await fetch(`${SERVER}/${product}/${version}`);
  return response.json();
}

export async function checkStatus(url: string): Promise<CheckResult> {
  const response = await fetch(url);
  return response.json();
}

export async function getPollbotVersion(): Promise<APIVersionData> {
  const response = await fetch(`${SERVER}/__version__`);
  return response.json();
}
