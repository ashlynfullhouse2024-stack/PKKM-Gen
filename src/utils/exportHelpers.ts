/**
 * Export HTML string as a downloadable Word Document (.doc)
 * Word natively understands HTML with mso markup and opens it seamlessly.
 * Supports dynamic Portrait and Landscape page setup with official Kemenag styling.
 */
export function downloadAsWordDoc(
  filename: string, 
  title: string, 
  contentHtml: string, 
  orientation: 'portrait' | 'landscape' = 'portrait'
): void {
  const isLandscape = orientation === 'landscape';

  const wordHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' 
      xmlns:w='urn:schemas-microsoft-com:office:word' 
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
      <w:Compatibility>
        <w:UseFELayout/>
      </w:Compatibility>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: ${isLandscape ? '11.69in 8.27in; mso-page-orientation: landscape;' : '8.27in 11.69in; mso-page-orientation: portrait;'};
      margin: ${isLandscape ? '1.5cm 1.8cm 1.5cm 2.0cm;' : '2.0cm 2.0cm 2.0cm 2.5cm;'};
      mso-header-margin: .5in;
      mso-footer-margin: .5in;
    }
    div.Section1 {
      page: Section1;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: ${isLandscape ? '10pt' : '11pt'};
      line-height: 1.35;
      color: #000000;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }
    h1, h2, h3, h4, p, table, ul, ol {
      margin-top: 0;
      margin-bottom: 4pt;
    }
    p {
      text-align: justify;
      text-justify: inter-ideograph;
      line-height: 1.35;
      margin-bottom: 4pt;
    }
    /* Headings */
    h1 { font-size: 13.5pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-top: 6pt; margin-bottom: 2pt; }
    h2 { font-size: 12pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-top: 5pt; margin-bottom: 2pt; }
    h3 { font-size: 11pt; font-weight: bold; text-align: center; margin-top: 5pt; margin-bottom: 3pt; }
    h4 { font-size: 10.5pt; font-weight: bold; text-align: left; margin-top: 7pt; margin-bottom: 2pt; }

    /* Tables */
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      width: 100%;
      border: 1pt solid #000000;
      margin-top: 6pt;
      margin-bottom: 8pt;
      font-family: 'Times New Roman', Times, serif;
    }
    th, td {
      border: 1pt solid #000000;
      padding: 4pt 5pt;
      font-size: ${isLandscape ? '9pt' : '9.5pt'};
      vertical-align: top;
      mso-line-height-rule: exactly;
      line-height: 1.2;
    }
    th {
      background-color: #f1f5f9;
      font-weight: bold;
      text-align: center;
      vertical-align: middle;
    }
    .text-center { text-align: center !important; }
    .text-right { text-align: right !important; }
    .text-left { text-align: left !important; }
    .font-bold { font-weight: bold; }
    
    /* Garis KOP Double */
    .kop-double-line {
      border-top: 2.25pt solid #000000;
      border-bottom: 0.75pt solid #000000;
      height: 2pt;
      margin: 3pt 0 9pt 0;
      line-height: 1px;
      font-size: 1px;
    }
  </style>
</head>
<body>
  <div class="Section1">
    ${contentHtml}
  </div>
