import { onPluginMessage, sendToPlugin } from "@penpotx/plugin-shell/ui";
import type { ToPlugin, ToUi } from "../messages.ts";

const output = document.querySelector<HTMLOutputElement>("#selection");

onPluginMessage<ToUi>((message) => {
  if (message.type === "selection" && output) {
    output.textContent = `Selected: ${String(message.count)}`;
  }
});
sendToPlugin<ToPlugin>({ type: "ready" });
