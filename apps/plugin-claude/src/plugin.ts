import { collectBundle } from "./collect.ts";
import type { ToPlugin, ToUi } from "./messages.ts";

penpot.ui.open("penpotx Claude", "index.html", { width: 320, height: 360 });

function send(message: ToUi): void {
  penpot.ui.sendMessage(message);
}

function sendSelection(): void {
  send({ type: "selection", count: penpot.selection.length });
}

async function exportBundle(): Promise<void> {
  try {
    send({ type: "bundle", bundle: await collectBundle(penpot) });
  } catch (error) {
    send({ type: "error", message: error instanceof Error ? error.message : String(error) });
  }
}

penpot.ui.onMessage<ToPlugin>((message) => {
  if (message.type === "ready") sendSelection();
  if (message.type === "export") void exportBundle();
});
penpot.on("selectionchange", sendSelection);
