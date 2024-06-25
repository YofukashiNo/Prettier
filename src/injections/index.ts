import injectMessages from "./Messages";
import injectParser from "./Parser";

export const applyInjections = (): void => {
  injectMessages();
  injectParser();
};

export default { applyInjections };
