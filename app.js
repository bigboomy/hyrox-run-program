/* Paste your Google Apps Script web app URL here (ends in /exec). */
const SHEET_URL = "https://script.google.com/macros/s/AKfycbzeVEf0PtRQXtfWDlQWQb_6Rem_J4Uk263Ut2Lhbed3_oFMnt8Js_a8pG_-zvSPTHKlnQ/exec";

/* ============================================================
   PROGRAM CONTENT — edit sessions here. Calculation code below.
   zone: "aer" | "lt" | "vo2" (pace) | "hr" (Zone 2 heart rate) | null (tests)
   strides: number of 200m warm-up strides at VO2max pace (implies a 5 min warm-up)
   warm: warm-up minutes. rest: rest between reps, e.g. "1 min", "60–90 sec". walk: true if the rest is a walk.
   roundRest: rest between rounds. note: anything else worth saying.
   Three programs. retest = the last week that uses the FIRST test's paces;
   every week after it uses the retest paces.
   ============================================================ */
const TEST_NOTE   = "Warm-up: 10-minute easy Zone 2 jog. The test: 6-minute hard effort. Log it: record your total distance for the 6-minute portion, so your Aerobic, Threshold and VO2max zones can be calculated.";
const RETEST_NOTE = "Same as the first test: 10-minute easy Zone 2 warm-up, then 6 minutes hard. Enter the distance above — it updates your paces for the rest of the program.";
const TEST_SESSION   = {w:0, run:"Test", title:"6-min test", zone:null, work:"6-minute max distance test", note:TEST_NOTE, test:true};
const RETEST_SESSION = {run:"Run 3", title:"Retest", zone:null, work:"6-minute max distance retest", note:RETEST_NOTE, test:true};
const TWO_RUN_NOTE = "From here: 2 runs a week. Add compromised running and erg work, and prioritise leg recovery.";
const RACE_PACE_NOTE = "Feel the pace and check your watch as little as possible.";

const PROGRAMS = {
 "14": {
  key:"14", label:"14 weeks", weeks:14, retest:4,
  phases:{0:"Pre-program",1:"Base",2:"Base",3:"Base",4:"Base",5:"Base",6:"Deload",7:"Build",8:"Build",9:"Build",10:"Build",11:"Build",12:"Race specific",13:"Race specific",14:"Race week"},
  sessions:[
   TEST_SESSION,
   {w:1, run:"Run 1", title:"Speed", zone:"vo2", work:"8 × 400m", warm:5, rest:"90 sec"},
   {w:1, run:"Run 2", title:"Zone 2", zone:"hr", work:"30 min continuous"},
   {w:1, run:"Run 3", title:"Distance", zone:"aer", work:"4km steady", opt:true},
   {w:2, run:"Run 1", title:"Speed", zone:"vo2", work:"10 × 400m", warm:5, rest:"60–90 sec"},
   {w:2, run:"Run 2", title:"Zone 2", zone:"hr", work:"30–40 min continuous"},
   {w:2, run:"Run 3", title:"Distance", zone:"aer", work:"4km steady", opt:true},
   {w:3, run:"Run 1", title:"Speed", zone:"vo2", work:"800, 600, 400, 200 ×2 rounds", warm:5, rest:"1 min", roundRest:"3 min"},
   {w:3, run:"Run 2", title:"Zone 2", zone:"hr", work:"30–35 min continuous"},
   {w:3, run:"Run 3", title:"Split distance", zone:"aer", work:"3 × 2km", rest:"1 min", walk:true, opt:true},
   {w:4, run:"Run 1", title:"Speed", zone:"vo2", work:"2×800, 2×600, 2×400", warm:5, rest:"1 min"},
   {w:4, run:"Run 2", title:"Zone 2", zone:"hr", work:"35–45 min continuous"},
   Object.assign({w:4}, RETEST_SESSION),
   {w:5, run:"Run 1", title:"Speed", zone:"vo2", work:"1000, 800, 600, 400 ×2 rounds", warm:5, rest:"1 min", roundRest:"3 min"},
   {w:5, run:"Run 2", title:"Zone 2", zone:"hr", work:"40–50 min continuous"},
   {w:5, run:"Run 3", title:"Distance", zone:"aer", work:"6km steady", opt:true},
   {w:6, run:"Run 1", title:"Intervals", zone:"vo2", work:"8 × 400m", rest:"1 min"},
   {w:6, run:"Run 2", title:"Zone 2", zone:"hr", work:"30 min continuous"},
   {w:6, run:"Run 3", title:"Distance", zone:"aer", work:"4 × 1km", rest:"90 sec", walk:true},
   {w:7, run:"Run 1", title:"Speed", zone:"vo2", work:"2×1000, 2×800, 2×600, 2×400", strides:3, rest:"1 min"},
   {w:7, run:"Run 2", title:"Threshold", zone:"lt", work:"30–40 min continuous"},
   {w:8, run:"Run 1", title:"Speed", zone:"vo2", work:"1200, 800, 400 ×2 rounds", strides:3, rest:"90 sec", roundRest:"3 min"},
   {w:8, run:"Run 2", title:"Threshold", zone:"lt", work:"35–40 min continuous"},
   {w:8, run:"Run 3", title:"Distance", zone:"aer", work:"8km steady", opt:true},
   {w:9, run:"Run 1", title:"Speed", zone:"vo2", work:"2×1200, 2×1000, 2×800", strides:3, rest:"1 min"},
   {w:9, run:"Run 2", title:"Threshold", zone:"lt", work:"40–45 min continuous"},
   {w:9, run:"Run 3", title:"Distance", zone:"aer", work:"10km steady", opt:true},
   {w:10, run:"Run 1", title:"Speed", zone:"vo2", work:"1500, 1000, 800, 400 ×2 rounds", strides:2, rest:"1 min", roundRest:"3 min"},
   {w:10, run:"Run 2", title:"Threshold", zone:"lt", work:"45–50 min continuous", note:TWO_RUN_NOTE},
   {w:11, run:"Run 1", title:"Speed", zone:"vo2", work:"2×1500, 2×1000, 2×800, 2×400", strides:3, rest:"1 min"},
   {w:11, run:"Run 2", title:"Threshold", zone:"lt", work:"50–60 min continuous"},
   {w:12, run:"Run 1", title:"Race pace", zone:"lt", work:"8 × 1km", strides:2, rest:"1 min", note:RACE_PACE_NOTE},
   {w:12, run:"Run 2", title:"Threshold", zone:"lt", work:"60 min continuous"},
   {w:13, run:"Run 1", title:"Race pace", zone:"lt", work:"8 × 1200m", strides:2, rest:"1 min", note:RACE_PACE_NOTE},
   {w:13, run:"Run 2", title:"Threshold", zone:"lt", work:"60 min continuous"},
   {w:14, run:"Run 1", title:"Steady intervals", zone:"aer", work:"8 × 400m", strides:2, rest:"90 sec"},
   {w:14, run:"Run 2", title:"Recovery", zone:"hr", work:"20–30 min continuous"}
  ]
 },
 "12": {
  key:"12", label:"12 weeks", weeks:12, retest:4,
  phases:{0:"Pre-program",1:"Base",2:"Base",3:"Base",4:"Base",5:"Base",6:"Deload",7:"Build",8:"Build",9:"Build",10:"Build",11:"Race specific",12:"Race week"},
  sessions:[
   TEST_SESSION,
   {w:1, run:"Run 1", title:"Speed", zone:"vo2", work:"8 × 400m", warm:5, rest:"90 sec"},
   {w:1, run:"Run 2", title:"Zone 2", zone:"hr", work:"30 min continuous"},
   {w:1, run:"Run 3", title:"Distance", zone:"aer", work:"4km steady", opt:true},
   {w:2, run:"Run 1", title:"Speed", zone:"vo2", work:"800, 600, 400, 200 ×2 rounds", warm:5, rest:"1 min", roundRest:"3 min"},
   {w:2, run:"Run 2", title:"Zone 2", zone:"hr", work:"30–40 min continuous"},
   {w:2, run:"Run 3", title:"Steady", zone:"aer", work:"6km steady", opt:true},
   {w:3, run:"Run 1", title:"Speed", zone:"vo2", work:"2×800, 2×600, 2×400", warm:5, rest:"1 min"},
   {w:3, run:"Run 2", title:"Zone 2", zone:"hr", work:"40–50 min continuous"},
   {w:3, run:"Run 3", title:"Distance", zone:"aer", work:"5km steady", opt:true},
   {w:4, run:"Run 1", title:"Speed", zone:"vo2", work:"1000, 800, 600, 400 ×2 rounds", warm:5, rest:"1 min", roundRest:"3 min"},
   {w:4, run:"Run 2", title:"Zone 2", zone:"hr", work:"50–60 min continuous"},
   Object.assign({w:4}, RETEST_SESSION),
   {w:5, run:"Run 1", title:"Speed", zone:"vo2", work:"2×1000, 2×800, 2×600, 2×400", strides:3, rest:"1 min", note:"Run these 10 sec under 5km pace (8/10 effort)."},
   {w:5, run:"Run 2", title:"Threshold", zone:"lt", work:"30–40 min continuous"},
   {w:5, run:"Run 3", title:"Steady", zone:"aer", work:"6km steady", opt:true},
   {w:6, run:"Run 1", title:"Intervals", zone:"vo2", work:"8 × 400m", rest:"1 min"},
   {w:6, run:"Run 2", title:"Zone 2", zone:"hr", work:"30 min continuous"},
   {w:6, run:"Run 3", title:"Distance", zone:"aer", work:"4 × 1km", rest:"90 sec", walk:true},
   {w:7, run:"Run 1", title:"Speed", zone:"vo2", work:"1200, 800, 400 ×2 rounds", strides:3, rest:"90 sec", roundRest:"3 min"},
   {w:7, run:"Run 2", title:"Threshold", zone:"lt", work:"40–50 min continuous"},
   {w:7, run:"Run 3", title:"Distance", zone:"aer", work:"8km steady", opt:true},
   {w:8, run:"Run 1", title:"Speed", zone:"vo2", work:"2×1200, 2×1000, 2×800", strides:3, rest:"1 min"},
   {w:8, run:"Run 2", title:"Threshold", zone:"lt", work:"50–60 min continuous"},
   {w:8, run:"Run 3", title:"Distance", zone:"aer", work:"10km steady", opt:true},
   {w:9, run:"Run 1", title:"Speed", zone:"vo2", work:"1500, 1000, 800, 400 ×2 rounds", strides:2, rest:"1 min", roundRest:"3 min"},
   {w:9, run:"Run 2", title:"Threshold", zone:"lt", work:"50–60 min continuous", note:TWO_RUN_NOTE},
   {w:10, run:"Run 1", title:"Speed", zone:"vo2", work:"2×1500, 2×1000, 2×800, 2×400", strides:3, rest:"1 min"},
   {w:10, run:"Run 2", title:"Threshold", zone:"lt", work:"60–70 min continuous"},
   {w:11, run:"Run 1", title:"Race pace", zone:"lt", work:"8 × 1km", strides:2, rest:"1 min", note:RACE_PACE_NOTE},
   {w:11, run:"Run 2", title:"Threshold", zone:"lt", work:"60 min continuous"},
   {w:12, run:"Run 1", title:"Steady intervals", zone:"aer", work:"8 × 400m", strides:2, rest:"90 sec"},
   {w:12, run:"Run 2", title:"Recovery", zone:"hr", work:"20–30 min continuous"}
  ]
 },
 "8": {
  key:"8", label:"8 weeks", weeks:8, retest:5,
  phases:{0:"Pre-program",1:"Base",2:"Base",3:"Base",4:"Build",5:"Build",6:"Build",7:"Race specific",8:"Race week"},
  sessions:[
   TEST_SESSION,
   {w:1, run:"Run 1", title:"Speed", zone:"vo2", work:"800, 600, 400, 200 ×2 rounds", warm:5, rest:"1 min", roundRest:"3 min"},
   {w:1, run:"Run 2", title:"Zone 2", zone:"hr", work:"30–40 min continuous"},
   {w:1, run:"Run 3", title:"Steady", zone:"aer", work:"4km steady", opt:true},
   {w:2, run:"Run 1", title:"Speed", zone:"vo2", work:"2×800, 2×600, 2×400", warm:5, rest:"1 min"},
   {w:2, run:"Run 2", title:"Zone 2", zone:"hr", work:"40–50 min continuous"},
   {w:2, run:"Run 3", title:"Distance", zone:"aer", work:"5km steady", opt:true},
   {w:3, run:"Run 1", title:"Speed", zone:"vo2", work:"1000, 800, 600, 400 ×2 rounds", warm:5, rest:"1 min", roundRest:"3 min"},
   {w:3, run:"Run 2", title:"Zone 2", zone:"hr", work:"50–60 min continuous"},
   {w:3, run:"Run 3", title:"Distance", zone:"aer", work:"6km steady", opt:true},
   {w:4, run:"Run 1", title:"Speed", zone:"vo2", work:"2×1000, 2×800, 2×600, 2×400", strides:3, rest:"1 min", note:"Run these 10 sec under 5km pace (8/10 effort)."},
   {w:4, run:"Run 2", title:"Threshold", zone:"lt", work:"30–40 min continuous"},
   {w:4, run:"Run 3", title:"Steady", zone:"aer", work:"8km steady", opt:true},
   {w:5, run:"Run 1", title:"Speed", zone:"vo2", work:"1200, 800, 400 ×2 rounds", strides:3, rest:"90 sec", roundRest:"3 min"},
   {w:5, run:"Run 2", title:"Threshold", zone:"lt", work:"30–40 min continuous"},
   Object.assign({w:5}, RETEST_SESSION),
   {w:6, run:"Run 1", title:"Speed", zone:"vo2", work:"2×1200, 2×1000, 2×800", strides:3, rest:"1 min"},
   {w:6, run:"Run 2", title:"Threshold", zone:"lt", work:"40–50 min continuous", note:TWO_RUN_NOTE},
   {w:7, run:"Run 1", title:"Race pace", zone:"lt", work:"8 × 1km", strides:2, rest:"1 min", note:RACE_PACE_NOTE},
   {w:7, run:"Run 2", title:"Threshold", zone:"lt", work:"50–60 min continuous"},
   {w:8, run:"Run 1", title:"Steady intervals", zone:"aer", work:"8 × 400m", strides:2, rest:"90 sec"},
   {w:8, run:"Run 2", title:"Recovery", zone:"hr", work:"20–30 min continuous"}
  ]
 }
};
const PROG_KEYS = ["14","12","8"];

