# WeatherIoT

Sistem IoT pentru vreme: **Open-Meteo (Internet) -> Backend (API + baza de date + alerte) -> Aplicatie mobila (Expo)**.
Colegii si cealalta echipa isi schimba date cu backend-ul prin HTTP (vezi `docs/contract.md`).

## Cerinte (instalate o singura data)
Node.js LTS, Git, VS Code, Expo Go pe telefon. Docker si MQTT NU sunt necesare.

## Prima configurare
1. Dezarhiveaza proiectul (Extract All) si deschide folderul in VS Code.
2. Dublu-click pe `setup.bat` (sau in terminal: `.\setup.bat`). Face singur: instalare backend, creare
   aplicatie Expo, copiere cod, setare IP.

## Pornire zilnica
1. `start-backend.bat`: porneste serverul. Trebuie sa vezi `Server listening` si `[ingest] open-meteo ...`.
2. `start-app.bat` (alta fereastra): apare un cod QR. Telefonul pe acelasi Wi-Fi, scaneaza cu Expo Go
   (Android: in Expo Go, iPhone: cu Camera).
3. In aplicatie: Inregistreaza-te, apoi vezi vremea. Test offline: opreste Wi-Fi-ul telefonului si trage ecranul in jos.

## Daca nu se conecteaza telefonul
- Windows Firewall: permite Node.js pe retea privata.
- Incearca `npx expo start --tunnel` in folderul `mobile`.
- Daca ai schimbat reteaua Wi-Fi, ruleaza din nou `powershell -ExecutionPolicy Bypass -File scripts\set-ip.ps1`.

## Structura
```
backend/     server TypeScript (Fastify, SQLite, JWT, colector Open-Meteo, reguli de alerta)
mobile-src/  codul aplicatiei (copiat in mobile/ de setup.bat)
mobile/      proiectul Expo (creat de setup.bat)
docs/        contract de date
scripts/     scripturi ajutatoare
```

## Securitate
Schimba `JWT_SECRET` in `backend/.env` (nu urca `.env` pe Git).
