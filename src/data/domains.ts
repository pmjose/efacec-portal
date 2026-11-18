// Dados simulados (hardcoded) — coerentes entre páginas.
export type Kpi = { label: string; value: string; delta: string; up: boolean; good: boolean };
export type ChartKind = 'area' | 'bar' | 'line' | 'pie';
export type Chart = {
  id: string; title: string; subtitle: string; kind: ChartKind;
  keys: string[]; data: Record<string, string | number>[];
  insight: string; forecast: string; action: string;
};
export type Asset = { name: string; type: string; lat: number; lng: number; status: 'ok' | 'aviso' | 'critico'; detail: string };
export type AgentStep = { title: string; detail: string };
export type Agent = {
  id: string; name: string; trigger: string; mode: 'auto' | 'humano';
  impact: string; steps: AgentStep[]; approver?: string;
};
export type Row = Record<string, string>;
export type Domain = {
  slug: string; name: string; short: string; icon: string; color: string; tagline: string;
  kpis: Kpi[]; charts: Chart[]; assets: Asset[]; agents: Agent[];
  table: { title: string; columns: string[]; rows: Row[] };
  questions: { q: string; a: string }[];
};

const MONTHS = ['Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'];
function seeded(seed: number) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}
function series(seed: number, keys: [string, number, number][], labels = MONTHS) {
  const r = seeded(seed);
  return labels.map((m, i) => {
    const o: Record<string, string | number> = { m };
    keys.forEach(([k, base, amp]) => {
      o[k] = Math.round((base + Math.sin(i / 1.8 + seed) * amp * 0.5 + (r() - 0.3) * amp + i * amp * 0.06) * 10) / 10;
    });
    return o;
  });
}
const pie = (items: [string, number][]) => items.map(([m, v]) => ({ m, v }));

