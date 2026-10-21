import type { ToPlugin, ToUi } from "./messages.ts";

penpot.ui.open("penpotx hello", "index.html", { width: 280, height: 160 });

function sendSelection(): void {
  const message: ToUi = { type: "selection", count: penpot.selection.length };
  penpot.ui.sendMessage(message);
}

penpot.ui.onMessage<ToPlugin>((message) => {
  if (message.type === "ready") sendSelection();
});
penpot.on("selectionchange", sendSelection);
