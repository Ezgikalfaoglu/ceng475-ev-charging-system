// Demo data. OWNER: PM.
// Dates are generated relative to the moment the database is created, so "tomorrow 10:00" is
// always in the future. Run "npm run db:reset" if the demo data feels stale.
import bcrypt from 'bcryptjs';
import { config } from '../config.js';
import { addMinutes, toLocalIso, addDays, todayLocal } from '../../shared/time.js';

export const DEMO_ACCOUNTS = {
  admin: { email: 'admin@voltflow.demo', password: 'Admin123!' },
  customer: { email: 'ayse@voltflow.demo', password: 'Customer123!' },
  customers: [
    { email: 'ayse@voltflow.demo', password: 'Customer123!' },
    { email: 'can@voltflow.demo', password: 'Customer123!' },
    { email: 'elif@voltflow.demo', password: 'Customer123!' },
    { email: 'mert@voltflow.demo', password: 'Customer123!' },
  ],
};

const USERS = [
  { name: 'Selin Yıldız', email: 'admin@voltflow.demo', role: 'admin', phone: '+90 312 555 0100' },
  { name: 'Ayşe Demir', email: 'ayse@voltflow.demo', role: 'customer', phone: '+90 532 555 0111', vehicle: 'Renault Megane E-Tech', connector: 'CCS2', battery: 60 },
  { name: 'Can Aksoy', email: 'can@voltflow.demo', role: 'customer', phone: '+90 533 555 0122', vehicle: 'Tesla Model 3', connector: 'CCS2', battery: 75 },
  { name: 'Elif Kaya', email: 'elif@voltflow.demo', role: 'customer', phone: '+90 535 555 0133', vehicle: 'Nissan Leaf', connector: 'CHAdeMO', battery: 40 },
  { name: 'Mert Özkan', email: 'mert@voltflow.demo', role: 'customer', phone: '+90 536 555 0144', vehicle: 'Togg T10X', connector: 'CCS2', battery: 88.5 },
];

