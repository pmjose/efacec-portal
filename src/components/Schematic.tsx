import { useState } from 'react';
import type { AssetKind, Hotspot, Status } from '../data/c360';

const SC: Record<Status, string> = { ok: '#22c55e', aviso: '#f59e0b', critico: '#ef4444' };
const LINE = '#7dd8f7';
const DIM = 'rgba(125,216,247,.35)';

type P = { hs: Record<string, Hotspot>; c: (id: string, fallback?: string) => string; labels?: string[] };
const T = ({ x, y, children, a = 'middle', s = 11, o = .75 }: { x: number; y: number; children: React.ReactNode; a?: 'start' | 'middle' | 'end'; s?: number; o?: number }) =>
  <text x={x} y={y} textAnchor={a} fontSize={s} fill="#cfe9f7" opacity={o} fontFamily="ui-monospace, Menlo, monospace">{children}</text>;

/* ───────── Transformador de potência (corte frontal) ───────── */
function Transformer({ c, labels = ['AT 400 kV', 'BT 150 kV'] }: P) {
  return <g fill="none" strokeWidth={1.6}>
    {/* conservador */}
    <rect x={600} y={92} width={160} height={42} rx={21} stroke={c('cons')} fill="rgba(125,216,247,.05)" />
    <rect x={604} y={112} width={100} height={18} rx={9} fill="rgba(41,181,232,.25)" stroke="none" />
    <path d="M600 113 H575 V170" stroke={DIM} /><rect x={566} y={140} width={18} height={12} stroke={DIM} /><T x={600} y={84} a="start" s={10}>Buchholz</T>
    {/* buchas AT */}
    {[230, 290, 350].map(x => <g key={x} stroke={c('hv')}>
      <path d={`M${x - 10} 170 L${x - 6} 60 L${x + 6} 60 L${x + 10} 170`} fill="rgba(125,216,247,.06)" />
      {Array.from({ length: 8 }, (_, i) => <line key={i} x1={x - 13 + i * .3} x2={x + 13 - i * .3} y1={156 - i * 12} y2={156 - i * 12} />)}
      <circle cx={x} cy={54} r={6} fill="rgba(125,216,247,.2)" />
    </g>)}
    {/* buchas BT */}
    {[430, 475, 520].map(x => <g key={x} stroke={DIM}><path d={`M${x - 8} 170 L${x - 5} 118 L${x + 5} 118 L${x + 8} 170`} />{[0, 1, 2].map(i => <line key={i} x1={x - 10} x2={x + 10} y1={160 - i * 13} y2={160 - i * 13} />)}</g>)}
    {/* cuba + óleo */}
    <rect x={180} y={170} width={380} height={230} rx={10} stroke={LINE} strokeWidth={2.2} />
    <rect x={184} y={186} width={372} height={210} rx={8} fill="rgba(41,181,232,.07)" stroke="none" />
    <path d="M184 186 q 30 -6 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0" stroke={c('oil', DIM)} strokeDasharray="3 4" />
    {/* núcleo */}
    <g stroke={c('core', '#9aa3b5')}>
      <rect x={220} y={200} width={300} height={22} fill="rgba(154,163,181,.12)" />
      <rect x={220} y={352} width={300} height={22} fill="rgba(154,163,181,.12)" />
      {[245, 355, 465].map(x => <rect key={x} x={x} y={222} width={30} height={130} fill="rgba(154,163,181,.12)" />)}
    </g>
    {/* enrolamentos */}
    {[245, 355, 465].map(x => <g key={x}>
      <rect x={x - 12} y={232} width={10} height={110} rx={3} stroke={c('wind', '#F39200')} fill="rgba(243,146,0,.18)" />
      <rect x={x + 32} y={232} width={10} height={110} rx={3} stroke={c('wind', '#F39200')} fill="rgba(243,146,0,.18)" />
      <rect x={x - 26} y={238} width={11} height={98} rx={3} stroke={c('wind', '#E30613')} fill="rgba(227,6,19,.18)" />
      <rect x={x + 45} y={238} width={11} height={98} rx={3} stroke={c('wind', '#E30613')} fill="rgba(227,6,19,.18)" />
    </g>)}
    {/* OLTC */}
    <rect x={128} y={210} width={52} height={150} rx={6} stroke={c('oltc')} fill="rgba(125,216,247,.05)" />
    {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={154} cy={232 + i * 21} r={5} stroke={DIM} />)}
    <rect x={136} y={170} width={36} height={40} stroke={DIM} /><T x={154} y={165} s={10}>Motor</T>
    {/* radiadores */}
    <g stroke={c('cool', LINE)}>
      <path d="M560 210 H590 M560 370 H590" />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={590 + i * 14} y={200} width={9} height={180} rx={2} fill="rgba(125,216,247,.05)" />)}
      {[620, 700].map(x => <g key={x}><circle cx={x} cy={420} r={16} /><path d={`M${x - 12} 420 L${x + 12} 420 M${x} 408 L${x} 432`} className="spin-slow" style={{ transformOrigin: `${x}px 420px` }} /></g>)}
    </g>
    <path d="M520 200 C 560 180, 580 205, 595 205 M595 375 C 580 380, 560 390, 520 374" stroke="#29B5E8" className="flow" strokeWidth={2} />
    {/* sensor DGA */}
    <rect x={270} y={400} width={60} height={22} rx={4} stroke={c('oil')} fill="rgba(41,181,232,.1)" /><T x={300} y={415} s={10}>DGA</T>
    <T x={290} y={30}>{labels[0]}</T><T x={475} y={108}>{labels[1]}</T><T x={680} y={160}>Conservador</T><T x={675} y={198}>Radiadores ONAF</T><T x={154} y={378}>OLTC</T>
  </g>;
}