/* ============================ CUSTOM PLAN (8–16 weeks) ============================
   Built from rules, not typed out. Three inputs:
   - race date  -> N weeks (8–16), counted back from race week
   - background -> where the speed ladder starts (n new, r regular, e experienced)
   - N          -> how high the ladder climbs before race-pace weeks
   Rules (agreed Oct 2026):
   - Last week is race week. The 1 (or 2 when N >= 14) weeks before it are race pace.
   - The last round(N x 0.35) weeks are two runs a week.
   - Deload at week 6 when N >= 10, and a second one the week before race pace when N >= 14.
   - Retest at the end of week 4. A second retest in the second deload week (N >= 14),
     so race-pace weeks use fresh paces.
   - One ladder rung per loaded week. Longer plans add rungs at the bottom, never skip.
   - Run 2: Zone 2 through the base, then Threshold. In the two-run block it alternates
     Threshold and Zone 2, and race-pace weeks pair with Zone 2 (never two Threshold-pace runs).
   - Threshold over 40 min is split into blocks.
   - Strides after every Zone 2 run. Warm-up and cool-down on every hard session.
   - Half race simulation replaces Run 2 once, 3–4 weeks out (N >= 10).
   - New runners: no Run 3 (except retests), run/walk on the first two Zone 2 runs.
   ================================================================================= */
const LEVELS = {n:"New to running", r:"Regular runner", e:"Experienced"};
const LEVEL_START = {n:0, r:1, e:3};
const LADDER = [
  {work:"6 × 400m", rest:"90 sec"},
  {work:"8 × 400m", rest:"90 sec"},
  {work:"10 × 400m", rest:"60–90 sec"},
  {work:"800, 600, 400, 200 ×2 rounds", rest:"1 min", roundRest:"3 min"},
  {work:"2×800, 2×600, 2×400", rest:"1 min"},
  {work:"1000, 800, 600, 400 ×2 rounds", rest:"1 min", roundRest:"3 min"},
  {work:"2×1000, 2×800, 2×600, 2×400", rest:"1 min", note:"Run these 10 sec under 5km pace (8/10 effort)."},
  {work:"1200, 800, 400 ×2 rounds", rest:"90 sec", roundRest:"3 min"},
  {work:"2×1200, 2×1000, 2×800", rest:"1 min"},
  {work:"1500, 1000, 800, 400 ×2 rounds", rest:"1 min", roundRest:"3 min"},
  {work:"2×1500, 2×1000, 2×800, 2×400", rest:"1 min"}
];
const Z2_RAMP = ["30 min continuous","30–40 min continuous","40–50 min continuous","50–60 min continuous","50–60 min continuous"];
const TH_RAMP = [{work:"30–40 min continuous"},{work:"40 min continuous"},{work:"2 × 20 min", rest:"2 min easy jog"},
  {work:"3 × 15 min", rest:"2 min easy jog"},{work:"2 × 25 min", rest:"2 min easy jog"},{work:"3 × 20 min", rest:"2 min easy jog"}];
const DIST_RAMP = ["4km steady","4km steady","5km steady","6km steady","6km steady","8km steady","8km steady","10km steady","10km steady"];
// Strides after Zone 2 runs are part of the session, so they sit in the main line ("30 min continuous + 6 × 20 sec strides").
// The how-to opens from a "How to do strides" dropdown in the app, and appears as a short line in the PDF and calendar.
const STRIDES_HOW = ["Each stride is about 20 sec, roughly 80–100m.",
  "Build up over the first few seconds to fast but relaxed: about 80–90% effort, around your 1500m race pace. Not a sprint.",
  "Stay tall, quick feet, relaxed shoulders and hands.",
  "Walk back to the start before the next one, so every stride is done fresh.",
  "Do them after the Zone 2 run, so your heart rate stays in Zone 2 for the run itself."];