</body>
</html>`;

  const blob = new Blob(['\ufeff', wordHtml], {
    type: 'application/msword;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename.replace(/[/\\?%*:|"<>]/g, '_')}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Intelligent, official Markdown to HTML parser for Indonesian Madrasah / PKKM Documents.
 * Formats:
 * 1. Official Kemenag Letterhead (KOP) with Emblem & Double Border Line
 * 2. High-precision Multi-column Tables with Word MSO support, header repetition, and column alignment
 * 3. Official 2-column or 1-column Signature Blocks with appropriate spacing and alignment
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  const rawLines = markdown.split('\n');
  const result: string[] = [];

  let idx = 0;
  const total = rawLines.length;

  // -------------------------------------------------------------
  // 1. DETECT & RENDER OFFICIAL KOP SURAT AT THE VERY TOP
  // -------------------------------------------------------------
  let kopRendered = false;
  // Check first 12 lines for Kemenag KOP indicators
  const topSlice = rawLines.slice(0, 12).join(' ').toUpperCase();
  if (topSlice.includes('KEMENTERIAN AGAMA') || topSlice.includes('KANTOR KEMENTERIAN AGAMA')) {
    let line1 = 'KEMENTERIAN AGAMA REPUBLIK INDONESIA';
    let line2 = '';
    let line3 = '';
    let addressLine = '';
    let kopEndIdx = -1;

    for (let i = 0; i < Math.min(12, total); i++) {
      const l = rawLines[i].trim().replace(/^[#*_\-\s]+|[#*_\-\s]+$/g, '').trim();
      const u = l.toUpperCase();

      if (u.includes('KEMENTERIAN AGAMA REPUBLIK INDONESIA')) {
        line1 = 'KEMENTERIAN AGAMA REPUBLIK INDONESIA';
      } else if (u.includes('KANTOR KEMENTERIAN AGAMA') || (u.includes('KANTOR KEMENAG') && !line2)) {
        line2 = l.toUpperCase();
      } else if (
        (u.startsWith('MT') || u.startsWith('MA ') || u.startsWith('MI ') || u.includes('MADRASAH')) &&
        !line3
      ) {
        line3 = l.toUpperCase();
      } else if (u.includes('ALAMAT:') || u.includes('JL.') || u.includes('JALAN') || u.includes('NSM:') || u.includes('NPSN:')) {
        if (!addressLine) addressLine = l;
        else addressLine += ' | ' + l;
      }

      if (rawLines[i].trim() === '---' || rawLines[i].trim() === '***') {
        kopEndIdx = i;
        break;
      }
    }

    if (line1 && line3 && kopEndIdx !== -1) {
      kopRendered = true;
      idx = kopEndIdx + 1; // skip past KOP and separator line

      result.push(`
<div class="official-kemenag-kop" style="text-align: center; margin-bottom: 8pt; mso-pagination: widow-orphan;">
  <table border="0" cellspacing="0" cellpadding="0" style="width: 100%; border: none !important; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; margin: 0 0 2pt 0;">
    <tr>
      <td style="width: 13%; border: none !important; vertical-align: middle; text-align: center; padding: 0 6pt 0 0;">
        <div style="width: 50pt; height: 50pt; border: 1.5pt solid #166534; border-radius: 50%; background-color: #166534; color: #fef08a; text-align: center; vertical-align: middle; line-height: 1.1; font-family: Arial, sans-serif; font-size: 8pt; font-weight: bold; padding-top: 10pt; box-sizing: border-box; mso-line-height-rule: exactly;">
          IKHLAS<br>BERAMAL
        </div>
      </td>
      <td style="width: 87%; border: none !important; vertical-align: middle; text-align: center; padding: 0;">
        <div style="font-family: 'Times New Roman', Times, serif; font-size: 13.5pt; font-weight: bold; text-transform: uppercase; line-height: 1.15; letter-spacing: 0.5pt; color: #000; margin: 0; mso-line-height-rule: exactly;">
          ${line1}
        </div>
        ${line2 ? `
        <div style="font-family: 'Times New Roman', Times, serif; font-size: 11.5pt; font-weight: bold; text-transform: uppercase; line-height: 1.15; letter-spacing: 0.5pt; color: #000; margin-top: 1.5pt; mso-line-height-rule: exactly;">
          ${line2}
        </div>` : ''}
        <div style="font-family: 'Times New Roman', Times, serif; font-size: 13.5pt; font-weight: bold; text-transform: uppercase; line-height: 1.15; letter-spacing: 0.5pt; color: #000; margin-top: 1.5pt; mso-line-height-rule: exactly;">
          ${line3}
        </div>
        ${addressLine ? `
        <div style="font-family: 'Times New Roman', Times, serif; font-size: 8.5pt; font-style: italic; line-height: 1.25; color: #111; margin-top: 2.5pt; mso-line-height-rule: exactly;">
          ${addressLine}
        </div>` : ''}
      </td>
    </tr>
  </table>
  <div style="border-top: 2.25pt solid #000000; border-bottom: 0.75pt solid #000000; height: 2pt; margin: 3pt 0 10pt 0; line-height: 1px; font-size: 1px;">&nbsp;</div>
