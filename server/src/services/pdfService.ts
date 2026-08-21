import puppeteer from 'puppeteer';
import { IProposalBranding, IProposalMeta } from '../models/ProposalTemplate';

export interface ProposalDocInput {
  title: string;
  contentHtml: string;
  branding: IProposalBranding;
  meta?: IProposalMeta;
}

const escapeHtml = (value: string): string =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const todayFormatted = (): string =>
  new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

/**
 * Builds the Puppeteer header template. Puppeteer header/footer templates only support
 * inline styles (no external stylesheets or classes from the body <style> block), so
 * everything here is styled inline.
 */
const buildHeaderTemplate = (branding: IProposalBranding, meta: IProposalMeta, title: string): string => {
  const gradientFrom = branding.headerGradientFrom || '#0f2a3d';
  const gradientTo = branding.headerGradientTo || '#1f9d63';
  const companyName = escapeHtml(branding.companyName || 'Speshway Solutions');
  const tagline = escapeHtml(branding.companyTagline || 'Website & App Development Company | Hyderabad, India');
  const logoUrl = branding.logoUrl || '';
  const docRef = escapeHtml(meta.docRef || '');
  const date = escapeHtml(todayFormatted());

  return `
  <div style="width:100%;font-family:'Segoe UI',Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
    <div style="width:100%;background:linear-gradient(90deg, ${gradientFrom}, ${gradientTo});padding:14px 28px;display:flex;align-items:center;justify-content:space-between;gap:12px;box-sizing:border-box;">
      <div style="display:flex;align-items:center;gap:10px;min-width:0;overflow:hidden;">
        <div style="width:34px;height:34px;border-radius:8px;background:#ffffff;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;">
          ${logoUrl ? `<img src="${logoUrl}" style="max-width:100%;max-height:100%;object-fit:contain;" />` : `<span style="font-weight:700;font-size:14px;color:${gradientFrom};">S</span>`}
        </div>
        <div style="min-width:0;overflow:hidden;">
          <div style="font-weight:700;font-size:12px;color:#ffffff;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${companyName.toUpperCase()}</div>
          <div style="font-size:8px;color:#e2e8f0;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${tagline}</div>
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0;">
        <div style="font-weight:700;font-size:11px;color:#ffffff;white-space:nowrap;">COMMERCIAL QUOTATION</div>
        ${docRef ? `<div style="font-size:8px;color:#e2e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px;">Ref: ${docRef}</div>` : ''}
        <div style="font-size:8px;color:#e2e8f0;white-space:nowrap;">Date: ${date}</div>
      </div>
    </div>
  </div>`;
};

const buildFooterTemplate = (branding: IProposalBranding): string => {
  const gradientFrom = branding.headerGradientFrom || '#0f2a3d';
  const gradientTo = branding.headerGradientTo || '#1f9d63';
  const companyName = escapeHtml(branding.companyName || 'Speshway Solutions');
  const addr1 = escapeHtml(branding.footerAddress || '');
  const addr2 = escapeHtml(branding.footerAddressLine2 || '');
  const email = escapeHtml(branding.contactEmail || '');
  const phone = escapeHtml(branding.contactPhone || '');
  const website = escapeHtml(branding.website || '');

  return `
  <div style="width:100%;font-family:'Segoe UI',Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
    <div style="width:100%;height:2px;background:linear-gradient(90deg, ${gradientFrom}, ${gradientTo});"></div>
    <div style="width:100%;background:#0f1f2e;padding:8px 28px;display:flex;align-items:flex-start;justify-content:space-between;box-sizing:border-box;color:#ffffff;">
      <div style="max-width:60%;overflow-wrap:break-word;">
        <div style="font-weight:700;font-size:9px;color:#ffffff;overflow-wrap:break-word;">${companyName}</div>
        <div style="font-size:7px;color:#cbd5e1;line-height:1.4;overflow-wrap:break-word;">${addr1}${addr1 && addr2 ? '<br/>' : ''}${addr2}</div>
      </div>
      <div style="text-align:right;max-width:40%;overflow-wrap:break-word;">
        <div style="font-weight:700;font-size:9px;color:#ffffff;">Contact</div>
        <div style="font-size:7px;color:#cbd5e1;overflow-wrap:break-word;">${email}${email && phone ? ' | ' : ''}${phone}</div>
        <div style="font-size:7px;color:#cbd5e1;overflow-wrap:break-word;">${website}</div>
        <div style="font-size:7px;color:#94a3b8;margin-top:2px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
      </div>
    </div>
  </div>`;
};

