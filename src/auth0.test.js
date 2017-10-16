import {
  AUTH0_CALLBACK_URL,
  AUTH0_CLIENT_ID,
  AUTH0_DOMAIN,
  checkLogin,
  fetchUserInfo,
  handleUserInfo,
  initWebAuth,
  isAuthenticated,
  login,
  logout,
  setSession,
  webAuthHandler,
} from './auth0';

// Mock the localStorage API.
global.localStorage = (function() {
  var store = {};

  return {
    getItem: function(key) {
      return store[key] || null;
    },
    removeItem: function(key) {
      delete store[key];
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    clear: function() {
      store = {};
    },
  };
})();

const webAuthMock = {
  authorize: jest.fn(),
  parseHash: jest.fn(),
  client: {userInfo: jest.fn()},
};

global.auth0 = {
  WebAuth: jest.fn(() => webAuthMock),
};

const authResult = {
  accessToken: 'access token',
  idToken: 'id token',
  expiresIn: 100,
};

describe('webAuthHandler', () => {
  const callback = jest.fn();
  it('throws an error', () => {
    expect(() => webAuthHandler(callback, 'some error', 'some result')).toThrow(
      'some error',
    );
  });
  it('sets the session and runs the callback', () => {
    window.location = {hash: 'some hash'};

    webAuthHandler(callback, null, authResult);
    expect(window.location.hash).toEqual('');
    expect(callback).toHaveBeenCalledWith(authResult);
    expect(callback).toHaveBeenCalledWith(authResult);
  });
});

describe('initWebAuth', () => {
  it('returns an initialized web auth', () => {
    const webAuth = initWebAuth();
    expect(global.auth0.WebAuth).toHaveBeenCalledWith({
      domain: AUTH0_DOMAIN,
      clientID: AUTH0_CLIENT_ID,
      redirectUri: AUTH0_CALLBACK_URL,
      audience: 'http://minimal-demo-iam.localhost:8000', // 'https://' + AUTH0_DOMAIN + '/userinfo',
      responseType: 'token id_token',
      scope: 'openid profile',
    });
    expect(webAuth).toEqual(webAuthMock);
  });
});

describe('setSession', () => {
  it('sets the auth result in the local storage', () => {
    global.Date = jest.fn(() => ({
      getTime: () => 0,
    }));
    setSession(authResult);
    expect(global.localStorage.getItem('session')).toEqual(
      JSON.stringify(authResult),
    );
    expect(global.localStorage.getItem('expires_at')).toEqual(
      JSON.stringify(100 * 1000),
    );
  });
});

describe('login', () => {
  it('initializes the webAuth and authorizes', () => {
    const mockAuthorize = jest.fn();
    const mockInitWebAuth = jest.fn(() => ({authorize: mockAuthorize}));
    login(mockInitWebAuth);
    expect(mockInitWebAuth).toHaveBeenCalledTimes(1);
    expect(mockAuthorize).toHaveBeenCalledTimes(1);
  });
});

describe('logout', () => {
  it('removes the entries from the localStorage', () => {
    global.localStorage.clear();
    expect(global.localStorage.getItem('session')).toEqual(null);
    expect(global.localStorage.getItem('expires_at')).toEqual(null);
    logout();
    expect(global.localStorage.getItem('session')).toEqual(null);
    expect(global.localStorage.getItem('expires_at')).toEqual(null);

    global.localStorage.setItem('session', 'a session');
    global.localStorage.setItem('expires_at', 'an expiration delay');
    logout();
    expect(global.localStorage.getItem('session')).toEqual(null);
    expect(global.localStorage.getItem('expires_at')).toEqual(null);
  });
});

describe('checkLogin', () => {
  it('checks if logged in', () => {
    const onLoggedIn = jest.fn();
    const parseHash = jest.fn();
    const handler = jest.fn();
    const initWebAuth = jest.fn(() => ({parseHash: parseHash}));
    checkLogin(onLoggedIn, initWebAuth, handler);
    expect(initWebAuth).toHaveBeenCalledTimes(1);
    expect(parseHash).toHaveBeenCalledTimes(1);
  });
  it('logs a message in the console if the login failed', () => {
    const onLoggedIn = jest.fn();
    const parseHash = jest.fn(() => {
      throw 'foo';
    });
    const handler = jest.fn();
    const initWebAuth = jest.fn(() => ({parseHash: parseHash}));
    global.console.error = jest.fn();
    try {
      checkLogin(onLoggedIn, initWebAuth, handler);
      expect('We should not reach this line').toEqual('');
    } catch (err) {
      expect(global.console.error).toHaveBeenCalledWith('Login failed', 'foo');
    }
  });
});

describe('isAuthenticated', () => {
  it('returns true if authenticated', () => {
    global.Date = jest.fn(() => ({
      getTime: () => 0,
    }));
    global.localStorage.setItem('session', 'a session');
    global.localStorage.setItem('expires_at', 100);
    expect(isAuthenticated()).toBe(true);
  });
  it('returns false if there is no session', () => {
    global.localStorage.clear();
    global.localStorage.setItem('expires_at', 100);
    expect(isAuthenticated()).toBe(false);
  });
  it('returns false if the expiration date is in the past', () => {
    global.Date = jest.fn(() => ({
      getTime: () => 1000,
    }));
    global.localStorage.setItem('session', 'a session');
    global.localStorage.setItem('expires_at', 100);
    expect(isAuthenticated()).toBe(false);
  });
});

describe('handleUserInfo', () => {
  it('calls the callback with the user info', () => {
    const onUserInfo = jest.fn();
    handleUserInfo(onUserInfo, null, 'some profile');
    expect(onUserInfo).toHaveBeenCalledWith('some profile');
  });
  it('throws if there was an error', () => {
    const onUserInfo = jest.fn();
    try {
      handleUserInfo(onUserInfo, 'some error');
      expect('We should not reach this line').toEqual('');
    } catch (err) {
      expect(err).toEqual('some error');
    }
  });
});

describe('fetchUserInfo', () => {
  it('returns user info if authenticated', () => {
    const userInfo = jest.fn();
    const initWebAuth = jest.fn(() => ({client: {userInfo: userInfo}}));
    global.localStorage.setItem('session', '{"accessToken": "abc"}');
    fetchUserInfo(jest.fn(), initWebAuth);
    expect(userInfo).toHaveBeenCalledTimes(1);
    expect(userInfo.mock.calls[0][0]).toEqual('abc');
  });
  it('returns undefined if not authenticated', () => {
    global.localStorage.setItem('session', '');
    expect(fetchUserInfo(jest.fn(), initWebAuth)).toEqual(undefined);

    global.localStorage.setItem('session', '{}');
    expect(fetchUserInfo(jest.fn(), initWebAuth)).toEqual(undefined);
  });
});
