// @flow
import type {
  Store as ReduxStore,
  ThunkAction as ReduxThunkAction,
  Dispatch as ReduxDispatch,
  GetState as ReduxGetState,
} from 'redux';

/*
 * state types
 */
export type OngoingVersions = ?{
  +nightly: string,
  +beta: string,
  +release: string,
  +esr: string,
};

export type Product = 'firefox';
export type Channel = 'nightly' | 'beta' | 'release' | 'esr';
export type Status = 'missing' | 'exists' | 'incomplete' | 'error';
export type Check =
  | 'archive'
  | 'product_details'
  | 'release_notes'
  | 'security_advisories'
  | 'download_links';

export type CheckInfo = {
  +url: string,
  +title: string,
};

export type ReleaseInfo = {
  +channel: Channel,
  +product: Product,
  +version: string,
  +checks: CheckInfo[],
};

export type CheckResult = {
  +status: Status,
  +message: string,
  +link: string,
};

export type CheckResults = {
  [check: string]: CheckResult,
};

export type APIVersionData = {
  name: string,
  version: string,
  source: string,
  commit: string,
};

export type State = {
  +version: string,
  +versionInput: string,
  +latestChannelVersions: ?OngoingVersions,
  +releaseInfo: ?ReleaseInfo,
  +checkResults: CheckResults,
  +pollbotVersion: ?APIVersionData,
  +shouldRefresh: boolean,
};

/*
 * action types
 */
export const ADD_CHECK_RESULT = 'ADD_CHECK_RESULT';
export const SET_VERSION = 'SET_VERSION';
export const UPDATE_VERSION_INPUT = 'UPDATE_VERSION_INPUT';
export const SUBMIT_VERSION = 'SUBMIT_VERSION';
export const UPDATE_LATEST_CHANNEL_VERSIONS = 'UPDATE_LATEST_CHANNEL_VERSIONS';
export const UPDATE_RELEASE_INFO = 'UPDATE_RELEASE_INFO';
export const UPDATE_POLLBOT_VERSION = 'UPDATE_POLLBOT_VERSION';

export type AddCheckResult = {|
  type: 'ADD_CHECK_RESULT',
  title: string,
  result: CheckResult,
|};
export type SetVersion = {|
  type: 'SET_VERSION',
  version: string,
|};
export type UpdateVersionInput = {|
  type: 'UPDATE_VERSION_INPUT',
  version: string,
|};
export type SubmitVersion = {|
  type: 'SUBMIT_VERSION',
|};
export type UpdateLatestChannelVersions = {|
  type: 'UPDATE_LATEST_CHANNEL_VERSIONS',
  versions: OngoingVersions,
|};
export type UpdateReleaseInfo = {|
  type: 'UPDATE_RELEASE_INFO',
  releaseInfo: ReleaseInfo,
|};
export type UpdatePollbotVersion = {|
  type: 'UPDATE_POLLBOT_VERSION',
  version: APIVersionData,
|};

/*
 * saga types
 */
export const REQUEST_ONGOING_VERSIONS = 'REQUEST_ONGOING_VERSIONS';
export const REQUEST_POLLBOT_VERSION = 'REQUEST_POLLBOT_VERSION';
export const UPDATE_URL = 'UPDATE_URL';

export type RequestOngoingVersions = {|
  type: 'REQUEST_ONGOING_VERSIONS',
|};

export type RequestPollbotVersion = {|
  type: 'REQUEST_POLLBOT_VERSION',
|};

export type UpdateUrl = {|
  type: 'UPDATE_URL',
|};

export type Action =
  | AddCheckResult
  | RequestOngoingVersions
  | RequestPollbotVersion
  | SetVersion
  | SubmitVersion
  | UpdateLatestChannelVersions
  | UpdatePollbotVersion
  | UpdateReleaseInfo
  | UpdateUrl
  | UpdateVersionInput;

/*
 * Redux types
 */
export type GetState = ReduxGetState<State>;
export type ThunkAction<Result> = ReduxThunkAction<State, Action, Result>;
export type Store = ReduxStore<State, Action>;
export type Dispatch = ReduxDispatch<State, Action>;
