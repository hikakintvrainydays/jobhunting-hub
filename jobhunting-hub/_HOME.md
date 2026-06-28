---
title: 就活参謀 ダッシュボード
tags: [home, dashboard]
---

# 就活参謀 ダッシュボード

> **目標**: 28卒 三井物産・三菱商事 内定

---

## プロジェクト一覧

| フォルダ | 生成コマンド | 内容 |
|---------|------------|------|
| [[companies/]] | `/analyze` | 企業分析・財務・面接台本 |
| [[interview/]] | `/qa`, `/drill` | 想定問答・面接記録 |
| [[weekly/]] | `/weekly` | 週次レビュー・リソース配分 |
| [[decisions/]] | 手動 | 意思決定ログ |
| [[research/]] | `/analyze`, 手動 | 業界・競合リサーチメモ |

---

## 企業ノート（最近更新）

- [[companies/電通グループ]]

---

## 想定問答バンク（最近更新）

- [[interview/財務経理部長_暗記QA]]
- [[interview/三菱商事/想定問答_master]]

---

## 最近の意思決定

_意思決定ログは [[decisions/]] に記録していく_

---

## 使い方メモ

```
# AIが書く場所
/analyze  → vault/companies/<企業名>.md
/qa       → vault/interview/<企業名>/<ファイル>.md
/weekly   → vault/weekly/YYYY-WW<週>.md
/drill    → vault/interview/<企業名>/drill-log-<日付>.md

# 人間が書く場所
vault/decisions/<日付>_<テーマ>.md  ← 重要な判断を残す
```
