const URLSearchParamsMock = {
  get(item) {
    return "https://pollbot.services.mozilla.com/v1";
  }
};
global.URLSearchParams = jest.fn(() => URLSearchParamsMock);