const STATIONS = [
  {
    name: 'VoltFlow Kızılay Hub', city: 'Ankara', address: 'Atatürk Bulvarı 120, Çankaya', lat: 39.9208, lon: 32.8541,
    description: 'Fast chargers in the city centre, next to the metro. Ideal for a quick top-up between meetings.',
    amenities: 'Cafe,Restroom,Wi-Fi,Covered parking', open: '06:00', close: '23:00',
    chargers: [['A1', 'CCS2', 150, 0.55], ['A2', 'CCS2', 150, 0.55], ['B1', 'Type2', 22, 0.38], ['B2', 'CHAdeMO', 50, 0.48]],
  },
  {
    name: 'VoltFlow Çankaya Park', city: 'Ankara', address: 'Hoşdere Caddesi 45, Çankaya', lat: 39.8998, lon: 32.8601,
    description: 'Quiet park-side station with a mix of fast and standard AC chargers.',
    amenities: 'Restroom,Playground', open: '07:00', close: '22:00',
    chargers: [['A1', 'CCS2', 100, 0.49], ['A2', 'Type2', 22, 0.36], ['A3', 'Type2', 22, 0.36]],
  },
  {
    name: 'VoltFlow Teknokent', city: 'Ankara', address: 'Üniversiteler Mahallesi, Teknokent Yolu 1, Çankaya', lat: 39.8913, lon: 32.7783,
    description: 'Campus station for researchers and visitors. Two ultra-fast CCS2 chargers.',
    amenities: 'Cafe,Wi-Fi,Restroom', open: '06:00', close: '22:00',
    chargers: [['A1', 'CCS2', 150, 0.52], ['A2', 'CCS2', 150, 0.52], ['B1', 'CHAdeMO', 50, 0.46], ['B2', 'Type2', 11, 0.32, 'maintenance']],
  },
  {
    name: 'VoltFlow Esenboğa Airport', city: 'Ankara', address: 'Esenboğa Havalimanı Yolu, Akyurt', lat: 40.1281, lon: 32.9951,
    description: 'Highest-power chargers in the network, five minutes from the terminal.',
    amenities: 'Restroom,Covered parking,24h security', open: '05:00', close: '23:30',
    chargers: [['A1', 'CCS2', 250, 0.62], ['A2', 'CCS2', 250, 0.62], ['A3', 'CHAdeMO', 100, 0.54], ['A4', 'Type2', 22, 0.4]],
  },
  {
    name: 'VoltFlow Levent Tower', city: 'Istanbul', address: 'Büyükdere Caddesi 201, Şişli', lat: 41.0811, lon: 29.0113,
    description: 'Business district station inside the tower car park.',
    amenities: 'Cafe,Restroom,Wi-Fi,Covered parking', open: '06:00', close: '23:00',
    chargers: [['A1', 'CCS2', 180, 0.65], ['A2', 'CCS2', 180, 0.65], ['B1', 'Type2', 22, 0.45]],
  },
  {
    name: 'VoltFlow Kadıköy Pier', city: 'Istanbul', address: 'İskele Meydanı 3, Kadıköy', lat: 40.9919, lon: 29.0233,
    description: 'Charge while you take a walk along the waterfront.',
    amenities: 'Restroom,Cafe', open: '07:00', close: '22:00',
    chargers: [['A1', 'CCS2', 100, 0.5], ['A2', 'Type2', 22, 0.38]],
  },
  {
    name: 'VoltFlow Bornova Marina', city: 'Izmir', address: 'Marina Bulvarı 12, Bornova', lat: 38.4602, lon: 27.2231,
    description: 'Sea-view station with three connector types.',
    amenities: 'Cafe,Restroom,Wi-Fi', open: '07:00', close: '22:00',
    chargers: [['A1', 'CCS2', 120, 0.47], ['A2', 'CHAdeMO', 50, 0.42], ['A3', 'Type2', 22, 0.34]],
  },
  {
    // No reservation history on purpose: admins can delete this one to demonstrate DELETE.
    name: 'VoltFlow Pilot Point', city: 'Ankara', address: 'Eryaman 1. Etap, Pilot Sokak 5, Etimesgut', lat: 39.9712, lon: 32.6358,
    description: 'New pilot location that has not opened to bookings yet.',
    amenities: 'Restroom', open: '08:00', close: '20:00',
    chargers: [['A1', 'Type2', 11, 0.3]],
  },
];

// Small deterministic random generator so every seeded database looks the same.
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const utcStamp = (date) => date.toISOString().slice(0, 19) + 'Z';
const round1 = (n) => Math.round(n * 10) / 10;
const round2 = (n) => Math.round(n * 100) / 100;

