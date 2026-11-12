// Coduri WMO folosite de Open-Meteo -> text + emoji + culoare de fundal
export function describe(code: number | null): { label: string; icon: string } {
  if (code === null) return { label: "—", icon: "❔" };
  if (code === 0) return { label: "Cer senin", icon: "☀️" };
  if (code <= 3) return { label: "Parțial noros", icon: "⛅" };
  if (code <= 48) return { label: "Ceață", icon: "🌫️" };
  if (code <= 57) return { label: "Burniță", icon: "🌦️" };
  if (code <= 67) return { label: "Ploaie", icon: "🌧️" };
  if (code <= 77) return { label: "Ninsoare", icon: "❄️" };
  if (code <= 82) return { label: "Averse", icon: "🌧️" };
  if (code <= 86) return { label: "Ninsoare puternică", icon: "🌨️" };
  return { label: "Furtună", icon: "⛈️" };
}

export function backgroundFor(temp: number | null): string {
  if (temp === null) return "#1e293b";
  if (temp < 0) return "#1e3a5f";
  if (temp < 12) return "#2b5876";
  if (temp < 24) return "#3b82f6";
  return "#f59e0b";
}
