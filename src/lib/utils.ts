import { settings, util } from "replugged";
import { React, lodash } from "replugged/common";
import Pretter, { Options } from "prettier";
import { PluginLogger, SettingValues } from "../index";
import { defaultSettings, prettierPlugins } from "./consts";
import Types from "../types";

export class LimitedMap<K, V> extends Map<K, V> {
  private limit: number;
  private keysQueue: K[] = [];
  public constructor(limit: number) {
    super();
    this.limit = limit;
  }
  public set(key: K, value: V): this {
    if (this.size >= this.limit) {
      const oldestKey = this.keysQueue.shift();
      if (oldestKey !== void 0) {
        this.delete(oldestKey);
      }
    }
    super.set(key, value);
    this.keysQueue.push(key);
    return this;
  }
}

export const codeblockCache = new LimitedMap<string, Types.CodeBlockOptions>(150);

export const convertToTitleCase = (text: string): string =>
  text
    .replace(/(?:^|\b)(\w)/g, (match) => match.toUpperCase())
    .replace(/([A-Z])/g, (_, word) => ` ${word}`)
    .trim();

export const hashString = (str: string): string =>
  Array.from(new TextEncoder().encode(str))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

export const getPrettierParser = (extension: string): string | null => {
  switch (extension.toLowerCase()) {
    case "js":
    case "javascript":
    case "jsx":
    case "json":
      return "babel";
    case "tsx":
    case "ts":
    case "typescript":
      return "typescript";
    case "hbs":
    case "glimmer":
    case "html.hbs":
    case "html.handlebars":
    case "htmlbars":
      return "glimmer";
    case "vue":
    case "angular":
      return "angular";
    case "xml":
    case "html":
    case "xhtml":
    case "rss":
    case "atom":
    case "xjb":
    case "xsd":
    case "xsl":
    case "plist":
    case "svg":
      return "html";
    case "less":
    case "css":
    case "scss":
      return "css";
    case "yml":
    case "yaml":
      return "yaml";
    default:
      return null;
  }
};

export const formatCode = async (lang: string, code: string): Promise<string> => {
  try {
    if (lang === "json") return JSON.stringify(JSON.parse(code), null, 2);

    const config = SettingValues.get("prettier") as Options;
    const parser = getPrettierParser(lang);
    if (!parser) return code;
    const formattedCode = await Pretter.format(code, {
      ...config,
      parser,
      plugins: prettierPlugins,
    });
    return formattedCode.trim();
  } catch (err) {
    PluginLogger.log(`Prettier Error While Prettifying for ${lang}: ${err}`);
    return code;
  }
};

export const formatCodeblock = (
  codeBlockOptions: Types.CodeBlockOptions,
): Types.CodeBlockOptions => {
  if (!SettingValues.get("autoFormat", defaultSettings.autoFormat) || !codeBlockOptions.lang)
    return codeBlockOptions;
  const key = `${codeBlockOptions.lang}-${hashString(codeBlockOptions.content)}`;
  const cachedOptions = codeblockCache.get(key);
  if (cachedOptions) {
    return cachedOptions;
  }
  void formatCode(codeBlockOptions.lang, codeBlockOptions.content).then((content) => {
    codeBlockOptions.content = content;
    codeblockCache.set(key, codeBlockOptions);
  });
  codeblockCache.set(key, codeBlockOptions);
  return codeBlockOptions;
};

export const useSetting = <
  T extends Record<string, Types.Jsonifiable>,
  D extends keyof T,
  K extends Extract<keyof T, string>,
  F extends Types.NestedType<T, P> | T[K] | undefined,
  P extends `${K}.${string}` | `${K}/${string}` | `${K}-${string}` | K,
  V extends P extends `${K}.${string}` | `${K}/${string}` | `${K}-${string}`
    ? NonNullable<Types.NestedType<T, P>>
    : P extends D
      ? NonNullable<T[P]>
      : F extends null | undefined
        ? T[P] | undefined
        : NonNullable<T[P]> | F,
