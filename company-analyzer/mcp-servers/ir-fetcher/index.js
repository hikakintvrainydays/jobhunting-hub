#!/usr/bin/env node

/**
 * ir-fetcher MCP Server
 *
 * EDINET API v2 と直接URL取得で有報PDFをローカルに保存する。
 * Claude in Chrome 不要。
 *
 * 提供ツール:
 *   edinet_search_filings   - EDINETコード+年度範囲で有報書類IDを列挙
 *   edinet_download_doc     - 書類IDを指定してPDFをローカル保存
 *   download_file           - 任意URLをローカルファイルとして保存
 *   ensure_dir              - ディレクトリを再帰的に作成
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import AdmZip from 'adm-zip';

// ─── EDINET定数 ─────────────────────────────────────────────────────────────
const EDINET_BASE = 'https://disclosure.edinet-fsa.go.jp/api/v2';
const DOC_TYPE_ANNUAL_REPORT = '120'; // 有価証券報告書

// EDINET API v2 は Subscription-Key が必要（無料登録: https://disclosure.edinet-fsa.go.jp/）
const EDINET_API_KEY = process.env.EDINET_API_KEY || '';

function buildEdinetUrl(path, params = {}) {
  const u = new URL(`${EDINET_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  if (EDINET_API_KEY) u.searchParams.set('Subscription-Key', EDINET_API_KEY);
  return u.toString();
}

// ─── HTTP ヘルパー ───────────────────────────────────────────────────────────

/** URLからBufferを取得。リダイレクト追跡あり。 */
function fetchBuffer(url, maxRedirects = 8, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ir-fetcher/1.0)',
          Accept: '*/*',
          ...(EDINET_API_KEY ? { 'Ocp-Apim-Subscription-Key': EDINET_API_KEY } : {}),
          ...extraHeaders,
        },
        timeout: 60000,
      },
      (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && maxRedirects > 0) {
          res.resume();
          resolve(fetchBuffer(res.headers.location, maxRedirects - 1));
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () =>
          resolve({
            buffer: Buffer.concat(chunks),
            contentType: res.headers['content-type'] || '',
            statusCode: res.statusCode,
          })
        );
        res.on('error', reject);
      }
    );
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
  });
}

async function fetchJson(url) {
  const { buffer, statusCode } = await fetchBuffer(url);
  if (statusCode === 401) {
    throw new Error(
      'EDINET API 認証エラー(401)。環境変数 EDINET_API_KEY にキーをセットしてください。\n' +
      '無料登録: https://disclosure.edinet-fsa.go.jp/ → 利用申請'
    );
  }
  if (statusCode !== 200) throw new Error(`EDINET HTTP ${statusCode}: ${url}`);
  return JSON.parse(buffer.toString('utf-8'));
}

// ─── EDINET 日付ウィンドウ ────────────────────────────────────────────────────
/**
 * 会計年度と決算月から「有報が提出される期間」の日付一覧(weekdayのみ)を返す。
 * fiscalYear: 会計年度 (期末年)
 * fiscalMonthEnd: 決算月 (3, 6, 9, 12 など)
 */
function getFilingDates(fiscalYear, fiscalMonthEnd) {
  let filingYear = fiscalYear;
  let startMonth, endMonth;

  // 有報は決算月末日から原則3ヶ月以内に提出
  if (fiscalMonthEnd === 3) {
    startMonth = 6; endMonth = 7; // 6月〜7月
  } else if (fiscalMonthEnd === 6) {
    startMonth = 9; endMonth = 10;
  } else if (fiscalMonthEnd === 9) {
    startMonth = 12; endMonth = 12;
  } else if (fiscalMonthEnd === 12) {
    filingYear = fiscalYear + 1; // 12月末 → 翌年3〜4月
    startMonth = 3; endMonth = 4;
  } else {
    startMonth = 1; endMonth = 12; // 不明: 全期間
  }

  const dates = [];
  for (let month = startMonth; month <= endMonth; month++) {
    const daysInMonth = new Date(filingYear, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(filingYear, month - 1, day);
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        dates.push(d.toISOString().split('T')[0]);
      }
    }
  }
  return dates;
}

/** 並列度を守りながら非同期タスクを実行 */
async function mapConcurrent(items, concurrency, fn) {
  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i]).catch(() => null);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

// ─── PDF保存ヘルパー ────────────────────────────────────────────────────────