/* ───────── GIS — esquema unifilar de painel ───────── */
function Gis({ c }: P) {
  const bay = (x: number, main: boolean) => {
    const k = (id: string) => main ? c(id) : DIM;
    return <g key={x} fill="none" strokeWidth={1.8}>
      <rect x={x - 70} y={40} width={140} height={360} rx={14} stroke="rgba(125,216,247,.12)" strokeDasharray="4 6" />
      {[-22, 22].map((dx, i) => <g key={i} stroke={k('ds')}><path d={`M${x + dx} ${i ? 100 : 70} V122`} /><path d={`M${x + dx} 122 L${x + dx + 12} 140`} /><path d={`M${x + dx} 146 V160 H${x}`} /></g>)}
      <path d={`M${x} 160 V188`} stroke={k('cb')} />
      <rect x={x - 18} y={188} width={36} height={44} rx={4} stroke={k('cb')} fill={main ? 'rgba(243,146,0,.12)' : 'none'} />
      <path d={`M${x - 10} 222 L${x + 10} 198 M${x + 10} 222 L${x - 10} 198`} stroke={k('cb')} />
      <path d={`M${x} 232 V262`} stroke={LINE} />
      {[270, 290].map(y => <circle key={y} cx={x} cy={y} r={10} stroke={k('ct')} />)}
      <path d={`M${x} 300 V340`} stroke={LINE} />
      <g stroke={k('es')}><path d={`M${x} 318 H${x + 30} L${x + 44} 306`} /><path d={`M${x + 48} 318 V330 M${x + 40} 330 H${x + 56} M${x + 43} 335 H${x + 53}`} /></g>
      <path d={`M${x - 16} 340 H${x + 16} L${x + 8} 380 H${x - 8} Z`} stroke={k('cab')} fill={main ? 'rgba(125,216,247,.08)' : 'none'} />
      <path d={`M${x} 380 V410`} stroke={DIM} />
      <T x={x} y={428} s={10}>{main ? 'Painel L1 · Linha Vila Fria' : x < 400 ? 'Painel TP1' : 'Acoplamento'}</T>
    </g>;
  };
  return <g>
    <path d="M90 70 H710" stroke={c('bus')} strokeWidth={4} /><path d="M90 100 H710" stroke={c('bus')} strokeWidth={4} />
    <T x={80} y={74} a="end">BB1</T><T x={80} y={104} a="end">BB2</T>
    <path d="M90 70 H710" stroke="#29B5E8" className="flow" strokeWidth={2} />
    {bay(220, false)}{bay(400, true)}{bay(580, false)}
    <T x={460} y={214} a="start">Q0</T><T x={430} y={134} a="start">Q1/Q2</T><T x={448} y={300} a="start">Q8</T><T x={420} y={282} a="start">TI</T>
  </g>;
}

