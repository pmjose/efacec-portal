import { useParams, Navigate, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Clock, User, Download, Share2, FileText } from 'lucide-react';
import { useToast } from '../ui/toast';
import { downloadCsv, downloadPdf, copyLink, type Sheet, type PdfLine } from '../utils/download';
import { useFilters } from '../filters';
import { findModule } from '../data/modules';
import Blocks from '../components/Blocks';
import { Tabs } from '../ui/kit';
import { Icon } from './Portal';

export default function ModulePage() {
  const { slug, section } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { f } = useFilters();
  const m = findModule(slug);
  if (!m) return <Navigate to="/portal" replace />;
  const s = m.sections.find(x => x.id === section) ?? m.sections[0];
  const ctx = `${f.period} · ${f.bu} · ${f.region}`;
  const sheets = (): Sheet[] => s.blocks.flatMap((b): Sheet[] => {
    if (b.t === 'kpis') return [{ title: 'Indicadores', columns: ['Indicador', 'Valor', 'Variação'], rows: b.items.map(k => ({ Indicador: k.label, Valor: k.value, 'Variação': k.delta })) }];
    if (b.t === 'table') return [{ title: b.title, columns: b.columns, rows: b.rows }];
    if (b.t === 'chart') { const cols = ['m', ...b.c.keys]; return [{ title: b.c.title, columns: cols.map(k => k === 'm' ? 'Período' : k), rows: b.c.data.map(r => Object.fromEntries(cols.map(k => [k === 'm' ? 'Período' : k, r[k]]))) }]; }
    if (b.t === 'funnel') return [{ title: b.title, columns: ['Fase', 'Quantidade', 'Detalhe'], rows: b.stages.map(([a, v, d]) => ({ Fase: a, Quantidade: v, Detalhe: d })) }];
    return [];
  });
  const exportCsv = () => { const sh = sheets(); downloadCsv(`${m.short}_${s.label}`, sh); toast('download', 'Exportação concluída', `${m.name} › ${s.label} · ${sh.length} conjuntos de dados (${ctx})`); };
  const exportPdf = () => {
    const L: PdfLine[] = [{ text: `Responsável: ${m.owner || '—'}   ·   Filtros: ${ctx}`, size: 9, color: [0.4, 0.43, 0.5], gap: 10 }];
    s.blocks.forEach(b => {
      if (b.t === 'kpis') { L.push({ text: 'Indicadores-chave', size: 13, bold: true, gap: 4 }); b.items.forEach(k => L.push({ text: `•  ${k.label}: ${k.value}  (${k.delta})` })); L.push({ text: '', gap: 6 }); }
      if (b.t === 'insights') { L.push({ text: 'Insights Cortex', size: 13, bold: true, gap: 4 }); b.items.forEach(i => { L.push({ text: i.title, bold: true }); L.push({ text: i.text, gap: 4, color: [0.3, 0.33, 0.4] }); }); L.push({ text: '', gap: 6 }); }
      if (b.t === 'chart') { L.push({ text: b.c.title, size: 12, bold: true, gap: 2 }); L.push({ text: `Insight: ${b.c.insight}` }); L.push({ text: `Previsão: ${b.c.forecast}` }); L.push({ text: `Ação recomendada: ${b.c.action}`, gap: 8 }); }
      if (b.t === 'table') { L.push({ text: b.title, size: 12, bold: true, gap: 2 }); L.push({ text: b.columns.join('  |  '), size: 9, bold: true }); b.rows.forEach(r => L.push({ text: b.columns.map(c => r[c]).join('  |  '), size: 9 })); L.push({ text: '', gap: 8 }); }
      if (b.t === 'agents') b.items.forEach(a => { L.push({ text: `Agente: ${a.name} (${a.mode === 'auto' ? 'autónomo' : 'humano no circuito'})`, size: 12, bold: true }); a.steps.forEach(st => L.push({ text: `${st.title}: ${st.detail}`, size: 9.5 })); L.push({ text: '', gap: 6 }); });
    });
    downloadPdf(`${m.short}_${s.label}`, `${m.name} — ${s.label}`, `Efacec Nexus · Relatório gerado em ${new Date().toLocaleDateString('pt-PT')}`, L);
    toast('download', 'Relatório PDF gerado', `${m.name} › ${s.label}`);
  };
  const share = async () => { const ok = await copyLink(); toast('link', ok ? 'Ligação copiada' : 'Ligação pronta a partilhar', ok ? 'Cole no Teams ou e-mail — abre diretamente neste separador.' : location.href); };

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
          <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }} onClick={share}><Share2 size={14} /> Partilhar</button>
          <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }} onClick={exportCsv}><Download size={14} /> Excel (CSV)</button>
          <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }} onClick={exportPdf}><FileText size={14} /> PDF</button>
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
