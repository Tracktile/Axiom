import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    common: "./src/common/index.ts",
    client: "./src/client/index.ts",
    server: "./src/server/index.ts",
    cli: "./src/cli/index.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  outDir: ".",
});
