// tsup bundles JS/TS; the stylesheet is plain CSS with no imports to
// resolve, so it is just copied into dist rather than run through a bundler
// that would add nothing here. Kept as its own script (not a tsup plugin)
// so `tsup --watch` during development doesn't need to know about it.
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const from = join(root, "src", "styles.css");
const to = join(root, "dist", "styles.css");

mkdirSync(dirname(to), { recursive: true });
copyFileSync(from, to);
console.log("copied styles.css -> dist/styles.css");
