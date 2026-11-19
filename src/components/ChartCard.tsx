import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Lightbulb, Zap, X, Check, Download } from 'lucide-react';
import { useToast } from '../ui/toast';
import { downloadCsv } from '../utils/download';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import type { Chart } from '../data/domains';

const PALETTE = ['#F39200', '#29B5E8', '#E30613', '#FFCC00', '#8B5CF6', '#22C55E'];
const tip = { contentStyle: { background: 'rgba(12,15,24,.92)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, backdropFilter: 'blur(12px)' }, labelStyle: { color: '#9aa3b5' } };
const axis = { stroke: '#5d6577', fontSize: 11, tickLine: false, axisLine: false };

function Viz({ c }: { c: Chart }) {
  const grid = <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />;
  if (c.kind === 'pie') return (
    <PieChart><Pie data={c.data} dataKey="v" nameKey="m" innerRadius="55%" outerRadius="85%" paddingAngle={3} stroke="none">
      {c.data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}</Pie>
      <Tooltip {...tip} /><Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} /></PieChart>);
  if (c.kind === 'bar') return (
    <BarChart data={c.data}>{grid}<XAxis dataKey="m" {...axis} /><YAxis {...axis} /><Tooltip {...tip} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
      {c.keys.map((k, i) => <Bar key={k} dataKey={k} fill={PALETTE[i]} radius={[6, 6, 0, 0]} />)}<Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} /></BarChart>);
  if (c.kind === 'line') return (
    <LineChart data={c.data}>{grid}<XAxis dataKey="m" {...axis} /><YAxis {...axis} domain={['auto', 'auto']} /><Tooltip {...tip} />
      {c.keys.map((k, i) => <Line key={k} dataKey={k} stroke={PALETTE[i]} strokeWidth={2.5} dot={false} strokeDasharray={/Meta|Plan/.test(k) ? '5 5' : undefined} />)}<Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} /></LineChart>);
  return (
    <AreaChart data={c.data}>
      <defs>{c.keys.map((k, i) => <linearGradient key={k} id={`g${c.id}${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={PALETTE[i]} stopOpacity={.45} /><stop offset="1" stopColor={PALETTE[i]} stopOpacity={0} /></linearGradient>)}</defs>
      {grid}<XAxis dataKey="m" {...axis} /><YAxis {...axis} /><Tooltip {...tip} />
      {c.keys.map((k, i) => <Area key={k} dataKey={k} stroke={PALETTE[i]} strokeWidth={2} fill={`url(#g${c.id}${i})`} strokeDasharray={/Plan/.test(k) ? '5 5' : undefined} />)}
      <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} /></AreaChart>);
}

export default function ChartCard({ c }: { c: Chart }) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'think' | 'done'>('idle');
  const [acted, setActed] = useState(false);
  const toast = useToast();
  const exportData = () => {
    const cols = ['m', ...c.keys];
    downloadCsv(c.title, [{ title: c.title, columns: cols, rows: c.data.map(r => Object.fromEntries(cols.map(k => [k === 'm' ? 'Período' : k, r[k]]))) }].map(s => ({ ...s, columns: s.columns.map(k => k === 'm' ? 'Período' : k) })));
    toast('download', 'Dados exportados', `${c.title} · ${c.data.length} linhas em CSV`);
  };
  const ask = () => { setOpen(true); if (phase === 'idle') { setPhase('think'); setTimeout(() => setPhase('done'), 1400); } };

  return (
    <div className="glass" style={{ padding: 22, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 14 }}>
        <div><div style={{ fontWeight: 600 }}>{c.title}</div><div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{c.subtitle}</div></div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={exportData} className="chip muted" title="Exportar dados (CSV)"><Download size={13} /></button>
          <button onClick={ask} className="chip" style={{ borderColor: 'rgba(41,181,232,.5)', color: '#7dd8f7' }}><Sparkles size={13} /> Cortex AI</button>
        </div>
      </div>
      <div style={{ height: 250 }}><ResponsiveContainer><Viz c={c} /></ResponsiveContainer></div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
            style={{ position: 'absolute', inset: 10, top: 56, borderRadius: 16, padding: 18, background: 'rgba(8,12,22,.92)', backdropFilter: 'blur(18px)', border: '1px solid rgba(41,181,232,.3)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="chip" style={{ color: '#7dd8f7' }}><Sparkles size={12} /> Análise Cortex · {c.title}</span>
              <button onClick={() => setOpen(false)}><X size={16} className="muted" /></button>
            </div>
            {phase === 'think' ? (
              <div className="muted" style={{ fontSize: 13 }}><div className="typing"><span /><span /><span /></div><div style={{ marginTop: 8 }}>A analisar {c.data.length} pontos com SNOWFLAKE.CORTEX…</div></div>
            ) : (
              <div style={{ display: 'grid', gap: 12, fontSize: 13, lineHeight: 1.55 }}>
                {[[Lightbulb, 'Insight', c.insight, '#FFCC00'], [TrendingUp, 'Previsão', c.forecast, '#29B5E8'], [Zap, 'Ação recomendada', c.action, '#F39200']].map(([I, t, txt, col], i) => {
                  const Icon = I as typeof Zap;
                  return (
                    <motion.div key={t as string} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .15 }} style={{ display: 'flex', gap: 10 }}>
                      <Icon size={16} color={col as string} style={{ flexShrink: 0, marginTop: 2 }} />
                      <div><b style={{ color: col as string }}>{t as string}</b><div>{txt as string}</div></div>
                    </motion.div>);
                })}
                <button className={acted ? 'btn-ghost' : 'btn'} style={{ justifySelf: 'start', padding: '8px 14px', fontSize: 13 }} onClick={() => { if (acted) return; setActed(true); toast('action', 'Ação enviada para aprovação', `${c.action} · atribuída ao responsável do domínio`); }}>
                  {acted ? <><Check size={14} /> Enviado para fluxo de aprovação</> : <><Zap size={14} /> Executar ação</>}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
