// Efacec Nexus — catálogo de módulos (dados simulados, coerentes entre páginas)
import { domains, series, pie, type Kpi, type Chart, type Asset, type Agent } from './domains';

export type Insight = { sev: 'alta' | 'media' | 'info'; title: string; text: string; owner: string; cta: string };
export type Block =
  | { t: 'kpis'; items: Kpi[] }
  | { t: 'chart'; c: Chart; span?: 2 }
  | { t: 'table'; title: string; columns: string[]; rows: Record<string, string>[]; span?: 2; source?: string }
  | { t: 'map'; title: string; assets: Asset[] }
  | { t: 'agents'; items: Agent[] }
  | { t: 'insights'; items: Insight[]; span?: 2 }
  | { t: 'funnel'; title: string; stages: [string, number, string][]; span?: 2 };
export type Section = { id: string; label: string; icon: string; blocks: Block[] };
export type Group = 'inicio' | 'funcoes' | 'negocio' | 'plataforma';
export type Module = {
  slug: string; group: Group; name: string; short: string; icon: string; color: string;
  owner: string; tagline: string; sources: string[]; sections: Section[];
  questions: { q: string; a: string }[];
};

const k = (label: string, value: string, delta: string, up = true, good = true): Kpi => ({ label, value, delta, up, good });
const ch = (id: string, title: string, subtitle: string, kind: Chart['kind'], keys: string[], data: Chart['data'], insight: string, forecast: string, action: string): Chart =>
  ({ id, title, subtitle, kind, keys, data, insight, forecast, action });
const rows = (cols: string[], data: string[][]) => data.map(r => Object.fromEntries(cols.map((c, i) => [c, r[i]])));
const tbl = (title: string, columns: string[], data: string[][], source?: string, span?: 2): Block => ({ t: 'table', title, columns, rows: rows(columns, data), source, span });
const bars = (key: string, items: [string, number][]) => items.map(([m, v]) => ({ m, [key]: v }));
const dom = (slug: string) => domains.find(d => d.slug === slug)!;

