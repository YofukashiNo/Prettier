import { Injector, Logger, settings } from "replugged";
import { defaultSettings } from "./lib/consts";
import "./style.css";
export const PluginInjector = new Injector();
export const PluginLogger = Logger.plugin("Prettier", "#b380ff");
export const SettingValues = await settings.init("dev.yofukashino.Prettier", defaultSettings);
import Settings from "./Components/Settings";
import Injections from "./injections/index";

export const start = (): void => {
  Settings.registerSettings();
  Injections.applyInjections();
};

export const stop = (): void => {
  PluginInjector.uninjectAll();
};

export { Settings } from "./Components/Settings.jsx";
