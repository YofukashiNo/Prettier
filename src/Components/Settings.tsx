import { React } from "replugged/common";
import { Category, Notice, SwitchItem } from "replugged/components";
import Pretter, { SupportInfo } from "prettier";
import { PluginLogger, SettingValues } from "../index";
import { PRETTIER_CONFIG_DOCS, defaultSettings, prettierPlugins } from "../lib/consts";
import PrettierOptions from "./PrettierOptions";
import Utils from "../lib/utils";
import Types from "../types";

export const registerSettings = (): void => {
  for (const key in defaultSettings) {
    if (SettingValues.has(key as keyof Types.Settings)) return;
    PluginLogger.log(`Adding new setting ${key} with value`, defaultSettings[key]);
    SettingValues.set(key as keyof Types.Settings, defaultSettings[key]);
  }
};
export const Settings = (): React.ReactElement => {
  const [prettierOptions, setPretterOptions] = React.useState<SupportInfo["options"]>([]);
  React.useEffect(() => {
    const mapAndSetPretterOptions = async () => {
      const { options } = await Pretter.getSupportInfo({ plugins: prettierPlugins });
      setPretterOptions(
        options.filter((o) =>
          Object.keys(defaultSettings.prettier).some((name) => o.name === name),
        ),
      );
    };
    mapAndSetPretterOptions();
  }, []);
  return (
    <div>
      <SwitchItem
        {...Utils.useSetting(SettingValues, "autoFormat", defaultSettings.autoFormat)}
        note="Format codeblocks from all users">
        Auto Format
      </SwitchItem>
      <SwitchItem
        {...Utils.useSetting(SettingValues, "formatOnSend", defaultSettings.formatOnSend)}
        note="Format codeblocks before sending">
        Format Send
      </SwitchItem>

      <Category title="Prettier settings" key={`${prettierOptions.length}`}>
        <Notice messageType={Notice.Types.INFO} className="prettier-settings-notice">
          <span>
            Check{" "}
            <a href={PRETTIER_CONFIG_DOCS} onClick={(e) => e.stopPropagation()}>
              Prettier's Docs
            </a>{" "}
            for a more detailed explanation
          </span>
        </Notice>
        {prettierOptions.map((o) => (
          <PrettierOptions option={o} />
        ))}
      </Category>
    </div>
  );
};

export default { registerSettings, Settings };