const buildSignatureBlock = (branding: IProposalBranding, meta: IProposalMeta): string => {
  const companyName = escapeHtml(branding.companyName || 'Speshway Solutions');
  const clientName = escapeHtml(meta.preparedFor || 'Client');
  return `
  <div class="signature-block">
    <div class="signature-col">
      <div class="signature-line"></div>
      <p class="signature-label">For ${companyName}</p>
      <p class="signature-sub">Authorized Signatory</p>
    </div>
    <div class="signature-col">
      <div class="signature-line"></div>
      <p class="signature-label">For ${clientName} (Client)</p>
      <p class="signature-sub">Authorized Signatory</p>
    </div>
  </div>`;
};

const buildMetaGrid = (branding: IProposalBranding, meta: IProposalMeta): string => {
  const companyName = escapeHtml(branding.companyName || 'Speshway Solutions');
  const cells: Array<[string, string]> = [
    ['Quotation Date', escapeHtml(todayFormatted())],
    ['Prepared For', escapeHtml(meta.preparedFor || '-')],
    ['Prepared By', companyName],
    ['Validity', escapeHtml(meta.validityText || '30 Days from Date of Issue')],
    ['Project Type', escapeHtml(meta.projectType || '-')],
    ['Currency', escapeHtml(meta.currency || 'Indian Rupees (INR)')],
  ];
  return `
  <div class="meta-grid">
    ${cells
      .map(
        ([label, value]) => `
      <div class="meta-cell"><span class="meta-label">${label}</span><span class="meta-value">${value}</span></div>`
      )
      .join('')}
  </div>`;
};

/**
 * Builds the full body-only HTML document rendered inside the page content area.
 * The repeating header/footer bands are rendered separately by Puppeteer's
 * displayHeaderFooter templates, not inside this document.
 */
