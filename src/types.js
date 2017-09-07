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

export type State = {
  +version: string,
  +versionInput: string,
  +latestChannelVersions: ?OngoingVersions,
  +releaseInfo: ?ReleaseInfo,
  +checkResults: CheckResults,
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

export type Action =
  | AddCheckResult
  | SetVersion
  | SubmitVersion
  | UpdateLatestChannelVersions
  | UpdateReleaseInfo
  | UpdateVersionInput;

/*
 * Redux types
 */
export type GetState = ReduxGetState<State>;
export type ThunkAction<Result> = ReduxThunkAction<State, Action, Result>;
export type Store = ReduxStore<State, Action>;
export type Dispatch = ReduxDispatch<State, Action>;
