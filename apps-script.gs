/** @boomwilliams – HYROX Run Program collector
 *  Results tab:  Timestamp, Name, Email, Distance (m)   — same email + same distance is recorded once.
 *  Progress tab: Email, Name, Week, Run, Session, Km, Done, Logged on, Updated
 *                one row per session per athlete, updated in place.
 */
const SHEET_NAME = 'Results';
const PROGRESS_SHEET = 'Progress';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000); // stops two rapid saves colliding
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.website) return out({ status: 'added' }); // bot trap: pretend success, write nothing
    return d.kind === 'progress' ? saveProgress(d) : saveResult(d);
  } catch (err) {
    return out({ status: 'error' });
  } finally {
    lock.releaseLock();
  }
}

/* ---------------- test results ---------------- */
function saveResult(d) {
  const name = clean(d.name, 80);
  const email = String(d.email || '').trim().toLowerCase().slice(0, 120);
  const distance = Math.round(Number(d.distance));
  if (!name || !validEmail(email) || !(distance >= 600 && distance <= 2600)) {
    return out({ status: 'invalid' });
  }

  const sh = sheet(SHEET_NAME, ['Timestamp', 'Name', 'Email', 'Distance (m)']);
  const last = sh.getLastRow();
  if (last > 1) {
    const rows = sh.getRange(2, 3, last - 1, 2).getValues(); // Email, Distance
    if (rows.some(r => String(r[0]).toLowerCase() === email && Number(r[1]) === distance)) {
      return out({ status: 'duplicate' });
    }
  }
  sh.appendRow([new Date(), name, email, distance]);
  return out({ status: 'added' });
}

/* ---------------- ticks + logged km ---------------- */
function saveProgress(d) {
  const email = String(d.email || '').trim().toLowerCase().slice(0, 120);
  const name = clean(d.name, 80);
  const entries = Array.isArray(d.entries) ? d.entries.slice(0, 60) : [];
  if (!validEmail(email) || !entries.length) return out({ status: 'invalid' });

  const sh = sheet(PROGRESS_SHEET,
    ['Email', 'Name', 'Week', 'Run', 'Session', 'Km', 'Done', 'Logged on', 'Updated']);

  // index existing rows for this athlete by session, so each session keeps one row
  const last = sh.getLastRow();
  const keyCol = {}; // "week|run" -> row number
  if (last > 1) {
    const rows = sh.getRange(2, 1, last - 1, 4).getValues(); // Email, Name, Week, Run
    rows.forEach((r, i) => {
      if (String(r[0]).toLowerCase() === email) keyCol[r[2] + '|' + r[3]] = i + 2;
    });
  }

  const now = new Date();
  const appends = [];
  entries.forEach(en => {
    const week = Number(en.week);
    const run = clean(en.run, 20);
    const km = en.km === '' || en.km === null ? '' : Math.round(Number(en.km) * 100) / 100;
    if (!(week >= 0 && week <= 14) || !run) return;
    if (km !== '' && !(km >= 0 && km <= 80)) return;
    const row = [email, name, week, run, clean(en.session, 60), km, en.done ? 'Yes' : '', en.on || '', now];
    const at = keyCol[week + '|' + run];
    if (at) sh.getRange(at, 1, 1, row.length).setValues([row]);
    else appends.push(row);
  });
  if (appends.length) sh.getRange(sh.getLastRow() + 1, 1, appends.length, appends[0].length).setValues(appends);
  return out({ status: 'saved', rows: entries.length });
}

/* ---------------- helpers ---------------- */
function sheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
  }
  return sh;
}

function validEmail(v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v); }

// Stops names like "=IMPORTXML(...)" running as formulas in the sheet
function clean(v, max) {
  let s = String(v || '').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
