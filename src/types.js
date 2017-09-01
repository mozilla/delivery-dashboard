// @flow

export type OngoingVersions = ?{
  nightly: string,
  beta: string,
  release: string,
  esr: string,
};

export type Status = {
  status: string,
  message?: string,
};

export type Statuses = {
  archive: ?Status,
  product_details: ?Status,
  release_notes: ?Status,
  security_advisories: ?Status,
  download_links: ?Status,
};
