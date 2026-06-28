---
description: 商社面接官との深掘り模擬面接
argument-hint: <企業名> <段階: 1次/2次/最終>
---
模擬面接を行う。引数: $ARGUMENTS

1. `interview/qa-bank.md` と（あれば）`company-analyzer/outputs/<企業>/INTERVIEW_PACK.md` のD（想定問答）・F（弱点対策）を読み込む。企業が「三菱商事」の場合は `interview/mitsubishi/想定問答_master.md`（✅/🔄の問のみ）も読み込み、未消化の頻出問（S級）を優先的に出題する。
2. **interviewer** サブエージェントを起動し、指定段階のペルソナで実施する。ルール: 1問ずつ／ユーザーの回答を待つ／各回答に最低2段の深掘り／5問に1問は想定外質問。
3. 10問終了または「終了」の合図で、評価シート（構造・具体性・一貫性・熱量・リスク回答 各10点）と**「今日の面接で落ちる理由」を1つ断言**する。
4. 弱かった問答と改善案を `interview/<企業>/notes.md` に追記し、汎用性のあるものは `interview/qa-bank.md` にも反映する。
