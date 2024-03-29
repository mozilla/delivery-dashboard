// @flow
import "photon-ant";
import * as React from "react";
import { Alert, Card, Icon, Layout, Spin, Tooltip } from "antd";
import "./App.css";
import { connect } from "react-redux";
import type { MapStateToProps } from "react-redux";
import {
  capitalize,
  localUrlFromVersion,
  requestOngoingVersions,
  requestPollbotVersion,
  refreshStatus,
  requestStatus,
} from "./actions";
import type {
  APIVersionData,
  CheckResult,
  CheckResults,
  Dispatch,
  Error,
  ProductVersions,
  Product,
  ReleaseInfo,
  State,
  Status,
} from "./types";
import { products } from "./types";

const deliveryDashboardVersionData: APIVersionData = require("./version.json");

function requestNotificationPermission(): void {
  // Some browsers don't support Notification yet. I'm looking at you iOS Safari
  if ("Notification" in window) {
    if (
      Notification.permission !== "denied" &&
      Notification.permission !== "granted"
    ) {
      Notification.requestPermission();
    }
  }
}

export const parseUrl = (
  url: string
): ?{ service: string, product: Product, version: string } => {
  const re = /^#(\w+)\/(\w+)\/([^/]+)\/?/; // Eg: #pollbot/firefox/50.0
  const parsed: ?(string[]) = url.match(re);
  if (!parsed) {
    return null;
  }
  const [, service, product, version] = parsed;
  const maybeProduct = products.find((p) => p === product);
  if (!maybeProduct) {
    // unsupported/unrecognized product.
    return null;
  }
  return {
    service: service,
    product: maybeProduct,
    version: version,
  };
};

type AppProps = {
  checkResults: CheckResults,
  dispatch: Dispatch,
  pollbotVersion: APIVersionData,
  shouldRefresh: boolean,
  errors: Error[],
};
export class App extends React.Component<AppProps, void> {
  refreshIntervalId: ?IntervalID;

  constructor(props: AppProps): void {
    super(props);
    this.refreshIntervalId = null;
  }

  setUpAutoRefresh(): void {
    if (this.props.shouldRefresh) {
      if (this.refreshIntervalId) {
        // The auto-refresh is already enabled.
        return;
      }
      this.refreshIntervalId = setInterval(
        () => this.props.dispatch(refreshStatus()),
        60000
      );
    } else {
      this.stopAutoRefresh();
    }
  }

  stopAutoRefresh(): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
  }

  componentDidMount(): void {
    this.props.dispatch(requestPollbotVersion());
    this.props.dispatch(requestOngoingVersions());
    // Setup notifications.
    requestNotificationPermission();
    // Listen to url hash changes.
    window.onhashchange = this.versionFromHash;
    // Check if we have a version in the url.
    this.versionFromHash();
  }

  componentDidUpdate(): void {
    this.setUpAutoRefresh();
  }

  componentWillUnmount(): void {
    this.stopAutoRefresh();
  }

  versionFromHash = (): void => {
    const parsedUrl = parseUrl(window.location.hash);
    if (parsedUrl) {
      this.props.dispatch(requestStatus(parsedUrl.product, parsedUrl.version));
    }
  };

  render() {
    return (
      <div>
        <header>
          <h1>
            <a href=".">Delivery Dashboard</a>
          </h1>
        </header>
        <Errors errors={this.props.errors} />
        <Layout className="mainContent">
          <Layout.Sider breakpoint="md" collapsedWidth={0}>
            <SideBar />
          </Layout.Sider>
          <Layout.Content>
            <CurrentRelease />
          </Layout.Content>
        </Layout>
        <footer>
          Delivery dashboard version:{" "}
          <VersionLink versionData={deliveryDashboardVersionData} />
          &nbsp;--&nbsp;Pollbot version:{" "}
          <VersionLink versionData={this.props.pollbotVersion} />
        </footer>
      </div>
    );
  }
}
const connectedAppMapStateToProps: MapStateToProps<*, *, *> = (
  state: State
) => ({
  checkResults: state.checkResults,
  pollbotVersion: state.pollbotVersion,
  shouldRefresh: state.shouldRefresh,
  errors: state.errors,
});
export const ConnectedApp = connect(
  connectedAppMapStateToProps,
  (dispatch: Dispatch) => ({ dispatch: dispatch })
)(App);

const sideBarMapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  versions: state.productVersions,
});
const SideBar = connect(sideBarMapStateToProps)(ReleasesMenu);

type ReleasesMenuPropType = {
  versions: ProductVersions,
};

export function ReleasesMenu({ versions }: ReleasesMenuPropType) {
  const getVersion = (product, channel) => {
    const capitalizedChannel = capitalize(channel);
    if (versions.hasOwnProperty(product) && versions[product][channel]) {
      return (
        <a
          href={localUrlFromVersion([product, channel])}
        >{`${capitalizedChannel}: ${versions[product][channel]}`}</a>
      );
    } else {
      return (
        <span>
          {capitalizedChannel}: <Spin />
        </span>
      );
    }
  };
  return (
    <div className="releasesMenu">
      <h2>Firefox Releases</h2>
      <ul>
        <li>{getVersion("firefox", "nightly")}</li>
        <li>{getVersion("firefox", "beta")}</li>
        <li>{getVersion("devedition", "devedition")}</li>
        <li>{getVersion("firefox", "release")}</li>
        <li>{getVersion("firefox", "esr")}</li>
      </ul>
    </div>
  );
}

