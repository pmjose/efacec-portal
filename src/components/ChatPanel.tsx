import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send } from 'lucide-react';

type Msg = { role: 'user' | 'ai'; text: string };
const md = (s: string) => s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

export default function ChatPanel({ context, questions }: { context: string; questions: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState('');
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { setMsgs([]); }, [context]);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, busy]);

  const ask = (q: string) => {
    if (busy || !q.trim()) return;
    const hit = questions.find(x => x.q === q);
    setMsgs(m => [...m, { role: 'user', text: q }]); setInput(''); setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setMsgs(m => [...m, { role: 'ai', text: hit?.a ?? `Com base nos dados de **${context}**, encaminhei a pergunta para o Cortex Analyst. Sugiro começar por uma das perguntas abaixo para uma resposta verificada.` }]);
    }, 1300);
  };

  return (
    <>
      <motion.button whileHover={{ scale: 1.06 }} onClick={() => setOpen(true)} className="btn btn-sf"
        style={{ position: 'fixed', right: 26, bottom: 26, zIndex: 60, padding: '14px 20px' }}>
        <Sparkles size={18} /> Assistente Cortex
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.aside initial={{ x: 460, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 460, opacity: 0 }} transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="glass" style={{ position: 'fixed', top: 14, right: 14, bottom: 14, width: 420, zIndex: 70, display: 'flex', flexDirection: 'column', borderRadius: 24, background: 'rgba(10,13,22,.82)' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,#29B5E8,#F39200)', display: 'grid', placeItems: 'center' }}><Sparkles size={18} /></div>
                <div><div style={{ fontWeight: 600 }}>Assistente Cortex</div><div className="muted" style={{ fontSize: 12 }}>Contexto: {context}</div></div>
              </div>
              <button onClick={() => setOpen(false)}><X size={18} className="muted" /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {msgs.length === 0 && <div className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>Olá! Tenho acesso governado aos dados de <b style={{ color: '#fff' }}>{context}</b> através do Cortex Analyst e dos modelos semânticos. Em que posso ajudar?</div>}
              {msgs.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="md" style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%', padding: '10px 14px', borderRadius: 16, fontSize: 14, lineHeight: 1.55,
                    background: m.role === 'user' ? 'linear-gradient(120deg,#E30613,#F39200)' : 'rgba(255,255,255,.07)' }}
                  dangerouslySetInnerHTML={{ __html: md(m.text) }} />
              ))}
              {busy && <div className="typing" style={{ padding: 10 }}><span /><span /><span /></div>}
              <div ref={end} />
            </div>
            <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {questions.map(q => <button key={q.q} className="chip" style={{ textAlign: 'left' }} onClick={() => ask(q.q)}>{q.q}</button>)}
              </div>
              <form onSubmit={e => { e.preventDefault(); ask(input); }} style={{ display: 'flex', gap: 8, padding: 6, paddingLeft: 14, borderRadius: 999, background: 'rgba(255,255,255,.06)', border: '1px solid var(--border)' }}>
                <input value={input} onChange={e => setInput(e.target.value)} placeholder="Pergunte algo…" style={{ flex: 1, background: 'none', border: 0, outline: 0 }} />
                <button className="btn btn-sf" style={{ padding: 9 }}><Send size={15} /></button>
              </form>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
