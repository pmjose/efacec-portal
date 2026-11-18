// Visão 360 — clientes, colaboradores e ativos (dados simulados, ligados entre si)
import { series } from './domains';

export type Status = 'ok' | 'aviso' | 'critico';
export type AssetKind = 'transformador' | 'gis' | 'carregador' | 'celas' | 'automacao' | 'tracao';

export type Hotspot = { id: string; label: string; value: string; status: Status };
export type Asset = {
  id: string; name: string; kind: AssetKind; model: string; serial: string; customer: string;
  site: string; lat: number; lng: number; commissioned: string; warrantyUntil: string;
  health: number; status: Status; specs: [string, string][];
  hotspots: Hotspot[];
  telemetry: { title: string; unit: string; keys: string[]; data: Record<string, string | number>[] };
  prediction: { rul: string; failProb: string; driver: string; action: string };
  history: { date: string; type: string; text: string; tech: string }[];
  documents: [string, string][];
};
export type Customer = {
  id: string; name: string; logo: string; segment: string; country: string; hq: string; since: number;
  manager: string; health: number; nps: number; tier: 'Estratégico' | 'Chave' | 'Crescimento';
  revenue12m: string; backlog: string; openAR: string; dso: number; margin: string;
  revenue: Record<string, string | number>[];
  mix: { m: string; v: number }[];
  contracts: [string, string, string, string, Status][];
  opportunities: [string, string, string, string][];
  tickets: [string, string, string, Status][];
  timeline: { date: string; who: string; text: string; kind: 'reuniao' | 'encomenda' | 'servico' | 'alerta' | 'proposta' }[];
  contacts: [string, string, string][];
  nba: { title: string; text: string; value: string }[];
  risks: string[];
  questions: { q: string; a: string }[];
};
export type Employee = {
  id: string; name: string; initials: string; role: string; unit: string; site: string; manager: string;
  since: number; age: number; grade: string; type: string; languages: string;
  skills: { s: string; v: number }[];
  certs: [string, string, Status][];
  training: [string, string, string][];
  performance: { m: string; Avaliação: number; Média: number }[];
  assignments: [string, string, string][];
  customers: string[]; assets: string[];
  kpis: [string, string, string][];
  career: { year: string; role: string }[];
  wellbeing: { engagement: number; flightRisk: 'Baixo' | 'Médio' | 'Alto'; overtime: string; absence: string };
  questions: { q: string; a: string }[];
};