const currentReleaseMapStateToProps: MapStateToProps<*, *, *> = (
  state: State
) => ({
  checkResults: state.checkResults,
  releaseInfo: state.releaseInfo,
  productVersion: state.version,
});
const CurrentRelease = connect(currentReleaseMapStateToProps)(Dashboard);

type ErrorsPropType = {
  errors: Error[],
};

export function Errors({ errors }: ErrorsPropType) {
  if (!errors || errors.length === 0) {
    return null;
  }
  return (
    <div className="errors">
      {errors.map((error) => {
        const [title, err] = error;
        return (
          <Alert
            key={title}
            message={"Failed getting check result for '" + title + "': " + err}
            type="error"
            banner
          />
        );
      })}
      <br />
    </div>
  );
}

type DashboardPropType = {
  checkResults: CheckResults,
  releaseInfo: ?ReleaseInfo,
  productVersion: [Product, string],
};

export function Dashboard({
  releaseInfo,
  checkResults,
  productVersion,
}: DashboardPropType) {
  const [product, version] = productVersion;
  if (version === "") {
    return (
      <p>
        Learn more about a specific version.
        <strong> Select a version number from the left menu.</strong>
      </p>
    );
  } else if (!releaseInfo) {
    return <Spin />;
  } else if (releaseInfo.message) {
    return <Errors errors={[["Pollbot error", releaseInfo.message]]} />;
  } else {
    return (
      <div>
        <h2 style={{ marginBottom: "1em", display: "flex", flexWrap: "wrap" }}>
          {capitalize(product)} {version}{" "}
          <OverallStatus
            releaseInfo={releaseInfo}
            checkResults={checkResults}
          />
        </h2>
        <div className="dashboard">
          {releaseInfo.checks.map((check) => (
            <DisplayCheckResult
              key={check.title}
              title={check.title}
              actionable={check.actionable}
              checkResult={checkResults[check.title]}
            />
          ))}
        </div>
      </div>
    );
  }
}

type OverallStatusPropType = {
  checkResults: CheckResults,
  releaseInfo: ReleaseInfo,
};

export function OverallStatus({
  releaseInfo,
  checkResults,
}: OverallStatusPropType) {
  const checksStatus = releaseInfo.checks.map(
    (check) => checkResults[check.title]
  );
  const allChecksCompleted = !checksStatus.some(
    (result) => typeof result === "undefined"
  );
  if (!allChecksCompleted) {
    return <Spin />;
  }

  let actionableChecks = [];
  let nonActionableChecks = [];
  releaseInfo.checks.map((check) => {
    if (check.actionable) {
      actionableChecks.push(checkResults[check.title].status);
    } else {
      nonActionableChecks.push(checkResults[check.title].status);
    }
    return check;
  });
  let type;
  let message;
  if (actionableChecks.some((status) => status !== "exists")) {
    type = "error";
    message = "Some checks failed";
  } else {
    type = "success";
    message = "All checks are successful";
  }
  return (
    <Alert
      message={message}
      type={type}
      showIcon
      style={{ marginLeft: "1em" }}
    />
  );
}

type DisplayCheckResultProps = {
  title: string,
  actionable: boolean,
  checkResult: CheckResult,
};
export class DisplayCheckResult extends React.PureComponent<
  DisplayCheckResultProps,
  void
> {
  render() {
    const { title, actionable, checkResult } = this.props;
    let titleContent = title;
    if (!actionable) {
      titleContent = (
        <div>
          <Tooltip title="This check is not actionable">
            <Icon type="notification" /> {title}
          </Tooltip>
        </div>
      );
    }
    return (
      <Card title={titleContent} style={{ textAlign: "center" }}>
        {checkResult ? (
          <DisplayStatus
            status={checkResult.status}
            message={checkResult.message}
            url={checkResult.link}
            actionable={actionable}
          />
        ) : (
          <Spin />
        )}
      </Card>
    );
  }
}

export function DisplayStatus({
  status,
  message,
  url,
  actionable,
}: {
  status: Status,
  message: string,
  url: string,
  actionable: boolean,
}) {
  const getLabelClass = (status, actionable) => {
    if (status === "error") {
      return "error";
    }
    if (status === "exists") {
      return "success";
    }
    if (actionable) {
      return "warning";
    }
    return "info"; // It's a non actionable item.
  };
  return (
    <a title={message} href={url}>
      <Alert
        message={message}
        type={getLabelClass(status, actionable)}
        showIcon
      />
    </a>
  );
}

function VersionLink({ versionData }: { versionData: APIVersionData }) {
  if (!versionData) {
    return null;
  }
  const { commit, source, version } = versionData;
  const sourceUrl = source.replace(/\.git/, "");
  const url = `${sourceUrl}/commit/${commit}`;
  return <a href={url}>{version}</a>;
}

export default ConnectedApp;