const STRIDES_SHORT = "Strides: build to fast but relaxed (80–90% effort, about 1500m race pace), walk back between each.";
const RUNWALK_NOTE = "New to this? Run 4 min, walk 1 min, and build towards 30 min continuous.";
const COMPROMISED_NOTE = "In the gym? Add one HYROX station between reps to practise running on tired legs.";
const HALFSIM_NOTE = "Run each 1km at race pace, then go straight into a station at race weight. Rotate SkiErg, sled push, row and wall balls.";
const EARLY_END_NOTE = "Your race is still a few weeks away, so do a 6-minute retest on the day this plan would have been race day. Then build a new plan: tap Custom, keep your race date and tap Rebuild. Use this result as your new 6-min test.";
const RETEST2_NOTE = "Same as before: 10-minute easy warm-up, then 6 minutes hard. Enter the distance above. It sets your paces for the race-pace weeks.";

function customLayout(N){
  const k = N >= 14 ? 2 : 1;                       // race-pace weeks
  const D1 = N >= 10 ? 6 : 0, D2 = N >= 14 ? N - k - 1 : 0;
  const T = Math.round(N * 0.35);                  // two-run weeks at the end
  return {k, D1, D2, twoFrom: N - T + 1, R1: 4, R2: D2,
          HS: N >= 10 ? (N >= 14 ? N - 4 : N - 3) : 0,
          baseTo: N >= 10 ? 5 : N - 5};
}
function buildCustom(N, lv, early){
  const L = customLayout(N);
  const rpFrom = N - L.k;
  const loaded = [];
  for(let w=1; w<rpFrom; w++) if(w !== L.D1 && w !== L.D2) loaded.push(w);
  const start = Math.max(0, Math.min(LEVEL_START[lv] ?? 1, LADDER.length - loaded.length));
  const phases = {0:"Pre-program"};
  const S = [TEST_SESSION];
  let li = start, z2 = 0, th = 0, d3 = 0, alt = 0;
  const nStr = lv === "n" ? 4 : 6;
  const z2Run = (w, work) => ({w, run:"Run 2", title:"Zone 2", zone:"hr", work: `${work} + ${nStr} × 20 sec strides`, stridesAfter:nStr});
  const thRun = w => { const t = TH_RAMP[Math.min(th++, TH_RAMP.length-1)]; return Object.assign({w, run:"Run 2", title:"Threshold", zone:"lt", warm:10, cool:5}, t); };
  for(let w=1; w<=N; w++){
    const two = w >= L.twoFrom;
    if(w === N){
      phases[w] = early ? "Retest week" : "Race week";
      S.push({w, run:"Run 1", title:"Steady intervals", zone:"aer", work:"8 × 400m", strides:2, rest:"90 sec"});
      S.push({w, run:"Run 2", title:"Recovery", zone:"hr", work:"20–30 min continuous"});
      // Plan finishes before the race: the day that would have been race day is a retest instead.
      if(early) S.push({w, run:"Run 3", title:"Retest", zone:null, work:"6-minute max distance retest", test:true, note:EARLY_END_NOTE});
      continue;
    }
    if(w >= rpFrom){
      phases[w] = "Race specific";
      const first = w === rpFrom;
      S.push({w, run:"Run 1", title:"Race pace", zone:"lt", work: first ? "8 × 1km" : "8 × 1200m", strides:2, rest:"1 min", cool:5, racePace:true,
              note: RACE_PACE_NOTE + " " + COMPROMISED_NOTE});
      S.push(Object.assign(z2Run(w, "40–50 min continuous"), w === L.twoFrom ? {note: TWO_RUN_NOTE} : {}));
      continue;
    }
    if(w === L.D1 || w === L.D2){
      phases[w] = "Deload";
      S.push({w, run:"Run 1", title:"Intervals", zone:"vo2", work:"8 × 400m", warm:5, rest:"1 min"});
      S.push(z2Run(w, "30 min continuous"));
      if(w === L.R2) S.push(Object.assign({w}, RETEST_SESSION, {note:RETEST2_NOTE, retest2:true}));
      else if(lv !== "n") S.push({w, run:"Run 3", title:"Distance", zone:"aer", work:"4 × 1km", rest:"90 sec", walk:true});
      continue;
    }
    // loaded week
    phases[w] = w <= L.baseTo ? "Base" : "Build";
    const r = LADDER[li++];
    S.push(Object.assign({w, run:"Run 1", title:"Speed", zone:"vo2", cool:5}, li-1 <= 5 ? {warm:5} : {strides:3}, r));
    let run2;
    if(w === L.HS) run2 = {w, run:"Run 2", title:"Half sim", zone:"lt", work:"4 × (1km run + 1 station)", warm:10, cool:5, note:HALFSIM_NOTE};
    else if(two) run2 = (alt++ % 2 === 0) ? thRun(w) : z2Run(w, "40–50 min continuous");
    else if(w <= L.baseTo){
      // New runners get two run/walk weeks first, then the same ramp from the bottom.
      const ramp = lv === "n" ? ["30 min run/walk", "30 min run/walk"].concat(Z2_RAMP) : Z2_RAMP;
      run2 = z2Run(w, ramp[Math.min(z2++, ramp.length-1)]);
      if(/run\/walk/.test(run2.work)) run2.note = RUNWALK_NOTE;
    }
    else run2 = thRun(w);
    if(w === L.twoFrom) run2.note = ((run2.note ? run2.note + " " : "") + TWO_RUN_NOTE);
    S.push(run2);
    if(w === L.R1) S.push(Object.assign({w}, RETEST_SESSION));
    else if(!two && lv !== "n") S.push({w, run:"Run 3", title:"Distance", zone:"aer", work: DIST_RAMP[Math.min(d3++, DIST_RAMP.length-1)]});
  }
  return {key:`c${N}${lv}${early ? "x" : ""}`, label:"Custom", custom:true, early:!!early, weeks:N, level:lv, retest:L.R1, retest2:L.R2, phases, sessions:S};
}
// "c12r" -> registers and returns the generated program (or null if the key isn't a valid custom key).
function ensureProgram(key){
  if(PROGRAMS[key]) return PROGRAMS[key];
  const m = /^c(\d{1,2})([nre])(x?)$/.exec(String(key||""));
  if(!m || +m[1] < 8 || +m[1] > 16) return null;
  return (PROGRAMS[key] = buildCustom(+m[1], m[2], m[3] === "x"));
}
let PROG = PROGRAMS["14"], PROGRAM = PROG.sessions, PHASES = PROG.phases;

// Coaches shown in the picker. Add an entry here and it appears in the app.
const COACHES = [
  {name: "Mitch Williams", handle: "@boomwilliams"},
  {name: "Scott Wilson",   handle: "@scotty_lev10"}
];
const DEFAULT_TAG = "@boomwilliams";   // used on images when no coach is chosen

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
let state = Object.assign({name:"",age:"",maf:"0",sent:"",email:"",coach:"",test:"",retest:"",retest2:"",restHr:"",peakHr:"",prog:"14",ticks:{},km:{},days:[],start:"",store:{},custom:{race:"",level:"r",start:"",n:0}}, load());
if(!ensureProgram(state.prog)) state.prog = "14";
if(!state.custom) state.custom = {race:"",level:"r",start:"",n:0};
if(!state.store) state.store = {};
PROG = PROGRAMS[state.prog]; PROGRAM = PROG.sessions; PHASES = PROG.phases;

/* Switching program parks the current ticks/km under the old key and restores
   whatever was saved for the new one, so a switch never destroys history. */
/* Once an athlete has ticked something in Week 1 they are into the routine, so the
   details and run-speeds panels start folded. Only applied on load and program switch,
   never while they are using the page. */
