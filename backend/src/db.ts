import Database from "better-sqlite3";

export const db = new Database(process.env.DB_PATH ?? "./data.sqlite");
db.pragma("journal_mode = WAL");

db.prepare(
  `CREATE TABLE IF NOT EXISTS reading_sessions (
     id                TEXT PRIMARY KEY,
     auth_session_id   TEXT NOT NULL,
     roller_session_id TEXT NOT NULL,
     monitor_token     TEXT NOT NULL UNIQUE,
     created_at        TEXT NOT NULL
   )`,
).run();
db.prepare(
  `CREATE INDEX IF NOT EXISTS idx_reading_sessions_auth
     ON reading_sessions(auth_session_id, created_at)`,
).run();
