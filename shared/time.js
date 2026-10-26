// Time helpers shared by the React app and the Express server (vanilla JavaScript).
// OWNER: PM.
//
// All schedule times (reservations, blocks, sessions) are "station local" strings in the
// format YYYY-MM-DDTHH:mm without a time zone. This format sorts correctly as plain text,
// so comparisons like `a < b` and overlap checks work without converting to Date objects.
// For the course demo the browser and the server run on the same machine, so "local" is the
// same everywhere. See docs/ARCHITECTURE.md ("Time handling").

const pad = (n) => String(n).padStart(2, '0');

/** Date -> 'YYYY-MM-DDTHH:mm' in local time. */
export function toLocalIso(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** 'YYYY-MM-DDTHH:mm' -> Date, or null when the text is not a real date and time. */
export function parseLocalIso(text) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(String(text));
  if (!m) return null;
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]));
  // Rejects overflow such as 2026-02-31 or 25:00 (Date silently rolls these over).
  return toLocalIso(date) === text ? date : null;
}

export const isValidLocalIso = (text) => parseLocalIso(text) !== null;

export const nowLocalIso = () => toLocalIso(new Date());

export function addMinutes(iso, minutes) {
  const date = parseLocalIso(iso);
  if (!date) throw new Error(`Invalid local time: ${iso}`);
  return toLocalIso(new Date(date.getTime() + minutes * 60_000));
}

/** Whole minutes from `fromIso` to `toIso` (negative when `toIso` is earlier). */
export function diffMinutes(fromIso, toIso) {
  return Math.round((parseLocalIso(toIso).getTime() - parseLocalIso(fromIso).getTime()) / 60_000);
}

/** Two half-open ranges [aStart, aEnd) and [bStart, bEnd) overlap. Touching ranges do not. */
export const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

export const dateOf = (iso) => iso.slice(0, 10); // 'YYYY-MM-DD'
export const timeOf = (iso) => iso.slice(11, 16); // 'HH:mm'
export const combine = (date, time) => `${date}T${time}`;

/** Today's date as 'YYYY-MM-DD' (local). */
export const todayLocal = () => dateOf(nowLocalIso());

/** Shift a 'YYYY-MM-DD' date by whole days. */
export function addDays(dateText, days) {
  const date = parseLocalIso(`${dateText}T00:00`);
  date.setDate(date.getDate() + days);
  return dateOf(toLocalIso(date));
}