/** バッファをファイル保存。ZIPならPDFを抽出して保存。 */
function saveDocBuffer(buffer, contentType, outputPath) {
  const isPdf =
    contentType.includes('pdf') ||
    buffer.slice(0, 4).toString('ascii') === '%PDF';
  const isZip =
    contentType.includes('zip') ||
    (buffer[0] === 0x50 && buffer[1] === 0x4b); // PK header

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  if (isPdf) {
    fs.writeFileSync(outputPath, buffer);
    return { saved: outputPath, method: 'pdf-direct' };
  }

  if (isZip) {
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();
    // 最大サイズのPDFを主ファイルとして採用
    const pdfEntries = entries
      .filter((e) => e.entryName.toLowerCase().endsWith('.pdf') && !e.isDirectory)
      .sort((a, b) => b.header.size - a.header.size);

    if (pdfEntries.length === 0) {
      // PDFが見当たらない場合はZIPごと保存
      const zipPath = outputPath.replace(/\.pdf$/i, '.zip');
      fs.writeFileSync(zipPath, buffer);
      return { saved: zipPath, method: 'zip-no-pdf', entries: entries.map((e) => e.entryName) };
    }

    const mainPdf = pdfEntries[0];
    fs.writeFileSync(outputPath, mainPdf.getData());
    return {
      saved: outputPath,
      method: 'zip-extracted',
      extractedFrom: mainPdf.entryName,
      otherPdfs: pdfEntries.slice(1).map((e) => e.entryName),
    };
  }

  // 不明: そのまま保存
  fs.writeFileSync(outputPath, buffer);
  return { saved: outputPath, method: 'unknown-content-type', contentType };
}

// ─── MCPサーバー定義 ─────────────────────────────────────────────────────────

const server = new Server(
  { name: 'ir-fetcher', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// ── ツール定義一覧 ──
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'edinet_search_filings',
      description:
        'EDINETコードと会計年度範囲を指定して、有価証券報告書(docTypeCode=120)の書類IDと提出日を一覧取得する。' +
        '取得後 edinet_download_doc で各PDFを保存する。',
      inputSchema: {
        type: 'object',
        properties: {
          edinet_code: { type: 'string', description: 'EDINETコード (例: E04760)' },
          start_fiscal_year: {
            type: 'integer',
            description: '会計年度開始 (期末年で指定。例: FY2015なら2015)',
          },
          end_fiscal_year: {
            type: 'integer',
            description: '会計年度終了 (期末年で指定。例: FY2024なら2024)',
          },
          fiscal_month_end: {
            type: 'integer',
            description: '決算月 (3=3月末, 6=6月末, 9=9月末, 12=12月末). 省略時は全期間検索',
          },
          concurrency: {
            type: 'integer',
            description: '並列リクエスト数 (default: 8, max推奨: 12)',
          },
        },
        required: ['edinet_code', 'start_fiscal_year', 'end_fiscal_year'],
      },
    },
    {
      name: 'edinet_download_doc',
      description:
        'EDINET書類IDを指定してPDFをローカルファイルとして保存する。' +
        'ZIPが返ってきた場合は内部の最大PDFを自動抽出する。',
      inputSchema: {
        type: 'object',
        properties: {
          doc_id: { type: 'string', description: '書類ID (例: S100ABCD)' },
          output_path: {
            type: 'string',
            description: '保存先フルパス (例: C:/path/to/inputs/dentsu/yuho_FY2024.pdf)',
          },
          doc_type: {
            type: 'integer',
            description:
              'EDINET書類種別 (1=提出書類本体, 2=添付書類, 4=全書類ZIP). default: 1',
          },
        },
        required: ['doc_id', 'output_path'],
      },
    },
    {
      name: 'download_file',
      description:
        '任意のURLからファイルをダウンロードしてローカルに保存する。' +
        '公式IRサイトのPDF直リンク (例: https://www.group.dentsu.com/jp/ir/common/pdf/yuho175.pdf) に使う。',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'ダウンロードURL' },
          output_path: { type: 'string', description: '保存先フルパス' },
        },
        required: ['url', 'output_path'],
      },
    },
    {
      name: 'ensure_dir',
      description: 'ディレクトリを再帰的に作成する (mkdir -p 相当)',
      inputSchema: {
        type: 'object',
        properties: {
          dir_path: { type: 'string', description: '作成するディレクトリパス' },
        },
        required: ['dir_path'],
      },
    },
    {
      name: 'fetch_page_links',
      description:
        '企業IRページなど任意のURLのHTMLを取得し、PDF/Excel/ZIPなどのドキュメントリンクを抽出して返す。' +
        'EDINETなしで有報・統合報告書・中計のURLを探す主力ツール。' +
        'filter を指定するとURLまたはリンクテキストにその文字列を含むリンクのみ返す。',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'スクレイプ対象URL (企業のIRライブラリページなど)' },
          filter: {
            type: 'string',
            description:
              'URLまたはアンカーテキストに含まれるべきキーワード (例: "有価証券報告書" "annual" "yuho" "統合報告書")。' +
              '省略時は .pdf/.xlsx/.zip/.doc 拡張子のリンクを全部返す。',
          },
          referer: {
            type: 'string',
            description: 'Refererヘッダ。403対策で元IRページのURLを指定する。',
          },
        },
        required: ['url'],
      },
    },
  ],
}));

