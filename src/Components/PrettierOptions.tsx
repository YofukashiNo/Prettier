import { RadioItem, SliderItem, SwitchItem } from "replugged/components";
import { SupportOption } from "prettier";
import { SettingValues } from "../index";
import { defaultSettings } from "../lib/consts";
import Utils from "../lib/utils";
import Types from "../types";

export default ({ option }: { option: SupportOption }): React.ReactElement => {
  switch (option.type) {
    case "boolean":
      console.log(Utils.convertToTitleCase(option.name));
      return (
        <SwitchItem
          {...Utils.useSetting(
            SettingValues,
            `prettier.${option.name}`,
            defaultSettings.prettier[option.name],
          )}
          note={`${option.description}, default: ${option.default}`}>
          {Utils.convertToTitleCase(option.name)}
        </SwitchItem>
      );
    case "int":
      return (
        typeof option.default === "number" && (
          <SliderItem
            defaultValue={option.default}
            initialValue={
              SettingValues.get("prettier", defaultSettings.prettier)[option.name] ?? option.default
            }
            {...Utils.useSetting<
              Record<string, Types.Jsonifiable>,
              string,
              string,
              number,
              string,
              number
            >(SettingValues, `prettier.${option.name}`)}
            minValue={option.range.start}
            maxValue={option.range.end}
            note={`${option.description}, range: ${`${option.range.start}...${option.range.end}`}, default: ${option.default}`}>
            {Utils.convertToTitleCase(option.name)}
          </SliderItem>
        )
      );
    case "choice":
      return (
        <RadioItem
          {...Utils.useSetting<
            Record<string, Types.Jsonifiable>,
            string,
            string,
            string,
            string,
            string
          >(SettingValues, `prettier.${option.name}`, defaultSettings.prettier[option.name])}
          options={option.choices.map((choice) => ({
            ...choice,
            name: `${choice.description}${choice.value === option.default ? " (default)" : ""}`,
            color: choice.value === option.default && "var(--brand-experiment)",
          }))}>
          {Utils.convertToTitleCase(option.name)}
        </RadioItem>
      );
    default:
      return <></>;
  }
};
