import { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { modules, findModule, allAgents } from '../data/modules';
import { executiveQuestions } from '../data/domains';
import ChatPanel from '../components/ChatPanel';
import { FiltersProvider, useFilters, BUS, REGIONS, isFiltered } from '../filters';

export function Icon({ name, size = 18, color }: { name: string; size?: number; color?: string }) {
  const I = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Circle;
  return <I size={size} color={color} />;
}

const pending = allAgents.filter(a => a.mode === 'humano').length;

function GlobalSearch() {
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const hits = useMemo(() => {
    if (q.length < 2) return [];
    const t = q.toLowerCase();
    return modules.flatMap(m => m.sections.map(s => ({ m, s })))
      .filter(({ m, s }) => (m.name + ' ' + s.label + ' ' + JSON.stringify(s.blocks)).toLowerCase().includes(t)).slice(0, 7);
  }, [q]);
  return (
    <div style={{ position: 'relative' }}>
      <div className="glass search"><Icons.Search size={16} className="muted" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Pesquisar fornecedores, clientes, ativos, OF…" />
        <span className="chip muted" style={{ padding: '1px 7px', fontSize: 11 }}>⌘K</span>
      </div>
      {hits.length > 0 && (
        <div className="glass" style={{ position: 'absolute', top: 50, left: 0, right: 0, zIndex: 80, padding: 6, background: 'rgba(12,15,24,.96)' }}>
          {hits.map(({ m, s }) => (
            <button key={m.slug + s.id} onClick={() => { nav(`/portal/${m.slug}/${s.id}`); setQ(''); }}
              style={{ display: 'flex', gap: 10, alignItems: 'center', width: '100%', padding: '9px 10px', borderRadius: 10, textAlign: 'left', fontSize: 13 }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.06)')} onMouseLeave={e => (e.currentTarget.style.background = '')}>
              <Icon name={m.icon} size={15} color={m.color} /><span>{m.name}</span><span className="muted">› {s.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const sel: React.CSSProperties = { background: 'rgba(255,255,255,.06)', border: '1px solid var(--border)', borderRadius: 999, padding: '7px 12px', fontSize: 13, color: 'inherit', outline: 0 };
function FilterBar() {
  const { f, set } = useFilters();
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <div className="glass" style={{ display: 'flex', padding: 3, borderRadius: 999 }}>
        {(['3M', '6M', '12M'] as const).map(p => (
          <button key={p} onClick={() => set({ period: p })} style={{ padding: '5px 12px', borderRadius: 999, fontSize: 12, background: f.period === p ? 'rgba(255,255,255,.14)' : undefined }}>{p}</button>
        ))}
      </div>
      <select style={sel} value={f.bu} onChange={e => set({ bu: e.target.value })}>{BUS.map(b => <option key={b} style={{ background: '#111' }}>{b}</option>)}</select>
      <select style={sel} value={f.region} onChange={e => set({ region: e.target.value })}>{REGIONS.map(b => <option key={b} style={{ background: '#111' }}>{b}</option>)}</select>
      {isFiltered(f) && <button className="chip" style={{ color: '#F39200' }} onClick={() => set({ bu: BUS[0], region: REGIONS[0], period: '12M' })}><Icons.X size={12} /> Limpar</button>}
    </div>
  );
}

function Shell() {
  const loc = useLocation();
  const [, , slug, section] = loc.pathname.split('/');
  const m = findModule(slug);
  const sectionLabel = m?.sections.find(s => s.id === section)?.label ?? m?.sections[0].label;
  const pageName = m?.name ?? (slug === 'decisoes' ? 'Decisões & Agentes' : slug === 'dados' ? 'Catálogo de Dados' : 'Cockpit Executivo');

  return (
    <div className="shell">
      <div className="aurora" />
      <aside className="side">
        <Link to="/inicio" style={{ padding: '4px 10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="./logos/efacec-Logo-24d9b56a.png" height={30} alt="Efacec" />
          <div style={{ lineHeight: 1.1 }}><div style={{ fontWeight: 700, letterSpacing: '.02em' }}>Nexus</div><div className="muted" style={{ fontSize: 10 }}>Analytics & IA</div></div>
        </Link>
        <div className="label">Início</div>
        <NavLink end to="/portal" className="nav"><Icons.LayoutDashboard size={18} /> Cockpit Executivo</NavLink>
        <NavLink to="/portal/decisoes" className="nav"><Icons.Inbox size={18} /> Decisões & Agentes <span className="chip" style={{ marginLeft: 'auto', padding: '1px 7px', background: '#F3920033', borderColor: '#F39200' }}>{pending}</span></NavLink>
        <div className="label">Funções</div>
        {modules.filter(x => x.group === 'funcoes').map(x => <NavLink key={x.slug} to={`/portal/${x.slug}`} className="nav"><Icon name={x.icon} color={x.color} /> {x.short}</NavLink>)}
        <div className="label">Unidades de negócio</div>
        {modules.filter(x => x.group === 'negocio').map(x => <NavLink key={x.slug} to={`/portal/${x.slug}`} className="nav"><Icon name={x.icon} color={x.color} /> {x.short}</NavLink>)}
        <div className="label">Plataforma</div>
        <NavLink to="/portal/dados" className="nav"><Icons.Database size={18} /> Catálogo de Dados</NavLink>
        <div style={{ marginTop: 'auto', paddingTop: 14 }}>
          <div style={{ padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'center', borderTop: '1px solid var(--border)' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--grad)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13 }}>CM</div>
            <div style={{ fontSize: 13 }}><div>Carlos Mendes</div><div className="muted" style={{ fontSize: 11 }}>Comissão Executiva</div></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: 10 }} className="muted">
            Powered by <img src="./logos/snowflake.svg" height={11} alt="Snowflake" style={{ filter: 'brightness(0) invert(1)', opacity: .7 }} />
          </div>
        </div>
      </aside>
      <main className="main">
        <div className="topbar">
          <GlobalSearch />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className="chip"><span className="dot ok" /> Dados em tempo real</span>
            <span className="chip"><Icons.Bell size={13} /> 3</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div className="muted" style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }}>
            <Link to="/portal">Nexus</Link><Icons.ChevronRight size={13} />
            {m ? <><Link to={`/portal/${m.slug}`}>{m.group === 'negocio' ? 'Unidades de negócio' : 'Funções'}</Link><Icons.ChevronRight size={13} /><Link to={`/portal/${m.slug}`}>{m.name}</Link><Icons.ChevronRight size={13} /><span style={{ color: '#fff' }}>{sectionLabel}</span></>
              : <span style={{ color: '#fff' }}>{pageName}</span>}
          </div>
          <FilterBar />
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={slug ?? 'home'} initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .35 }}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <ChatPanel context={m ? `${m.name} › ${sectionLabel}` : pageName} questions={m?.questions ?? executiveQuestions} />
    </div>
  );
}

export default function Portal() {
  return <FiltersProvider><Shell /></FiltersProvider>;
}
