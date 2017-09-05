// @flow
import type {OngoingVersions} from './types.js';

export function getOngoingVersions(): Promise<OngoingVersions> {
  return fetch(
    'https://pollbot.dev.mozaws.net/v1/firefox/ongoing-versions',
  ).then(resp => resp.json());
}