/* ───────── Carregador HV — diagrama de blocos ───────── */
function Charger({ c }: P) {
  const box = (x: number, y: number, w: number, h: number, id: string, label: string, sub?: string) => <g>
    <rect x={x} y={y} width={w} height={h} rx={10} fill="rgba(125,216,247,.05)" stroke={c(id)} strokeWidth={1.8} />
    <T x={x + w / 2} y={y + h / 2 + (sub ? -2 : 4)} s={12} o={.95}>{label}</T>{sub && <T x={x + w / 2} y={y + h / 2 + 14} s={10}>{sub}</T>}
  </g>;
  return <g fill="none">
    <g stroke={c('grid')} strokeWidth={1.8}><circle cx={70} cy={200} r={30} /><path d="M50 200 q 10 -18 20 0 t 20 0" /></g><T x={70} y={250}>Rede 400 V AC</T>
    {box(140, 160, 110, 80, 'grid', 'Filtro AC', 'PFC ativo')}
    <g>{Array.from({ length: 7 }, (_, i) => <g key={i}>
      <rect x={300 + (i % 4) * 52} y={120 + Math.floor(i / 4) * 92} width={44} height={78} rx={6} fill="rgba(243,146,0,.12)" stroke={c('pm', '#F39200')} strokeWidth={1.6} />
      <T x={322 + (i % 4) * 52} y={164 + Math.floor(i / 4) * 92} s={10} o={.9}>{`M${i + 1}`}</T></g>)}</g>
    <T x={402} y={108}>Módulos de potência AC/DC</T>
    {box(530, 160, 100, 80, 'dcdc', 'DC/DC', 'isolado')}
    {/* cabo e conector */}
    <path d="M630 200 C 670 200, 670 300, 700 300" stroke={c('cable')} strokeWidth={5} />
    <rect x={696} y={284} width={30} height={34} rx={8} stroke={c('cable')} strokeWidth={1.8} /><T x={712} y={340}>CCS2</T>
    {/* fluxo de energia */}
    <path d="M100 200 H140 M250 200 H300 M508 200 H530 M630 200 C 670 200, 670 300, 700 300" stroke="#FFCC00" strokeWidth={2} className="flow" />
    {/* arrefecimento */}
    <path d="M290 330 H520 V110 H290 Z" stroke={c('cool', '#29B5E8')} strokeDasharray="6 6" strokeWidth={1.6} className="flow-slow" />
    {box(330, 360, 80, 46, 'cool', 'Bomba')}{box(430, 360, 90, 46, 'cool', 'Radiador')}
    {box(560, 60, 120, 60, 'hmi', 'HMI', 'OCPP · 4G')}
    <path d="M620 120 V160" stroke={DIM} strokeDasharray="3 4" />
    <T x={405} y={430}>Circuito de arrefecimento líquido (glicol)</T>
  </g>;
}

/* ───────── Celas MT — vista frontal ───────── */
function Cells({ c }: P) {
  return <g fill="none" strokeWidth={1.6}>
    <rect x={90} y={54} width={620} height={14} stroke={c('bus')} fill="rgba(243,146,0,.12)" /><T x={400} y={46}>Barramento 2 500 A</T>
    {Array.from({ length: 5 }, (_, i) => {
      const x = 100 + i * 122, main = i === 2;
      const k = (id: string, f = LINE) => main ? c(id, f) : DIM;
      return <g key={i}>
        <rect x={x} y={70} width={110} height={340} rx={6} stroke={main ? LINE : DIM} fill="rgba(125,216,247,.03)" />
        <rect x={x + 8} y={78} width={94} height={70} rx={4} stroke={k('lv')} /><rect x={x + 18} y={88} width={44} height={28} rx={3} stroke={k('lv')} fill="rgba(41,181,232,.15)" />
        {[0, 1, 2].map(j => <circle key={j} cx={x + 76 + (j % 2) * 12} cy={92 + j * 12} r={3} fill={j === 0 ? '#22c55e' : 'rgba(255,255,255,.3)'} stroke="none" />)}
        <rect x={x + 8} y={156} width={94} height={120} rx={4} stroke={k('cb')} />
        <path d={`M${x + 55} 168 V196`} stroke={k('cb')} /><circle cx={x + 55} cy={214} r={18} stroke={k('cb')} fill={main ? 'rgba(243,146,0,.1)' : 'none'} /><path d={`M${x + 55} 232 V264`} stroke={k('cb')} />
        <rect x={x + 8} y={284} width={94} height={118} rx={4} stroke={k('cab')} />
        {[0, 1, 2].map(j => <g key={j} stroke={k('ct')}><circle cx={x + 30 + j * 25} cy={310} r={7} /><path d={`M${x + 30 + j * 25} 317 V380`} stroke={k('cab')} /></g>)}
        <T x={x + 55} y={428} s={10}>{['Chegada 1', 'Saída 6', 'Saída 7', 'Saída 8', 'TT'][i]}</T>
      </g>;
    })}
  </g>;
}