>(
  settings: settings.SettingsManager<T, D>,
  key: P,
  fallback?: F,
): {
  value: V;
  onChange: (newValue: Types.ValType<Types.NestedType<T, P>> | Types.ValType<T[K]>) => void;
} => {
  const initial = settings.get(key as K) ?? lodash.get(settings.all(), key) ?? fallback;
  const [value, setValue] = React.useState(initial as V);

  return {
    value,
    onChange: (newValue: Types.ValType<Types.NestedType<T, P>> | Types.ValType<T[K]>) => {
      const isObj = newValue && typeof newValue === "object";
      const value = isObj && "value" in newValue ? newValue.value : newValue;
      const checked = isObj && "checked" in newValue ? newValue.checked : void 0;
      const target =
        isObj && "target" in newValue && newValue.target && typeof newValue.target === "object"
          ? newValue.target
          : void 0;
      const targetValue = target && "value" in target ? target.value : void 0;
      const targetChecked = target && "checked" in target ? target.checked : void 0;
      const finalValue = (checked ?? targetChecked ?? targetValue ?? value ?? newValue) as T[K];

      setValue(finalValue as V);

      if (settings.get(key as K)) {
        settings.set(key as K, finalValue);
      } else {
        const [rootKey] = key.split(/[-/.]/);
        const setting = lodash.set({ ...settings.all() }, key, finalValue)[rootKey as K];
        settings.set(rootKey as K, setting);
      }
    },
  };
};

export const useSettingArray = <
  T extends Record<string, Types.Jsonifiable>,
  D extends keyof T,
  K extends Extract<keyof T, string>,
  F extends Types.NestedType<T, P> | T[K] | undefined,
  P extends `${K}.${string}` | `${K}/${string}` | `${K}-${string}` | K,
  V extends P extends `${K}.${string}` | `${K}/${string}` | `${K}-${string}`
    ? NonNullable<Types.NestedType<T, P>>
    : P extends D
      ? NonNullable<T[P]>
      : F extends null | undefined
        ? T[P] | undefined
        : NonNullable<T[P]> | F,
>(
  settings: settings.SettingsManager<T, D>,
  key: P,
  fallback?: F,
): [V, (newValue: Types.ValType<Types.NestedType<T, P>> | Types.ValType<T[K]>) => void] => {
  const { value, onChange } = useSetting(settings, key, fallback);

  return [value as V, onChange];
};

const useClearableSettings = <
  T extends Record<string, Types.Jsonifiable>,
  D extends keyof T,
  K extends Extract<keyof T, string>,
  F extends Types.NestedType<T, P> | T[K] | undefined,
  P extends `${K}.${string}` | `${K}/${string}` | `${K}-${string}` | K,
  V extends P extends `${K}.${string}` | `${K}/${string}` | `${K}-${string}`
    ? NonNullable<Types.NestedType<T, P>>
    : P extends D
      ? NonNullable<T[P]>
      : F extends null | undefined
        ? T[P] | undefined
        : NonNullable<T[P]> | F,
>(
  settings: settings.SettingsManager<T, D>,
  key: P,
  fallback?: F,
): {
  onClear: () => void;
  value: V;
  onChange: (newValue: Types.ValType<Types.NestedType<T, P>> | Types.ValType<T[K]>) => void;
} => {
  const { value, onChange } = useSetting(settings, key, fallback);
  const onClear = (): void =>
    onChange("" as Types.ValType<Types.NestedType<T, P>> | Types.ValType<T[K]>);
  return { onChange, value: value as V, onClear };
};

export default {
  ...util,
  LimitedMap,
  codeblockCache,
  convertToTitleCase,
  hashString,
  getPrettierParser,
  formatCode,
  formatCodeblock,
  useSetting,
  useSettingArray,
  useClearableSettings,
};
