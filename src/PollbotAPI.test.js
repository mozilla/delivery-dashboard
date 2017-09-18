/* Functional tests of the Pollbot API */

import {getOngoingVersions} from './PollbotAPI';

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
