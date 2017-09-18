/* Functional tests of the Pollbot API */

import {getOngoingVersions, getReleaseInfo} from './PollbotAPI';

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
