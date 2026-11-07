import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Watt loads its runtime and worker as separate modules. Keep them as separate
// Rolldown entry points so the runtime's worker/main.js path is retained.
const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const appRequire = createRequire(join(appRoot, "package.json"));
const wattRequire = createRequire(appRequire.resolve("wattpm"));
const runtimeEntry = wattRequire.resolve("@platformatic/runtime");
const runtimeRoot = dirname(runtimeEntry);
const serviceEntry = appRequire.resolve("@platformatic/service");
const entries = [
  [runtimeEntry, "dist/watt/runtime"],
  [join(runtimeRoot, "lib/worker/main.js"), "dist/watt/runtime/worker"],
  [serviceEntry, "dist/watt/service"],
];
for (const [entry, outDir] of entries) {
  execFileSync("pnpm", ["exec", "vite", "build", "--ssr", entry, "--outDir", outDir], {
    cwd: appRoot,
    env: { ...process.env, WATT_STANDALONE_BUILD: "1" },
    stdio: "inherit",
  });
}

// Keep the launcher separate from the runtime so its relative paths stay stable.
mkdirSync(join(appRoot, "dist/watt"), { recursive: true });
copyFileSync(join(appRoot, "scripts/watt-start.mjs"), join(appRoot, "dist/watt/start.mjs"));

// All emitted .js files, including Watt worker entries, use ESM.
writeFileSync(join(appRoot, "dist/package.json"), '{"type":"module"}\n');
