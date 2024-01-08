import { configPath, initializeConfigFile } from "./utils";
import open = require("open");
import { Application, closeMainWindow, getPreferenceValues } from "@raycast/api";

initializeConfigFile();
const prefs: { editor: Application } = getPreferenceValues();
open(configPath, { app: { name: prefs.editor.name } });
closeMainWindow();