</div>`);
    }
  }

  // -------------------------------------------------------------
  // 2. DETECT SIGNATURE BLOCK AT THE BOTTOM OF THE DOCUMENT
  // -------------------------------------------------------------
  // Scan backwards for the signature block
  let signatureStartIdx = -1;
  for (let i = total - 1; i >= Math.max(idx, total - 25); i--) {
    const l = rawLines[i].trim();
    if (l === '---' || l === '***') {
      // Check if subsequent lines have signature words
      const remainder = rawLines.slice(i + 1).join(' ').toLowerCase();
      if (
        (remainder.includes('kepala') || remainder.includes('mengetahui') || remainder.includes('pengawas') || remainder.includes('bendahara')) &&
        (remainder.includes('nip') || remainder.includes('tanda tangan'))
      ) {
        signatureStartIdx = i;
        break;
      }
    }
  }

  const parseEndIdx = signatureStartIdx !== -1 ? signatureStartIdx : total;

  // -------------------------------------------------------------
  // 3. MAIN BODY LOOP (PARSING TABLES, HEADINGS, PARAGRAPHS)
  // -------------------------------------------------------------
  let inTable = false;
  let tableHeaderParsed = false;
  let tableAlignments: Array<'left' | 'center' | 'right'> = [];
  let tableHeaderCols: string[] = [];
  let tableBodyRows: string[][] = [];

  const flushTable = () => {
    if (!inTable) return;

    let html = `<table border="1" cellspacing="0" cellpadding="4" style="border-collapse: collapse; width: 100%; border: 1pt solid #000000; margin: 8pt 0 10pt 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-family: 'Times New Roman', Times, serif;">`;
    
    // Header
    html += `<thead style="display: table-header-group; mso-yfti-tblheader: yes;">`;
    html += `<tr style="page-break-inside: avoid; mso-yfti-firstrow: yes; mso-yfti-tblheader: yes;">`;
    tableHeaderCols.forEach((col, cIdx) => {
      const align = tableAlignments[cIdx] || (cIdx === 0 ? 'center' : 'left');
      const isNarrowNo = cIdx === 0 && (col.toLowerCase() === 'no' || col.toLowerCase() === 'no.');
      const colWidthStyle = isNarrowNo ? 'width: 4%; text-align: center;' : `text-align: ${align};`;
      html += `<th style="border: 1pt solid #000000; background-color: #f1f5f9; font-weight: bold; vertical-align: middle; padding: 5pt 4pt; font-size: 9pt; mso-line-height-rule: exactly; line-height: 1.15; ${colWidthStyle}">${formatInline(col)}</th>`;
    });
    html += `</tr></thead>`;

    // Body
    html += `<tbody style="mso-yfti-tblbody: yes;">`;
    tableBodyRows.forEach((row, rIdx) => {
      html += `<tr style="page-break-inside: avoid; mso-yfti-irow: ${rIdx};">`;
      row.forEach((cell, cIdx) => {
        let align = tableAlignments[cIdx] || (cIdx === 0 ? 'center' : 'left');
        const cellTrim = cell.trim();
        // Check if cell is a checkmark or pure number or short code
        if (cellTrim === '[✓]' || cellTrim === '[X]' || cellTrim === '✓' || cellTrim === 'X') {
          align = 'center';
        } else if (/^\d+$/.test(cellTrim) && cIdx === 0) {
          align = 'center';
        }
        const isNarrowNo = cIdx === 0 && (tableHeaderCols[0]?.toLowerCase() === 'no' || tableHeaderCols[0]?.toLowerCase() === 'no.');
        const colWidthStyle = isNarrowNo ? 'width: 4%; text-align: center;' : `text-align: ${align};`;
        html += `<td style="border: 1pt solid #000000; padding: 4pt 5pt; font-size: 9pt; vertical-align: top; mso-line-height-rule: exactly; line-height: 1.25; ${colWidthStyle}">${formatInline(cell)}</td>`;
      });
      html += `</tr>`;
    });
    html += `</tbody></table>`;

    result.push(html);

    inTable = false;
    tableHeaderParsed = false;
    tableAlignments = [];
    tableHeaderCols = [];
    tableBodyRows = [];
  };

  while (idx < parseEndIdx) {
    const rawLine = rawLines[idx];
    const line = rawLine.trim();

    // Table row detection
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableHeaderParsed = false;
        tableAlignments = [];
        tableHeaderCols = [];
        tableBodyRows = [];
      }

      // Check if alignment separator row: |:---|:---:|---:|
      if (/^\|[\s\-:]+(\|[\s\-:]+)+\|$/.test(line)) {
        tableHeaderParsed = true;
        const alignCells = line.slice(1, -1).split('|').map((s) => s.trim());
        tableAlignments = alignCells.map((s) => {
          if (s.startsWith(':') && s.endsWith(':')) return 'center';
          if (s.endsWith(':')) return 'right';
          return 'left';
        });
        idx++;
        continue;
      }

      const cells = line.slice(1, -1).split('|').map((c) => c.trim());

      if (!tableHeaderParsed) {
        tableHeaderCols = cells;
      } else {
        tableBodyRows.push(cells);
      }
      idx++;
      continue;
    } else {
      if (inTable) {
        flushTable();
      }
    }

    // Horizontal Rule
    if (line === '---' || line === '***' || line === '___') {
      result.push('<div style="border-top: 1pt solid #334155; margin: 8pt 0 10pt 0;"></div>');
      idx++;
      continue;
    }

    // Headings
    if (line.startsWith('#### ')) {
      result.push(`<h4 style="font-family: 'Times New Roman', Times, serif; font-size: 10.5pt; font-weight: bold; text-align: left; margin: 8pt 0 2pt 0; color: #0f172a;">${formatInline(line.slice(5))}</h4>`);
      idx++;
      continue;
    }
    if (line.startsWith('### ')) {
      result.push(`<h3 style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; font-weight: bold; text-align: center; margin: 6pt 0 3pt 0; color: #0f172a;">${formatInline(line.slice(4))}</h3>`);
      idx++;
      continue;
    }
    if (line.startsWith('## ')) {
      result.push(`<h2 style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; font-weight: bold; text-align: center; text-transform: uppercase; margin: 5pt 0 2pt 0; color: #000000;">${formatInline(line.slice(3))}</h2>`);
      idx++;
      continue;
    }
    if (line.startsWith('# ')) {
      result.push(`<h1 style="font-family: 'Times New Roman', Times, serif; font-size: 13.5pt; font-weight: bold; text-align: center; text-transform: uppercase; margin: 8pt 0 2pt 0; color: #000000;">${formatInline(line.slice(2))}</h1>`);
      idx++;
      continue;
    }

    // Lists
    if (line.startsWith('- ') || line.startsWith('* ')) {
      result.push(`<div style="font-family: 'Times New Roman', Times, serif; font-size: 10pt; line-height: 1.3; margin: 1pt 0 2pt 18pt; text-indent: -12pt;">• &nbsp;${formatInline(line.slice(2))}</div>`);
      idx++;
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+\.)\s*(.*)$/);
      if (match) {
        result.push(`<div style="font-family: 'Times New Roman', Times, serif; font-size: 10pt; line-height: 1.3; margin: 1pt 0 2pt 18pt; text-indent: -16pt;"><span style="display:inline-block; width:16pt;">${match[1]}</span>${formatInline(match[2])}</div>`);
        idx++;
        continue;
      }
    }

    // Empty line
    if (!line) {
      result.push('<div style="height: 4pt;"></div>');
      idx++;
      continue;
    }

    // Standard Paragraph
    result.push(`<p style="font-family: 'Times New Roman', Times, serif; font-size: 10.5pt; line-height: 1.35; margin: 0 0 4pt 0; text-align: justify; text-justify: inter-ideograph;">${formatInline(line)}</p>`);
    idx++;
  }

  if (inTable) {
    flushTable();
  }

  // -------------------------------------------------------------
  // 4. PARSE & RENDER OFFICIAL SIGNATURE BLOCK
  // -------------------------------------------------------------
  if (signatureStartIdx !== -1) {
    const sigLines = rawLines
      .slice(signatureStartIdx + 1)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && l !== '---');

    const sigHtml = renderOfficialSignatureTable(sigLines);
    result.push(sigHtml);
  }

  return result.join('\n');
}

