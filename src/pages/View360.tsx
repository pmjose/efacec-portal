import { useMemo, useState } from 'react';
import { Link, useParams, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import * as I from 'lucide-react';
import { customers, employees, assets, findCustomer, findEmployee, findAsset, KIND_LABEL, type Status, type Asset } from '../data/c360';
import { KpiCard, Tabs } from '../ui/kit';
import ChartCard from '../components/ChartCard';
import MapView from '../components/MapView';
import Schematic from '../components/Schematic';
import { DataTable } from '../components/Blocks';
import { useToast } from '../ui/toast';
import { downloadPdf, type PdfLine } from '../utils/download';

const H = (t: string): PdfLine => ({ text: t, size: 13, bold: true, gap: 4 });
const B = (t: string, gap = 0): PdfLine => ({ text: t, gap });
const sp: PdfLine = { text: '', gap: 6 };
function ReportBtn({ onClick }: { onClick: () => void }) {
  return <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }} onClick={onClick}><I.FileDown size={14} /> Relatório 360</button>;
}
function NbaButton({ title, value }: { title: string; value: string }) {
  const toast = useToast();
  const [st, setSt] = useState<'idle' | 'run' | 'done'>('idle');
  const go = () => {
    if (st !== 'idle') return;
    setSt('run');
    setTimeout(() => { setSt('done'); toast('action', 'Próxima melhor ação iniciada', `${title} · tarefa criada no Salesforce e atribuída ao gestor de conta (${value})`); }, 900);
  };
  return <button className={st === 'done' ? 'btn-ghost' : 'btn'} style={{ padding: '6px 12px', fontSize: 12 }} onClick={go}>
    {st === 'idle' ? 'Executar' : st === 'run' ? <><I.Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> A executar…</> : <><I.Check size={12} /> Em curso</>}
  </button>;
}