function applyDefaultFolds(){
  const started = PROGRAM.some((s,i)=> s.w===1 && state.ticks["s"+i]);
  $("speedBox").open = !started;
  $("youBox").open = !started || !state.unlocked;
}
function setProgram(key){
  if(!ensureProgram(key) || key === state.prog) return;
  state.store[state.prog] = {ticks: state.ticks, km: state.km};
  const next = state.store[key] || {ticks:{}, km:{}};
  state.prog = key;
  state.ticks = next.ticks || {};
  state.km = next.km || {};
  PROG = PROGRAMS[key]; PROGRAM = PROG.sessions; PHASES = PROG.phases;
  save(state);
  renderProgPick(); render(); updateStrip(); updateCalHints(); updateSummaries(); applyDefaultFolds(); queueSync();
}
function renderProgPick(){
  const box = $("progPick"); if(!box) return;
  const isC = !!PROG.custom, showC = customOpen;
  box.innerHTML = PROG_KEYS.map(k => `<button type="button" class="pg${k===state.prog?" on":""}" data-prog="${k}" aria-pressed="${k===state.prog}">${PROGRAMS[k].label}</button>`).join("")
    + `<button type="button" class="pg${isC?" on":""}" data-prog="custom" aria-pressed="${isC}" aria-expanded="${showC}" aria-controls="customBox"><span>Custom <span class="pgchev">${showC ? "\u25b4" : "\u25be"}</span></span>${isC ? `<small style="font-size:.8em;font-weight:600">${PROG.weeks} wk</small>` : ""}</button>`;
  if($("customBox")) $("customBox").hidden = !showC;
  renderCustomBox();
  const bl = testBlocks();
  const head = $("laneHead");
  if(head){ head.classList.toggle("c3", bl.length === 3); head.innerHTML = `<span>Zone</span>` + bl.map(b => `<span>${bl.length === 3 ? "Wks" : "Weeks"} ${b.from}\u2013${b.to}</span>`).join(""); }
  if($("lanes")) $("lanes").classList.toggle("c3", bl.length === 3);
  if($("cal1")) $("cal1").textContent = `📅 Add test + Weeks 1–${PROG.retest}`;
  if($("retestLbl")) $("retestLbl").textContent = `Week ${PROG.retest} retest (metres)`;
  if($("retest")) $("retest").placeholder = `After Week ${PROG.retest}`;
  if($("retest2Wrap")) $("retest2Wrap").hidden = !PROG.retest2;
  if(PROG.retest2){ $("retest2Lbl").textContent = `Week ${PROG.retest2} retest (metres)`; $("retest2").placeholder = `After Week ${PROG.retest2}`; }
}
/* ============================ HEART RATE RECOVERY (optional) ============================
   Go HR = resting + 70% of (peak - resting). On speed runs the athlete rests at
   least HR_FLOOR sec, starts the next rep once heart rate is at or below the go HR,
   and starts at the cap regardless. Nothing shows unless both numbers are valid.
   e.g. resting 60, peak 190 -> 60 + 0.7 * 130 = 151 bpm
*/
const HR_PCT = 0.70, HR_FLOOR = 60;
function hrInputs(){
  const r = Number(state.restHr), p = Number(state.peakHr);
  const hasR = state.restHr !== "", hasP = state.peakHr !== "";
  const okR = hasR && Number.isFinite(r) && r >= 30 && r <= 100;
  const okP = hasP && Number.isFinite(p) && p >= 120 && p <= 220;
  const okGap = okR && okP && p - r >= 40;
  return {r, p, hasR, hasP, okR, okP, okGap};
}
function goNumber(){
  const x = hrInputs();
  return x.okGap ? Math.round(x.r + HR_PCT * (x.p - x.r)) : null;
}
// Longest rest allowed on a speed session: the written rest + 30 sec.
// Written as 60 or 60-90 sec -> 90. Written as 90 sec -> 120. Other sessions stay timed (null).
function restCap(s){
  if(s.zone !== "vo2" || s.title !== "Speed" || !s.rest) return null;
  return s.rest === "90 sec" ? 120 : 90;
}
// Warm-up, rest and note for a session. The Rest text is the timed rest from the program,
// or the heart rate version when the athlete has a go HR and the session is a speed run.
// Display name for a run: "Run 3.1" = week 3, run 1. Stored data keeps the plain "Run 1".
function runLabel(s){ const n = parseInt(String(s.run).replace(/\D/g,""),10); return s.w>0 && n ? `Run ${s.w}.${n}` : s.run; }
function sessionParts(s, sp){
  const cap = restCap(s), go = cap ? goNumber() : null;
  let warm = "";
  if(s.strides) warm = `5 min + ${s.strides} \u00d7 200m strides${sp ? " at " + pace(sp.vo2).main + " /km" : ""}`;
  else if(s.warm) warm = `${s.warm} min`;
  const bits = [];
  if(s.rest) bits.push(go ? `${HR_FLOOR}\u2013${cap} sec between reps, start once you\u2019re at or below your go HR`
                          : `${s.rest}${s.walk ? " walk" : ""} between reps`);
  const round = s.roundRest ? `${s.roundRest} rest between rounds` : "";
  const cool = s.cool ? `${s.cool} min easy` : "";
  let note = s.note || "";
  if(s.racePace && sp){ const p = pace(sp.lt); note += ` Race target: ${p.main} /km for each of your 8 race kms.`; }
  return {warm, rest: bits.join(""), round, cool, strides: s.stridesAfter ? STRIDES_SHORT : "", note: note.trim(), go};
}
// The same thing as one line of text, for the PDF and calendar.
function sessionFlat(p){
  return [p.warm && `Warm-up: ${p.warm}.`, p.cool && `Cool-down: ${p.cool}.`, p.strides, p.rest && `Rest: ${p.go ? p.rest.replace("your go HR", p.go + " bpm") : p.rest}.`, p.round && `Rounds: ${p.round}.`, p.note].filter(Boolean).join(" ");
}
function renderHr(){
  const x = hrInputs(), go = goNumber();
  $("restHrErr").textContent = x.hasR && !x.okR ? "Enter a resting heart rate between 30 and 100." : "";
  $("peakHrErr").textContent = x.hasP && !x.okP ? "Enter a peak heart rate between 120 and 220."
    : (x.okR && x.okP && !x.okGap ? "Check these numbers. Your peak should be well above your resting." : "");
  $("hrCur").textContent = go ? `Go at ${go} bpm or below on speed runs` : "Not set. Use your heart rate to time the rest on speed runs.";
  $("hrOut").innerHTML = go
    ? `<div class="hrk">How it\u2019s worked out</div>
       <div class="hrw">${x.r} + 70% of (${x.p} \u2212 ${x.r}) = ${go}</div>
       <p>Resting, plus 70% of the gap between resting and peak.</p>
       <p><b>On speed runs:</b> rest at least ${HR_FLOOR} sec, then start your next rep when you drop to ${go} or below. At the max rest shown on the session, go regardless. Hit the max twice in a row? Slow the pace or call it a day.</p>`
    : `<p class="hrempty">${x.hasR || x.hasP ? "Add both numbers to see your go HR." : "Leave these blank to keep timed rests."}</p>`;
}

// Existing athletes (anyone who already had a test entered before the lock existed) stay unlocked.
if(state.unlocked === undefined) state.unlocked = !!state.test;

function renderCoaches(){
  const box = $("coachPick");
  box.innerHTML = COACHES.map(c => `<label class="coach"><input type="radio" name="coach" value="${c.handle}" ${state.coach===c.handle?"checked":""}><span>${c.name} <em>${c.handle}</em></span></label>`).join("")
    + `<button class="btn ghost coachclear" id="coachClear" type="button" ${state.coach?"":"hidden"}>Clear</button>`;
}

function applyLock(){
  const locked = !state.unlocked;
  document.body.classList.toggle("locked", locked);
  $("sendTitle").textContent = locked ? "🔓 Unlock your program" : "📤 Send results to your coach";
  $("send").textContent = locked ? "Unlock my program" : "Save my results";
  $("sendBox").open = locked;
}

/* ============================ TEST BLOCKS ============================
   Each block of weeks takes its paces from one test. A block whose test isn't
   entered yet uses the latest earlier test that is. */
function testBlocks(){
  const b = [{from:1, to:PROG.retest, field:"test", label:"your test"}];
  if(PROG.retest2){
    b.push({from:PROG.retest+1, to:PROG.retest2, field:"retest", label:`your Week ${PROG.retest} retest`});
    b.push({from:PROG.retest2+1, to:PROG.weeks, field:"retest2", label:`your Week ${PROG.retest2} retest`});
  } else b.push({from:PROG.retest+1, to:PROG.weeks, field:"retest", label:"your retest"});
  return b;
}
function blockFor(w){ const b = testBlocks(); return b.find(x => w <= x.to) || b[b.length-1]; }
function speedsForWeek(w){
  let sp = null;
  for(const b of testBlocks()){ const v = parseFloat(state[b.field]); if(valid(v)) sp = speeds(v); if(w <= b.to) break; }
  return sp;
}
function srcForWeek(w){
  if(w === 0) return "";
  const b = blockFor(w);
  if(b.field === "test") return "Paces from your test";
  return valid(parseFloat(state[b.field])) ? `Paces from ${b.label}` : "Using your latest test until the retest is entered";
}

