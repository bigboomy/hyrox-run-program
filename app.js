/* Paste your Google Apps Script web app URL here (ends in /exec). */
const SHEET_URL = "https://script.google.com/macros/s/AKfycbzeVEf0PtRQXtfWDlQWQb_6Rem_J4Uk263Ut2Lhbed3_oFMnt8Js_a8pG_-zvSPTHKlnQ/exec";

/* ============================================================
   PROGRAM CONTENT — edit sessions here. Calculation code below.
   zone: "aer" | "lt" | "vo2" (pace) | "hr" (Zone 2 heart rate) | null (tests)
   strides: number of 200m warm-up strides at VO2max pace
   ============================================================ */
const PHASES = {0:"Pre-program",1:"Base",2:"Base",3:"Base",4:"Base",5:"Base",6:"Deload",7:"Build",8:"Build",9:"Build",10:"Build",11:"Build",12:"Race specific",13:"Race specific",14:"Race week"};
const PROGRAM = [
 {w:0, run:"Test", title:"6-min test", zone:null, work:"6-minute max distance test", note:"Run as far as you can in 6 minutes, then enter the distance above.", test:true},
 {w:1, run:"Run 1", title:"Speed", zone:"vo2", work:"8 × 400m", note:"Warm up 5 min. 90 sec rest between reps."},
 {w:1, run:"Run 2", title:"Zone 2", zone:"hr", work:"30 min continuous"},
 {w:1, run:"Run 3", title:"Distance", zone:"aer", work:"4km steady", opt:true},
 {w:2, run:"Run 1", title:"Speed", zone:"vo2", work:"10 × 400m", note:"Warm up 5 min. 60–90 sec rest between reps."},
 {w:2, run:"Run 2", title:"Zone 2", zone:"hr", work:"30–40 min continuous"},
 {w:2, run:"Run 3", title:"Distance", zone:"aer", work:"4km steady", opt:true},
 {w:3, run:"Run 1", title:"Speed", zone:"vo2", work:"800, 600, 400, 200 ×2 rounds", note:"Warm up 5 min. 1 min between reps, 3 min between rounds."},
 {w:3, run:"Run 2", title:"Zone 2", zone:"hr", work:"30–35 min continuous"},
 {w:3, run:"Run 3", title:"Split distance", zone:"aer", work:"3 × 2km", note:"1 min walk between.", opt:true},
 {w:4, run:"Run 1", title:"Speed", zone:"vo2", work:"2×800, 2×600, 2×400", note:"Warm up 5 min. 1 min rest between reps."},
 {w:4, run:"Run 2", title:"Zone 2", zone:"hr", work:"35–45 min continuous"},
 {w:4, run:"Run 3", title:"Retest", zone:null, work:"6-minute max distance retest", note:"Enter the distance above. It updates your paces for Weeks 5–14.", test:true},
 {w:5, run:"Run 1", title:"Speed", zone:"vo2", work:"1000, 800, 600, 400 ×2 rounds", note:"Warm up 5 min. 1 min between reps, 3 min between rounds."},
 {w:5, run:"Run 2", title:"Zone 2", zone:"hr", work:"40–50 min continuous"},
 {w:5, run:"Run 3", title:"Distance", zone:"aer", work:"6km steady", opt:true},
 {w:6, run:"Run 1", title:"Intervals", zone:"vo2", work:"8 × 400m", note:"1 min rest between reps."},
 {w:6, run:"Run 2", title:"Zone 2", zone:"hr", work:"30 min continuous"},
 {w:6, run:"Run 3", title:"Distance", zone:"aer", work:"4 × 1km", note:"90 sec walk between."},
 {w:7, run:"Run 1", title:"Speed", zone:"vo2", work:"2×1000, 2×800, 2×600, 2×400", strides:3, note:"1 min rest between reps."},
 {w:7, run:"Run 2", title:"Threshold", zone:"lt", work:"30–40 min continuous"},
 {w:8, run:"Run 1", title:"Speed", zone:"vo2", work:"1200, 800, 400 ×2 rounds", strides:3, note:"90 sec between reps, 3 min between rounds."},
 {w:8, run:"Run 2", title:"Threshold", zone:"lt", work:"35–40 min continuous"},
 {w:8, run:"Run 3", title:"Distance", zone:"aer", work:"8km steady", opt:true},
 {w:9, run:"Run 1", title:"Speed", zone:"vo2", work:"2×1200, 2×1000, 2×800", strides:3, note:"1 min rest between reps."},
 {w:9, run:"Run 2", title:"Threshold", zone:"lt", work:"40–45 min continuous"},
 {w:9, run:"Run 3", title:"Distance", zone:"aer", work:"10km steady", opt:true},
 {w:10, run:"Run 1", title:"Speed", zone:"vo2", work:"1500, 1000, 800, 400 ×2 rounds", strides:2, note:"1 min between reps, 3 min between rounds."},
 {w:10, run:"Run 2", title:"Threshold", zone:"lt", work:"45–50 min continuous", note:"From here: 2 runs a week. Add compromised running and erg work, and prioritise leg recovery."},
 {w:11, run:"Run 1", title:"Speed", zone:"vo2", work:"2×1500, 2×1000, 2×800, 2×400", strides:3, note:"1 min rest between reps."},
 {w:11, run:"Run 2", title:"Threshold", zone:"lt", work:"50–60 min continuous"},
 {w:12, run:"Run 1", title:"Race pace", zone:"lt", work:"8 × 1km", strides:2, note:"1 min rest. Feel the pace and check your watch as little as possible."},
 {w:12, run:"Run 2", title:"Threshold", zone:"lt", work:"60 min continuous"},
 {w:13, run:"Run 1", title:"Race pace", zone:"lt", work:"8 × 1200m", strides:2, note:"1 min rest. Feel the pace and check your watch as little as possible."},
 {w:13, run:"Run 2", title:"Threshold", zone:"lt", work:"60 min continuous"},
 {w:14, run:"Run 1", title:"Steady intervals", zone:"aer", work:"8 × 400m", strides:2, note:"90 sec rest between reps."},
 {w:14, run:"Run 2", title:"Recovery", zone:"hr", work:"20–30 min continuous"}
];
const ZONES = {hr:{name:"Zone 2 HR",desc:"Zone 2 runs"}, aer:{name:"Aerobic",desc:"Steady & distance runs"}, lt:{name:"Threshold",desc:"LT, race pace"}, vo2:{name:"VO2max",desc:"Speed reps"}};

