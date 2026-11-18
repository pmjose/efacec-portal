import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid, Map, Bot, Table2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { domains, type Kpi } from '../data/domains';
import ChartCard from '../components/ChartCard';
import MapView from '../components/MapView';
import AgentFlow from '../components/AgentFlow';
import { Icon } from './Portal';

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

export default function DomainPage() {
  const { slug } = useParams();
  const d = domains.find(x => x.slug === slug);
  const [tab, setTab] = useState('geral');
  if (!d) return <Navigate to="/portal" />;
  const status = (s: string) => /Crít|Atras/.test(s) ? 'critico' : /Aviso|Aguarda/.test(s) ? 'aviso' : null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 54, height: 54, borderRadius: 16, display: 'grid', placeItems: 'center', background: d.color + '22', border: `1px solid ${d.color}55` }}><Icon name={d.icon} size={26} color={d.color} /></div>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>{d.name}</h1>
          <div className="muted">{d.tagline}</div>
        </div>
      </div>
      <div style={{ marginTop: 18 }}>
        <Tabs value={tab} onChange={setTab} tabs={[
          { id: 'geral', label: 'Visão geral', icon: <LayoutGrid size={15} /> },
          { id: 'mapa', label: 'Mapa de ativos', icon: <Map size={15} /> },
          { id: 'agentes', label: `Agentes (${d.agents.length})`, icon: <Bot size={15} /> },
          { id: 'dados', label: 'Operações', icon: <Table2 size={15} /> },
        ]} />
      </div>

      {tab === 'geral' && <>
        <div className="grid kpis">{d.kpis.map((k, i) => <KpiCard key={k.label} k={k} i={i} />)}</div>
        <div className="grid charts" style={{ marginTop: 18 }}>{d.charts.map(c => <ChartCard key={c.id} c={c} />)}</div>
      </>}

      {tab === 'mapa' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18 }}>
          <div className="glass" style={{ padding: 8 }}><MapView assets={d.assets} height={560} /></div>
          <div className="glass" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 576, overflowY: 'auto' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Ativos ({d.assets.length})</div>
            {d.assets.map(a => (
              <div key={a.name} style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500 }}><span className={`dot ${a.status}`} />{a.name}</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{a.type} · {a.detail}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'agentes' && <div className="grid charts">{d.agents.map(a => <AgentFlow key={a.id} a={a} />)}</div>}

      {tab === 'dados' && (
        <div className="glass" style={{ padding: 8 }}>
          <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between' }}>
            <b>{d.table.title}</b><span className="chip muted">Atualizado há 2 min · Dynamic Table</span>
          </div>
          <table className="t">
            <thead><tr>{d.table.columns.map(c => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>{d.table.rows.map((r, i) => <tr key={i}>{d.table.columns.map(c => {
              const s = status(r[c]);
              return <td key={c}>{s ? <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><span className={`dot ${s}`} />{r[c]}</span> : r[c]}</td>;
            })}</tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