/* ============================ CUSTOM PLAN SETUP ============================ */
let customOpen = false;
const DAY = 864e5;
function mondayOf(d){ const x = new Date(d); x.setHours(0,0,0,0); x.setDate(x.getDate() - ((x.getDay()+6)%7)); return x; }
// Works out the plan from a race date: weeks (8–16) and the Monday Week 1 starts.
// startIso is optional: only offered when the race is more than 16 weeks away.
function customFromRace(iso, startIso){
  if(!iso) return {err:"Choose your race date."};
  const raceMon = mondayOf(parseISO(iso));
  const far = Math.round((raceMon - nextMonday()) / (7*DAY)) + 1 > 16;
  let start = nextMonday();
  if(far && startIso){
    start = mondayOf(parseISO(startIso));
    if(start < mondayOf(new Date())) return {far, err:"Pick a start date from this week onwards."};
  }
  const total = Math.round((raceMon - start) / (7*DAY)) + 1;
  if(total < 8) return {far, err: far ? "That start leaves less than 8 weeks to your race. Pick an earlier start date." : "Your race is less than 8 weeks away. Pick the 8-week program, or a later race."};
  const early = total > 16, n = early ? 16 : total;
  return {n, start, raceMon, far, early, gap: total - 16};
}
function renderCustomBox(){
  if(!$("customBox")) return;
  const c = state.custom || {};
  if(document.activeElement !== $("raceDate")) $("raceDate").value = c.race || "";
  $("level").value = c.level || "r";
  const pre = customFromRace($("raceDate").value);
  $("cbStartWrap").hidden = !pre.far;
  if(pre.far && document.activeElement !== $("cbStart")) $("cbStart").value = c.start || toISO(nextMonday());
  const msg = $("customMsg"); msg.className = "cbmsg";
  if(PROG.custom){
    const endWk = fmtDay(addDays(parseISO(c.start), (PROG.weeks-1)*7));
    msg.textContent = `Your plan: ${PROG.weeks} weeks for a ${LEVELS[PROG.level].toLowerCase()}. Week 1 starts ${fmtDay(parseISO(c.start))}, ` +
      (PROG.early ? `and it finishes the week of ${endWk} with a retest, before your race. Then rebuild to take you to race day.` : `race week starts ${endWk}.`) +
      ` Change the details and tap Rebuild to remake it.`;
    $("customGo").textContent = "Rebuild my plan";
  } else {
    msg.textContent = "";
    $("customGo").textContent = "Build my plan";
  }
}
function previewCustom(){
  const sw = $("cbStartWrap"), wasHidden = sw.hidden;
  const pre = customFromRace($("raceDate").value);
  sw.hidden = !pre.far;
  if(pre.far && wasHidden && !$("cbStart").value) $("cbStart").value = toISO(nextMonday());
  const r = customFromRace($("raceDate").value, pre.far ? $("cbStart").value : ""), msg = $("customMsg");
  msg.className = "cbmsg" + (r.err ? " bad" : "");
  if(r.err){ msg.textContent = $("raceDate").value ? r.err : ""; return; }
  const end = fmtDay(addDays(r.start, (r.n-1)*7));
  msg.textContent = r.early
    ? `Heads up: your race is more than 16 weeks after this start date. You'll get a 16-week plan starting ${fmtDay(r.start)}. It finishes the week of ${end} with a retest, ${r.gap} week${r.gap===1?"":"s"} before your race. Then build a new plan to take you to race day. Or start on ${fmtDay(addDays(r.raceMon, -15*7))} and it finishes at your race.`
    : `${r.n}-week plan. Week 1 starts ${fmtDay(r.start)}. Do your 6-min test the week before.`;
}

function progName(p){ return p.custom ? `${p.weeks}-week custom plan` : `${p.weeks}-week program`; }
/* ============================ RENDER ============================ */
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