/* ─────────────────────────── SUPPLY CHAIN ─────────────────────────── */
const sc = dom('supply-chain');
const suppliers: Asset[] = [
  ...sc.assets,
  { name: 'Nexans — Lens', type: 'Fornecedor · Cobre CTC', lat: 50.43, lng: 2.83, status: 'ok', detail: 'OTIF 96%' },
  { name: 'Weidmann — Rapperswil', type: 'Fornecedor · Isolamento', lat: 47.23, lng: 8.82, status: 'ok', detail: 'OTIF 93%' },
  { name: 'POSCO — Pohang', type: 'Fornecedor em qualificação', lat: 36.02, lng: 129.34, status: 'aviso', detail: 'Amostras em ensaio' },
  { name: 'Reinhausen — Regensburg', type: 'Fornecedor · Comutadores OLTC', lat: 49.01, lng: 12.1, status: 'ok', detail: 'OTIF 98%' },
  { name: 'Porto de Sines', type: 'Logística', lat: 37.95, lng: -8.87, status: 'ok', detail: '3 cargas especiais' },
  { name: 'Porto de Savannah (EUA)', type: 'Logística', lat: 32.08, lng: -81.09, status: 'aviso', detail: 'TP 336 MVA em desalfandegamento' },
];
const supplyChain: Module = {
  slug: 'supply-chain', group: 'funcoes', name: 'Supply Chain', short: 'Supply Chain', icon: 'Boxes', color: '#F97316',
  owner: 'Direção de Supply Chain · Rui Carvalho', tagline: 'Planeamento S&OP, compras, fornecedores, inventário e logística global',
  sources: ['SAP S/4HANA MM/PP', 'Ariba', 'Kinaxis', 'LME Market Data', 'Transportadoras (EDI)'],
  sections: [
    { id: 'geral', label: 'Visão geral', icon: 'LayoutGrid', blocks: [
      { t: 'kpis', items: [...sc.kpis] },
      { t: 'insights', span: 2, items: [
        { sev: 'alta', title: 'Rutura de aço GO em 23 dias', text: 'Cobertura de aço de grão orientado M0H cai abaixo do stock de segurança a 11 Dez com o atraso da ThyssenKrupp. Afeta 3 transformadores (OF-7781, OF-7790, OF-7822).', owner: 'Compras Estratégicas', cta: 'Ver plano de mitigação' },
        { sev: 'media', title: 'Custo de frete marítimo +14%', text: 'Rotas Leixões → Savannah subiram 14% em 30 dias. 2 cargas especiais previstas para Jan.', owner: 'Logística', cta: 'Comparar transitários' },
        { sev: 'info', title: 'Poupança de €2,1 M negociada', text: 'Acordo-quadro de cobre CTC com a Nexans fixa prémio de conversão até Dez 2027.', owner: 'Compras', cta: 'Ver contrato' },
      ] },
      ...sc.charts.map(c => ({ t: 'chart', c }) as Block),
    ] },
    { id: 'planeamento', label: 'Planeamento S&OP', icon: 'CalendarRange', blocks: [
      { t: 'kpis', items: [k('Precisão da previsão', '87,4%', '+2,9 pp'), k('Utilização de capacidade', '92%', '+4 pp', true, false), k('Faltas MRP abertas', '146', '-38'), k('Ciclo S&OP', 'Nov · fechado', 'Consenso a 14 Nov')] },
      { t: 'chart', c: ch('pl1', 'Procura vs. capacidade (horas-homem)', 'Fábrica de Arroteia · próximos 12 meses', 'area', ['Procura', 'Capacidade'],
        series(61, [['Procura', 41000, 6000], ['Capacidade', 42000, 1500]]),
        'Procura excede capacidade em Mar–Mai 2027 (+7%) com o pico de encomendas dos EUA.', 'Sem ação, 4 expedições escorregam 3–5 semanas.', 'Antecipar subcontratação de bobinagem de 2 unidades médias.') },
      { t: 'chart', c: ch('pl2', 'Precisão da previsão por família (%)', 'MAPE invertido', 'bar', ['Precisão'],
        bars('Precisão', [['Transformadores', 91], ['GIS/AIS', 86], ['Celas MT', 84], ['Carregadores', 79], ['Automação', 88]]),
        'Carregadores com a pior precisão — volatilidade de concursos públicos de mobilidade.', 'Modelo Cortex com features de concursos sobe para 85%.', 'Ligar dados de concursos públicos (Base.gov, TED) ao modelo.') },
      tbl('Faltas críticas MRP', ['Material', 'Descrição', 'Necessidade', 'Disponível', 'Falta', 'Impacto'], [
        ['100-48211', 'Aço GO M0H 0,23 mm', '420 t', '188 t', '232 t', 'OF-7781, OF-7822'],
        ['220-11904', 'Ampola de vácuo 24 kV', '1 800 un', '640 un', '1 160 un', 'Normafix'],
        ['310-77210', 'Módulo de potência 50 kW', '960 un', '710 un', '250 un', 'HV350'],
        ['140-20033', 'Óleo isolante Nytro 4000X', '310 m³', '260 m³', '50 m³', 'Linha 3'],
      ], 'SAP PP · MRP Live', 2),
    ] },
    { id: 'compras', label: 'Compras', icon: 'ShoppingCart', blocks: [
      { t: 'kpis', items: [k('Spend YTD', '€268 M', '+7% a/a', true, false), k('Spend sob contrato', '74%', '+6 pp'), k('Poupança negociada', '€11,6 M', '+€2,1 M'), k('Ciclo P2P', '9,2 dias', '-1,4 dias', false)] },
      { t: 'chart', c: ch('co1', 'Spend por categoria (€M)', 'YTD', 'pie', ['v'],
        pie([['Cobre & condutores', 82], ['Aço magnético', 61], ['Eletrónica', 44], ['Isolamento & óleo', 31], ['Mecânica & caldeiraria', 28], ['Serviços', 22]]),
        'Cobre e aço magnético concentram 53% do spend — ambos indexados a mercado.', 'Exposição a matérias-primas de €143 M em 2027.', 'Alargar cobertura forward de cobre para 60% do T1.') },
      { t: 'chart', c: ch('co2', 'Poupança mensal vs. objetivo (€M)', '2026', 'line', ['Real', 'Objetivo'],
        series(63, [['Real', 5, 6], ['Objetivo', 5.5, 5]]),
        'Poupança acima do objetivo desde Jul graças a leilões eletrónicos de caldeiraria.', 'Fecho do ano em €12,8 M (objetivo €11 M).', 'Replicar leilões para serviços de transporte.') },
      tbl('Encomendas de compra críticas', sc.table.columns, sc.table.rows.map(r => sc.table.columns.map(c => r[c])), 'SAP MM · EKKO/EKPO', 2),
    ] },
    { id: 'fornecedores', label: 'Fornecedores', icon: 'Factory', blocks: [
      { t: 'kpis', items: [k('Fornecedores ativos', '1 284', '+42'), k('Críticos', '64', '5 em risco', true, false), k('OTIF fornecedores', '89,6%', '-1,8 pp', false, false), k('Em qualificação', '7', 'POSCO, 2 asiáticos')] },
      { t: 'map', title: 'Rede de fornecedores e logística', assets: suppliers },
      { t: 'chart', c: sc.charts[1] },
      tbl('Scorecard de fornecedores críticos', ['Fornecedor', 'Categoria', 'OTIF', 'Qualidade (ppm)', 'Risco', 'Dependência'], [
        ['ThyssenKrupp Electrical Steel', 'Aço GO', '78%', '120', 'Crítico', '48%'],
        ['Nexans', 'Cobre CTC', '96%', '40', 'Baixo', '35%'],
        ['Nynas', 'Óleo isolante', '88%', '15', 'Aviso', '62%'],
        ['Weidmann', 'Isolamento celulósico', '93%', '60', 'Baixo', '71%'],
        ['Maschinenfabrik Reinhausen', 'Comutadores OLTC', '98%', '10', 'Baixo', '80%'],
        ['Siemens Energy', 'Buchas AT', '91%', '25', 'Baixo', '44%'],
      ], 'Ariba SLP + SAP QM', 2),
    ] },
    { id: 'inventario', label: 'Inventário', icon: 'Warehouse', blocks: [
      { t: 'kpis', items: [k('Valor em stock', '€86,4 M', '-€4,1 M', false), k('Cobertura média', '42 dias', '-3 dias', false), k('Obsoleto / lento', '€6,2 M', '-12%', false), k('Precisão inventário', '98,9%', '+0,4 pp')] },
      { t: 'chart', c: ch('in1', 'Valor de stock por armazém (€M)', 'Mensal', 'bar', ['Arroteia', 'Maia', 'Trânsito'],
        series(67, [['Arroteia', 48, 5], ['Maia', 26, 3], ['Trânsito', 12, 4]]),
        'Stock em trânsito subiu 30% com as cargas para os EUA.', 'Normaliza em Fev após entrega da OF-7790.', 'Rever incoterms DAP → FCA para reduzir capital empatado.') },
      { t: 'chart', c: ch('in2', 'Classificação ABC/XYZ (€M)', 'Stock atual', 'pie', ['v'],
        pie([['AX', 31], ['AY', 18], ['BX', 12], ['BZ', 9], ['CZ (lento)', 6.2], ['Outros', 10.2]]),
        '€6,2 M em CZ sem consumo há > 18 meses — 70% são peças de retrofit.', 'Venda via Serviços pode recuperar €1,9 M.', 'Disponibilizar peças CZ no catálogo de pós-venda.') },
      tbl('Artigos de movimento lento', ['Material', 'Descrição', 'Valor', 'Último consumo', 'Proposta'], [
        ['500-11872', 'Disjuntor SF₆ 72,5 kV (legado)', '€412 k', 'Mar 2024', 'Retrofit EDM'],
        ['510-30021', 'Relé TPU L420 (v3)', '€188 k', 'Jan 2025', 'Upgrade de frota'],
        ['520-44810', 'Bucha 245 kV', '€156 k', 'Jun 2024', 'Stock estratégico'],
      ], 'SAP MM · MB52', 2),
    ] },
    { id: 'logistica', label: 'Logística', icon: 'Truck', blocks: [
      { t: 'kpis', items: [k('Expedições (mês)', '1 412', '+9%'), k('Cargas especiais', '6', '2 para EUA'), k('Entregas a tempo', '93,1%', '+1,2 pp'), k('Custo frete / vendas', '3,4%', '+0,3 pp', true, false)] },
      { t: 'map', title: 'Cargas em trânsito', assets: suppliers.filter(a => /Logística|Fábrica|Armazém/.test(a.type)).concat([
        { name: 'TP 400 kV → Eskom', type: 'Carga especial · navio', lat: -10.5, lng: 5.2, status: 'ok', detail: 'ETA Durban 09 Dez' },
        { name: 'Celas Fluokit → Vattenfall', type: 'Camião', lat: 47.9, lng: 1.9, status: 'ok', detail: 'ETA 21 Nov' },
      ]) },
      { t: 'chart', c: ch('lo1', 'Custo de frete por rota (€k)', 'Mensal', 'line', ['Europa', 'EUA', 'África'],
        series(71, [['Europa', 420, 60], ['EUA', 610, 120], ['África', 280, 70]]),
        'Rota EUA com maior volatilidade — 2 transitários concentram 85%.', 'Concurso de transitários poupa ~€540 k/ano.', 'Lançar RFQ de frete marítimo para 2027.') },
    ] },
    { id: 'agentes', label: 'Agentes', icon: 'Bot', blocks: [{ t: 'agents', items: [...sc.agents, ...dom('transformadores').agents.filter(a => a.id === 'a2'), ...dom('aparelhagem').agents.filter(a => a.id === 'b2')] }] },
  ],
  questions: [
    ...sc.questions,
    { q: 'Que faltas MRP afetam expedições este trimestre?', a: '**232 t de aço GO** (OF-7781, OF-7822) e **1 160 ampolas de vácuo** (Normafix). A PO-55120 cobre 70% das ampolas; para o aço, o agente recomenda antecipar POSCO.' },
    { q: 'Quanto stock está parado?', a: '**€6,2 M** em artigos CZ sem consumo há mais de 18 meses. Proposta: €1,9 M vendáveis via catálogo de pós-venda.' },
  ],
};

