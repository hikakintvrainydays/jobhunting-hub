# リサーチ環境セットアップガイド

## 1. Xブラウザ（Puppeteer MCP）

### 設定状況
- `.mcp.json` に `puppeteer` MCP設定済み（jobhunting-hub ルート）
- パッケージ: `@modelcontextprotocol/server-puppeteer` グローバルインストール済み

### 使い方
1. Claude Code（VSCode拡張 or CLI）を **再起動**する
   → `.mcp.json` が読み込まれてpuppeteer MCP が有効になる
2. Claude に「puppeteer でブラウザを開いてx.comに移動して」と指示する
3. ブラウザウィンドウが開いたら **自分でX(Twitter)にログイン**する
   - アカウント: 就活専用の匿名アカウント（`research/platforms/x-strategy.md` 参照）
4. ログイン後、Claude に「@企業名の採用公式をフォローして」「"28卒 玉手箱" で検索して」等を指示する

### 注意
- Puppeteer MCPのブラウザは **可視モード**（headful）で起動するように設定済み
- ただしChromiumが自動起動するためChromeとは別のウィンドウになる
- ブラウザを閉じると次回またログインが必要

---

## 2. Codex CLI検索（コンテキスト節約型）

### 設定状況
- `npx @openai/codex exec` で利用可能
- ログイン: `kihamu2104@gmail.com`（ChatGPT Plus）
- ラッパースクリプト: `research/scripts/codex-search.ps1`

### Claude Code から使う方法

```powershell
# 基本形（Bash toolから呼び出す）
Get-Content -Raw "プロンプトをここに書いたファイル.txt" | npx @openai/codex exec --model o4-mini --ephemeral

# 短い検索クエリなら直接
echo "サントリー 28卒 インターン 秋 締切日を調べて" | npx @openai/codex exec --model o4-mini --ephemeral
```

### 使いどころ
- ONE CAREER・みん就・就活会議の体験談を検索させるとき
- 企業の秋冬IS締切日を一括調査するとき
- Claude のコンテキストを温存したいとき（長い調査タスク）

### codex のモデル設定
```
~/.codex/config.toml より:
model = "gpt-5.5"  ← デフォルト（xhigh reasoning）
model_reasoning_effort = "xhigh"
```
→ 検索だけなら `--model o4-mini` で速く安く済む

---

## 3. 推奨ワークフロー（週次リサーチ）

```
毎週月曜 30分:

Step 1: Xで情報収集（Puppeteer MCP or 自分のブラウザ）
  → ターゲット企業の採用公式 → 新着IS情報チェック
  → "28卒 インターン 締切" 検索

Step 2: codex で詳細調査
  → 「〇〇社 28卒 IS 締切 選考フロー」
  → 結果をコピー → Claude に渡して master.md / targets.md 更新

Step 3: pipeline/companies.csv 更新
  → 締切が判明した企業のES締切欄を埋める

Step 4: /today → 今週のアクション確認
```

---

## 4. トラブルシューティング

### puppeteer MCPが起動しない
```
Claude Code を完全に再起動してください（設定ファイルの再読み込みが必要）
```

### codex exec が stdin待ちになる
```powershell
# ✅ 正しい方法（stdinをパイプで渡す）
echo "検索クエリ" | npx @openai/codex exec --model o4-mini --ephemeral

# ❌ 失敗する方法（stdinを空にしない）
npx @openai/codex exec --model o4-mini "クエリ"  ← これだとstdin待ちになる場合あり
```

### chromiumが見つからない
```powershell
# Puppeteerのchromiumをダウンロード
npx puppeteer browsers install chrome
```
