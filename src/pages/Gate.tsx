import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';

const LINES = [
  'Da fábrica à subestação.',
  'Da subestação ao carregador.',
  'Do carregador ao mundo.',
  'A energia está prestes a ganhar uma nova inteligência.',
];

function EnergyCanvas({ burst }: { burst: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const burstRef = useRef(0);
  useEffect(() => { if (burst) burstRef.current = 0.001; }, [burst]);

  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext('2d')!;
    let w = 0, h = 0, raf = 0, t = 0;
    const dpr = Math.min(window.devicePixelRatio, 2);
    type N = { x: number; y: number; z: number };
    let nodes: N[] = []; let edges: [number, number][] = [];
    type P = { e: number; p: number; s: number; col: string };
    let pulses: P[] = [];
    const cols = ['#E30613', '#F39200', '#FFCC00', '#29B5E8'];
    const resize = () => {
      w = c.width = innerWidth * dpr; h = c.height = innerHeight * dpr;
      c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px';
      nodes = Array.from({ length: 70 }, () => ({ x: Math.random() * w, y: Math.random() * h, z: Math.random() }));
      edges = [];
      nodes.forEach((a, i) => {
        nodes.map((b, j) => [j, Math.hypot(a.x - b.x, a.y - b.y)] as [number, number])
          .filter(([j]) => j !== i).sort((x, y) => x[1] - y[1]).slice(0, 2)
          .forEach(([j]) => edges.push([i, j]));
      });
      pulses = Array.from({ length: 60 }, () => ({ e: (Math.random() * edges.length) | 0, p: Math.random(), s: 0.004 + Math.random() * 0.01, col: cols[(Math.random() * 4) | 0] }));
    };
    resize(); addEventListener('resize', resize);

    const loop = () => {
      t += 0.016;
      ctx.fillStyle = 'rgba(5,7,12,0.28)'; ctx.fillRect(0, 0, w, h);
      // perspective floor
      ctx.save(); ctx.strokeStyle = 'rgba(41,181,232,0.06)'; ctx.lineWidth = dpr;
      const hz = h * 0.62;
      for (let i = -20; i <= 20; i++) { ctx.beginPath(); ctx.moveTo(w / 2 + i * 40 * dpr, hz); ctx.lineTo(w / 2 + i * 260 * dpr, h); ctx.stroke(); }
      for (let i = 0; i < 14; i++) { const y = hz + Math.pow((i + (t * 0.6) % 1) / 14, 2.2) * (h - hz); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.restore();
      // grid network
      ctx.lineWidth = dpr * 0.7;
      edges.forEach(([a, b]) => {
        const A = nodes[a], B = nodes[b];
        ctx.strokeStyle = `rgba(255,255,255,${0.04 + A.z * 0.05})`;
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
      });
      nodes.forEach(n => { ctx.fillStyle = `rgba(255,255,255,${0.2 + n.z * 0.4})`; ctx.beginPath(); ctx.arc(n.x, n.y, (1 + n.z * 1.5) * dpr, 0, 7); ctx.fill(); });
      pulses.forEach(p => {
        p.p += p.s * (1 + burstRef.current * 8);
        if (p.p > 1) { p.p = 0; p.e = (Math.random() * edges.length) | 0; }
        const [a, b] = edges[p.e]; const A = nodes[a], B = nodes[b];
        const x = A.x + (B.x - A.x) * p.p, y = A.y + (B.y - A.y) * p.p;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 10 * dpr);
        g.addColorStop(0, p.col); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 10 * dpr, 0, 7); ctx.fill();
      });
      // core — three rotating arcs
      const cx = w / 2, cy = h * 0.42, R = Math.min(w, h) * 0.14;
      const b = burstRef.current; if (b > 0) burstRef.current = Math.min(b + 0.02, 1.4);
      const scale = 1 + b * b * 6;
      ['#E30613', '#F39200', '#FFCC00'].forEach((col, i) => {
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * (0.4 + i * 0.25) * (i % 2 ? -1 : 1) + i * 2.1);
        ctx.shadowColor = col; ctx.shadowBlur = 40 * dpr;
        ctx.strokeStyle = col; ctx.lineWidth = (10 - i * 2) * dpr; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(0, 0, R * scale * (1 - i * 0.18), 0, Math.PI * (1.1 + Math.sin(t + i) * 0.25)); ctx.stroke();
        ctx.restore();
      });
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.6 * scale);
      glow.addColorStop(0, `rgba(255,190,80,${0.18 + b * 0.6})`); glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
      if (b > 0.6) { ctx.fillStyle = `rgba(255,255,255,${Math.min((b - 0.6) * 1.6, 1)})`; ctx.fillRect(0, 0, w, h); }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0 }} />;
}

export default function Gate() {
  const nav = useNavigate();
  const [i, setI] = useState(0);
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => { const id = setInterval(() => setI(x => (x + 1) % LINES.length), 2800); return () => clearInterval(id); }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === 'Snow2026') {
      setOk(true); sessionStorage.setItem('unlocked', '1');
      setTimeout(() => nav('/inicio'), 1900);
    } else { setErr(true); setTimeout(() => setErr(false), 700); }
  };

  return (
    <div style={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <EnergyCanvas burst={ok} />
      <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: '12vh', textAlign: 'center' }}>
        <motion.div animate={{ opacity: ok ? 0 : 1 }} transition={{ duration: .5 }}>
          <div className="chip" style={{ marginBottom: 22, letterSpacing: '.2em', fontSize: 11 }}>ACESSO RESTRITO · 2026</div>
          <div style={{ height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AnimatePresence mode="wait">
              <motion.h1 key={i} initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }} transition={{ duration: .7 }}
                style={{ fontSize: 'clamp(26px, 3.6vw, 46px)', fontWeight: 700, letterSpacing: '-0.03em', maxWidth: 900 }}
                className={i === LINES.length - 1 ? 'grad-text' : ''}>{LINES[i]}</motion.h1>
            </AnimatePresence>
          </div>
          <p className="muted" style={{ margin: '14px 0 32px', fontSize: 15 }}>Mais de sete décadas a ligar o mundo. Agora, cada volt vai pensar.</p>
          <motion.form onSubmit={submit} animate={err ? { x: [0, -12, 12, -8, 8, 0] } : {}} className="glass"
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 6, paddingLeft: 18, borderRadius: 999, width: 380, margin: '0 auto' }}>
            <Lock size={16} className="muted" />
            <input type="password" autoFocus placeholder="Palavra-passe" value={pw} onChange={e => setPw(e.target.value)}
              style={{ flex: 1, background: 'none', border: 0, outline: 0, fontSize: 15 }} />
            <button className="btn" style={{ padding: '10px 16px' }} aria-label="Entrar"><ArrowRight size={18} /></button>
          </motion.form>
          <div style={{ height: 20, marginTop: 10, fontSize: 13, color: '#ef4444' }}>{err && 'Palavra-passe incorreta'}</div>
        </motion.div>
      </div>
      <div className="noise" />
    </div>
  );
}
