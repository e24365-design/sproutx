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
