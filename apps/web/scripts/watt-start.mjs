// This entrypoint is copied beside the Watt runtime bundle.
// The working directory must contain watt.json and dist/server/server.js.
import { create, initializeWattGlobals } from "./runtime/index.js";
import { resolve } from "node:path";

initializeWattGlobals({ executable: "wattpm" });
await create(process.cwd(), resolve(process.cwd(), "watt.json"), {
  start: true,
  production: true,
});
