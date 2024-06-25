import { parser as Parser } from "replugged/common";
import { PluginInjector } from "../index";
import Utils from "../lib/utils";
import Types from "../types";

export default (): void => {
  PluginInjector.after(
    Parser.defaultRules.codeBlock,
    "parse",
    (
      [_, __, { channelId, messageId }]: [
        unknown,
        unknown,
        { channelId: string; messageId: string },
      ],
      res: Types.CodeBlockOptions,
    ) => {
      return Utils.formatCodeblock(res, `#chat-messages-${channelId}-${messageId}`) ?? res;
    },
  );
};