/* ─────────────────────────── COMERCIAL ─────────────────────────── */
const markets: Asset[] = [
  { name: 'Portugal', type: 'Mercado doméstico', lat: 39.6, lng: -8.0, status: 'ok', detail: 'Vendas €142 M · REN, E-Redes, IP' },
  { name: 'Espanha', type: 'Mercado', lat: 40.4, lng: -3.7, status: 'ok', detail: 'Vendas €38 M · Iberdrola, Endesa' },
  { name: 'EUA', type: 'Mercado estratégico', lat: 38.9, lng: -77.0, status: 'ok', detail: 'Vendas €96 M · Dominion, Duke' },
  { name: 'Reino Unido & Irlanda', type: 'Mercado', lat: 53.35, lng: -6.26, status: 'ok', detail: 'Vendas €24 M · ESB, Irish Rail' },
  { name: 'Argélia', type: 'Mercado', lat: 36.75, lng: 3.06, status: 'aviso', detail: 'Vendas €21 M · pagamentos lentos' },
  { name: 'Moçambique', type: 'Mercado', lat: -25.96, lng: 32.58, status: 'ok', detail: 'Vendas €18 M · EDM' },
  { name: 'África do Sul', type: 'Mercado', lat: -26.2, lng: 28.05, status: 'aviso', detail: 'Vendas €27 M · Eskom (DSO 105 d)' },
  { name: 'Chile', type: 'Mercado', lat: -33.45, lng: -70.66, status: 'ok', detail: 'Vendas €14 M' },
  { name: 'Nórdicos', type: 'Mercado', lat: 59.33, lng: 18.06, status: 'ok', detail: 'Vendas €31 M · Vattenfall' },
  { name: 'Brasil', type: 'Mercado emergente', lat: -23.55, lng: -46.63, status: 'ok', detail: 'Pipeline €48 M' },
];
const comercial: Module = {
  slug: 'comercial', group: 'funcoes', name: 'Comercial & Vendas', short: 'Comercial', icon: 'Handshake', color: '#E30613',
  owner: 'Direção Comercial · Inês Barbosa', tagline: 'Pipeline, propostas e concursos, clientes, mercados e previsão de encomendas',
  sources: ['Salesforce Sales Cloud', 'SAP SD', 'CPQ Efacec', 'Portais de concursos (TED, Base.gov)'],
  sections: [
    { id: 'geral', label: 'Visão geral', icon: 'LayoutGrid', blocks: [
      { t: 'kpis', items: [k('Encomendas YTD', '€531 M', '+22% a/a'), k('Carteira (backlog)', '€1,12 mM', '+21%'), k('Win rate', '31,4%', '+3,8 pp'), k('Margem média proposta', '24,6%', '-0,9 pp', false, false)] },
      { t: 'insights', span: 2, items: [
        { sev: 'alta', title: 'Concurso REN 400 kV fecha em 9 dias', text: 'Proposta de 3 transformadores 450 MVA (€38 M) ainda sem aprovação de margem. Modelo de win-probability: 62% ao preço atual, 78% com -2%.', owner: 'Key Account REN', cta: 'Abrir simulação de preço' },
        { sev: 'media', title: 'Margem a cair em celas MT', text: 'Margem média de propostas Normafix desceu 2,1 pp em 90 dias — pressão de concorrentes asiáticos em Espanha.', owner: 'Produto Aparelhagem', cta: 'Ver análise competitiva' },
        { sev: 'info', title: 'Oportunidade de cross-sell', text: '14 clientes de transformadores sem contrato de monitorização — potencial de €3,4 M/ano em serviços.', owner: 'Serviços', cta: 'Gerar lista' },
      ] },
      { t: 'chart', c: ch('cm1', 'Encomendas por unidade de negócio (€M)', 'Mensal', 'bar', ['Energia', 'Mobilidade', 'Ferrovia', 'Serviços'],
        series(81, [['Energia', 30, 10], ['Mobilidade', 8, 4], ['Ferrovia', 5, 4], ['Serviços', 7, 2]]),
        'Energia representa 63% das encomendas; Mobilidade cresce 34% a/a.', 'Encomendas de €590 M em 2026 (±4%).', 'Reforçar equipa de propostas EUA (2 FTE).') },
      { t: 'chart', c: dom('transformadores').charts[1] },
    ] },
    { id: 'pipeline', label: 'Pipeline', icon: 'Filter', blocks: [
      { t: 'funnel', title: 'Funil comercial (12 meses)', stages: [['Leads qualificados', 412, '€2,9 mM'], ['Pedido de proposta', 236, '€1,8 mM'], ['Proposta submetida', 148, '€1,2 mM'], ['Negociação', 61, '€486 M'], ['Ganho', 46, '€531 M']] },
      { t: 'chart', c: ch('pi1', 'Pipeline ponderado por trimestre (€M)', 'Por probabilidade', 'area', ['Commit', 'Best case', 'Pipeline'],
        [['T1 27', 120, 60, 140], ['T2 27', 96, 80, 180], ['T3 27', 70, 90, 210], ['T4 27', 40, 70, 260]].map(([m, a, b, c]) => ({ m, Commit: a, 'Best case': b, Pipeline: c })),
        'Cobertura de pipeline de 2,8× o objetivo de 2027.', 'Probabilidade de cumprir objetivo de €620 M: 81%.', 'Focar 12 oportunidades best-case > €5 M.') },
      tbl('Principais oportunidades', ['Oportunidade', 'Cliente', 'País', 'Valor', 'Fase', 'Probab.', 'Fecho'], [
        ['3× TP 450 MVA 400 kV', 'REN', 'Portugal', '€38,0 M', 'Proposta', '62%', 'Nov 2026'],
        ['Subestações 345 kV', 'Duke Energy', 'EUA', '€54,2 M', 'Negociação', '55%', 'Jan 2027'],
        ['Rede HV350 corredores', 'IONITY', 'Europa', '€21,5 M', 'Negociação', '70%', 'Dez 2026'],
        ['Eletrificação Linha do Norte', 'Infraestruturas de Portugal', 'Portugal', '€46,8 M', 'Concurso', '35%', 'Mar 2027'],
        ['GIS 245 kV', 'Elia', 'Bélgica', '€18,9 M', 'Proposta', '40%', 'Fev 2027'],
        ['SCADA distribuição', 'EDM', 'Moçambique', '€9,4 M', 'Negociação', '75%', 'Dez 2026'],
      ], 'Salesforce · Opportunity', 2),
    ] },
    { id: 'propostas', label: 'Propostas & Concursos', icon: 'FileSignature', blocks: [
      { t: 'kpis', items: [k('Propostas em curso', '58', '+7'), k('Tempo médio de resposta', '18 dias', '-4 dias', false), k('Hit rate concursos públicos', '27%', '+2 pp'), k('Desconto médio', '6,8%', '+0,7 pp', true, false)] },
      { t: 'chart', c: ch('pr1', 'Hit rate por unidade (%)', 'Últimos 12 meses', 'bar', ['Hit rate'],
        bars('Hit rate', [['Transformadores', 38], ['Aparelhagem', 29], ['Automação', 34], ['Mobilidade', 24], ['Ferrovia', 22]]),
        'Transformadores com maior hit rate — lead time competitivo vs. concorrentes europeus.', 'Mobilidade sobe para 30% com nova gama HV350 v2.', 'Priorizar concursos com lead time como critério.') },
      { t: 'chart', c: ch('pr2', 'Margem proposta vs. margem real (%)', 'Projetos fechados', 'line', ['Proposta', 'Real'],
        series(83, [['Proposta', 25, 2], ['Real', 23, 3]]),
        'Erosão média de 1,8 pp entre proposta e execução — sobretudo em ferrovia.', 'Modelo de risco de margem identifica 4 propostas atuais em risco.', 'Rever contingências em propostas de ferrovia.') },
      tbl('Concursos com prazo próximo', ['Concurso', 'Entidade', 'Valor estimado', 'Prazo', 'Estado'], [
        ['TED 2026/S 214-55102', 'Elia', '€18,9 M', '02 Dez', 'Em preparação'],
        ['Base.gov 1442/2026', 'Metro do Porto', '€12,3 M', '27 Nov', 'Aprovação interna'],
        ['RFP-ESB-2026-31', 'ESB Networks', '€7,8 M', '15 Dez', 'Em preparação'],
      ], 'CPQ Efacec + TED', 2),
    ] },
    { id: 'clientes', label: 'Clientes', icon: 'Building2', blocks: [
      { t: 'kpis', items: [k('Clientes ativos', '1 870', '+96'), k('Top 10 % vendas', '48%', '-2 pp', false), k('NPS', '46', '+5'), k('Clientes em risco', '9', 'churn > 40%', true, false)] },
      tbl('Top clientes (12 meses)', ['Cliente', 'Segmento', 'Vendas', 'Carteira', 'NPS', 'Tendência'], [
        ['REN', 'Operador de transporte', '€61,2 M', '€142 M', '52', '↑'],
        ['E-Redes', 'Distribuição', '€48,7 M', '€96 M', '44', '→'],
        ['Dominion Energy', 'Utility EUA', '€39,0 M', '€121 M', '58', '↑'],
        ['Infraestruturas de Portugal', 'Ferrovia', '€27,4 M', '€88 M', '31', '↓'],
        ['IONITY', 'Mobilidade', '€22,8 M', '€34 M', '49', '↑'],
        ['Eskom', 'Utility', '€19,6 M', '€64 M', '28', '↓'],
      ], 'Salesforce + SAP SD', 2),
      { t: 'chart', c: ch('cl1', 'NPS por segmento', 'Inquérito semestral', 'bar', ['NPS'],
        bars('NPS', [['Utilities', 51], ['Distribuição', 44], ['Ferrovia', 31], ['Mobilidade', 49], ['Indústria', 40]]),
        'Ferrovia com NPS mais baixo — atrasos de obra mencionados em 64% dos comentários.', 'Recuperação para 40 com cumprimento da Linha Rubi.', 'Plano de comunicação de obra com Metro do Porto.') },
    ] },
    { id: 'mercados', label: 'Mercados', icon: 'Globe2', blocks: [
      { t: 'map', title: 'Presença comercial global', assets: markets },
      { t: 'chart', c: ch('mk1', 'Vendas internacionais (% total)', 'Mensal', 'line', ['Internacional'],
        series(87, [['Internacional', 66, 4]]),
        '69% das vendas fora de Portugal — máximo histórico.', '72% em 2027 com EUA e Nórdicos.', 'Abrir escritório comercial em Houston.') },
    ] },
    { id: 'previsao', label: 'Previsão', icon: 'TrendingUp', blocks: [
      { t: 'chart', span: 2, c: ch('fc1', 'Previsão de encomendas (€M)', 'Cortex ML Forecast · intervalo 80%', 'area', ['Real', 'Previsão', 'Limite superior'],
        series(89, [['Real', 44, 10], ['Previsão', 46, 6], ['Limite superior', 54, 6]]),
        'Sazonalidade forte em Dez (fecho de orçamentos das utilities).', 'Encomendas 2027: €620 M (IC 80%: €575–668 M).', 'Partilhar previsão com S&OP para planeamento de capacidade.') },
    ] },
    { id: 'agentes', label: 'Agentes', icon: 'Bot', blocks: [{ t: 'agents', items: [
      { id: 'cm-a1', name: 'Otimização de preço em propostas', trigger: 'Proposta > €5 M pronta para aprovação', mode: 'humano', approver: 'Inês Barbosa — Diretora Comercial', impact: '+4 pp win rate · margem protegida',
        steps: [
          { title: 'Insight', detail: 'Proposta REN 3× TP 450 MVA com margem de 23,1% e prazo a 9 dias.' },
          { title: 'Diagnóstico', detail: 'Win-probability 62%; 3 concorrentes prováveis; preço 4% acima da média histórica ganha.' },
          { title: 'Recomendação', detail: 'Reduzir preço 2% e oferecer monitorização DGA 5 anos (margem 41%).' },
          { title: 'Aprovação', detail: 'Requer aprovação da Diretora Comercial (desvio de margem > 1 pp).' },
          { title: 'Ação', detail: 'Proposta revista gerada no CPQ e submetida ao portal da REN.' },
        ] },
      { id: 'cm-a2', name: 'Deteção de concursos relevantes', trigger: 'Novo anúncio TED / Base.gov', mode: 'auto', impact: '+38 concursos qualificados/ano',
        steps: [
          { title: 'Insight', detail: 'Novo anúncio TED: Elia GIS 245 kV, €18,9 M.' },
          { title: 'Diagnóstico', detail: 'Cortex classifica fit de 92% com portefólio de aparelhagem AT.' },
          { title: 'Recomendação', detail: 'Criar oportunidade e atribuir ao Key Account Benelux.' },
          { title: 'Ação', detail: 'Oportunidade criada no Salesforce com resumo do caderno de encargos.' },
        ] },
    ] }] },
  ],
  questions: [
    { q: 'Qual a probabilidade de ganhar o concurso da REN?', a: '**62%** ao preço atual. Com redução de 2% e oferta de monitorização DGA, sobe para **78%** — o agente já preparou a proposta revista para aprovação da Inês Barbosa.' },
    { q: 'Vamos cumprir o objetivo de encomendas de 2027?', a: 'Previsão Cortex de **€620 M** (IC 80%: €575–668 M) com 81% de probabilidade de cumprir. Cobertura de pipeline de 2,8×.' },
    { q: 'Que clientes estão em risco?', a: '**9 clientes** com risco de churn > 40%, liderados por Infraestruturas de Portugal (NPS 31) e Eskom (NPS 28, DSO 105 dias).' },
  ],
};

