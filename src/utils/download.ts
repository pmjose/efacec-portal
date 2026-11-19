// Downloads gerados no browser: CSV (Excel PT usa ';') e PDF simples de uma ou mais páginas.

function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const slug = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w]+/g, '_').replace(/^_|_$/g, '').toLowerCase();
export const stamp = () => new Date().toISOString().slice(0, 10);

export type Sheet = { title: string; columns: string[]; rows: Record<string, string | number>[] };
const cell = (v: unknown) => { const s = String(v ?? ''); return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

export function downloadCsv(name: string, sheets: Sheet[]) {
  const body = sheets.map(s => [`# ${s.title}`, s.columns.map(cell).join(';'), ...s.rows.map(r => s.columns.map(c => cell(r[c])).join(';'))].join('\r\n')).join('\r\n\r\n');
  save(new Blob(['\ufeff' + body], { type: 'text/csv;charset=utf-8' }), `${slug(name)}_${stamp()}.csv`);
}

/* ── PDF mínimo (Helvetica, WinAnsi) ── */
const WIN: Record<string, number> = { '€': 0x80, '—': 0x97, '–': 0x96, '•': 0x95, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '…': 0x85 };
function enc(s: string) {
  let out = '';
  for (const ch of s) {
    const code = WIN[ch] ?? (ch.charCodeAt(0) < 256 ? ch.charCodeAt(0) : 63);
    const c = String.fromCharCode(code);
    out += c === '(' || c === ')' || c === '\\' ? '\\' + c : code > 126 ? '\\' + code.toString(8).padStart(3, '0') : c;
  }
  return out;
}
const sub = (s: string) => s.replace(/₂/g, '2').replace(/₄/g, '4').replace(/₆/g, '6').replace(/δ/g, 'delta').replace(/[≥]/g, '>=').replace(/[→]/g, '->').replace(/[↑]/g, '(sobe)');
function wrap(t: string, max: number) {
  const out: string[] = []; let line = '';
  for (const w of t.split(' ')) { if ((line + ' ' + w).trim().length > max) { out.push(line); line = w; } else line = (line + ' ' + w).trim(); }
  if (line) out.push(line); return out;
}

export type PdfLine = { text: string; size?: number; bold?: boolean; color?: [number, number, number]; gap?: number };

export function downloadPdf(name: string, title: string, subtitle: string, lines: PdfLine[]) {
  const W = 595, Hh = 842, M = 50;
  const pages: string[] = []; let ops = ''; let y = 0;
  const header = () => {
    ops = `0.89 0.02 0.07 rg 0 ${Hh - 6} ${W} 6 re f\n0.95 0.57 0 rg ${W * .6} ${Hh - 6} ${W * .25} 6 re f\n1 0.8 0 rg ${W * .85} ${Hh - 6} ${W * .15} 6 re f\n`;
    ops += `BT /F2 20 Tf 0.08 0.1 0.15 rg ${M} ${Hh - 60} Td (${enc(sub(title))}) Tj ET\n`;
    ops += `BT /F1 10 Tf 0.4 0.43 0.5 rg ${M} ${Hh - 78} Td (${enc(sub(subtitle))}) Tj ET\n`;
    ops += `0.85 0.87 0.9 RG 0.5 w ${M} ${Hh - 90} m ${W - M} ${Hh - 90} l S\n`;
    y = Hh - 115;
  };
  const footer = (n: number) => `BT /F1 8 Tf 0.55 0.58 0.65 rg ${M} 30 Td (${enc(`Efacec Nexus · Documento gerado a ${new Date().toLocaleString('pt-PT')} · Confidencial`)}) Tj ET\nBT /F1 8 Tf ${W - M - 40} 30 Td (Pág. ${n}) Tj ET\n`;
  header();
  for (const l of lines) {
    const size = l.size ?? 10.5, lh = size * 1.45;
    for (const part of wrap(sub(l.text), Math.floor((W - 2 * M) / (size * .5)))) {
      if (y < 60) { pages.push(ops + footer(pages.length + 1)); header(); }
      const [r, g, b] = l.color ?? [0.15, 0.17, 0.22];
      ops += `BT /${l.bold ? 'F2' : 'F1'} ${size} Tf ${r} ${g} ${b} rg ${M} ${y} Td (${enc(part)}) Tj ET\n`;
      y -= lh;
    }
    y -= l.gap ?? 2;
  }
  pages.push(ops + footer(pages.length + 1));

  const objs: string[] = [];
  const add = (s: string) => { objs.push(s); return objs.length; };
  add('<< /Type /Catalog /Pages 2 0 R >>'); add('');
  const f1 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  const f2 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const kids: number[] = [];
  for (const p of pages) {
    const c = add(`<< /Length ${p.length} >>\nstream\n${p}endstream`);
    kids.push(add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${Hh}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${c} 0 R >>`));
  }
  objs[1] = `<< /Type /Pages /Kids [${kids.map(k => `${k} 0 R`).join(' ')}] /Count ${kids.length} >>`;
  let pdf = '%PDF-1.4\n'; const off: number[] = [];
  objs.forEach((o, i) => { off.push(pdf.length); pdf += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${off.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('')}trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const bytes = new Uint8Array(pdf.length); for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff;
  save(new Blob([bytes], { type: 'application/pdf' }), `${slug(name)}_${stamp()}.pdf`);
}

export async function copyLink() {
  try { await navigator.clipboard.writeText(location.href); return true; } catch { return false; }
}