/* ============================ CALCULATIONS ============================
   Running Fatigue Factor (aerobiccapacity.com), 6-min test only. Speeds in m/s.
*/
function speeds(d){
  const v6 = d/6;                                   // m/min
  const pct = 0.8 + 0.1894393*Math.exp(-0.012778*6) + 0.2989558*Math.exp(-0.1932605*6);
  const vdot = (-4.6 + 0.182258*v6 + 0.000104*v6*v6)/pct;
  const aer = d*Math.pow(10, Math.log10(60)/1.105)/21600;           // Riegel 6-hr projection
  const v88 = 0.88*vdot;
  const lt = (29.54 + 5.000663*v88 - 0.007546*v88*v88)/60;          // 88% VDOT
  const vo2 = 2.8859 + 0.0686*(vdot - 29);
  return {aer, lt, vo2};
}
function fmt(sec){ sec=Math.round(sec); return Math.floor(sec/60)+":"+String(sec%60).padStart(2,"0"); }
function pace(v){ return {main:fmt(1000/v), fast:fmt(1000/(v*1.05)), slow:fmt(1000/(v*0.95))}; }
const valid = d => Number.isFinite(d) && d>=600 && d<=2600;
const validAge = a => Number.isInteger(a) && a>=12 && a<=90;
const MAF_SHORT = {"-10":"Recovering or on medication (−10)", "-5":"New, returning, injured or often sick (−5)", "0":"Training consistently, up to 2 yrs (0)", "5":"Training 2+ yrs and progressing (+5)"};
// Zone 2 heart rate (Maffetone MAF): ceiling = 180 − age + training-history adjustment,
// zone = ceiling − 10 up to ceiling. Age 16 and under: fixed ceiling of 165.
// e.g. age 40, no adjustment → 130–140 bpm
function zone2(age, adj){
  const c = age <= 16 ? 165 : 180 - age + (Number(adj) || 0);
  return {low:c-10, high:c, text:`${c-10}–${c} bpm`};
}

/* ============================ DISTANCE ============================
   Planned distance for a session, in km, parsed from the workout text.
   Time-based runs ("30 min continuous") return null — athletes type their own.
*/
function plannedKm(work){
  const w = String(work);
  if(/min/.test(w) || /test/i.test(w)) return null;
  let total = 0, found = false;
  // "3 \u00d7 2km", "8 \u00d7 400m", "4km steady", "2\u00d7800, 2\u00d7600", "1000, 800, 600, 400 \u00d72 rounds"
  const rounds = w.match(/\u00d7\s*(\d+)\s*rounds/);
  const mult = rounds ? Number(rounds[1]) : 1;
  const body = w.replace(/\u00d7\s*\d+\s*rounds/, "");
  body.split(",").forEach(part=>{
    const m = part.match(/(?:(\d+)\s*\u00d7\s*)?(\d+(?:\.\d+)?)\s*(km|m)?/);
    if(!m) return;
    const reps = m[1] ? Number(m[1]) : 1;
    const val = Number(m[2]);
    if(!val) return;
    const unit = m[3] || (val >= 200 ? "m" : "km");
    total += reps * (unit === "km" ? val : val/1000);
    found = true;
  });
  total *= mult;
  return found && total > 0 ? Math.round(total*100)/100 : null;
}
const km2 = v => (Math.round(Number(v)*100)/100).toFixed(2);

/* ============================ STORAGE ============================ */
const KEY="hyroxRunProgram.v1";
function load(){ try{ return JSON.parse(localStorage.getItem(KEY))||{}; }catch(e){ return {}; } }
function save(s){ try{ localStorage.setItem(KEY, JSON.stringify(s)); }catch(e){} }
let state = Object.assign({name:"",age:"",maf:"0",sent:"",email:"",test:"",retest:"",ticks:{},km:{},days:[],start:""}, load());
// Existing athletes (anyone who already had a test entered before the lock existed) stay unlocked.
if(state.unlocked === undefined) state.unlocked = !!state.test;

function applyLock(){
  const locked = !state.unlocked;
  document.body.classList.toggle("locked", locked);
  $("sendTitle").textContent = locked ? "🔓 Unlock your program" : "📤 Send results to your coach";
  $("send").textContent = locked ? "Unlock my program" : "Save my results";
  $("sendBox").open = locked;
}

/* ============================ RENDER ============================ */
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

