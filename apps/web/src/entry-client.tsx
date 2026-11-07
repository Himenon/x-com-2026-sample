import { hydrateRoot } from "react-dom/client";
import { RelayEnvironmentProvider } from "react-relay";
import type { GraphQLResponse } from "relay-runtime";
import { App } from "./App";
import { createRelayEnvironment } from "./relay";
import "./styles.css";

declare global {
  interface Window {
    __RELAY_DATA__: GraphQLResponse;
  }
}
const environment = createRelayEnvironment(window.__RELAY_DATA__);
const response = window.__RELAY_DATA__;
const initialPosts =
  "data" in response && response.data && Array.isArray(response.data.posts)
    ? response.data.posts.length
    : 0;
// 記事の段階的なハイドレーションを簡略化し、遅延領域は文書の完了後に結果を引き継ぐ。
const ready = new Promise<number>((resolve) => {
  const finish = () =>
    resolve(document.querySelector('[data-stream-error="true"]') ? -1 : initialPosts);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", finish, { once: true });
  } else {
    finish();
  }
});
function hydrate() {
  const root = document.getElementById("root");
  if (!root || !root.hasChildNodes()) return false;
  hydrateRoot(
    root,
    <RelayEnvironmentProvider environment={environment}>
      <App ready={ready} />
    </RelayEnvironmentProvider>,
  );
  return true;
}
// スクリプトが早く到着した場合は、描画対象の要素が追加されてからハイドレーションする。
if (!hydrate()) {
  const observer = new MutationObserver(() => {
    if (hydrate()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
