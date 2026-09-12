import { ulid } from "ulid";
import { db } from "./db.js";

export interface ReadingSession {
  id: string;
  authSessionId: string;
  rollerSessionId: string;
  monitorToken: string;
  createdAt: string;
}

function rowToSession(row: any): ReadingSession {
  return {
    id: row.id,
    authSessionId: row.auth_session_id,
    rollerSessionId: row.roller_session_id,
    monitorToken: row.monitor_token,
    createdAt: row.created_at,
  };
}

function insert(authSessionId: string): ReadingSession {
  const row = {
    id: ulid(),
    auth_session_id: authSessionId,
    roller_session_id: ulid(),
    monitor_token: ulid(),
    created_at: new Date().toISOString(),
  };
  db.prepare(
    `INSERT INTO reading_sessions (id, auth_session_id, roller_session_id, monitor_token, created_at)
     VALUES (@id, @auth_session_id, @roller_session_id, @monitor_token, @created_at)`,
  ).run(row);
  return rowToSession(row);
}

export function getCurrentReadingSession(authSessionId: string): ReadingSession | null {
  const row = db
    .prepare(
      `SELECT * FROM reading_sessions WHERE auth_session_id = ? ORDER BY created_at DESC LIMIT 1`,
    )
    .get(authSessionId);
  return row ? rowToSession(row) : null;
}

export function getOrCreateReadingSession(authSessionId: string): ReadingSession {
  return getCurrentReadingSession(authSessionId) ?? insert(authSessionId);
}

export function resetReadingSession(authSessionId: string): ReadingSession {
  return insert(authSessionId);
}

export function getReadingSessionByMonitorToken(token: string): ReadingSession | null {
  const row = db.prepare(`SELECT * FROM reading_sessions WHERE monitor_token = ?`).get(token);
  return row ? rowToSession(row) : null;
}
