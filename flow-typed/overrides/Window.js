// @flow

// This file will be automagically used by Flow to type "window".
type Location = {
  href: string,
  protocol: string,
  host: string,
  hostname: string,
  port: string,
  username: string,
  password: string,
  origin: string,
  pathname: string,
  search: string,
  hash: string,
  assign: (url: string) => void,
  reload: () => void,
  replace: (url: string) => void,
  toString: () => string
};

declare class Window extends EventTarget {
  innerHeight: number;
  innerWidth: number;
  location: Location;
  onhashchange: (event: Event) => void;
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
}

declare var window: Window;
