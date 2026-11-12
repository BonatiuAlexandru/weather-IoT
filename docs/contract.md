# Contract de date (HTTP/REST), de completat cu echipa si cu cealalta echipa

## Autentificare
- `POST /auth/register` `{ "username": "...", "password": "min 6 caractere" }`
- `POST /auth/login` `{ "username": "...", "password": "..." }` -> `{ "token": "...", "username": "..." }`
- Celelalte cereri trimit antetul `Authorization: Bearer <token>`.

## Date meteo
- `GET /weather/current` -> ultima masuratoare
- `GET /weather/history?limit=48` -> istoric
- `POST /weather/ingest` -> un coleg / alta echipa trimite o masuratoare:
```json
{ "city": "cluj", "source": "laptop-coleg", "temp": 18.5, "humidity": 60, "wind": 12.3, "code": 3 }
```
(`temp` e obligatoriu, restul optional; `ts` se completeaza automat)

## Alerte (decizii)
- `GET /alerts` -> alerte generate de reguli (inghet: temp < 0, vant-puternic: vant > 50 km/h)

## Formate
`temp` in °C, `humidity` in %, `wind` in km/h, `code` = cod WMO (Open-Meteo), `ts` = ISO 8601 UTC.

## Pentru cealalta echipa
Stabiliti adresele (IP:port) ale serverelor si schimbati-va tokenuri / conturi de test. Fiecare echipa poate
apela cu `POST /weather/ingest` si `GET /weather/current` serverul celeilalte.
