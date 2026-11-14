"""Fetch NASA SMAP L3 enhanced soil moisture (SPL3SMP_E) for Sri Lanka districts and write data/smap.json.
Needs a free NASA Earthdata account. Env vars: EARTHDATA_USERNAME, EARTHDATA_PASSWORD.
Not tested against live NASA servers from the build environment: check the first run's log."""
import json, datetime as dt, glob, os, sys
import numpy as np, h5py, earthaccess

DIST = {"Anuradhapura":(8.31,80.40),"Polonnaruwa":(7.94,81.00),"Vavuniya":(8.75,80.50),"Mannar":(8.98,79.91),
        "Trincomalee":(8.57,81.23),"Ampara":(7.30,81.67),"Hambantota":(6.12,81.12),"Monaragala":(6.87,81.35)}
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "smap.json")
end = dt.date.today(); start = end - dt.timedelta(days=8)

earthaccess.login(strategy="environment")
res = earthaccess.search_data(short_name="SPL3SMP_E", bounding_box=(79.5, 5.8, 82.0, 9.9),
                              temporal=(start.isoformat(), end.isoformat()))
if not res: sys.exit("No SMAP granules found; keeping the old file.")
os.makedirs("smap_tmp", exist_ok=True)
earthaccess.download(res, "smap_tmp")

vals = {d: [] for d in DIST}
for f in glob.glob("smap_tmp/*.h5"):
    with h5py.File(f) as h:
        for g in ("Soil_Moisture_Retrieval_Data_AM", "Soil_Moisture_Retrieval_Data_PM"):
            if g not in h: continue
            sm, la, lo = h[g]["soil_moisture"][:], h[g]["latitude"][:], h[g]["longitude"][:]
            for d, (y, x) in DIST.items():
                dist = (la - y) ** 2 + (lo - x) ** 2
                dist = np.where(la < -900, np.inf, dist)
                i = np.unravel_index(np.argmin(dist), dist.shape)
                if dist[i] < 0.05 and sm[i] > -900: vals[d].append(float(sm[i]))

out = {"updated": end.isoformat(), "source": "NASA SMAP SPL3SMP_E, 7-day mean, m3/m3",
       "districts": {d: round(float(np.mean(v)), 3) for d, v in vals.items() if v}}
if not out["districts"]: sys.exit("No valid values; keeping the old file.")
json.dump(out, open(OUT, "w"), indent=1)
print(out)
