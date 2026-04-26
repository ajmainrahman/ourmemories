import { build } from "esbuild";
await build({
  entryPoints: ["artifacts/api-server/src/vercel.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "artifacts/api-server/dist/vercel.mjs",
  packages: "external",
});
console.log("✅ Vercel entry built");
