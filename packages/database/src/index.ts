import pg from "pg";
import { createClient } from "redis";

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});
export const cache = createClient({
  url: process.env.REDIS_URL,
  socket: {
    connectTimeout: 5000,
    reconnectStrategy: (retries) =>
      retries >= 5
        ? new Error("Redis connection failed after 5 retries")
        : Math.min(100 * 2 ** retries, 2000),
  },
});
cache.on("error", (error) => console.error("Redis error:", error));

export async function connectDatabase() {
  try {
    await pool.query("SELECT 1");
    await cache.connect();
  } catch (error) {
    await pool.end();
    if (cache.isOpen) cache.destroy();
    throw error;
  }
}

export async function checkDatabase() {
  await Promise.all([pool.query("SELECT 1"), cache.ping()]);
}

export async function closeDatabase() {
  await Promise.all([pool.end(), cache.isOpen ? cache.quit() : Promise.resolve()]);
}

export async function profile() {
  const { rows } = await pool.query(
    "SELECT id, name, handle, bio FROM profiles ORDER BY id LIMIT 1",
  );
  if (!rows[0]) throw new Error("No profile found; initialize the database first");
  return rows[0];
}

export async function posts() {
  const { rows } = await pool.query(
    'SELECT id, author_id AS "authorId", body, created_at AS "createdAt", likes FROM posts ORDER BY created_at DESC',
  );
  return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }));
}

export async function stats() {
  // バージョン付きキーを使い、更新前から実行中の集計が古いキャッシュを復活させるのを防ぐ。
  const version = (await cache.get("stats:version")) ?? "0";
  const key = `stats:${version}`;
  const cached = await cache.get(key);
  if (cached) return { ...JSON.parse(cached), cache: "HIT" };
  const { rows } = await pool.query(
    'SELECT count(*)::int AS "postCount", coalesce(sum(likes), 0)::int AS "totalLikes" FROM posts',
  );
  await cache.set(key, JSON.stringify(rows[0]), { EX: 60 });
  return { ...rows[0], cache: "MISS" };
}

export async function likePost(id: string) {
  const { rows } = await pool.query(
    'UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING id, author_id AS "authorId", body, created_at AS "createdAt", likes',
    [id],
  );
  if (!rows[0]) throw new Error("Post not found");
  // いいね数の更新後にバージョンを進め、以前の集計キャッシュを参照しないようにする。
  await cache.incr("stats:version");
  return { ...rows[0], createdAt: rows[0].createdAt.toISOString() };
}
