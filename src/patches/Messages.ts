import { messages as UltimateMessageStore } from "replugged/common";
import { PluginInjector, SettingValues } from "../index";
import { CODEBLOCK_REGEX, defaultSettings } from "../lib/consts";
import Utils from "../lib/utils";

export default (): void => {
  PluginInjector.instead(
    UltimateMessageStore,
    "sendMessage",
    async ([id, message, ...args], res, instance) => {
      if (!SettingValues.get("formatOnSend", defaultSettings.formatOnSend))
        return await res.call(instance, id, message, ...args);
      const replacements = await Promise.all(
        Array.from(message.content?.matchAll(CODEBLOCK_REGEX)).map(async ([match, lang, code]) => ({
          match,
          replace: `\`\`\`${lang}\n${await Utils.formatCode(lang, code)}\n\`\`\``,
        })),
      );
      for (const replacement of replacements) {
        message.content.replace(replacement.match, replacement.replace);
      }
      if (replacements.length) return await res.call(instance, id, message, ...args);
    },
  );
};
