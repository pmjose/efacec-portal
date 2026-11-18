import { motion } from 'framer-motion';
import { AlertTriangle, Info, AlertCircle, ArrowRight, Database } from 'lucide-react';
import type { Block, Insight } from '../data/modules';
import { KpiCard } from '../ui/kit';
import ChartCard from './ChartCard';
import MapView from './MapView';
import AgentFlow from './AgentFlow';
import { applyChart, applyKpi, useFilters } from '../filters';

const SEV = { alta: ['#ef4444', AlertTriangle, 'Prioridade alta'], media: ['#f59e0b', AlertCircle, 'Atenção'], info: ['#29B5E8', Info, 'Oportunidade'] } as const;

export function Insights({ items }: { items: Insight[] }) {
  return (
    <div className="glass" style={{ padding: 20 }}>
      <div style={{ fontWeight: 600, marginBottom: 14, display: 'flex', justifyContent: 'space-between' }}>Insights Cortex <span className="chip muted">Gerados há 12 min</span></div>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, 1fr)`, gap: 12 }}>
        {items.map((it, i) => {
          const [col, Icon, lbl] = SEV[it.sev];
          return (
            <motion.div key={it.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .08 }}
              style={{ padding: 16, borderRadius: 14, background: 'rgba(255,255,255,.035)', border: `1px solid ${col}33`, borderLeft: `3px solid ${col}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, color: col, textTransform: 'uppercase', letterSpacing: '.06em' }}><Icon size={13} /> {lbl}</div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{it.title}</div>
              <div className="muted" style={{ fontSize: 13, lineHeight: 1.5, flex: 1 }}>{it.text}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, marginTop: 4 }}>
                <span className="muted">{it.owner}</span>
                <button style={{ color: col, display: 'flex', gap: 4, alignItems: 'center', fontSize: 12 }}>{it.cta} <ArrowRight size={12} /></button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function Funnel({ title, stages }: { title: string; stages: [string, number, string][] }) {
  const max = stages[0][1];
  return (
    <div className="glass" style={{ padding: 22 }}>
      <div style={{ fontWeight: 600, marginBottom: 18 }}>{title}</div>
      <div style={{ display: 'grid', gap: 10 }}>
        {stages.map(([l, v, extra], i) => (
          <div key={l} style={{ display: 'grid', gridTemplateColumns: '170px 1fr 110px', alignItems: 'center', gap: 14, fontSize: 13 }}>
            <span className="muted">{l}</span>
            <div style={{ height: 30, borderRadius: 8, background: 'rgba(255,255,255,.04)', overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(v / max * 100, 4)}%` }} transition={{ delay: i * .1, duration: .8 }}
                style={{ height: '100%', borderRadius: 8, background: `linear-gradient(90deg, #E30613, #F39200 ${60 + i * 10}%, #FFCC00)`, opacity: 1 - i * .12, display: 'flex', alignItems: 'center', paddingLeft: 10, fontWeight: 600 }}>
                {String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')}
              </motion.div>
            </div>
            <span style={{ textAlign: 'right' }}>{extra}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const statusOf = (s: string) => /Crít|Atras|Cr[ií]tico|↓/.test(s) ? 'critico' : /Aviso|Aguarda|Em análise|risco/i.test(s) ? 'aviso' : /Baixo|Concluída|Fechada|Confirmada|↑/.test(s) ? 'ok' : null;

export function DataTable({ title, columns, rows, source }: { title: string; columns: string[]; rows: Record<string, string>[]; source?: string }) {
  return (
    <div className="glass" style={{ padding: 8 }}>
      <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <b>{title}</b>{source && <span className="chip muted"><Database size={12} /> {source}</span>}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="t">
          <thead><tr>{columns.map(c => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i}>{columns.map((c, j) => {
            const s = j > 0 ? statusOf(r[c]) : null;
            return <td key={c} style={j === 0 ? { fontWeight: 500 } : undefined}>{s ? <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><span className={`dot ${s}`} />{r[c]}</span> : r[c]}</td>;
          })}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

export default function Blocks({ blocks }: { blocks: Block[] }) {
  const { f } = useFilters();
  return (
    <div className="grid charts">
      {blocks.map((b, i) => {
        const full = { gridColumn: '1 / -1' };
        switch (b.t) {
          case 'kpis': return <div key={i} className="grid kpis" style={full}>{b.items.map((k, j) => <KpiCard key={k.label} k={applyKpi(k, f)} i={j} />)}</div>;
          case 'chart': return <div key={i} style={b.span ? full : undefined}><ChartCard c={applyChart(b.c, f)} /></div>;
          case 'table': return <div key={i} style={b.span ? full : undefined}><DataTable {...b} /></div>;
          case 'insights': return <div key={i} style={full}><Insights items={b.items} /></div>;
          case 'funnel': return <div key={i} style={b.span ? full : undefined}><Funnel {...b} /></div>;
          case 'map': return (
            <div key={i} className="glass" style={{ padding: 8, ...full }}>
              <div style={{ padding: '10px 12px 12px', display: 'flex', justifyContent: 'space-between' }}><b>{b.title}</b>
                <span style={{ display: 'flex', gap: 12, fontSize: 12 }} className="muted">{(['ok', 'aviso', 'critico'] as const).map(s => <span key={s} style={{ display: 'flex', gap: 6, alignItems: 'center' }}><span className={`dot ${s}`} />{b.assets.filter(a => a.status === s).length} {s === 'ok' ? 'operacional' : s === 'aviso' ? 'aviso' : 'crítico'}</span>)}</span>
              </div>
              <MapView assets={b.assets} height={440} />
            </div>);
          case 'agents': return <div key={i} className="grid charts" style={full}>{b.items.map(a => <AgentFlow key={a.id} a={a} />)}</div>;
        }
      })}
    </div>
  );
}
