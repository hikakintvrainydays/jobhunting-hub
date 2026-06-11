---
description: 企業分析（company-analyzerへ委譲）
argument-hint: <企業名>
---
企業分析は別システム company-analyzer の担当。引数: $ARGUMENTS

1. `company-analyzer/CLAUDE.md` の存在を確認する。なければ `company-analyzer/README_PLACE_HERE.md` の導入手順を案内して終了。
2. あれば company-analyzer の指示に従い「分析: <企業名>」を実行する（inputs/が空ならPhase 0=資料取得から）。
3. 完了後、`company-analyzer/outputs/<企業>/INTERVIEW_PACK.md` の A（30秒の核）と C（自分で考えた示唆）を3行で要約し、`/es <企業> …` と `/drill <企業> …` への接続を提案する。
