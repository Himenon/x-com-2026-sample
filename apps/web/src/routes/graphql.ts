import type { FastifyInstance } from "fastify";
import mercurius from "mercurius";
import { schema } from "@sample/graphql";

export async function registerGraphqlRoute(server: FastifyInstance) {
  await server.register(mercurius, { schema, graphiql: false });
}
