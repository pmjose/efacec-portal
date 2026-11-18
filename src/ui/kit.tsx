import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { Kpi } from '../data/domains';

export function KpiCard({ k, i }: { k: Kpi; i: number }) {
  const col = k.good ? '#22c55e' : '#f59e0b';
  return (
    <motion.div className="glass kpi" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .06 }}>
      <div className="muted" style={{ fontSize: 13 }}>{k.label}</div>
      <div className="v">{k.value}</div>
      <div style={{ fontSize: 12, color: col, display: 'flex', alignItems: 'center', gap: 4 }}>
        {k.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{k.delta}
      </div>
    </motion.div>
  );
}

export function Tabs({ tabs, value, onChange }: { tabs: { id: string; label: string; icon: React.ReactNode }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="glass tabs">
      {tabs.map(t => (
        <button key={t.id} className={`tab ${value === t.id ? 'on' : ''}`} onClick={() => onChange(t.id)} style={{ zIndex: 1 }}>
          {value === t.id && <motion.span layoutId="pill" className="pill" transition={{ type: 'spring', damping: 26, stiffness: 300 }} />}
          {t.icon}{t.label}
        </button>
      ))}
    </div>
  );
}
