/**
 * Export HTML string as a downloadable Word Document (.doc)
 * Word natively understands HTML with mso markup and opens it seamlessly.
 * Supports dynamic Portrait and Landscape page setup.
 */
export function downloadAsWordDoc(
  filename: string, 
  title: string, 
  contentHtml: string, 
  orientation: 'portrait' | 'landscape' = 'portrait'
): void {
  const isLandscape = orientation === 'landscape';

  const header = `<!DOCTYPE html>
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
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: ${isLandscape ? '11.0in 8.5in; mso-page-orientation: landscape;' : '8.5in 11.0in; mso-page-orientation: portrait;'};
      margin: ${isLandscape ? '1.5cm 2.0cm 1.5cm 2.0cm;' : '2.54cm 2.54cm 2.54cm 2.54cm;'};
      mso-header-margin: .5in;
      mso-footer-margin: .5in;
    }
    div.Section1 {
      page: Section1;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: ${isLandscape ? '10.5pt' : '12pt'};
      line-height: 1.45;
      color: #000;
    }
    h1 { font-size: ${isLandscape ? '14pt' : '16pt'}; font-weight: bold; text-align: center; margin-bottom: 2pt; text-transform: uppercase; }
    h2 { font-size: ${isLandscape ? '12.5pt' : '14pt'}; font-weight: bold; text-align: center; margin-bottom: 2pt; text-transform: uppercase; }
    h3 { font-size: ${isLandscape ? '11.5pt' : '13pt'}; font-weight: bold; text-align: center; margin-bottom: 5pt; }
    h4 { font-size: 11pt; font-weight: bold; margin-top: 8pt; margin-bottom: 3pt; }
    p { margin-bottom: 5pt; text-align: justify; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6pt;
      margin-bottom: 10pt;
    }
    th, td {
      border: 1pt solid #000;
      padding: ${isLandscape ? '4pt 5pt' : '5pt 6pt'};
      font-size: ${isLandscape ? '9.5pt' : '10.5pt'};
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
      font-weight: bold;
      text-align: center;
    }
    hr {
      border: 0;
      border-top: 2pt solid #000;
      border-bottom: 0.5pt solid #000;
      height: 4pt;
      margin: 6pt 0 12pt 0;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
  </style>
</head>
<body>
  <div class="Section1">
    ${contentHtml}
  </div>
</body>
</html>`;

  const blob = new Blob(['\ufeff', header], {
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
 * Simple, safe markdown to HTML parser for official documents
 * Supports headers (#, ##, ###, ####), bold, italic, tables, lists, hr, and paragraphs
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  const lines = markdown.split('\n');
  const result: string[] = [];
  let inTable = false;
  let tableHeaderParsed = false;
  let tableRows: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Check if table line
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableHeaderParsed = false;
        tableRows = [];
      }

      // Check if separator line (|:---|:---| or |--|--|)
      if (/^\|[\s\-:]+(\|[\s\-:]+)+\|$/.test(line)) {
        tableHeaderParsed = true;
        continue;
      }

      const cells = line
        .slice(1, -1)
        .split('|')
        .map((cell) => cell.trim());

      if (!tableHeaderParsed) {
        tableRows.push(
          '<tr>' +
            cells.map((c) => `<th>${formatInline(c)}</th>`).join('') +
            '</tr>'
        );
      } else {
        tableRows.push(
          '<tr>' +
            cells.map((c) => `<td>${formatInline(c)}</td>`).join('') +
            '</tr>'
        );
      }
      continue;
    } else {
      if (inTable) {
        result.push(
          `<table class="border-collapse border border-slate-700 w-full my-4 text-sm">${tableRows.join('')}</table>`
        );
        inTable = false;
        tableHeaderParsed = false;
        tableRows = [];
      }
    }

    // Horizontal rule
    if (line === '---' || line === '***' || line === '___') {
      result.push('<hr class="my-4 border-t-2 border-slate-800" />');
      continue;
    }

    // Headers
    if (line.startsWith('#### ')) {
      result.push(`<h4 class="font-bold text-base mt-4 mb-1">${formatInline(line.slice(5))}</h4>`);
      continue;
    }
    if (line.startsWith('### ')) {
      result.push(`<h3 class="font-bold text-lg text-center mt-4 mb-2">${formatInline(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      result.push(`<h2 class="font-bold text-xl text-center mt-3 mb-1 uppercase tracking-wide">${formatInline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      result.push(`<h1 class="font-bold text-2xl text-center mb-1 uppercase tracking-wide">${formatInline(line.slice(2))}</h1>`);
      continue;
    }

    // Lists
    if (line.startsWith('- ') || line.startsWith('* ')) {
      result.push(`<li class="ml-6 list-disc mb-1">${formatInline(line.slice(2))}</li>`);
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      const content = line.replace(/^\d+\.\s/, '');
      result.push(`<li class="ml-6 list-decimal mb-1">${formatInline(content)}</li>`);
      continue;
    }

    // Empty line
    if (!line) {
      result.push('<div class="h-2"></div>');
      continue;
    }

    // Paragraph
    result.push(`<p class="mb-2 leading-relaxed text-justify">${formatInline(line)}</p>`);
  }

  if (inTable) {
    result.push(
      `<table class="border-collapse border border-slate-700 w-full my-4 text-sm">${tableRows.join('')}</table>`
    );
  }

  return result.join('\n');
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-slate-100 px-1 rounded">$1</code>');
}
