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
export type OngoingVersion = [string, string];
export type OngoingVersions = OngoingVersion[];

export type Product = 'firefox';
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
  +channel: string,
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

export type Login = 'LOGGED_OUT' | 'LOGIN_REQUESTED' | 'LOGGED_IN';
export const LOGGED_OUT = 'LOGGED_OUT';
export const LOGIN_REQUESTED = 'LOGIN_REQUESTED';
export const LOGGED_IN = 'LOGGED_IN';

export type State = {
  +version: string,
  +versionInput: string,
  +latestChannelVersions: OngoingVersions,
  +releaseInfo: ?ReleaseInfo,
  +checkResults: CheckResults,
  +pollbotVersion: ?APIVersionData,
  +shouldRefresh: boolean,
  +login: Login,
  +userInfo: any,
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
export const UPDATE_USER_INFO = 'UPDATE_USER_INFO';

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
export type LoggedIn = {|
  type: 'LOGGED_IN',
|};
export type LoggedOut = {|
  type: 'LOGGED_OUT',
|};
export type LoginRequested = {|
  type: 'LOGIN_REQUESTED',
|};
export type UpdateUserInfo = {|
  type: 'UPDATE_USER_INFO',
  userInfo: any,
|};

/*
 * saga types
 */
export const REQUEST_ONGOING_VERSIONS = 'REQUEST_ONGOING_VERSIONS';
export const REQUEST_POLLBOT_VERSION = 'REQUEST_POLLBOT_VERSION';
export const UPDATE_URL = 'UPDATE_URL';
export const REFRESH_STATUS = 'REFRESH_STATUS';
export const REQUEST_STATUS = 'REQUEST_STATUS';
export const REQUEST_LOGIN = 'REQUEST_LOGIN';
export const REQUEST_LOGOUT = 'REQUEST_LOGOUT';

export type RequestOngoingVersions = {|
  type: 'REQUEST_ONGOING_VERSIONS',
|};

export type RequestPollbotVersion = {|
  type: 'REQUEST_POLLBOT_VERSION',
|};

export type UpdateUrl = {|
  type: 'UPDATE_URL',
|};

export type RefreshStatus = {|
  type: 'REFRESH_STATUS',
|};

export type RequestStatus = {|
  type: 'REQUEST_STATUS',
  version: string,
|};

export type RequestLogin = {|
  type: 'REQUEST_LOGIN',
|};

export type RequestLogout = {|
  type: 'REQUEST_LOGOUT',
|};

export type Action =
  | AddCheckResult
  | LoggedIn
  | LoggedOut
  | LoginRequested
  | RefreshStatus
  | RequestLogin
  | RequestLogout
  | RequestOngoingVersions
  | RequestPollbotVersion
  | RequestStatus
  | SetVersion
  | SubmitVersion
  | UpdateLatestChannelVersions
  | UpdatePollbotVersion
  | UpdateReleaseInfo
  | UpdateUrl
  | UpdateUserInfo
  | UpdateVersionInput;

/*
 * Redux types
 */
export type GetState = ReduxGetState<State>;
export type ThunkAction<Result> = ReduxThunkAction<State, Action, Result>;
export type Store = ReduxStore<State, Action>;
export type Dispatch = ReduxDispatch<State, Action>;
