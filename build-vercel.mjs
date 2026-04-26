import { build } from "./artifacts/api-server/node_modules/esbuild/lib/main.js";
await build({
  entryPoints: ["artifacts/api-server/src/vercel.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "artifacts/api-server/dist/vercel.mjs",
  external: ["pino-pretty", "pino/file"],
});
console.log("✅ Vercel entry built");
