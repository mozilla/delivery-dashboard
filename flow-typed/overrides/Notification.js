// @flow

// This file will be automagically used by Flow to type "Notification".
declare class Notification {
  constructor(string, ?Object): Notification;
  static permission: "denied" | "granted" | "default";
  actions: string[];
  badge: string;
  body: string;
  data: Object;
  dir: "ltr" | "rtl";
  lang: string;
  tag: string;
  icon: string;
  image: string;
  requireInteraction: boolean;
  silent: boolean;
  timestamp: number;
  title: string;
  vibrate: number[];
  onclick(event: Event): void;
  onerror(event: Event): void;
  static requestPermission(): Promise<*>;
  static close(): void;
}
