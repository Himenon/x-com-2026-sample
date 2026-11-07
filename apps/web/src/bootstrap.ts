import Fastify from "fastify";
import app from "./server";

const server = Fastify({ logger: false });
await server.register(app);
const shutdown = async () => {
  await server.close();
  process.exit(0);
};
process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);
await server.listen({ host: "0.0.0.0", port: Number(process.env.PORT ?? 3000) });
