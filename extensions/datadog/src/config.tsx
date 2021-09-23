import { configPath } from "./utils";
import open = require("open");
import { closeMainWindow } from "@raycast/api";

open(configPath, { app: { name: "/Applications/Visual Studio Code.app" } });
closeMainWindow();
