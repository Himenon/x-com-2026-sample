import type { FastifyInstance } from "fastify";
import { checkDatabase } from "@sample/database";

export function registerHealthRoute(server: FastifyInstance) {
  server.get("/health", async (_request, reply) => {
    try {
      await checkDatabase();
      return { status: "ok" };
    } catch (error) {
      server.log.error(error);
      return reply.code(503).send({ status: "unavailable" });
    }
  });
}
