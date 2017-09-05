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
  nightly: string,
  beta: string,
  release: string,
  esr: string,
};

export type Channel = 'nightly' | 'beta' | 'release' | 'esr';
export type Status = 'missing' | 'exists' | 'incomplete' | 'error';
export type Check =
  | 'archive'
  | 'product_details'
  | 'release_notes'
  | 'security_advisories'
  | 'download_links';

export type CheckResult = {
  status: Status,
  message?: string,
};

export type Statuses = {
  archive: ?CheckResult,
  product_details: ?CheckResult,
  release_notes: ?CheckResult,
  security_advisories: ?CheckResult,
  download_links: ?CheckResult,
};

export type State = {
  version: string,
  versionInput: string,
  latestChannelVersions: ?OngoingVersions,
  statuses: Statuses,
};

/*
 * action types
 */
export const SET_VERSION = 'SET_VERSION';
export const UPDATE_VERSION_INPUT = 'UPDATE_VERSION_INPUT';
export const SUBMIT_VERSION = 'SUBMIT_VERSION';
export const UPDATE_LATEST_CHANNEL_VERSIONS = 'UPDATE_LATEST_CHANNEL_VERSIONS';
export const UPDATE_STATUSES = 'UPDATE_STATUSES';

export type SetVersion = {
  type: 'SET_VERSION',
  version: string,
};
export type UpdateVersionInput = {
  type: 'UPDATE_VERSION_INPUT',
  version: string,
};
export type SubmitVersion = {
  type: 'SUBMIT_VERSION',
};
export type UpdateLatestChannelVersions = {
  type: 'UPDATE_LATEST_CHANNEL_VERSIONS',
  versions: OngoingVersions,
};
export type UpdateStatuses = {
  type: 'UPDATE_STATUSES',
  statuses: Statuses,
};

export type Action =
  | SetVersion
  | UpdateVersionInput
  | SubmitVersion
  | UpdateLatestChannelVersions
  | UpdateStatuses;

/*
 * Redux types
 */
export type GetState = ReduxGetState<State>;
export type ThunkAction<Result> = ReduxThunkAction<State, Action, Result>;
export type Store = ReduxStore<State, Action>;
export type Dispatch = ReduxDispatch<State, Action>;
