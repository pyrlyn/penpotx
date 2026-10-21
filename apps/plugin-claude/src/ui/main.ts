import { downloadBytes, onPluginMessage, sendToPlugin } from "@penpotx/plugin-shell/ui";
import type { ToPlugin, ToUi } from "../messages.ts";
import { buildHandoffZip, handoffZipName } from "./bundle.ts";

function element<T extends HTMLElement>(selector: string): T {
  const found = document.querySelector<T>(selector);
  if (!found) throw new Error(`Missing ${selector} in index.html`);
  return found;
}

const prompt = element<HTMLTextAreaElement>("#prompt");
const button = element<HTMLButtonElement>("#export");
const selection = element<HTMLOutputElement>("#selection");
const status = element<HTMLOutputElement>("#status");

function finish(text: string): void {
  status.textContent = text;
  button.disabled = false;
}

onPluginMessage<ToUi>((message) => {
  switch (message.type) {
    case "selection":
      selection.textContent =
        message.count === 0
          ? "Nothing selected: the bundle carries the whole file only."
          : `Selected: ${String(message.count)}`;
      break;
    case "bundle":
      downloadBytes(
        buildHandoffZip(message.bundle, prompt.value),
        handoffZipName(message.bundle.fileName),
        "application/zip",
      );
      finish("Downloaded. Upload the ZIP's files to Claude Design.");
      break;
    case "error":
      finish(`Export failed: ${message.message}`);
      break;
  }
});

button.addEventListener("click", () => {
  button.disabled = true;
  status.textContent = "Exporting…";
  sendToPlugin<ToPlugin>({ type: "export" });
});

sendToPlugin<ToPlugin>({ type: "ready" });
