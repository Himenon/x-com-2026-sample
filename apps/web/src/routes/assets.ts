import type { FastifyInstance } from "fastify";
import fastifyStatic from "@fastify/static";
import { resolve } from "node:path";

export async function registerAssetsRoute(server: FastifyInstance, clientDir: string) {
  await server.register(fastifyStatic, {
    root: resolve(clientDir, "assets"),
    prefix: "/assets/",
    decorateReply: false,
    serve: true,
  });
}
