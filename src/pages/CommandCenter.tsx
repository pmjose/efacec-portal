import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid, Map, Bot, ArrowRight } from 'lucide-react';
import { domains } from '../data/domains';
import ChartCard from '../components/ChartCard';
import MapView from '../components/MapView';
import AgentFlow from '../components/AgentFlow';
import { KpiCard, Tabs } from './DomainPage';
import { Icon } from './Portal';

const exec = [
  { label: 'Volume de negócios YTD', value: '€468 M', delta: '+16% a/a', up: true, good: true },
  { label: 'Carteira total', value: '€1,12 mM', delta: '+21%', up: true, good: true },
  { label: 'Ativos críticos', value: '4', delta: 'em 9 domínios', up: true, good: false },
  { label: 'Valor Snowflake (anual)', value: '€14,7 M', delta: 'ROI 6,2×', up: true, good: true },
];
const allAssets = domains.flatMap(d => d.assets);
const allAgents = domains.flatMap(d => d.agents.map(a => ({ ...a, domain: d.short })));

export function AgentsPage() {
  const [f, setF] = useState('todos');
  const list = allAgents.filter(a => f === 'todos' || a.mode === f);
  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>Agentes & Aprovações</h1>
      <div className="muted">{allAgents.length} agentes ativos · {allAgents.filter(a => a.mode === 'humano').length} com humano no circuito</div>
      <div style={{ marginTop: 18 }}>
        <Tabs value={f} onChange={setF} tabs={[
          { id: 'todos', label: 'Todos', icon: <LayoutGrid size={15} /> },
          { id: 'humano', label: 'Humano no circuito', icon: <Bot size={15} /> },
          { id: 'auto', label: 'Autónomos', icon: <Bot size={15} /> },
        ]} />
      </div>
      <div className="grid charts">{list.map(a => <div key={a.id}><div className="chip muted" style={{ marginBottom: 8 }}>{a.domain}</div><AgentFlow a={a} /></div>)}</div>
    </div>
  );
}

export default function CommandCenter() {
  const [tab, setTab] = useState('geral');
  return (
    <div>
      <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em' }}>Bom dia, Carlos.</h1>
      <div className="muted">Quarta-feira, 18 de novembro de 2026 · 6 decisões aguardam a sua aprovação</div>
      <div style={{ marginTop: 18 }}>
        <Tabs value={tab} onChange={setTab} tabs={[
          { id: 'geral', label: 'Resumo executivo', icon: <LayoutGrid size={15} /> },
          { id: 'mapa', label: 'Presença global', icon: <Map size={15} /> },
          { id: 'agentes', label: 'Decisões pendentes', icon: <Bot size={15} /> },
        ]} />
      </div>
      {tab === 'geral' && <>
        <div className="grid kpis">{exec.map((k, i) => <KpiCard key={k.label} k={k} i={i} />)}</div>
        <div className="grid charts" style={{ marginTop: 18 }}>
          <ChartCard c={domains.find(d => d.slug === 'financas')!.charts[0]} />
          <ChartCard c={domains[0].charts[0]} />
        </div>
        <h3 style={{ margin: '34px 0 14px', fontWeight: 700 }}>Domínios</h3>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
          {domains.map((d, i) => (
            <motion.div key={d.slug} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .04 }} whileHover={{ y: -4 }}>
              <Link to={`/portal/${d.slug}`} className="glass" style={{ display: 'block', padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><Icon name={d.icon} color={d.color} size={22} /><ArrowRight size={16} className="muted" /></div>
                <div style={{ fontWeight: 600, marginTop: 14 }}>{d.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 13 }}>
                  <span className="muted">{d.kpis[0].label}</span><b>{d.kpis[0].value}</b>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </>}
      {tab === 'mapa' && <div className="glass" style={{ padding: 8 }}><MapView assets={allAssets} height={620} /></div>}
      {tab === 'agentes' && <div className="grid charts">{allAgents.filter(a => a.mode === 'humano').map(a => <AgentFlow key={a.id} a={a} />)}</div>}
    </div>
  );
}
