import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { domains, executiveQuestions } from '../data/domains';
import ChatPanel from '../components/ChatPanel';

export function Icon({ name, size = 18, color }: { name: string; size?: number; color?: string }) {
  const I = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Circle;
  return <I size={size} color={color} />;
}

export default function Portal() {
  const loc = useLocation();
  const slug = loc.pathname.split('/')[2];
  const d = domains.find(x => x.slug === slug);
  return (
    <div className="shell">
      <div className="aurora" />
      <aside className="side">
        <Link to="/inicio" style={{ padding: '6px 12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="./logos/efacec-Logo-24d9b56a.png" height={30} alt="Efacec" />
          <span className="muted" style={{ fontSize: 12 }}>×</span>
          <img src="./logos/snowflake.svg" height={18} alt="Snowflake" style={{ filter: 'brightness(0) invert(1)', opacity: .9 }} />
        </Link>
        <div className="label">Visão</div>
        <NavLink end to="/portal" className="nav"><Icons.LayoutDashboard size={18} /> Centro de Comando</NavLink>
        <NavLink to="/portal/agentes" className="nav"><Icons.Bot size={18} /> Agentes & Aprovações <span className="chip" style={{ marginLeft: 'auto', padding: '1px 7px', background: '#F3920033', borderColor: '#F39200' }}>6</span></NavLink>
        <div className="label">Domínios</div>
        {domains.map(x => (
          <NavLink key={x.slug} to={`/portal/${x.slug}`} className="nav"><Icon name={x.icon} color={x.color} /> {x.short}</NavLink>
        ))}
        <div style={{ marginTop: 'auto', padding: 12, display: 'flex', gap: 10, alignItems: 'center', borderTop: '1px solid var(--border)' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--grad)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13 }}>CM</div>
          <div style={{ fontSize: 13 }}><div>Carlos Mendes</div><div className="muted" style={{ fontSize: 11 }}>Comissão Executiva</div></div>
        </div>
      </aside>
      <main className="main">
        <div className="topbar">
          <div className="glass search"><Icons.Search size={16} className="muted" /><input placeholder="Pesquisar ativos, projetos, clientes…" /></div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className="chip"><span className="dot ok" /> Snowflake · EFACEC_PROD · eu-west-1</span>
            <span className="chip"><Icons.Bell size={13} /> 4</span>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={loc.pathname} initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .4 }}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <ChatPanel context={d?.name ?? (slug === 'agentes' ? 'Agentes & Aprovações' : 'Centro de Comando')} questions={d?.questions ?? executiveQuestions} />
    </div>
  );
}
