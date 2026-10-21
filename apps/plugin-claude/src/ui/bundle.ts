import { strToU8, zipSync, type Zippable } from "fflate";
import type { Bundle } from "../messages.ts";

const MAX_NAME_LENGTH = 60;

/** Turns an untrusted Penpot name into one safe path segment: no separators, dots or control characters. */
export function safeName(name: string, fallback: string): string {
  const slug = name
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .slice(0, MAX_NAME_LENGTH)
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

export function handoffZipName(fileName: string): string {
  return `${safeName(fileName, "penpot")}-claude-design.zip`;
}

function readme(bundle: Bundle, files: string[]): string {
  return [
    `# ${bundle.fileName} — handoff for Claude Design`,
    "",
    "Exported from Penpot by the penpotx Claude plugin. Upload these files to a Claude Design project and use `prompt.md` as the request.",
    "",
    ...files.map((file) => `- \`${file}\``),
    "",
  ].join("\n");
}

function selectionPage(html: string): string {
  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8" />',
    '<link rel="stylesheet" href="selection.css" />',
    "</head>",
    "<body>",
    html,
    "</body>",
    "</html>",
    "",
  ].join("\n");
}

export function handoffFiles(bundle: Bundle, prompt: string): Zippable {
  // PNG and .penpot are already compressed; deflating them again only costs time.
  const stored = { level: 0 } as const;
  const files: Zippable = {};
  const text = prompt.trim();
  if (text) files["prompt.md"] = strToU8(`${text}\n`);
  files[`${safeName(bundle.fileName, "file")}.penpot`] = [bundle.penpot, stored];
  bundle.images.forEach((image, index) => {
    // The index keeps names unique when shapes share a name or slug to the same text.
    const number = String(index + 1).padStart(2, "0");
    files[`selection/${number}-${safeName(image.name, "shape")}.png`] = [image.png, stored];
  });
  if (bundle.html) {
    files["selection.html"] = strToU8(selectionPage(bundle.html));
    files["selection.css"] = strToU8(bundle.css);
  }
  if (bundle.tokenSets.length > 0) {
    files["tokens.json"] = strToU8(`${JSON.stringify(bundle.tokenSets, null, 2)}\n`);
  }
  return { "README.md": strToU8(readme(bundle, Object.keys(files))), ...files };
}

export function buildHandoffZip(bundle: Bundle, prompt: string): Uint8Array {
  return zipSync(handoffFiles(bundle, prompt));
}
