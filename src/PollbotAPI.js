// @flow
import type {
  Check,
  CheckResult,
  OngoingVersions,
  ReleaseInfo,
} from './types.js';

export function getOngoingVersions(): Promise<OngoingVersions> {
  return fetch(
    'https://pollbot.dev.mozaws.net/v1/firefox/ongoing-versions',
  ).then(resp => resp.json());
}

export function getStatuses(version: string): Promise<*> {
  const stateToUrl = {
    archive: 'archive',
    release_notes: 'bedrock/release-notes',
    security_advisories: 'bedrock/security-advisories',
    download_links: 'bedrock/download-links',
    product_details: 'product-details',
  };
  return Promise.all(
    Object.keys(stateToUrl).map((key: Check) => {
      const endpoint = stateToUrl[key];
      return fetch(
        `https://pollbot.dev.mozaws.net/v1/firefox/${version}/${endpoint}`,
      )
        .then(resp => resp.json())
        .then((details: CheckResult) => ({key, details}));
    }),
  ).then((results): {
    [key: string]: CheckResult,
  } =>
    results.reduce((acc, {key, details}) => {
      acc[key] = details;
      return acc;
    }, {}),
  );
}

export function getReleaseInfo(version: string): Promise<ReleaseInfo> {
  return fetch(
    `https://pollbot.dev.mozaws.net/v1/firefox/${version}`,
  ).then(resp => resp.json());
}
