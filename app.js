// Sprout – basic PWA. Sample data is marked "sample"; replace with real sources later.
const T={
home:["Home","முகப்பு","මුල් පිටුව"],account:["My account","என் கணக்கு","මගේ ගිණුම"],advice:["Advice","ஆலோசனை","උපදෙස්"],
alerts:["Alerts","எச்சரிக்கைகள்","අනතුරු ඇඟවීම්"],contact:["Contact","தொடர்பு","සම්බන්ධ වන්න"],fert:["Fertilizer","உரம்","පොහොර"],
map:["Map","வரைபடம்","සිතියම"],market:["Market","சந்தை","වෙළඳපොළ"],budget:["Budget","வரவு செலவு","අයවැය"],
hero:["See how your plant is doing","உங்கள் பயிர் எப்படி இருக்கிறது","ඔබේ ගස කොහොමද බලන්න"],
login:["Log in","உள்நுழை","ඇතුල් වන්න"],install:["Install app","செயலியை நிறுவு","යෙදුම ස්ථාපනය කරන්න"],
income:["More income","அதிக வருமானம்","වැඩි ආදායම"],water:["Save water","நீரை சேமிக்க","ජලය ඉතිරි කරන්න"],risk:["Lower risk","குறைந்த அபாயம்","අඩු අවදානම"],
name:["Your name","உங்கள் பெயர்","ඔබේ නම"],district:["District","மாவட்டம்","දිස්ත්‍රික්කය"],save:["Save","சேமி","සුරකින්න"]};
const LI={en:0,ta:1,si:2};let lang=localStorage.sprLang||"en";
const t=k=>(T[k]||[k])[LI[lang]]||T[k][0];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ld=(k,d)=>{try{return JSON.parse(localStorage[k])??d}catch{return d}};
const sv=(k,v)=>localStorage[k]=JSON.stringify(v);
const D=["Anuradhapura","Polonnaruwa","Vavuniya","Mannar","Trincomalee","Ampara","Hambantota","Monaragala"];
const TABS=[["home","🏠"],["account","👤"],["advice","💡"],["alerts","🔔"],["map","🗺️"],["market","🧺"],["fert","🧪"],["budget","💰"],["contact","☎️"]];
let user=ld("sprUser",null),prio="income",smap={},mapSel=null;
fetch("data/smap.json").then(r=>r.json()).then(j=>smap=j).catch(()=>{});

const STRAT=[
{n:"Current rotation (maize, then fallow)",s:{income:2,water:2,risk:2},why:"Baseline for comparison.",ev:"Fallow periods leave soil bare (MODIS vegetation gaps).",ben:"Familiar, low effort.",gap:"Needs the farmer's real field history.",rk:"Erosion and falling organic matter."},
{n:"Maize, then green gram (mung bean)",s:{income:4,water:3,risk:3},why:"Legumes add nitrogen and fill the bare season.",ev:"NASA POWER rainfall and SMAP soil moisture suggest the Yala window can support a short legume.",ben:"Less fertilizer, extra income, better cover.",gap:"Local soil tests and seed availability.",rk:"Short-season dry spells; confirm with an agri officer."},
{n:"Finger millet and cowpea",s:{income:3,water:5,risk:4},why:"Drought-tolerant crops use less water and fit dry spells.",ev:"ECOSTRESS/MODIS heat and vegetation stress patterns in dry months.",ben:"Lower water demand, steadier yields.",gap:"Market demand and prices by district.",rk:"Lower market price; labour at harvest."}];

