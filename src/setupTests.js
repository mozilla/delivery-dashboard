const URLSearchParamsMock = {
  get(item) {
    return "https://prod.pollbot.prod.webservices.mozgcp.net/v1";
  },
};
global.URLSearchParams = jest.fn(() => URLSearchParamsMock);
