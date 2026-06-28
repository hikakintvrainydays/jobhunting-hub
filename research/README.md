# リサーチPJ — 28卒就活情報収集・分析基地

## このPJの目的
宮西ゼミ先輩内定実績（宮西ゼミ_内定先一元管理.xlsx）を素材に、
**筆記得意枠（GAB/玉手箱）× 早期選考ルート** で内定を狙い撃ちする。

## ディレクトリ構成
```
research/
├── README.md              ← このファイル
├── RULES.md               ← 鉄則（AIバレ防止・opsec）
├── companies/
│   ├── master.md          ← 全社テスト分類マスター
│   └── targets.md         ← 今すぐ動く早期選考ターゲット（優先順位付き）
└── platforms/
    ├── x-strategy.md      ← X(Twitter)アカウント設計・運用ルール
    └── opsec.md           ← AIバレ防止・個人情報opsecルール全文
```

## 使い方フロー

```
1. companies/targets.md を開く
   → 今月・来月のDeadlineを確認 → pipeline/companies.csv へ転記

2. 不明なテスト形式が出たら
   → X検索 or ONE CAREER で手動調査 → companies/master.md を更新

3. ESを書く前に
   → RULES.md の「ESガード」セクションを確認

4. 週次レビューで
   → /weekly → strategist がこのPJも参照する
```

## 優先度の基準（今フェーズ）
| 優先 | 条件 |
|------|------|
| 最優先 | GAB/玉手箱 × 早期選考あり × 28卒インターン募集中 |
| 次点 | GAB/玉手箱 × 本選考が早め（2027年春以前） |
| 保留 | テストセンター必須（SPI/C-GABテストセンター） |
| 除外 | SPI一択・テストセンター必須・早期なし |

## 素材ファイル
- 元データ: `C:\Users\kiham\OneDrive\ドキュメント\宮西ゼミ_内定先一元管理.xlsx`
  - 主要シート: 選考スケジュール(28卒)、内定先明細、業界別サマリー
- 参照: `profile/facts.md`（自分のSSOT）
