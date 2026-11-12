import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import bcrypt from "bcryptjs";
import { db, latestReading, history, latestAlerts, type Reading } from "./db.js";
import { ingest } from "./ingest.js";
import { startCollector } from "./collector.js";

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });
await app.register(jwt, { secret: process.env.JWT_SECRET ?? "dev-secret-schimba-ma" });

app.decorate("auth", async (req: any, reply: any) => {
  try {
    await req.jwtVerify();
  } catch {
    reply.code(401).send({ error: "Neautorizat" });
  }
});

app.get("/health", async () => ({ ok: true }));

// ---- Autentificare (task: acces pe baza de user si parola) ----
app.post<{ Body: { username: string; password: string } }>("/auth/register", async (req, reply) => {
  const { username, password } = req.body ?? ({} as any);
  if (!username || !password || password.length < 6)
    return reply.code(400).send({ error: "Username si parola (min. 6 caractere) obligatorii" });
  try {
    const hash = bcrypt.hashSync(password, 10);
    db.prepare(`INSERT INTO users (username, password_hash) VALUES (?, ?)`).run(username, hash);
    return reply.code(201).send({ ok: true });
  } catch {
    return reply.code(409).send({ error: "Utilizatorul exista deja" });
  }
});

app.post<{ Body: { username: string; password: string } }>("/auth/login", async (req, reply) => {
  const { username, password } = req.body ?? ({} as any);
  const u = db.prepare(`SELECT * FROM users WHERE username = ?`).get(username) as any;
  if (!u || !bcrypt.compareSync(password ?? "", u.password_hash))
    return reply.code(401).send({ error: "Date de autentificare gresite" });
  const token = app.jwt.sign({ sub: u.id, username: u.username }, { expiresIn: "7d" });
  return { token, username: u.username };
});

// ---- Date meteo (protejate cu token) ----
app.get("/weather/current", { onRequest: [(app as any).auth] }, async (_req, reply) => {
  const r = latestReading();
  if (!r) return reply.code(404).send({ error: "Inca nu exista date" });
  return r;
});

app.get<{ Querystring: { limit?: string } }>("/weather/history", { onRequest: [(app as any).auth] }, async (req) => {
  return history(Math.min(Number(req.query.limit ?? 48), 500)).reverse();
});

// ---- Schimb de date cu colegii / alta echipa (HTTP) ----
// Un coleg sau o alta echipa isi trimite masuratoarea (ex: de la un senzor sau alt server) cu POST.
app.post<{ Body: Partial<Reading> & { city?: string } }>("/weather/ingest", { onRequest: [(app as any).auth] }, async (req, reply) => {
  const b = req.body ?? ({} as any);
  if (typeof b.temp !== "number") return reply.code(400).send({ error: "Campul temp (numar) este obligatoriu" });
  ingest({
    topic: String(b.city ?? "extern"),
    source: String(b.source ?? "extern"),
    temp: b.temp,
    humidity: typeof b.humidity === "number" ? b.humidity : null,
    wind: typeof b.wind === "number" ? b.wind : null,
    code: typeof b.code === "number" ? b.code : null,
    ts: String(b.ts ?? new Date().toISOString()),
  });
  return reply.code(201).send({ ok: true });
});

// Alertele generate de reguli (citite de aplicatie, colegi sau alta echipa).
app.get("/alerts", { onRequest: [(app as any).auth] }, async () => latestAlerts(20));

startCollector();

const port = Number(process.env.PORT ?? 3000);
await app.listen({ port, host: "0.0.0.0" });