export const domains: Domain[] = [
  {
    slug: 'transformadores', name: 'Transformadores de Potência', short: 'Transformadores', icon: 'Zap', color: '#E30613',
    tagline: 'Fábrica de Arroteia · Leça do Balio — transformadores até 550 kV / 800 MVA',
    kpis: [
      { label: 'Carteira de encomendas', value: '€412 M', delta: '+18% a/a', up: true, good: true },
      { label: 'Unidades em produção', value: '37', delta: '+5 vs. mês ant.', up: true, good: true },
      { label: 'OEE linha bobinagem', value: '81,4%', delta: '+3,2 pp', up: true, good: true },
      { label: 'Ensaios FAT 1.ª aprovação', value: '96,8%', delta: '-0,6 pp', up: false, good: false },
    ],
    charts: [
      { id: 'tr1', title: 'Produção vs. plano (MVA)', subtitle: 'Últimos 12 meses', kind: 'area', keys: ['Real', 'Plano'],
        data: series(3, [['Real', 1450, 380], ['Plano', 1500, 200]]),
        insight: 'Desvio de -6% em Mar–Abr explicado pela escassez de aço magnético (grão orientado M0H) — o fornecedor alternativo reduziu o gap em Mai.',
        forecast: 'Previsão Cortex ML: 1 720 MVA em Dez (+9% vs. plano) com 87% de confiança.',
        action: 'Antecipar 2 núcleos para a linha 3 e libertar capacidade de secagem em autoclave.' },
      { id: 'tr2', title: 'Encomendas por mercado (€M)', subtitle: 'Carteira atual', kind: 'pie', keys: ['v'],
        data: pie([['Europa', 168], ['América do Norte', 121], ['África', 64], ['América Latina', 37], ['Médio Oriente', 22]]),
        insight: 'América do Norte cresceu 41% a/a impulsionada por contratos de utilities nos EUA para reforço de rede (IRA).',
        forecast: 'Pipeline ponderado sugere que a América do Norte ultrapassa a Europa até T3 2027.',
        action: 'Reforçar equipa de propostas EUA e qualificar 2.º fornecedor de isolamento Nomex.' },
      { id: 'tr3', title: 'Lead time médio (semanas)', subtitle: 'Da encomenda à expedição', kind: 'line', keys: ['Grandes', 'Médios'],
        data: series(7, [['Grandes', 62, 8], ['Médios', 38, 6]]),
        insight: 'O lead time de grandes transformadores estabilizou em ~64 semanas; o gargalo passou da bobinagem para os ensaios dielétricos.',
        forecast: 'Com a 2.ª plataforma de ensaios, redução projetada para 56 semanas em 2027.',
        action: 'Abrir caso de investimento CAPEX para a plataforma de ensaios de impulso.' },
    ],
    assets: [
      { name: 'Fábrica Arroteia', type: 'Fábrica', lat: 41.2105, lng: -8.6427, status: 'ok', detail: 'Linhas 1–4 · OEE 81%' },
      { name: 'TP 420 kV — REN Fanhões', type: 'Instalado', lat: 38.877, lng: -9.163, status: 'ok', detail: 'DGA estável · 312 MVA' },
      { name: 'TP 220 kV — Iberdrola Tâmega', type: 'Instalado', lat: 41.48, lng: -7.95, status: 'aviso', detail: 'Hidrogénio dissolvido +18%' },
      { name: 'TP 400 kV — Eskom Majuba', type: 'Instalado', lat: -27.1, lng: 29.77, status: 'ok', detail: 'Em garantia' },
      { name: 'TP 345 kV — Dominion Energy', type: 'Instalado', lat: 37.54, lng: -77.43, status: 'critico', detail: 'Temperatura ponto quente 108 °C' },
      { name: 'TP 132 kV — Energias de Moçambique', type: 'Instalado', lat: -25.96, lng: 32.58, status: 'ok', detail: 'Manutenção em Fev' },
    ],
    agents: [
      { id: 'a1', name: 'Vigilância DGA de frota instalada', trigger: 'Gás dissolvido acima do limiar IEC 60599', mode: 'humano', approver: 'Eng.ª Marta Sousa — Service Manager',
        impact: 'Evita falha catastrófica (~€4,2 M por unidade)',
        steps: [
          { title: 'Insight', detail: 'Sensor Hydran no TP 220 kV Tâmega reporta H₂ a 412 ppm (+18% em 7 dias).' },
          { title: 'Diagnóstico', detail: 'Triângulo de Duval: zona T2 — falha térmica 300–700 °C. Correlação com carga de pico nas últimas 3 semanas.' },
          { title: 'Recomendação', detail: 'Reduzir carga para 85% e agendar inspeção com equipa de serviço em 72 h.' },
          { title: 'Aprovação', detail: 'Aguarda aprovação humana — impacto contratual com cliente.' },
          { title: 'Ação', detail: 'Ordem de serviço SRV-24-1187 criada no SAP PM e cliente notificado.' },
        ] },
      { id: 'a2', name: 'Reprogramação de produção por falta de material', trigger: 'Atraso de fornecedor > 5 dias', mode: 'auto',
        impact: '+2,1% OEE · 0 paragens não planeadas',
        steps: [
          { title: 'Insight', detail: 'Entrega de aço magnético da ThyssenKrupp atrasada 8 dias.' },
          { title: 'Diagnóstico', detail: '3 núcleos afetados na linha 2; folga disponível na linha 3.' },
          { title: 'Recomendação', detail: 'Resequenciar OF-7781 e OF-7790 para a linha 3.' },
          { title: 'Ação', detail: 'Plano MES atualizado automaticamente e supervisores notificados.' },
        ] },
    ],
    table: { title: 'Unidades em produção', columns: ['OF', 'Cliente', 'Potência', 'Tensão', 'Fase', 'Expedição'], rows: [
      { OF: 'OF-7781', Cliente: 'REN', Potência: '450 MVA', Tensão: '400 kV', Fase: 'Bobinagem', Expedição: 'Mar 2027' },
      { OF: 'OF-7790', Cliente: 'Dominion Energy', Potência: '336 MVA', Tensão: '345 kV', Fase: 'Montagem parte ativa', Expedição: 'Fev 2027' },
      { OF: 'OF-7802', Cliente: 'E-Redes', Potência: '63 MVA', Tensão: '60 kV', Fase: 'Ensaios FAT', Expedição: 'Dez 2026' },
      { OF: 'OF-7815', Cliente: 'Elia', Potência: '300 MVA', Tensão: '380 kV', Fase: 'Secagem autoclave', Expedição: 'Jan 2027' },
      { OF: 'OF-7822', Cliente: 'Eskom', Potência: '500 MVA', Tensão: '400 kV', Fase: 'Núcleo', Expedição: 'Mai 2027' },
    ] },
    questions: [
      { q: 'Que transformadores instalados estão em risco?', a: 'Dois ativos requerem atenção: **TP 345 kV Dominion Energy** (ponto quente a 108 °C — crítico) e **TP 220 kV Tâmega** (H₂ +18% — aviso). O agente de vigilância DGA já propôs inspeção em 72 h, a aguardar aprovação da Eng.ª Marta Sousa.' },
      { q: 'Porque desviou a produção em março?', a: 'A produção ficou 6% abaixo do plano por atraso no aço magnético de grão orientado. A qualificação de um fornecedor alternativo recuperou 70% do gap em maio.' },
      { q: 'Qual o lead time previsto para 2027?', a: 'O modelo Cortex projeta **56 semanas** para grandes transformadores com a 2.ª plataforma de ensaios de impulso (vs. 64 atuais).' },
    ],
  },
  {
    slug: 'aparelhagem', name: 'Aparelhagem AT/MT', short: 'Aparelhagem', icon: 'CircuitBoard', color: '#F39200',
    tagline: 'GIS e AIS — Normafix, Fluofix, Fluokit e celas MT até 245 kV',
    kpis: [
      { label: 'Celas expedidas (YTD)', value: '4 218', delta: '+11% a/a', up: true, good: true },
      { label: 'Margem bruta', value: '27,9%', delta: '+1,4 pp', up: true, good: true },
      { label: 'Entregas a tempo', value: '91,2%', delta: '-2,1 pp', up: false, good: false },
      { label: 'Alternativas SF₆-free', value: '34%', delta: '+12 pp', up: true, good: true },
    ],
    charts: [
      { id: 'ap1', title: 'Celas expedidas por família', subtitle: 'Mensal', kind: 'bar', keys: ['Normafix', 'Fluofix', 'Fluokit'],
        data: series(11, [['Normafix', 160, 40], ['Fluofix', 120, 30], ['Fluokit', 70, 25]]),
        insight: 'A família Fluokit (isolamento a ar seco) cresceu 3× no ano, impulsionada pela regulação europeia F-Gas.',
        forecast: 'Fluokit deverá representar 45% do mix em 2027.',
        action: 'Converter uma das linhas Normafix para Fluokit no T2.' },
      { id: 'ap2', title: 'Entregas a tempo (%)', subtitle: 'OTIF', kind: 'line', keys: ['OTIF', 'Meta'],
        data: series(5, [['OTIF', 91, 4], ['Meta', 95, 0]]),
        insight: 'Queda do OTIF concentrada em disjuntores a vácuo — dependência de um único fornecedor de ampolas.',
        forecast: 'Sem ação, OTIF de 89% em Jan.',
        action: 'Ativar stock de segurança de ampolas e dual-sourcing.' },
    ],
    assets: [
      { name: 'Fábrica Aparelhagem — Arroteia', type: 'Fábrica', lat: 41.208, lng: -8.639, status: 'ok', detail: 'Linhas MT/AT' },
      { name: 'GIS 245 kV — REN Pedralva', type: 'Instalado', lat: 41.56, lng: -8.5, status: 'ok', detail: 'Monitorização SF₆ OK' },
      { name: 'Subestação Fluofix — Chile', type: 'Instalado', lat: -33.45, lng: -70.66, status: 'aviso', detail: 'Pressão SF₆ -3%' },
      { name: 'Celas MT — Metro de Argel', type: 'Instalado', lat: 36.75, lng: 3.06, status: 'ok', detail: '84 celas' },
    ],
    agents: [
      { id: 'b1', name: 'Fuga de SF₆ em GIS', trigger: 'Queda de densidade > 2%', mode: 'humano', approver: 'Eng. Rui Ferreira — Field Service',
        impact: 'Conformidade F-Gas · evita coima até €200 k',
        steps: [
          { title: 'Insight', detail: 'Densímetro na subestação do Chile mostra -3% em 30 dias.' },
          { title: 'Diagnóstico', detail: 'Padrão compatível com fuga em junta de flange no compartimento do barramento.' },
          { title: 'Recomendação', detail: 'Deslocação de técnico com kit de deteção por câmara de infravermelhos.' },
          { title: 'Aprovação', detail: 'Requer aprovação de deslocação internacional.' },
          { title: 'Ação', detail: 'Missão agendada e peças reservadas no armazém de Santiago.' },
        ] },
      { id: 'b2', name: 'Dual-sourcing de ampolas de vácuo', trigger: 'Risco de rutura de stock', mode: 'auto', impact: '+3 pp OTIF',
        steps: [
          { title: 'Insight', detail: 'Cobertura de stock de ampolas cai para 9 dias.' },
          { title: 'Diagnóstico', detail: 'Consumo previsto supera entregas confirmadas em 22%.' },
          { title: 'Recomendação', detail: 'Lançar encomenda ao fornecedor qualificado B.' },
          { title: 'Ação', detail: 'Pedido de compra PO-55120 emitido automaticamente no SAP MM.' },
        ] },
    ],
    table: { title: 'Projetos em curso', columns: ['Projeto', 'Cliente', 'Produto', 'Qtd.', 'Estado'], rows: [
      { Projeto: 'AP-2611', Cliente: 'E-Redes', Produto: 'Normafix 36 kV', 'Qtd.': '120', Estado: 'Produção' },
      { Projeto: 'AP-2618', Cliente: 'REN', Produto: 'GIS 245 kV', 'Qtd.': '8 bays', Estado: 'Engenharia' },
      { Projeto: 'AP-2624', Cliente: 'Sonelgaz', Produto: 'Fluofix 24 kV', 'Qtd.': '64', Estado: 'Ensaios' },
      { Projeto: 'AP-2630', Cliente: 'Vattenfall', Produto: 'Fluokit 24 kV', 'Qtd.': '210', Estado: 'Produção' },
    ] },
    questions: [
      { q: 'Porque está o OTIF abaixo da meta?', a: 'O OTIF caiu para **91,2%** devido a dependência de um fornecedor único de ampolas de vácuo. O agente de dual-sourcing já emitiu a PO-55120; recuperação esperada para 94% em 6 semanas.' },
      { q: 'Qual o peso das soluções sem SF₆?', a: 'As soluções SF₆-free (Fluokit) já representam **34%** das celas expedidas, +12 pp a/a.' },
    ],
  },
  {
    slug: 'automacao', name: 'Automação & Smart Grids', short: 'Automação', icon: 'Cpu', color: '#FFCC00',
    tagline: 'Sistemas de automação de subestações, SCADA e gestão de redes — CLP 500, BCU 500, TPU S500',
    kpis: [
      { label: 'Subestações automatizadas', value: '2 860', delta: '+142 este ano', up: true, good: true },
      { label: 'IEDs em operação', value: '41 300', delta: '+8%', up: true, good: true },
      { label: 'Disponibilidade SCADA', value: '99,982%', delta: '+0,004 pp', up: true, good: true },
      { label: 'Alertas cibersegurança', value: '3', delta: '-5 vs. mês ant.', up: false, good: true },
    ],
    charts: [
      { id: 'au1', title: 'Eventos de rede processados (milhões)', subtitle: 'Telemetria IEC 61850', kind: 'area', keys: ['Eventos'],
        data: series(13, [['Eventos', 820, 160]]),
        insight: 'Snowpipe Streaming ingere 1,1 mil milhões de eventos/mês com latência < 10 s.',
        forecast: 'Crescimento de 28% com a integração de 400 novos postos de transformação.',
        action: 'Ativar política de retenção em camadas (hot 90 dias / Iceberg frio).' },
      { id: 'au2', title: 'Falhas detetadas vs. previstas', subtitle: 'Manutenção preditiva de IEDs', kind: 'bar', keys: ['Previstas', 'Não previstas'],
        data: series(17, [['Previstas', 34, 10], ['Não previstas', 8, 5]]),
        insight: '81% das falhas de IED são agora antecipadas pelo modelo de anomalias.',
        forecast: 'Meta de 90% atingível com features de temperatura de bastidor.',
        action: 'Adicionar sensores de temperatura nas 120 subestações mais antigas.' },
    ],
    assets: [
      { name: 'Centro de Controlo — E-Redes Sacavém', type: 'Centro', lat: 38.79, lng: -9.1, status: 'ok', detail: 'SCADA ScateX# · 99,99%' },
      { name: 'SE Ermesinde', type: 'Subestação', lat: 41.22, lng: -8.55, status: 'ok', detail: '48 IEDs' },
      { name: 'SE Coimbra Norte', type: 'Subestação', lat: 40.23, lng: -8.42, status: 'aviso', detail: 'BCU 500 firmware desatualizado' },
      { name: 'SE Faro', type: 'Subestação', lat: 37.02, lng: -7.93, status: 'critico', detail: 'Perda de comunicação GOOSE' },
      { name: 'SE Évora', type: 'Subestação', lat: 38.57, lng: -7.9, status: 'ok', detail: '32 IEDs' },
      { name: 'SE Viseu', type: 'Subestação', lat: 40.66, lng: -7.91, status: 'ok', detail: '27 IEDs' },
    ],
    agents: [
      { id: 'c1', name: 'Atualização de firmware em frota', trigger: 'Vulnerabilidade CVE publicada', mode: 'humano', approver: 'Eng. Pedro Lima — OT Security',
        impact: 'Fecha 2 CVEs críticos em 312 IEDs',
        steps: [
          { title: 'Insight', detail: 'CVE-2026-1142 afeta BCU 500 com firmware < 4.2.' },
          { title: 'Diagnóstico', detail: '312 IEDs vulneráveis em 41 subestações; 6 em zonas críticas.' },
          { title: 'Recomendação', detail: 'Rollout faseado em janelas de baixa carga (02:00–05:00).' },
          { title: 'Aprovação', detail: 'Requer aprovação do operador de rede.' },
          { title: 'Ação', detail: 'Campanha de atualização agendada e registada no CMDB.' },
        ] },
      { id: 'c2', name: 'Recuperação de comunicação GOOSE', trigger: 'Perda de mensagens > 30 s', mode: 'auto', impact: 'MTTR de 4 h → 12 min',
        steps: [
          { title: 'Insight', detail: 'SE Faro sem mensagens GOOSE há 47 s.' },
          { title: 'Diagnóstico', detail: 'Switch PRP com porta B em erro CRC.' },
          { title: 'Recomendação', detail: 'Comutar para rede redundante A e reiniciar porta.' },
          { title: 'Ação', detail: 'Comando remoto executado; comunicação restabelecida.' },
        ] },
    ],
    table: { title: 'Alarmes ativos', columns: ['ID', 'Subestação', 'Equipamento', 'Severidade', 'Desde'], rows: [
      { ID: 'ALM-90211', Subestação: 'SE Faro', Equipamento: 'Switch PRP', Severidade: 'Crítico', Desde: '09:41' },
      { ID: 'ALM-90207', Subestação: 'SE Coimbra Norte', Equipamento: 'BCU 500', Severidade: 'Aviso', Desde: '08:12' },
      { ID: 'ALM-90199', Subestação: 'SE Ermesinde', Equipamento: 'TPU S500', Severidade: 'Info', Desde: 'Ontem' },
    ] },
    questions: [
      { q: 'Que subestações têm alarmes críticos?', a: 'Apenas a **SE Faro** — perda de comunicação GOOSE. O agente autónomo comutou para a rede redundante A e restabeleceu o serviço em 12 minutos.' },
      { q: 'Quantos IEDs estão vulneráveis?', a: '**312 IEDs BCU 500** em 41 subestações (CVE-2026-1142). A campanha de atualização aguarda aprovação do Eng. Pedro Lima.' },
    ],
  },
  {
    slug: 'mobilidade', name: 'Mobilidade Elétrica', short: 'Mobilidade', icon: 'BatteryCharging', color: '#29B5E8',
    tagline: 'Carregadores rápidos e ultra-rápidos — QC45, HV160, HV350 instalados em +50 países',
    kpis: [
      { label: 'Carregadores conectados', value: '9 640', delta: '+1 120 YTD', up: true, good: true },
      { label: 'Uptime da rede', value: '98,7%', delta: '+0,9 pp', up: true, good: true },
      { label: 'Energia entregue (mês)', value: '41,2 GWh', delta: '+23%', up: true, good: true },
      { label: 'Tickets abertos', value: '184', delta: '-12%', up: false, good: true },
    ],
    charts: [
      { id: 'mo1', title: 'Energia entregue (GWh)', subtitle: 'Por gama de potência', kind: 'area', keys: ['HV350', 'HV160', 'QC45'],
        data: series(19, [['HV350', 14, 5], ['HV160', 12, 3], ['QC45', 8, 2]]),
        insight: 'HV350 já representa 38% da energia entregue — corredores de autoestrada na Europa.',
        forecast: '+31% em energia entregue no verão de 2027.',
        action: 'Priorizar upgrades de módulos de potência em corredores TEN-T.' },
      { id: 'mo2', title: 'Uptime por região (%)', subtitle: 'Média móvel 30 dias', kind: 'line', keys: ['Europa', 'EUA', 'APAC'],
        data: series(23, [['Europa', 98.8, 0.8], ['EUA', 97.6, 1.2], ['APAC', 98.1, 1]]),
        insight: 'Nos EUA, 62% das falhas são de módulo de comunicação 4G em zonas rurais.',
        forecast: 'Com OTA de firmware, uptime EUA sobe para 98,6%.',
        action: 'Agendar OTA de firmware v5.3 para 1 240 carregadores EUA.' },
    ],
    assets: [
      { name: 'Hub IONITY — Pombal', type: 'HV350', lat: 39.91, lng: -8.63, status: 'ok', detail: '6 × HV350 · 99,4%' },
      { name: 'Hub Galp — Aveiras', type: 'HV160', lat: 39.13, lng: -8.9, status: 'ok', detail: '4 × HV160' },
      { name: 'Electrify America — Denver', type: 'HV350', lat: 39.74, lng: -104.99, status: 'aviso', detail: 'Módulo 4G instável' },
      { name: 'Hub Madrid — A-4', type: 'HV350', lat: 40.3, lng: -3.68, status: 'ok', detail: '8 × HV350' },
      { name: 'Hub Oslo', type: 'HV160', lat: 59.91, lng: 10.75, status: 'critico', detail: 'Falha arrefecimento a -18 °C' },
      { name: 'Hub Lyon', type: 'HV350', lat: 45.76, lng: 4.83, status: 'ok', detail: '6 × HV350' },
    ],
    agents: [
      { id: 'd1', name: 'Auto-reparação remota de carregadores', trigger: 'Carregador offline > 5 min', mode: 'auto', impact: '63% dos tickets resolvidos sem deslocação',
        steps: [
          { title: 'Insight', detail: 'HV160 #NO-0442 em Oslo offline.' },
          { title: 'Diagnóstico', detail: 'Log OCPP indica falha de arrefecimento — líquido abaixo do limiar a -18 °C.' },
          { title: 'Recomendação', detail: 'Ativar modo de aquecimento e reduzir potência para 80 kW.' },
          { title: 'Ação', detail: 'Comando OCPP enviado; carregador disponível em modo degradado.' },
        ] },
      { id: 'd2', name: 'Campanha de firmware OTA', trigger: 'Nova versão validada', mode: 'humano', approver: 'Ana Costa — Product Owner E-Mobility', impact: '+1,0 pp uptime EUA',
        steps: [
          { title: 'Insight', detail: 'Firmware v5.3 corrige reconexão 4G.' },
          { title: 'Diagnóstico', detail: '1 240 carregadores elegíveis; 37 em sessões longas.' },
          { title: 'Recomendação', detail: 'Rollout canário de 5% e depois 100% em 72 h.' },
          { title: 'Aprovação', detail: 'Requer aprovação do Product Owner.' },
          { title: 'Ação', detail: 'Campanha OTA iniciada; monitorização em tempo real ativa.' },
        ] },
    ],
    table: { title: 'Tickets prioritários', columns: ['Ticket', 'Local', 'Modelo', 'Problema', 'SLA'], rows: [
      { Ticket: 'EM-31882', Local: 'Oslo', Modelo: 'HV160', Problema: 'Arrefecimento', SLA: '2 h' },
      { Ticket: 'EM-31879', Local: 'Denver', Modelo: 'HV350', Problema: 'Comunicação 4G', SLA: '6 h' },
      { Ticket: 'EM-31870', Local: 'Lisboa', Modelo: 'QC45', Problema: 'Leitor RFID', SLA: '24 h' },
    ] },
    questions: [
      { q: 'Qual o estado da rede de carregadores?', a: 'Uptime global de **98,7%** em 9 640 carregadores. Um caso crítico em Oslo (arrefecimento) já mitigado pelo agente de auto-reparação em modo degradado.' },
      { q: 'Quanto do serviço é resolvido remotamente?', a: '**63%** dos tickets são resolvidos sem deslocação, poupando ~€1,8 M/ano em custos de campo.' },
    ],
  },
  {
    slug: 'mobilidade-ferroviaria', name: 'Transportes & Ferrovia', short: 'Ferrovia', icon: 'TrainFront', color: '#8B5CF6',
    tagline: 'Eletrificação, catenária, sinalização e sistemas de energia para metro e ferrovia',
    kpis: [
      { label: 'Km de catenária em obra', value: '318 km', delta: '+42 km', up: true, good: true },
      { label: 'Projetos ativos', value: '23', delta: '+3', up: true, good: true },
      { label: 'Desvio de prazo médio', value: '4,1%', delta: '-1,2 pp', up: false, good: true },
      { label: 'Taxa de incidentes HSE', value: '0,8', delta: '-0,3', up: false, good: true },
    ],
    charts: [
      { id: 'fe1', title: 'Avanço físico vs. planeado (%)', subtitle: 'Carteira de obras', kind: 'line', keys: ['Real', 'Planeado'],
        data: series(29, [['Real', 40, 30], ['Planeado', 42, 30]]),
        insight: 'Linha Rubi (Metro do Porto) com 3% de atraso por condicionantes de acesso noturno.',
        forecast: 'Recuperação total até Mar 2027 com turno extra.',
        action: 'Aprovar turno adicional de fim de semana.' },
      { id: 'fe2', title: 'Custos por projeto (€M)', subtitle: 'Orçado vs. real', kind: 'bar', keys: ['Orçado', 'Real'],
        data: [['Metro Porto', 48, 46], ['Ferrovia 2020 Beira Alta', 31, 33], ['Metro Lisboa', 22, 21], ['Dublin DART+', 27, 26]].map(([m, a, b]) => ({ m, 'Orçado': a, Real: b })),
        insight: 'Beira Alta 6% acima do orçamento — aumento do preço do cobre.',
        forecast: 'Exposição adicional de €0,9 M se o cobre se mantiver acima de $10 k/t.',
        action: 'Ativar cláusula de revisão de preços.' },
    ],
    assets: [
      { name: 'Metro do Porto — Linha Rubi', type: 'Obra', lat: 41.135, lng: -8.62, status: 'aviso', detail: 'Avanço 61%' },
      { name: 'Linha da Beira Alta', type: 'Obra', lat: 40.54, lng: -7.27, status: 'aviso', detail: 'Custo +6%' },
      { name: 'Metro de Lisboa — Linha Circular', type: 'Obra', lat: 38.72, lng: -9.14, status: 'ok', detail: 'Avanço 88%' },
      { name: 'Dublin DART+', type: 'Obra', lat: 53.35, lng: -6.26, status: 'ok', detail: 'Avanço 34%' },
    ],
    agents: [
      { id: 'e1', name: 'Revisão de preços de matérias-primas', trigger: 'Cobre LME > $10 000/t', mode: 'humano', approver: 'Dr. João Martins — Diretor Financeiro', impact: 'Recupera até €0,9 M',
        steps: [
          { title: 'Insight', detail: 'Cobre LME a $10 380/t há 14 dias.' },
          { title: 'Diagnóstico', detail: '2 contratos com cláusula de indexação aplicável.' },
          { title: 'Recomendação', detail: 'Emitir pedido de revisão de preço à IP.' },
          { title: 'Aprovação', detail: 'Requer validação jurídica e financeira.' },
          { title: 'Ação', detail: 'Carta formal gerada e enviada para assinatura digital.' },
        ] },
    ],
    table: { title: 'Carteira de obras', columns: ['Projeto', 'Cliente', 'Âmbito', 'Avanço', 'Fim'], rows: [
      { Projeto: 'Linha Rubi', Cliente: 'Metro do Porto', 'Âmbito': 'Energia e catenária', Avanço: '61%', Fim: 'Jun 2027' },
      { Projeto: 'Beira Alta', Cliente: 'Infraestruturas de Portugal', 'Âmbito': 'Eletrificação 25 kV', Avanço: '72%', Fim: 'Abr 2027' },
      { Projeto: 'Linha Circular', Cliente: 'Metro de Lisboa', 'Âmbito': 'Subestações de tração', Avanço: '88%', Fim: 'Fev 2027' },
    ] },
    questions: [
      { q: 'Que obras estão em risco?', a: '**Linha Rubi** (prazo, -3%) e **Beira Alta** (custo, +6%). Para a Beira Alta, o agente propôs ativar a cláusula de indexação do cobre — a aguardar o Dr. João Martins.' },
    ],
  },
  {
    slug: 'servicos', name: 'Serviços & Field Service', short: 'Serviços', icon: 'Wrench', color: '#10B981',
    tagline: 'Manutenção, reparação, retrofit e contratos de serviço em +65 países',
    kpis: [
      { label: 'Receita de serviços', value: '€96 M', delta: '+14% a/a', up: true, good: true },
      { label: 'First-time fix rate', value: '87,3%', delta: '+4,1 pp', up: true, good: true },
      { label: 'Técnicos em campo', value: '212', delta: 'hoje', up: true, good: true },
      { label: 'Contratos em renovação', value: '38', delta: '90 dias', up: true, good: false },
    ],
    charts: [
      { id: 'se1', title: 'Intervenções por tipo', subtitle: 'Mensal', kind: 'bar', keys: ['Preventiva', 'Corretiva', 'Preditiva'],
        data: series(31, [['Preventiva', 240, 40], ['Corretiva', 120, 30], ['Preditiva', 60, 40]]),
        insight: 'Intervenções preditivas cresceram 2,4× desde a ativação dos modelos Cortex.',
        forecast: 'Corretivas descem 18% em 2027.',
        action: 'Converter 12 contratos preventivos em preditivos (upsell €2,3 M).' },
      { id: 'se2', title: 'Mix de receita de serviços', subtitle: 'YTD', kind: 'pie', keys: ['v'],
        data: pie([['Contratos', 44], ['Reparações', 22], ['Retrofit', 18], ['Peças', 12]]),
        insight: 'Retrofit é a linha de maior margem (41%).',
        forecast: 'Retrofit de subestações com mais de 25 anos: mercado de €140 M em Portugal.',
        action: 'Gerar lista de alvos de retrofit para a equipa comercial.' },
    ],
    assets: [
      { name: 'Equipa Norte — Porto', type: 'Equipa', lat: 41.15, lng: -8.61, status: 'ok', detail: '28 técnicos' },
      { name: 'Equipa Sul — Lisboa', type: 'Equipa', lat: 38.72, lng: -9.14, status: 'ok', detail: '24 técnicos' },
      { name: 'Missão — Maputo', type: 'Missão', lat: -25.97, lng: 32.57, status: 'aviso', detail: 'Peças retidas na alfândega' },
      { name: 'Missão — Argel', type: 'Missão', lat: 36.75, lng: 3.04, status: 'ok', detail: 'Retrofit GIS' },
    ],
    agents: [
      { id: 'f1', name: 'Despacho inteligente de técnicos', trigger: 'Nova ordem de serviço', mode: 'auto', impact: '-22% km percorridos',
        steps: [
          { title: 'Insight', detail: 'OS-55821 aberta: disjuntor em falha, E-Redes Braga.' },
          { title: 'Diagnóstico', detail: '3 técnicos certificados em raio de 60 km.' },
          { title: 'Recomendação', detail: 'Atribuir a Tiago Rocha (32 km, peças na carrinha).' },
          { title: 'Ação', detail: 'OS atribuída e rota enviada para a app móvel.' },
        ] },
      { id: 'f2', name: 'Renovação proativa de contratos', trigger: 'Contrato a 90 dias do fim', mode: 'humano', approver: 'Sofia Almeida — Key Account', impact: '€8,4 M em renovações',
        steps: [
          { title: 'Insight', detail: '38 contratos expiram nos próximos 90 dias.' },
          { title: 'Diagnóstico', detail: '9 com risco de churn (NPS < 6 ou SLA falhado).' },
          { title: 'Recomendação', detail: 'Proposta com upgrade preditivo e desconto de 4%.' },
          { title: 'Aprovação', detail: 'Validação pelo Key Account.' },
          { title: 'Ação', detail: 'Propostas personalizadas geradas no Salesforce.' },
        ] },
    ],
    table: { title: 'Ordens de serviço hoje', columns: ['OS', 'Cliente', 'Local', 'Técnico', 'Estado'], rows: [
      { OS: 'OS-55821', Cliente: 'E-Redes', Local: 'Braga', Técnico: 'Tiago Rocha', Estado: 'Em rota' },
      { OS: 'OS-55817', Cliente: 'REN', Local: 'Sines', Técnico: 'Carla Pinto', Estado: 'Em execução' },
      { OS: 'OS-55809', Cliente: 'EDM', Local: 'Maputo', Técnico: 'Nuno Reis', Estado: 'Aguarda peças' },
    ] },
    questions: [
      { q: 'Que contratos estão em risco de não renovar?', a: '**9 de 38** contratos a expirar têm risco de churn. As propostas com upgrade preditivo estão prontas para validação da Sofia Almeida.' },
      { q: 'Como está o first-time fix?', a: 'FTFR de **87,3%** (+4,1 pp), graças à recomendação de peças pelo Cortex antes do despacho.' },
    ],
  },
  {
    slug: 'supply-chain', name: 'Supply Chain & Compras', short: 'Supply Chain', icon: 'Boxes', color: '#F97316',
    tagline: 'Planeamento, compras e logística global — cobre, aço magnético, óleo isolante e eletrónica',
    kpis: [
      { label: 'Spend anual', value: '€318 M', delta: '+7%', up: true, good: false },
      { label: 'Cobertura de stock', value: '42 dias', delta: '-3 dias', up: false, good: true },
      { label: 'Fornecedores críticos', value: '64', delta: '5 em risco', up: true, good: false },
      { label: 'Poupança negociada', value: '€11,6 M', delta: '+€2,1 M', up: true, good: true },
    ],
    charts: [
      { id: 'sc1', title: 'Preço de matérias-primas', subtitle: 'Índice (Dez = 100)', kind: 'line', keys: ['Cobre', 'Aço GO', 'Óleo'],
        data: series(37, [['Cobre', 108, 10], ['Aço GO', 112, 8], ['Óleo', 96, 6]]),
        insight: 'Aço de grão orientado +12% — maior risco de margem nos transformadores.',
        forecast: 'Cortex prevê estabilização no T1 2027.',
        action: 'Fixar preço para 60% do consumo do T1.' },
      { id: 'sc2', title: 'Risco de fornecedores', subtitle: 'Score composto', kind: 'bar', keys: ['Risco'],
        data: [['ThyssenKrupp', 72], ['Nexans', 41], ['Nynas', 58], ['Siemens Energy', 33], ['Weidmann', 49]].map(([m, v]) => ({ m, Risco: v })),
        insight: 'ThyssenKrupp com risco elevado (atrasos + concentração de 48%).',
        forecast: 'Probabilidade de rutura de 23% no T1.',
        action: 'Qualificar POSCO como fornecedor alternativo.' },
    ],
    assets: [
      { name: 'Armazém Central — Maia', type: 'Armazém', lat: 41.23, lng: -8.62, status: 'ok', detail: '18 000 SKUs' },
      { name: 'Porto de Leixões', type: 'Logística', lat: 41.18, lng: -8.7, status: 'ok', detail: '14 contentores em trânsito' },
      { name: 'ThyssenKrupp — Gelsenkirchen', type: 'Fornecedor', lat: 51.51, lng: 7.1, status: 'critico', detail: 'Atraso 8 dias' },
      { name: 'Nynas — Nynäshamn', type: 'Fornecedor', lat: 58.9, lng: 17.95, status: 'aviso', detail: 'Capacidade reduzida' },
    ],
    agents: [
      { id: 'g1', name: 'Hedging de matérias-primas', trigger: 'Volatilidade > 15%', mode: 'humano', approver: 'Dr. João Martins — Diretor Financeiro', impact: '€3,2 M de exposição protegida',
        steps: [
          { title: 'Insight', detail: 'Volatilidade do cobre a 30 dias em 18%.' },
          { title: 'Diagnóstico', detail: 'Exposição não coberta de 2 400 t no T1.' },
          { title: 'Recomendação', detail: 'Cobrir 60% via contratos forward.' },
          { title: 'Aprovação', detail: 'Requer aprovação da tesouraria.' },
          { title: 'Ação', detail: 'Pedido de cotação enviado a 3 bancos.' },
        ] },
    ],
    table: { title: 'Encomendas críticas', columns: ['PO', 'Fornecedor', 'Material', 'ETA', 'Estado'], rows: [
      { PO: 'PO-55120', Fornecedor: 'Fornecedor B', Material: 'Ampolas de vácuo', ETA: '28 Nov', Estado: 'Confirmada' },
      { PO: 'PO-55098', Fornecedor: 'ThyssenKrupp', Material: 'Aço GO M0H', ETA: '02 Dez', Estado: 'Atrasada' },
      { PO: 'PO-55077', Fornecedor: 'Nexans', Material: 'Cobre CTC', ETA: '24 Nov', Estado: 'Em trânsito' },
    ] },
    questions: [
      { q: 'Qual o maior risco na cadeia de abastecimento?', a: 'Concentração de **48%** do aço GO na ThyssenKrupp, com atraso atual de 8 dias. Recomendação: qualificar POSCO.' },
    ],
  },
  {
    slug: 'sustentabilidade', name: 'Sustentabilidade & ESG', short: 'ESG', icon: 'Leaf', color: '#22C55E',
    tagline: 'Descarbonização, CSRD e economia circular',
    kpis: [
      { label: 'Emissões âmbito 1+2', value: '8 420 tCO₂e', delta: '-14% a/a', up: false, good: true },
      { label: 'Eletricidade renovável', value: '78%', delta: '+9 pp', up: true, good: true },
      { label: 'Resíduos valorizados', value: '91%', delta: '+3 pp', up: true, good: true },
      { label: 'Produtos SF₆-free', value: '34%', delta: '+12 pp', up: true, good: true },
    ],
    charts: [
      { id: 'es1', title: 'Emissões por âmbito (tCO₂e)', subtitle: 'Mensal', kind: 'area', keys: ['Âmbito 1', 'Âmbito 2'],
        data: series(41, [['Âmbito 1', 420, 60], ['Âmbito 2', 330, 50]]),
        insight: 'Âmbito 2 caiu 21% com o PPA solar de Arroteia (6 MWp).',
        forecast: 'Trajetória compatível com SBTi 1,5 °C até 2030.',
        action: 'Avaliar 2.º PPA para Maia.' },
    ],
    assets: [
      { name: 'Parque solar Arroteia', type: 'Renovável', lat: 41.212, lng: -8.645, status: 'ok', detail: '6 MWp' },
      { name: 'Unidade Maia', type: 'Fábrica', lat: 41.23, lng: -8.62, status: 'aviso', detail: 'Consumo gás +7%' },
    ],
    agents: [
      { id: 'h1', name: 'Relatório CSRD automático', trigger: 'Fecho trimestral', mode: 'auto', impact: '-80% esforço de reporte',
        steps: [
          { title: 'Insight', detail: 'Dados de energia, resíduos e RH consolidados no Snowflake.' },
          { title: 'Diagnóstico', detail: '2 indicadores ESRS E1 com lacunas de dados.' },
          { title: 'Recomendação', detail: 'Estimar lacunas com metodologia documentada.' },
          { title: 'Ação', detail: 'Rascunho do relatório gerado com Cortex AI.' },
        ] },
    ],
    table: { title: 'Metas ESG 2030', columns: ['Meta', 'Base', 'Atual', 'Objetivo'], rows: [
      { Meta: 'Âmbito 1+2', Base: '14 200 t', Atual: '8 420 t', Objetivo: '4 300 t' },
      { Meta: 'Renováveis', Base: '35%', Atual: '78%', Objetivo: '100%' },
      { Meta: 'SF₆-free', Base: '5%', Atual: '34%', Objetivo: '80%' },
    ] },
    questions: [
      { q: 'Estamos no caminho da meta 2030?', a: 'Sim — emissões âmbito 1+2 caíram **41%** face à base, trajetória alinhada com SBTi 1,5 °C.' },
    ],
  },
  {
    slug: 'financas', name: 'Finanças & Pessoas', short: 'Finanças', icon: 'LineChart', color: '#EAB308',
    tagline: 'Desempenho financeiro, tesouraria e capital humano',
    kpis: [
      { label: 'Volume de negócios (YTD)', value: '€468 M', delta: '+16% a/a', up: true, good: true },
      { label: 'EBITDA', value: '€52 M', delta: '11,1%', up: true, good: true },
      { label: 'Colaboradores', value: '2 140', delta: '+6%', up: true, good: true },
      { label: 'Rotatividade', value: '7,8%', delta: '-1,1 pp', up: false, good: true },
    ],
    charts: [
      { id: 'fi1', title: 'Receita por unidade (€M)', subtitle: 'Mensal', kind: 'bar', keys: ['Energia', 'Mobilidade', 'Serviços'],
        data: series(43, [['Energia', 28, 6], ['Mobilidade', 8, 3], ['Serviços', 7, 2]]),
        insight: 'Energia representa 66% da receita; Mobilidade com maior crescimento (+34%).',
        forecast: 'Fecho do ano em €515 M (±2%).',
        action: 'Rever alocação de CAPEX a favor de Mobilidade.' },
      { id: 'fi2', title: 'Fluxo de caixa operacional (€M)', subtitle: 'Mensal', kind: 'line', keys: ['FCO'],
        data: series(47, [['FCO', 4, 5]]),
        insight: 'Recebimentos de Eskom atrasados 45 dias afetam FCO de Set.',
        forecast: 'FCO positivo em todos os meses do T1.',
        action: 'Ativar factoring sem recurso para Eskom.' },
    ],
    assets: [
      { name: 'Sede — Leça do Balio', type: 'Sede', lat: 41.21, lng: -8.64, status: 'ok', detail: '1 420 colaboradores' },
      { name: 'Efacec Maia', type: 'Escritório', lat: 41.23, lng: -8.62, status: 'ok', detail: '380 colaboradores' },
      { name: 'Efacec USA — Atlanta', type: 'Filial', lat: 33.75, lng: -84.39, status: 'ok', detail: '64 colaboradores' },
    ],
    agents: [
      { id: 'i1', name: 'Cobranças inteligentes', trigger: 'Fatura vencida > 30 dias', mode: 'humano', approver: 'Dr. João Martins — Diretor Financeiro', impact: '-9 dias DSO',
        steps: [
          { title: 'Insight', detail: '€6,8 M vencidos há mais de 30 dias.' },
          { title: 'Diagnóstico', detail: '72% concentrado em 3 clientes.' },
          { title: 'Recomendação', detail: 'Factoring para Eskom; lembrete formal para os restantes.' },
          { title: 'Aprovação', detail: 'Validação do Diretor Financeiro.' },
          { title: 'Ação', detail: 'Pedido de factoring submetido.' },
        ] },
    ],
    table: { title: 'P&L resumido (YTD)', columns: ['Rubrica', 'Real', 'Orçamento', 'Desvio'], rows: [
      { Rubrica: 'Volume de negócios', Real: '€468 M', Orçamento: '€452 M', Desvio: '+3,5%' },
      { Rubrica: 'Margem bruta', Real: '€131 M', Orçamento: '€124 M', Desvio: '+5,6%' },
      { Rubrica: 'EBITDA', Real: '€52 M', Orçamento: '€48 M', Desvio: '+8,3%' },
    ] },
    questions: [
      { q: 'Qual a previsão de fecho do ano?', a: 'Volume de negócios projetado de **€515 M** (±2%), EBITDA de €58 M.' },
    ],
  },
];

export const executiveQuestions = [
  { q: 'Resume o estado do grupo hoje', a: 'Volume de negócios YTD de **€468 M** (+16%), carteira de transformadores de €412 M. 4 ativos críticos em monitorização e 6 ações de agentes a aguardar aprovação humana.' },
  { q: 'Que decisões aguardam aprovação?', a: '6 decisões: inspeção DGA (Tâmega), firmware BCU 500, OTA carregadores EUA, revisão de preços Beira Alta, hedging de cobre e factoring Eskom.' },
  { q: 'Qual o valor gerado pelo Snowflake?', a: 'Estimativa de **€14,7 M/ano**: manutenção preditiva (€6,1 M), supply chain (€4,2 M), serviço remoto (€1,8 M), reporte automático (€2,6 M).' },
];