/**
 * Intelligent Signature Formatter
 * Detects whether there are dual signatories (e.g. Pengawas & Kepala, or Bendahara & Kepala)
 * or a single signatory (Kepala Madrasah), and builds a 100% Word/Print compliant table.
 */
function renderOfficialSignatureTable(lines: string[]): string {
  if (lines.length === 0) return '';

  let dateLine = '';
  // Check if first line is date: e.g. "Jombang, 21 Nopember 2026"
  if (/^[A-Za-z\s]+,\s*\d+\s+[A-Za-z]+\s+\d{4}/i.test(lines[0]) || lines[0].includes('2025') || lines[0].includes('2026')) {
    dateLine = lines[0];
    lines = lines.slice(1);
  }

  // Split into left and right signatory blocks
  const lowerAll = lines.join(' ').toLowerCase();
  const isDual =
    (lowerAll.includes('pengawas') || lowerAll.includes('bendahara') || lowerAll.includes('komite') || lowerAll.includes('supervisor')) &&
    lowerAll.includes('kepala');

  if (isDual) {
    // Find where the second signatory starts
    let splitIdx = -1;
    for (let i = 1; i < lines.length; i++) {
      const l = lines[i].toLowerCase();
      if (l.includes('kepala madrasah') || l.includes('mengetahui dan mengesahkan')) {
        splitIdx = i;
        break;
      }
    }

    const leftLines = splitIdx !== -1 ? lines.slice(0, splitIdx) : lines.slice(0, Math.ceil(lines.length / 2));
    const rightLines = splitIdx !== -1 ? lines.slice(splitIdx) : lines.slice(Math.ceil(lines.length / 2));

    const leftObj = extractSignatoryParts(leftLines);
    const rightObj = extractSignatoryParts(rightLines);

    return `
<table border="0" cellspacing="0" cellpadding="0" style="width: 100%; border: none !important; margin-top: 18pt; margin-bottom: 12pt; border-collapse: collapse; page-break-inside: avoid; mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-family: 'Times New Roman', Times, serif;">
  <tr>
    <td style="width: 50%; border: none !important; text-align: center; vertical-align: top; padding: 0 10pt;">
      <div style="font-size: 10.5pt; color: #000; line-height: 1.25; mso-line-height-rule: exactly;">${leftObj.topHeader || 'Mengetahui / Memverifikasi:'}</div>
      <div style="font-size: 10.5pt; font-weight: bold; color: #000; line-height: 1.25; mso-line-height-rule: exactly;">${leftObj.roleTitle}</div>
      <div style="font-size: 8.5pt; font-style: italic; color: #555; margin-top: 2pt;">(tanda tangan & stempel)</div>
      <div style="height: 48pt; line-height: 48pt; font-size: 1pt;">&nbsp;</div>
      <div style="font-size: 11pt; font-weight: bold; text-decoration: underline; color: #000; line-height: 1.2; mso-line-height-rule: exactly;">${leftObj.name}</div>
      ${leftObj.nip ? `<div style="font-size: 9.5pt; color: #000; line-height: 1.2; mso-line-height-rule: exactly;">${leftObj.nip}</div>` : ''}
      ${leftObj.extra ? `<div style="font-size: 9pt; color: #333; line-height: 1.2;">${leftObj.extra}</div>` : ''}
    </td>
    <td style="width: 50%; border: none !important; text-align: center; vertical-align: top; padding: 0 10pt;">
      <div style="font-size: 10.5pt; color: #000; line-height: 1.25; margin-bottom: 1.5pt; mso-line-height-rule: exactly;">${dateLine || 'Disahkan pada tanggal bersangkutan'}</div>
      <div style="font-size: 10.5pt; font-weight: bold; color: #000; line-height: 1.25; mso-line-height-rule: exactly;">${rightObj.roleTitle || 'Kepala Madrasah,'}</div>
      <div style="font-size: 8.5pt; font-style: italic; color: #555; margin-top: 2pt;">(tanda tangan & stempel resmi)</div>
      <div style="height: 48pt; line-height: 48pt; font-size: 1pt;">&nbsp;</div>
      <div style="font-size: 11pt; font-weight: bold; text-decoration: underline; color: #000; line-height: 1.2; mso-line-height-rule: exactly;">${rightObj.name}</div>
      ${rightObj.nip ? `<div style="font-size: 9.5pt; color: #000; line-height: 1.2; mso-line-height-rule: exactly;">${rightObj.nip}</div>` : ''}
      ${rightObj.extra ? `<div style="font-size: 9pt; color: #333; line-height: 1.2;">${rightObj.extra}</div>` : ''}
    </td>
  </tr>
</table>`;
  } else {
    // Single Signatory (Kepala Madrasah)
    const rightObj = extractSignatoryParts(lines);

    return `
<table border="0" cellspacing="0" cellpadding="0" style="width: 100%; border: none !important; margin-top: 18pt; margin-bottom: 12pt; border-collapse: collapse; page-break-inside: avoid; mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-family: 'Times New Roman', Times, serif;">
  <tr>
    <td style="width: 55%; border: none !important;">&nbsp;</td>
    <td style="width: 45%; border: none !important; text-align: center; vertical-align: top; padding: 0;">
      <div style="font-size: 10.5pt; color: #000; line-height: 1.25; margin-bottom: 1.5pt; mso-line-height-rule: exactly;">${dateLine || 'Disahkan pada tanggal bersangkutan'}</div>
      <div style="font-size: 10.5pt; font-weight: bold; color: #000; line-height: 1.25; mso-line-height-rule: exactly;">${rightObj.roleTitle || 'Kepala Madrasah,'}</div>
      <div style="font-size: 8.5pt; font-style: italic; color: #555; margin-top: 2pt;">(tanda tangan & stempel resmi)</div>
      <div style="height: 48pt; line-height: 48pt; font-size: 1pt;">&nbsp;</div>
      <div style="font-size: 11pt; font-weight: bold; text-decoration: underline; color: #000; line-height: 1.2; mso-line-height-rule: exactly;">${rightObj.name}</div>
      ${rightObj.nip ? `<div style="font-size: 9.5pt; color: #000; line-height: 1.2; mso-line-height-rule: exactly;">${rightObj.nip}</div>` : ''}
      ${rightObj.extra ? `<div style="font-size: 9pt; color: #333; line-height: 1.2;">${rightObj.extra}</div>` : ''}
    </td>
  </tr>
</table>`;
  }
}

