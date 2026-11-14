# Sprout
Farmer decision-support PWA (NASA 2026 hackathon). Static site: host with GitHub Pages (main / root).

## Setup
1. Upload every file in this folder to the repo root (keep the `data`, `scripts` and `.github` folders).
2. Settings > Pages: deploy from `main` / root.
3. SMAP pipeline: create a free account at https://urs.earthdata.nasa.gov, then in the repo go to Settings > Secrets and variables > Actions and add `EARTHDATA_USERNAME` and `EARTHDATA_PASSWORD`.
4. Actions tab > "Update SMAP data" > Run workflow. It then runs daily and updates `data/smap.json`.
5. Settings > Actions > General > Workflow permissions: allow read and write.

## Live data in the app
NASA POWER (rain, temperature, soil wetness), SRTM via OpenTopoData, Open-Meteo forecast, SMAP via the pipeline.
Community, market and logs are stored on the device only.

## SMS alerts (demo, via SMS Gate)
1. On an Android phone with a SIM, install SMS Gate (https://sms-gate.app), turn on Cloud mode and note the username and password on its Home screen. Keep the phone on and online.
2. In the app: My account > Phone alerts > Gateway settings, enter them, tick consent, press Preview then Send test SMS. Use your own number.
3. Daily sending: add repo secrets SMSGATE_USER, SMSGATE_PASS and SUBSCRIBERS_JSON (a JSON list of phone, district, lang). Never commit phone numbers or passwords to the repo. Without the user secret the script only prints a dry run.
