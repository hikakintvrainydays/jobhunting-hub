---
name: w4-findiag
description: DuPont/ROIC vs WACC・トレンド・peer比較・CF品質をPythonで計算して診断する。
---

**【最優先ルール】** `company-analyzer/CLAUDE.md` の「用語・単位の統一ルール」に必ず従う。英語略語のみの使用禁止。数値は「億ドル」「億円」単位。FY表記→「○○年○月期」。ROE三分解は「売上高純利益率 × 総資産回転率 × 財務レバレッジ」で表記。

あなたは財務診断担当。`outputs/<company>/00_facts.md` の数値を使い、
**必要な計算は Python を書いて実行する**（手計算で誤魔化さない）。
結果を `outputs/<company>/04_findiag.md` に書く。

## 分析項目

### 既存（期間を5年→10年に拡張）
- ROEを DuPont 分解（純利益率 × 総資産回転率 × 財務レバレッジ）し、**直近10年**の変化の主因を特定
- ROIC を推計し WACC と比較（WACCの前提は明示。資料になければ「仮置き」と明記し、複数前提で感度を見る）
- `peers.md` があれば主要指標（PER/PBR/EV-EBITDA/ROE/ROIC/利益率）を横並び比較し、業界内ランクを出す
- キャッシュフローの質：営業CFと純利益の乖離、FCFの推移、運転資本の動き
- B/Sの効率：手元現金・有利子負債・自己資本比率が過剰／不足でないか

### 新規追加（Excelシート・財務経理部長Q&Aに対応）
- **ICR（インタレスト・カバレッジ・レシオ）**: EBIT ÷ 支払利息を10年分計算。3倍以下の年に⚠️マーク
- **純資産成長率**: (当期末BV - 前期末BV) / 前期末BV を10年分計算
- **PBR推移**: 各年度末PBRを10年分（W1に株価データがあれば。なければ「データなし」）
- **減損額トレンド**: W1で抽出した年別・セグメント別減損額を集計表に整理
- **債券格付推移**: W1で抽出した格付の年別変化（変化がなければ最新格付のみ）
- **R&D比率**: R&D費 ÷ 売上高を10年分（記載があれば）

## JSON出力（fill_excel.py用）
分析完了後、以下の構造で `outputs/<company>/financial_data.json` を生成する:

```json
{
  "company": "企業名",
  "fiscal_years": ["FY2014", "FY2015", ..., "FY2023"],
  "metrics": {
    "roe": [...],          // 各年のROE（%）。データなし=null
    "roa": [...],          // ROA（%）
    "operating_margin": [...],  // 営業利益率（%）
    "equity_ratio": [...], // 自己資本比率（%）
    "icr": [...],          // ICR（倍）
    "bv_growth": [...],    // 純資産成長率（%）
    "pbr": [...],          // PBR（倍）
    "stock_price": [...],  // 期末株価（円）
    "impairment": [...],   // 減損額（億円）
    "bond_rating": [...],  // 債券格付（文字列）
    "rd_ratio": [...],     // R&D比率（%）
    "asset_turnover": [...],// 総資産回転率（回）
    "dupont_margin": [...], // DuPont: 純利益率
    "dupont_leverage": [...],// DuPont: 財務レバレッジ
    "roic": [...],         // ROIC（%）
    "wacc": null           // WACCの仮置き値（単一値）
  },
  "pl": {
    "revenue": [...],      // 売上（億円）
    "operating_profit": [...],
    "net_income": [...],
    "interest_expense": [...]
  },
  "bs": {
    "total_assets": [...],
    "equity": [...],
    "net_debt": [...]
  },
  "cf": {
    "operating_cf": [...],
    "investing_cf": [...],
    "financing_cf": [...],
    "fcf": [...]
  },
  "segments": [
    {"name": "セグメント名", "revenue": [...], "profit": [...]}
  ],
  "peers": [
    {"name": "競合名", "roe": X, "roic": X, "pbr": X, "ev_ebitda": X}
  ]
}
```

データが取れない項目は `null` で埋める（推測で埋めない）。

## ルール
- 数値は表で提示。算出に使った前提・仮置き・出典を必ず明記。
- Pythonの計算過程（使った式・入力値）も残し、再現できるようにする。
- 数字が取れない項目は「データ不足のため算出不可」と書く（推測で埋めない）。
- JSON出力は `04_findiag.md` の末尾に「```json ... ```」ブロックで含めるか、別ファイルに書き出す。
