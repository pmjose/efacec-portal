import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, UserCheck, Play, Check, X, Loader2, RotateCcw } from 'lucide-react';
import type { Agent } from '../data/domains';

export default function AgentFlow({ a }: { a: Agent }) {
  const [step, setStep] = useState(-1);
  const [decision, setDecision] = useState<'pend' | 'ok' | 'no'>('pend');
  const approvalIdx = a.steps.findIndex(s => s.title === 'Aprovação');
  const waiting = a.mode === 'humano' && step === approvalIdx && decision === 'pend';

  useEffect(() => {
    if (step < 0 || step >= a.steps.length - 1 || waiting || decision === 'no') return;
    const id = setTimeout(() => setStep(s => s + 1), 1100);
    return () => clearTimeout(id);
  }, [step, waiting, decision, a.steps.length]);

  const run = () => { setDecision('pend'); setStep(0); };
  const done = step === a.steps.length - 1;

  return (
    <div className="glass" style={{ padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
            <span className="chip" style={{ color: a.mode === 'auto' ? '#7dd8f7' : '#FFCC00' }}>
              {a.mode === 'auto' ? <><Bot size={12} /> Autónomo</> : <><UserCheck size={12} /> Humano no circuito</>}
            </span>
            <span className="chip muted">Gatilho: {a.trigger}</span>
          </div>
          <div style={{ fontWeight: 600, fontSize: 17 }}>{a.name}</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>Impacto: <span style={{ color: '#22c55e' }}>{a.impact}</span></div>
        </div>
        <button className={step < 0 ? 'btn' : 'btn-ghost'} style={{ padding: '8px 14px', fontSize: 13, flexShrink: 0 }} onClick={run}>
          {step < 0 ? <><Play size={14} /> Executar</> : <><RotateCcw size={14} /> Repetir</>}
        </button>
      </div>

      <div style={{ marginTop: 20, display: 'grid', gap: 0 }}>
        {a.steps.map((s, i) => {
          const active = i === step, past = i < step || (done && i === step);
          const isApproval = i === approvalIdx;
          const col = past ? '#22c55e' : active ? (isApproval ? '#FFCC00' : '#29B5E8') : 'rgba(255,255,255,.2)';
          return (
            <div key={i} style={{ display: 'flex', gap: 14, opacity: i <= step ? 1 : .4, transition: '.4s' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <motion.div animate={{ scale: active ? [1, 1.15, 1] : 1 }} transition={{ repeat: active && !past ? Infinity : 0, duration: 1.2 }}
                  style={{ width: 26, height: 26, borderRadius: '50%', border: `2px solid ${col}`, display: 'grid', placeItems: 'center', background: past ? '#22c55e22' : 'transparent' }}>
                  {past ? <Check size={13} color="#22c55e" /> : active ? <Loader2 size={13} color={col} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> : <span style={{ fontSize: 11 }}>{i + 1}</span>}
                </motion.div>
                {i < a.steps.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 18, background: past ? '#22c55e66' : 'rgba(255,255,255,.08)' }} />}
              </div>
              <div style={{ paddingBottom: 16, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: col === 'rgba(255,255,255,.2)' ? undefined : col }}>{s.title}</div>
                <div style={{ fontSize: 13, marginTop: 2, lineHeight: 1.5 }}>{s.detail}</div>
                {isApproval && waiting && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 10, padding: 12, borderRadius: 12, background: 'rgba(255,204,0,.08)', border: '1px solid rgba(255,204,0,.3)' }}>
                    <div style={{ fontSize: 12, marginBottom: 8 }}>Aprovador: <b>{a.approver}</b></div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => { setDecision('ok'); setStep(s => s + 1); }}><Check size={13} /> Aprovar</button>
                      <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setDecision('no')}><X size={13} /> Rejeitar</button>
                    </div>
                  </motion.div>
                )}
                {isApproval && decision === 'no' && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 6 }}>Rejeitado por {a.approver?.split(' — ')[0]} · fluxo encerrado e registado.</div>}
              </div>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