export const buildProposalHtmlDocument = ({ title, contentHtml, branding, meta }: ProposalDocInput): string => {
  const safeMeta: IProposalMeta = meta || {};
  const gradientFrom = branding?.headerGradientFrom || '#0f2a3d';
  const gradientTo = branding?.headerGradientTo || '#1f9d63';

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    margin: 0;
    color: #1a1a1a;
    background: #ffffff;
    font-size: 11px;
  }
  .content { padding: 8px 40px 24px; line-height: 1.55; }
  .doc-eyebrow { font-size: 9px; font-weight: 800; letter-spacing: 0.08em; color: ${gradientTo}; text-transform: uppercase; margin: 4px 0 4px; }
  .doc-title { font-size: 22px; font-weight: 800; margin: 0 0 6px; color: #0f2a3d; word-wrap: break-word; overflow-wrap: break-word; }
  .doc-subtitle { font-size: 11px; color: #6b7280; margin: 0 0 16px; max-width: 640px; }

  .meta-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px 20px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 14px 18px;
    margin-bottom: 20px;
  }
  .meta-cell { display: flex; flex-direction: column; gap: 2px; font-size: 10.5px; }
  .meta-label { font-weight: 700; color: #94a3b8; font-size: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
  .meta-value { color: #0f2a3d; font-weight: 700; }

  .section-bar {
    background: linear-gradient(90deg, ${gradientFrom}, ${gradientTo});
    color: #ffffff;
    font-weight: 700;
    font-size: 12px;
    padding: 9px 16px;
    border-radius: 8px;
    margin: 20px 0 10px;
  }
  .content p { margin: 6px 0; }
  .content ul { padding-left: 20px; margin: 6px 0; }
  .content li { margin-bottom: 4px; }

  .roles-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin: 8px 0;
  }
  .role-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-left: 3px solid ${gradientTo};
    border-radius: 8px;
    padding: 12px;
  }
  .role-card h4 { margin: 0 0 4px; font-size: 11px; color: ${gradientFrom}; }
  .role-card p { margin: 0; font-size: 9.5px; color: #374151; }

  .feature-table, .comparison-table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0;
    font-size: 10px;
  }
  .feature-table th, .comparison-table th {
    background: linear-gradient(90deg, ${gradientFrom}, ${gradientTo});
    color: #ffffff;
    text-align: left;
    padding: 7px 10px;
  }
  .feature-table td, .comparison-table td {
    padding: 6px 10px;
    border-bottom: 1px solid #eee;
    vertical-align: top;
  }
  .feature-table tr:nth-child(even) td, .comparison-table tr:nth-child(even) td { background: #f8fafc; }
  .feature-table td:first-child, .comparison-table td:first-child { font-weight: 700; }
  .comparison-table td.total-row, .comparison-table tr.total-row td { font-weight: 800; background: #eafbf3; }

  .plans-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
    margin: 10px 0;
  }
  .plan-card {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
  }
  .plan-card.recommended { border: 2px solid ${gradientTo}; }
  .plan-card .plan-header {
    background: linear-gradient(90deg, ${gradientFrom}, ${gradientTo});
    color: #ffffff;
    padding: 12px 14px;
  }
  .plan-card .plan-header .plan-name { font-weight: 700; font-size: 12px; }
  .plan-card .plan-header .plan-price { font-weight: 800; font-size: 18px; margin-top: 2px; }
  .plan-card .plan-body { padding: 12px 14px; background: #ffffff; }
  .plan-card .plan-body ul { padding-left: 18px; margin: 0; font-size: 9.5px; }
  .plan-card.recommended .badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background: #ffffff;
    color: ${gradientFrom};
    font-size: 8px;
    font-weight: 800;
    padding: 3px 8px;
    border-radius: 999px;
    letter-spacing: 0.05em;
  }

  .info-box {
    background: #fdf1ee;
    border: 1px solid #f6d9d1;
    border-radius: 10px;
    padding: 12px 16px;
    margin: 8px 0;
    font-size: 9.5px;
    color: #374151;
  }
  .highlight-box {
    background: #eafbf3;
    border: 1px solid #bfe9d4;
    border-radius: 10px;
    padding: 12px 16px;
    margin: 8px 0;
    font-size: 9.5px;
    color: #0f2a3d;
  }

  .signature-block {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-top: 40px;
  }
  .signature-line { border-bottom: 1px solid #9ca3af; height: 32px; }
  .signature-label { font-weight: 700; font-size: 10.5px; margin: 6px 0 0; }
  .signature-sub { font-size: 9px; color: #6b7280; margin: 2px 0 0; }
</style>
</head>
<body>
  <div class="content">
    <div class="doc-eyebrow">Commercial Quotation</div>
    <div class="doc-title">${escapeHtml(title)}</div>
    <div class="doc-subtitle">Project Cost Estimation &amp; Feature Scope Document</div>
    ${buildMetaGrid(branding || {}, safeMeta)}
    ${contentHtml}
    ${buildSignatureBlock(branding || {}, safeMeta)}
  </div>
</body>
</html>`;
};

export interface InvoicePdfInput {
  invoice: any;
  client?: { companyName?: string; billingEmail?: string; phone?: string };
  projectName?: string;
}

const buildInvoiceHtmlDocument = ({ invoice, client, projectName }: InvoicePdfInput): string => {
  // Brand palette shared with the proposal PDFs (navy → green) instead of a
  // one-off accent color, so every document generated by the app looks like
  // it belongs to the same product.
  const navy = '#0f2a3d';
  const green = '#1f9d63';
  const fromName = invoice.fromName || 'Build Your Thoughts';
  const fromEmail = invoice.fromEmail || '';
  const fromPhone = invoice.fromPhone || '';
  const billToName = invoice.billToName || client?.companyName || '';
  const billToEmail = invoice.billToEmail || client?.billingEmail || '';
  const billToPhone = invoice.billToPhone || client?.phone || '';
  const initial = escapeHtml((fromName || 'B').charAt(0).toUpperCase());
  const totalTax = (invoice.cgst || 0) + (invoice.sgst || 0) + (invoice.igst || 0);

  const rows = (invoice.lineItems || [])
    .map((li: any) => {
      const lineAmount = Number(li.amount || (li.quantity ?? 1) * (li.price || 0));
      const taxPercent = li.taxPercent ?? (invoice.subtotal > 0 ? (totalTax / invoice.subtotal) * 100 : 0);
      return `
      <tr>
        <td>${escapeHtml(li.description || '')}</td>
        <td class="num">${taxPercent.toFixed(2)}%</td>
        <td class="num strong">₹${lineAmount.toLocaleString('en-IN')}</td>
      </tr>`;
    })
    .join('');

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(invoice.invoiceNumber)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; color: #1f2937; background: #fff; font-size: 12px; }
  .content { padding: 36px 44px; }

  .header { display: flex; align-items: flex-start; justify-content: space-between; padding-bottom: 18px; border-bottom: 2px solid ${navy}; }
  .brand { display: flex; align-items: center; gap: 10px; }
  .brand .logo { width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, ${navy}, ${green}); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; }
  .brand .name { font-weight: 700; font-size: 13.5px; color: ${navy}; }
  .header .title { font-size: 24px; font-weight: 800; letter-spacing: 0.06em; color: ${navy}; text-align: right; }
  .header .title .num { display: block; font-size: 10px; font-weight: 700; letter-spacing: 0; color: ${green}; margin-top: 2px; }

  .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin: 22px 0; }
  .info-block .label { font-size: 8.5px; font-weight: 800; color: ${green}; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 5px; }
  .info-block .name { font-weight: 700; font-size: 12px; color: #111827; }
  .info-block .sub { color: #6b7280; font-size: 10.5px; margin-top: 1px; }

  .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; font-size: 10px; }
  .meta-box .row { display: flex; justify-content: space-between; padding: 2px 0; }
  .meta-box .row + .row { border-top: 1px dashed #e2e8f0; }
  .meta-box .k { color: #94a3b8; font-weight: 600; }
  .meta-box .v { font-weight: 700; color: ${navy}; }

  .project-bar { background: #eafbf3; border-left: 3px solid ${green}; color: ${navy}; padding: 9px 14px; font-weight: 700; font-size: 11px; border-radius: 0 8px 8px 0; margin: 4px 0 18px; }

  table { width: 100%; border-collapse: collapse; margin: 4px 0; font-size: 10.5px; }
  th { background: ${navy}; color: #fff; text-align: left; padding: 9px 10px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.04em; }
  th.num, td.num { text-align: right; }
  td { padding: 9px 10px; border-bottom: 1px solid #f1f5f9; color: #374151; }
  td.strong { font-weight: 700; color: #111827; }
  tbody tr:nth-child(even) { background: #fafbfc; }

  .totals-wrap { display: flex; justify-content: flex-end; }
  .totals { margin-top: 12px; width: 260px; font-size: 11px; }
  .totals .row { display: flex; justify-content: space-between; padding: 5px 2px; color: #6b7280; }
  .totals .total-bar { background: ${navy}; color: #fff; font-weight: 800; padding: 10px 14px; border-radius: 8px; display: flex; justify-content: space-between; margin-top: 8px; font-size: 13.5px; }

  .notes { margin-top: 28px; font-size: 10.5px; background: #f8fafc; border-radius: 10px; padding: 12px 14px; }
  .notes .label { font-weight: 800; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 3px; }
  .footer { margin-top: 44px; padding-top: 14px; border-top: 1px solid #eee; text-align: center; color: #9ca3af; font-size: 9px; }
</style>
</head>
<body>
  <div class="content">
    <div class="header">
      <div class="brand">
        <div class="logo">${initial}</div>
        <div class="name">${escapeHtml(fromName)}</div>
      </div>
      <div class="title">INVOICE<span class="num">${escapeHtml(invoice.invoiceNumber)}</span></div>
    </div>

    <div class="info-grid">
      <div class="info-block">
        <div class="label">From</div>
        <div class="name">${escapeHtml(fromName)}</div>
        ${fromEmail ? `<div class="sub">${escapeHtml(fromEmail)}</div>` : ''}
        ${fromPhone ? `<div class="sub">${escapeHtml(fromPhone)}</div>` : ''}
      </div>
      <div class="info-block">
        <div class="label">Bill To</div>
        <div class="name">${escapeHtml(billToName)}</div>
        ${billToEmail ? `<div class="sub">${escapeHtml(billToEmail)}</div>` : ''}
        ${billToPhone ? `<div class="sub">${escapeHtml(billToPhone)}</div>` : ''}
      </div>
      <div class="meta-box">
        <div class="row"><span class="k">Issue Date</span><span class="v">${new Date(invoice.issueDate || invoice.createdAt).toLocaleDateString('en-GB')}</span></div>
        <div class="row"><span class="k">Due Date</span><span class="v">${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-GB') : '-'}</span></div>
        <div class="row"><span class="k">Status</span><span class="v">${invoice.status === 'paid' ? 'Paid' : 'Unpaid'}</span></div>
      </div>
    </div>

    ${projectName ? `<div class="project-bar">Project: ${escapeHtml(projectName)}</div>` : ''}

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="num">Tax %</th>
          <th class="num">Amount</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="totals-wrap">
      <div class="totals">
        <div class="row"><span>Subtotal</span><span>₹${Number(invoice.subtotal || 0).toLocaleString('en-IN')}</span></div>
        <div class="row"><span>Tax</span><span>₹${Number(totalTax).toLocaleString('en-IN')}</span></div>
        <div class="total-bar"><span>Total</span><span>₹${Number(invoice.totalAmount || 0).toLocaleString('en-IN')}</span></div>
      </div>
    </div>

    ${invoice.notes ? `<div class="notes"><div class="label">Notes</div><div>${escapeHtml(invoice.notes)}</div></div>` : ''}

    <div class="footer">Generated via Build Your Thoughts — Professional project management for agencies</div>
  </div>
</body>
</html>`;
};

export interface ProjectQuotationPdfInput {
  quotation: any;
  projectName?: string;
  // When provided (proposal templates authored on the canvas editor), the
  // same branded header/footer bands used by renderProposalPdf are added.
  // Left undefined by the plain project-quotation flow, which renders its
  // own header directly as canvas elements instead.
  branding?: IProposalBranding;
  meta?: IProposalMeta;
}

// Must match the editor canvas: client/src/pages/admin/QuotationEditorPage.tsx PAGE_W/PAGE_H (A4 @ 96dpi).
const CANVAS_PAGE_W = 794;
const CANVAS_PAGE_H = 1123;

const renderQuotationElementHtml = (el: any): string => {
  const style = [
    `left:${el.x}px`,
    `top:${el.y}px`,
    `width:${el.w}px`,
    `height:${el.h}px`,
    'position:absolute',
  ].join(';');

  if (el.type === 'table') {
    const rows: string[][] = Array.isArray(el.rows) ? el.rows : [];
    const rowsHtml = rows
      .map(
        (row, ri) => `
      <tr>${row
        .map((cell) => `<td class="${ri === 0 ? 'th-cell' : ''}">${escapeHtml(cell || '')}</td>`)
        .join('')}</tr>`
      )
      .join('');
    return `<div style="${style}"><table class="q-table"><tbody>${rowsHtml}</tbody></table></div>`;
  }

  const blockStyle = [
    el.bg ? `background:${el.bg}` : '',
    el.bg ? 'box-sizing:border-box' : '',
    el.bg ? 'display:flex' : '',
    el.bg ? 'align-items:center' : '',
    el.bg ? 'padding:0 12px' : '',
    el.borderLeftColor ? `border-left:3px solid ${el.borderLeftColor}` : '',
    el.borderLeftColor ? 'box-sizing:border-box' : '',
    el.borderLeftColor ? 'padding:8px 10px' : '',
  ]
    .filter(Boolean)
    .join(';');
  const textStyle = [
    `font-size:${el.fontSize || 11}px`,
    `font-weight:${el.bold ? 700 : 400}`,
    `font-style:${el.italic ? 'italic' : 'normal'}`,
    `text-decoration:${el.underline ? 'underline' : 'none'}`,
    `text-align:${el.align || 'left'}`,
    `color:${el.color || '#1f2937'}`,
    el.bg ? 'width:100%' : '',
  ]
    .filter(Boolean)
    .join(';');
  const content = escapeHtml(el.content || '').replace(/\n/g, '<br/>');
  return `<div style="${style};${blockStyle}"><div style="${textStyle};white-space:pre-wrap;">${content}</div></div>`;
};

const buildProjectQuotationHtmlDocument = ({ quotation }: ProjectQuotationPdfInput): string => {
  const q = quotation || {};
  const pages: any[] = Array.isArray(q.pages) ? q.pages : [];

  const pagesHtml = pages
    .map((page, idx) => {
      const elementsHtml = (page.elements || []).map(renderQuotationElementHtml).join('');
      const isLast = idx === pages.length - 1;
      return `<div class="q-page" style="${isLast ? '' : 'page-break-after:always;'}">${elementsHtml}</div>`;
    })
    .join('');

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(q.documentTitle || q.quotationNumber || 'Quotation')}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: '${q.fontFamily || 'Helvetica'}', Arial, sans-serif; margin: 0; color: #1f2937; background: #fff; }
  .q-page { position: relative; width: ${CANVAS_PAGE_W}px; height: ${CANVAS_PAGE_H}px; overflow: hidden; }
  .q-table { width: 100%; height: 100%; border-collapse: collapse; font-size: 10px; }
  .q-table td { border: 1px solid #e5e0d8; padding: 6px 10px; vertical-align: top; }
  .q-table td.th-cell { background: #d9d5cd; font-weight: 700; }
</style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;
};

export const PdfService = {
  async renderProposalPdf(input: ProposalDocInput): Promise<Buffer> {
    const html = buildProposalHtmlDocument(input);
    const branding = input.branding || {};
    const meta = input.meta || {};
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: buildHeaderTemplate(branding, meta, input.title),
        footerTemplate: buildFooterTemplate(branding),
        margin: { top: '90px', bottom: '80px', left: '0px', right: '0px' },
      });
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  },

  async renderInvoicePdf(input: InvoicePdfInput): Promise<Buffer> {
    const html = buildInvoiceHtmlDocument(input);
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' },
      });
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  },

  async renderProjectQuotationPdf(input: ProjectQuotationPdfInput): Promise<Buffer> {
    const html = buildProjectQuotationHtmlDocument(input);
    const { branding, meta, quotation } = input;
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load' });
      const pdfBuffer = await page.pdf({
        // Fixed px dimensions matching the editor canvas exactly, rather than
        // 'A4' format, so absolutely-positioned elements land pixel-for-pixel
        // where the admin placed them.
        width: `${CANVAS_PAGE_W}px`,
        height: `${CANVAS_PAGE_H}px`,
        printBackground: true,
        displayHeaderFooter: !!branding,
        headerTemplate: branding
          ? buildHeaderTemplate(branding, meta || {}, quotation?.documentTitle || quotation?.quotationNumber || 'Proposal')
          : '<span></span>',
        footerTemplate: branding ? buildFooterTemplate(branding) : '<span></span>',
        margin: branding
          ? { top: '90px', bottom: '80px', left: '0px', right: '0px' }
          : { top: '0px', bottom: '0px', left: '0px', right: '0px' },
      });
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  },
};
