import { ingest } from "./ingest.js";

const LAT = process.env.LAT ?? "46.77";
const LON = process.env.LON ?? "23.59";
const CITY = process.env.CITY ?? "cluj";

// Open-Meteo: gratuit, fara cheie API.
const URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
  `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;

export async function collectOnce() {
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
  const j: any = await res.json();
  const c = j.current;
  ingest({
    topic: CITY,
    source: "open-meteo",
    temp: c.temperature_2m,
    humidity: c.relative_humidity_2m,
    wind: c.wind_speed_10m,
    code: c.weather_code,
    ts: new Date().toISOString(),
  });
}

export function startCollector() {
  const every = Number(process.env.COLLECT_EVERY_MIN ?? 10) * 60_000;
  const run = () => collectOnce().catch((e) => console.error("[collector]", e.message));
  run();
  setInterval(run, every);
}
