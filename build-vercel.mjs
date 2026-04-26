import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "./artifacts/api-server/node_modules/esbuild/lib/main.js";
import esbuildPluginPino from "./artifacts/api-server/node_modules/esbuild-plugin-pino/index.js";

globalThis.require = createRequire(import.meta.url);
const artifactDir = path.resolve("artifacts/api-server");

await esbuild({
  entryPoints: [path.resolve(artifactDir, "src/vercel.ts")],
  platform: "node",
  bundle: true,
  format: "esm",
  outfile: path.resolve(artifactDir, "dist/vercel.mjs"),
  external: ["*.node", "sharp", "pg-native"],
  sourcemap: false,
  plugins: [esbuildPluginPino({ transports: ["pino-pretty"] })],
  banner: {
    js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';
globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
`,
  },
});
console.log("✅ Vercel entry built");
