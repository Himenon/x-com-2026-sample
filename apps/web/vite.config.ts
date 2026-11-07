import { isBuiltin } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";

function inlineWattPackageMetadata(): Plugin {
  return {
    name: "inline-watt-package-metadata",
    enforce: "pre",
    transform(source, id) {
      if (
        !/\/node_modules\/@platformatic\/(runtime|basic|service|telemetry|foundation)\/lib\/(version|schema|module)\.js$/.test(
          id,
        )
      )
        return;
      const metadata = readFileSync(resolve(dirname(id), "../package.json"), "utf8");
      const literal = JSON.stringify(JSON.parse(metadata));
      const updated = source
        .replace(
          /JSON\.parse\(readFileSync\(resolve\(import\.meta\.dirname, ['"]\.\.\/package\.json['"]\), ['"]utf-?8['"]\)\)/g,
          literal,
        )
        .replace(
          /JSON\.parse\(readFileSync\(new URL\(['"]\.\.\/package\.json['"], import\.meta\.url\), ['"]utf-?8['"]\)\)/g,
          literal,
        )
        .replace(
          /JSON\.parse\(await readFile\(new URL\(['"]\.\.\/package\.json['"], import\.meta\.url\), ['"]utf-?8['"]\)\)/g,
          literal,
        );
      if (
        updated === source &&
        /\/node_modules\/@platformatic\/(?:runtime\/lib\/version|basic\/lib\/schema|service\/lib\/schema|telemetry\/lib\/version)\.js$/.test(
          id,
        )
      ) {
        this.error(`Watt metadata loader changed; update the bundle integration: ${id}`);
      }
      return updated === source ? undefined : { code: updated, map: null };
    },
  };
}

function skipCurrentWattMigrations(): Plugin {
  return {
    name: "skip-current-watt-migrations",
    enforce: "pre",
    transform(source, id) {
      if (!id.endsWith("/node_modules/@platformatic/runtime/lib/upgrade.js")) return;
      const declaration = "export async function upgrade (logger, config, version) {";
      if (!source.includes(declaration))
        this.error("Watt upgrade handler changed; update the bundle integration");
      // The generated runtime config uses the installed runtime's schema
      // version, so no migrations are needed for this sample's configuration.
      return {
        code: `import { version as bundledRuntimeVersion } from './version.js'\n${source.replace(declaration, `${declaration}\n  if (version === bundledRuntimeVersion) return config`)}`,
        map: null,
      };
    },
  };
}

function exportWattGlobals(): Plugin {
  return {
    name: "export-watt-globals",
    enforce: "pre",
    transform(source, id) {
      if (!id.endsWith("/node_modules/@platformatic/runtime/index.js")) return;
      // wattpm normally initializes this before creating the runtime.
      return {
        code: `${source}\nexport { updateGlobals as initializeWattGlobals } from '@platformatic/globals'\n`,
        map: null,
      };
    },
  };
}

function bundleWattCapabilityResolver(): Plugin {
  return {
    name: "bundle-watt-capability-resolver",
    enforce: "pre",
    transform(source, id) {
      if (!id.endsWith("/node_modules/@platformatic/foundation/lib/configuration.js")) return;
      const lookup = "  pkg ??= extractModuleFromSchemaUrl(config, true).module";
      if (!source.includes(lookup))
        this.error("Watt capability loader changed; update the bundle integration");
      // The sample has one configured capability. Load its emitted bundle rather
      // than looking for @platformatic/service in node_modules at runtime.
      return {
        code: source.replace(
          lookup,
          `${lookup}
  if (pkg === '@platformatic/service') {
    const { pathToFileURL } = await import('node:url')
    return import(pathToFileURL(resolve(process.cwd(), 'dist/watt/service/index.js')).href)
  }`,
        ),
        map: null,
      };
    },
  };
}

function verifyStandaloneBundle(): Plugin {
  return {
    name: "verify-standalone-bundle",
    generateBundle(_options, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type !== "chunk") continue;
        for (const dependency of [...output.imports, ...output.dynamicImports]) {
          // Internal chunks and Node built-ins are the only allowed imports in
          // the standalone server image; package imports would need node_modules.
          if (!(dependency in bundle) && !isBuiltin(dependency)) {
            this.error(`Standalone server contains an external import: ${dependency}`);
          }
        }
      }
    },
  };
}

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    ...(process.env.WATT_STANDALONE_BUILD === "1"
      ? [
          inlineWattPackageMetadata(),
          bundleWattCapabilityResolver(),
          exportWattGlobals(),
          skipCurrentWattMigrations(),
        ]
      : []),
    babel({ parserOpts: { plugins: ["typescript", "jsx"] }, plugins: ["babel-plugin-relay"] }),
    react(),
    tailwindcss(),
    ...(isSsrBuild ? [verifyStandaloneBundle()] : []),
  ],
  build: { manifest: true, rolldownOptions: { input: "src/entry-client.tsx" } },
  ssr: { noExternal: true },
}));