/* ───────────────────────────── ATIVOS ───────────────────────────── */
const H = (id: string, label: string, value: string, status: Status = 'ok'): Hotspot => ({ id, label, value, status });
const tele = (seed: number, title: string, unit: string, keys: [string, number, number][]) =>
  ({ title, unit, keys: keys.map(k => k[0]), data: series(seed, keys, Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}h`)) });

export const assets: Asset[] = [
  { id: 'TP-REN-0450', name: 'Transformador de Potência 450 MVA', kind: 'transformador', model: 'Efacec TPS 450/400', serial: 'EF-T-2019-04712', customer: 'ren',
    site: 'Subestação de Fanhões · Loures', lat: 38.877, lng: -9.163, commissioned: 'Jun 2019', warrantyUntil: 'Jun 2026 (expirada)', health: 86, status: 'ok',
    specs: [['Potência', '450 MVA'], ['Tensões', '400 / 150 / 20 kV'], ['Grupo de ligação', 'YNyn0d11'], ['Arrefecimento', 'ONAN / ONAF / ODAF'], ['Comutador', 'Reinhausen OILTAP® M · ±12 posições'], ['Massa total', '338 t'], ['Óleo', 'Nynas Nytro 4000X · 92 m³'], ['Normas', 'IEC 60076']],
    hotspots: [H('hv', 'Buchas AT 400 kV', 'tan δ 0,31%'), H('oltc', 'Comutador OLTC', 'Pos. 7 · 41 312 manobras'), H('core', 'Núcleo', 'Ruído 72 dB(A)'), H('wind', 'Enrolamentos', 'Ponto quente 89 °C'), H('oil', 'Óleo / DGA', 'H₂ 38 ppm · C₂H₂ 0'), H('cool', 'Radiadores', '4/6 ventiladores ON'), H('cons', 'Conservador', 'Nível 64%')],
    telemetry: tele(201, 'Carga e temperatura (últimas 24 h)', '% / °C', [['Carga %', 68, 14], ['Óleo topo °C', 61, 6], ['Ponto quente °C', 84, 8]]),
    prediction: { rul: '27 anos', failProb: '0,4% / 12 meses', driver: 'Envelhecimento normal do papel isolante (DP estimado 820)', action: 'Manter monitorização DGA online; próxima manutenção do OLTC às 50 000 manobras (≈ Ago 2027).' },
    history: [
      { date: '14 Out 2026', type: 'Preditiva', text: 'Análise de óleo trimestral — sem gases de falha.', tech: 'carla-pinto' },
      { date: '02 Mar 2026', type: 'Preventiva', text: 'Inspeção ao comutador OLTC e substituição de contactos.', tech: 'tiago-rocha' },
      { date: '19 Set 2025', type: 'Upgrade', text: 'Instalação de monitor DGA multigás Hydran M2-X.', tech: 'marta-sousa' },
      { date: '11 Jun 2019', type: 'Comissionamento', text: 'Ensaios SAT e energização.', tech: 'marta-sousa' },
    ],
    documents: [['Relatório FAT', 'PDF · 14 MB'], ['Esquema de ligações', 'DWG'], ['Manual O&M', 'PDF · 38 MB'], ['Certificado IEC 60076', 'PDF']] },

  { id: 'TP-DOM-0336', name: 'Transformador de Potência 336 MVA', kind: 'transformador', model: 'Efacec TPS 336/345', serial: 'EF-T-2021-05230', customer: 'dominion',
    site: 'Chesterfield Substation · Virginia, EUA', lat: 37.38, lng: -77.5, commissioned: 'Nov 2021', warrantyUntil: 'Nov 2026', health: 54, status: 'critico',
    specs: [['Potência', '336 MVA'], ['Tensões', '345 / 138 kV'], ['Grupo de ligação', 'YNa0d1 (autotransformador)'], ['Arrefecimento', 'ONAN / ONAF'], ['Comutador', 'Reinhausen VACUTAP® VR'], ['Massa total', '262 t'], ['Óleo', 'Éster natural FR3 · 71 m³'], ['Normas', 'IEEE C57.12']],
    hotspots: [H('hv', 'Buchas 345 kV', 'tan δ 0,42%', 'aviso'), H('oltc', 'Comutador OLTC', 'Pos. 14 · 18 004 manobras'), H('core', 'Núcleo', 'Ruído 76 dB(A)'), H('wind', 'Enrolamentos', 'Ponto quente 108 °C', 'critico'), H('oil', 'Óleo / DGA', 'C₂H₄ 96 ppm ↑', 'aviso'), H('cool', 'Radiadores', '2 ventiladores em falha', 'critico'), H('cons', 'Conservador', 'Nível 71%')],
    telemetry: tele(203, 'Carga e temperatura (últimas 24 h)', '% / °C', [['Carga %', 92, 10], ['Óleo topo °C', 82, 6], ['Ponto quente °C', 103, 6]]),
    prediction: { rul: '6 anos (sem ação)', failProb: '7,8% / 12 meses', driver: 'Ponto quente elevado por falha de 2 ventiladores ONAF + sobrecarga de verão', action: 'Substituir ventiladores em 72 h, limitar carga a 85% até reparação. Risco desce para 0,9%.' },
    history: [
      { date: '17 Nov 2026', type: 'Alerta', text: 'Ponto quente 108 °C — agente Cortex abriu SRV-24-1187.', tech: 'marta-sousa' },
      { date: '08 Ago 2026', type: 'Corretiva', text: 'Substituição de relé Buchholz.', tech: 'carla-pinto' },
      { date: '21 Nov 2021', type: 'Comissionamento', text: 'Energização e ensaios SAT.', tech: 'marta-sousa' },
    ],
    documents: [['Relatório FAT', 'PDF · 12 MB'], ['Manual O&M (EN)', 'PDF · 41 MB'], ['Relatório DGA Out 2026', 'PDF']] },

  { id: 'GIS-REN-245', name: 'Subestação GIS 245 kV · 8 painéis', kind: 'gis', model: 'Efacec GIS 245 kV', serial: 'EF-G-2022-00811', customer: 'ren',
    site: 'Subestação de Pedralva · Braga', lat: 41.56, lng: -8.5, commissioned: 'Mar 2023', warrantyUntil: 'Mar 2028', health: 93, status: 'ok',
    specs: [['Tensão nominal', '245 kV'], ['Corrente nominal', '3 150 A'], ['Poder de corte', '50 kA / 3 s'], ['Isolamento', 'SF₆ · 6,2 bar abs'], ['Painéis', '8 (2 linhas, 2 TP, 1 acoplamento, 3 reserva)'], ['Comando', 'BCU 500 · IEC 61850']],
    hotspots: [H('bus', 'Barramento duplo', 'SF₆ 6,19 bar'), H('cb', 'Disjuntor Q0', '1 214 manobras · OK'), H('ds', 'Seccionadores Q1/Q2', 'Fechado / Aberto'), H('es', 'Terra Q8', 'Aberto'), H('ct', 'TI / TT', 'Classe 0,2s'), H('cab', 'Terminação de cabo', 'DP < 5 pC')],
    telemetry: tele(205, 'Densidade SF₆ por compartimento (24 h)', 'bar', [['Barramento', 6.19, 0.02], ['Disjuntor', 6.21, 0.02], ['Cabo', 6.18, 0.02]]),
    prediction: { rul: '> 35 anos', failProb: '0,1% / 12 meses', driver: 'Sem desvios de densidade nem descargas parciais', action: 'Nenhuma ação. Próxima inspeção visual em Mar 2027.' },
    history: [{ date: '11 Mar 2026', type: 'Preventiva', text: 'Inspeção anual e ensaio de tempos do disjuntor.', tech: 'tiago-rocha' }, { date: '20 Mar 2023', type: 'Comissionamento', text: 'Energização dos 8 painéis.', tech: 'marta-sousa' }],
    documents: [['Esquema unifilar', 'DWG'], ['Relatório SAT', 'PDF'], ['Plano de manutenção', 'XLSX']] },

  { id: 'HV350-ION-PMB', name: 'Carregador Ultra-rápido HV350 · Hub Pombal', kind: 'carregador', model: 'Efacec HV350', serial: 'EF-C-2024-31877', customer: 'ionity',
    site: 'Área de Serviço de Pombal · A1', lat: 39.91, lng: -8.63, commissioned: 'Abr 2024', warrantyUntil: 'Abr 2027', health: 91, status: 'ok',
    specs: [['Potência máxima', '350 kW'], ['Tensão DC', '150–920 V'], ['Corrente máx.', '500 A (cabo arrefecido a líquido)'], ['Conectores', 'CCS2 × 2'], ['Eficiência', '96,1%'], ['Protocolos', 'OCPP 2.0.1 · ISO 15118 Plug & Charge'], ['Módulos de potência', '7 × 50 kW']],
    hotspots: [H('grid', 'Entrada AC 400 V', 'THD 2,1%'), H('pm', 'Módulos de potência', '7/7 ativos · 61 °C'), H('dcdc', 'Conversor DC/DC', 'η 98,2%'), H('cool', 'Circuito de arrefecimento', '34 °C · 12 l/min'), H('cable', 'Cabo CCS2', '42 °C'), H('hmi', 'HMI / Pagamento', 'Online · 4G + Ethernet')],
    telemetry: tele(207, 'Sessões e potência entregue (24 h)', 'kW / sessões', [['Potência kW', 180, 120], ['Sessões', 4, 3]]),
    prediction: { rul: 'Módulo #3: 14 meses', failProb: '2,1% / 12 meses', driver: 'Ciclos térmicos no módulo de potência #3 acima da média da frota', action: 'Substituição preventiva do módulo #3 na próxima visita (Jan 2027).' },
    history: [{ date: '30 Set 2026', type: 'Remota', text: 'Atualização OTA de firmware v5.2.', tech: 'ana-costa' }, { date: '12 Jun 2026', type: 'Preventiva', text: 'Limpeza de filtros e verificação de cabos.', tech: 'tiago-rocha' }, { date: '18 Abr 2024', type: 'Comissionamento', text: 'Ativação e certificação OCPP.', tech: 'tiago-rocha' }],
    documents: [['Manual de instalação', 'PDF'], ['Declaração CE', 'PDF'], ['Relatório de uptime Q3', 'PDF']] },

  { id: 'HV160-ION-OSL', name: 'Carregador Rápido HV160 · Hub Oslo', kind: 'carregador', model: 'Efacec HV160', serial: 'EF-C-2023-28810', customer: 'ionity',
    site: 'Hub Oslo · E18 Lysaker', lat: 59.91, lng: 10.64, commissioned: 'Jan 2023', warrantyUntil: 'Jan 2026 (expirada)', health: 48, status: 'critico',
    specs: [['Potência máxima', '160 kW'], ['Tensão DC', '150–1 000 V'], ['Conectores', 'CCS2 + CHAdeMO'], ['Eficiência', '95,4%'], ['Protocolos', 'OCPP 1.6J'], ['Módulos de potência', '4 × 40 kW']],
    hotspots: [H('grid', 'Entrada AC 400 V', 'THD 2,8%'), H('pm', 'Módulos de potência', '3/4 ativos · degradado', 'aviso'), H('dcdc', 'Conversor DC/DC', 'η 97,1%'), H('cool', 'Circuito de arrefecimento', '-4 °C · fluxo baixo', 'critico'), H('cable', 'Cabo CCS2', '-11 °C'), H('hmi', 'HMI / Pagamento', 'Online')],
    telemetry: tele(209, 'Temperatura de líquido vs. ambiente (24 h)', '°C', [['Líquido °C', -2, 4], ['Ambiente °C', -15, 4]]),
    prediction: { rul: 'Bomba: 3 semanas', failProb: '34% / 30 dias', driver: 'Viscosidade do glicol a -18 °C e desgaste da bomba de circulação', action: 'Substituir bomba e ativar kit de aquecimento ártico. Agente já colocou em modo degradado (80 kW).' },
    history: [{ date: '18 Nov 2026', type: 'Alerta', text: 'Falha de arrefecimento — modo degradado automático.', tech: 'ana-costa' }, { date: '04 Fev 2026', type: 'Corretiva', text: 'Substituição de leitor RFID.', tech: 'tiago-rocha' }],
    documents: [['Manual O&M', 'PDF'], ['Kit ártico — boletim técnico', 'PDF']] },

  { id: 'NFX-ER-036', name: 'Quadro de Média Tensão Normafix 36 kV', kind: 'celas', model: 'Efacec Normafix 36 kV', serial: 'EF-A-2020-10442', customer: 'eredes',
    site: 'Subestação de Ermesinde · Valongo', lat: 41.22, lng: -8.55, commissioned: 'Out 2020', warrantyUntil: 'Out 2025 (expirada)', health: 74, status: 'aviso',
    specs: [['Tensão nominal', '36 kV'], ['Corrente barramento', '2 500 A'], ['Corrente de curto-circuito', '31,5 kA / 3 s'], ['Celas', '14 (2 chegada, 10 saída, 1 TT, 1 acoplamento)'], ['Disjuntores', 'Vácuo · mola motorizada'], ['Arco interno', 'IAC AFLR 31,5 kA 1 s']],
    hotspots: [H('lv', 'Compartimento BT', 'Relé TPU S500 · OK'), H('cb', 'Disjuntor a vácuo', 'Desgaste contactos 71%', 'aviso'), H('bus', 'Barramento', '58 °C'), H('cab', 'Compartimento de cabos', 'DP 22 pC', 'aviso'), H('ct', 'Transformadores de corrente', 'Classe 5P20')],
    telemetry: tele(211, 'Temperatura de barramento e corrente (24 h)', '°C / A', [['Barramento °C', 52, 8], ['Corrente kA', 1.4, 0.5]]),
    prediction: { rul: 'Disjuntor saída 7: 2 anos', failProb: '3,2% / 12 meses', driver: 'Descargas parciais a subir na terminação de cabo da cela 7', action: 'Refazer terminação de cabo da cela 7 na janela de manutenção de Fev.' },
    history: [{ date: '22 Out 2026', type: 'Preditiva', text: 'Medição de DP online — 22 pC na cela 7.', tech: 'carla-pinto' }, { date: '15 Out 2020', type: 'Comissionamento', text: 'Energização.', tech: 'tiago-rocha' }],
    documents: [['Esquema unifilar', 'DWG'], ['Relatório de DP', 'PDF']] },

  { id: 'SAS-ER-FAR', name: 'Sistema de Automação · SE Faro', kind: 'automacao', model: 'Efacec SAS · CLP 500 + BCU 500', serial: 'EF-S-2018-02217', customer: 'eredes',
    site: 'Subestação de Faro · 60/15 kV', lat: 37.02, lng: -7.93, commissioned: 'Mai 2018', warrantyUntil: 'Mai 2023 (expirada)', health: 61, status: 'critico',
    specs: [['Arquitetura', 'IEC 61850 · Ed. 2'], ['Nível de estação', 'CLP 500 redundante + HMI ScateX#'], ['Nível de painel', '18 × BCU 500 · 22 × TPU S500'], ['Rede', 'PRP · fibra ótica'], ['Sincronização', 'PTP IEEE 1588'], ['Telecontrolo', 'IEC 60870-5-104 → Centro de Sacavém']],
    hotspots: [H('scada', 'HMI / SCADA', 'Online'), H('gw', 'Gateway 104', 'Ligado a Sacavém'), H('swa', 'Rede PRP — LAN A', 'OK'), H('swb', 'Rede PRP — LAN B', 'Erros CRC · porta 12', 'critico'), H('bcu', 'BCU 500 (18)', '6 com firmware < 4.2', 'aviso'), H('prot', 'Proteções TPU S500 (22)', 'OK')],
    telemetry: tele(213, 'Mensagens GOOSE/s e latência (24 h)', 'msg/s · ms', [['GOOSE msg/s', 1200, 200], ['Latência ms', 3, 2]]),
    prediction: { rul: 'Switch LAN B: falha iminente', failProb: '61% / 30 dias', driver: 'Erros CRC crescentes na porta 12 — degradação de transcetor SFP', action: 'Substituir SFP da porta 12 e atualizar 6 BCU para firmware 4.2 (CVE-2026-1142).' },
    history: [{ date: '18 Nov 2026', type: 'Alerta', text: 'Perda GOOSE 47 s — agente comutou para LAN A.', tech: 'pedro-lima' }, { date: '09 Jul 2025', type: 'Upgrade', text: 'Atualização HMI ScateX# v8.', tech: 'pedro-lima' }],
    documents: [['Arquitetura de rede', 'PDF'], ['Ficheiro SCD', 'XML · IEC 61850'], ['Relatório de cibersegurança', 'PDF']] },

  { id: 'SST-MP-RUBI', name: 'Subestação de Tração · Linha Rubi', kind: 'tracao', model: 'Efacec Rectifier Substation 750 Vdc', serial: 'EF-R-2026-00094', customer: 'metroporto',
    site: 'Estação Santo Ovídio · Vila Nova de Gaia', lat: 41.11, lng: -8.62, commissioned: 'Em obra (61%)', warrantyUntil: '—', health: 92, status: 'aviso',
    specs: [['Alimentação', '15 kV AC'], ['Saída', '750 Vdc catenária'], ['Grupos retificadores', '2 × 3,3 MW · 12 pulsos'], ['Recuperação de energia', 'Inversor reversível 1 MW'], ['Disjuntores DC', 'Ultra-rápidos 4 000 A'], ['SCADA', 'Integração Metro do Porto']],
    hotspots: [H('mv', 'Celas 15 kV', 'Instaladas'), H('tr', 'Transformadores retificador', 'Em ensaio', 'aviso'), H('rect', 'Retificadores 12 pulsos', 'Em montagem', 'aviso'), H('inv', 'Inversor reversível', 'Pendente'), H('dc', 'Disjuntores DC', 'Instalados'), H('cat', 'Saídas para catenária', 'Pendente')],
    telemetry: tele(215, 'Avanço de obra (%) por frente', '%', [['Real %', 50, 25], ['Planeado %', 53, 25]]),
    prediction: { rul: '—', failProb: '—', driver: 'Risco de prazo: janelas noturnas limitadas', action: 'Turno extra de fim de semana recupera 3% de atraso até Mar 2027.' },
    history: [{ date: '12 Nov 2026', type: 'Obra', text: 'Ensaios dos transformadores retificador iniciados.', tech: 'carla-pinto' }],
    documents: [['Projeto de execução', 'PDF'], ['Plano de trabalhos', 'MPP']] },
  { id: 'TP-ESK-0500', name: 'Transformador de Potência 500 MVA', kind: 'transformador', model: 'Efacec TPS 500/400', serial: 'EF-T-2024-06118', customer: 'eskom',
    site: 'Majuba Power Station · Mpumalanga', lat: -27.1, lng: 29.77, commissioned: 'Fev 2025', warrantyUntil: 'Fev 2030', health: 79, status: 'aviso',
    specs: [['Potência', '500 MVA'], ['Tensões', '400 / 22 kV'], ['Grupo de ligação', 'YNd1 (transformador elevador)'], ['Arrefecimento', 'ODAF'], ['Comutador', 'Reinhausen OILTAP® R'], ['Massa total', '362 t'], ['Óleo', 'Nynas Nytro Lyra X · 98 m³'], ['Normas', 'IEC 60076 · SANS 780']],
    hotspots: [H('hv', 'Buchas AT 400 kV', 'tan δ 0,29%'), H('oltc', 'Comutador OLTC', 'Pos. 9 · 6 210 manobras'), H('core', 'Núcleo', 'Ruído 74 dB(A)'), H('wind', 'Enrolamentos', 'Ponto quente 94 °C'), H('oil', 'Óleo / DGA', 'Humidade 18 ppm ↑', 'aviso'), H('cool', 'Radiadores', '6/6 bombas ON'), H('cons', 'Conservador', 'Nível 58%')],
    telemetry: tele(217, 'Carga e temperatura (últimas 24 h)', '% / °C', [['Carga %', 84, 10], ['Óleo topo °C', 68, 5], ['Ponto quente °C', 91, 6]]),
    prediction: { rul: '31 anos', failProb: '0,9% / 12 meses', driver: 'Humidade no óleo a subir após época das chuvas — possível falha no secador de sílica', action: 'Substituir sílica do secador e agendar filtragem de óleo na próxima paragem da central.' },
    history: [{ date: '29 Out 2026', type: 'Preditiva', text: 'Análise de óleo remota — humidade 18 ppm.', tech: 'carla-pinto' }, { date: '12 Fev 2025', type: 'Comissionamento', text: 'Energização com Eskom Generation.', tech: 'marta-sousa' }],
    documents: [['Relatório FAT', 'PDF · 15 MB'], ['Manual O&M (EN)', 'PDF · 40 MB'], ['Certificado SANS 780', 'PDF']] },
];

/* ───────────────────────────── CLIENTES ───────────────────────────── */
const rev = (seed: number, a: number, b: number, c: number) =>
  series(seed, [['Produtos', a, a * .3], ['Serviços', b, b * .25], ['Projetos', c, c * .4]], ['2021', '2022', '2023', '2024', '2025', '2026']);

export const customers: Customer[] = [
  { id: 'ren', name: 'REN — Redes Energéticas Nacionais', logo: 'REN', segment: 'Operador de rede de transporte (TSO)', country: 'Portugal', hq: 'Lisboa', since: 1994,
    manager: 'ines-barbosa', health: 88, nps: 52, tier: 'Estratégico', revenue12m: '€61,2 M', backlog: '€142 M', openAR: '€8,4 M', dso: 52, margin: '26,8%',
    revenue: rev(301, 32, 6, 8), mix: [{ m: 'Transformadores', v: 58 }, { m: 'Aparelhagem AT', v: 22 }, { m: 'Automação', v: 8 }, { m: 'Serviços', v: 12 }],
    contracts: [['SC-2019-041', 'Monitorização DGA de frota', '€1,2 M/ano', 'Jan 2027', 'ok'], ['AQ-2023-07', 'Acordo-quadro transformadores 2023–27', '€180 M', 'Dez 2027', 'ok'], ['SC-2023-112', 'Manutenção GIS Pedralva', '€0,3 M/ano', 'Mar 2028', 'ok']],
    opportunities: [['3× TP 450 MVA 400 kV', '€38,0 M', 'Proposta', '62%'], ['Retrofit SE Riba d’Ave', '€6,4 M', 'Qualificação', '40%'], ['Monitorização frota 220 kV', '€2,1 M', 'Negociação', '75%']],
    tickets: [['SRV-24-1192', 'Ruído anómalo TP Fanhões T3', 'Em análise', 'aviso'], ['SRV-24-1150', 'Calibração Hydran', 'Fechado', 'ok']],
    timeline: [
      { date: '15 Nov 2026', who: 'Inês Barbosa', text: 'Reunião de negociação — concurso 3× TP 450 MVA.', kind: 'reuniao' },
      { date: '04 Nov 2026', who: 'Cortex', text: 'Win-probability recalculada: 62% → recomendação de ajuste de preço.', kind: 'alerta' },
      { date: '22 Out 2026', who: 'Comercial', text: 'Submissão de proposta técnica e comercial.', kind: 'proposta' },
      { date: '14 Out 2026', who: 'Carla Pinto', text: 'Análise de óleo trimestral TP-REN-0450.', kind: 'servico' },
      { date: '30 Set 2026', who: 'REN', text: 'Encomenda de 2 transformadores 170 MVA (€14,8 M).', kind: 'encomenda' },
    ],
    contacts: [['Eng. António Matos', 'Diretor de Ativos', 'Decisor'], ['Eng.ª Joana Reis', 'Compras', 'Influenciador'], ['Eng. Bruno Saraiva', 'Manutenção Subestações', 'Utilizador']],
    nba: [{ title: 'Ajustar preço da proposta 450 MVA', text: '-2% no preço + 5 anos de monitorização DGA aumenta win-probability para 78%.', value: '+€38 M carteira' }, { title: 'Renovar contrato DGA antecipadamente', text: 'Contrato expira em Jan 2027; NPS 52 e 0 falhas de SLA — propor 5 anos com extensão a 220 kV.', value: '+€2,1 M' }],
    risks: ['Concorrência asiática agressiva no concurso 400 kV', 'Garantia do TP Fanhões expirou em Jun 2026'],
    questions: [{ q: 'Qual o estado da relação com a REN?', a: 'Cliente **Estratégico** com saúde 88/100 e NPS 52. €61,2 M de vendas em 12 meses e €142 M em carteira. Foco imediato: concurso 3× TP 450 MVA (win-probability 62%).' }, { q: 'Que ativos da REN monitorizamos?', a: '**TP-REN-0450** (450 MVA Fanhões, saúde 86) e **GIS-REN-245** (Pedralva, saúde 93). Nenhum crítico.' }] },

  { id: 'eredes', name: 'E-REDES — Distribuição de Eletricidade', logo: 'E-R', segment: 'Operador de rede de distribuição (DSO)', country: 'Portugal', hq: 'Lisboa', since: 1976,
    manager: 'ines-barbosa', health: 71, nps: 44, tier: 'Estratégico', revenue12m: '€48,7 M', backlog: '€96 M', openAR: '€6,1 M', dso: 61, margin: '22,4%',
    revenue: rev(303, 22, 9, 6), mix: [{ m: 'Celas MT', v: 38 }, { m: 'Automação', v: 27 }, { m: 'Transformadores MT/AT', v: 19 }, { m: 'Serviços', v: 16 }],
    contracts: [['SC-2021-301', 'Manutenção SAS 120 subestações', '€2,4 M/ano', 'Dez 2027', 'ok'], ['AQ-2024-02', 'Fornecimento celas Normafix', '€42 M', 'Jun 2027', 'aviso']],
    opportunities: [['Automação 40 SE (DSO 2030)', '€18,2 M', 'Proposta', '55%'], ['Celas Fluokit SF₆-free', '€11,0 M', 'Qualificação', '45%']],
    tickets: [['ALM-90211', 'Perda GOOSE SE Faro', 'Mitigado', 'critico'], ['OS-55821', 'Disjuntor em falha · Braga', 'Em rota', 'aviso'], ['ALM-90207', 'Firmware BCU 500 Coimbra Norte', 'Planeado', 'aviso']],
    timeline: [
      { date: '18 Nov 2026', who: 'Cortex', text: 'SE Faro: perda GOOSE — agente comutou para LAN A em 12 min.', kind: 'alerta' },
      { date: '18 Nov 2026', who: 'Tiago Rocha', text: 'OS-55821 atribuída — disjuntor em Braga.', kind: 'servico' },
      { date: '06 Nov 2026', who: 'Inês Barbosa', text: 'Workshop Plano DSO 2030 — automação de 40 subestações.', kind: 'reuniao' },
      { date: '20 Out 2026', who: 'E-Redes', text: 'Encomenda de 120 celas Normafix 36 kV.', kind: 'encomenda' },
    ],
    contacts: [['Eng.ª Sofia Neves', 'Diretora de Rede', 'Decisor'], ['Eng. Hugo Lopes', 'Automação & Telecontrolo', 'Influenciador']],
    nba: [{ title: 'Propor campanha de firmware BCU 500', text: '6 BCU vulneráveis na SE Faro e 41 subestações afetadas por CVE-2026-1142 — serviço de patching gerido.', value: '+€0,6 M' }, { title: 'Posicionar Fluokit SF₆-free', text: 'Regulação F-Gas 2026 obriga a alternativas em MT até 24 kV.', value: '+€11 M' }],
    risks: ['3 incidentes de automação em 30 dias (SLA em risco)', 'Pressão de preço em celas MT'],
    questions: [{ q: 'Porque desceu a saúde da conta E-Redes?', a: 'Saúde **71/100**: 3 incidentes de automação em 30 dias (SE Faro crítico) e DSO de 61 dias. Ação recomendada: campanha de firmware BCU 500 gerida.' }] },

  { id: 'dominion', name: 'Dominion Energy', logo: 'D', segment: 'Utility integrada', country: 'EUA', hq: 'Richmond, Virginia', since: 2018,
    manager: 'ines-barbosa', health: 63, nps: 58, tier: 'Chave', revenue12m: '€39,0 M', backlog: '€121 M', openAR: '€9,2 M', dso: 48, margin: '28,1%',
    revenue: rev(305, 18, 2, 3), mix: [{ m: 'Transformadores', v: 86 }, { m: 'Serviços', v: 9 }, { m: 'Peças', v: 5 }],
    contracts: [['AQ-2022-US1', 'Fornecimento transformadores 345 kV', '$220 M', 'Dez 2028', 'ok'], ['SC-2021-US4', 'Garantia estendida TP Chesterfield', 'Incluído', 'Nov 2026', 'critico']],
    opportunities: [['Subestações 345 kV (fase 2)', '€54,2 M', 'Negociação', '55%'], ['Serviço de monitorização de frota', '€3,4 M', 'Qualificação', '50%']],
    tickets: [['SRV-24-1187', 'Ponto quente 108 °C · TP Chesterfield', 'Aguarda aprovação', 'critico']],
    timeline: [
      { date: '17 Nov 2026', who: 'Cortex', text: 'Alerta crítico: ponto quente 108 °C no TP-DOM-0336.', kind: 'alerta' },
      { date: '10 Nov 2026', who: 'Inês Barbosa', text: 'Visita a Richmond — fase 2 das subestações 345 kV.', kind: 'reuniao' },
      { date: '02 Out 2026', who: 'Dominion', text: 'Encomenda OF-7790 (336 MVA).', kind: 'encomenda' },
    ],
    contacts: [['Michael Turner', 'VP Transmission Assets', 'Decisor'], ['Sarah Collins', 'Procurement Lead', 'Influenciador']],
    nba: [{ title: 'Resolver alerta antes do fim da garantia', text: 'Garantia termina em Nov 2026 — intervenção rápida protege renovação e fase 2 (€54 M).', value: 'Protege €54 M' }, { title: 'Upsell de monitorização de frota', text: '0 transformadores Dominion com monitorização Efacec contratada.', value: '+€3,4 M' }],
    risks: ['Ativo crítico no fim da garantia', 'Prazo da OF-7790 dependente de aço GO'],
    questions: [{ q: 'Que risco temos na Dominion Energy?', a: 'O **TP-DOM-0336** está crítico (ponto quente 108 °C, 2 ventiladores em falha) e a garantia termina este mês. A resolução rápida protege a fase 2 de €54,2 M.' }] },

  { id: 'ionity', name: 'IONITY', logo: 'IO', segment: 'Operador de carregamento (CPO)', country: 'Europa', hq: 'Munique, Alemanha', since: 2019,
    manager: 'ana-costa', health: 79, nps: 49, tier: 'Chave', revenue12m: '€22,8 M', backlog: '€34 M', openAR: '€2,9 M', dso: 44, margin: '19,6%',
    revenue: rev(307, 12, 4, 1), mix: [{ m: 'HV350', v: 64 }, { m: 'HV160', v: 14 }, { m: 'Contratos uptime', v: 22 }],
    contracts: [['SC-2021-088', 'Uptime 98% HV350 · 420 carregadores', '€1,6 M/ano', 'Fev 2027', 'aviso']],
    opportunities: [['Rede HV350 corredores TEN-T', '€21,5 M', 'Negociação', '70%'], ['Retrofit HV160 → kit ártico', '€0,8 M', 'Proposta', '80%']],
    tickets: [['EM-31882', 'Arrefecimento · Hub Oslo', 'Modo degradado', 'critico'], ['EM-31801', 'Módulo potência #3 · Pombal', 'Planeado', 'ok']],
    timeline: [
      { date: '18 Nov 2026', who: 'Cortex', text: 'HV160 Oslo: falha de arrefecimento — modo degradado automático.', kind: 'alerta' },
      { date: '28 Out 2026', who: 'Ana Costa', text: 'QBR — uptime 98,7% (meta 98%).', kind: 'reuniao' },
      { date: '30 Set 2026', who: 'Ana Costa', text: 'OTA v5.2 em 420 carregadores.', kind: 'servico' },
    ],
    contacts: [['Lars Andersen', 'Head of Operations', 'Decisor'], ['Eva Schmidt', 'Hardware Procurement', 'Influenciador']],
    nba: [{ title: 'Propor kit ártico a toda a frota nórdica', text: '38 HV160 em Noruega/Suécia com o mesmo perfil térmico do Hub Oslo.', value: '+€0,8 M' }],
    risks: ['Contrato de uptime em renovação com 1 hub crítico'],
    questions: [{ q: 'Estamos a cumprir o SLA de uptime da IONITY?', a: 'Sim — **98,7%** vs. meta de 98%. Risco: Hub Oslo em modo degradado; o kit ártico elimina a causa em 38 carregadores nórdicos.' }] },

  { id: 'metroporto', name: 'Metro do Porto', logo: 'M', segment: 'Transporte ferroviário urbano', country: 'Portugal', hq: 'Porto', since: 2002,
    manager: 'ines-barbosa', health: 58, nps: 31, tier: 'Crescimento', revenue12m: '€14,1 M', backlog: '€33 M', openAR: '€3,8 M', dso: 74, margin: '14,2%',
    revenue: rev(309, 2, 1, 9), mix: [{ m: 'Projetos de energia', v: 78 }, { m: 'Manutenção', v: 14 }, { m: 'Peças', v: 8 }],
    contracts: [['PR-2024-MP1', 'Linha Rubi — energia e catenária', '€48 M', 'Jun 2027', 'aviso']],
    opportunities: [['Linha Rosa — subestações', '€12,3 M', 'Concurso', '35%']],
    tickets: [['OBR-0412', 'Atraso frente Santo Ovídio', 'Em recuperação', 'aviso']],
    timeline: [{ date: '12 Nov 2026', who: 'Carla Pinto', text: 'Início dos ensaios dos transformadores retificador.', kind: 'servico' }, { date: '05 Nov 2026', who: 'Metro do Porto', text: 'Reunião de obra — atraso de 3% sinalizado.', kind: 'reuniao' }],
    contacts: [['Eng. Ricardo Alves', 'Diretor de Obra', 'Decisor']],
    nba: [{ title: 'Aprovar turno extra de fim de semana', text: 'Recupera o atraso de 3% e melhora NPS antes do concurso da Linha Rosa.', value: 'Protege €12,3 M' }],
    risks: ['NPS 31 antes de concurso relevante', 'DSO de 74 dias'],
    questions: [{ q: 'Como recuperar a relação com o Metro do Porto?', a: 'NPS **31** devido ao atraso na Linha Rubi. Aprovar o turno extra recupera o prazo antes do concurso da Linha Rosa (€12,3 M).' }] },

  { id: 'eskom', name: 'Eskom Holdings', logo: 'Es', segment: 'Utility integrada', country: 'África do Sul', hq: 'Joanesburgo', since: 2009,
    manager: 'ines-barbosa', health: 52, nps: 28, tier: 'Chave', revenue12m: '€19,6 M', backlog: '€64 M', openAR: '€11,7 M', dso: 105, margin: '21,0%',
    revenue: rev(311, 10, 3, 2), mix: [{ m: 'Transformadores', v: 81 }, { m: 'Serviços', v: 19 }],
    contracts: [['SC-2020-117', 'Manutenção total Majuba', '€0,9 M/ano', 'Dez 2026', 'critico']],
    opportunities: [['TP 500 MVA OF-7822 (2.ª unidade)', '€9,8 M', 'Negociação', '45%']],
    tickets: [['FIN-0091', 'Faturas vencidas > 90 dias', 'Factoring proposto', 'critico']],
    timeline: [{ date: '13 Nov 2026', who: 'Finanças', text: 'Proposta de factoring sem recurso submetida a aprovação.', kind: 'alerta' }, { date: '01 Out 2026', who: 'Eskom', text: 'Expedição TP 400 kV via Durban.', kind: 'encomenda' }],
    contacts: [['Thabo Nkosi', 'Senior Manager Transmission', 'Decisor']],
    nba: [{ title: 'Factoring sem recurso', text: '€11,7 M em aberto com DSO 105 dias.', value: '-9 dias DSO' }],
    risks: ['Risco de crédito (DSO 105)', 'Contrato de manutenção expira em Dez'],
    questions: [{ q: 'Qual a exposição financeira à Eskom?', a: '**€11,7 M** em aberto com DSO de 105 dias. Factoring sem recurso aguarda aprovação do Diretor Financeiro.' }] },
];

/* ───────────────────────────── COLABORADORES ───────────────────────────── */
const perf = (seed: number, base: number) => ['2021', '2022', '2023', '2024', '2025', '2026'].map((m, i) => ({ m, 'Avaliação': Math.min(5, Math.round((base + Math.sin(seed + i) * .3 + i * .08) * 10) / 10), 'Média': 3.4 }));

export const employees: Employee[] = [
  { id: 'marta-sousa', name: 'Marta Sousa', initials: 'MS', role: 'Service Manager — Transformadores', unit: 'Serviços & Pós-venda', site: 'Arroteia', manager: 'Paulo Teixeira',
    since: 2011, age: 41, grade: 'L5 · Gestão', type: 'Efetivo', languages: 'PT · EN · ES',
    skills: [{ s: 'Diagnóstico DGA', v: 95 }, { s: 'Ensaios AT', v: 88 }, { s: 'Gestão de equipas', v: 84 }, { s: 'Negociação', v: 72 }, { s: 'Análise de dados', v: 78 }, { s: 'HSE', v: 90 }],
    certs: [['Trabalhos em tensão AT', 'Mar 2027', 'ok'], ['CIGRE WG A2 — DGA', 'Permanente', 'ok'], ['PMP', 'Jun 2027', 'ok']],
    training: [['Nexus Academy — Cortex AI para engenheiros', '16 h', 'Out 2026'], ['Liderança Efacec 2.0', '40 h', 'Mai 2026']],
    performance: perf(1, 4.3), assignments: [['SRV-24-1187', 'Inspeção TP Dominion (aprovação)', 'Ativo'], ['Programa DGA REN', 'Gestora de contrato', 'Ativo']],
    customers: ['ren', 'dominion', 'eskom'], assets: ['TP-REN-0450', 'TP-DOM-0336', 'GIS-REN-245', 'TP-ESK-0500'],
    kpis: [['Equipa', '14 técnicos'], ['FTFR da equipa', '91%'], ['NPS clientes', '55']].map(([a, b]) => [a, b, '']) as [string, string, string][],
    career: [{ year: '2011', role: 'Engenheira de Ensaios' }, { year: '2015', role: 'Engenheira de Serviço Sénior' }, { year: '2019', role: 'Team Lead Field Service' }, { year: '2023', role: 'Service Manager' }],
    wellbeing: { engagement: 84, flightRisk: 'Baixo', overtime: '6 h/mês', absence: '1,2%' },
    questions: [{ q: 'Que aprovações tem a Marta pendentes?', a: 'Uma: **inspeção DGA ao TP-DOM-0336** (Dominion Energy), proposta pelo agente de vigilância com prazo de 72 h.' }] },

  { id: 'tiago-rocha', name: 'Tiago Rocha', initials: 'TR', role: 'Técnico de Campo Sénior', unit: 'Serviços & Pós-venda', site: 'Equipa Norte · Porto', manager: 'Marta Sousa',
    since: 2016, age: 34, grade: 'T4 · Técnico', type: 'Efetivo', languages: 'PT · EN',
    skills: [{ s: 'Aparelhagem MT', v: 92 }, { s: 'Carregadores HV', v: 85 }, { s: 'Comutadores OLTC', v: 80 }, { s: 'IEC 61850', v: 58 }, { s: 'HSE', v: 94 }, { s: 'Diagnóstico remoto', v: 70 }],
    certs: [['Trabalhos em tensão MT', 'Dez 2026', 'aviso'], ['Primeiros socorros', 'Set 2027', 'ok'], ['Efacec HV350 Nível 3', 'Abr 2027', 'ok']],
    training: [['Renovação TET — sessão 25 Nov (inscrito pelo agente)', '24 h', 'Nov 2026'], ['HV350 v2 — novidades', '8 h', 'Set 2026']],
    performance: perf(2, 4.0), assignments: [['OS-55821', 'Disjuntor em falha · E-Redes Braga', 'Em rota'], ['EM-31801', 'Módulo #3 HV350 Pombal', 'Jan 2027']],
    customers: ['eredes', 'ionity', 'ren'], assets: ['NFX-ER-036', 'HV350-ION-PMB', 'GIS-REN-245', 'TP-REN-0450'],
    kpis: [['OS concluídas (12m)', '214'], ['First-time fix', '93%'], ['Km / OS', '48 km']].map(([a, b]) => [a, b, '']) as [string, string, string][],
    career: [{ year: '2016', role: 'Técnico de Montagem' }, { year: '2019', role: 'Técnico de Campo' }, { year: '2023', role: 'Técnico de Campo Sénior' }],
    wellbeing: { engagement: 78, flightRisk: 'Médio', overtime: '19 h/mês', absence: '2,0%' },
    questions: [{ q: 'O Tiago está certificado para a próxima missão?', a: 'A certificação **TET MT expira a Dez 2026**. O agente HSE já o inscreveu na sessão de 25 Nov — fica válido antes da OS-55821 seguinte.' }] },

  { id: 'pedro-lima', name: 'Pedro Lima', initials: 'PL', role: 'Engenheiro de Cibersegurança OT', unit: 'Automação & Smart Grids', site: 'Maia', manager: 'Luís Moreira',
    since: 2019, age: 31, grade: 'L3 · Especialista', type: 'Efetivo', languages: 'PT · EN · FR',
    skills: [{ s: 'IEC 62443', v: 91 }, { s: 'IEC 61850', v: 86 }, { s: 'Redes PRP/HSR', v: 88 }, { s: 'Forense OT', v: 74 }, { s: 'Python', v: 80 }, { s: 'Comunicação', v: 70 }],
    certs: [['GICSP', 'Ago 2027', 'ok'], ['ISA/IEC 62443 Expert', 'Fev 2028', 'ok']],
    training: [['NIS2 para operadores críticos', '12 h', 'Set 2026']],
    performance: perf(3, 4.4), assignments: [['CVE-2026-1142', 'Campanha firmware BCU 500 (aprovação)', 'Ativo'], ['ALM-90211', 'Análise pós-incidente SE Faro', 'Ativo']],
    customers: ['eredes'], assets: ['SAS-ER-FAR'],
    kpis: [['IEDs sob gestão', '41 300'], ['Vulnerabilidades fechadas', '27'], ['MTTR incidentes', '12 min']].map(([a, b]) => [a, b, '']) as [string, string, string][],
    career: [{ year: '2019', role: 'Engenheiro de Automação' }, { year: '2022', role: 'Engenheiro de Cibersegurança OT' }],
    wellbeing: { engagement: 72, flightRisk: 'Alto', overtime: '24 h/mês', absence: '0,8%' },
    questions: [{ q: 'Qual o risco de saída do Pedro?', a: 'Risco **Alto** (perfil escasso no mercado, banda salarial -9% vs. mercado, 24 h extra/mês). Incluído no plano de retenção de Automação a aguardar aprovação da Direção de Pessoas.' }] },

  { id: 'ana-costa', name: 'Ana Costa', initials: 'AC', role: 'Product Owner — E-Mobility', unit: 'Mobilidade Elétrica', site: 'Maia', manager: 'Diretor de Mobilidade',
    since: 2017, age: 36, grade: 'L4 · Gestão de produto', type: 'Efetivo', languages: 'PT · EN · DE',
    skills: [{ s: 'Gestão de produto', v: 90 }, { s: 'OCPP / ISO 15118', v: 84 }, { s: 'Eletrónica de potência', v: 68 }, { s: 'Análise de dados', v: 86 }, { s: 'Stakeholders', v: 88 }, { s: 'Agile', v: 82 }],
    certs: [['SAFe POPM', 'Mar 2027', 'ok']],
    training: [['Nexus Academy — Snowflake avançado', '24 h', 'Ago 2026']],
    performance: perf(4, 4.5), assignments: [['OTA v5.3', 'Campanha 1 240 carregadores EUA (aprovação)', 'Ativo'], ['IONITY QBR', 'Gestora de conta técnica', 'Ativo']],
    customers: ['ionity'], assets: ['HV350-ION-PMB', 'HV160-ION-OSL'],
    kpis: [['Carregadores conectados', '9 640'], ['Uptime da rede', '98,7%'], ['Releases (12m)', '6']].map(([a, b]) => [a, b, '']) as [string, string, string][],
    career: [{ year: '2017', role: 'Engenheira de Software' }, { year: '2020', role: 'Tech Lead Firmware' }, { year: '2023', role: 'Product Owner E-Mobility' }],
    wellbeing: { engagement: 88, flightRisk: 'Baixo', overtime: '8 h/mês', absence: '1,0%' },
    questions: [{ q: 'Que decisões estão com a Ana?', a: 'A **campanha OTA v5.3** para 1 240 carregadores nos EUA (+1,0 pp uptime), em rollout canário de 5%.' }] },

  { id: 'ines-barbosa', name: 'Inês Barbosa', initials: 'IB', role: 'Diretora Comercial', unit: 'Comercial & Vendas', site: 'Arroteia', manager: 'Comissão Executiva',
    since: 2008, age: 47, grade: 'D1 · Direção', type: 'Efetivo', languages: 'PT · EN · ES · FR',
    skills: [{ s: 'Negociação', v: 96 }, { s: 'Mercados internacionais', v: 92 }, { s: 'Pricing', v: 85 }, { s: 'Liderança', v: 90 }, { s: 'Análise de dados', v: 74 }, { s: 'Setor energético', v: 94 }],
    certs: [['Executive MBA — Porto Business School', 'Permanente', 'ok']],
    training: [['IA generativa para líderes', '8 h', 'Out 2026']],
    performance: perf(5, 4.6), assignments: [['Concurso REN 400 kV', 'Aprovação de preço', 'Ativo'], ['Plano comercial EUA 2027', 'Sponsor', 'Ativo']],
    customers: ['ren', 'eredes', 'dominion', 'metroporto', 'eskom'], assets: [],
    kpis: [['Encomendas YTD', '€531 M'], ['Win rate', '31,4%'], ['Equipa', '64 pessoas']].map(([a, b]) => [a, b, '']) as [string, string, string][],
    career: [{ year: '2008', role: 'Key Account Manager' }, { year: '2014', role: 'Diretora de Mercados Internacionais' }, { year: '2021', role: 'Diretora Comercial' }],
    wellbeing: { engagement: 86, flightRisk: 'Baixo', overtime: '—', absence: '0,5%' },
    questions: [{ q: 'Que contas gere a Inês?', a: '5 contas: **REN, E-Redes, Dominion Energy, Metro do Porto e Eskom** — €183 M de vendas a 12 meses.' }] },

  { id: 'carla-pinto', name: 'Carla Pinto', initials: 'CP', role: 'Engenheira de Diagnóstico', unit: 'Serviços & Pós-venda', site: 'Equipa Sul · Lisboa', manager: 'Marta Sousa',
    since: 2020, age: 29, grade: 'L2 · Engenheira', type: 'Efetivo', languages: 'PT · EN',
    skills: [{ s: 'Diagnóstico DGA', v: 82 }, { s: 'Descargas parciais', v: 86 }, { s: 'Ensaios AT', v: 76 }, { s: 'Análise de dados', v: 88 }, { s: 'HSE', v: 85 }, { s: 'Comunicação', v: 74 }],
    certs: [['Trabalhos em tensão AT', 'Mai 2027', 'ok'], ['Termografia nível II', 'Jan 2027', 'aviso']],
    training: [['Nexus Academy — Cortex AI para engenheiros', '16 h', 'Out 2026'], ['Descargas parciais avançado (Omicron)', '24 h', 'Abr 2026']],
    performance: perf(6, 4.1), assignments: [['OS-55817', 'Ensaios REN Sines', 'Em execução'], ['SST-MP-RUBI', 'Ensaios transformadores retificador', 'Ativo']],
    customers: ['ren', 'eredes', 'dominion', 'metroporto', 'eskom'], assets: ['TP-REN-0450', 'NFX-ER-036', 'TP-DOM-0336', 'SST-MP-RUBI', 'TP-ESK-0500'],
    kpis: [['Diagnósticos (12m)', '138'], ['Precisão diagnósticos', '96%'], ['Relatórios em < 48 h', '92%']].map(([a, b]) => [a, b, '']) as [string, string, string][],
    career: [{ year: '2020', role: 'Engenheira Júnior de Ensaios' }, { year: '2023', role: 'Engenheira de Diagnóstico' }],
    wellbeing: { engagement: 81, flightRisk: 'Médio', overtime: '11 h/mês', absence: '1,6%' },
    questions: [{ q: 'Que ativos a Carla acompanha?', a: '4 ativos: **TP-REN-0450, NFX-ER-036, TP-DOM-0336 e SST-MP-RUBI**. Destaque: deteção precoce das DP na cela 7 da Normafix de Ermesinde.' }] },
];

export const findCustomer = (id?: string) => customers.find(c => c.id === id);
export const findEmployee = (id?: string) => employees.find(e => e.id === id);
export const findAsset = (id?: string) => assets.find(a => a.id === id);
export const KIND_LABEL: Record<AssetKind, string> = { transformador: 'Transformador de potência', gis: 'Aparelhagem GIS', carregador: 'Carregador VE', celas: 'Celas MT', automacao: 'Automação de subestação', tracao: 'Subestação de tração' };