/* ─────────────────────────── SERVIÇOS ─────────────────────────── */
const sv = dom('servicos');
const installed: Asset[] = [...dom('transformadores').assets.filter(a => a.type === 'Instalado'), ...dom('aparelhagem').assets.filter(a => a.type === 'Instalado'), ...sv.assets];
const servicos: Module = {
  slug: 'servicos', group: 'funcoes', name: 'Serviços & Pós-venda', short: 'Serviços', icon: 'Wrench', color: '#10B981',
  owner: 'Direção de Serviços · Paulo Teixeira', tagline: 'Base instalada, contratos, ordens de serviço, peças e equipas de campo em +65 países',
  sources: ['SAP PM/CS', 'Salesforce Field Service', 'Sensores IoT (Hydran, densímetros)', 'OCPP'],
  sections: [
    { id: 'geral', label: 'Visão geral', icon: 'LayoutGrid', blocks: [
      { t: 'kpis', items: sv.kpis },
      { t: 'insights', span: 2, items: [
        { sev: 'alta', title: 'TP 345 kV Dominion Energy em estado crítico', text: 'Ponto quente a 108 °C (limite 110 °C). Recomendado reduzir carga para 85% e inspeção em 72 h.', owner: 'Field Service EUA', cta: 'Abrir ordem de serviço' },
        { sev: 'media', title: '9 contratos em risco de não renovar', text: '€2,7 M de receita anual em contratos com SLA falhado ou NPS < 6.', owner: 'Key Accounts', cta: 'Ver propostas' },
        { sev: 'info', title: 'Mercado de retrofit em Portugal', text: '312 subestações com mais de 25 anos — mercado endereçável de €140 M.', owner: 'Comercial Serviços', cta: 'Exportar lista' },
      ] },
      ...sv.charts.map(c => ({ t: 'chart', c }) as Block),
    ] },
    { id: 'base', label: 'Base instalada', icon: 'MapPinned', blocks: [
      { t: 'kpis', items: [k('Ativos monitorizados', '18 420', '+1 340'), k('Idade média', '17,3 anos', '+0,4'), k('Saúde média (índice)', '82/100', '+3'), k('Ativos críticos', '4', 'em 3 países', true, false)] },
      { t: 'map', title: 'Base instalada monitorizada', assets: installed },
      { t: 'chart', c: ch('bi1', 'Distribuição por idade (unidades)', 'Transformadores de potência', 'bar', ['Unidades'],
        bars('Unidades', [['0–5', 410], ['5–10', 520], ['10–20', 880], ['20–30', 640], ['30+', 312]]),
        '952 transformadores com mais de 20 anos — janela de retrofit/substituição.', 'Procura de substituição de €210 M até 2030.', 'Campanha de avaliação de condição para clientes com frota 30+.') },
    ] },
    { id: 'ordens', label: 'Ordens de serviço', icon: 'ClipboardList', blocks: [
      { t: 'kpis', items: [k('OS abertas', '642', '-8%', false), k('Tempo médio de resolução', '3,2 dias', '-0,6', false), k('Cumprimento SLA', '94,7%', '+1,9 pp'), k('Resolvidas remotamente', '38%', '+9 pp')] },
      tbl(sv.table.title, sv.table.columns, sv.table.rows.map(r => sv.table.columns.map(c => r[c])).concat([
        ['OS-55803', 'Iberdrola', 'Tâmega', 'Marta Sousa', 'Planeada'], ['OS-55798', 'Metro do Porto', 'Porto', 'Hugo Matos', 'Concluída'],
      ]), 'Salesforce Field Service', 2),
      { t: 'chart', c: ch('os1', 'Backlog de OS por prioridade', 'Semanal', 'area', ['P1', 'P2', 'P3'],
        series(91, [['P1', 40, 15], ['P2', 180, 30], ['P3', 420, 50]]),
        'Backlog P1 estável; P3 a cair com despacho otimizado.', '-15% backlog até Jan.', 'Converter P3 recorrentes em manutenção preditiva.') },
    ] },
    { id: 'contratos', label: 'Contratos', icon: 'FileCheck2', blocks: [
      { t: 'kpis', items: [k('Contratos ativos', '1 146', '+72'), k('Receita recorrente', '€42 M/ano', '+16%'), k('Taxa de renovação', '89%', '+3 pp'), k('A renovar em 90 dias', '38', '€8,4 M')] },
      tbl('Contratos a renovar', ['Contrato', 'Cliente', 'Tipo', 'Valor anual', 'Fim', 'Risco'], [
        ['SC-2019-041', 'REN', 'Monitorização DGA', '€1,2 M', 'Jan 2027', 'Baixo'],
        ['SC-2020-117', 'Eskom', 'Manutenção total', '€0,9 M', 'Dez 2026', 'Crítico'],
        ['SC-2021-088', 'IONITY', 'Uptime 98% HV350', '€1,6 M', 'Fev 2027', 'Aviso'],
        ['SC-2022-012', 'Metro de Lisboa', 'Subestações tração', '€0,7 M', 'Jan 2027', 'Baixo'],
      ], 'SAP CS · Contratos', 2),
      { t: 'agents', items: sv.agents.filter(a => a.id === 'f2') },
    ] },
    { id: 'pecas', label: 'Peças', icon: 'Package', blocks: [
      { t: 'kpis', items: [k('Vendas de peças YTD', '€11,5 M', '+9%'), k('Fill rate', '92,4%', '+1,1 pp'), k('Pedidos urgentes', '27', 'esta semana'), k('Margem peças', '38%', '+2 pp')] },
      { t: 'chart', c: ch('pc1', 'Procura prevista de peças (un)', 'Top 3 famílias', 'line', ['Relés TPU', 'Módulos HV', 'Juntas GIS'],
        series(93, [['Relés TPU', 240, 40], ['Módulos HV', 180, 50], ['Juntas GIS', 90, 20]]),
        'Módulos de potência HV com procura +40% (frota de 2022 sai de garantia).', 'Rutura em Fev sem reposição.', 'Encomenda antecipada de 250 módulos.') },
    ] },
    { id: 'campo', label: 'Equipas de campo', icon: 'HardHat', blocks: [
      { t: 'kpis', items: [k('Técnicos em campo hoje', '212', '87% utilização'), k('Km percorridos / OS', '64 km', '-22%', false), k('Certificações a expirar', '18', '30 dias', true, false), k('Incidentes HSE', '0', 'há 142 dias')] },
      { t: 'map', title: 'Equipas e missões ativas', assets: sv.assets },
      { t: 'agents', items: sv.agents.filter(a => a.id === 'f1') },
    ] },
    { id: 'agentes', label: 'Agentes', icon: 'Bot', blocks: [{ t: 'agents', items: [...sv.agents, ...dom('transformadores').agents.filter(a => a.id === 'a1'), ...dom('mobilidade').agents.filter(a => a.id === 'd1')] }] },
  ],
  questions: [...sv.questions, { q: 'Que ativos da base instalada estão críticos?', a: '**4 ativos críticos**: TP 345 kV Dominion Energy (ponto quente 108 °C), SE Faro (GOOSE), Hub Oslo (arrefecimento) e Fluofix Chile em aviso (SF₆ -3%).' }],
};

