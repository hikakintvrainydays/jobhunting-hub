# job-hunting-hub

松井大（滋賀大学・経済学部／宮西賢次ゼミ・財務専攻／総合商社志望）の **就活の単一作業拠点** です。
企業分析から面接素材生成までを行う `company-analyzer/` を中核に、本人の一次資料・就活戦略・ゼミ/背景資料を同梱しています。

> 非公開リポジトリ。第三者の個人情報（ゼミ同期のプロフィール・LINEログ等）を含むため、取り扱いに注意してください。

## リポジトリの地図

```
job-hunting-hub/
├── README.md            ← このファイル（PJ全体の地図）
├── CLAUDE.md            ← 全Claude Codeセッションへの常時指示
├── CLAUDE_log.md        ← 変更履歴ログ（作業のたびに追記）
├── company-analyzer/    ← 企業分析→面接素材 自動生成システム（中核）
├── profile/             ← 本人の一次資料（経歴・成績・TOEIC・ガクチカ素材）
├── strategy/            ← 就活戦略・知見（商社就活・過去採用・アドバイス蓄積）
└── seminar/             ← ゼミ・海外・背景資料（海外記録・推薦図書・LINEログ）
```

## company-analyzer の使い方

企業を一つ指定して分析を依頼すると、w0〜w8 のエージェントが順に企業分析を行い、面接素材（志望動機・逆質問・想定問答等）まで生成します。

```
分析: <企業名>      例）分析: 三菱商事
```

- 作法・エージェント構成・入出力の正は `company-analyzer/CLAUDE.md` を参照。
- 本人の「自分らしさ」の源泉は `profile/matsui_dai_knowledge_file_v1.md`。
  `company-analyzer/profile/resume.md`・`drawer.md` はこれを元に作成・更新する。

## profile / strategy の位置

| 知りたいこと | 見る場所 |
|---|---|
| 本人の経歴・原体験・志望（最重要ソース） | `profile/matsui_dai_knowledge_file_v1.md` |
| 学業成績・資格・TOEIC | `profile/成績_資格.md`, `profile/toeic.md` |
| ガクチカ素材（観光DX/KINTO/タイ視察） | `profile/Torutour_kinto.md`, `profile/タイツアー.md` |
| 商社就活の戦略・ガクチカ作法 | `strategy/総合商社_就活戦略まとめ_JTCtrading.md` |
| これまでの就活アドバイス蓄積 | `strategy/Claude就活アドバイス.md` |
| ゼミ先輩の内定実績 | `strategy/宮西ゼミ_過去の商社採用.md` |
| company-analyzer の出力到達点サンプル | `strategy/就活用自動_統合書分析プログラム_トヨタ編` |

## ログの見方（変更を追う方法）

- **GitHub の Commits / 差分**：すべての変更はコミットされている。コミット一覧と差分で「何を・なぜ変えたか」を追える。
- **`CLAUDE_log.md`**：節目ごとに、日時・触ったファイル・変更概要・判断理由・次アクションを追記している。意思決定の流れはここを読めば追える。
