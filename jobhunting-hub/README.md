# 就活参謀 Obsidian 保管庫

**このフォルダをObsidianで開く**: Obsidian → 「別のVaultを開く」→ `jobhunting-hub/vault/` を選択

---

## フォルダ構成

```
vault/
├── _HOME.md            ← ダッシュボード（ここから始める）
├── companies/          ← /analyze が自動生成（企業分析・財務・面接台本）
├── interview/          ← /qa, /drill が出力（想定問答・面接記録）
│   └── <企業名>/
├── decisions/          ← 手動記入（意思決定ログ）
├── weekly/             ← /weekly が出力（週次レビュー・配分）
└── research/           ← リサーチメモ
```

## AIコマンドと書き込み先

| コマンド | 出力先 |
|---------|-------|
| `/analyze <企業>` | `vault/companies/<企業>.md` |
| `/qa <企業>` | `vault/interview/<企業>/想定問答_master.md` |
| `/drill` | `vault/interview/<企業>/drill-log-<日付>.md` |
| `/weekly` | `vault/weekly/YYYY-WW<週>.md` |

## 使い方

1. Obsidianで `vault/` を開く
2. `_HOME.md` がダッシュボード（プレビューモードで表示）
3. AIコマンドを実行 → 各フォルダにMDが生成される
4. 読んで判断 → `decisions/` に意思決定を記録

## タグ体系

- `#企業分析` — 企業ノート
- `#interview` — 面接・想定問答
- `#decision` — 意思決定ログ
- `#weekly` — 週次レビュー
- `#28卒` — 今年度向け
