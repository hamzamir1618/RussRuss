import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { MENU, type Juice } from '../data/menu';
import { ADDRESS } from '../data/copy';

// The bag and the pickup order, in memory only. There is no ordering backend yet, so a refresh clears both.

export type Line = { key: string; juice: Juice; ml: number; price: number; qty: number };
export type Placed = { code: string; time: string; name: string; phone?: string; lines: Line[]; total: number };

type Ctx = {
  lines: Line[];
  count: number;
  total: number;
  /** Adds one of a juice; defaults to its 350 ml size. */
  add: (id: string, ml?: number) => void;
  setQty: (key: string, qty: number) => void;
  placed: Placed | null;
  place: (o: Omit<Placed, 'code' | 'lines' | 'total'>) => Placed;
  newOrder: () => void;
};

const BagContext = createContext<Ctx>({ lines: [], count: 0, total: 0, add: () => {}, setQty: () => {}, placed: null, place: () => ({ code: '', time: '', name: '', lines: [], total: 0 }), newOrder: () => {} });
export const useBag = () => useContext(BagContext);

export function BagProvider({ children }: { children: ReactNode }) {
  const [qty, setQtyMap] = useState<Record<string, number>>({});
  const [placed, setPlaced] = useState<Placed | null>(null);

  const add = useCallback((id: string, ml = 350) => setQtyMap(q => ({ ...q, [`${id}@${ml}`]: (q[`${id}@${ml}`] ?? 0) + 1 })), []);
  const setQty = useCallback((key: string, n: number) => setQtyMap(q => {
    const next = { ...q };
    if (n <= 0) delete next[key]; else next[key] = Math.min(n, 20);
    return next;
  }), []);

  const lines = useMemo<Line[]>(() => Object.entries(qty).flatMap(([key, n]) => {
    const [id, ml] = key.split('@');
    const juice = MENU.find(j => j.id === id), size = juice?.sizes.find(s => s.ml === +ml);
    return juice && size ? [{ key, juice, ml: size.ml, price: size.price, qty: n }] : [];
  }), [qty]);

  const value = useMemo<Ctx>(() => {
    const total = lines.reduce((a, l) => a + l.price * l.qty, 0);
    return {
      lines, total, count: lines.reduce((a, l) => a + l.qty, 0), add, setQty, placed,
      place: o => { const p = { ...o, code: makeCode(), lines, total }; setPlaced(p); setQtyMap({}); return p; },
      newOrder: () => setPlaced(null),
    };
  }, [lines, add, setQty, placed]);

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
}

function makeCode() {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'RR-' + Array.from({ length: 4 }, () => a[(Math.random() * a.length) | 0]).join('');
}

/** Opening hours in minutes after midnight (sample: 7 to 7 every day, matching data/pages.ts). */
export const OPEN = 7 * 60, CLOSE = 19 * 60;
export const openNow = (d = new Date()) => { const m = d.getHours() * 60 + d.getMinutes(); return m >= OPEN && m < CLOSE; };

/**
 * Pickup slots every 15 minutes, starting 20 minutes from now (time to press), until 15 minutes before close.
 * After that, tomorrow's slots. Returns ISO-ish `yyyy-mm-ddTHH:MM` strings.
 */
export function pickupSlots(now = new Date()) {
  for (let add = 0; add < 3; add++) {
    const day = new Date(now); day.setDate(now.getDate() + add); day.setHours(0, 0, 0, 0);
    const open = OPEN, close = CLOSE;
    const earliest = add === 0 ? now.getHours() * 60 + now.getMinutes() + 20 : open;
    const first = Math.max(open, Math.ceil(earliest / 15) * 15);
    const out: string[] = [];
    for (let m = first; m <= close - 15; m += 15) {
      const d = new Date(day); d.setMinutes(m);
      out.push(`${iso(d)}T${hhmm(d)}`);
    }
    if (out.length) return { day: add === 0 ? 'Today' : add === 1 ? 'Tomorrow' : day.toLocaleDateString('en-US', { weekday: 'long' }), slots: out };
  }
  return { day: 'Today', slots: [] };
}

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
const fromSlot = (s: string) => { const [d, t] = s.split('T'); const [y, mo, da] = d.split('-').map(Number); const [h, mi] = t.split(':').map(Number); return new Date(y, mo - 1, da, h, mi); };

/** "8:15 am" */
export const prettyTime = (slot: string) => fromSlot(slot).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
export const prettyDay = (slot: string) => {
  const d = fromSlot(slot), t = new Date(); t.setHours(0, 0, 0, 0);
  const diff = Math.round((new Date(d).setHours(0, 0, 0, 0) - t.getTime()) / 86400000);
  return diff === 0 ? 'today' : diff === 1 ? 'tomorrow' : d.toLocaleDateString('en-US', { weekday: 'long' });
};

/** A calendar file for the pickup, built in the browser. */
export function icsFor(p: Placed) {
  const start = fromSlot(p.time), end = new Date(start.getTime() + 15 * 60 * 1000);
  const f = (d: Date) => `${iso(d).replace(/-/g, '')}T${hhmm(d).replace(':', '')}00`;
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//RussRuss//Pickup//EN', 'BEGIN:VEVENT',
    `UID:${p.code}@russruss`, `DTSTART:${f(start)}`, `DTEND:${f(end)}`,
    `SUMMARY:Pick up juice at RussRuss (${p.code})`,
    `LOCATION:${ADDRESS.replace(/,/g, '\\,')}`, 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}
