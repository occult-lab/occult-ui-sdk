import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// occult-api-ui is linked from "file:.." (the repo root), so its own
// react/react-dom must resolve to THIS app's copies, not a duplicate set in
// its node_modules - two React copies in one page is the classic cause of
// "Invalid hook call" that has nothing to do with the actual hook.
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
});
