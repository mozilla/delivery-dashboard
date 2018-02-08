// @flow

import {
  REQUEST_ONGOING_VERSIONS,
  REQUEST_POLLBOT_VERSION,
  UPDATE_URL,
  REFRESH_STATUS,
  REQUEST_STATUS,
  products
} from "./types";
import type {
  APIVersionData,
  CheckResult,
  VersionsDict,
  Product,
  ReleaseInfo,
  RequestStatus,
  State
} from "./types";
import { all, call, put, select, takeEvery } from "redux-saga/effects";
import {
  checkStatus,
  getOngoingVersions,
  getPollbotVersion,
  getReleaseInfo
} from "./PollbotAPI";
import {
  addCheckResult,
  addServerError,
  localUrlFromVersion,
  refreshCheckResult,
  setVersion,
  updateProductVersions,
  updatePollbotVersion,
  updateReleaseInfo
} from "./actions";

type Saga = Generator<*, void, *>;

// Fetching the version from the Pollbot service.
export function* fetchPollbotVersion(): Saga {
  try {
    const version: APIVersionData = yield call(getPollbotVersion);
    yield put(updatePollbotVersion(version));
  } catch (err) {
    console.error("Failed getting the pollbot version", err);
  }
}

export function* fetchAndUpdateVersions(product: Product): Saga {
  try {
    const versions: VersionsDict = yield call(getOngoingVersions, product);
    yield put(updateProductVersions(product, versions));
  } catch (err) {
    console.error(
      "Failed getting the latest channel versions for product: " + product,
      err
    );
  }
}

// Fetching the ongoing versions.
export function* fetchOngoingVersions(): Saga {
  yield all(products.map(product => call(fetchAndUpdateVersions, product)));
}

// Update the url from the version stored in the state.
export function* updateUrl(): Saga {
  const state: State = yield select();
  window.location.hash = localUrlFromVersion(state.version);
}

export function* checkResultAndUpdateAndNotify(
  title: string,
  url: string,
  prevResult: CheckResult
): Saga {
  const notifyChanges = (checkTitle, status) => {
    if (Notification.permission === "granted") {
      new Notification(`${checkTitle}: status changed (${status}).`);
    }
  };

  // Make sure the check we're refreshing is shown as being refreshed.
  yield put(refreshCheckResult(title));
  yield call(checkResultAndUpdate, title, url);
  const state: State = yield select();
  const result: CheckResult = state.checkResults && state.checkResults[title];
  if (prevResult && result && prevResult.status !== result.status) {
    notifyChanges(title, result.status);
  }
}

// Refreshing a status for the current version.
export function* refreshStatus(): Saga {
  const state: State = yield select();
  // Save previous results so we can check if something changed.
  const prevResults = state.checkResults;
  if (state.releaseInfo && state.releaseInfo.checks) {
    yield all(
      state.releaseInfo.checks
        // only refresh checks that were failing.
        .filter(({ title }) => state.checkResults[title].status !== "exists")
        .map(({ url, title }) =>
          call(checkResultAndUpdateAndNotify, title, url, prevResults[title])
        )
    );
  }
}

export function* checkResultAndUpdate(title: string, url: string): Saga {
  try {
    const result = yield call(checkStatus, url);
    yield put(addCheckResult(title, result));
  } catch (err) {
    console.error(`Failed getting ${title} check result`, err);
    yield put(addServerError(title, err));
  }
}

// Requesting a status for a new version.
export function* requestStatus(action: RequestStatus): Saga {
  let { product, version } = action;
  let { productVersions } = yield select();
  try {
    if (
      Object.keys(productVersions).length === 0 ||
      !productVersions.hasOwnProperty(product) ||
      Object.keys(productVersions[product]).length === 0
    ) {
      // We don't have the product channel versions yet.
      const versions = yield call(getOngoingVersions, product);
      yield put(updateProductVersions(product, versions));
      // We now have the product channel versions.
      ({ productVersions } = yield select());
    }
    if (productVersions[product].hasOwnProperty(version)) {
      version = productVersions[product][version];
    }
    yield put(setVersion(product, version));
    yield call(updateUrl);
    const releaseInfo: ReleaseInfo = yield call(
      getReleaseInfo,
      product,
      version
    );
    yield put(updateReleaseInfo(releaseInfo));
    yield all(
      releaseInfo.checks.map(({ url, title }) =>
        call(checkResultAndUpdate, title, url)
      )
    );
  } catch (err) {
    console.error(
      `Failed getting the release info for ${product} ${version}`,
      err
    );
  }
}

// Root saga.
export function* rootSaga(): Saga {
  yield all([
    takeEvery(REQUEST_ONGOING_VERSIONS, fetchOngoingVersions),
    takeEvery(REQUEST_POLLBOT_VERSION, fetchPollbotVersion),
    takeEvery(UPDATE_URL, updateUrl),
    takeEvery(REFRESH_STATUS, refreshStatus),
    takeEvery(REQUEST_STATUS, requestStatus)
  ]);
}
