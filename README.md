# Datadog Raycast Extension

This is a simple [Raycast](https://www.raycast.com) extension for Datadog users, focused on loading dashboards from a list defined in a config file.

It provides these commands:

- `Configure Datadog Dashboard List` to edit the config file
- `Open Datadog Dashboard` displays a searchable list of the configured dashboards for quick access
- `Insert Datadog Graph from Clipboard` pastes a markdown link and the opengraph image for a datadog graph URL as copied from a dashboard. This is useful both in issue writeups on GitHub and notes apps such as Obsidian.

## Installation

- Clone this repo
- `npm install`
- `npm run build`
- Run the `Import Extension` raycast command and point it at this directory.

## Dashboard configuration

Basic dashboards are just name -> path mappings. No leading slash needed:

```yaml
dashboards:
  "web status": "dashboard/abc-def-ghi"
  "request errors": "dashboard/qrs-tuv-wxy"
```

It's also common for dashboards to take parameters, e.g. a database cluster name. This can be defined using a `%%` placeholder:

```yaml
dashboards:
  "database cluster overview":
    path: "dashboard/abc-def-ghi?tpl_var_cluster=%%"
    options:
      - production
      - staging
```

Note that paths aren't required to be dashboards, you can link to notebooks, monitors, or anything else under the `app.datadoghq.com` domain.

A default config file will be created for you when you first load the dashboard command.