// Ticked sessions show as one short line so the next run is easy to reach.
// Ids in here are ticked sessions the athlete has opened back up (this visit only).
const openDone = new Set();
function render(){
  const t = parseFloat(state.test), r = parseFloat(state.retest);
  const hasT = valid(t), hasR = valid(r);
  $("testErr").textContent = state.test!=="" && !hasT ? "Enter a distance between 600 and 2600 m." : "";
  $("retestErr").textContent = state.retest!=="" && !hasR ? "Enter a distance between 600 and 2600 m." : "";
  $("retest2Err").textContent = state.retest2!=="" && !valid(parseFloat(state.retest2)) ? "Enter a distance between 600 and 2600 m." : "";
  const s1 = hasT ? speeds(t) : null;
  const s2 = hasR ? speeds(r) : s1;
  const a = Number(state.age), hasA = validAge(a), hr = hasA ? zone2(a, state.maf) : null;
  $("mafBox").hidden = hasA && a <= 16; $("mafNote").hidden = !(hasA && a <= 16);
  $("mafCur").textContent = MAF_SHORT[String(state.maf)] || MAF_SHORT["0"];
  $("ageErr").textContent = state.age!=="" && !hasA ? "Enter an age between 12 and 90." : "";

  // print header
  const r2v = parseFloat(state.retest2);
  $("printhead").textContent = (hasT ? "6-min test: "+t+" m" : "") + (hasR ? "   |   Week "+PROG.retest+" retest: "+r+" m" : "") + (PROG.retest2 && valid(r2v) ? "   |   Week "+PROG.retest2+" retest: "+r2v+" m" : "");

  // lanes
  $("lanes").innerHTML = `<div class="lane hr"><div class="z">${ZONES.hr.name}<small>${ZONES.hr.desc}</small></div>
      ${hr ? `<div class="p span">${hr.text}<span>All weeks · stay at or below ${hr.high}</span></div>` : `<div class="p na span">Enter your age</div>`}</div>` +
    ["aer","lt","vo2"].map(z=>{
    const cell = (s, pending) => {
      if(!s) return `<div class="p na">${pending}</div>`;
      const p = pace(s[z]); return `<div class="p">${p.main}<span>${p.fast}–${p.slow} /km</span></div>`;
    };
    return `<div class="lane ${z}"><div class="z">${ZONES[z].name}<small>${ZONES[z].desc}</small></div>
      ${testBlocks().map((b,bi) => { const v = parseFloat(state[b.field]); return cell(valid(v) ? speeds(v) : null, bi===0 ? "Enter test" : (hasT ? "After retest" : "Enter test")); }).join("")}</div>`;
  }).join("") +
    (goNumber() ? `<div class="lane go"><div class="z">Go HR<small>Speed run rests</small></div>
      <div class="p span">${goNumber()} bpm<span>All speed runs \u00b7 start your next rep at or below ${goNumber()}</span></div></div>` : "");

  // program
  let html = "", cur = -1, total = 0, done = 0;
  const wk = {};
  PROGRAM.forEach((s,i)=>{ const o = wk[s.w] || (wk[s.w] = {n:0, d:0}); o.n++; if(state.ticks["s"+i]) o.d++; });
  PROGRAM.forEach((s,i)=>{
    if(s.w!==cur){
      if(cur!==-1) html += "</section>";
      cur = s.w;
      const src = srcForWeek(s.w);
      if(s.w===0) html += `<a class="btn ghost trackbtn noprint" id="trackLink" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=running+track+near+me">\ud83d\udccd Find a running track near me</a>`;
      html += `<section class="week"><h2>${s.w===0?"Before you start":"Week "+s.w}<span class="phase">${s.w===0?"":PHASES[s.w]}</span><span class="wpct" title="${wk[s.w].d} of ${wk[s.w].n} done">${Math.round(wk[s.w].d/wk[s.w].n*100)}%</span><span class="src">${src}</span></h2>`;
    }
    const id = "s"+i, checked = !!state.ticks[id];
    const logged = !!(state.km[id] && state.km[id].km > 0);
    const planned = plannedKm(s.work);
    total++; if(checked) done++;
    const sp = speedsForWeek(s.w);
    let paceHtml = "";
    if(s.zone==="hr"){
      paceHtml = `<span class="pill hr">Zone 2</span>` + (hr ? `<b>${hr.text}</b><span>Heart rate</span>` : `<span>Enter your age</span>`);
    } else if(s.zone){
      paceHtml = `<span class="pill ${s.zone}">${ZONES[s.zone].name}</span>`;
      if(sp){ const p = pace(sp[s.zone]); paceHtml += `<b>${p.main} /km</b><span>${p.fast}–${p.slow}</span>`; }
      else paceHtml += `<span>Enter test</span>`;
    }
    const sx = sessionParts(s, sp);
    if(sx.go) paceHtml += `<div class="gohr">Go \u2264 ${sx.go} bpm</div>`;
    const spec = (sx.warm ? `<span class="k">Warm-up</span><span class="v">${esc(sx.warm)}</span>` : "") +
                 (sx.cool ? `<span class="k">Cool-down</span><span class="v">${esc(sx.cool)}</span>` : "") +
                 (sx.rest ? `<span class="k">Rest</span><span class="v">${esc(sx.rest)}</span>` : "") +
                 (sx.round ? `<span class="k">Rounds</span><span class="v">${esc(sx.round)}</span>` : "");
    const min = checked && !openDone.has(id);
    html += `<div class="sess${s.opt?" opt":""}${s.test?" test":""}${checked?" done":""}${min?" min":""}">
      <input type="checkbox" id="${id}" ${checked?"checked":""} aria-label="Mark ${esc(s.run)} week ${s.w} done">
      <label class="what" for="${id}"><div class="run">${esc(runLabel(s))}</div><div class="title">${esc(s.title)}</div>
        <div class="work">${s.stridesAfter ? esc(s.work).replace(" + ", "<br>+ ") : esc(s.work)}</div>${spec?`<div class="spec">${spec}</div>`:""}${sx.note?`<div class="note">${esc(sx.note)}</div>`:""}</label>
      <div class="pace">${paceHtml}</div>
      ${s.stridesAfter ? `<details class="howto"><summary>How to do strides</summary><ul>${STRIDES_HOW.map(x => `<li>${esc(x)}</li>`).join("")}</ul></details>` : ""}
      ${checked ? `<div class="mini">${logged ? `<span class="minikm">${km2(state.km[id].km)} km</span>` : ""}<button type="button" class="more" data-more="${id}" aria-expanded="${!min}">${min ? "Details" : "Hide"}</button></div>` : ""}
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

/* ============================ CONFIRM ============================
   askConfirm("Clear ticks?", "Clear", "Cancel") resolves true or false. Escape or a tap outside cancels.
*/
let cfDone = null;
function askConfirm(message, yes, no){
  $("cfMsg").textContent = message;
  $("cfYes").textContent = yes || "Yes";
  $("cfNo").textContent = no || "Cancel";
  $("cfModal").hidden = false;
  $("cfNo").focus();
  return new Promise(res => { cfDone = res; });
}
function cfClose(answer){ $("cfModal").hidden = true; const f = cfDone; cfDone = null; if(f) f(answer); }
$("cfYes").addEventListener("click", ()=> cfClose(true));
$("cfNo").addEventListener("click", ()=> cfClose(false));
$("cfModal").addEventListener("click", e=>{ if(e.target === $("cfModal")) cfClose(false); });
document.addEventListener("keydown", e=>{ if(e.key === "Escape" && !$("cfModal").hidden) cfClose(false); });

/* ============================ EVENTS ============================ */
["name","age","email","test","retest","retest2"].forEach(k=>{
  $(k).value = state[k]||"";
  $(k).addEventListener("input", e=>{ state[k]=e.target.value.trim(); save(state); render(); updateSummaries(); if(typeof updateCalHints==="function") updateCalHints(); });
});
["restHr","peakHr"].forEach(k=>{
  $(k).value = state[k]||"";
  $(k).addEventListener("input", e=>{ state[k]=e.target.value.trim(); save(state); renderHr(); render(); updateSummaries(); });
});
$("hrDevices").addEventListener("click", e=>{
  const d = e.target.dataset && e.target.dataset.dev; if(!d) return;
  document.querySelectorAll("#hrDevices button").forEach(b=>{ const on = b.dataset.dev===d; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
  document.querySelectorAll(".hrdev").forEach(p=>{ p.hidden = p.dataset.dev !== d; });
});
document.querySelectorAll('input[name="maf"]').forEach(r=>{
  r.checked = r.value === String(state.maf);
  r.addEventListener("change", ()=>{ state.maf = r.value; save(state); render(); setTimeout(()=>{ $("mafBox").open = false; }, 250); });
});
$("program").addEventListener("change", async e=>{
  if(e.target.type!=="checkbox") return;
  if(!e.target.checked){
    // unticking: keep it ticked until the athlete confirms, in case it was a slip
    const box = e.target, s = PROGRAM[+box.id.slice(1)];
    box.checked = true;
    const what = !s ? "this session" : s.w === 0 ? "the 6-min test" : `Week ${s.w} ${s.run}`;
    const kept = state.km[box.id] ? "\nYour logged distance stays saved." : "";
    if(!(await askConfirm(`Untick ${what}?${kept}`, "Untick", "Keep it ticked"))) return;
    box.checked = false;
  }
  state.ticks[e.target.id] = e.target.checked; save(state);
  openDone.delete(e.target.id);
  render(); updateStrip(); queueSync();
});
$("program").addEventListener("click", e=>{
  const b = e.target.closest("[data-more]"); if(!b) return;
  const id = b.dataset.more;
  if(openDone.has(id)) openDone.delete(id); else openDone.add(id);
  render();
  const again = document.querySelector(`[data-more="${id}"]`); if(again) again.focus();
});
$("coachPick").addEventListener("change", e=>{
  if(e.target.name !== "coach") return;
  state.coach = e.target.value; save(state); renderCoaches(); queueSync();
});
$("coachPick").addEventListener("click", e=>{
  if(e.target.id !== "coachClear") return;
  state.coach = ""; save(state); renderCoaches(); queueSync();
});

$("reset").addEventListener("click", async ()=>{
  const n = Object.values(state.ticks).filter(Boolean).length;
  if(!n && !Object.keys(state.km).length) return;
  if(await askConfirm(`Clear all ${n} ticks and every logged distance for the ${PROG.weeks}-week program?\nThis can\u2019t be undone.`, "Clear ticks", "Cancel")){
    state.ticks={}; state.km={}; save(state); render(); updateStrip(); queueSync();
  }
});

// logging a distance also ticks the session off
$("program").addEventListener("change", e=>{
  const id = e.target.dataset && e.target.dataset.km;
  if(!id) return;
  const v = parseFloat(e.target.value);
  if(Number.isFinite(v) && v > 0){
    state.km[id] = {km: Math.round(v*100)/100, on: toISO(new Date())};
    state.ticks[id] = true;
    openDone.add(id);   // keep it open so Share is right there after logging
  } else {
    delete state.km[id];
  }
  save(state); render(); updateStrip(); queueSync();
});

/* ============================ PROGRESS ============================ */
function mondayOf(d){ const x = new Date(d); x.setHours(0,0,0,0); x.setDate(x.getDate() - ((x.getDay()+6)%7)); return x; }
// Which calendar week (Mon-Sun) the strip and the progress image show. 0 = this week, -1 = last week.
let weekOffset = 0;
const fmtDay = d => d.toLocaleDateString(undefined,{day:"numeric",month:"short"});
function weekWindow(off){ const start = addDays(mondayOf(new Date()), off*7); return {start, end:addDays(start,7), last:addDays(start,6)}; }
// The earliest week that has a logged distance, as an offset from this week.
function minWeekOffset(){
  const now = mondayOf(new Date()); let min = 0;
  Object.values(state.km).forEach(e=>{
    if(!e.on) return;
    const d = Math.round((mondayOf(parseISO(e.on)) - now) / 6048e5);
    if(d < min) min = d;
  });
  return min;
}
function weekName(off){ return off === 0 ? "This week" : off === -1 ? "Last week" : "Week of " + fmtDay(weekWindow(off).start); }
function progressTotals(){
  const runs = Object.values(state.ticks).filter(Boolean).length;
  let total = 0, week = 0;
  const w = weekWindow(weekOffset), list = [];
  Object.values(state.km).forEach(e=>{ total += Number(e.km)||0; });
  PROGRAM.forEach((s,i)=>{
    const e = state.km["s"+i]; if(!e || !e.on) return;
    const d = parseISO(e.on);
    if(d >= w.start && d < w.end){ const v = Number(e.km)||0; week += v; list.push({i, s, km:v}); }
  });
  return {runs, total, week, list, pct: Math.min(100, Math.round(runs/PROGRAM.length*100))};
}
/* "Next run" shortcut: first unticked session in plan order (the Run 3 distance runs count too). */
function nextRunIndex(){
  let i = PROGRAM.findIndex((s,k)=> !state.ticks["s"+k]);
  return i;
}
function updateNext(){
  const b = $("nextRun"); if(!b) return;
  const i = nextRunIndex();
  if(i < 0){ b.hidden = true; return; }
  const s = PROGRAM[i];
  const where = s.w===0 ? "Before you start" : `Week ${s.w}`;
  b.hidden = false;
  b.dataset.i = i;
  b.innerHTML = `<small>Next run \u00b7 ${esc(where)}</small>\u25b6 ${esc(s.w===0 ? s.title : runLabel(s) + " \u00b7 " + s.title)}`;
}
$("nextRun").addEventListener("click", ()=>{
  const i = +$("nextRun").dataset.i, box = $("s"+i); if(!box) return;
  const row = box.closest(".sess"); if(!row) return;
  const calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  row.scrollIntoView({behavior: calm ? "auto" : "smooth", block:"start"});
  row.classList.remove("flash"); void row.offsetWidth; row.classList.add("flash");
});
function updateStrip(){
  const min = minWeekOffset();
  if(weekOffset < min) weekOffset = min;
  const p = progressTotals(), w = weekWindow(weekOffset);
  $("stripNums").innerHTML =
    `<span class="n">${p.runs}<small>Runs</small></span>` +
    `<span class="n">${km2(p.total)}<small>Total km</small></span>` +
    `<span class="n">${km2(p.week)}<small>${weekName(weekOffset)}</small></span>`;
  $("stripFill").style.width = p.pct + "%";
  $("stripPct").textContent = p.pct + "%";
  updateNext();
  $("wkLabel").innerHTML = `${weekName(weekOffset)}<small>${fmtDay(w.start)} \u2013 ${fmtDay(w.last)}</small>`;
  $("wkPrev").disabled = weekOffset <= min;
  $("wkNext").disabled = weekOffset >= 0;
  $("wkRuns").innerHTML = p.list.length
    ? p.list.map(r => `<div class="wkrun"><span><span class="wkw">${r.s.w===0?"Before you start":"Week "+r.s.w} \u00b7 ${esc(runLabel(r.s))} \u00b7 ${esc(r.s.title)}</span>${esc(r.s.work)}</span><span class="wkkm">${km2(r.km)} km</span><button type="button" data-share="${r.i}" aria-label="Share this run">\u2b06 Share</button></div>`).join("")
    : `<p class="wkempty">${weekOffset===0 ? "No distances logged yet this week." : "No distances logged that week."}</p>`;
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
  const sp = speedsForWeek(s.w);
  const age = Number(state.age), hr = validAge(age) ? zone2(age, state.maf) : null;
  const key = s.zone || "ink";
  let target = "";
  if(s.zone==="hr") target = hr ? `Zone 2 · ${hr.text}` : "Zone 2 heart rate";
  else if(s.zone && sp) target = `${ZONES[s.zone].name} · ${pace(sp[s.zone]).main} /km`;
  else if(s.zone) target = ZONES[s.zone].name;
  else if(s.test && s.w===0 && valid(t)) target = `${t} m in 6 minutes`;
  else if(s.test && s.w===PROG.retest && valid(r)) target = `${r} m in 6 minutes`;
  else if(s.test && s.w===PROG.retest2 && valid(parseFloat(state.retest2))) target = `${parseFloat(state.retest2)} m in 6 minutes`;
  const e = state.km["s"+i];
  return {
    top: (s.w===0 ? "BEFORE YOU START" : `WEEK ${s.w} · ${PHASES[s.w].toUpperCase()}`) + ` · ${runLabel(s).toUpperCase()}`,
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
  ctx.fillText(state.coach || DEFAULT_TAG, x + markW + 20, y - 14);
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
  const wk = weekWindow(weekOffset), past = weekOffset < 0;
  ctx.fillText(past ? `${fmtDay(wk.start)} \u2013 ${fmtDay(wk.last)}`.toUpperCase() : `WEEK ${cur.w} \u00b7 ${PHASES[cur.w].toUpperCase()}`, x, y); y += 40;

  // this week is the hero number
  ctx.fillStyle = fg; ctx.font = `800 210px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`;
  ctx.fillText(km2(p.week), x, y + 150); y += 168;
  ctx.fillStyle = accent; ctx.font = `700 60px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`;
  ctx.fillText(past ? (weekOffset === -1 ? "KM LAST WEEK" : "KM THAT WEEK") : "KM THIS WEEK", x, y + 52); y += 116;

  ctx.fillStyle = fg; ctx.font = `800 96px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`;
  ctx.fillText(past ? `RUNS: ${p.list.length}` : `RUNS: ${p.runs}`, x, y + 20); y += 74;

  // total sits underneath, smaller
  ctx.fillStyle = fg; ctx.globalAlpha = .85; ctx.font = `600 52px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`;
  ctx.fillText(`${km2(p.total)} km total`, x, y + 20); ctx.globalAlpha = 1; y += 100;

  // logo + handle, right aligned
  const markH = 92, markW = markH * 565/900;
  ctx.font = `700 46px "Barlow", Arial, sans-serif`;
  const handle = state.coach || DEFAULT_TAG;
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
  $("shCanvas").parentNode.classList.toggle("tall", shMode === "progress");
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
$("wkPrev").addEventListener("click", ()=>{ weekOffset--; updateStrip(); });
$("wkNext").addEventListener("click", ()=>{ if(weekOffset < 0) weekOffset++; updateStrip(); });
$("wkRuns").addEventListener("click", e=>{
  const b = e.target.closest("[data-share]"); if(b) openShare(+b.dataset.share);
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
    brand:[228,183,0], go:[138,79,168], hr:[46,139,87], aer:[31,138,138], lt:[168,133,10], vo2:[217,65,43]};
  const t = parseFloat(state.test), r = parseFloat(state.retest);
  const s1 = valid(t) ? speeds(t) : null, s2 = valid(r) ? speeds(r) : s1;
  const age = Number(state.age), hr = validAge(age) ? zone2(age, state.maf) : null;
  let y = M, page = 1;

  const footer = () => {
    doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(...COL.muted);
    doc.text(pdfText("Prepared by @boomwilliams and @scotty_lev10  |  Pace calculations: Running Fatigue Factor method (aerobiccapacity.com). Zone 2: Maffetone MAF."), M, H-8);
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
  doc.text(`HYROX Running Program – ${PROG.weeks} weeks${PROG.custom ? " (custom)" : ""}`, tx, y+8.5);
  doc.setFont("helvetica","normal"); doc.setFontSize(11); doc.setTextColor(...COL.muted);
  doc.text(pdfText("Prepared by @boomwilliams and @scotty_lev10"), tx, y+14.5); y += 23;
  doc.setFont("helvetica","normal"); doc.setFontSize(9.5); doc.setTextColor(...COL.muted);
  const bits = [];
  if (valid(t)) bits.push("6-min test: " + t + " m");
  bits.push("Week "+PROG.retest+" retest: " + (valid(r) ? r + " m" : "not entered"));
  if (PROG.retest2) bits.push("Week "+PROG.retest2+" retest: " + (valid(parseFloat(state.retest2)) ? parseFloat(state.retest2) + " m" : "not entered"));
  if (validAge(age)) bits.push("Age: " + age);
  doc.text(pdfText(bits.join("   |   ")), M, y); y += 7;

  // Zones table
  const BL = testBlocks(), nc = BL.length, cw = (CW-46)/nc;
  const colX = [M].concat(BL.map((b,bi) => M + 46 + bi*cw));
  doc.setFillColor(...COL.ink); doc.rect(M, y, CW, 7, "F");
  doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(255,255,255);
  doc.text("Zone", colX[0]+3, y+4.8); BL.forEach((b,bi) => doc.text(`Weeks ${b.from}-${b.to}`, colX[bi+1]+2, y+4.8));
  y += 7;
  const zoneRow = (key, label, sub, cells, span) => {
    doc.setFillColor(...COL.soft); doc.rect(M, y, CW, 11, "F");
    doc.setFillColor(...COL[key]); doc.rect(M, y, 1.8, 11, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(10.5); doc.setTextColor(...COL[key]); doc.text(label, colX[0]+4, y+5);
    doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(...COL.muted); doc.text(pdfText(sub), colX[0]+4, y+9);
    doc.setTextColor(...COL.ink);
    const cell = (x, v) => { doc.setFont("helvetica","bold"); doc.setFontSize(11); doc.text(pdfText(v[0]), x+2, y+5);
      if (v[1]) { doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(...COL.muted); doc.text(pdfText(v[1]), x+2, y+9); doc.setTextColor(...COL.ink); } };
    if (span) cell(colX[1], cells); else cells.forEach((c, ci) => cell(colX[ci+1], c));
    y += 11.6;
  };
  zoneRow("hr", "Zone 2 HR", "Zone 2 runs", hr ? [hr.text, "All weeks, stay at or below " + hr.high] : ["Enter age in app", ""], true);
  for (const z of ["aer","lt","vo2"]) {
    const v = s => { if (!s) return ["Enter test in app",""]; const p = pace(s[z]); return [p.main + " /km", p.fast + "-" + p.slow + " /km"]; };
    zoneRow(z, ZONES[z].name, ZONES[z].desc, BL.map((b,bi) => { const d = parseFloat(state[b.field]);
      if (valid(d)) return v(speeds(d));
      return bi === 0 || !s1 ? v(null) : ["After retest", "uses latest test until then"]; }));
  }
  if (goNumber()) zoneRow("go", "Go HR", "Speed run rests", [goNumber() + " bpm", "All speed runs, start your next rep at or below " + goNumber()], true);
  y += 4;

  // Program
  const rightW = 44, leftX = M + 8, textW = CW - 8 - rightW - 4;
  let cur = -1;
  PROGRAM.forEach((s, i) => {
    const sp = speedsForWeek(s.w);
    const note = sessionFlat(sessionParts(s, sp));
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
        doc.text(pdfText(srcForWeek(s.w)), W-M-3, y+5.2, {align:"right"}); }
      y += 9.5;
    }
    // tick box
    doc.setDrawColor(...COL.muted); doc.setLineWidth(0.3); doc.rect(M+1, y+1.2, 4, 4);
    // left text
    doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...COL.muted);
    doc.text(pdfText(runLabel(s) + "  |  " + s.title ), leftX, y+2.6);
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
  const name = `HYROX-Running-Program-${PROG.key}-week.pdf`;
  const file = new File([blob], name, {type:"application/pdf"});
  if (navigator.canShare && navigator.canShare({files:[file]})) {
    try { await navigator.share({files:[file], title:`HYROX Running Program – ${PROG.weeks} weeks`}); msg.textContent = ""; return; }
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
    entries.push({id, prog:PROG.key, week:s.w, run:s.run, session:s.work, km:e?e.km:"", on:e?e.on:"", done});
  });
  if(!entries.length) return;
  try{
    await fetch(SHEET_URL, {method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"},
      body: JSON.stringify({kind:"progress", prog:PROG.key, name:state.name, email:state.email, coach:state.coach, entries})});
  }catch(e){ /* offline: the next change tries again */ }
}

async function sendRow(distance){
  const res = await fetch(SHEET_URL, {method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"},
    body: JSON.stringify({name:state.name, email:state.email, coach:state.coach, prog:PROG.key, distance, website:$("website").value})});
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
  const r2 = parseFloat(state.retest2); if(PROG.retest2 && valid(r2) && !dists.includes(r2)) dists.push(r2);
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
  const add = 7 - ((d.getDay()+6)%7);  // always the coming Monday (Mon -> next Mon, Sun -> tomorrow)
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
  const s2 = valid(r) ? speeds(r) : s1;           // no retest: later weeks keep first-test paces
  const start = parseISO(state.start);
  const events = [];
  PROGRAM.forEach(s=>{
    if(s.w===0 && !includeTest) return;
    if(s.w!==0 && (s.w<fromWeek || s.w>toWeek)) return;
    const windowStart = addDays(start, (s.w===0 ? -1 : s.w-1)*7);
    const slots = datesInWindow(windowStart);
    const runNo = s.w===0 ? 1 : parseInt(s.run.replace(/\D/g,""),10);
    const date = slots[runNo-1];
    const sp = speedsForWeek(s.w);
    let title, desc = [];
    const age = Number(state.age), hr = validAge(age) ? zone2(age, state.maf) : null;
    if(s.zone==="hr"){
      title = `${ZONE_ICON.hr} ${s.title} – ${s.work}${hr?" @ "+hr.text:""}`;
      desc.push(hr ? `Zone 2 heart rate: ${hr.text}. Stay at or below ${hr.high} bpm (Maffetone MAF).` : "Enter your age in the app to see your Zone 2 heart rate.");
    } else if(s.zone){
      const p = sp ? pace(sp[s.zone]) : null;
      title = `${ZONE_ICON[s.zone]} ${s.title} – ${s.work}${p?" @ "+p.main+"/km":""}`;
      desc.push(p ? `${ZONES[s.zone].name} pace: ${p.main} /km (range ${p.fast}–${p.slow})` : "Enter your 6-min test in the app to see your pace.");
    } else {
      title = `📋 ${s.title} – ${s.work}`;
    }
    const note = sessionFlat(sessionParts(s, sp));
    if(note) desc.push(note);
    desc.push(`Week ${s.w===0?"0 (before you start)":s.w}${s.w?" – "+PHASES[s.w]:""}`);
    desc.push("Prepared by @boomwilliams and @scotty_lev10 – open your program: " + APP_URL);
    events.push({uid:`hyrox-${PROG.key}wk-w${s.w}-r${runNo}-${ymd(start)}@bigboomy.github.io`, date, title, desc:desc.join("\n")});
  });
  return events;
}

function buildICS(events){
  const now = new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"");
  const lines = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//boomwilliams//HYROX Running Program//EN","CALSCALE:GREGORIAN","METHOD:PUBLISH","X-WR-CALNAME:HYROX Running Program"];
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
  const nm = (state.name||"").trim();
  $("youSum").textContent = [nm, state.test ? state.test+" m test" : ""].filter(Boolean).join(" \u00b7 ") || "Add your name and 6-min test result";
  const gz = goNumber();
  $("speedSum").textContent = "Target pace per km for each zone" + (gz ? ` \u00b7 go HR ${gz} bpm` : "");
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
  const rng = `Weeks ${PROG.retest+1}–${PROG.weeks}`;
  $("cal2").textContent = `📅 Add ${rng} (${hasR ? "retest" : "current"} paces)`;
  $("cal2").title = hasR ? `Uses your Week ${PROG.retest} retest` : "No retest entered, so your first test paces are used";
  if(!$("calMsg").dataset.sticky) $("calMsg").textContent = !hasT ? "Tip: enter your 6-min test first so paces are included in your calendar." : "";
}

$("days").addEventListener("change", e=>{
  if(e.target.type!=="checkbox") return;
  const i = +e.target.value;
  state.days = e.target.checked ? [...state.days, i].slice(0,3) : state.days.filter(x=>x!==i);
  state.days.sort((a,b)=>a-b); save(state); renderDays(); updateSummaries();
});
$("calToggle").addEventListener("click", ()=>{ $("calBox").open = !$("calBox").open; });
$("calBox").addEventListener("toggle", ()=>{ $("calToggle").setAttribute("aria-expanded", $("calBox").open); });
$("startDate").addEventListener("change", e=>{ state.start = e.target.value; save(state); renderDays(); updateSummaries(); });
$("cal1").addEventListener("click", ()=>{
  if(!calReady()) return;
  downloadICS(`hyrox-${PROG.key}wk-test-and-weeks-1-${PROG.retest}.ics`, buildICS(buildEvents(1,PROG.retest,true)));
  $("calMsg").dataset.sticky = "1";
  $("calMsg").textContent = `Added your test and Weeks 1–${PROG.retest}. After your Week ${PROG.retest} retest, enter it above and add Weeks ${PROG.retest+1}–${PROG.weeks}.`;
});
$("cal2").addEventListener("click", ()=>{
  if(!calReady()) return;
  const hasR = valid(parseFloat(state.retest));
  downloadICS(`hyrox-${PROG.key}wk-weeks-${PROG.retest+1}-${PROG.weeks}.ics`, buildICS(buildEvents(PROG.retest+1,PROG.weeks,false)));
  $("calMsg").dataset.sticky = "1";
  $("calMsg").textContent = `Added Weeks ${PROG.retest+1}–${PROG.weeks} ` + (hasR ? "with your retest paces." : "using your first test paces (no retest entered).");
});
if(!state.start){ state.start = toISO(nextMonday()); save(state); }
$("startDate").value = state.start;
renderDays();
renderCoaches();
renderProgPick();
$("progPick").addEventListener("click", async e=>{
  const btn = e.target.closest && e.target.closest("[data-prog]");
  let k = btn && btn.dataset.prog;
  if(!k) return;
  if(k === "custom"){
    // The Custom button opens and closes the setup. If they've built a custom plan
    // but are on another program, the first tap switches back to it.
    const ck = state.custom && state.custom.n ? `c${state.custom.n}${state.custom.level}${state.custom.x ? "x" : ""}` : "";
    if(!ck || PROG.custom || customOpen){
      customOpen = !customOpen;
      renderProgPick();
      if(customOpen && !ck) $("raceDate").focus();
      return;
    }
    k = ck; ensureProgram(k);
  }
  if(k !== state.prog && (Object.keys(state.ticks).length || Object.keys(state.km).length)){
    const kept = state.store[k] && (Object.keys(state.store[k].ticks||{}).length || Object.keys(state.store[k].km||{}).length);
    if(!(await askConfirm(`Switch to the ${progName(PROGRAMS[k])}?\nYour ${progName(PROG)} ticks and distances are kept. Switch back any time to see them.` + (kept ? `\nYou already have progress saved on the ${progName(PROGRAMS[k])}. It will be restored.` : ""), "Switch", "Cancel"))) return;
  }
  if(!PROGRAMS[k].custom) customOpen = false;
  else if(btn.dataset.prog === "custom") customOpen = true;   // one tap: switch to the custom plan AND open its setup
  setProgram(k);
  renderProgPick();
});

$("raceDate").addEventListener("input", previewCustom);
$("raceDate").addEventListener("change", previewCustom);
$("cbStart").addEventListener("input", previewCustom);
$("cbStart").addEventListener("change", previewCustom);
$("customGo").addEventListener("click", async ()=>{
  const pre = customFromRace($("raceDate").value);
  const r = customFromRace($("raceDate").value, pre.far ? $("cbStart").value : ""), lv = $("level").value;
  if(r.err){ const m = $("customMsg"); m.className = "cbmsg bad"; m.textContent = r.err; return; }
  const key = `c${r.n}${lv}${r.early ? "x" : ""}`;
  if(key !== state.prog && (Object.keys(state.ticks).length || Object.keys(state.km).length)){
    if(!(await askConfirm(`Switch to a ${r.n}-week custom plan?\nYour ${progName(PROG)} ticks and distances are kept. Switch back any time to see them.`, "Switch", "Cancel"))) return;
  }
  state.custom = {race: $("raceDate").value, level: lv, start: toISO(r.start), n: r.n, x: !!r.early};
  state.start = toISO(r.start);           // the calendar starts where the plan does
  if($("startDate")) $("startDate").value = state.start;
  ensureProgram(key);
  customOpen = true;
  if(key === state.prog){ save(state); renderProgPick(); render(); updateStrip(); updateCalHints(); updateSummaries(); }
  else setProgram(key);
  if(typeof renderDays === "function") renderDays();
  customOpen = false;                     // plan built: fold the setup away
  renderProgPick();
});

renderHr();
render();
updateCalHints();
updateSummaries();
applyLock();
updateStrip();
applyDefaultFolds();

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
