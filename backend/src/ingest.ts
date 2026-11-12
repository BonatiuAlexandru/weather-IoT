import { saveReading, type Reading } from "./db.js";
import { checkRules } from "./rules.js";

// Punct unic prin care intra orice masuratoare: de la colector, de la colegi, de la alta echipa.
export function ingest(r: Reading) {
  saveReading(r);
  checkRules(r);
  console.log(`[ingest] ${r.source} ${r.topic}: ${r.temp} °C`);
}
