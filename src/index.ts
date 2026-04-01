import { openInteractionManager } from "./presentation/interaction-manager.js";

const run = async () => {
  const { close, choose, ask } = openInteractionManager();
};