function render(){
  const t = parseFloat(state.test), r = parseFloat(state.retest);
  const hasT = valid(t), hasR = valid(r);
  $("testErr").textContent = state.test!=="" && !hasT ? "Enter a distance between 600 and 2600 m." : "";
  $("retestErr").textContent = state.retest!=="" && !hasR ? "Enter a distance between 600 and 2600 m." : "";
  const s1 = hasT ? speeds(t) : null;
  const s2 = hasR ? speeds(r) : s1;
  const a = Number(state.age), hasA = validAge(a), hr = hasA ? zone2(a, state.maf) : null;
  $("mafBox").hidden = hasA && a <= 16; $("mafNote").hidden = !(hasA && a <= 16);
  $("mafCur").textContent = MAF_SHORT[String(state.maf)] || MAF_SHORT["0"];
  $("ageErr").textContent = state.age!=="" && !hasA ? "Enter an age between 12 and 90." : "";

  // print header
  $("printhead").textContent = (hasT ? "6-min test: "+t+" m" : "") + (hasR ? "   |   Week 4 retest: "+r+" m" : "");

  // lanes
  $("lanes").innerHTML = `<div class="lane hr"><div class="z">${ZONES.hr.name}<small>${ZONES.hr.desc}</small></div>
      ${hr ? `<div class="p span">${hr.text}<span>All weeks · stay at or below ${hr.high}</span></div>` : `<div class="p na span">Enter your age</div>`}</div>` +
    ["aer","lt","vo2"].map(z=>{
    const cell = (s, pending) => {
      if(!s) return `<div class="p na">${pending}</div>`;
      const p = pace(s[z]); return `<div class="p">${p.main}<span>${p.fast}–${p.slow} /km</span></div>`;
    };
    return `<div class="lane ${z}"><div class="z">${ZONES[z].name}<small>${ZONES[z].desc}</small></div>
      ${cell(s1,"Enter test")}${cell(hasR?s2:null, hasT?"After retest":"Enter test")}</div>`;
  }).join("");

  // program
  let html = "", cur = -1, total = 0, done = 0;
  PROGRAM.forEach((s,i)=>{
    if(s.w!==cur){
      if(cur!==-1) html += "</section>";
      cur = s.w;
      const src = s.w===0 ? "" : s.w<=4 ? "Paces from your test" : (hasR ? "Paces from your retest" : "Using first test until retest is entered");
      html += `<section class="week"><h2>${s.w===0?"Before you start":"Week "+s.w}<span class="phase">${s.w===0?"":PHASES[s.w]}</span><span class="src">${src}</span></h2>`;
    }
    const id = "s"+i, checked = !!state.ticks[id];
    const logged = !!(state.km[id] && state.km[id].km > 0);
    const planned = plannedKm(s.work);
    total++; if(checked) done++;
    const sp = s.w<=4 ? s1 : s2;
    let paceHtml = "";
    if(s.zone==="hr"){
      paceHtml = `<span class="pill hr">Zone 2</span>` + (hr ? `<b>${hr.text}</b><span>Heart rate</span>` : `<span>Enter your age</span>`);
    } else if(s.zone){
      paceHtml = `<span class="pill ${s.zone}">${ZONES[s.zone].name}</span>`;
      if(sp){ const p = pace(sp[s.zone]); paceHtml += `<b>${p.main} /km</b><span>${p.fast}–${p.slow}</span>`; }
      else paceHtml += `<span>Enter test</span>`;
    }
    let note = s.note||"";
    if(s.strides){
      const sv = sp ? " at "+pace(sp.vo2).main+" /km" : "";
      note = `Warm up 5 min + ${s.strides} × 200m strides${sv}. ` + note;
    }
    html += `<div class="sess${s.opt?" opt":""}${s.test?" test":""}${checked?" done":""}">
      <input type="checkbox" id="${id}" ${checked?"checked":""} aria-label="Mark ${esc(s.run)} week ${s.w} done">
      <label class="what" for="${id}"><div class="run">${esc(s.run)}</div><div class="title">${esc(s.title)}</div>
        <div class="work">${esc(s.work)}</div>${note?`<div class="note">${esc(note)}</div>`:""}</label>
      <div class="pace">${paceHtml}</div>
      ${s.test ? "" : `<details class="logbox" id="log${i}" ${logged?"open":""}>
        <summary>${logged ? `<span class="logged">✓ ${km2(state.km[id].km)} km logged</span>` : "Log run"}</summary>
        <div class="logrow">
          <input type="number" step="0.01" min="0" max="80" inputmode="decimal" data-km="${id}" value="${logged ? km2(state.km[id].km) : ""}" placeholder="${planned ? km2(planned) : "0.00"}" aria-label="Distance in km">
          <span class="unit">km${planned ? "" : " (optional for time-based runs)"}</span>
          <button class="sh sh-below" type="button" data-i="${i}" aria-label="Share this session">⬆ Share</button>
        </div>
      </details>`}</div>`;
  });
  html += "</section>";
  if(!hasT) html = `<div class="empty">Enter your 6-minute test distance above to see your paces.</div>` + html;
  $("program").innerHTML = html;
  $("progress").textContent = `${done} of ${total} sessions done`;
}

/* ============================ EVENTS ============================ */
["name","age","email","test","retest"].forEach(k=>{
  $(k).value = state[k]||"";
  $(k).addEventListener("input", e=>{ state[k]=e.target.value.trim(); save(state); render(); if(typeof updateCalHints==="function") updateCalHints(); });
});
document.querySelectorAll('input[name="maf"]').forEach(r=>{
  r.checked = r.value === String(state.maf);
  r.addEventListener("change", ()=>{ state.maf = r.value; save(state); render(); setTimeout(()=>{ $("mafBox").open = false; }, 250); });
});
$("program").addEventListener("change", e=>{
  if(e.target.type!=="checkbox") return;
  state.ticks[e.target.id] = e.target.checked; save(state);
  e.target.closest(".sess").classList.toggle("done", e.target.checked);
  const d = Object.values(state.ticks).filter(Boolean).length;
  $("progress").textContent = `${d} of ${PROGRAM.length} sessions done`;
  updateStrip(); queueSync();
});
$("reset").addEventListener("click", ()=>{ if(confirm("Clear all ticked sessions and logged distances?")){ state.ticks={}; state.km={}; save(state); render(); updateStrip(); queueSync(); } });

// logging a distance also ticks the session off
$("program").addEventListener("change", e=>{
  const id = e.target.dataset && e.target.dataset.km;
  if(!id) return;
  const v = parseFloat(e.target.value);
  if(Number.isFinite(v) && v > 0){
    state.km[id] = {km: Math.round(v*100)/100, on: toISO(new Date())};
    state.ticks[id] = true;
  } else {
    delete state.km[id];
  }
  save(state); render(); updateStrip(); queueSync();
});

/* ============================ PROGRESS ============================ */
function mondayOf(d){ const x = new Date(d); x.setHours(0,0,0,0); x.setDate(x.getDate() - ((x.getDay()+6)%7)); return x; }
function progressTotals(){
  const runs = Object.values(state.ticks).filter(Boolean).length;
  let total = 0, week = 0;
  const wkStart = mondayOf(new Date());
  Object.values(state.km).forEach(e=>{
    const v = Number(e.km)||0; total += v;
    if(e.on && parseISO(e.on) >= wkStart) week += v;
  });
  return {runs, total, week, pct: Math.min(100, Math.round(runs/PROGRAM.length*100))};
}
function updateStrip(){
  const p = progressTotals();
  $("stripNums").innerHTML =
    `<span class="n">${p.runs}<small>Runs</small></span>` +
    `<span class="n">${km2(p.total)}<small>Total km</small></span>` +
    `<span class="n">${km2(p.week)}<small>This week</small></span>`;
  $("stripFill").style.width = p.pct + "%";
}
/* ============================ SHARE IMAGE ============================ */
let shIndex = 0, shMode = "session";
let shMono = false; // default: full colour (zone accent colours). Toggle switches to a single-colour white monotone version for overlaying on photos.
// the white outline logo — used in both modes, since the export always sits on a transparent background
let logoImg = null, logoLoaded = false;
function loadLogo(){
  if(logoLoaded) return Promise.resolve();
  return new Promise(done => {
    const img = new Image();
    img.onload = () => { logoImg = img; logoLoaded = true; done(); };
    img.onerror = () => done();
    img.src = "logo-white.png";
  });
}