/* ─────────────────────────── PESSOAS & RH ─────────────────────────── */
const sites: Asset[] = [
  { name: 'Arroteia — Leça do Balio', type: 'Sede & fábricas', lat: 41.21, lng: -8.64, status: 'ok', detail: '1 420 colaboradores' },
  { name: 'Maia', type: 'Mobilidade & Automação', lat: 41.23, lng: -8.62, status: 'ok', detail: '380 colaboradores' },
  { name: 'Lisboa', type: 'Escritório & Serviços', lat: 38.74, lng: -9.15, status: 'ok', detail: '96 colaboradores' },
  { name: 'Atlanta — Efacec USA', type: 'Filial', lat: 33.75, lng: -84.39, status: 'aviso', detail: '64 colaboradores · 9 vagas' },
  { name: 'Maputo', type: 'Filial', lat: -25.97, lng: 32.57, status: 'ok', detail: '42 colaboradores' },
  { name: 'Argel', type: 'Filial', lat: 36.75, lng: 3.04, status: 'ok', detail: '38 colaboradores' },
  { name: 'Madrid', type: 'Filial', lat: 40.42, lng: -3.7, status: 'ok', detail: '31 colaboradores' },
];
const rh: Module = {
  slug: 'pessoas', group: 'funcoes', name: 'Pessoas & RH', short: 'Pessoas & RH', icon: 'Users', color: '#A855F7',
  owner: 'Direção de Pessoas · Sara Monteiro', tagline: 'Headcount, recrutamento, talento e competências, formação e bem-estar',
  sources: ['SuccessFactors', 'SAP HCM Payroll', 'Academia Efacec (LMS)', 'Inquérito de clima'],
  sections: [
    { id: 'geral', label: 'Visão geral', icon: 'LayoutGrid', blocks: [
      { t: 'kpis', items: [k('Colaboradores', '2 140', '+6% a/a'), k('Rotatividade voluntária', '7,8%', '-1,1 pp', false), k('Vagas abertas', '84', '31 engenharia', true, false), k('eNPS', '+24', '+7')] },
      { t: 'insights', span: 2, items: [
        { sev: 'alta', title: 'Escassez de engenheiros de ensaios AT', text: '6 vagas abertas há > 90 dias; impacto direto no lead time de transformadores (gargalo de ensaios dielétricos).', owner: 'Talent Acquisition', cta: 'Ver plano de contratação' },
        { sev: 'media', title: 'Risco de saída em Automação', text: 'Equipa de software de Automação com risco agregado de rotatividade 2× a média (dados anonimizados, n ≥ 10).', owner: 'HR Business Partner', cta: 'Planear ações de retenção' },
        { sev: 'info', title: '58 colaboradores a reformar até 2030', text: 'Concentrados em bobinagem e montagem de parte ativa — risco de perda de know-how.', owner: 'Academia Efacec', cta: 'Plano de mentoria' },
      ] },
      { t: 'chart', c: ch('hr1', 'Headcount por área', 'Mensal', 'area', ['Fabrico', 'Engenharia', 'Serviços', 'Suporte'],
        series(101, [['Fabrico', 920, 30], ['Engenharia', 610, 30], ['Serviços', 380, 20], ['Suporte', 210, 10]]),
        'Engenharia cresceu 11% — contratação para projetos dos EUA.', 'Headcount de 2 260 em Dez 2027.', 'Antecipar 20 contratações de técnicos de ensaio.') },
      { t: 'chart', c: ch('hr2', 'Rotatividade voluntária (%)', 'Média móvel 12 meses', 'line', ['Efacec', 'Benchmark setor'],
        series(103, [['Efacec', 8.2, 0.8], ['Benchmark setor', 9.1, 0.3]]),
        'Rotatividade abaixo do benchmark desde Mar.', 'Estável em 7,5% em 2027.', 'Manter programa de carreira técnica dual.') },
    ] },
    { id: 'headcount', label: 'Headcount & Estrutura', icon: 'Network', blocks: [
      { t: 'map', title: 'Colaboradores por localização', assets: sites },
      { t: 'chart', c: ch('hc1', 'Pirâmide etária', 'Distribuição atual', 'bar', ['Homens', 'Mulheres'],
        [['< 25', 92, 41], ['25–34', 402, 188], ['35–44', 451, 164], ['45–54', 388, 102], ['55+', 241, 71]].map(([m, a, b]) => ({ m, Homens: a, Mulheres: b })),
        '26% dos colaboradores com 50+ anos em fabrico.', '58 reformas até 2030.', 'Programa de transferência de conhecimento.') },
      tbl('Indicadores por área', ['Área', 'Colaboradores', '% Mulheres', 'Idade média', 'Rotatividade'], [
        ['Fabrico', '934', '14%', '44,1', '5,9%'], ['Engenharia', '628', '27%', '37,2', '10,4%'],
        ['Serviços', '384', '9%', '39,8', '8,1%'], ['Suporte', '194', '58%', '41,5', '6,2%'],
      ], 'SuccessFactors EC', 2),
    ] },
    { id: 'recrutamento', label: 'Recrutamento', icon: 'UserPlus', blocks: [
      { t: 'funnel', span: 2, title: 'Funil de recrutamento (YTD)', stages: [['Candidaturas', 6820, '100%'], ['Triagem', 1840, '27%'], ['Entrevistas', 612, '9%'], ['Propostas', 241, '3,5%'], ['Contratações', 214, '89% aceitação']] },
      { t: 'kpis', items: [k('Time-to-hire', '41 dias', '-6 dias', false), k('Custo por contratação', '€3 900', '-9%', false), k('Aceitação de propostas', '89%', '+4 pp'), k('Referências internas', '23%', '+5 pp')] },
      tbl('Vagas críticas', ['Vaga', 'Área', 'Local', 'Dias aberta', 'Candidatos', 'Estado'], [
        ['Eng. Ensaios Alta Tensão', 'Transformadores', 'Arroteia', '112', '9', 'Crítico'],
        ['Field Service Engineer', 'Serviços', 'Atlanta', '74', '14', 'Aviso'],
        ['Eng. Software IEC 61850', 'Automação', 'Maia', '58', '22', 'Entrevistas'],
        ['Técnico Bobinagem', 'Transformadores', 'Arroteia', '33', '31', 'Propostas'],
      ], 'SuccessFactors RCM', 2),
    ] },
    { id: 'talento', label: 'Talento & Competências', icon: 'Award', blocks: [
      { t: 'chart', c: ch('ta1', 'Gap de competências críticas', 'Necessidade vs. disponível (FTE)', 'bar', ['Necessário', 'Disponível'],
        [['Ensaios AT', 34, 26], ['IEC 61850', 48, 41], ['Power electronics', 40, 31], ['Cibersegurança OT', 18, 9], ['Data & IA', 22, 14]].map(([m, a, b]) => ({ m, 'Necessário': a, 'Disponível': b })),
        'Cibersegurança OT com o maior gap relativo (50%) — requisito NIS2.', 'Gap de 9 FTE até 2027 sem ação.', 'Programa de reconversão de 6 engenheiros de automação.') },
      { t: 'chart', c: ch('ta2', 'Matriz 9-box (% colaboradores)', 'Avaliação 2026', 'pie', ['v'],
        pie([['Alto potencial', 12], ['Performers chave', 34], ['Core', 41], ['A desenvolver', 13]]),
        '12% de alto potencial — 70% em engenharia.', 'Pipeline de sucessão cobre 78% das posições críticas.', 'Planos de sucessão para 9 posições sem sucessor.') },
    ] },
    { id: 'formacao', label: 'Formação', icon: 'GraduationCap', blocks: [
      { t: 'kpis', items: [k('Horas de formação YTD', '61 400 h', '+18%'), k('Horas por colaborador', '28,7 h', '+3,9 h'), k('Certificações HSE válidas', '97,2%', '+1,4 pp'), k('Investimento', '€1,9 M', '+12%')] },
      { t: 'chart', c: ch('fo1', 'Horas de formação por tema', 'Academia Efacec', 'bar', ['Horas'],
        bars('Horas', [['HSE', 18200], ['Técnica AT', 14100], ['Digital & IA', 9800], ['Liderança', 7400], ['Línguas', 6100], ['Qualidade', 5800]]),
        'Digital & IA triplicou com o programa "Nexus Academy".', '+40% em 2027.', 'Certificar 120 utilizadores avançados em Snowflake.') },
    ] },
    { id: 'agentes', label: 'Agentes', icon: 'Bot', blocks: [{ t: 'agents', items: [
      { id: 'hr-a1', name: 'Retenção de talento crítico', trigger: 'Risco agregado de saída > 2× média', mode: 'humano', approver: 'Sara Monteiro — Diretora de Pessoas', impact: 'Evita perda de ~€1,2 M em recrutamento',
        steps: [
          { title: 'Insight', detail: 'Equipa de software de Automação (n=34) com risco agregado de saída de 21%.' },
          { title: 'Diagnóstico', detail: 'Drivers principais: banda salarial abaixo do mercado (-9%) e baixa mobilidade interna.' },
          { title: 'Recomendação', detail: 'Revisão salarial focada e programa de carreira técnica.' },
          { title: 'Aprovação', detail: 'Requer aprovação da Direção de Pessoas (impacto orçamental €280 k).' },
          { title: 'Ação', detail: 'Plano enviado aos HR Business Partners; acompanhamento trimestral.' },
        ] },
      { id: 'hr-a2', name: 'Renovação de certificações HSE', trigger: 'Certificação expira em 30 dias', mode: 'auto', impact: '100% técnicos certificados em campo',
        steps: [
          { title: 'Insight', detail: '18 certificações de trabalhos em tensão expiram em 30 dias.' },
          { title: 'Diagnóstico', detail: '6 técnicos com missões agendadas após a data de expiração.' },
          { title: 'Recomendação', detail: 'Inscrever na sessão de 25 Nov na Academia Efacec.' },
          { title: 'Ação', detail: 'Inscrições feitas e chefias notificadas.' },
        ] },
    ] }] },
  ],
  questions: [
    { q: 'Onde temos maior falta de competências?', a: '**Cibersegurança OT** (gap de 50%, requisito NIS2), seguida de power electronics (-9 FTE) e ensaios AT (-8 FTE).' },
    { q: 'Qual a rotatividade atual?', a: 'Rotatividade voluntária de **7,8%**, abaixo do benchmark do setor (9,1%). Engenharia é a área mais exposta (10,4%).' },
    { q: 'Quanto tempo demoramos a contratar?', a: 'Time-to-hire médio de **41 dias** (-6). Exceção: engenheiros de ensaios AT, com vagas abertas há 112 dias.' },
  ],
};

