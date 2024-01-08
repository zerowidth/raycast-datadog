import { Action, ActionPanel, List, Icon, useNavigation } from "@raycast/api";
import { configPath, initializeConfigFile } from "./utils";
import fs from "fs";
import YAML from "yaml";

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

export default function DashboardList() {
  const config = fs.readFileSync(configPath).toString();
  const parsed = YAML.parse(config) as ParsedConfig;
  const dashboards = Object.entries(parsed.dashboards).map(
    ([name, config]) => new Dashboard(name, config)
  );

  return (
    <List searchBarPlaceholder="Filter dashboards...">
      {dashboards.map((dashboard) => (
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
              <Action.OpenInBrowser key="browser" url={dashboard.url(option)} />
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
