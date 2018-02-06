import { all, call, put, select, takeEvery } from "redux-saga/effects";
import { cloneableGenerator } from "redux-saga/utils";
import {
  checkStatus,
  getOngoingVersions,
  getPollbotVersion,
  getReleaseInfo
} from "./PollbotAPI";
import {
  addCheckResult,
  addServerError,
  loggedOut,
  loginRequested,
  refreshCheckResult,
  setVersion,
  updateProductVersions,
  updatePollbotVersion,
  updateReleaseInfo
} from "./actions";
import {
  REFRESH_STATUS,
  REQUEST_LOGIN,
  REQUEST_LOGOUT,
  REQUEST_ONGOING_VERSIONS,
  REQUEST_POLLBOT_VERSION,
  REQUEST_STATUS,
  UPDATE_URL
} from "./types";
import {
  checkResultAndUpdate,
  checkResultAndUpdateAndNotify,
  fetchAndUpdateVersions,
  fetchOngoingVersions,
  fetchPollbotVersion,
  refreshStatus,
  requestLogin,
  requestLogout,
  requestStatus,
  rootSaga,
  updateUrl
} from "./sagas";
import { login, logout } from "./auth0";

describe("sagas", () => {
  it("handles fetchPollbotVersion", () => {
    const data = {};
    data.saga = cloneableGenerator(fetchPollbotVersion)();

    const pollbotVersion = {
      name: "pollbot",
      source: "https://github.com/mozilla/PollBot.git",
      version: "0.2.1-22-g8e09a0f",
      commit: "8e09a0f8e995344ea24fbb940a6bddc17e0edaed"
    };
    expect(data.saga.next().value).toEqual(call(getPollbotVersion));

    // Clone to test success and failure of getPollbotVersion.
    data.sagaThrow = data.saga.clone();

    expect(data.saga.next(pollbotVersion).value).toEqual(
      put(updatePollbotVersion(pollbotVersion))
    );
    expect(data.saga.next().done).toBe(true);

    console.error = jest.fn();
    data.sagaThrow.throw("error");
    expect(console.error).toHaveBeenCalledWith(
      "Failed getting the pollbot version",
      "error"
    );
    expect(data.sagaThrow.next().done).toBe(true);
  });

  it("handles fetchOngoingVersions", () => {
    const data = {};
    data.saga = cloneableGenerator(fetchOngoingVersions)();

    expect(data.saga.next().value).toEqual(
      all([
        call(fetchAndUpdateVersions, "firefox"),
        call(fetchAndUpdateVersions, "devedition")
      ])
    );
    expect(data.saga.next().done).toBe(true);
  });

  it("handles fetchAndUpdateVersions", () => {
    const data = {};
    data.saga = cloneableGenerator(fetchAndUpdateVersions)("firefox");

    const channelVersions = {
      nightly: "57.0a1",
      beta: "56.0b12",
      release: "55.0.3",
      esr: "52.3.0esr"
    };
    expect(data.saga.next().value).toEqual(call(getOngoingVersions, "firefox"));

    // Clone to test success and failure of getOngoingVersions.
    data.sagaThrow = data.saga.clone();

    expect(data.saga.next(channelVersions).value).toEqual(
      put(updateProductVersions("firefox", channelVersions))
    );
    expect(data.saga.next().done).toBe(true);

    console.error = jest.fn();
    data.sagaThrow.throw("error");
    expect(console.error).toHaveBeenCalledWith(
      "Failed getting the latest channel versions for product: firefox",
      "error"
    );
    expect(data.sagaThrow.next().done).toBe(true);
  });

  it("handles updateUrl", () => {
    const saga = updateUrl();

    expect(saga.next().value).toEqual(select());
    expect(window.location.hash).not.toEqual("#pollbot/firefox/50.0");
    saga.next({ version: ["firefox", "50.0"] });
    expect(window.location.hash).toEqual("#pollbot/firefox/50.0");
  });

  it("notifies using checkResultAndUpdateAndNotify", () => {
    // Mock the Notification API call.
    global.Notification = jest.fn();
    global.Notification.permission = "granted";

    const checkResult = {
      status: "exists",
      message: "check succesful",
      link: "some link"
    };
    const checkResultFailing = {
      status: "incomplete",
      message: "check incomplete",
      link: "some link"
    };

    const data = {};
    data.saga = cloneableGenerator(checkResultAndUpdateAndNotify)(
      "some test",
      "some url",
      checkResultFailing
    );

    expect(data.saga.next().value).toEqual(
      put(refreshCheckResult("some test"))
    );

    expect(data.saga.next().value).toEqual(
      call(checkResultAndUpdate, "some test", "some url")
    );
    expect(data.saga.next().value).toEqual(select());

    // Clone to test the branch where there's no change in the result.
    data.sagaResultUnchanged = data.saga.clone();

    // No notification if the result hasn't changed.
    expect(
      data.sagaResultUnchanged.next({
        checkResults: { "some test": checkResultFailing }
      }).done
    ).toBe(true);
    expect(global.Notification).toHaveBeenCalledTimes(0);

    // Notify if the result has changed.
    expect(
      data.saga.next({
        checkResults: { "some test": checkResult }
      }).done
    ).toBe(true);
    expect(global.Notification).toHaveBeenCalledTimes(1);
    expect(global.Notification).toHaveBeenCalledWith(
      "some test: status changed (exists)."
    );
  });

  it("handles refreshStatus", () => {
    const data = {};
    data.saga = cloneableGenerator(refreshStatus)();

    const releaseInfo = {
      channel: "release",
      product: "firefox",
      version: "50.0",
      checks: [
        {
          title: "some test",
          url: "some url"
        },
        {
          title: "some other test",
          url: "some other url"
        }
      ]
    };
    const checkResult = {
      status: "exists",
      message: "check succesful",
      link: "some link"
    };
    const checkResultFailing = {
      status: "incomplete",
      message: "check incomplete",
      link: "some link"
    };

    expect(data.saga.next().value).toEqual(select());

    expect(
      data.saga.next({
        version: "50.0",
        releaseInfo: releaseInfo,
        checkResults: {
          "some test": checkResult,
          "some other test": checkResultFailing
        }
      }).value
    ).toEqual(
      all([
        call(
          checkResultAndUpdateAndNotify,
          "some other test",
          "some other url",
          checkResultFailing
        )
      ])
    );
    expect(data.saga.next().done).toBe(true);
  });

  it("checks result and updates state using checkResultAndUpdate", () => {
    const data = {};
    data.saga = cloneableGenerator(checkResultAndUpdate)(
      "some test",
      "some url"
    );

    const checkResult = {
      status: "exists",
      message: "check succesful",
      link: "some link"
    };

    expect(data.saga.next().value).toEqual(call(checkStatus, "some url"));

    // Clone to test success and failure of checkStatus.
    data.sagaThrow = data.saga.clone();

    // checkStatus throws an error.
    console.error = jest.fn();
    expect(data.sagaThrow.throw("error").value).toEqual(
      put(addServerError("some test", "error"))
    );
    expect(console.error).toHaveBeenCalledWith(
      "Failed getting some test check result",
      "error"
    );
    expect(data.sagaThrow.next().done).toBe(true);

    // checkStatus completes correctly.
    expect(data.saga.next(checkResult).value).toEqual(
      put(addCheckResult("some test", checkResult))
    );
  });

  it("handles requestStatus", () => {
    const data = {};
    data.saga = cloneableGenerator(requestStatus)({
      product: "firefox",
      version: "50.0"
    });

    const releaseInfo = {
      channel: "release",
      product: "firefox",
      version: "50.0",
      checks: [
        {
          title: "some test",
          url: "some url"
        },
        {
          title: "some other test",
          url: "some other url"
        }
      ]
    };

    expect(data.saga.next().value).toEqual(select());
    expect(
      data.saga.next({
        productVersions: {
          firefox: {
            release: "50.0"
          }
        }
      }).value
    ).toEqual(put(setVersion("firefox", "50.0")));
    expect(data.saga.next().value).toEqual(call(updateUrl));
    expect(data.saga.next().value).toEqual(
      call(getReleaseInfo, "firefox", "50.0")
    );

    // Clone to test success and failure of getReleaseInfo.
    data.sagaThrow = data.saga.clone();

    // getReleaseInfo throws an error.
    console.error = jest.fn();
    data.sagaThrow.throw("error");
    expect(console.error).toHaveBeenCalledWith(
      "Failed getting the release info for firefox 50.0",
      "error"
    );
    expect(data.sagaThrow.next().done).toBe(true);

    // getReleaseInfo completes correctly.
    expect(data.saga.next(releaseInfo).value).toEqual(
      put(updateReleaseInfo(releaseInfo))
    );
    expect(data.saga.next().value).toEqual(
      all([
        call(checkResultAndUpdate, "some test", "some url"),
        call(checkResultAndUpdate, "some other test", "some other url")
      ])
    );
    expect(data.saga.next().done).toBe(true);
  });

  it("handles requestStatus with a canonical url (using the channel)", () => {
    const data = {};
    // Request status for "release", it should in turn set version for "50.0".
    data.saga = cloneableGenerator(requestStatus)({
      product: "firefox",
      version: "release"
    });

    const releaseInfo = {
      channel: "release",
      product: "firefox",
      version: "50.0",
      checks: [
        {
          title: "some test",
          url: "some url"
        },
        {
          title: "some other test",
          url: "some other url"
        }
      ]
    };

    expect(data.saga.next().value).toEqual(select());
    expect(
      data.saga.next({
        productVersions: {
          firefox: {
            release: "50.0"
          }
        }
      }).value
    ).toEqual(put(setVersion("firefox", "50.0")));
    expect(data.saga.next().value).toEqual(call(updateUrl));
    expect(data.saga.next().value).toEqual(
      call(getReleaseInfo, "firefox", "50.0")
    );

    // Clone to test success and failure of getReleaseInfo.
    data.sagaThrow = data.saga.clone();

    // getReleaseInfo throws an error.
    console.error = jest.fn();
    data.sagaThrow.throw("error");
    expect(console.error).toHaveBeenCalledWith(
      "Failed getting the release info for firefox 50.0",
      "error"
    );
    expect(data.sagaThrow.next().done).toBe(true);

    // getReleaseInfo completes correctly.
    expect(data.saga.next(releaseInfo).value).toEqual(
      put(updateReleaseInfo(releaseInfo))
    );
    expect(data.saga.next().value).toEqual(
      all([
        call(checkResultAndUpdate, "some test", "some url"),
        call(checkResultAndUpdate, "some other test", "some other url")
      ])
    );
    expect(data.saga.next().done).toBe(true);
  });

  it("handles requestStatus with a canonical url (using the channel) with a cold cache", () => {
    const data = {};
    // Request status for "release", it should in turn set version for "50.0".
    data.saga = cloneableGenerator(requestStatus)({
      product: "firefox",
      version: "release"
    });

    const releaseInfo = {
      channel: "release",
      product: "firefox",
      version: "50.0",
      checks: [
        {
          title: "some test",
          url: "some url"
        },
        {
          title: "some other test",
          url: "some other url"
        }
      ]
    };

    expect(data.saga.next().value).toEqual(select());
    expect(data.saga.next({ productVersions: {} }).value).toEqual(
      call(getOngoingVersions, "firefox")
    );
    expect(data.saga.next({ release: "50.0" }).value).toEqual(
      put(updateProductVersions("firefox", { release: "50.0" }))
    );

    expect(data.saga.next().value).toEqual(select());
    expect(
      data.saga.next({
        productVersions: { firefox: { release: "50.0" } }
      }).value
    ).toEqual(put(setVersion("firefox", "50.0")));
    expect(data.saga.next().value).toEqual(call(updateUrl));
    expect(data.saga.next().value).toEqual(
      call(getReleaseInfo, "firefox", "50.0")
    );

    // Clone to test success and failure of getReleaseInfo.
    data.sagaThrow = data.saga.clone();

    // getReleaseInfo throws an error.
    console.error = jest.fn();
    data.sagaThrow.throw("error");
    expect(console.error).toHaveBeenCalledWith(
      "Failed getting the release info for firefox 50.0",
      "error"
    );
    expect(data.sagaThrow.next().done).toBe(true);

    // getReleaseInfo completes correctly.
    expect(data.saga.next(releaseInfo).value).toEqual(
      put(updateReleaseInfo(releaseInfo))
    );
    expect(data.saga.next().value).toEqual(
      all([
        call(checkResultAndUpdate, "some test", "some url"),
        call(checkResultAndUpdate, "some other test", "some other url")
      ])
    );
    expect(data.saga.next().done).toBe(true);
  });

  it("handles requestLogin", () => {
    const data = {};
    data.saga = cloneableGenerator(requestLogin)();

    expect(data.saga.next().value).toEqual(put(loginRequested()));
    expect(data.saga.next().value).toEqual(call(login));

    // Clone to test success and failure of getReleaseInfo.
    data.sagaThrow = data.saga.clone();

    // login throws an error.
    console.error = jest.fn();
    expect(data.sagaThrow.throw("error").value).toEqual(put(loggedOut()));
    expect(console.error).toHaveBeenCalledWith("Login failed", "error");
    expect(data.sagaThrow.next().done).toBe(true);

    // login completes correctly.
    expect(data.saga.next().done).toBe(true);
  });

  it("handles requestLogout", () => {
    const data = {};
    data.saga = cloneableGenerator(requestLogout)();

    expect(data.saga.next().value).toEqual(call(logout));
    expect(data.saga.next().value).toEqual(put(loggedOut()));

    // Clone to test success and failure of getReleaseInfo.
    data.sagaThrow = data.saga.clone();

    // login throws an error.
    console.error = jest.fn();
    expect(data.sagaThrow.throw("error").done).toBe(true);
    expect(console.error).toHaveBeenCalledWith("Logout failed", "error");

    // login completes correctly.
    expect(data.saga.next().done).toBe(true);
  });
});

describe("rootSaga", () => {
  it("uses takeEvery on each saga available", () => {
    const saga = rootSaga();
    expect(saga.next().value).toEqual(
      all([
        takeEvery(REQUEST_ONGOING_VERSIONS, fetchOngoingVersions),
        takeEvery(REQUEST_POLLBOT_VERSION, fetchPollbotVersion),
        takeEvery(UPDATE_URL, updateUrl),
        takeEvery(REFRESH_STATUS, refreshStatus),
        takeEvery(REQUEST_STATUS, requestStatus),
        takeEvery(REQUEST_LOGIN, requestLogin),
        takeEvery(REQUEST_LOGOUT, requestLogout)
      ])
    );
    expect(saga.next().done).toBe(true);
  });
});
