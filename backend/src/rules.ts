import { saveAlert, type Reading } from "./db.js";

// Regula de decizie (task "luarea unei decizii pe baza datelor"):
// daca temperatura scade sub 0 sau vantul trece de 50 km/h, salvam o alerta.
// Alerta poate fi citita de aplicatie, de colegi sau de alta echipa prin GET /alerts.
export function checkRules(r: Reading) {
  const ts = new Date().toISOString();
  if (typeof r.temp === "number" && r.temp < 0) saveAlert({ type: "inghet", value: r.temp, ts });
  if (typeof r.wind === "number" && r.wind > 50) saveAlert({ type: "vant-puternic", value: r.wind, ts });
}
