import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  // The shipped bundle isn't minified, so it's already readable in a stack
  // trace - the maps were 640 KB of the 1.1 MB install for very little.
  sourcemap: false,
  clean: true,
  external: ["react", "react-dom"],
  injectStyle: false,
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
});