function shareLines(i){
  const s = PROGRAM[i];
  const t = parseFloat(state.test), r = parseFloat(state.retest);
  const sp = s.w<=4 ? (valid(t)?speeds(t):null) : (valid(r)?speeds(r):(valid(t)?speeds(t):null));
  const age = Number(state.age), hr = validAge(age) ? zone2(age, state.maf) : null;
  const key = s.zone || "ink";
  let target = "";
  if(s.zone==="hr") target = hr ? `Zone 2 · ${hr.text}` : "Zone 2 heart rate";
  else if(s.zone && sp) target = `${ZONES[s.zone].name} · ${pace(sp[s.zone]).main} /km`;
  else if(s.zone) target = ZONES[s.zone].name;
  else if(s.test && s.w===0 && valid(t)) target = `${t} m in 6 minutes`;
  else if(s.test && s.w===4 && valid(r)) target = `${r} m in 6 minutes`;
  const e = state.km["s"+i];
  return {
    top: (s.w===0 ? "BEFORE YOU START" : `WEEK ${s.w} · ${PHASES[s.w].toUpperCase()}`) + ` · ${s.run.toUpperCase()}`,
    work: s.work, target, key,
    km: e && e.km > 0 ? km2(e.km) : null
  };
}

function drawShare(canvas, i){
  const L = shareLines(i);
  const COL = {hr:"#3ECF8E", aer:"#4CC0C0", lt:"#E4B700", vo2:"#FF6B55"};
  const fg = "#FFFFFF";
  const accent = shMono ? fg : (COL[L.key] || fg);
  const W = 1080, PAD = 70, BAR = 14, x = PAD + BAR + 34;
  const ctx = canvas.getContext("2d");
  // wrap the workout text, shrinking until it fits 2 lines
  let size = 104, lines = [];
  for(; size >= 56; size -= 6){
    ctx.font = `700 ${size}px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`;
    lines = []; let line = "";
    for(const word of L.work.split(" ")){
      const test = line ? line + " " + word : word;
      if(ctx.measureText(test).width > W - x - PAD && line){ lines.push(line); line = word; } else line = test;
    }
    if(line) lines.push(line);
    if(lines.length <= 2) break;
  }
  const distSize = Math.round(size * 1.2);   // 20% larger than the workout line
  const distBlock = L.km ? distSize + 24 : 0;
  const H = PAD + 46 + lines.length*(size+6) + 44 + 40 + distBlock + 80 + PAD;
  canvas.width = W; canvas.height = H;
  ctx.clearRect(0,0,W,H);
  ctx.shadowColor = "rgba(0,0,0,.55)";
  ctx.shadowBlur = 22; ctx.shadowOffsetY = 4;
  // accent bar
  ctx.fillStyle = accent; ctx.fillRect(PAD, PAD, BAR, H - 2*PAD);
  let y = PAD + 34;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = accent; ctx.font = `600 34px "Barlow", Arial, sans-serif`;
  ctx.fillText(L.top, x, y); y += 26;
  ctx.fillStyle = fg; ctx.font = `700 ${size}px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`;
  lines.forEach(l => { y += size; ctx.fillText(l, x, y); y += 6; });
  y += 58;
  if(L.target){ ctx.fillStyle = accent; ctx.font = `700 55px "Barlow", Arial, sans-serif`; ctx.fillText(L.target, x, y); }
  y += 48;
  // logged distance — the hero number when the athlete has entered one
  if(L.km){
    y += distSize;
    ctx.fillStyle = fg; ctx.font = `800 ${distSize}px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`;
    const num = L.km;
    ctx.fillText(num, x, y);
    const nw = ctx.measureText(num).width;
    ctx.fillStyle = accent; ctx.font = `700 ${Math.round(distSize*0.42)}px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`;
    ctx.fillText("KM", x + nw + 14, y);
    y += 24;
  }
  // brand mark + wordmark
  y += 40;
  const markH = 84, markW = markH * 565/900;
  if(logoImg && logoImg.complete && logoImg.naturalWidth){
    ctx.save(); ctx.shadowBlur = 0; ctx.drawImage(logoImg, x, y - markH + 10, markW, markH); ctx.restore();
  }
  ctx.fillStyle = fg; ctx.font = `700 42px "Barlow", Arial, sans-serif`;
  ctx.fillText("@boomwilliams", x + markW + 20, y - 14);
}

// Progress card: story size, content down the right edge so the photo shows through on the left.
function drawProgress(canvas){
  const p = progressTotals();
  const cur = PROGRAM.find((s,i)=> s.w>0 && !state.ticks["s"+i]) || PROGRAM[PROGRAM.length-1];
  const accent = shMono ? "#FFFFFF" : "#E4B700";
  const fg = "#FFFFFF";
  const W = 1080, H = 1920, PAD = 80, BAR = 14;
  const right = W - PAD, colW = 640, x = right;
  const ctx = canvas.getContext("2d");
  canvas.width = W; canvas.height = H;
  ctx.clearRect(0,0,W,H);
  ctx.shadowColor = "rgba(0,0,0,.55)"; ctx.shadowBlur = 24; ctx.shadowOffsetY = 4;
  ctx.textAlign = "right"; ctx.textBaseline = "alphabetic";

  let y = 1080;
  // accent rule down the right side, alongside the block
  const blockTop = y - 60;
  ctx.fillStyle = accent; ctx.fillRect(right + 22, blockTop, BAR, 560);

  ctx.fillStyle = accent; ctx.font = `600 38px "Barlow", Arial, sans-serif`;
  ctx.fillText(`WEEK ${cur.w} \u00b7 ${PHASES[cur.w].toUpperCase()}`, x, y); y += 40;

  // this week is the hero number
  ctx.fillStyle = fg; ctx.font = `800 210px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`;
  ctx.fillText(km2(p.week), x, y + 150); y += 168;
  ctx.fillStyle = accent; ctx.font = `700 60px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`;
  ctx.fillText("KM THIS WEEK", x, y + 52); y += 116;

  ctx.fillStyle = fg; ctx.font = `800 96px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`;
  ctx.fillText(`RUNS: ${p.runs}`, x, y + 20); y += 74;

  // total sits underneath, smaller
  ctx.fillStyle = fg; ctx.globalAlpha = .85; ctx.font = `600 52px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`;
  ctx.fillText(`${km2(p.total)} km total`, x, y + 20); ctx.globalAlpha = 1; y += 100;

  // logo + handle, right aligned
  const markH = 92, markW = markH * 565/900;
  ctx.font = `700 46px "Barlow", Arial, sans-serif`;
  const handle = "@boomwilliams";
  ctx.fillStyle = fg; ctx.fillText(handle, x, y + 40);
  if(logoImg && logoImg.complete && logoImg.naturalWidth){
    const tw = ctx.measureText(handle).width;
    ctx.save(); ctx.shadowBlur = 0;
    ctx.drawImage(logoImg, x - tw - 20 - markW, y - markH + 50, markW, markH);
    ctx.restore();
  }
  ctx.textAlign = "left";
}

