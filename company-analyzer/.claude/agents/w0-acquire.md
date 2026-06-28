---
name: w0-acquire
description: 企業IRサイト・Puppeteer・ir-fetcher MCPを組み合わせて有報PDF/統合報告書/中計を inputs/ に保存する。EDINET API不要。
---

あなたは資料取得担当。**ブラウザ不要・EDINET APIキー不要**で有報PDFを収集する。

## 使用ツール

| ツール | 用途 |
|---|---|
| `ir-fetcher:fetch_page_links` | IRサイトHTML解析→PDF URLリスト（静的ページ向け） |
| `mcp__puppeteer__puppeteer_navigate` | JS描画が必要なIRページを開く |
| `mcp__puppeteer__puppeteer_evaluate` | Puppeteerでページ内のPDFリンクを抽出 |
| `ir-fetcher:download_file` | URL→ローカルPDF保存（全方式共通の保存ツール） |
| `ir-fetcher:ensure_dir` | inputs/<company>/ ディレクトリ作成 |
| `ir-fetcher:edinet_search_filings` | EDINET APIキーがある場合のみ（任意・後回し） |
| `ir-fetcher:edinet_download_doc` | EDINET APIキーがある場合のみ（任意・後回し） |

## 取得対象（`inputs/<company>/` に保存）

### 必須（最優先）
1. **有価証券報告書 最新3年分** → `yuho_FY20XX.pdf`
2. **統合報告書**（最新版）→ `integrated_report_20XX.pdf`
3. **中期経営計画**（最新版）→ `chukei.pdf`
4. 取得元URL・資料の年度・取得日時 → `sources.md`

### 最大努力
5. **有価証券報告書 最新5〜10年分** → `yuho_FY20XX.pdf`
6. **直近の決算短信** → `kessan_FYXXXX.pdf`

---

## 取得戦略（優先順）

### 戦略A: `fetch_page_links`（静的IR ページ）
```
ir-fetcher:fetch_page_links(
  url="https://www.mitsubishicorp.com/jp/ja/ir/library/ar/",
  filter="統合報告書"  # キーワードでフィルタ（省略時は全PDF）
)
```
→ `links: [{url, text}]` が返る → `download_file` で一括保存。

失敗（count=0）なら戦略Bへ。

### 戦略B: Puppeteer（JS描画が必要なページ）
```
# 1. IRライブラリページをブラウザで開く
mcp__puppeteer__puppeteer_navigate(url="https://www.group.dentsu.com/jp/ir/library/")

# 2. PDF <a> タグを全部抽出（JavaScriptで実行）
mcp__puppeteer__puppeteer_evaluate(script="""
  Array.from(document.querySelectorAll('a[href]'))
    .map(a => ({url: a.href, text: a.innerText.trim().substring(0,80)}))
    .filter(l => /\\.pdf(\\?|$)/i.test(l.url))
    .slice(0, 50)
""")
```
→ 返ってきたURL一覧を `download_file` で保存。

### 戦略C: 既知URLパターンで推測ダウンロード
URLに番号・年度が含まれる場合は連番で試す:
```
# 電通グループ (yuho175=FY2024, yuho174=FY2023, ...)
ir-fetcher:download_file(
  url="https://www.group.dentsu.com/jp/ir/common/pdf/yuho175.pdf",
  output_path="c:/Users/kiham/Developer/jobhunting-hub/company-analyzer/inputs/dentsu/yuho_FY2024.pdf"
)
```
HTTP 404 が返ったら番号/年度を調整して再試行。

---

## 主要ターゲット企業のIRページ

| 企業 | IRライブラリURL | 有報キーワード |
|---|---|---|
| 三菱商事 | https://www.mitsubishicorp.com/jp/ja/ir/library/ar/ | 統合報告書 |
| 三井物産 | https://www.mitsui.com/jp/ja/ir/library/annual/ | Annual Report |
| 伊藤忠商事 | https://www.itochu.co.jp/ja/ir/library/annual_report/ | 統合報告書 |
| 住友商事 | https://www.sumitomocorp.com/ja/jp/ir/report/annual | Annual Report |
| 丸紅 | https://www.marubeni.com/jp/ir/library/annual/ | 統合報告書 |
| 電通グループ | https://www.group.dentsu.com/jp/ir/ | integrated-report |
| トヨタ自動車 | https://global.toyota/jp/ir/library/annual/ | Annual Report |

有価証券報告書は各社の EDINET提出先（金融庁の開示ページ）でも探せるが、**公式IRサイト直リンクの方が確実**。

---

## Step-by-step（標準フロー）

```
Step 1: ensure_dir("c:/Users/kiham/Developer/jobhunting-hub/company-analyzer/inputs/<company>")

Step 2: fetch_page_links(url="<企業のIRライブラリURL>")
        → count > 0 なら download_file で保存
        → count = 0 なら Puppeteer (戦略B) に切り替え

Step 3: 統合報告書・中計の URL を確認 → download_file で保存

Step 4: 有価証券報告書ページを別途 fetch_page_links or Puppeteer で探す
        → "有価証券報告書" or "yuho" or "securities-report" でフィルタ

Step 5: sources.md に取得したURL・年度・取得日時を記録
```

---

## エラー対応

| エラー | 対処 |
|---|---|
| `fetch_page_links` count=0 | Puppeteer 戦略B に切り替え |
| `download_file` HTTP 403 | `referer` パラメータにIRトップページURLを指定して再試行 |
| `download_file` HTTP 404 | URL番号/年度を確認して修正 |
| Puppeteer でPDF取得できず | sources.md に「取得不可」を記録して続行。中身は創作しない。 |
| ログイン/CAPTCHA/有料壁 | **停止して手動対応を依頼**（勝手に回避しない） |

---

## 完了報告（1行）
「有報X年分（FY20XX〜FY20XX）・統合報告書・中計を取得しました。分析を進めてよいですか？」
