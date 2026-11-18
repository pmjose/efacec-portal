import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Database, Brain, Bot, Share2, ShieldCheck, Gauge } from 'lucide-react';

const pillars = [
  { icon: Database, title: 'Uma só fonte de verdade', text: 'SAP, MES, SCADA, OCPP e Salesforce unificados no AI Data Cloud — sem cópias, sem silos.' },
  { icon: Brain, title: 'Cortex AI nativo', text: 'Previsões, deteção de anomalias e LLMs a correr onde os dados já estão, governados.' },
  { icon: Bot, title: 'Agentes que agem', text: 'Do insight à ação: fluxos autónomos onde é seguro, humano no circuito onde importa.' },
  { icon: Share2, title: 'Partilha com o ecossistema', text: 'Utilities, operadores de rede e fornecedores ligados via Secure Data Sharing.' },
  { icon: ShieldCheck, title: 'Governança Horizon', text: 'Linhagem, mascaramento e RBAC para dados OT e IT — pronto para NIS2 e CSRD.' },
  { icon: Gauge, title: 'Escala elástica', text: 'Mil milhões de eventos IEC 61850 por mês com latência inferior a 10 segundos.' },
];
const stats = [
  ['€14,7 M', 'valor anual estimado'], ['81%', 'falhas antecipadas'], ['-80%', 'esforço de reporte CSRD'], ['< 10 s', 'da rede ao insight'],
];

function Section({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <motion.section initial={{ opacity: 0, y: 80, filter: 'blur(12px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-15%' }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      style={{ maxWidth: 1180, margin: '0 auto', padding: '120px 28px', ...style }}>{children}</motion.section>
  );
}

export default function Home() {
  const hero = useRef(null);
  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.82]);
  const op = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);

  return (
    <div>
      <div className="aurora" />
      <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 1.6, ease: 'easeOut' }}
        style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 200, pointerEvents: 'none' }} />

      <header className="glass" style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 50, display: 'flex', alignItems: 'center', gap: 24, padding: '10px 14px 10px 22px', borderRadius: 999 }}>
        <img src="./logos/efacec-Logo-24d9b56a.png" height={26} alt="Efacec" />
        <span className="muted">×</span>
        <img src="./logos/snowflake.svg" height={22} alt="Snowflake" style={{ filter: 'brightness(0) invert(1)' }} />
        <Link to="/portal" className="btn" style={{ padding: '8px 16px', fontSize: 14 }}>Portal <ArrowRight size={14} /></Link>
      </header>

      <section ref={hero} style={{ height: '130vh', position: 'relative' }}>
        <motion.div style={{ scale, opacity: op, y, position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
          <motion.div initial={{ opacity: 0, scale: .6, rotate: -90 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1.6, delay: .6, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: 40 }}>
            <img src="./logos/efacec-Logo-24d9b56a.png" style={{ height: 70 }} alt="Efacec" />
            <div style={{ width: 1, height: 50, background: 'var(--border)' }} />
            <img src="./logos/snowflake.svg" style={{ height: 56, filter: 'brightness(0) invert(1)' }} alt="Snowflake" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 1 }}
            style={{ fontSize: 'clamp(44px, 7vw, 104px)', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1 }}>
            Energia que <span className="grad-text">pensa</span>.<br />Dados que <span className="sf-text">agem</span>.
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 1 }} className="muted"
            style={{ fontSize: 21, maxWidth: 720, marginTop: 28, lineHeight: 1.5 }}>
            A Efacec e o Snowflake AI Data Cloud — da bobinagem de um transformador de 400 kV ao último carregador HV350, uma plataforma única de dados, IA e agentes.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} style={{ display: 'flex', gap: 12, marginTop: 40 }}>
            <Link to="/portal" className="btn">Entrar no portal <ArrowRight size={16} /></Link>
            <a href="#valor" className="btn-ghost">Descobrir o valor</a>
          </motion.div>
        </motion.div>
      </section>

      <Section>
        <div id="valor" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
          {stats.map(([v, l], i) => (
            <motion.div key={l} className="glass" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .12, duration: .8 }}
              style={{ padding: 32, textAlign: 'center' }}>
              <div className={i % 2 ? 'sf-text' : 'grad-text'} style={{ fontSize: 52, fontWeight: 800, letterSpacing: '-0.04em' }}>{v}</div>
              <div className="muted" style={{ marginTop: 6 }}>{l}</div>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section>
        <h2 style={{ fontSize: 'clamp(36px,5vw,64px)', fontWeight: 800, letterSpacing: '-0.04em', textAlign: 'center', lineHeight: 1.05 }}>
          Seis razões.<br /><span className="muted">Uma plataforma.</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginTop: 64 }}>
          {pillars.map(({ icon: I, title, text }, i) => (
            <motion.div key={title} className="glass" whileHover={{ y: -6 }} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .08, duration: .7 }}
              style={{ padding: 30, minHeight: 220 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, display: 'grid', placeItems: 'center', background: i % 2 ? 'rgba(41,181,232,.15)' : 'rgba(243,146,0,.15)', marginBottom: 20 }}>
                <I size={24} color={i % 2 ? '#29B5E8' : '#F39200'} />
              </div>
              <h3 style={{ fontSize: 21, fontWeight: 700, marginBottom: 10 }}>{title}</h3>
              <p className="muted" style={{ lineHeight: 1.6 }}>{text}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="glass" style={{ padding: 56, position: 'relative', overflow: 'hidden' }}>
          <h2 style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>Do <span className="grad-text">insight</span> à <span className="sf-text">ação</span>.</h2>
          <p className="muted" style={{ fontSize: 18, maxWidth: 640 }}>Cada agente segue o mesmo ciclo — e o humano entra quando o impacto o exige.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 44, flexWrap: 'wrap' }}>
            {['Sinal', 'Insight', 'Diagnóstico', 'Recomendação', 'Aprovação humana', 'Ação'].map((s, i) => (
              <motion.div key={s} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: .2 + i * .15 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="chip" style={{ padding: '12px 18px', fontSize: 15, borderColor: i === 4 ? '#F39200' : undefined }}>{s}</div>
                {i < 5 && <ArrowRight size={16} className="muted" />}
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      <Section style={{ textAlign: 'center', paddingBottom: 160 }}>
        <h2 style={{ fontSize: 'clamp(40px,6vw,80px)', fontWeight: 800, letterSpacing: '-0.045em' }}>Pronto para ver a rede <span className="grad-text">a pensar</span>?</h2>
        <Link to="/portal" className="btn" style={{ marginTop: 40, fontSize: 18, padding: '16px 30px' }}>Abrir o Portal Efacec <ArrowRight size={18} /></Link>
      </Section>
      <div className="noise" />
    </div>
  );
}
