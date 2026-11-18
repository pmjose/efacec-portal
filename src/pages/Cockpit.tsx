import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, UserCheck, LayoutGrid, Map, Inbox, Search, CheckCircle2 } from 'lucide-react';
import { modules, allAgents, dataProducts, type Insight } from '../data/modules';
import { domains } from '../data/domains';
import { KpiCard, Tabs } from '../ui/kit';
import { Insights } from '../components/Blocks';
import ChartCard from '../components/ChartCard';
import MapView from '../components/MapView';
import AgentFlow from '../components/AgentFlow';
import { applyChart, applyKpi, useFilters } from '../filters';
import { Icon } from './Portal';

const exec = [
  { label: 'Volume de negócios YTD', value: '€468 M', delta: '+16% a/a', up: true, good: true },
  { label: 'Encomendas YTD', value: '€531 M', delta: '+22% a/a', up: true, good: true },
  { label: 'Carteira (backlog)', value: '€1,12 mM', delta: '+21%', up: true, good: true },
  { label: 'EBITDA', value: '€52 M', delta: '11,1% margem', up: true, good: true },
];
const insightsAll = modules.flatMap(m => m.sections.flatMap(s => s.blocks.flatMap(b => b.t === 'insights' ? b.items : []))) as Insight[];
const topInsights = [...insightsAll.filter(i => i.sev === 'alta'), ...insightsAll.filter(i => i.sev !== 'alta')].slice(0, 3);
const approvals = allAgents.filter(a => a.mode === 'humano');

function ModuleTile({ slug, i }: { slug: string; i: number }) {
  const m = modules.find(x => x.slug === slug)!;
  const kpi = m.sections[0].blocks.find(b => b.t === 'kpis');
  const first = kpi && kpi.t === 'kpis' ? kpi.items[0] : null;
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .03 }} whileHover={{ y: -4 }}>
      <Link to={`/portal/${m.slug}`} className="glass" style={{ display: 'block', padding: 18, height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><Icon name={m.icon} color={m.color} size={20} /><ArrowRight size={15} className="muted" /></div>
        <div style={{ fontWeight: 600, marginTop: 12, fontSize: 15 }}>{m.name}</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{m.sections.length} áreas de análise</div>
        {first && <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 13, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          <span className="muted">{first.label}</span><b>{first.value}</b></div>}
      </Link>
    </motion.div>
  );
}

export default function Cockpit() {
  const [tab, setTab] = useState('geral');
  const { f } = useFilters();
  const fin = domains.find(d => d.slug === 'financas')!;
  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>Bom dia, Carlos.</h1>
      <div className="muted">Quarta-feira, 18 de novembro de 2026 · <Link to="/portal/decisoes" style={{ color: '#FFCC00' }}>{approvals.length} decisões aguardam aprovação</Link> · 3 alertas críticos</div>
      <div style={{ marginTop: 18 }}>
        <Tabs value={tab} onChange={setTab} tabs={[
          { id: 'geral', label: 'Resumo executivo', icon: <LayoutGrid size={15} /> },
          { id: 'mapa', label: 'Presença global', icon: <Map size={15} /> },
        ]} />
      </div>
      {tab === 'geral' && <div className="grid" style={{ gap: 18 }}>
        <div className="grid kpis">{exec.map((k, i) => <KpiCard key={k.label} k={applyKpi(k, f)} i={i} />)}</div>
        <Insights items={topInsights} />
        <div className="grid charts">
          <ChartCard c={applyChart(fin.charts[0], f)} />
          <div className="glass" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><b>Decisões pendentes</b><Link to="/portal/decisoes" className="chip" style={{ color: '#FFCC00' }}>Ver todas →</Link></div>
            {approvals.slice(0, 5).map(a => (
              <Link key={a.id} to="/portal/decisoes" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '11px 4px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                <UserCheck size={16} color="#FFCC00" />
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 500 }}>{a.name}</div><div className="muted" style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.module} · {a.impact}</div></div>
                <ArrowRight size={14} className="muted" />
              </Link>
            ))}
          </div>
        </div>
        <h3 style={{ marginTop: 14, fontWeight: 700 }}>Funções</h3>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>{modules.filter(m => m.group === 'funcoes').map((m, i) => <ModuleTile key={m.slug} slug={m.slug} i={i} />)}</div>
        <h3 style={{ marginTop: 14, fontWeight: 700 }}>Unidades de negócio</h3>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>{modules.filter(m => m.group === 'negocio').map((m, i) => <ModuleTile key={m.slug} slug={m.slug} i={i} />)}</div>
      </div>}
      {tab === 'mapa' && <div className="glass" style={{ padding: 8 }}><MapView assets={domains.flatMap(d => d.assets)} height={620} /></div>}
    </div>
  );
}

export function Decisions() {
  const [f, setF] = useState('humano');
  const list = allAgents.filter(a => f === 'todos' || a.mode === f);
  return (
    <div>
      <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em' }}>Decisões & Agentes</h1>
      <div className="muted">{allAgents.length} agentes em produção · {approvals.length} com humano no circuito · {allAgents.length - approvals.length} autónomos</div>
      <div style={{ marginTop: 18 }}>
        <Tabs value={f} onChange={setF} tabs={[
          { id: 'humano', label: `Aguardam aprovação (${approvals.length})`, icon: <Inbox size={15} /> },
          { id: 'auto', label: 'Autónomos', icon: <Bot size={15} /> },
          { id: 'todos', label: 'Todos', icon: <LayoutGrid size={15} /> },
        ]} />
      </div>
      <div className="grid charts">{list.map(a => <div key={a.id}><div className="chip muted" style={{ marginBottom: 8 }}>{a.module}</div><AgentFlow a={a} /></div>)}</div>
    </div>
  );
}

export function DataCatalog() {
  const [q, setQ] = useState('');
  const list = dataProducts.filter(d => (d.name + d.domain + d.source).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em' }}>Catálogo de Dados</h1>
      <div className="muted">Produtos de dados governados no Snowflake · base de todos os indicadores, modelos e agentes do Nexus</div>
      <div className="grid kpis" style={{ marginTop: 20 }}>
        {[['Produtos de dados', '142', '+18 este trimestre'], ['Fontes ligadas', '37', 'SAP, Salesforce, OT, IoT'], ['Qualidade média', '98,1%', '+0,6 pp'], ['Utilizadores ativos', '1 260', '+31%']].map(([l, v, d], i) =>
          <KpiCard key={l} i={i} k={{ label: l, value: v, delta: d, up: true, good: true }} />)}
      </div>
      <div className="glass" style={{ padding: 8, marginTop: 18 }}>
        <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <b>Produtos de dados certificados</b>
          <div className="search glass" style={{ minWidth: 260, padding: '7px 14px' }}><Search size={14} className="muted" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Filtrar…" /></div>
        </div>
        <table className="t">
          <thead><tr>{['Produto', 'Domínio', 'Responsável', 'Fonte', 'Frescura', 'Qualidade', 'Consumidores'].map(c => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>{list.map(d => <tr key={d.name}>
            <td style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 13 }}><CheckCircle2 size={13} color="#22c55e" style={{ verticalAlign: -2, marginRight: 6 }} />EFACEC_PROD.{d.name}</td>
            <td>{d.domain}</td><td>{d.owner}</td><td className="muted">{d.source}</td><td>{d.freshness}</td>
            <td><span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><span className={`dot ${d.quality > 98 ? 'ok' : 'aviso'}`} />{d.quality.toLocaleString('pt-PT')}%</span></td>
            <td>{d.consumers}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
