/* Functional tests of the Pollbot API */

import {
  checkStatus,
  getPollbotVersion,
  getOngoingVersions,
  getReleaseInfo,
} from "./PollbotAPI";
import fetchMock from "fetch-mock";
import { pollbotUrl } from "./index";

/* Mock network requests, so that tests are independent of network
 * outages, server configuration, etc.
 */
beforeAll(() => {
  fetchMock.get(`${pollbotUrl}/firefox/ongoing-versions`, {
    esr: "78.15.0esr",
    release: "93.0",
    beta: "94.0b7",
    nightly: "95.0a1",
  });
  fetchMock.get(`${pollbotUrl}/firefox/50.0`, {
    product: "firefox",
    version: "50.0",
    channel: "release",
    checks: [
      {
        title: "Archive Release",
        url: `${pollbotUrl}/firefox/50.0/archive`,
        actionable: true,
      },
      {
        title: "Balrog update rules",
        url: `${pollbotUrl}/firefox/50.0/balrog-rules`,
        actionable: true,
      },
      {
        title: "Bouncer",
        url: `${pollbotUrl}/v1/firefox/50.0/bouncer`,
        actionable: true,
      },
      {
        title: "Buildhub release info",
        url: `${pollbotUrl}/v1/firefox/50.0/buildhub`,
        actionable: true,
      },
      {
        title: "Download links",
        url: `${pollbotUrl}/firefox/50.0/bedrock/download-links`,
        actionable: true,
      },
      {
        title: "Partner repacks",
        url: `${pollbotUrl}/firefox/50.0/archive/partner-repacks`,
        actionable: true,
      },
      {
        title: "Product details",
        url: `${pollbotUrl}/firefox/50.0/product-details`,
        actionable: true,
      },
      {
        title: "Release notes",
        url: `${pollbotUrl}/firefox/50.0/bedrock/release-notes`,
        actionable: true,
      },
      {
        title: "Security advisories",
        url: `${pollbotUrl}/firefox/50.0/bedrock/security-advisories`,
        actionable: true,
      },
      {
        title: "Telemetry Main Summary Uptake (24h latency)",
        url: `${pollbotUrl}/firefox/50.0/telemetry/main-summary-uptake`,
        actionable: false,
      },
    ],
  });
  fetchMock.get(`${pollbotUrl}/devedition/59.0b3`, {
    product: "devedition",
    version: "59.0b3",
    channel: "aurora",
    checks: [
      {
        title: "Archive Release",
        url: `${pollbotUrl}/devedition/59.0b3/archive`,
        actionable: true,
      },
      {
        title: "Balrog update rules",
        url: `${pollbotUrl}/devedition/59.0b3/balrog-rules`,
        actionable: true,
      },
      {
        title: "Bouncer",
        url: `${pollbotUrl}/devedition/59.0b3/bouncer`,
        actionable: true,
      },
      {
        title: "Buildhub release info",
        url: `${pollbotUrl}/devedition/59.0b3/buildhub`,
        actionable: true,
      },
      {
        title: "Devedition and Beta versions matches",
        url: `${pollbotUrl}/devedition/59.0b3/product-details/devedition-beta-versions-matches`,
        actionable: true,
      },
      {
        title: "Download links",
        url: `${pollbotUrl}/devedition/59.0b3/bedrock/download-links`,
        actionable: true,
      },
      {
        title: "Product details",
        url: `${pollbotUrl}/devedition/59.0b3/product-details`,
        actionable: true,
      },
      {
        title: "Release notes",
        url: `${pollbotUrl}/devedition/59.0b3/bedrock/release-notes`,
        actionable: true,
      },
      {
        title: "Telemetry Main Summary Uptake (24h latency)",
        url: `${pollbotUrl}/devedition/59.0b3/telemetry/main-summary-uptake`,
        actionable: false,
      },
    ],
  });
  fetchMock.get(`${pollbotUrl}/firefox/50.0/product-details`, {
    status: "exists",
    message: "We found product-details information about version 50.0",
    link: "https://product-details.mozilla.org/1.0/firefox.json",
  });
  fetchMock.get(`${pollbotUrl}/__version__`, {
    commit: "4e9557ef4cc0c36fb2f190e7cfec39d9f81fb636",
    version: "v1.4.4",
    source: "https://github.com/mozilla/PollBot",
    build: "https://circleci.com/gh/mozilla/PollBot/767",
  });
});

afterAll(() => {
  fetchMock.reset();
});

describe("getOngoingVersions", () => {
  it("retrieves the list of ongoing versions", async () => {
    const channelVersions = await getOngoingVersions("firefox");
    expect(channelVersions).toMatchObject({
      beta: expect.any(String),
      esr: expect.any(String),
      nightly: expect.any(String),
      release: expect.any(String),
    });
  });
});

describe("getReleaseInfo", () => {
  it("retrieves the release information for firefox", async () => {
    const releaseInfo = await getReleaseInfo("firefox", "50.0");
    expect(releaseInfo).toMatchObject({
      channel: expect.stringMatching(/nightly|beta|release|esr/),
      checks: expect.any(Array),
      product: "firefox",
      version: "50.0",
    });
    releaseInfo.checks.map((check) => {
      expect(check).toMatchObject({
        title: expect.any(String),
        url: expect.any(String),
      });
    });
  });
  it("retrieves the release information for devedition", async () => {
    const releaseInfo = await getReleaseInfo("devedition", "59.0b3");
    expect(releaseInfo).toMatchObject({
      channel: expect.stringMatching(/nightly|beta|release|esr|aurora/),
      checks: expect.any(Array),
      product: "devedition",
      version: "59.0b3",
    });
    releaseInfo.checks.map((check) => {
      expect(check).toMatchObject({
        title: expect.any(String),
        url: expect.any(String),
      });
    });
  });
});

describe("checkStatus", () => {
  it("retrieves the status of a given check", async () => {
    const status = await checkStatus(
      `${pollbotUrl}/firefox/50.0/product-details`
    );
    expect(status).toEqual({
      link: "https://product-details.mozilla.org/1.0/firefox.json",
      status: "exists",
      message: "We found product-details information about version 50.0",
    });
  });
});

describe("getPollbotVersion", () => {
  it("retrieves the version from Pollbot", async () => {
    const version = await getPollbotVersion();
    expect(version).toMatchObject({
      commit: expect.any(String),
      build: expect.any(String),
      source: expect.any(String),
      version: expect.any(String),
    });
  });
});
