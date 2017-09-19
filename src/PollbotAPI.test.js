/* Functional tests of the Pollbot API */

import {
  checkStatus,
  getPollbotVersion,
  getOngoingVersions,
  getReleaseInfo,
} from './PollbotAPI';

describe('getOngoingVersions', () => {
  it('retrieves the list of ongoing versions', async () => {
    const onGoingVersions = await getOngoingVersions();
    expect(onGoingVersions).toMatchObject({
      beta: expect.any(String),
      devedition: expect.any(String),
      esr: expect.any(String),
      nightly: expect.any(String),
      release: expect.any(String),
    });
  });
});

describe('getReleaseInfo', () => {
  it('retrieves the release information', async () => {
    const releaseInfo = await getReleaseInfo('50.0');
    expect(releaseInfo).toMatchObject({
      channel: expect.stringMatching(/nightly|beta|release|esr/),
      checks: expect.arrayContaining([
        {
          title: expect.any(String),
          url: expect.any(String),
        },
      ]),
      product: 'firefox',
      version: '50.0',
    });
    releaseInfo.checks.map(check => {
      expect(check).toMatchObject({
        title: expect.any(String),
        url: expect.any(String),
      });
    });
  });
});

describe('checkStatus', () => {
  it('retrieves the status of a given check', async () => {
    const status = await checkStatus(
      'https://pollbot.dev.mozaws.net/v1/firefox/50.0/product-details',
    );
    expect(status).toEqual({
      link: 'https://product-details.mozilla.org/1.0/firefox.json',
      status: 'exists',
      message: 'We found product-details information about version 50.0',
    });
  });
});

describe('getPollbotVersion', () => {
  it('retrieves the version from Pollbot', async () => {
    const version = await getPollbotVersion();
    expect(version).toMatchObject({
      commit: expect.any(String),
      name: 'pollbot',
      source: expect.any(String),
      version: expect.any(String),
    });
  });
});
