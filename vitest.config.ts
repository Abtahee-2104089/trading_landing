import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Mirror tsconfig paths ("@/*": ["./*"]) — process.cwd() is the repo
    // root when running `bun run test`. (Avoids __dirname/import.meta
    // which break depending on how Vite loads this config file.)
    alias: { "@": path.resolve(process.cwd(), ".") },
  },
  test: {
    environment: "edge-runtime",
    include: ["convex/**/*.test.ts", "lib/**/*.test.ts"],
    testTimeout: 30000,
  },
});
