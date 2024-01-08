import { Action, ActionPanel, List, Icon } from "@raycast/api";
import { configPath, initializeConfigFile } from "./utils";
import fs from "fs";
import YAML from "yaml";

type DashboardConfig = string | { path: string; options: string[] };
type ParsedConfig = {
  dashboards: { [name: string]: DashboardConfig };
};

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

export default function DashboardList() {
  initializeConfigFile();
  const config = fs.readFileSync(configPath).toString();
  const parsed = YAML.parse(config) as ParsedConfig;
  const dashboards = Object.entries(parsed.dashboards).map(([name, config]) => new Dashboard(name, config));

  return (
    <List searchBarPlaceholder="Filter dashboards...">
      {dashboards.map((dashboard) => (
        <List.Item
          id={dashboard.name}
          key={dashboard.name}
          title={dashboard.name}
          icon={dashboard.hasOptions() ? Icon.ChevronRight : Icon.Document}
          actions={<DashboardActions dashboard={dashboard} />}
        />
      ))}
    </List>
  );
}

function DashboardActions({ dashboard }: { dashboard: Dashboard }) {
  return dashboard.hasOptions() ? (
    <ActionPanel>
      <Action.Push title="Choose Predefined View" target={<DashboardOptions dashboard={dashboard} />} />
    </ActionPanel>
  ) : (
    <ActionPanel>
      <Action.OpenInBrowser key="browser" url={dashboard.url()} />
      <Action.CopyToClipboard
        title={"Copy URL to Clipboard"}
        key="clipboard"
        content={dashboard.url()}
        shortcut={{ modifiers: ["cmd"], key: "c" }}
      />
    </ActionPanel>
  );
}

function DashboardOptions({ dashboard }: { dashboard: Dashboard }) {
  return (
    <List
      navigationTitle={`Open ${dashboard.name} dashboard with...`}
      searchBarPlaceholder="Filter predefined views..."
    >
      {dashboard.options?.map((option) => (
        <List.Item
          id={option}
          key={option}
          title={option}
          icon={Icon.Document}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={dashboard.url(option)} />
              <Action.CopyToClipboard
                title={"Copy URL to Clipboard"}
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
