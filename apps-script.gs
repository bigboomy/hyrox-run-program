/** HYROX Run Program – results collector
 *  Records Timestamp, Name, Email, Distance.
 *  Duplicate rule: same email + same distance is recorded once.
 */
const SHEET_NAME = 'Results';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // stops two rapid taps both writing a row
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.website) return out({ status: 'added' }); // bot trap: pretend success, write nothing

    const name = clean(d.name, 80);
    const email = String(d.email || '').trim().toLowerCase().slice(0, 120);
    const distance = Math.round(Number(d.distance));
    if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !(distance >= 600 && distance <= 2600)) {
      return out({ status: 'invalid' });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) {
      sh = ss.insertSheet(SHEET_NAME);
      sh.appendRow(['Timestamp', 'Name', 'Email', 'Distance (m)']);
      sh.setFrozenRows(1);
    }

    const last = sh.getLastRow();
    if (last > 1) {
      const rows = sh.getRange(2, 3, last - 1, 2).getValues(); // Email, Distance
      const dup = rows.some(r => String(r[0]).toLowerCase() === email && Number(r[1]) === distance);
      if (dup) return out({ status: 'duplicate' });
    }

    sh.appendRow([new Date(), name, email, distance]);
    return out({ status: 'added' });
  } catch (err) {
    return out({ status: 'error' });
  } finally {
    lock.releaseLock();
  }
}

// Stops names like "=IMPORTXML(...)" running as formulas in your sheet
function clean(v, max) {
  let s = String(v || '').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
