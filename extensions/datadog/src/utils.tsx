import { environment } from "@raycast/api";
import * as path from "path";
import * as fs from "fs";

const defaultConfig = `---
# Configure your datadog dashboard paths here:
dashboards:
  # Simple dashboard links are just name/path pairs
  #
  # "name": "path"
  #
  # Templated dashboard links take a path with %% as the placeholder along with
  # a list of options to fill in.
  #
  # "name":
  #   path: dashboard/123-456?tpl_var_environment=%%
  #   options:
  #     - "production"
  #     - "staging"
  #  
  "Dashboard list": "dashboard/lists"
`;

export const configPath = path.join(environment.supportPath, "dashboards.yaml");
export function initializeConfigFile(): void {
  fs.mkdirSync(environment.supportPath, { recursive: true });
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, defaultConfig);
  }
}