const view=document.getElementById("view");
function nav(){const h=(location.hash||"#home").slice(1);document.getElementById("nav").innerHTML=TABS.map(([k,e])=>`<a class="cube ${k===h?"on":""}" href="#${k}" ${k===h?'aria-current="page"':""}><b>${e}</b><span>${esc(t(k))}</span></a>`).join("")}
function loginForm(){return `<div class="card"><h3>${t("login")}</h3><label>${t("name")}<input id="ln"></label><label>${t("district")}<select id="ld">${D.map(d=>`<option>${d}</option>`).join("")}</select></label><button class="btn" data-act="login">${t("login")}</button><button class="btn alt" data-act="gps">📍 GPS</button><p class="note">Demo login: data stays on this device only.</p></div>`}
const P={
home:()=>`<section class="hero"><div><svg class="plant" viewBox="0 0 120 140"><g class="sway"><path d="M60 135V60" stroke="#2f7d3a" stroke-width="6" stroke-linecap="round"/><path d="M60 80C60 45 35 30 10 35c0 35 22 52 50 45z" fill="#6fb83a"/><path d="M60 62c0-30 22-45 48-42 0 30-20 47-48 42z" fill="#a6d84a"/></g><ellipse cx="60" cy="136" rx="40" ry="5" fill="#4a3426"/></svg><h2>${t("hero")}</h2><p>⬇️</p></div></section>
<div class="grid">${TABS.slice(1).map(([k,e])=>`<a class="cube" href="#${k}"><b>${e}</b><span>${esc(t(k))}</span></a>`).join("")}</div>${user?`<p><a class="btn" href="#account">${t("account")}</a></p>`:loginForm()}`,
account:()=>{if(!user)return `<h2>${t("account")}</h2>`+loginForm();const c=ld("sprCrops",[]),a=ld("sprAdv",[]);return `<h2>${esc(user.name)}</h2><div class="card"><p>📍 ${esc(user.district)}</p><p>💰 ${esc(ld("sprBudget","–"))} LKR</p></div>
<div class="card"><h3>🌾 Past crops</h3>${c.map(x=>`<p>${esc(x)}</p>`).join("")||"<p class=note>None yet.</p>"}<input id="nc" placeholder="Crop, season, yield"><button class="btn" data-act="addcrop">+</button></div>
<div class="card"><h3>📜 Advice history</h3>${a.map(x=>`<p>${esc(x)}</p>`).join("")||"<p class=note>Saved advice appears here.</p>"}</div>
<div class="card"><h3>✏️ Edit profile</h3><input id="ln" value="${esc(user.name)}"><select id="ld">${D.map(d=>`<option ${d==user.district?"selected":""}>${d}</option>`).join("")}</select><button class="btn" data-act="login">${t("save")}</button><button class="btn alt" data-act="gps">📍 GPS</button><button class="btn sky" data-act="logout">Log out</button></div>`},
advice:()=>{const r=[...STRAT].sort((x,y)=>y.s[prio]-x.s[prio]);return `<h2>${t("advice")}</h2>
<div class="card"><button class="btn" data-act="msg">🤖 AI</button><button class="btn alt" data-act="msg">👩‍🌾 Agri specialist</button><button class="btn sky" data-act="msg">🎤 Voice note</button><textarea id="chat" rows="2" placeholder="Ask a question…"></textarea><p class="note" id="chatnote"></p></div>
<div class="card"><h3>📷 Crop photo check</h3><input type="file" accept="image/*" capture="environment" id="ph"><p class="note">AI pest and nutrient detection will connect here.</p></div>
<h3>🔄 Crop rotation</h3>${["income","water","risk"].map(k=>`<button class="btn ${k==prio?"":"alt"}" data-act="prio" data-k="${k}">${{income:"💰",water:"💧",risk:"🛡️"}[k]} ${t(k)}</button>`).join("")}
${r.map((s,i)=>`<div class="card"><h3>${i+1}. ${s.n}</h3><div class="bar"><i style="width:${s.s[prio]*20}%"></i></div><p><b>Why:</b> ${s.why}<br><b>Evidence:</b> ${s.ev}<br><b>Benefits:</b> ${s.ben}<br><b>Gaps:</b> ${s.gap}<br><b>Risks:</b> ${s.rk}</p><button class="btn" data-act="saveadv" data-n="${i}">Save to history</button></div>`).join("")}
<p class="note">Sample reasoning to show the layout. Supports farmer judgment; confirm locally with agri experts. Data: SMAP, GPM, NASA POWER, MODIS, ECOSTRESS.</p>`},
alerts:()=>`<h2>${t("alerts")}</h2>${[["🌡️","Heat alert: water plants early morning","advice"],["🌧️","Rain expected in 2 days: delay fertilizer","fert"],["💨","Strong wind: support young plants","advice"],["💧","Soil moisture low: irrigate this week","advice"]].map(a=>`<div class="card">${a[0]} ${a[1]} <a href="#${a[2]}">→ ${t(a[2])}</a></div>`).join("")}<p class="note">Sample alerts.</p>`,
map:()=>`<h2>${t("map")}</h2><div class="map">${D.map(d=>`<button data-act="dist" data-d="${d}" class="${d==mapSel?"on":""}">📍<br>${d}</button>`).join("")}</div>${mapSel?`<div class="card"><h3>${mapSel}</h3><p>Soil moisture (SMAP): ${smap[mapSel]??"–"}</p><p class="note">Simple district tiles; a real Sri Lanka map comes next.</p></div>`:""}`,
market:()=>{const l=ld("sprMkt",[]);return `<h2>${t("market")}</h2><div class="card"><h3>🧺 Sell</h3><input id="mc" placeholder="Crop"><input id="mk" type="number" placeholder="Kilos"><input id="mp" type="number" placeholder="Price per kg (LKR)"><button class="btn" data-act="sell">+</button>${l.map(x=>`<p>${esc(x)}</p>`).join("")}</div><div class="card"><h3>🛒 Buyer requests (sample)</h3><p>Colombo trader: 500 kg green gram</p><p>Hotel supplier: 200 kg tomatoes</p></div><div class="card"><h3>🚚 Transport help (sample)</h3><p>Lorry, Anuradhapura: 3 tonnes</p></div>`},
fert:()=>`<h2>${t("fert")}</h2>${[["Urea","–"],["TSP","–"],["Organic compost","–"]].map(f=>`<div class="card">🧪 ${f[0]} <span class="tag">price: add data</span></div>`).join("")}<a class="btn" href="#advice">💡 ${t("advice")}</a>`,
budget:()=>`<h2>${t("budget")}</h2><div class="card"><input id="bg" type="number" placeholder="LKR" value="${esc(ld("sprBudget",""))}"><button class="btn" data-act="budget">${t("save")}</button><p>Saved budget appears in <a href="#account">${t("account")}</a>. See <a href="#advice">${t("advice")}</a> and <a href="#fert">${t("fert")}</a>.</p></div>`,
contact:()=>`<h2>${t("contact")}</h2><div class="card"><a class="btn" href="tel:0000000000">📞 Agri department hotline (sample)</a><a class="btn alt" href="mailto:help@example.org">✉️ Email</a></div><div class="card"><h3>Service centers (sample)</h3><p>Anuradhapura Agri Service Center</p></div><div class="card"><h3>🤝 Community and charity (sample)</h3><p>Farmers' Friends: seed donation drive</p></div>`};
function render(){const h=(location.hash||"#home").slice(1);view.innerHTML=(P[h]||P.home)();nav();document.documentElement.lang=lang;document.getElementById("install").textContent="⬇️ "+t("install")}
document.addEventListener("click",e=>{const b=e.target.closest("[data-act]");if(!b)return;const a=b.dataset.act,v=id=>document.getElementById(id)?.value;
if(a=="login"){user={name:v("ln")||"Farmer",district:v("ld")};sv("sprUser",user);location.hash="#account";render();return}
if(a=="logout"){user=null;localStorage.removeItem("sprUser")}
if(a=="gps")navigator.geolocation?.getCurrentPosition(p=>alert("Location found: "+p.coords.latitude.toFixed(2)+", "+p.coords.longitude.toFixed(2)+". Pick the nearest district."),()=>alert("Location unavailable. Choose a district manually."));
if(a=="addcrop"&&v("nc")){sv("sprCrops",[...ld("sprCrops",[]),v("nc")])}
if(a=="saveadv"){const s=[...STRAT].sort((x,y)=>y.s[prio]-x.s[prio])[b.dataset.n];sv("sprAdv",[...ld("sprAdv",[]),new Date().toLocaleDateString()+": "+s.n])}
if(a=="prio")prio=b.dataset.k;
if(a=="dist")mapSel=b.dataset.d;
if(a=="msg"){document.getElementById("chatnote").textContent="Chat and voice will connect here."}
if(a=="sell"&&v("mc")){sv("sprMkt",[...ld("sprMkt",[]),`${v("mc")}: ${v("mk")} kg @ ${v("mp")} LKR`])}
if(a=="budget"){sv("sprBudget",v("bg"))}
if(a!="msg")render()});
document.getElementById("lang").value=lang;
document.getElementById("lang").onchange=e=>{lang=e.target.value;localStorage.sprLang=lang;render()};
addEventListener("hashchange",()=>{render();scrollTo(0,0)});
addEventListener("scroll",()=>document.documentElement.style.setProperty("--gr",Math.min(scrollY/400,1)),{passive:true});
let dp;addEventListener("beforeinstallprompt",e=>{e.preventDefault();dp=e});
document.getElementById("install").onclick=()=>dp?(dp.prompt(),dp=null):alert("Open your browser menu and choose Add to Home screen.");
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js");
render();