function drawCurrent(){
  if(shMode === "progress") drawProgress($("shCanvas"));
  else drawShare($("shCanvas"), shIndex);
}

async function openShare(i){
  shIndex = i; shMono = false; $("shMono").textContent = "Monotone";
  try { await document.fonts.load('700 84px "Barlow Condensed"'); await document.fonts.load('600 40px "Barlow"'); } catch(e){}
  await loadLogo();
  shMode = "session"; $("shView").textContent = "My progress";
  drawCurrent();
  $("shMsg").textContent = ""; $("shModal").hidden = false;
}
$("program").addEventListener("click", e=>{
  const b = e.target.closest(".sh"); if(b) openShare(+b.dataset.i);
});
$("shClose").addEventListener("click", ()=>{ $("shModal").hidden = true; });
$("shModal").addEventListener("click", e=>{ if(e.target === $("shModal")) $("shModal").hidden = true; });
$("shMono").addEventListener("click", ()=>{
  shMono = !shMono; $("shMono").textContent = shMono ? "Colour" : "Monotone"; drawCurrent();
});
$("shView").addEventListener("click", ()=>{
  shMode = shMode === "session" ? "progress" : "session";
  $("shView").textContent = shMode === "progress" ? "This session" : "My progress";
  drawCurrent();
});
$("shProg").addEventListener("click", async ()=>{
  try { await document.fonts.load('800 210px "Barlow Condensed"'); } catch(e){}
  await loadLogo();
  shMode = "progress"; $("shView").textContent = "This session";
  drawCurrent();
  $("shMsg").textContent = ""; $("shModal").hidden = false;
});
$("shSave").addEventListener("click", ()=>{
  const canvas = $("shCanvas"), msg = $("shMsg");
  canvas.toBlob(async blob=>{
    if(!blob){ msg.textContent = "Couldn’t create the image. Please try again."; return; }
    const file = new File([blob], shMode === "progress" ? "hyrox-progress.png" : "hyrox-session.png", {type:"image/png"});
    if(navigator.canShare && navigator.canShare({files:[file]})){
      try { await navigator.share({files:[file]}); msg.textContent = ""; return; }
      catch(err){ if(err && err.name === "AbortError"){ msg.textContent = ""; return; } }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = shMode === "progress" ? "hyrox-progress.png" : "hyrox-session.png";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 10000);
    msg.textContent = "Image saved. Check your downloads.";
  }, "image/png");
});

/* ============================ SAVE AS PDF ============================ */
// PDF core fonts only cover basic characters, so swap symbols for plain equivalents.
const pdfText = t => String(t).replace(/[–—−]/g,"-").replace(/×/g,"x").replace(/·/g,"|").replace(/±/g,"+/-").replace(/’/g,"'").replace(/…/g,"...").replace(/[^\x20-\x7E]/g,"");

// Rasterise the gold logo once so jsPDF can place it in the header.
let pdfLogo = null;
function loadPdfLogo(){
  if(pdfLogo) return Promise.resolve();
  return new Promise(done => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      c.getContext("2d").drawImage(img, 0, 0);
      try { pdfLogo = c.toDataURL("image/png"); } catch(e){}
      done();
    };
    img.onerror = () => done();
    img.src = "logo-gold.png";
  });
}

function buildPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({unit:"mm", format:"a4"});
  const W = 210, H = 297, M = 14, CW = W - 2*M;
  const COL = {ink:[20,22,26], muted:[94,104,120], rule:[215,218,224], soft:[242,243,245],
    brand:[228,183,0], hr:[46,139,87], aer:[31,138,138], lt:[168,133,10], vo2:[217,65,43]};
  const t = parseFloat(state.test), r = parseFloat(state.retest);
  const s1 = valid(t) ? speeds(t) : null, s2 = valid(r) ? speeds(r) : s1;
  const age = Number(state.age), hr = validAge(age) ? zone2(age, state.maf) : null;
  let y = M, page = 1;

  const footer = () => {
    doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(...COL.muted);
    doc.text(pdfText("@boomwilliams  |  Pace calculations: Running Fatigue Factor method (aerobiccapacity.com). Zone 2: Maffetone MAF."), M, H-8);
    doc.text("Page " + page, W-M, H-8, {align:"right"});
  };
  const newPage = () => { footer(); doc.addPage(); page++; y = M; };
  const need = h => { if (y + h > H - 16) newPage(); };

  // Header
  // brand mark (added as an image if the logo has been rasterised, otherwise text only)
  const markW = 12.6, markH = markW * 900/546;
  if(pdfLogo){ try { doc.addImage(pdfLogo, "PNG", M, y - 1, markW, markH); } catch(e){} }
  const tx = M + markW + 5;
  doc.setFont("helvetica","bold"); doc.setFontSize(19); doc.setTextColor(...COL.ink);
  doc.text("@boomwilliams", tx, y+8.5);
  doc.setFont("helvetica","normal"); doc.setFontSize(13); doc.setTextColor(...COL.muted);
  doc.text("HYROX Running Program", tx, y+14.5); y += 23;
  doc.setFont("helvetica","normal"); doc.setFontSize(9.5); doc.setTextColor(...COL.muted);
  const bits = [];
  if (valid(t)) bits.push("6-min test: " + t + " m");
  bits.push("Week 4 retest: " + (valid(r) ? r + " m" : "not entered"));
  if (validAge(age)) bits.push("Age: " + age);
  doc.text(pdfText(bits.join("   |   ")), M, y); y += 7;

  // Zones table
  const colX = [M, M+46, M+46+(CW-46)/2];
  doc.setFillColor(...COL.ink); doc.rect(M, y, CW, 7, "F");
  doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(255,255,255);
  doc.text("Zone", colX[0]+3, y+4.8); doc.text("Weeks 1-4", colX[1]+2, y+4.8); doc.text("Weeks 5-14", colX[2]+2, y+4.8);
  y += 7;
  const zoneRow = (key, label, sub, c1, c2, span) => {
    doc.setFillColor(...COL.soft); doc.rect(M, y, CW, 11, "F");
    doc.setFillColor(...COL[key]); doc.rect(M, y, 1.8, 11, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(10.5); doc.setTextColor(...COL[key]); doc.text(label, colX[0]+4, y+5);
    doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(...COL.muted); doc.text(pdfText(sub), colX[0]+4, y+9);
    doc.setTextColor(...COL.ink);
    const cell = (x, v) => { doc.setFont("helvetica","bold"); doc.setFontSize(11); doc.text(pdfText(v[0]), x+2, y+5);
      if (v[1]) { doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(...COL.muted); doc.text(pdfText(v[1]), x+2, y+9); doc.setTextColor(...COL.ink); } };
    cell(colX[1], c1); if (!span) cell(colX[2], c2);
    y += 11.6;
  };
  zoneRow("hr", "Zone 2 HR", "Zone 2 runs", hr ? [hr.text, "All weeks, stay at or below " + hr.high] : ["Enter age in app", ""], null, true);
  for (const z of ["aer","lt","vo2"]) {
    const v = s => { if (!s) return ["Enter test in app",""]; const p = pace(s[z]); return [p.main + " /km", p.fast + "-" + p.slow + " /km"]; };
    zoneRow(z, ZONES[z].name, ZONES[z].desc, v(s1), valid(r) ? v(s2) : (s1 ? ["After retest", "uses Weeks 1-4 until then"] : v(null)));
  }
  y += 4;

  // Program
  const rightW = 44, leftX = M + 8, textW = CW - 8 - rightW - 4;
  let cur = -1;
  PROGRAM.forEach((s, i) => {
    const sp = s.w <= 4 ? s1 : s2;
    let note = s.note || "";
    if (s.strides) note = `Warm up 5 min + ${s.strides} x 200m strides${sp ? " at " + pace(sp.vo2).main + " /km" : ""}. ` + note;
    doc.setFontSize(8.5); const noteLines = note ? doc.splitTextToSize(pdfText(note), textW) : [];
    const hasRange = s.zone && s.zone !== "hr" && sp;
    const rowH = Math.max(10 + noteLines.length * 3.6, hasRange ? 12.5 : 10);
    const headH = s.w !== cur ? 10 : 0;
    need(headH + rowH);
    if (s.w !== cur) {
      cur = s.w;
      doc.setFillColor(...COL.ink); doc.rect(M, y, CW, 7.5, "F");
      doc.setFont("helvetica","bold"); doc.setFontSize(11); doc.setTextColor(255,255,255);
      doc.text(s.w === 0 ? "Before you start" : `Week ${s.w}  -  ${PHASES[s.w]}`, M+3, y+5.2);
      if (s.w) { doc.setFont("helvetica","normal"); doc.setFontSize(8);
        doc.text(s.w <= 4 ? "Paces from your test" : (valid(r) ? "Paces from your retest" : "Paces from your first test"), W-M-3, y+5.2, {align:"right"}); }
      y += 9.5;
    }
    // tick box
    doc.setDrawColor(...COL.muted); doc.setLineWidth(0.3); doc.rect(M+1, y+1.2, 4, 4);
    // left text
    doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...COL.muted);
    doc.text(pdfText(s.run + "  |  " + s.title + (s.opt ? " (optional)" : "")), leftX, y+2.6);
    doc.setFont("helvetica","bold"); doc.setFontSize(11); doc.setTextColor(...(s.opt ? COL.muted : COL.ink));
    doc.text(pdfText(s.work), leftX, y+7.3);
    if (noteLines.length) { doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(...COL.muted); doc.text(noteLines, leftX, y+11); }
    // right column
    const rx = W - M;
    if (s.zone) {
      const key = s.zone, label = key === "hr" ? "ZONE 2" : ZONES[key].name.toUpperCase();
      doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(...COL[key]); doc.text(label, rx, y+2.6, {align:"right"});
      doc.setFontSize(11); doc.setTextColor(...COL.ink);
      if (key === "hr") { doc.text(hr ? pdfText(hr.text) : "Enter age", rx, y+7.3, {align:"right"}); }
      else if (sp) { const p = pace(sp[key]); doc.text(p.main + " /km", rx, y+7.3, {align:"right"});
        doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...COL.muted); doc.text(p.fast + "-" + p.slow, rx, y+10.8, {align:"right"}); }
      else { doc.text("Enter test", rx, y+7.3, {align:"right"}); }
    }
    y += rowH;
    doc.setDrawColor(...COL.rule); doc.setLineWidth(0.2); doc.line(M, y-1, W-M, y-1);
    y += 1;
  });
  footer();
  return doc;
}

$("pdf").addEventListener("click", async ()=>{
  const msg = $("pdfMsg");
  if (!window.jspdf) { msg.textContent = "Still loading. Check your connection and try again in a moment."; return; }
  if (!valid(parseFloat(state.test))) { msg.textContent = "Enter your 6-min test first so your paces are included."; return; }
  await loadPdfLogo();
  let blob;
  try { blob = buildPDF().output("blob"); } catch(e){ msg.textContent = "Couldn’t create the PDF. Please try again."; return; }
  const name = "boomwilliams-HYROX-Running-Program.pdf";
  const file = new File([blob], name, {type:"application/pdf"});
  if (navigator.canShare && navigator.canShare({files:[file]})) {
    try { await navigator.share({files:[file], title:"@boomwilliams – HYROX Running Program"}); msg.textContent = ""; return; }
    catch(e){ if (e && e.name === "AbortError") { msg.textContent = ""; return; } }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 10000);
  msg.textContent = "PDF saved. Check your downloads.";
});

/* ============================ SYNC PROGRESS ============================
   Ticks and logged km are pushed to the coach's sheet a few seconds after the
   last change, so a burst of edits becomes one save.
*/
let syncTimer = null;
function queueSync(){
  if(!state.unlocked || !state.email) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(syncProgress, 3000);
}
async function syncProgress(){
  if(!state.unlocked || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(state.email)) return;
  const entries = [];
  PROGRAM.forEach((s,i)=>{
    const id = "s"+i, done = !!state.ticks[id], e = state.km[id];
    if(!done && !e) return;
    entries.push({id, week:s.w, run:s.run, session:s.work, km:e?e.km:"", on:e?e.on:"", done});
  });
  if(!entries.length) return;
  try{
    await fetch(SHEET_URL, {method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"},
      body: JSON.stringify({kind:"progress", name:state.name, email:state.email, entries})});
  }catch(e){ /* offline: the next change tries again */ }
}