interface SignatoryParts {
  topHeader: string;
  roleTitle: string;
  name: string;
  nip: string;
  extra: string;
}

function extractSignatoryParts(lines: string[]): SignatoryParts {
  let topHeader = '';
  let roleTitle = '';
  let name = '';
  let nip = '';
  let extra = '';

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].replace(/[#*_]/g, '').trim();
    if (!raw) continue;

    if (raw.toLowerCase().startsWith('mengetahui') || raw.toLowerCase().startsWith('disahkan')) {
      topHeader = raw;
    } else if (
      raw.toLowerCase().includes('kepala') ||
      raw.toLowerCase().includes('pengawas') ||
      raw.toLowerCase().includes('bendahara') ||
      raw.toLowerCase().includes('komite') ||
      raw.toLowerCase().includes('supervisor')
    ) {
      if (!roleTitle) roleTitle = raw;
    } else if (raw.toLowerCase().startsWith('nip') || raw.toLowerCase().startsWith('nuptk')) {
      nip = raw;
    } else if (raw.toLowerCase().includes('tanda tangan') || raw.toLowerCase().includes('stempel')) {
      // note line, ignore
    } else if (raw.toLowerCase().startsWith('pangkat') || raw.toLowerCase().includes('golongan') || raw.toLowerCase().includes('pembina')) {
      extra = raw;
    } else {
      if (!name) {
        name = raw;
      } else if (!extra) {
        extra = raw;
      }
    }
  }

  return {
    topHeader,
    roleTitle: roleTitle || 'Pejabat Penanggung Jawab,',
    name: name || 'Drs. H. Fulan, M.Pd.',
    nip,
    extra,
  };
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background-color:#f1f5f9; padding:1pt 3pt; font-size:9pt; font-family:monospace;">$1</code>');
}
