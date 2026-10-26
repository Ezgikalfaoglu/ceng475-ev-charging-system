// Display formatting helpers (vanilla JavaScript). OWNER: PM.
import { CURRENCY } from '../../shared/constants.js';
import { diffMinutes, parseLocalIso } from '../../shared/time.js';

const LOCALE = 'en-GB';

export function formatMoney(amount, currency = CURRENCY) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return '-';
  return new Intl.NumberFormat(LOCALE, { style: 'currency', currency }).format(value);
}

/** Price per kWh needs three decimals of precision on screen: 0.550 EUR/kWh. */
export const formatPrice = (amount) => `${Number(amount).toFixed(2)} ${CURRENCY}/kWh`;

export const formatKwh = (kwh) => `${(Math.round(Number(kwh) * 10) / 10).toFixed(1)} kWh`;
export const formatPower = (kw) => `${Number(kw)} kW`;

/** '2026-10-27T18:00' -> 'Tue 27 Oct, 18:00' */
export function formatDateTime(localIso) {
  const date = parseLocalIso(localIso);
  if (!date) return '-';
  const day = new Intl.DateTimeFormat(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
  return `${day}, ${localIso.slice(11, 16)}`;
}

/** '2026-10-27T18:00' -> 'Tue 27 Oct 2026' */
export function formatDate(localIso) {
  const date = parseLocalIso(`${localIso.slice(0, 10)}T00:00`);
  if (!date) return '-';
  return new Intl.DateTimeFormat(LOCALE, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

/** 'Tue 27 Oct, 18:00 to 19:00' (adds the end date when the range crosses midnight). */
export function formatTimeRange(startIso, endIso) {
  const sameDay = startIso.slice(0, 10) === endIso.slice(0, 10);
  return `${formatDateTime(startIso)} to ${sameDay ? endIso.slice(11, 16) : formatDateTime(endIso)}`;
}

/** 90 -> '1 h 30 min' */
export function formatDuration(totalMinutes) {
  const minutes = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export const durationBetween = (startIso, endIso) => formatDuration(diffMinutes(startIso, endIso));

/** Audit timestamps from the API are UTC ISO strings: '2026-10-26T10:21:00Z' -> '5 min ago'. */
export function formatRelative(utcIso, now = new Date()) {
  const then = new Date(utcIso);
  if (Number.isNaN(then.getTime())) return '';
  const seconds = Math.round((now.getTime() - then.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d ago`;
  return new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' }).format(then);
}

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

export const capitalize = (text = '') => text.charAt(0).toUpperCase() + text.slice(1);
