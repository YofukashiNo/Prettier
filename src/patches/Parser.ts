import { parser as Parser } from "replugged/common";
import { PluginInjector } from "../index";
import Utils from "../lib/utils";
import Types from "../types";

export default (): void => {
  PluginInjector.after(
    Parser.defaultRules.codeBlock,
    "parse",
    (_args, res: Types.CodeBlockOptions) => {
      return Utils.formatCodeblock(res) ?? res;
    },
  );
};
