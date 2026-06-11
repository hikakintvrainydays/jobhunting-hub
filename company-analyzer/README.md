# company-analyzer（移植 保留中）

このフォルダは、就活ハブの**中核**となる「企業分析→面接素材 自動生成システム」の置き場所です。
本来の中身（`CLAUDE.md` ＋ `.claude/agents/w0〜w8` ＋ `profile/` ＋ `inputs/` ＋ `outputs/`）は、
別リポジトリ `hikakintvrainydays/financial-accounting-quiz` のブランチ `claude/nice-bell-YaHIY` の
`company-analyzer/` にあります。

## 現状（なぜ空か）

このセットアップを実行したセッションでは、ソース元の `financial-accounting-quiz` リポジトリが
**本セッションのスコープ外**で、ファイルを取得できませんでした。そのため中身を**創作せず**、
本READMEのみを置いています（資料の創作禁止ルールに従う）。

## 移植のやり方（次にやること）

ソースにアクセスできるセッション、または手元の作業環境で、以下のいずれかで移植してください。
**`git mv` ではなくファイルコピー**で行い、元リポジトリには手を加えないこと（読み取り専用扱い）。

```bash
# 例）別ディレクトリに source repo を clone してコピー
git clone https://github.com/hikakintvrainydays/financial-accounting-quiz.git /tmp/faq
cd /tmp/faq && git checkout claude/nice-bell-YaHIY

# 隠しディレクトリ（.claude/）の取りこぼしに注意してコピー
cp -a /tmp/faq/company-analyzer/. /path/to/job-hunting-hub/company-analyzer/
```

または、`company-analyzer/` 一式を zip で受け取り、本フォルダへ解凍する。

## 移植後の検証

- `company-analyzer/.claude/agents/` に **w0〜w8 の9ファイル**が揃っているか確認。欠けていれば報告。
- `company-analyzer/profile/resume.md`・`drawer.md` が雛形なら、
  `../profile/matsui_dai_knowledge_file_v1.md` を元に中身を埋める。
- 移植が済んだら、この README を削除し、`CLAUDE_log.md` に移植記録を追記する。