/* ───────── Automação — arquitetura IEC 61850 ───────── */
function Automation({ c }: P) {
  const box = (x: number, y: number, w: number, h: number, id: string, l: string) =>
    <g><rect x={x} y={y} width={w} height={h} rx={8} stroke={c(id)} fill="rgba(125,216,247,.05)" strokeWidth={1.6} /><T x={x + w / 2} y={y + h / 2 + 4} s={11} o={.95}>{l}</T></g>;
  return <g fill="none">
    <T x={30} y={60} a="start" s={10}>NÍVEL ESTAÇÃO</T><T x={30} y={250} a="start" s={10}>NÍVEL PAINEL</T><T x={30} y={390} a="start" s={10}>NÍVEL PROCESSO</T>
    {box(180, 40, 150, 50, 'scada', 'HMI ScateX#')}{box(360, 40, 150, 50, 'scada', 'CLP 500 (×2)')}{box(540, 40, 140, 50, 'gw', 'Gateway 104')}
    <path d="M680 65 H740" stroke={c('gw')} strokeDasharray="4 4" className="flow" /><T x={745} y={56} a="start" s={10}>Sacavém</T>
    <path d="M150 140 H700" stroke={c('swa', '#29B5E8')} strokeWidth={3} /><T x={710} y={144} a="start" s={10}>LAN A</T>
    <path d="M150 170 H700" stroke={c('swb', '#29B5E8')} strokeWidth={3} strokeDasharray={c('swb') === SC.critico ? '10 6' : undefined} /><T x={710} y={174} a="start" s={10}>LAN B</T>
    <path d="M150 140 H700" stroke="#7dd8f7" strokeWidth={1.5} className="flow" />
    {[255, 435, 610].map(x => <path key={x} d={`M${x} 90 V170`} stroke={DIM} />)}
    {Array.from({ length: 6 }, (_, i) => {
      const x = 160 + i * 92, bcu = i % 2 === 0;
      return <g key={i}>
        <path d={`M${x + 35} 140 V220 M${x + 45} 170 V220`} stroke={DIM} />
        {box(x, 220, 80, 56, bcu ? 'bcu' : 'prot', bcu ? 'BCU 500' : 'TPU S500')}
        <path d={`M${x + 40} 276 V350`} stroke={DIM} strokeDasharray="3 4" />
        <g stroke={DIM}><rect x={x + 26} y={350} width={28} height={28} rx={3} /><path d={`M${x + 30} 374 L${x + 50} 354`} /></g>
      </g>;
    })}
    <T x={420} y={430}>GOOSE · Sampled Values · PTP IEEE 1588</T>
  </g>;
}

