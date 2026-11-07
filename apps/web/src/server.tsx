import type { FastifyInstance } from "fastify";
import { resolve } from "node:path";
import { connectDatabase, closeDatabase } from "@sample/database";
import { registerAssetsRoute } from "./routes/assets";
import { registerGraphqlRoute } from "./routes/graphql";
import { registerHealthRoute } from "./routes/health";
import { registerHomeRoute } from "./routes/home";

export default async function app(server: FastifyInstance) {
  await connectDatabase();
  server.addHook("onClose", closeDatabase);

  const clientDir = resolve(process.cwd(), "dist/client");
  await registerGraphqlRoute(server);
  await registerAssetsRoute(server, clientDir);
  registerHealthRoute(server);
  await registerHomeRoute(server, clientDir);
}
