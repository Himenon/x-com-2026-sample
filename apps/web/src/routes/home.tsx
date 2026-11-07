import type { FastifyInstance } from "fastify";
import { graphql as executeGraphql } from "graphql";
import { renderToPipeableStream } from "react-dom/server";
import { RelayEnvironmentProvider } from "react-relay";
import { getRequest } from "relay-runtime";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PassThrough } from "node:stream";
import { schema } from "@sample/graphql";
import { App } from "../App";
import { createRelayEnvironment, HomeQuery } from "../relay";

// HTML に埋め込む JSON をエスケープし、データをスクリプトとして解釈させない。
const escapeJson = (value: unknown) =>
  JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

export async function registerHomeRoute(server: FastifyInstance, clientDir: string) {
  const manifest = JSON.parse(await readFile(resolve(clientDir, ".vite/manifest.json"), "utf8"));
  const entry = manifest["src/entry-client.tsx"];
  if (!entry) throw new Error("Client entry is missing from the Vite manifest");
  server.get("/", async (_request, reply) => {
    // 記事のストリーミング SSR を体験できるよう、この領域だけ意図的に遅延させる。
    const slow = new Promise<void>((done) => setTimeout(done, 1500))
      .then(async () => {
        const result = await executeGraphql({ schema, source: "{ posts { id } }" });
        if (result.errors || !Array.isArray(result.data?.posts)) {
          throw new Error("Unable to load streamed data");
        }
        return result.data.posts.length;
      })
      .catch((error: unknown) => {
        server.log.error(error);
        return -1;
      });
    // 記事のルート単位のデータ取得を、単一ルートの初期クエリとして再現する。
    const source = getRequest(HomeQuery).params.text;
    if (!source) throw new Error("Home query has no text");
    const initial = await executeGraphql({ schema, source });
    if (initial.errors || !initial.data) throw new Error("Unable to load initial page data");
    // サーバー側で取得したクエリ結果を Relay ストアに投入し、描画時の再取得を避ける。
    const environment = createRelayEnvironment({ data: initial.data });
    const css = (entry.css ?? [])
      .map((file: string) => `<link rel="stylesheet" href="/${file}">`)
      .join("");
    const bootstrap = `<script>window.__RELAY_DATA__=${escapeJson(initial)}</script><script type="module" async src="/${entry.file}"></script>`;
    reply.hijack();
    reply.raw.statusCode = 200;
    reply.raw.setHeader("Content-Type", "text/html; charset=utf-8");
    reply.raw.write(
      `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Town Square / Lab</title>${css}${bootstrap}</head><body><div id="root">`,
    );
    // 記事と同様に HTML をストリーミングし、遅延領域の完了後に文書を閉じる。
    const output = new PassThrough();
    output.pipe(reply.raw, { end: false });
    output.on("end", () => reply.raw.end("</div></body></html>"));
    const stream = renderToPipeableStream(
      <RelayEnvironmentProvider environment={environment}>
        <App ready={slow} />
      </RelayEnvironmentProvider>,
      {
        onShellReady() {
          stream.pipe(output);
        },
        onShellError(error) {
          server.log.error(error);
          reply.raw.end("Rendering failed");
        },
        onError(error) {
          server.log.error(error);
        },
      },
    );
    reply.raw.on("close", () => stream.abort());
  });
}