// ── ツール実行ハンドラ ──
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // ─── edinet_search_filings ────────────────────────────────────────────────
  if (name === 'edinet_search_filings') {
    const {
      edinet_code,
      start_fiscal_year,
      end_fiscal_year,
      fiscal_month_end,
      concurrency = 8,
    } = args;

    const allDates = [];
    for (let fy = start_fiscal_year; fy <= end_fiscal_year; fy++) {
      const dates = getFilingDates(fy, fiscal_month_end ?? 0);
      allDates.push(...dates.map((d) => ({ date: d, fiscalYear: fy })));
    }

    const found = [];
    const seen = new Set();

    await mapConcurrent(allDates, Math.min(concurrency, 16), async ({ date, fiscalYear }) => {
      const url = buildEdinetUrl('/documents.json', { date, type: '2' });
      try {
        const data = await fetchJson(url);
        if (!data.results) return;
        for (const doc of data.results) {
          if (
            doc.edinetCode === edinet_code &&
            doc.docTypeCode === DOC_TYPE_ANNUAL_REPORT &&
            !seen.has(doc.docID)
          ) {
            seen.add(doc.docID);
            found.push({
              fiscalYear,
              docID: doc.docID,
              submitDate: date,
              filerName: doc.filerName,
              periodStart: doc.periodStart,
              periodEnd: doc.periodEnd,
              docDescription: doc.docDescription,
              pdfFlag: doc.pdfFlag,
              xbrlFlag: doc.xbrlFlag,
            });
          }
        }
      } catch {
        // 日付スキップ (休市日・エラー)
      }
    });

    found.sort((a, b) => a.fiscalYear - b.fiscalYear);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              total: found.length,
              searched_dates: allDates.length,
              filings: found,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  // ─── edinet_download_doc ─────────────────────────────────────────────────
  if (name === 'edinet_download_doc') {
    const { doc_id, output_path, doc_type = 1 } = args;
    const url = buildEdinetUrl(`/documents/${doc_id}`, { type: String(doc_type) });

    const { buffer, contentType, statusCode } = await fetchBuffer(url);
    if (statusCode === 401) {
      throw new Error('EDINET API 認証エラー(401)。環境変数 EDINET_API_KEY をセットしてください。');
    }
    if (statusCode !== 200) {
      throw new Error(`EDINET download failed: HTTP ${statusCode} for docID=${doc_id}`);
    }

    const result = saveDocBuffer(buffer, contentType, output_path);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, ...result }, null, 2),
        },
      ],
    };
  }

  // ─── download_file ───────────────────────────────────────────────────────
  if (name === 'download_file') {
    const { url, output_path } = args;

    const { buffer, contentType, statusCode } = await fetchBuffer(url);
    if (statusCode !== 200) {
      throw new Error(`Download failed: HTTP ${statusCode} for ${url}`);
    }

    fs.mkdirSync(path.dirname(output_path), { recursive: true });
    fs.writeFileSync(output_path, buffer);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              saved: output_path,
              contentType,
              bytes: buffer.length,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  // ─── ensure_dir ─────────────────────────────────────────────────────────
  if (name === 'ensure_dir') {
    const { dir_path } = args;
    fs.mkdirSync(dir_path, { recursive: true });
    return {
      content: [{ type: 'text', text: `Created: ${dir_path}` }],
    };
  }

  // ─── fetch_page_links ────────────────────────────────────────────────────
  if (name === 'fetch_page_links') {
    const { url, filter, referer } = args;

    const extraHeaders = {};
    if (referer) extraHeaders['Referer'] = referer;

    const { buffer, contentType, statusCode } = await fetchBuffer(url, 8, extraHeaders);
    if (statusCode !== 200) {
      throw new Error(`HTTP ${statusCode}: ${url}`);
    }

    const html = buffer.toString('utf-8');
    let baseOrigin;
    try {
      const parsed = new URL(url);
      baseOrigin = parsed.origin;
    } catch {
      baseOrigin = '';
    }

    const links = [];
    const seen = new Set();

    // <a href="...">テキスト</a> を抽出（ネストタグあり）
    const anchorRe = /<a\b[^>]*\bhref\s*=\s*["']([^"'#?][^"']*?)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let m;
    while ((m = anchorRe.exec(html)) !== null) {
      const [, rawHref, inner] = m;
      const text = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 120);

      let absUrl;
      try {
        absUrl = new URL(rawHref, url).toString();
      } catch {
        continue;
      }
      if (seen.has(absUrl)) continue;

      const docExt = /\.(pdf|xlsx|xls|zip|doc|docx)(\?|$)/i;
      let passes;
      if (filter) {
        const f = filter.toLowerCase();
        passes = absUrl.toLowerCase().includes(f) || text.toLowerCase().includes(f);
      } else {
        passes = docExt.test(absUrl);
      }

      if (passes) {
        seen.add(absUrl);
        links.push({ url: absUrl, text, href: rawHref });
      }
    }

    // src 属性のiframe/embed内PDFも拾う
    const srcRe = /(?:src|data)\s*=\s*["']([^"']+\.pdf[^"']*)["']/gi;
    while ((m = srcRe.exec(html)) !== null) {
      let absUrl;
      try {
        absUrl = new URL(m[1], url).toString();
      } catch { continue; }
      if (!seen.has(absUrl)) {
        seen.add(absUrl);
        links.push({ url: absUrl, text: '(embedded PDF)', href: m[1] });
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ page_url: url, count: links.length, links }, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// ─── 起動 ────────────────────────────────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);