export async function seedDatabase(db, { now = new Date() } = {}) {
  const hashes = {
    admin: await bcrypt.hash(DEMO_ACCOUNTS.admin.password, config.bcryptRounds),
    customer: await bcrypt.hash(DEMO_ACCOUNTS.customer.password, config.bcryptRounds),
  };

  const today = todayLocal();
  const at = (dayOffset, hhmm) => `${addDays(today, dayOffset)}T${hhmm}`;
  const nowMin = new Date(now);
  nowMin.setSeconds(0, 0);
  // Start of the current 30-minute slot, used for the live demo session.
  const slotStart = new Date(nowMin);
  slotStart.setMinutes(slotStart.getMinutes() < 30 ? 0 : 30);
  const liveStart = toLocalIso(slotStart);

  await db.write((tx) => {
    // ---- users --------------------------------------------------------------------------
    const userIds = {};
    for (const u of USERS) {
      const { lastInsertRowid } = tx.run(
        `INSERT INTO users (name, email, password_hash, role, phone, vehicle_model, vehicle_connector, battery_kwh)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [u.name, u.email, u.role === 'admin' ? hashes.admin : hashes.customer, u.role, u.phone, u.vehicle ?? null, u.connector ?? null, u.battery ?? 60]
      );
      userIds[u.email.split('@')[0]] = lastInsertRowid;
    }

    // ---- stations and chargers ----------------------------------------------------------
    const chargers = []; // { id, stationId, label, power, price, status }
    STATIONS.forEach((s) => {
      const { lastInsertRowid: stationId } = tx.run(
        `INSERT INTO stations (name, address, city, latitude, longitude, description, amenities, opening_time, closing_time)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [s.name, s.address, s.city, s.lat, s.lon, s.description, s.amenities, s.open, s.close]
      );
      for (const [label, connector, power, price, status = 'operational'] of s.chargers) {
        const { lastInsertRowid: id } = tx.run(
          'INSERT INTO chargers (station_id, label, connector_type, power_kw, status, price_per_kwh) VALUES (?, ?, ?, ?, ?, ?)',
          [stationId, label, connector, power, status, price]
        );
        chargers.push({ id, stationId, label, power, price, status });
      }
    });
    const byName = (stationIndex, label) => {
      const stationId = tx.get('SELECT id FROM stations WHERE name = ?', [STATIONS[stationIndex].name]).id;
      return chargers.find((c) => c.stationId === stationId && c.label === label);
    };

    const addReservation = (userId, charger, start, end, status = 'confirmed') =>
      tx.run(
        'INSERT INTO reservations (user_id, charger_id, start_time, end_time, status, cancelled_at) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, charger.id, start, end, status, status === 'cancelled' ? utcStamp(now) : null]
      ).lastInsertRowid;

    // ---- the live demo session (simulated charging in progress) -------------------------
    const hub1 = byName(0, 'A1');
    const liveEnd = addMinutes(liveStart, 60);
    const liveRes = addReservation(userIds.ayse, hub1, liveStart, liveEnd);
    const elapsedH = Math.max(0, (nowMin - slotStart) / 3_600_000);
    const liveKwh = round1(Math.min(hub1.power, 100) * elapsedH * 0.8);
    const liveProgress = Math.min(95, Math.round((liveKwh / (60 * 0.58)) * 100));
    tx.run(
      `INSERT INTO charging_sessions (reservation_id, status, start_soc, target_soc, started_at, energy_kwh, price_per_kwh, cost, progress_pct)
       VALUES (?, 'charging', 22, 80, ?, ?, ?, ?, ?)`,
      [liveRes, liveStart, liveKwh, hub1.price, round2(liveKwh * hub1.price), liveProgress]
    );

    // ---- upcoming reservations (the conflict demo lives on Kızılay Hub A1 / A2) ---------
    const hub2 = byName(0, 'A2');
    const hubB1 = byName(0, 'B1');
    const tekno1 = byName(2, 'A1');
    const upcomingAyse = addReservation(userIds.ayse, hub2, at(1, '18:00'), at(1, '19:00'));
    addReservation(userIds.can, hub1, at(1, '09:00'), at(1, '10:30'));
    addReservation(userIds.elif, hub1, at(1, '10:30'), at(1, '12:00'));
    addReservation(userIds.mert, hub1, at(1, '14:00'), at(1, '15:00'));
    addReservation(userIds.mert, hub2, at(1, '09:00'), at(1, '12:00'));
    const upcomingAyse2 = addReservation(userIds.ayse, tekno1, at(2, '08:00'), at(2, '09:00'));
    addReservation(userIds.elif, hub1, at(1, '16:00'), at(1, '17:00'), 'cancelled'); // frees a slot
    const cancelledAyse = addReservation(userIds.ayse, byName(1, 'A1'), at(1, '12:00'), at(1, '13:00'), 'cancelled');

    // ---- admin availability block -------------------------------------------------------
    tx.run('INSERT INTO availability_blocks (charger_id, start_time, end_time, reason, created_by) VALUES (?, ?, ?, ?, ?)', [
      hubB1.id, at(1, '13:00'), at(1, '15:00'), 'Scheduled maintenance', userIds.admin,
    ]);

    // ---- 30 days of completed history for statistics ------------------------------------
    const rand = mulberry32(475);
    const customers = ['ayse', 'can', 'elif', 'mert'];
    const batteryOf = { ayse: 60, can: 75, elif: 40, mert: 88.5 };
    const usable = chargers.filter((c) => c.status === 'operational' && c.stationId !== chargers[chargers.length - 1].stationId);
    let lastCompleted = null;
    for (let day = -30; day <= -1; day += 1) {
      const busy = new Map(); // charger id -> [[start, end]]
      const count = 3 + Math.floor(rand() * 5);
      for (let i = 0; i < count; i += 1) {
        const charger = usable[Math.floor(rand() * usable.length)];
        const startHour = 7 + Math.floor(rand() * 14);
        const startMin = rand() < 0.5 ? '00' : '30';
        const duration = [30, 60, 60, 90, 120][Math.floor(rand() * 5)];
        const start = at(day, `${String(startHour).padStart(2, '0')}:${startMin}`);
        const end = addMinutes(start, duration);
        const taken = busy.get(charger.id) ?? [];
        if (taken.some(([s, e]) => start < e && s < end)) continue;
        taken.push([start, end]);
        busy.set(charger.id, taken);

        const who = customers[Math.floor(rand() * customers.length)];
        const startSoc = 10 + Math.floor(rand() * 30);
        const targetSoc = 70 + Math.floor(rand() * 26);
        const wanted = (batteryOf[who] * (targetSoc - startSoc)) / 100;
        const energy = round1(Math.min(wanted, Math.min(charger.power, 120) * 0.7 * (duration / 60)));
        const resId = addReservation(userIds[who], charger, start, end, 'completed');
        tx.run(
          `INSERT INTO charging_sessions (reservation_id, status, start_soc, target_soc, started_at, ended_at, energy_kwh, price_per_kwh, cost, progress_pct)
           VALUES (?, 'completed', ?, ?, ?, ?, ?, ?, ?, 100)`,
          [resId, startSoc, targetSoc, start, end, energy, charger.price, round2(energy * charger.price)]
        );
        if (who === 'ayse') lastCompleted = { resId, energy, cost: round2(energy * charger.price) };
      }
    }

    // ---- notifications ------------------------------------------------------------------
    const note = (userId, type, title, message, minutesAgo, isRead = 0, reservationId = null) =>
      tx.run(
        'INSERT INTO notifications (user_id, type, title, message, is_read, reservation_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, type, title, message, isRead, reservationId, utcStamp(new Date(now.getTime() - minutesAgo * 60_000))]
      );
    note(userIds.ayse, 'reservation_confirmed', 'Reservation confirmed', 'Your slot at VoltFlow Kızılay Hub (A2) tomorrow 18:00 is confirmed.', 25, 0, upcomingAyse);
    note(userIds.ayse, 'reservation_reminder', 'Upcoming reservation', 'Reminder: VoltFlow Teknokent (A1) the day after tomorrow at 08:00.', 90, 0, upcomingAyse2);
    note(userIds.ayse, 'slot_available', 'A slot opened up', 'Kızılay Hub A1 is free again tomorrow 16:00 to 17:00 after a cancellation.', 180, 0);
    note(userIds.ayse, 'reservation_cancelled', 'Reservation cancelled', 'Your reservation at VoltFlow Çankaya Park (A1) was cancelled.', 600, 1, cancelledAyse);
    if (lastCompleted) {
      note(userIds.ayse, 'session_completed', 'Charging completed (simulation)', `Your simulated session finished: ${lastCompleted.energy} kWh, ${lastCompleted.cost.toFixed(2)} EUR.`, 2880, 1, lastCompleted.resId);
    }
    note(userIds.can, 'reservation_confirmed', 'Reservation confirmed', 'Your slot at VoltFlow Kızılay Hub (A1) tomorrow 09:00 is confirmed.', 300, 0);
    note(userIds.elif, 'reservation_confirmed', 'Reservation confirmed', 'Your slot at VoltFlow Kızılay Hub (A1) tomorrow 10:30 is confirmed.', 420, 1);
    note(userIds.admin, 'system', 'Welcome to VoltFlow admin', 'Review stations, chargers, prices and usage statistics from the sidebar.', 60, 0);
  });
}
