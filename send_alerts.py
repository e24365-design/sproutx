"""Daily SMS alerts through SMS Gate (Android phone as gateway). Dry run (prints only) unless SMSGATE_USER is set.
Env: SUBSCRIBERS_JSON = [{"phone":"+947XXXXXXXX","district":"Anuradhapura","lang":"si"}], SMSGATE_USER, SMSGATE_PASS."""
import json, os, requests
DC={"Anuradhapura":(8.31,80.40),"Polonnaruwa":(7.94,81.00),"Vavuniya":(8.75,80.50),"Mannar":(8.98,79.91),"Trincomalee":(8.57,81.23),"Ampara":(7.30,81.67),"Hambantota":(6.12,81.12),"Monaragala":(6.87,81.35)}
MS={"heat":["Heat alert: water plants early morning.","வெப்ப எச்சரிக்கை: அதிகாலையில் பயிர்களுக்கு நீர் ஊற்றுங்கள்.","උෂ්ණ අනතුරු ඇඟවීම: උදෑසන ගස්වලට ජලය දමන්න."],
"rain":["Heavy rain soon. Delay fertilizer, clear drains.","கனமழை வருகிறது. உரமிடுவதை தள்ளிப்போடுங்கள்.","අධික වැසි එනවා. පොහොර දැමීම කල් දමන්න."],
"wind":["Strong wind expected. Support young plants.","பலத்த காற்று வரும். இளம் செடிகளுக்கு ஆதரவு கொடுங்கள்.","තද සුළං එනවා. ළපටි ශාකවලට ආධාර දෙන්න."],
"spray":["Good day to spray: low wind, no rain.","இன்று தெளிக்க நல்ல நாள்: காற்று குறைவு, மழை இல்லை.","අද ඉසීමට හොඳ දවසක්: සුළං අඩුයි, වැසි නැහැ."],
"ok":["No weather risks today.","இன்று வானிலை அபாயம் இல்லை.","අද කාලගුණ අවදානමක් නැහැ."]}
LI={"en":0,"ta":1,"si":2}
def keys(d):
    k=[]
    if max(d["temperature_2m_max"][:2])>=35:k.append("heat")
    if max(d["precipitation_sum"])>=20:k.append("rain")
    if max(d["wind_speed_10m_max"])>=30:k.append("wind")
    if not k and d["wind_speed_10m_max"][0]<=15 and d["precipitation_sum"][0]<1:k.append("spray")
    return k or ["ok"]
subs=json.loads(os.environ.get("SUBSCRIBERS_JSON","[]")); user,pw=os.environ.get("SMSGATE_USER"),os.environ.get("SMSGATE_PASS")
cache={}
for s in subs:
    dist=s.get("district","Anuradhapura")
    if dist not in cache:
        la,lo=DC[dist]
        cache[dist]=requests.get("https://api.open-meteo.com/v1/forecast",params={"latitude":la,"longitude":lo,"daily":"temperature_2m_max,precipitation_sum,wind_speed_10m_max","forecast_days":3,"timezone":"auto"},timeout=30).json()["daily"]
    msg="Sprout: "+" ".join(MS[k][LI.get(s.get("lang","en"),0)] for k in keys(cache[dist]))
    if not user: print("DRY RUN", s["phone"], msg); continue
    r=requests.post("https://api.sms-gate.app/3rdparty/v1/messages",auth=(user,pw),json={"textMessage":{"text":msg},"phoneNumbers":[s["phone"]]},timeout=30)
    print(s["phone"], r.status_code)
