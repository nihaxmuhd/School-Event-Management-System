import { House, EventResultRecord, HouseId, PointSettings } from '../types/festival';

export const DEFAULT_POINT_SETTINGS: PointSettings = {
  first: 10,
  second: 7,
  third: 5,
  participation: 2,
  gradeA: 5,
  gradeB: 3,
  gradeC: 1
};

export const calculateGrade = (marks: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
  if (marks >= 85) return 'A';
  if (marks >= 70) return 'B';
  if (marks >= 55) return 'C';
  if (marks >= 40) return 'D';
  return 'F';
};

export const calculatePositionAndPoints = (
  marks: number,
  rank: number,
  pointSettings: PointSettings = DEFAULT_POINT_SETTINGS
): { position: 1 | 2 | 3 | 0; housePoints: number; grade: 'A' | 'B' | 'C' | 'D' | 'F' } => {
  const grade = calculateGrade(marks);
  let gradePoints = 0;
  if (grade === 'A') gradePoints = pointSettings.gradeA;
  else if (grade === 'B') gradePoints = pointSettings.gradeB;
  else if (grade === 'C') gradePoints = pointSettings.gradeC;

  let pos: 1 | 2 | 3 | 0 = 0;
  let placePoints = pointSettings.participation;

  if (rank === 1) {
    pos = 1;
    placePoints = pointSettings.first;
  } else if (rank === 2) {
    pos = 2;
    placePoints = pointSettings.second;
  } else if (rank === 3) {
    pos = 3;
    placePoints = pointSettings.third;
  }

  return {
    position: pos,
    grade,
    housePoints: placePoints + gradePoints
  };
};

export const recalculateHousePoints = (
  baseHouses: House[],
  results: EventResultRecord[]
): House[] => {
  const houseMap: Record<HouseId, House> = baseHouses.reduce((acc, h) => {
    acc[h.id] = { ...h, points: 0, gold: 0, silver: 0, bronze: 0 };
    return acc;
  }, {} as Record<HouseId, House>);

  results.forEach(res => {
    if (!res.isPublished) return;
    res.scores.forEach(score => {
      const h = houseMap[score.houseId];
      if (h) {
        if (score.position === 1) h.gold += 1;
        else if (score.position === 2) h.silver += 1;
        else if (score.position === 3) h.bronze += 1;

        h.points += score.housePoints || 0;
      }
    });
  });

  return Object.values(houseMap).sort((a, b) => b.points - a.points);
};

export const downloadCSV = (filename: string, rows: (string | number)[][]) => {
  const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export as Excel-compatible .xls (HTML table format opens natively in Excel)
export const downloadExcel = (filename: string, title: string, rows: (string | number)[][]) => {
  const [header, ...body] = rows;
  const headerHtml = header.map(c => `<th style="background:#059669;color:#fff;border:1px solid #cbd5e1;padding:6px 10px;text-align:left;font-family:sans-serif;">${c}</th>`).join('');
  const bodyHtml = body.map(r =>
    `<tr>${r.map(c => `<td style="border:1px solid #e2e8f0;padding:6px 10px;font-family:sans-serif;">${String(c)}</td>`).join('')}</tr>`
  ).join('');
  const html = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body>
    <h3 style="font-family:sans-serif;">${title}</h3>
    <table>${`<tr>${headerHtml}</tr>`}${bodyHtml}</table></body></html>`;
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.xls') ? filename : `${filename}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export as PDF via a styled print window
export const downloadPDF = (title: string, subtitle: string, rows: (string | number)[][]) => {
  const [header, ...body] = rows;
  const headerHtml = header.map(c => `<th>${c}</th>`).join('');
  const bodyHtml = body.map(r => `<tr>${r.map(c => `<td>${String(c)}</td>`).join('')}</tr>`).join('');
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`<!doctype html><html><head><title>${title}</title>
    <style>
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #0f172a; padding: 32px; }
      h1 { font-size: 20px; margin: 0 0 2px; letter-spacing: -0.02em; }
      p.sub { color: #64748b; font-size: 12px; margin: 0 0 20px; }
      table { width: 100%; border-collapse: collapse; font-size: 11px; }
      th { background: #059669; color: #fff; text-align: left; padding: 8px 10px; font-weight: 700; text-transform: uppercase; font-size: 9px; letter-spacing: 0.05em; }
      td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; }
      tr:nth-child(even) td { background: #f8fafc; }
      .footer { margin-top: 24px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
    </style></head><body>
    <h1>${title}</h1><p class="sub">${subtitle}</p>
    <table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>
    <div class="footer">Generated by Hidaya School SEMS • ${new Date().toLocaleString()}</div>
    <script>window.onload = () => { window.print(); }</script>
    </body></html>`);
  win.document.close();
};

// Parse pasted / uploaded CSV text into rows of cells
export const parseCSV = (text: string): string[][] => {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim().length > 0);
  return lines.map(line => {
    const cells: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        cells.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    cells.push(cur.trim());
    return cells;
  });
};

export const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Junior Boys':
      return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
    case 'Junior Girls':
      return { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' };
    case 'Senior Boys':
      return { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' };
    case 'Senior Girls':
      return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' };
    case 'HSS Boys':
      return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' };
    case 'HSS Girls':
      return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
  }
};
