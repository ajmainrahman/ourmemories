import { createRequire } from "node:module";
globalThis.require = createRequire(import.meta.url);

const { build } = await import("./artifacts/api-server/node_modules/esbuild/lib/main.js");
const pinoPath = "./node_modules/.pnpm/esbuild-plugin-pino@2.3.3_esbuild@0.27.3_pino-pretty@13.1.3_pino@9.14.0_thread-stream@3.1.0/node_modules/esbuild-plugin-pino/dist/index.js";
const { default: esbuildPluginPino } = await import(pinoPath);

await build({
  entryPoints: ["artifacts/api-server/src/vercel.ts"],
  platform: "node",
  bundle: true,
  format: "esm",
  outdir: "artifacts/api-server/dist/vercel",
  outExtension: { ".js": ".mjs" },
  external: ["*.node", "pg-native"],
  sourcemap: false,
  plugins: [esbuildPluginPino({ transports: ["pino-pretty"] })],
  banner: {
    js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';
globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);`,
  },
});
console.log("✅ Done");
