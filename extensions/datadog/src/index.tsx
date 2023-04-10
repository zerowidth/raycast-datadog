import {
  Action,
  ActionPanel,
  List,
  Icon,
  useNavigation,
} from "@raycast/api";
import { useEffect, useState } from "react";
import { configPath, initializeConfigFile } from "./utils";
import * as fs from "fs";
import * as YAML from "yaml";
import fuzzysort = require("fuzzysort");

// YAML config types
type DashboardConfig = string | Template;
type Template = {
  path: string;
  options: string[];
};
type ParsedConfig = {
  dashboards: { [name: string]: DashboardConfig };
};

// Internal types
class Dashboard {
  name: string;
  path: string;
  options?: string[];

  constructor(name: string, config: DashboardConfig) {
    this.name = name;
    if (typeof config === "string") {
      this.path = config;
    } else {
      this.path = config.path;
      this.options = config.options;
    }
    if (this.path[0] === "/") {
      this.path = this.path.slice(1);
    }
  }

  url(option?: string): string {
    let path = this.path;
    if (option) {
      path = path.replaceAll("%%", option);
    }
    return `https://app.datadoghq.com/${path}`;
  }

  hasOptions(): boolean {
    return this.options != undefined;
  }
}

type Dashboards = Dashboard[] | undefined;
type DashboardState = {
  dashboardList: Dashboards;
  isLoading: boolean;
};

function searchDashboards(query?: string): {
  dashboards: Dashboards;
  isLoading: boolean;
} {
  const [{ dashboardList, isLoading }, setDashboardList] = useState<DashboardState>({
    dashboardList: undefined,
    isLoading: true,
  });
  const [dashboards, setDashboards] = useState<Dashboards>();

  useEffect(() => {
    const config = fs.readFileSync(configPath).toString();
    const parsed = YAML.parse(config) as ParsedConfig;
    let list: Dashboard[] = [];
    for (const [name, path] of Object.entries(parsed.dashboards)) {
      list = list.concat(new Dashboard(name, path));
    }
    setDashboardList({ dashboardList: list, isLoading: false });
  }, []);

  useEffect(() => {
    if (dashboardList == undefined) {
      return;
    }
    let filtered = dashboardList;
    if (filtered.length > 0 && query && query.length > 0) {
      filtered = fuzzysort.go(query, filtered, { keys: ["name"], allowTypo: false }).map((result) => result.obj);
    }
    setDashboards(filtered);
  }, [query, dashboardList]);
  return { dashboards, isLoading };
}

export default function DashboardList() {
  const [searchQuery, setSearchQuery] = useState<string>();
  const { dashboards, isLoading } = searchDashboards(searchQuery);
  return (
    <List isLoading={isLoading} onSearchTextChange={setSearchQuery} searchBarPlaceholder="Filter dashboards...">
      {dashboards?.map((dashboard) => (
        <List.Item
          id={dashboard.name}
          key={dashboard.name}
          title={dashboard.name}
          icon={Icon.BlankDocument}
          actions={<DashboardActions dashboard={dashboard} />}
        />
      ))}
    </List>
  );
}

interface DashboardProps {
  dashboard: Dashboard;
}
function DashboardActions(props: DashboardProps) {
  const { push } = useNavigation();
  if (props.dashboard.hasOptions()) {
    return (
      <ActionPanel>
        <ActionPanel.Item
          title="Choose predefined view"
          onAction={() => {
            push(<DashboardOptions dashboard={props.dashboard} />);
          }}
        />
      </ActionPanel>
    );
  }
  return (
    <ActionPanel>
      <Action.OpenInBrowser key="browser" url={props.dashboard.url()} />
      <Action.CopyToClipboard
        title={"Copy URL to Clipboard"}
        key="clipboard"
        content={props.dashboard.url()}
        shortcut={{ modifiers: ["cmd"], key: "c" }}
      />
    </ActionPanel>
  );
}

function DashboardOptions(props: DashboardProps) {
  const dashboard = props.dashboard;
  return (
    <List
      navigationTitle={`Open ${props.dashboard.name} dashboard with...`}
      searchBarPlaceholder="Filter predefined views..."
    >
      {props.dashboard.options?.map((option) => (
        <List.Item
          id={option}
          key={option}
          title={option}
          icon={Icon.BlankDocument}
          actions={
            <ActionPanel>
              <OpenInBrowserAction key="browser" url={dashboard.url(option)} />
              <Action.CopyToClipboard
                title={"Copy URL to Clipboard"}
                key="clipboard"
                content={dashboard.url(option)}
                shortcut={{ modifiers: ["cmd"], key: "c" }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

initializeConfigFile();
