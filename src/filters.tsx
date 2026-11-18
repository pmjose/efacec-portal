import { createContext, useContext, useState } from 'react';
import type { Chart, Kpi } from './data/domains';

export type Filters = { period: '12M' | '6M' | '3M'; bu: string; region: string };
export const BUS = ['Todas as unidades', 'Energia', 'Mobilidade', 'Transportes', 'Serviços'];
export const REGIONS = ['Global', 'Portugal', 'Europa', 'Américas', 'África'];
const SHARE: Record<string, number> = {
  'Todas as unidades': 1, Energia: 0.63, Mobilidade: 0.17, Transportes: 0.09, Serviços: 0.11,
  Global: 1, Portugal: 0.31, Europa: 0.29, 'Américas': 0.24, 'África': 0.16,
};

const Ctx = createContext<{ f: Filters; set: (p: Partial<Filters>) => void }>({ f: { period: '12M', bu: BUS[0], region: REGIONS[0] }, set: () => {} });
export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const [f, setF] = useState<Filters>({ period: '12M', bu: BUS[0], region: REGIONS[0] });
  return <Ctx.Provider value={{ f, set: p => setF(x => ({ ...x, ...p })) }}>{children}</Ctx.Provider>;
}
export const useFilters = () => useContext(Ctx);
export const factor = (f: Filters) => SHARE[f.bu] * SHARE[f.region];
export const isFiltered = (f: Filters) => f.bu !== BUS[0] || f.region !== REGIONS[0];

// Ratios (%, índices, notas) não escalam com o filtro — só volumes.
const isRatio = (s: string) => /%|NPS|OEE|Precis|Hit|Uptime|taxa|TF|índice|Lead time|semanas|Risco|por |médi|Time-to|Ciclo|Idade|Cobertura|crític|risco|abert|Vagas|Concursos|Propostas em|Cargas|Tickets|Faltas/i.test(s);
const fmt = (n: number, dec: number) => n.toLocaleString('pt-PT', { minimumFractionDigits: dec, maximumFractionDigits: dec });

export function applyChart(c: Chart, f: Filters): Chart {
  const n = f.period === '12M' ? 12 : f.period === '6M' ? 6 : 3;
  const data = c.kind !== 'pie' && c.data.length === 12 ? c.data.slice(-n) : c.data;
  const k = isRatio(c.title) ? 1 : factor(f);
  if (k === 1 && data === c.data) return c;
  return { ...c, data: data.map(r => Object.fromEntries(Object.entries(r).map(([key, v]) => [key, typeof v === 'number' ? Math.round(v * k * 10) / 10 : v]))) };
}

export function applyKpi(kpi: Kpi, f: Filters): Kpi {
  const k = factor(f);
  if (k === 1 || isRatio(kpi.label) || /%|dias|\bh\b|\/100|ppm/.test(kpi.value)) return kpi;
  const m = kpi.value.match(/^(€?)(\d[\d\s.]*?(?:,\d+)?)(\s*\D.*|)$/);
  if (!m) return kpi;
  const num = parseFloat(m[2].replace(/[\s.]/g, '').replace(',', '.'));
  const dec = m[2].includes(',') ? m[2].split(',')[1].length : 0;
  return { ...kpi, value: `${m[1]}${fmt(num * k, dec)}${m[3]}` };
}