/* ─────────────────────────── OPERAÇÕES & FABRICO ─────────────────────────── */
const plants: Asset[] = [
  { name: 'Fábrica de Transformadores — Arroteia', type: 'Fábrica', lat: 41.2105, lng: -8.6427, status: 'ok', detail: 'OEE 81,4%' },
  { name: 'Fábrica de Aparelhagem — Arroteia', type: 'Fábrica', lat: 41.208, lng: -8.639, status: 'aviso', detail: 'OEE 74,2% · paragem linha 2' },
  { name: 'Mobilidade Elétrica — Maia', type: 'Fábrica', lat: 41.235, lng: -8.62, status: 'ok', detail: 'OEE 83,0%' },
  { name: 'Automação — Maia', type: 'Fábrica', lat: 41.228, lng: -8.615, status: 'ok', detail: 'OEE 86,1%' },
];
const operacoes: Module = {
  slug: 'operacoes', group: 'funcoes', name: 'Operações & Fabrico', short: 'Operações', icon: 'Factory', color: '#FB923C',
  owner: 'Direção Industrial · Miguel Antunes', tagline: 'Produção, OEE, capacidade e manutenção industrial nas fábricas de Arroteia e Maia',
  sources: ['SAP PP', 'MES Efacec', 'Historian OT', 'SAP PM'],
  sections: [
    { id: 'geral', label: 'Visão geral', icon: 'LayoutGrid', blocks: [
      { t: 'kpis', items: [k('OEE global', '80,6%', '+2,4 pp'), k('Produção a tempo', '88,9%', '+1,7 pp'), k('Paragens não planeadas', '41 h', '-28%', false), k('Custo de não qualidade', '1,3%', '-0,2 pp', false)] },
      { t: 'map', title: 'Fábricas', assets: plants },
      { t: 'chart', c: dom('transformadores').charts[0] },
      { t: 'chart', c: ch('op1', 'OEE por fábrica (%)', 'Mensal', 'line', ['Transformadores', 'Aparelhagem', 'Mobilidade', 'Automação'],
        series(111, [['Transformadores', 80, 4], ['Aparelhagem', 75, 5], ['Mobilidade', 82, 4], ['Automação', 85, 3]]),
        'Aparelhagem com OEE mais baixo — trocas de formato na linha 2.', 'SMED reduz setup 35% → OEE 79%.', 'Lançar projeto SMED na linha 2 de celas.') },
    ] },
    { id: 'manutencao', label: 'Manutenção industrial', icon: 'Cog', blocks: [
      { t: 'kpis', items: [k('MTBF', '312 h', '+18%'), k('MTTR', '2,4 h', '-0,7 h', false), k('Manutenção preditiva', '41%', '+15 pp'), k('Backlog OT', '186 h', '-12%', false)] },
      tbl('Equipamentos críticos', ['Equipamento', 'Fábrica', 'Saúde', 'Próx. falha prevista', 'Ação'], [
        ['Autoclave de secagem 2', 'Arroteia', '68%', '~21 dias', 'Substituir bomba de vácuo'],
        ['Máquina de corte de núcleo Georg', 'Arroteia', '81%', '> 90 dias', '—'],
        ['Ponte rolante 250 t', 'Arroteia', '92%', '> 180 dias', '—'],
        ['Linha SMT 1', 'Maia', '74%', '~35 dias', 'Calibrar pick & place'],
      ], 'Historian OT + Cortex Anomaly Detection', 2),
    ] },
    { id: 'agentes', label: 'Agentes', icon: 'Bot', blocks: [{ t: 'agents', items: dom('transformadores').agents.filter(a => a.id === 'a2') }] },
  ],
  questions: [{ q: 'Qual a fábrica com pior OEE?', a: '**Aparelhagem (74,2%)** — trocas de formato na linha 2. Projeto SMED proposto para subir para 79%.' }],
};