const SC: Record<Status, string> = { ok: '#22c55e', aviso: '#f59e0b', critico: '#ef4444' };
const SL: Record<Status, string> = { ok: 'Operacional', aviso: 'Atenção', critico: 'Crítico' };
const tip = { contentStyle: { background: 'rgba(12,15,24,.92)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12 }, labelStyle: { color: '#9aa3b5' } };
const healthCol = (v: number) => v >= 80 ? '#22c55e' : v >= 60 ? '#f59e0b' : '#ef4444';

export function Ring({ v, label, size = 92, color }: { v: number; label: string; size?: number; color?: string }) {
  const r = size / 2 - 7, C = 2 * Math.PI * r, col = color ?? healthCol(v);
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,.08)" strokeWidth={7} fill="none" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} stroke={col} strokeWidth={7} fill="none" strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
          strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - v / 100) }} transition={{ duration: 1.2, ease: 'easeOut' }} style={{ filter: `drop-shadow(0 0 6px ${col})` }} />
        <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={size / 4} fontWeight={700}>{v}</text>
      </svg>
      <div className="muted" style={{ fontSize: 11, marginTop: -2 }}>{label}</div>
    </div>
  );
}
const Card = ({ title, children, right, style }: { title?: string; children: React.ReactNode; right?: React.ReactNode; style?: React.CSSProperties }) => (
  <div className="glass" style={{ padding: 20, ...style }}>
    {title && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}><b>{title}</b>{right}</div>}
    {children}
  </div>
);
const Pill = ({ s, children }: { s: Status; children?: React.ReactNode }) => <span className="chip" style={{ borderColor: SC[s] + '66', color: SC[s] }}><span className={`dot ${s}`} />{children ?? SL[s]}</span>;
const Avatar = ({ t, size = 40, grad = true }: { t: string; size?: number; grad?: boolean }) =>
  <div style={{ width: size, height: size, borderRadius: size > 60 ? 22 : '50%', background: grad ? 'var(--grad)' : 'rgba(255,255,255,.1)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: size / 2.8, flexShrink: 0 }}>{t}</div>;
const Field = ({ k, v }: { k: string; v: React.ReactNode }) => <div><div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em' }}>{k}</div><div style={{ fontSize: 14, marginTop: 3 }}>{v}</div></div>;
const two: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 };
const H1 = ({ children }: { children: React.ReactNode }) => <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em' }}>{children}</h1>;

function AssetCard({ a }: { a: Asset }) {
  const cu = findCustomer(a.customer);
  return (
    <motion.div whileHover={{ y: -4 }}>
      <Link to={`/portal/360/ativos/${a.id}`} className="glass" style={{ display: 'block', padding: 16, borderLeft: `3px solid ${SC[a.status]}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <span className="chip muted" style={{ fontSize: 11 }}>{KIND_LABEL[a.kind]}</span><span className={`dot ${a.status}`} style={{ marginTop: 6 }} />
        </div>
        <div style={{ fontWeight: 600, marginTop: 10, fontSize: 15 }}>{a.name}</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 3, fontFamily: 'ui-monospace, Menlo, monospace' }}>{a.id} · {a.model}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: 12 }}>
          <span className="muted">{cu?.name.split(' — ')[0]} · {a.site.split(' · ')[0]}</span><b style={{ color: healthCol(a.health) }}>Saúde {a.health}</b>
        </div>
      </Link>
    </motion.div>
  );
}

function Timeline({ items }: { items: { date: string; title: React.ReactNode; text: string; icon: React.ReactNode; color: string }[] }) {
  return <div>{items.map((t, i) => (
    <div key={i} style={{ display: 'flex', gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center', background: t.color + '22', border: `1px solid ${t.color}66`, color: t.color }}>{t.icon}</div>
        {i < items.length - 1 && <div style={{ width: 1, flex: 1, background: 'var(--border)', minHeight: 16 }} />}
      </div>
      <div style={{ paddingBottom: 18, flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13 }}><b>{t.title}</b><span className="muted" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{t.date}</span></div>
        <div className="muted" style={{ fontSize: 13, marginTop: 3, lineHeight: 1.5 }}>{t.text}</div>
      </div>
    </div>))}</div>;
}

function ListHeader({ title, sub, q, setQ, icon }: { title: string; sub: string; q: string; setQ: (s: string) => void; icon: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 22, gap: 16 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ width: 54, height: 54, borderRadius: 16, display: 'grid', placeItems: 'center', background: 'rgba(41,181,232,.12)', border: '1px solid rgba(41,181,232,.35)', color: '#7dd8f7' }}>{icon}</div>
        <div><H1>{title}</H1><div className="muted">{sub}</div></div>
      </div>
      <div className="glass search" style={{ minWidth: 300 }}><I.Search size={15} className="muted" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Filtrar…" /></div>
    </div>
  );
}

/* ══════════════════════════ CLIENTE 360 ══════════════════════════ */
export function CustomerList() {
  const [q, setQ] = useState('');
  const list = customers.filter(c => (c.name + c.segment + c.country).toLowerCase().includes(q.toLowerCase()));
  return <div>
    <ListHeader title="Cliente 360" sub={`${customers.length} contas estratégicas e chave · vendas, carteira, base instalada, serviço e relação`} q={q} setQ={setQ} icon={<I.Building2 size={26} />} />
    <div className="grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
      {list.map((c, i) => {
        const n = assets.filter(a => a.customer === c.id);
        return <motion.div key={c.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .05 }} whileHover={{ y: -4 }}>
          <Link to={`/portal/360/clientes/${c.id}`} className="glass" style={{ display: 'block', padding: 20 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, display: 'grid', placeItems: 'center', fontWeight: 800, background: 'rgba(255,255,255,.08)', border: '1px solid var(--border)' }}>{c.logo}</div>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600 }}>{c.name.split(' — ')[0]}</div><div className="muted" style={{ fontSize: 12 }}>{c.segment}</div></div>
              <Ring v={c.health} label="saúde" size={58} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              <Field k="Vendas 12m" v={<b>{c.revenue12m}</b>} /><Field k="Carteira" v={<b>{c.backlog}</b>} /><Field k="NPS" v={<b>{c.nps}</b>} />
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
              <span className="chip" style={{ fontSize: 11 }}><I.Flag size={11} /> {c.country}</span><span className="chip" style={{ fontSize: 11, color: '#FFCC00' }}>{c.tier}</span>
              <span className="chip muted" style={{ fontSize: 11 }}>{n.length} {n.length === 1 ? 'ativo monitorizado' : 'ativos monitorizados'}</span>
              {n.some(a => a.status === 'critico') && <Pill s="critico">Ativo crítico</Pill>}
            </div>
          </Link>
        </motion.div>;
      })}
    </div>
  </div>;
}

const KIND_ICON = { reuniao: [I.Users, '#29B5E8'], encomenda: [I.ShoppingBag, '#22c55e'], servico: [I.Wrench, '#10B981'], alerta: [I.Sparkles, '#F39200'], proposta: [I.FileSignature, '#A855F7'] } as const;

export function CustomerDetail() {
  const { id } = useParams();
  const c = findCustomer(id);
  const [tab, setTab] = useState('geral');
  const toast = useToast();
  if (!c) return <Navigate to="/portal/360/clientes" replace />;
  const own = assets.filter(a => a.customer === c.id);
  const mgr = findEmployee(c.manager);
  const team = employees.filter(e => e.customers.includes(c.id));
  const report = () => {
    downloadPdf(`Cliente360_${c.name.split(' — ')[0]}`, `Cliente 360 — ${c.name}`, `${c.segment} · ${c.hq}, ${c.country} · cliente desde ${c.since}`, [
      H('Resumo da conta'), B(`Tier: ${c.tier}   ·   Saúde da conta: ${c.health}/100   ·   NPS: ${c.nps}`), B(`Gestor de conta: ${mgr?.name ?? '—'}`),
      B(`Vendas 12 meses: ${c.revenue12m}   ·   Carteira: ${c.backlog}   ·   Em aberto: ${c.openAR} (DSO ${c.dso} dias)   ·   Margem: ${c.margin}`, 8),
      H('Próximas melhores ações (Cortex)'), ...c.nba.flatMap(n => [{ text: `${n.title} — ${n.value}`, bold: true }, B(n.text, 4)]), sp,
      H('Riscos'), ...c.risks.map(x => B(`•  ${x}`)), sp,
      H('Base instalada monitorizada'), ...own.map(a => B(`•  ${a.id} — ${a.name} · ${a.site} · saúde ${a.health} · ${SL[a.status]}`)), sp,
      H('Contratos'), ...c.contracts.map(([id, o, v, d]) => B(`•  ${id} — ${o} · ${v} · fim ${d}`)), sp,
      H('Oportunidades'), ...c.opportunities.map(([o, v, f, p]) => B(`•  ${o} · ${v} · ${f} · ${p}`)), sp,
      H('Serviço'), ...c.tickets.map(([id, d, e]) => B(`•  ${id} — ${d} · ${e}`)), sp,
      H('Atividade recente'), ...c.timeline.map(t => B(`${t.date} · ${t.who}: ${t.text}`)), sp,
      H('Contactos'), ...c.contacts.map(([n, r, p]) => B(`•  ${n} — ${r} (${p})`)),
    ]);
    toast('download', 'Relatório Cliente 360 gerado', c.name);
  };
  return <div>
    <div className="glass" style={{ padding: 24, display: 'flex', gap: 22, alignItems: 'center' }}>
      <div style={{ width: 80, height: 80, borderRadius: 22, display: 'grid', placeItems: 'center', fontSize: 26, fontWeight: 800, background: 'linear-gradient(135deg, rgba(255,255,255,.14), rgba(255,255,255,.04))', border: '1px solid var(--border)' }}>{c.logo}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}><span className="chip" style={{ color: '#FFCC00', fontSize: 11 }}>{c.tier}</span><span className="chip muted" style={{ fontSize: 11 }}>Cliente desde {c.since}</span></div>
        <H1>{c.name}</H1>
        <div className="muted" style={{ marginTop: 2 }}>{c.segment} · {c.hq}, {c.country}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {mgr && <Link to={`/portal/360/colaboradores/${mgr.id}`} className="chip"><Avatar t={mgr.initials} size={18} /> Gestor de conta: {mgr.name}</Link>}
          <span className="chip muted"><I.Database size={11} /> Salesforce · SAP SD · SAP CS</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}><Ring v={c.health} label="Saúde da conta" /><Ring v={c.nps} label="NPS" color="#29B5E8" /><ReportBtn onClick={report} /></div>
    </div>
    <div className="grid" style={{ gridTemplateColumns: 'repeat(5,1fr)', marginTop: 18 }}>
      {[['Vendas 12 meses', c.revenue12m, 'SAP SD · faturado'], ['Carteira', c.backlog, 'por entregar'], ['Em aberto', c.openAR, `DSO ${c.dso} dias`], ['Margem bruta', c.margin, '12 meses'], ['Ativos monitorizados', String(own.length), `${own.filter(a => a.status !== 'ok').length} com alertas`]].map(([l, v, d], i) =>
        <KpiCard key={l} i={i} k={{ label: l, value: v, delta: d, up: true, good: !(l === 'Em aberto' && c.dso > 70) && !(l.startsWith('Ativos') && own.some(a => a.status === 'critico')) }} />)}
    </div>
    <div style={{ marginTop: 18 }}><Tabs value={tab} onChange={setTab} tabs={[
      { id: 'geral', label: 'Visão geral', icon: <I.LayoutGrid size={15} /> },
      { id: 'ativos', label: `Produtos & Ativos (${own.length})`, icon: <I.Cpu size={15} /> },
      { id: 'comercial', label: 'Contratos & Oportunidades', icon: <I.FileText size={15} /> },
      { id: 'servico', label: `Serviço (${c.tickets.length})`, icon: <I.Wrench size={15} /> },
      { id: 'relacao', label: 'Relação', icon: <I.Users size={15} /> },
    ]} /></div>

    {tab === 'geral' && <div className="grid" style={{ gap: 18 }}>
      <Card title="Próximas melhores ações · Cortex" right={<span className="chip" style={{ color: '#7dd8f7' }}><I.Sparkles size={12} /> IA</span>}>
        <div className="grid" style={{ gridTemplateColumns: `repeat(${c.nba.length + 1},1fr)`, gap: 12 }}>
          {c.nba.map(n => <div key={n.title} style={{ padding: 16, borderRadius: 14, background: 'rgba(41,181,232,.06)', border: '1px solid rgba(41,181,232,.25)' }}>
            <div style={{ fontWeight: 600 }}>{n.title}</div><div className="muted" style={{ fontSize: 13, margin: '6px 0 10px', lineHeight: 1.5 }}>{n.text}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><b style={{ color: '#22c55e', fontSize: 13 }}>{n.value}</b><NbaButton title={n.title} value={n.value} /></div>
          </div>)}
          <div style={{ padding: 16, borderRadius: 14, background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.25)' }}>
            <div style={{ fontWeight: 600, display: 'flex', gap: 6, alignItems: 'center' }}><I.AlertTriangle size={15} color="#ef4444" /> Riscos</div>
            <ul style={{ margin: '10px 0 0 16px', fontSize: 13, lineHeight: 1.7 }} className="muted">{c.risks.map(r => <li key={r}>{r}</li>)}</ul>
          </div>
        </div>
      </Card>
      <div style={two}>
        <ChartCard c={{ id: 'cr-' + c.id, title: 'Vendas por tipo (€M)', subtitle: '2021–2026', kind: 'bar', keys: ['Produtos', 'Serviços', 'Projetos'], data: c.revenue,
          insight: `Serviços representam ${Math.round(c.mix.find(m => /Serv|Contrat|Manut/.test(m.m))?.v ?? 12)}% do mix — abaixo do potencial para a base instalada.`, forecast: `Crescimento previsto de ${c.health > 70 ? '12' : '4'}% em 2027.`, action: c.nba[0].title }} />
        <ChartCard c={{ id: 'cm-' + c.id, title: 'Mix de produtos e serviços (%)', subtitle: 'Últimos 12 meses', kind: 'pie', keys: ['v'], data: c.mix,
          insight: `${c.mix[0].m} domina com ${c.mix[0].v}% das vendas.`, forecast: 'Oportunidade de cross-sell em monitorização e serviços digitais.', action: 'Gerar proposta de serviços para a base instalada.' }} />
      </div>
      <div style={two}>
        <Card title="Atividade recente"><Timeline items={c.timeline.map(t => { const [Ic, col] = KIND_ICON[t.kind]; return { date: t.date, title: t.who, text: t.text, icon: <Ic size={14} />, color: col }; })} /></Card>
        <Card title="Ativos com alertas">{own.filter(a => a.status !== 'ok').length ? <div className="grid" style={{ gap: 10 }}>{own.filter(a => a.status !== 'ok').map(a => <AssetCard key={a.id} a={a} />)}</div> : <div className="muted" style={{ fontSize: 14 }}>Sem alertas na base instalada.</div>}</Card>
      </div>
    </div>}

    {tab === 'ativos' && <div className="grid" style={{ gap: 18 }}>
      <div className="glass" style={{ padding: 8 }}><MapView assets={own.map(a => ({ name: a.name, type: a.id, lat: a.lat, lng: a.lng, status: a.status, detail: `${a.site} · saúde ${a.health}` }))} height={380} /></div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>{own.map(a => <AssetCard key={a.id} a={a} />)}</div>
    </div>}

    {tab === 'comercial' && <div className="grid" style={{ gap: 18 }}>
      <DataTable title="Contratos" source="SAP CS · Salesforce" columns={['Contrato', 'Objeto', 'Valor', 'Fim', 'Estado']}
        rows={c.contracts.map(([a, b, v, d, s]) => ({ Contrato: a, Objeto: b, Valor: v, Fim: d, Estado: s === 'ok' ? 'Baixo' : s === 'aviso' ? 'Aviso' : 'Crítico' }))} />
      <DataTable title="Oportunidades abertas" source="Salesforce · Opportunity" columns={['Oportunidade', 'Valor', 'Fase', 'Probabilidade']}
        rows={c.opportunities.map(([a, b, f, p]) => ({ Oportunidade: a, Valor: b, Fase: f, Probabilidade: p }))} />
    </div>}

    {tab === 'servico' && <DataTable title="Pedidos de serviço e alertas" source="Salesforce Field Service · Nexus Alerts" columns={['Ticket', 'Descrição', 'Estado']}
      rows={c.tickets.map(([a, b, e, s]) => ({ Ticket: a, 'Descrição': b, Estado: s === 'critico' ? `Crítico · ${e}` : s === 'aviso' ? `Aviso · ${e}` : e }))} />}

    {tab === 'relacao' && <div style={two}>
      <Card title="Contactos do cliente">{c.contacts.map(([n, r, p]) => <div key={n} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
        <Avatar t={n.replace(/^(Eng\.ª?|Dr\.) /, '').split(' ').map(x => x[0]).slice(0, 2).join('')} size={36} grad={false} />
        <div style={{ flex: 1 }}><div style={{ fontWeight: 500 }}>{n}</div><div className="muted" style={{ fontSize: 12 }}>{r}</div></div><span className="chip" style={{ fontSize: 11 }}>{p}</span></div>)}</Card>
      <Card title="Equipa Efacec na conta">{team.map(e => <Link key={e.id} to={`/portal/360/colaboradores/${e.id}`} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
        <Avatar t={e.initials} size={36} /><div style={{ flex: 1 }}><div style={{ fontWeight: 500 }}>{e.name}</div><div className="muted" style={{ fontSize: 12 }}>{e.role}</div></div><I.ChevronRight size={15} className="muted" /></Link>)}</Card>
    </div>}
  </div>;
}

/* ══════════════════════════ COLABORADOR 360 ══════════════════════════ */
export function EmployeeList() {
  const [q, setQ] = useState('');
  const list = employees.filter(e => (e.name + e.role + e.unit).toLowerCase().includes(q.toLowerCase()));
  return <div>
    <ListHeader title="Colaborador 360" sub="Perfil, competências, certificações, desempenho e atribuições · acesso restrito a chefias e RH" q={q} setQ={setQ} icon={<I.IdCard size={26} />} />
    <div className="grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
      {list.map((e, i) => <motion.div key={e.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .05 }} whileHover={{ y: -4 }}>
        <Link to={`/portal/360/colaboradores/${e.id}`} className="glass" style={{ display: 'block', padding: 20 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}><Avatar t={e.initials} size={52} />
            <div><div style={{ fontWeight: 600 }}>{e.name}</div><div className="muted" style={{ fontSize: 12 }}>{e.role}</div></div></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            <Field k="Unidade" v={<span style={{ fontSize: 12 }}>{e.unit.split(' & ')[0]}</span>} /><Field k="Local" v={<span style={{ fontSize: 12 }}>{e.site.split(' · ')[0]}</span>} /><Field k="Antiguidade" v={<span style={{ fontSize: 12 }}>{2026 - e.since} anos</span>} />
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
            {e.skills.slice().sort((a, b) => b.v - a.v).slice(0, 2).map(s => <span key={s.s} className="chip" style={{ fontSize: 11 }}>{s.s}</span>)}
            {e.certs.some(c => c[2] !== 'ok') && <Pill s="aviso">Certificação a expirar</Pill>}
          </div>
        </Link>
      </motion.div>)}
    </div>
  </div>;
}

export function EmployeeDetail() {
  const { id } = useParams();
  const e = findEmployee(id);
  const [tab, setTab] = useState('perfil');
  const toast = useToast();
  if (!e) return <Navigate to="/portal/360/colaboradores" replace />;
  const risk = { Baixo: 'ok', 'Médio': 'aviso', Alto: 'critico' }[e.wellbeing.flightRisk] as Status;
  const report = () => {
    downloadPdf(`Colaborador360_${e.name}`, `Colaborador 360 — ${e.name}`, `${e.role} · ${e.unit} · CONFIDENCIAL — uso restrito a chefia e RH`, [
      H('Perfil'), B(`Local: ${e.site}   ·   Chefia: ${e.manager}   ·   Grau: ${e.grade}   ·   ${e.type}`), B(`Na Efacec desde ${e.since} (${2026 - e.since} anos)   ·   Línguas: ${e.languages}`, 8),
      H('Indicadores'), ...e.kpis.map(([l, v]) => B(`•  ${l}: ${v}`)), sp,
      H('Competências (0–100)'), ...e.skills.map(x => B(`•  ${x.s}: ${x.v}`)), sp,
      H('Certificações'), ...e.certs.map(([n, d, st]) => B(`•  ${n} — validade ${d}${st !== 'ok' ? '  (renovar)' : ''}`)), sp,
      H('Formação recente'), ...e.training.map(([n, d, dt]) => B(`•  ${n} · ${d} · ${dt}`)), sp,
      H('Percurso'), ...e.career.map(x => B(`•  ${x.year} — ${x.role}`)), sp,
      H('Atribuições ativas'), ...e.assignments.map(([a, b, c]) => B(`•  ${a} — ${b} (${c})`)), sp,
      H('Desempenho'), ...e.performance.map(p => B(`•  ${p.m}: ${p['Avaliação']} (média ${p['Média']})`)),
    ]);
    toast('download', 'Relatório Colaborador 360 gerado', `${e.name} · documento confidencial`);
  };
  return <div>
    <div className="glass" style={{ padding: 24, display: 'flex', gap: 22, alignItems: 'center' }}>
      <Avatar t={e.initials} size={84} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}><span className="chip muted" style={{ fontSize: 11 }}>{e.grade}</span><span className="chip muted" style={{ fontSize: 11 }}>{e.type}</span><span className="chip" style={{ fontSize: 11, color: '#A855F7' }}><I.Lock size={11} /> Confidencial · RH</span></div>
        <H1>{e.name}</H1>
        <div className="muted">{e.role} · {e.unit}</div>
        <div style={{ display: 'flex', gap: 28, marginTop: 14 }}>
          <Field k="Local" v={e.site} /><Field k="Chefia" v={e.manager} /><Field k="Na Efacec desde" v={`${e.since} (${2026 - e.since} anos)`} /><Field k="Línguas" v={e.languages} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}><ReportBtn onClick={report} /><Ring v={e.wellbeing.engagement} label="Envolvimento" color="#A855F7" /><Ring v={Math.round(e.performance.at(-1)!['Avaliação'] * 20)} label="Desempenho" /></div>
    </div>
    <div className="grid kpis" style={{ marginTop: 18 }}>
      {e.kpis.map(([l, v], i) => <KpiCard key={l} i={i} k={{ label: l, value: v, delta: '12 meses', up: true, good: true }} />)}
      <KpiCard i={3} k={{ label: 'Certificações válidas', value: `${e.certs.filter(c => c[2] === 'ok').length}/${e.certs.length}`, delta: e.certs.some(c => c[2] !== 'ok') ? '1 a expirar' : 'todas em dia', up: true, good: !e.certs.some(c => c[2] !== 'ok') }} />
    </div>
    <div style={{ marginTop: 18 }}><Tabs value={tab} onChange={setTab} tabs={[
      { id: 'perfil', label: 'Perfil & Carreira', icon: <I.User size={15} /> },
      { id: 'comp', label: 'Competências & Certificações', icon: <I.Award size={15} /> },
      { id: 'desemp', label: 'Desempenho', icon: <I.TrendingUp size={15} /> },
      { id: 'atrib', label: 'Atribuições', icon: <I.Briefcase size={15} /> },
      { id: 'bem', label: 'Bem-estar & Retenção', icon: <I.HeartPulse size={15} /> },
    ]} /></div>

    {tab === 'perfil' && <div style={two}>
      <Card title="Mapa de competências">
        <div style={{ height: 300 }}><ResponsiveContainer><RadarChart data={e.skills}><PolarGrid stroke="rgba(255,255,255,.1)" /><PolarAngleAxis dataKey="s" tick={{ fill: '#9aa3b5', fontSize: 11 }} />
          <Radar dataKey="v" stroke="#F39200" fill="#F39200" fillOpacity={.3} strokeWidth={2} /><Tooltip {...tip} /></RadarChart></ResponsiveContainer></div>
      </Card>
      <Card title="Percurso na Efacec"><Timeline items={e.career.slice().reverse().map((c, i) => ({ date: c.year, title: c.role, text: i === 0 ? 'Função atual' : 'Função anterior', icon: <I.ArrowUpRight size={14} />, color: i === 0 ? '#F39200' : '#29B5E8' }))} /></Card>
    </div>}

    {tab === 'comp' && <div style={two}>
      <Card title="Competências (0–100)">{e.skills.map(s => <div key={s.s} style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}><span>{s.s}</span><b>{s.v}</b></div>
        <div style={{ height: 6, borderRadius: 6, background: 'rgba(255,255,255,.06)' }}><motion.div initial={{ width: 0 }} animate={{ width: `${s.v}%` }} transition={{ duration: .8 }} style={{ height: '100%', borderRadius: 6, background: 'var(--grad)' }} /></div>
      </div>)}</Card>
      <div className="grid" style={{ gap: 18 }}>
        <DataTable title="Certificações" source="Academia Efacec" columns={['Certificação', 'Validade', 'Estado']} rows={e.certs.map(([n, d, s]) => ({ 'Certificação': n, Validade: d, Estado: s === 'ok' ? 'Válida' : 'Aviso · renovar' }))} />
        <DataTable title="Formação recente" source="LMS" columns={['Curso', 'Duração', 'Data']} rows={e.training.map(([a, b, c]) => ({ Curso: a, 'Duração': b, Data: c }))} />
      </div>
    </div>}

    {tab === 'desemp' && <Card title="Avaliação anual de desempenho (1–5)">
      <div style={{ height: 300 }}><ResponsiveContainer><AreaChart data={e.performance}><defs><linearGradient id="pf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F39200" stopOpacity={.4} /><stop offset="1" stopColor="#F39200" stopOpacity={0} /></linearGradient></defs>
        <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} /><XAxis dataKey="m" stroke="#5d6577" fontSize={11} tickLine={false} axisLine={false} /><YAxis domain={[2, 5]} stroke="#5d6577" fontSize={11} tickLine={false} axisLine={false} /><Tooltip {...tip} />
        <Area dataKey="Avaliação" stroke="#F39200" fill="url(#pf)" strokeWidth={2.5} /><Area dataKey="Média" stroke="#29B5E8" fill="none" strokeDasharray="5 5" /><Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} /></AreaChart></ResponsiveContainer></div>
    </Card>}

    {tab === 'atrib' && <div className="grid" style={{ gap: 18 }}>
      <DataTable title="Atribuições ativas" source="Salesforce · SAP PS" columns={['Referência', 'Descrição', 'Estado']} rows={e.assignments.map(([a, b, c]) => ({ 'Referência': a, 'Descrição': b, Estado: c }))} />
      <div style={two}>
        <Card title={`Clientes (${e.customers.length})`}>{e.customers.map(id => { const c = findCustomer(id)!; return <Link key={id} to={`/portal/360/clientes/${id}`} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12, background: 'rgba(255,255,255,.08)' }}>{c.logo}</div><div style={{ flex: 1 }}>{c.name.split(' — ')[0]}<div className="muted" style={{ fontSize: 12 }}>{c.segment}</div></div><I.ChevronRight size={15} className="muted" /></Link>; })}</Card>
        <Card title={`Ativos acompanhados (${e.assets.length})`}>{e.assets.length ? <div className="grid" style={{ gap: 10 }}>{e.assets.map(id => <AssetCard key={id} a={findAsset(id)!} />)}</div> : <div className="muted">Função sem ativos atribuídos.</div>}</Card>
      </div>
    </div>}

    {tab === 'bem' && <div style={two}>
      <Card title="Indicadores de bem-estar" right={<span className="chip muted" style={{ fontSize: 11 }}><I.Lock size={11} /> Visível para chefia direta e RH</span>}>
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <Field k="Envolvimento (pulse survey)" v={<b style={{ fontSize: 22 }}>{e.wellbeing.engagement}/100</b>} /><Field k="Risco de saída" v={<Pill s={risk}>{e.wellbeing.flightRisk}</Pill>} />
          <Field k="Horas extra (média)" v={<b style={{ fontSize: 22 }}>{e.wellbeing.overtime}</b>} /><Field k="Absentismo" v={<b style={{ fontSize: 22 }}>{e.wellbeing.absence}</b>} />
        </div>
      </Card>
      <Card title="Recomendação Cortex" right={<span className="chip" style={{ color: '#7dd8f7' }}><I.Sparkles size={12} /> IA</span>}>
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>{e.wellbeing.flightRisk === 'Alto' ? 'Perfil escasso no mercado com carga elevada de horas extra. Recomenda-se revisão salarial focada, redistribuição de turnos de piquete e plano de carreira técnica a 12 meses.' : e.wellbeing.flightRisk === 'Médio' ? 'Carga de trabalho acima da média da equipa. Recomenda-se conversa de desenvolvimento e avaliação de mobilidade interna.' : 'Indicadores saudáveis. Manter plano de desenvolvimento e considerar para programa de mentoria.'}</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 12 }}>Recomendações individuais são sugestões para a chefia; qualquer ação requer validação humana pelo HR Business Partner.</div>
      </Card>
    </div>}
  </div>;
}

/* ══════════════════════════ ATIVO 360 ══════════════════════════ */
export function AssetList() {
  const [q, setQ] = useState('');
  const [k, setK] = useState('todos');
  const list = assets.filter(a => (k === 'todos' || a.kind === k) && (a.name + a.id + a.site + a.model).toLowerCase().includes(q.toLowerCase()));
  return <div>
    <ListHeader title="Ativo 360" sub="Gémeo digital da base instalada · estado, telemetria, esquemas, histórico e previsões" q={q} setQ={setQ} icon={<I.Cpu size={26} />} />
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
      {['todos', ...Object.keys(KIND_LABEL)].map(x => <button key={x} className="chip" onClick={() => setK(x)} style={{ padding: '6px 12px', background: k === x ? 'rgba(255,255,255,.14)' : undefined, color: k === x ? '#fff' : undefined }}>{x === 'todos' ? 'Todos' : KIND_LABEL[x as keyof typeof KIND_LABEL]}</button>)}
    </div>
    <div className="grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>{list.map(a => <AssetCard key={a.id} a={a} />)}</div>
  </div>;
}

export function AssetDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const a = findAsset(id);
  const [tab, setTab] = useState('twin');
  const [sel, setSel] = useState<string | undefined>();
  const toast = useToast();
  const chart = useMemo(() => a && ({ id: 'tl-' + a.id, title: a.telemetry.title, subtitle: `Unidade: ${a.telemetry.unit} · Snowpipe Streaming`, kind: 'area' as const, keys: a.telemetry.keys, data: a.telemetry.data,
    insight: a.prediction.driver, forecast: `Vida útil remanescente: ${a.prediction.rul} · probabilidade de falha ${a.prediction.failProb}.`, action: a.prediction.action }), [a]);
  if (!a || !chart) return <Navigate to="/portal/360/ativos" replace />;
  const cu = findCustomer(a.customer)!;
  const cur = a.hotspots.find(h => h.id === sel);
  const head: PdfLine[] = [
    B(`Equipamento: ${a.id}   ·   N.º de série: ${a.serial}   ·   Modelo: ${a.model}`), B(`Cliente: ${cu.name}   ·   Local: ${a.site}`), B(`Comissionamento: ${a.commissioned}   ·   Garantia: ${a.warrantyUntil}`, 8),
  ];
  const specs: PdfLine[] = [H('Características técnicas'), ...a.specs.map(([k, v]) => B(`•  ${k}: ${v}`)), sp];
  const state: PdfLine[] = [H('Estado e monitorização'), B(`Índice de saúde: ${a.health}/100 · ${SL[a.status]}`), ...a.hotspots.map(h => B(`•  ${h.label}: ${h.value}  [${SL[h.status]}]`)), sp,
    H('Diagnóstico Cortex'), B(`Vida útil remanescente: ${a.prediction.rul}   ·   Probabilidade de falha: ${a.prediction.failProb}`), B(`Causa provável: ${a.prediction.driver}`), B(`Ação recomendada: ${a.prediction.action}`), sp];
  const hist: PdfLine[] = [H('Histórico de intervenções'), ...a.history.map(h => B(`${h.date} · ${h.type} · ${findEmployee(h.tech)?.name ?? h.tech}: ${h.text}`))];
  const report = () => { downloadPdf(`Ativo360_${a.id}`, `Ativo 360 — ${a.name}`, `${KIND_LABEL[a.kind]} · ${a.id}`, [...head, ...state, ...specs, ...hist]); toast('download', 'Relatório Ativo 360 gerado', `${a.id} · ${a.name}`); };
  const doc = (n: string) => {
    const body: PdfLine[] = /FAT|SAT/.test(n) ? [...head, H(`${n} — resumo de ensaios`), B('Ensaios de rotina conforme norma aplicável: relação de transformação, resistência de enrolamentos, perdas em vazio e em carga, impedância de curto-circuito, ensaios dielétricos e de descargas parciais.'), B('Resultado: CONFORME. Todos os valores dentro das tolerâncias contratuais.', 8), ...specs]
      : /Manual|O&M|instalação|Plano/.test(n) ? [...head, H(n), B('1. Segurança — trabalhos apenas por pessoal qualificado, com consignação e verificação de ausência de tensão.'), B('2. Inspeção periódica — verificar indicadores, níveis, temperaturas e alarmes do sistema de monitorização Nexus.'), B('3. Manutenção preventiva — conforme plano anual e recomendações do gémeo digital.', 8), ...specs, ...hist]
      : /DGA|Relatório|uptime|DP|ciberseg/i.test(n) ? [...head, ...state, ...hist]
      : [...head, H(n), B('Documento técnico controlado. Versão em vigor disponível no repositório documental Efacec.'), sp, ...specs];
    downloadPdf(`${a.id}_${n}`, n, `${a.name} · ${a.id}`, body);
    toast('download', 'Documento transferido', `${n} · ${a.id}`);
  };
  return <div>
    <div className="glass" style={{ padding: 24, display: 'flex', gap: 22, alignItems: 'center', borderLeft: `3px solid ${SC[a.status]}` }}>
      <div style={{ width: 80, height: 80, borderRadius: 22, display: 'grid', placeItems: 'center', background: 'rgba(41,181,232,.1)', border: '1px solid rgba(41,181,232,.35)', color: '#7dd8f7' }}><I.Cpu size={34} /></div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}><span className="chip muted" style={{ fontSize: 11 }}>{KIND_LABEL[a.kind]}</span><Pill s={a.status} /></div>
        <H1>{a.name}</H1>
        <div className="muted" style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 13 }}>{a.id} · S/N {a.serial} · {a.model}</div>
        <div style={{ display: 'flex', gap: 28, marginTop: 14 }}>
          <Field k="Cliente" v={<Link to={`/portal/360/clientes/${cu.id}`} style={{ color: '#7dd8f7' }}>{cu.name.split(' — ')[0]} →</Link>} /><Field k="Localização" v={a.site} /><Field k="Comissionamento" v={a.commissioned} /><Field k="Garantia" v={a.warrantyUntil} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}><ReportBtn onClick={report} /><Ring v={a.health} label="Índice de saúde" size={104} /></div>
    </div>
    <div className="grid kpis" style={{ marginTop: 18 }}>
      <KpiCard i={0} k={{ label: 'Vida útil remanescente', value: a.prediction.rul, delta: 'Cortex ML', up: true, good: a.status !== 'critico' }} />
      <KpiCard i={1} k={{ label: 'Probabilidade de falha', value: a.prediction.failProb.split(' / ')[0], delta: a.prediction.failProb.split(' / ')[1] ?? '', up: a.status !== 'ok', good: a.status === 'ok' }} />
      <KpiCard i={2} k={{ label: 'Alertas ativos', value: String(a.hotspots.filter(h => h.status !== 'ok').length), delta: `${a.hotspots.length} pontos monitorizados`, up: true, good: a.hotspots.every(h => h.status === 'ok') }} />
      <KpiCard i={3} k={{ label: 'Intervenções registadas', value: String(a.history.length), delta: `última: ${a.history[0].date}`, up: true, good: true }} />
    </div>
    <div style={{ marginTop: 18 }}><Tabs value={tab} onChange={setTab} tabs={[
      { id: 'twin', label: 'Gémeo digital & Esquema', icon: <I.Layers size={15} /> },
      { id: 'tele', label: 'Telemetria', icon: <I.Activity size={15} /> },
      { id: 'ficha', label: 'Ficha técnica', icon: <I.FileText size={15} /> },
      { id: 'hist', label: 'Histórico', icon: <I.History size={15} /> },
      { id: 'local', label: 'Localização', icon: <I.MapPin size={15} /> },
    ]} /></div>

    {tab === 'twin' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18 }}>
      <div className="glass" style={{ padding: 10 }}><Schematic kind={a.kind} hotspots={a.hotspots} selected={sel} onSelect={setSel} labels={a.kind === 'transformador' ? (a.specs.find(x => x[0] === 'Tensões')?.[1].split(' / ').slice(0, 2).map((v, i) => `${i ? 'BT' : 'AT'} ${v.replace(' kV', '')} kV`)) : undefined} /></div>
      <div className="grid" style={{ gap: 18, alignContent: 'start' }}>
        <Card title="Componentes monitorizados">
          {a.hotspots.map(h => <button key={h.id} onClick={() => setSel(h.id)} style={{ display: 'flex', width: '100%', gap: 10, alignItems: 'center', padding: '9px 10px', borderRadius: 10, textAlign: 'left', background: sel === h.id ? 'rgba(255,255,255,.08)' : undefined }}>
            <span className={`dot ${h.status}`} /><span style={{ flex: 1, fontSize: 13 }}>{h.label}</span><span className="muted" style={{ fontSize: 11, fontFamily: 'ui-monospace, Menlo, monospace' }}>{h.value}</span></button>)}
        </Card>
        <Card title={cur ? cur.label : 'Diagnóstico Cortex'} right={<span className="chip" style={{ color: '#7dd8f7' }}><I.Sparkles size={12} /> IA</span>}>
          {cur && <div style={{ marginBottom: 10 }}><Pill s={cur.status}>{cur.value}</Pill></div>}
          <div style={{ fontSize: 13, lineHeight: 1.6 }}><b>Causa provável:</b> <span className="muted">{a.prediction.driver}</span></div>
          <div style={{ fontSize: 13, lineHeight: 1.6, marginTop: 8 }}><b>Ação recomendada:</b> <span className="muted">{a.prediction.action}</span></div>
          {a.status !== 'ok' && <button className="btn" style={{ marginTop: 14, padding: '8px 14px', fontSize: 13 }} onClick={() => { toast('action', 'Caso aberto no fluxo de decisão', `${a.id} · ${a.prediction.action.split('.')[0]}`); setTimeout(() => nav('/portal/decisoes'), 600); }}><I.Zap size={14} /> Abrir no fluxo de decisão</button>}
        </Card>
      </div>
    </div>}

    {tab === 'tele' && <ChartCard c={chart} />}

    {tab === 'ficha' && <div style={two}>
      <DataTable title="Características técnicas" source="SAP PM · Equipment master" columns={['Parâmetro', 'Valor']} rows={a.specs.map(([k, v]) => ({ 'Parâmetro': k, Valor: v }))} />
      <Card title="Documentação">{a.documents.map(([n, t]) => <div key={n} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
        <I.FileText size={18} color="#7dd8f7" /><span style={{ flex: 1, fontSize: 14 }}>{n}</span><span className="chip muted" style={{ fontSize: 11 }}>{t}</span><button className="chip" onClick={() => doc(n)} title="Transferir"><I.Download size={13} /> Transferir</button></div>)}</Card>
    </div>}

    {tab === 'hist' && <Card title="Histórico de intervenções"><Timeline items={a.history.map(h => {
      const t = findEmployee(h.tech);
      const col = h.type === 'Alerta' ? '#ef4444' : h.type === 'Comissionamento' ? '#22c55e' : h.type === 'Upgrade' ? '#A855F7' : '#29B5E8';
      return { date: h.date, title: <span>{h.type} · {t ? <Link to={`/portal/360/colaboradores/${t.id}`} style={{ color: '#7dd8f7' }}>{t.name}</Link> : h.tech}</span>, text: h.text, icon: <I.Wrench size={14} />, color: col };
    })} /></Card>}

    {tab === 'local' && <div className="glass" style={{ padding: 8 }}><MapView assets={[{ name: a.name, type: a.id, lat: a.lat, lng: a.lng, status: a.status, detail: a.site }]} height={480} /></div>}
  </div>;
}
