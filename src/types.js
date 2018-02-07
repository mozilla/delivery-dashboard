// @flow
import type {
  Store as ReduxStore,
  ThunkAction as ReduxThunkAction,
  Dispatch as ReduxDispatch,
  GetState as ReduxGetState,
} from 'redux';

export const products = ['firefox', 'devedition'];

/*
 * state types
 */
export type Product = 'firefox' | 'devedition';
export type Status = 'missing' | 'exists' | 'incomplete' | 'error';

export type ChannelVersion = [string, string];
export type ChannelVersions = ChannelVersion[];
export type VersionsDict = {[channel: string]: string};
export type ProductVersions = {
  [product: Product]: VersionsDict,
};

export type CheckInfo = {
  +url: string,
  +title: string,
  +actionable: boolean,
};

export type ReleaseInfo = {
  +channel: string,
  +product: Product,
  +version: string,
  +checks: CheckInfo[],
  +message: string,
  +status: number,
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

/* Error: [title, errorMessage] */
export type Error = [string, string];

export type State = {
  +version: [Product, string],
  +productVersions: ProductVersions,
  +releaseInfo: ?ReleaseInfo,
  +checkResults: CheckResults,
  +pollbotVersion: ?APIVersionData,
  +shouldRefresh: boolean,
  +errors: Error[],
};

/*
 * action types
 */
export const ADD_CHECK_RESULT = 'ADD_CHECK_RESULT';
export const REFRESH_CHECK_RESULT = 'REFRESH_CHECK_RESULT';
export const ADD_SERVER_ERROR = 'ADD_SERVER_ERROR';
export const SET_VERSION = 'SET_VERSION';
export const UPDATE_PRODUCT_VERSIONS = 'UPDATE_PRODUCT_VERSIONS';
export const UPDATE_RELEASE_INFO = 'UPDATE_RELEASE_INFO';
export const UPDATE_POLLBOT_VERSION = 'UPDATE_POLLBOT_VERSION';

export type AddCheckResult = {|
  type: 'ADD_CHECK_RESULT',
  title: string,
  result: CheckResult,
|};
export type RefreshCheckResult = {|
  type: 'REFRESH_CHECK_RESULT',
  title: string,
|};
export type AddServerError = {|
  type: 'ADD_SERVER_ERROR',
  title: string,
  err: string,
|};
export type SetVersion = {|
  type: 'SET_VERSION',
  product: Product,
  version: string,
|};
export type UpdateProductVersions = {|
  type: 'UPDATE_PRODUCT_VERSIONS',
  versions: VersionsDict,
  product: Product,
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
export const REFRESH_STATUS = 'REFRESH_STATUS';
export const REQUEST_STATUS = 'REQUEST_STATUS';

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
  product: Product,
  version: string,
|};

export type Action =
  | AddCheckResult
  | RefreshCheckResult
  | AddServerError
  | RefreshStatus
  | RequestOngoingVersions
  | RequestPollbotVersion
  | RequestStatus
  | SetVersion
  | UpdateProductVersions
  | UpdatePollbotVersion
  | UpdateReleaseInfo
  | UpdateUrl;

/*
 * Redux types
 */
export type GetState = ReduxGetState<State>;
export type ThunkAction<Result> = ReduxThunkAction<State, Action, Result>;
export type Store = ReduxStore<State, Action>;
export type Dispatch = ReduxDispatch<State, Action>;