/* ─────────────────────────── QUALIDADE & HSE ─────────────────────────── */
const qualidade: Module = {
  slug: 'qualidade', group: 'funcoes', name: 'Qualidade & HSE', short: 'Qualidade & HSE', icon: 'ShieldCheck', color: '#38BDF8',
  owner: 'Direção de Qualidade & HSE · Teresa Gonçalves', tagline: 'Não-conformidades, ensaios FAT, reclamações de clientes e segurança',
  sources: ['SAP QM', 'Laboratório de ensaios', 'Plataforma HSE'],
  sections: [
    { id: 'geral', label: 'Visão geral', icon: 'LayoutGrid', blocks: [
      { t: 'kpis', items: [k('FAT 1.ª aprovação', '96,8%', '-0,6 pp', false, false), k('NCs abertas', '74', '-11', false), k('Reclamações clientes', '12', 'YTD', false), k('Taxa de frequência HSE', '0,8', '-0,3', false)] },
      { t: 'chart', c: ch('q1', 'Não-conformidades por origem', 'Mensal', 'bar', ['Interna', 'Fornecedor', 'Cliente'],
        series(121, [['Interna', 22, 6], ['Fornecedor', 12, 5], ['Cliente', 3, 2]]),
        '40% das NCs de fornecedor vêm de 2 fornecedores de caldeiraria.', '-25% NCs fornecedor com auditorias.', 'Auditar 2 fornecedores de caldeiraria em Dez.') },
      { t: 'chart', c: ch('q2', 'Incidentes HSE (taxa de frequência)', 'Média móvel 12 meses', 'line', ['TF', 'Meta'],
        series(123, [['TF', 1.1, 0.3], ['Meta', 1, 0]]),
        'Melhoria contínua desde programa "Zero Acidentes".', 'TF de 0,6 em 2027.', 'Alargar observações de segurança a subcontratados.') },
      tbl('NCs prioritárias', ['NC', 'Origem', 'Descrição', 'Produto', 'Estado'], [
        ['NC-26-1182', 'Fornecedor', 'Soldadura de cuba fora de especificação', 'OF-7790', 'Em análise'],
        ['NC-26-1177', 'Interna', 'Descarga parcial > 250 pC em FAT', 'OF-7802', 'Ação corretiva'],
        ['NC-26-1160', 'Cliente', 'Fuga de óleo em válvula', 'TP E-Redes', 'Fechada'],
      ], 'SAP QM · QM02', 2),
    ] },
  ],
  questions: [{ q: 'Porque caiu a aprovação em FAT?', a: 'Duas unidades com descarga parcial acima de 250 pC (OF-7802). Causa raiz em análise: contaminação no processo de impregnação.' }],
};

