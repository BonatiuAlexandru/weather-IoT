import Database from "better-sqlite3";

export const db = new Database("weather.db");
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic TEXT NOT NULL,
  source TEXT NOT NULL,
  temp REAL,
  humidity REAL,
  wind REAL,
  code INTEGER,
  ts TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_readings_ts ON readings(ts);
`);

export interface Reading {
  topic: string;
  source: string;
  temp: number | null;
  humidity: number | null;
  wind: number | null;
  code: number | null;
  ts: string;
}

const insertReading = db.prepare(
  `INSERT INTO readings (topic, source, temp, humidity, wind, code, ts)
   VALUES (@topic, @source, @temp, @humidity, @wind, @code, @ts)`
);
export const saveReading = (r: Reading) => insertReading.run(r);

export const latestReading = (): Reading | undefined =>
  db.prepare(`SELECT * FROM readings ORDER BY ts DESC LIMIT 1`).get() as Reading | undefined;

export const history = (limit = 48): Reading[] =>
  db.prepare(`SELECT * FROM readings ORDER BY ts DESC LIMIT ?`).all(limit) as Reading[];

// ---- Alerte ----
db.exec(`
CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  value REAL,
  ts TEXT NOT NULL
);
`);

export interface Alert {
  type: string;
  value: number | null;
  ts: string;
}

const insertAlert = db.prepare(`INSERT INTO alerts (type, value, ts) VALUES (@type, @value, @ts)`);
export const saveAlert = (a: Alert) => insertAlert.run(a);

export const latestAlerts = (limit = 20): Alert[] =>
  db.prepare(`SELECT type, value, ts FROM alerts ORDER BY ts DESC LIMIT ?`).all(limit) as Alert[];