async function sendRow(distance){
  const res = await fetch(SHEET_URL, {method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"},
    body: JSON.stringify({name:state.name, email:state.email, distance, website:$("website").value})});
  return (await res.json()).status;
}
$("send").addEventListener("click", async ()=>{
  const st = $("sendStatus"); st.className = "status";
  const t = parseFloat(state.test), r = parseFloat(state.retest);
  const say = (msg, ok) => { st.textContent = msg; st.classList.add(ok ? "ok" : "bad"); };
  if(!SHEET_URL) return say("Saving isn’t switched on yet. Your coach will share the live link.", false);
  if(!state.name) return say("Add your name first.", false);
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(state.email)) return say("Enter a valid email.", false);
  if(!valid(t)) return say("Enter your 6-min test distance first.", false);
  if(!$("consent").checked) return say("Tick the box to agree to sharing.", false);
  const dists = [t]; if(valid(r) && r!==t) dists.push(r);
  $("send").disabled = true; st.textContent = "Saving…";
  try{
    const results = [];
    for(const d of dists) results.push(await sendRow(d));
    st.textContent = "";
    if(results.some(x => x==="error" || x==="invalid")) say("Couldn’t save. Check your details and try again.", false);
    else if(results.every(x => x==="duplicate")) say("Already saved. Nothing new to send.", true);
    else say("Saved. Thanks!", true);
    if(!results.some(x => x==="error" || x==="invalid")){
      state.sent = dists.join(" m, ")+" m";
      if(!state.unlocked){ state.unlocked = true; say("Unlocked. Your paces are below.", true); }
      save(state); updateSummaries(); applyLock(); queueSync();
    }
  }catch(e){ st.textContent=""; say("Couldn’t reach the sheet. Check your connection and try again.", false); }
  finally{ $("send").disabled = false; }
});

/* ============================ CALENDAR (.ics) ============================ */
const DAY_NAMES = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];   // index 0 = Monday
const APP_URL = "https://bigboomy.github.io/hyrox-run-program/";
const ZONE_ICON = {hr:"🟩", aer:"🟦", lt:"🟨", vo2:"🟥"};

function nextMonday(){
  const d = new Date(); d.setHours(0,0,0,0);
  const add = (8 - ((d.getDay()+6)%7)) % 7 || 7;  // always the coming Monday
  d.setDate(d.getDate()+add); return d;
}
function toISO(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function parseISO(v){ const [y,m,d] = v.split("-").map(Number); return new Date(y, m-1, d); }
function addDays(d,n){ const x = new Date(d); x.setDate(x.getDate()+n); return x; }
const mondayIdx = d => (d.getDay()+6)%7;

// The chosen days, in the order they occur in a 7-day window starting on `from`.
function datesInWindow(from){
  const out = [];
  for(let i=0;i<7;i++){ const d = addDays(from,i); if(state.days.includes(mondayIdx(d))) out.push(d); }
  return out;
}

function renderDays(){
  $("days").querySelectorAll(".day").forEach(n=>n.remove());
  DAY_NAMES.forEach((n,i)=>{
    const on = state.days.includes(i);
    const lab = document.createElement("label"); lab.className = "day";
    lab.innerHTML = `<input type="checkbox" value="${i}" ${on?"checked":""} ${!on && state.days.length>=3?"disabled":""} aria-label="${n}"><span>${n}</span>`;
    $("days").appendChild(lab);
  });
  // warn if Run 1 and Run 2 fall on consecutive days
  let warn = "";
  if(state.days.length===3 && state.start){
    const w = datesInWindow(parseISO(state.start));
    if(w.length===3 && (w[1]-w[0])/864e5===1) warn = "Heads up: Run 1 (speed) and Run 2 are on back-to-back days. Try to leave a rest day between them if you can.";
  }
  $("dayWarn").textContent = warn;
}

function icsEscape(t){ return String(t).replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\r?\n/g,"\\n"); }
// Fold lines at 75 bytes (RFC 5545) without splitting multi-byte characters.
function fold(line){
  const enc = new TextEncoder(); let out = "", cur = "", bytes = 0;
  for(const ch of line){
    const b = enc.encode(ch).length;
    if(bytes + b > (out ? 74 : 75)){ out += (out ? "\r\n " : "") + cur; cur = ""; bytes = 0; }
    cur += ch; bytes += b;
  }
  return out + (out ? "\r\n " : "") + cur;
}
const ymd = d => toISO(d).replace(/-/g,"");

function buildEvents(fromWeek, toWeek, includeTest){
  const t = parseFloat(state.test), r = parseFloat(state.retest);
  const s1 = valid(t) ? speeds(t) : null;
  const s2 = valid(r) ? speeds(r) : s1;           // no retest: Weeks 5–14 keep first-test paces
  const start = parseISO(state.start);
  const events = [];
  PROGRAM.forEach(s=>{
    if(s.w===0 && !includeTest) return;
    if(s.w!==0 && (s.w<fromWeek || s.w>toWeek)) return;
    const windowStart = addDays(start, (s.w===0 ? -1 : s.w-1)*7);
    const slots = datesInWindow(windowStart);
    const runNo = s.w===0 ? 1 : parseInt(s.run.replace(/\D/g,""),10);
    const date = slots[runNo-1];
    const sp = s.w<=4 ? s1 : s2;
    let title, desc = [];
    const age = Number(state.age), hr = validAge(age) ? zone2(age, state.maf) : null;
    if(s.zone==="hr"){
      title = `${ZONE_ICON.hr} ${s.title} – ${s.work}${hr?" @ "+hr.text:""}`;
      desc.push(hr ? `Zone 2 heart rate: ${hr.text}. Stay at or below ${hr.high} bpm (Maffetone MAF).` : "Enter your age in the app to see your Zone 2 heart rate.");
    } else if(s.zone){
      const p = sp ? pace(sp[s.zone]) : null;
      title = `${ZONE_ICON[s.zone]} ${s.title} – ${s.work}${p?" @ "+p.main+"/km":""}${s.opt?" (optional)":""}`;
      desc.push(p ? `${ZONES[s.zone].name} pace: ${p.main} /km (range ${p.fast}–${p.slow})` : "Enter your 6-min test in the app to see your pace.");
    } else {
      title = `📋 ${s.title} – ${s.work}`;
    }
    let note = s.note||"";
    if(s.strides){ note = `Warm up 5 min + ${s.strides} × 200m strides${sp?" at "+pace(sp.vo2).main+" /km":""}. ` + note; }
    if(note) desc.push(note);
    desc.push(`Week ${s.w===0?"0 (before you start)":s.w}${s.w?" – "+PHASES[s.w]:""}`);
    desc.push("@boomwilliams – open your program: " + APP_URL);
    events.push({uid:`hyrox-w${s.w}-r${runNo}-${ymd(start)}@bigboomy.github.io`, date, title, desc:desc.join("\n")});
  });
  return events;
}