/* ─────────────────────────── FINANÇAS & ESG (reutilizados) ─────────────────────────── */
const fromDomain = (slug: string, group: Group, over: Partial<Module>): Module => {
  const d = dom(slug);
  return {
    slug: d.slug, group, name: d.name, short: d.short, icon: d.icon, color: d.color, owner: '', tagline: d.tagline,
    sources: [], questions: d.questions,
    sections: [
      { id: 'geral', label: 'Visão geral', icon: 'LayoutGrid', blocks: [{ t: 'kpis', items: d.kpis }, ...d.charts.map(c => ({ t: 'chart', c }) as Block)] },
      { id: 'ativos', label: 'Mapa de ativos', icon: 'Map', blocks: [{ t: 'map', title: 'Ativos e localizações', assets: d.assets }] },
      { id: 'operacoes', label: 'Operações', icon: 'Table2', blocks: [tbl(d.table.title, d.table.columns, d.table.rows.map(r => d.table.columns.map(c => r[c])), 'Dynamic Table · atualizado há 2 min', 2)] },
      { id: 'agentes', label: 'Agentes', icon: 'Bot', blocks: [{ t: 'agents', items: d.agents }] },
    ],
    ...over,
  };
};
const financas = fromDomain('financas', 'funcoes', { name: 'Finanças & Controlo', short: 'Finanças', owner: 'Direção Financeira · João Martins', sources: ['SAP S/4HANA FI/CO', 'Tesouraria', 'Orçamento (SAC)'] });
const esg = fromDomain('sustentabilidade', 'funcoes', { name: 'Sustentabilidade & ESG', short: 'ESG', owner: 'Sustentabilidade · Catarina Lopes', sources: ['Contadores de energia', 'SAP EHS', 'Fornecedores (âmbito 3)'] });

const BU_OWNERS: Record<string, [string, string[]]> = {
  transformadores: ['Unidade de Transformadores · Nuno Pereira', ['SAP PP', 'MES Arroteia', 'Sensores DGA']],
  aparelhagem: ['Unidade de Aparelhagem · Ricardo Faria', ['SAP PP', 'MES Arroteia', 'SAP QM']],
  automacao: ['Unidade de Automação · Luís Moreira', ['SCADA ScateX#', 'IEC 61850', 'CMDB']],
  mobilidade: ['Unidade de Mobilidade Elétrica · Ana Costa', ['Plataforma OCPP', 'Salesforce Service', 'Telemetria']],
  'mobilidade-ferroviaria': ['Unidade de Transportes · Filipe Rocha', ['Primavera P6', 'SAP PS', 'Relatórios de obra']],
};
const negocio = Object.entries(BU_OWNERS).map(([slug, [owner, sources]]) => fromDomain(slug, 'negocio', { owner, sources }));

export const modules: Module[] = [supplyChain, comercial, servicos, rh, operacoes, financas, qualidade, esg, ...negocio];
export const findModule = (slug?: string) => modules.find(m => m.slug === slug);
export const allAgents = modules.flatMap(m => m.sections.flatMap(s => s.blocks.flatMap(b => b.t === 'agents' ? b.items.map(a => ({ ...a, module: m.short })) : [])))
  .filter((a, i, arr) => arr.findIndex(x => x.id === a.id) === i);

export const dataProducts = [
  { name: 'SUPPLY.FCT_PURCHASE_ORDERS', domain: 'Supply Chain', owner: 'Rui Carvalho', freshness: '5 min', quality: 99.2, source: 'SAP MM', consumers: 41 },
  { name: 'SUPPLY.DIM_SUPPLIER_RISK', domain: 'Supply Chain', owner: 'Rui Carvalho', freshness: '1 h', quality: 97.8, source: 'Ariba + Dun & Bradstreet', consumers: 18 },
  { name: 'SALES.FCT_OPPORTUNITIES', domain: 'Comercial', owner: 'Inês Barbosa', freshness: '15 min', quality: 98.1, source: 'Salesforce', consumers: 56 },
  { name: 'SALES.FCT_ORDER_INTAKE', domain: 'Comercial', owner: 'Inês Barbosa', freshness: '15 min', quality: 99.6, source: 'SAP SD', consumers: 73 },
  { name: 'SERVICE.FCT_WORK_ORDERS', domain: 'Serviços', owner: 'Paulo Teixeira', freshness: '5 min', quality: 98.7, source: 'Salesforce Field Service', consumers: 29 },
  { name: 'SERVICE.FCT_ASSET_TELEMETRY', domain: 'Serviços', owner: 'Paulo Teixeira', freshness: '< 10 s', quality: 96.4, source: 'IoT · Snowpipe Streaming', consumers: 22 },
  { name: 'HR.FCT_HEADCOUNT_MONTHLY', domain: 'Pessoas', owner: 'Sara Monteiro', freshness: '1 dia', quality: 99.9, source: 'SuccessFactors', consumers: 14 },
  { name: 'OPS.FCT_OEE_SHIFT', domain: 'Operações', owner: 'Miguel Antunes', freshness: '1 min', quality: 97.1, source: 'MES Efacec', consumers: 33 },
  { name: 'FIN.FCT_GL_ACTUALS', domain: 'Finanças', owner: 'João Martins', freshness: '1 h', quality: 99.8, source: 'SAP FI/CO', consumers: 61 },
  { name: 'ESG.FCT_EMISSIONS', domain: 'ESG', owner: 'Catarina Lopes', freshness: '1 dia', quality: 95.3, source: 'Contadores + SAP EHS', consumers: 9 },
];