/* ───────── Subestação de tração — unifilar ───────── */
function Traction({ c }: P) {
  return <g fill="none" strokeWidth={1.8}>
    <path d="M60 80 H740" stroke={c('mv')} strokeWidth={4} /><T x={60} y={68} a="start">15 kV AC</T>
    {[220, 500].map((x, i) => <g key={x}>
      <path d={`M${x} 80 V112`} stroke={c('mv')} /><rect x={x - 14} y={112} width={28} height={30} rx={3} stroke={c('mv')} />
      <path d={`M${x} 142 V164`} stroke={LINE} />
      <circle cx={x} cy={184} r={20} stroke={c('tr')} /><circle cx={x} cy={208} r={20} stroke={c('tr')} />
      <path d={`M${x} 228 V250`} stroke={LINE} />
      <rect x={x - 34} y={250} width={68} height={56} rx={6} stroke={c('rect')} fill="rgba(243,146,0,.08)" />
      <path d={`M${x - 12} 268 L${x + 12} 268 L${x} 290 Z M${x - 12} 290 H${x + 12}`} stroke={c('rect')} />
      <path d={`M${x} 306 V340`} stroke={LINE} />
      <T x={x + 40} y={196} a="start" s={10}>{`TR${i + 1} · 3,3 MW`}</T><T x={x + 42} y={282} a="start" s={10}>12 pulsos</T>
    </g>)}
    <g><path d="M360 80 V112" stroke={c('inv')} /><rect x={330} y={112} width={60} height={52} rx={6} stroke={c('inv')} strokeDasharray="5 4" /><T x={360} y={142} s={10}>Inversor</T><path d="M360 164 V340" stroke={c('inv')} strokeDasharray="5 4" /></g>
    <path d="M100 340 H700" stroke={c('dc', '#FFCC00')} strokeWidth={4} /><T x={100} y={330} a="start">Barramento 750 Vdc</T>
    {[160, 300, 440, 580].map(x => <g key={x}><path d={`M${x} 340 V364`} stroke={c('dc')} /><rect x={x - 12} y={364} width={24} height={22} rx={3} stroke={c('dc')} /><path d={`M${x} 386 V408`} stroke={c('cat')} /></g>)}
    <path d="M120 412 H640" stroke={c('cat')} strokeWidth={2} /><path d="M120 412 H640" stroke="#FFCC00" strokeWidth={1.5} className="flow" />
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${140 + i * 60} 412 l 15 14 l 15 -14`} stroke={DIM} strokeWidth={1} />)}
    <T x={380} y={445}>Catenária · Linha Rubi</T>
  </g>;
}

const DRAW: Record<AssetKind, (p: P) => React.ReactElement> = { transformador: Transformer, gis: Gis, carregador: Charger, celas: Cells, automacao: Automation, tracao: Traction };
export const HOTSPOT_POS: Record<AssetKind, Record<string, [number, number]>> = {
  transformador: { hv: [290, 70], oltc: [154, 300], core: [370, 210], wind: [500, 300], oil: [300, 411], cool: [660, 290], cons: [700, 113] },
  gis: { bus: [660, 85], cb: [400, 210], ds: [378, 132], es: [444, 318], ct: [400, 280], cab: [400, 360] },
  carregador: { grid: [246, 164], pm: [402, 200], dcdc: [626, 164], cool: [516, 364], cable: [712, 300], hmi: [676, 64] },
  celas: { lv: [340, 102], cb: [399, 214], bus: [500, 61], cab: [399, 360], ct: [374, 310] },
  automacao: { scada: [326, 44], gw: [676, 44], swa: [560, 140], swb: [560, 170], bcu: [236, 224], prot: [328, 224] },
  tracao: { mv: [640, 80], tr: [220, 196], rect: [530, 254], inv: [386, 116], dc: [640, 340], cat: [600, 412] },
};

export default function Schematic({ kind, hotspots, selected, onSelect, labels }: { kind: AssetKind; hotspots: Hotspot[]; selected?: string; onSelect: (id: string) => void; labels?: string[] }) {
  const [hover, setHover] = useState<string | null>(null);
  const hs = Object.fromEntries(hotspots.map(h => [h.id, h]));
  const c = (id: string, fallback = LINE) => { const s = hs[id]?.status; return s && s !== 'ok' ? SC[s] : fallback; };
  const Draw = DRAW[kind];
  const pos = HOTSPOT_POS[kind];
  const active = hover ?? selected;
  const h = active ? hs[active] : null;
  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox="0 0 800 460" style={{ width: '100%', display: 'block', borderRadius: 14, background: 'radial-gradient(ellipse at 50% 40%, #0c2033, #060b14 75%)' }}>
        <defs>
          <pattern id="bp" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="rgba(125,216,247,.06)" /></pattern>
          <pattern id="bp2" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M100 0H0V100" fill="none" stroke="rgba(125,216,247,.1)" /></pattern>
          <filter id="glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <rect width="800" height="460" fill="url(#bp)" /><rect width="800" height="460" fill="url(#bp2)" />
        <g filter="url(#glow)"><Draw hs={hs} c={c} labels={labels} /></g>
        {hotspots.map(x => {
          const p = pos[x.id]; if (!p) return null;
          const col = SC[x.status], on = active === x.id;
          return <g key={x.id} style={{ cursor: 'pointer' }} onMouseEnter={() => setHover(x.id)} onMouseLeave={() => setHover(null)} onClick={() => onSelect(x.id)}>
            <circle cx={p[0]} cy={p[1]} r={on ? 16 : 12} fill={col} opacity={.18} className={x.status !== 'ok' ? 'hs-pulse' : undefined} style={{ transformOrigin: `${p[0]}px ${p[1]}px` }} />
            <circle cx={p[0]} cy={p[1]} r={6} fill={col} stroke="#fff" strokeWidth={on ? 2.5 : 1.5} />
          </g>;
        })}
        <g fontFamily="ui-monospace, Menlo, monospace" fontSize={10} fill="#7dd8f7" opacity={.55}>
          <text x={16} y={448}>EFACEC · DESENHO ESQUEMÁTICO · NÃO À ESCALA</text><text x={784} y={448} textAnchor="end">NEXUS DIGITAL TWIN · LIVE</text>
        </g>
      </svg>
      {h && <div className="glass" style={{ position: 'absolute', top: 14, left: 14, padding: '10px 14px', borderRadius: 12, background: 'rgba(8,12,22,.9)', borderColor: SC[h.status] + '88', pointerEvents: 'none' }}>
        <div style={{ fontSize: 12, display: 'flex', gap: 8, alignItems: 'center' }}><span className={`dot ${h.status}`} /><b>{h.label}</b></div>
        <div style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 13, marginTop: 4 }}>{h.value}</div>
      </div>}
    </div>
  );
}
