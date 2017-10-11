// @flow

declare var auth0: any;

const AUTH0_CLIENT_ID = 'WYRYpJyS5DnDyxLTRVGCQGCWGo2KNQLN';
const AUTH0_DOMAIN = 'minimal-demo-iam.auth0.com';
const AUTH0_CALLBACK_URL = window.location.href;

export function webAuthHandler(callback: any, err: any, authResult: any) {
  if (err) {
    throw err;
  }
  if (authResult && authResult.accessToken && authResult.idToken) {
    window.location.hash = '';
    console.log('AuthResult', authResult);
    setSession(authResult);
    callback();
  }
}

export function initWebAuth() {
  const webAuth = new auth0.WebAuth({
    domain: AUTH0_DOMAIN,
    clientID: AUTH0_CLIENT_ID,
    redirectUri: AUTH0_CALLBACK_URL,
    audience: 'http://minimal-demo-iam.localhost:8000', // 'https://' + AUTH0_DOMAIN + '/userinfo',
    responseType: 'token id_token',
    scope: 'openid profile',
  });
  return webAuth;
}

function setSession(authResult) {
  // Set the time that the access token will expire at.
  const expiresAt = JSON.stringify(
    authResult.expiresIn * 1000 + new Date().getTime(),
  );
  localStorage.setItem('session', JSON.stringify(authResult));
  localStorage.setItem('expires_at', expiresAt);
}

export function logout() {
  // Remove tokens and expiry time from localStorage.
  localStorage.removeItem('session');
  localStorage.removeItem('expires_at');
}

export function isAuthenticated() {
  // Check whether the current time is past the access token's expiry time.
  const expiresAt = JSON.parse(localStorage.getItem('expires_at') || '0');
  return new Date().getTime() < expiresAt;
}
