import { Suspense, use, useEffect, useState, Component, type ReactNode } from "react";
import { useLazyLoadQuery } from "react-relay";
import { AboutDialog, Badge } from "@sample/ui";
import { PostCard } from "./PostCard";
import { HomeQuery } from "./relay";
import type { relayHomeQuery } from "./__generated__/relayHomeQuery.graphql";

class SectionError extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="loading">このセクションを読み込めませんでした。</div>
    ) : (
      this.props.children
    );
  }
}

function StreamedNote({ ready }: { ready: Promise<number> }) {
  const postCount = use(ready);
  if (postCount < 0) {
    return (
      <div className="loading" data-stream-error="true">
        このセクションを読み込めませんでした。
      </div>
    );
  }
  return (
    <div className="stream-note">
      <span className="pulse" />{" "}
      <div>
        <strong>Stream complete</strong>
        <p>GraphQL から {postCount} 件の投稿を遅延取得しました。</p>
      </div>
      <span className="stream-time">+1.5s</span>
    </div>
  );
}

function Stats({
  initial,
}: {
  initial: { readonly postCount: number; readonly totalLikes: number; readonly cache: string };
}) {
  const [stats, setStats] = useState(initial);
  useEffect(() => {
    const refresh = () => {
      fetch("/graphql", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: "{ stats { postCount totalLikes cache } }" }),
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.data?.stats) setStats(result.data.stats);
        })
        .catch(console.error);
    };
    window.addEventListener("stats:refresh", refresh);
    return () => window.removeEventListener("stats:refresh", refresh);
  }, []);
  return (
    <div className="stat-row">
      <div>
        <strong>{stats.postCount}</strong>
        <span>Posts</span>
      </div>
      <div>
        <strong>{stats.totalLikes}</strong>
        <span>Likes</span>
      </div>
      <div>
        <strong>{stats.cache}</strong>
        <span>Redis cache</span>
      </div>
    </div>
  );
}

export function App({ ready }: { ready: Promise<number> }) {
  const data = useLazyLoadQuery<relayHomeQuery>(HomeQuery, {}, { fetchPolicy: "store-or-network" });
  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">✳</span>
          <span>
            town square <em>/ lab</em>
          </span>
        </div>
        <span className="top-label">
          <span className="status-dot" /> SYSTEM ONLINE
        </span>
        <AboutDialog />
      </header>
      <main className="layout">
        <section className="main-column">
          <div className="section-heading">
            <div>
              <p className="eyebrow">AN EXPERIMENT IN THE OPEN WEB</p>
              <h1>
                A little space
                <br />
                <span>to connect.</span>
              </h1>
              <p className="intro">
                A living sample of the stack behind a faster, more connected web.
              </p>
            </div>
            <div className="hero-symbol" aria-hidden="true">
              ✳
            </div>
          </div>
          <div className="profile-card">
            <div className="cover">
              <div className="cover-grid" />
              <span>THE INTERNET IS FOR EVERYONE&nbsp; ↗</span>
              <div className="cover-orbit">✳</div>
            </div>
            <div className="profile-body">
              <div className="profile-top">
                <div className="avatar avatar-profile">S</div>
                <Badge>CREATOR PROFILE</Badge>
              </div>
              <h2>
                {data.profile.name} <span className="verified">✦</span>
              </h2>
              <p className="handle">@{data.profile.handle}</p>
              <p className="bio">{data.profile.bio}</p>
              <div className="profile-footer">
                <span>⌁ &nbsp;Tokyo, Japan</span>
                <span>↗ &nbsp;Building in public</span>
              </div>
            </div>
          </div>
          <div className="feed-heading">
            <div>
              <p className="eyebrow">THE LATEST</p>
              <h2>
                Notes from the square<span className="orange">.</span>
              </h2>
            </div>
            <span className="feed-count">{data.posts.length} POSTS</span>
          </div>
          <div className="feed">
            {data.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <div className="end-note">
            YOU'RE ALL CAUGHT UP <span>✳</span>
          </div>
        </section>
        <aside className="sidebar">
          <div className="sidebar-card">
            <p className="eyebrow">BEHIND THE PAGE</p>
            <h2>
              Built to be
              <br />
              understood<span className="orange">.</span>
            </h2>
            <p className="side-copy">
              One page, a whole stack. Explore how these pieces work together.
            </p>
            <div className="stack-list">
              <div>
                <span className="stack-number">01</span>
                <span>
                  <strong>React + Vite</strong>
                  <small>Streaming server render</small>
                </span>
                <span className="stack-arrow">↗</span>
              </div>
              <div>
                <span className="stack-number">02</span>
                <span>
                  <strong>Relay + GraphQL</strong>
                  <small>Declarative data fetching</small>
                </span>
                <span className="stack-arrow">↗</span>
              </div>
              <div>
                <span className="stack-number">03</span>
                <span>
                  <strong>Fastify + Watt</strong>
                  <small>Server &amp; workers</small>
                </span>
                <span className="stack-arrow">↗</span>
              </div>
              <div>
                <span className="stack-number">04</span>
                <span>
                  <strong>Postgres + Redis</strong>
                  <small>Storage &amp; cache</small>
                </span>
                <span className="stack-arrow">↗</span>
              </div>
            </div>
          </div>
          <div className="sidebar-card stats-card">
            <div className="card-head">
              <p className="eyebrow">LIVE SNAPSHOT</p>
              <span className="status-dot" />
            </div>
            <Stats initial={data.stats} />
          </div>
          <div className="sidebar-card stream-card">
            <p className="eyebrow">RENDERING IN REAL TIME</p>
            <SectionError>
              <Suspense
                fallback={
                  <div className="loading">
                    <span className="spinner" /> Waiting for streamed content...
                  </div>
                }
              >
                <StreamedNote ready={ready} />
              </Suspense>
            </SectionError>
          </div>
          <div className="side-footer">
            A SMALL EXPERIMENT FOR A BIGGER WEB <span>© 2026</span>
          </div>
        </aside>
      </main>
      <footer className="footer">
        <span>✳ &nbsp;TOWN SQUARE / LAB</span>
        <span>MADE FOR THE CURIOUS &nbsp; ↗</span>
      </footer>
    </div>
  );
}