function buildICS(events){
  const now = new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"");
  const lines = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//boomwilliams//HYROX Running Program//EN","CALSCALE:GREGORIAN","METHOD:PUBLISH","X-WR-CALNAME:@boomwilliams – HYROX Running Program"];
  events.forEach(e=>{
    lines.push("BEGIN:VEVENT","UID:"+e.uid,"DTSTAMP:"+now,
      "DTSTART;VALUE=DATE:"+ymd(e.date),"DTEND;VALUE=DATE:"+ymd(addDays(e.date,1)),
      "SUMMARY:"+icsEscape(e.title),"DESCRIPTION:"+icsEscape(e.desc),"URL:"+APP_URL,"TRANSP:TRANSPARENT","END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

function downloadICS(filename, text){
  const blob = new Blob([text], {type:"text/calendar;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 4000);
}

function updateSummaries(){
  $("sendSum").textContent = state.sent ? `✓ Sent: ${state.sent}` : "Not sent yet";
  const d = state.days.length===3 ? state.days.map(i=>DAY_NAMES[i]).join(" · ") : "Choose 3 days";
  const st = state.start ? parseISO(state.start).toLocaleDateString(undefined,{day:"numeric",month:"short"}) : "";
  $("calSum").textContent = state.days.length===3 && st ? `${d}, starts ${st}` : "Choose 3 training days and a start date";
}

function calReady(){
  if(state.days.length!==3){ $("calMsg").textContent = "Choose exactly 3 training days first."; return false; }
  if(!state.start){ $("calMsg").textContent = "Choose your Week 1 start date first."; return false; }
  return true;
}
function updateCalHints(){
  const hasT = valid(parseFloat(state.test)), hasR = valid(parseFloat(state.retest));
  $("cal2").textContent = hasR ? "📅 Add Weeks 5–14 (retest paces)" : "📅 Add Weeks 5–14 (current paces)";
  $("cal2").title = hasR ? "Uses your Week 4 retest" : "No retest entered, so your first test paces are used";
  if(!$("calMsg").dataset.sticky) $("calMsg").textContent = !hasT ? "Tip: enter your 6-min test first so paces are included in your calendar." : "";
}

$("days").addEventListener("change", e=>{
  if(e.target.type!=="checkbox") return;
  const i = +e.target.value;
  state.days = e.target.checked ? [...state.days, i].slice(0,3) : state.days.filter(x=>x!==i);
  state.days.sort((a,b)=>a-b); save(state); renderDays(); updateSummaries();
});
$("startDate").addEventListener("change", e=>{ state.start = e.target.value; save(state); renderDays(); updateSummaries(); });
$("cal1").addEventListener("click", ()=>{
  if(!calReady()) return;
  downloadICS("hyrox-test-and-weeks-1-4.ics", buildICS(buildEvents(1,4,true)));
  $("calMsg").dataset.sticky = "1";
  $("calMsg").textContent = "Added your test and Weeks 1–4. After your Week 4 retest, enter it above and add Weeks 5–14.";
});
$("cal2").addEventListener("click", ()=>{
  if(!calReady()) return;
  const hasR = valid(parseFloat(state.retest));
  downloadICS("hyrox-weeks-5-14.ics", buildICS(buildEvents(5,14,false)));
  $("calMsg").dataset.sticky = "1";
  $("calMsg").textContent = hasR ? "Added Weeks 5–14 with your retest paces." : "Added Weeks 5–14 using your first test paces (no retest entered).";
});
if(!state.start){ state.start = toISO(nextMonday()); save(state); }
$("startDate").value = state.start;
renderDays();

render();
updateCalHints();
updateSummaries();
applyLock();
updateStrip();

/* ============================ ADD TO HOME SCREEN ============================ */
(function(){ try {
  if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(()=>{});
  const ua = navigator.userAgent;
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform==="MacIntel" && navigator.maxTouchPoints>1);
  const inApp = /FBAN|FBAV|FB_IAB|Instagram|Messenger|Line\//i.test(ua);
  const box = $("install"), btn = $("installBtn"), help = $("ihelp");
  let deferred = null;
  if(standalone) return;                                  // already installed: keep button hidden
  const showHelp = html => { help.innerHTML = html; help.hidden = false; };
  if(inApp){
    box.hidden = false;
    btn.addEventListener("click", ()=> showHelp(`Open this page in ${isIOS?"Safari":"Chrome"} first: tap <b>⋯</b> (top right) then <b>Open in ${isIOS?"browser":"Chrome"}</b>. Then tap this button again.`));
    return;
  }
  if(isIOS){
    box.hidden = false;
    btn.addEventListener("click", ()=> showHelp(`<b>Add to your iPhone Home Screen:</b><ol><li>Tap the <b>Share</b> button <b>⬆️</b> (bottom of Safari)</li><li>Tap <b>Add to Home Screen</b>, then <b>Add</b></li></ol><small>Do this before entering your details. Your iPhone keeps the app’s data separate from Safari.</small>`));
  }
  window.addEventListener("beforeinstallprompt", e=>{
    e.preventDefault(); deferred = e; box.hidden = false;
  });
  btn.addEventListener("click", async ()=>{
    if(!deferred) return;
    deferred.prompt();
    const choice = await deferred.userChoice.catch(()=>null);
    deferred = null;
    if(choice && choice.outcome==="accepted") box.hidden = true;
  });
  window.addEventListener("appinstalled", ()=>{ box.hidden = true; });
} catch(e){ /* install button is optional */ } })();
