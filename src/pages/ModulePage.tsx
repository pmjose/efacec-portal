import { useParams, Navigate, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Clock, User, Download, Share2 } from 'lucide-react';
import { findModule } from '../data/modules';
import Blocks from '../components/Blocks';
import { Tabs } from '../ui/kit';
import { Icon } from './Portal';

export default function ModulePage() {
  const { slug, section } = useParams();
  const nav = useNavigate();
  const m = findModule(slug);
  if (!m) return <Navigate to="/portal" replace />;
  const s = m.sections.find(x => x.id === section) ?? m.sections[0];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, display: 'grid', placeItems: 'center', background: m.color + '22', border: `1px solid ${m.color}55` }}><Icon name={m.icon} size={26} color={m.color} /></div>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em' }}>{m.name}</h1>
            <div className="muted" style={{ fontSize: 14 }}>{m.tagline}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }}><Share2 size={14} /> Partilhar</button>
          <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }}><Download size={14} /> Exportar</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14, fontSize: 12 }}>
        {m.owner && <span className="chip"><User size={12} /> {m.owner}</span>}
        <span className="chip"><Clock size={12} /> Atualizado às 09:42</span>
        {m.sources.map(x => <span key={x} className="chip muted"><Database size={11} /> {x}</span>)}
        <Link to="/portal/dados" className="chip" style={{ color: '#7dd8f7' }}>Ver produtos de dados →</Link>
      </div>
      <div style={{ marginTop: 18, overflowX: 'auto' }}>
        <Tabs value={s.id} onChange={id => nav(`/portal/${m.slug}/${id}`)} tabs={m.sections.map(x => ({ id: x.id, label: x.label, icon: <Icon name={x.icon} size={15} /> }))} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .3 }}>
          <Blocks blocks={s.blocks} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
