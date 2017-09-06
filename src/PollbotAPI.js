// @flow
import type {CheckResult, OngoingVersions, ReleaseInfo} from './types.js';

export function getOngoingVersions(): Promise<OngoingVersions> {
  return fetch(
    'https://pollbot.dev.mozaws.net/v1/firefox/ongoing-versions',
  ).then(resp => resp.json());
}

export function getReleaseInfo(version: string): Promise<ReleaseInfo> {
  return fetch(
    `https://pollbot.dev.mozaws.net/v1/firefox/${version}`,
  ).then(resp => resp.json());
}

export function checkStatus(url: string): Promise<CheckResult> {
  return fetch(url).then(resp => resp.json());
}
