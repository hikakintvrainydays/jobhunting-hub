export const meta = {
  name: 'qa-fill-batch',
  description: '想定問答の未着手問をカテゴリ別に並列生成し、fact-checkerで照合して保存する',
  phases: [
    { title: 'S級生成', detail: '志望理由・ガクチカ・自己PR（~18問）を並列生成' },
    { title: 'A級生成', detail: '留学・部活・弱点・パーソナリティ（~32問）を並列生成' },
    { title: '財務S級', detail: '財務基礎・財務分析・三菱商事分析（~10問）を並列生成' },
    { title: 'Fact照合', detail: '全生成分をfact-checkerでスキャン' },
  ],
}

// ============================================================
// 定数: 質問リスト（優先度別）
// ============================================================

const S_QUESTIONS = [
  { id: 'Q01', text: '総合商社を志望する理由（重要な順に3点）', file: '想定問答_master.md' },
  { id: 'Q02', text: '三菱商事を志望する理由（重要な順に3点）', file: '想定問答_master.md' },
  { id: 'Q03', text: '三菱商事がライバル企業に優っていると思う点（3点）', file: '想定問答_master.md' },
  { id: 'Q04', text: '就職活動の軸（重要な順に3点）', file: '想定問答_master.md' },
  { id: 'Q05', text: 'その軸を選ぶ理由（各軸ごとに説明）', file: '想定問答_master.md' },
  { id: 'Q06', text: '三菱商事で取り組んでみたい仕事（事業グループ2つ＋プロジェクト例）', file: '想定問答_master.md' },
  { id: 'Q09', text: '三菱商事があなたを採用したらどんなメリットがあるか（3点）', file: '想定問答_master.md' },
  { id: 'Q41', text: 'リーダーシップを発揮して成果を生み出した経験（ガクチカ系頻出）', file: '想定問答_master.md' },
  { id: 'Q44', text: '大学時代に一番頑張ったこと（ガクチカ）', file: '想定問答_master.md' },
  { id: 'Q45', text: 'ガクチカ：それを頑張ろうと思った理由', file: '想定問答_master.md' },
  { id: 'Q46', text: 'ガクチカ：どのような目標を設定したか', file: '想定問答_master.md' },
  { id: 'Q47', text: 'ガクチカ：苦労した点は何か', file: '想定問答_master.md' },
  { id: 'Q48', text: 'ガクチカ：それをどのように乗り越えたか', file: '想定問答_master.md' },
  { id: 'Q56', text: '強みを重要な順に5つ（端的・独自性のある表現）', file: '想定問答_master.md' },
  { id: 'Q58', text: 'これだけは誰にも負けない強み（1〜2個）', file: '想定問答_master.md' },
  { id: 'Q59', text: 'それを実感したエピソード（最大の強みで2エピソード）', file: '想定問答_master.md' },
  { id: 'Q79', text: '1分間自己PR（口頭原稿）', file: '想定問答_master.md' },
  { id: 'Q80', text: '30秒自己紹介（1分版の要約）', file: '想定問答_master.md' },
]

const A_QUESTIONS = [
  { id: 'Q07', text: '仕事を通じて達成したい目標・実現したい夢', file: '想定問答_master.md' },
  { id: 'Q10', text: 'メーカーの営業と商社の営業の仕事の違い', file: '想定問答_master.md' },
  { id: 'Q11', text: 'あなたにとって仕事とは何か（仕事観・人生哲学）', file: '想定問答_master.md' },
  { id: 'Q12', text: '所属ゼミの勉強内容（財務諸表分析・CF・データ分析）', file: '想定問答_master.md' },
  { id: 'Q13', text: 'ゼミの研究内容（個別研究テーマ＋数学統計モデル）', file: '想定問答_master.md' },
  { id: 'Q15', text: '宮西ゼミとはどんなゼミか（他との差別化）', file: '想定問答_master.md' },
  { id: 'Q19', text: 'ゼミで学んだことを三菱商事でどのように活かせるか', file: '想定問答_master.md' },
  { id: 'Q20', text: 'フィリピン（バギオPINES）に留学しようと思った理由', file: '想定問答_master.md' },
  { id: 'Q21', text: 'フィリピン留学で苦労したこと', file: '想定問答_master.md' },
  { id: 'Q22', text: 'フィリピン留学の苦労をどのように乗り越えたか', file: '想定問答_master.md' },
  { id: 'Q23', text: 'フィリピン留学で身についた力', file: '想定問答_master.md' },
  { id: 'Q24', text: 'タイ・スタディーツアー（KMITL・NTTデータ・CP）に参加する理由', file: '想定問答_master.md' },
  { id: 'Q29', text: '大学時代の部活・サークル（ワナビーマッチョ）', file: '想定問答_master.md' },
  { id: 'Q30', text: '部活・サークルで苦労したこと', file: '想定問答_master.md' },
  { id: 'Q31', text: '苦労をどのように乗り越えたか', file: '想定問答_master.md' },
  { id: 'Q32', text: '組織で目標を達成する上で大切なことは何か', file: '想定問答_master.md' },
  { id: 'Q42', text: 'あなたにとってリーダーシップとはどのようなものか', file: '想定問答_master.md' },
  { id: 'Q49', text: '大学時代に二番目に頑張ったこと（頑張った理由・苦労点・克服法）', file: '想定問答_master.md' },
  { id: 'Q51', text: '大学時代の経験を三菱商事でどのように活かせるか', file: '想定問答_master.md' },
  { id: 'Q52', text: '大学でどのような勉強に力を入れたか', file: '想定問答_master.md' },
  { id: 'Q53', text: 'どんな人なのか一言で表現（キャッチフレーズ）', file: '想定問答_master.md' },
  { id: 'Q54', text: 'そう思う理由としてのエピソード', file: '想定問答_master.md' },
  { id: 'Q57', text: '強みを10個（先の5つ以外の5つを追加）', file: '想定問答_master.md' },
  { id: 'Q60', text: '短所は何か（1つ・エピソード・向き合い方）', file: '想定問答_master.md' },
  { id: 'Q62', text: '強みを三菱商事でどのように活かせるか', file: '想定問答_master.md' },
  { id: 'Q66', text: '人生最大の挫折・試練と克服法', file: '想定問答_master.md' },
  { id: 'Q71', text: 'あなたの夢（仕事を通じて実現したい夢）', file: '想定問答_master.md' },
  { id: 'Q76', text: 'AIではできない仕事はどのようなものか', file: '想定問答_master.md' },
  { id: 'Q77', text: 'AI時代に自分が会社でどのような仕事を担えるか', file: '想定問答_master.md' },
  { id: 'Q78', text: '最近興味を持っている時事問題（2つ、商社ビジネスとの関連性）', file: '想定問答_master.md' },
  { id: 'Q81', text: '三菱商事の社員に質問したいこと（10個）', file: '想定問答_master.md' },
]

const FINANCE_S_QUESTIONS = [
  { id: 'F01', text: 'EVAを説明してください（レジュメ形式）', file: '財務問答.md' },
  { id: 'F02', text: '投資プロジェクトの評価はどのように行うか', file: '財務問答.md' },
  { id: 'F03', text: '企業価値はどのようにして推定するか（主要な方法3つ）', file: '財務問答.md' },
  { id: 'F06', text: 'CAPMについて説明してください（式を用いて）', file: '財務問答.md' },
  { id: 'F08', text: 'ベータを説明してください（式を用いて）', file: '財務問答.md' },
  { id: 'F12', text: '税効果会計・繰延税金資産・繰延税金負債を説明してください', file: '財務問答.md' },
  { id: 'F19', text: '財務諸表分析を行う際に注意すべき点は何か', file: '財務問答.md' },
  { id: 'F20', text: 'どのような観点から財務諸表を分析するか', file: '財務問答.md' },
  { id: 'F21', text: 'どのような指標で企業を評価するか（7〜10指標）', file: '財務問答.md' },
  { id: 'F26', text: '三菱商事の財務諸表を分析しましたか。改善すべき点は', file: '財務問答.md' },
  { id: 'F28', text: '三菱商事の財務諸表分析をしてどう思うか。問題はあるか', file: '財務問答.md' },
]

// ============================================================
// SSOT コンテキスト（全エージェント共通）
// ============================================================

const CONTEXT = `
あなたは qa-writer エージェントです。
以下のルールを厳守して、想定問答の回答をレジュメ形式で生成してください。

【絶対ルール】
- 回答は絶対に文章化しない。レジュメ形式（箇条書き・キーワード・階層）
- profile/facts.md の ✅実績のみ使用。⚠️は [⚠️要確認] タグ付き
- 空語禁止（「成長できる環境」「グローバルに活躍」等）
- 大和の実績と松井の実績を混同しない

【実績素材（SSOT要約）】
- TOEIC 825 ✅ / 次回900+目標
- KINTOみらいファンド50万採択 ✅（ToruTour: 観光客×地域店舗×KINTO受賞）
- kenny-bootcamp（SM-2学習アプリ・Vercel公開）✅
- company-analyzer（Claude Codeで企業分析AI）✅
- ワナビーマッチョ代表（49人加入✅・守山マルシェ腕相撲大会✅・Instagram533✅）
- フィリピン留学3.5ヶ月 ✅ / タイツアー採択確定 ✅（8/31-9/9）
- 宮西ゼミ（財務諸表分析・企業価値評価・データサイエンス）✅ / ゼミ100点 ✅
- 滋賀大学経済学部 GPA2.3（通算）→2.9（直近秋学期）✅
- かき氷屋出店 売上8万・利益3.5万 ✅
- 整体院アルバイト（大学1年から長期）✅

【JTCtrading 5観点（採点基準）】
主体性・思考力・実行力・他者理解力・再現性 各4点 計20点
16点以上: 合格 / 12点未満: 書き直し

【出力フォーマット】
### [ID] [質問タイトル]
**ステータス**: 🔄下書き | **優先度**: [S/A]

**設問意図**: [1行で]

[レジュメ形式の回答]

---
**採点**: [XX/20点] | **懸念点**: [あれば] | **深掘り予想**: [3問]
`

// ============================================================
// S級生成フェーズ
// ============================================================

phase('S級生成')

const sResults = await parallel(
  S_QUESTIONS.map(q => () =>
    agent(
      `${CONTEXT}\n\n対象質問 ID=${q.id}: 「${q.text}」\n\nこの1問だけの回答をレジュメ形式で生成してください。`,
      { label: `S:${q.id}`, phase: 'S級生成' }
    ).then(result => ({ id: q.id, file: q.file, result }))
  )
)

log(`S級生成完了: ${sResults.filter(Boolean).length}/${S_QUESTIONS.length}問`)

// ============================================================
// A級生成フェーズ
// ============================================================

phase('A級生成')

const aResults = await parallel(
  A_QUESTIONS.map(q => () =>
    agent(
      `${CONTEXT}\n\n対象質問 ID=${q.id}: 「${q.text}」\n\nこの1問だけの回答をレジュメ形式で生成してください。`,
      { label: `A:${q.id}`, phase: 'A級生成' }
    ).then(result => ({ id: q.id, file: q.file, result }))
  )
)

log(`A級生成完了: ${aResults.filter(Boolean).length}/${A_QUESTIONS.length}問`)

// ============================================================
// 財務S級生成フェーズ
// ============================================================

phase('財務S級')

const financeResults = await parallel(
  FINANCE_S_QUESTIONS.map(q => () =>
    agent(
      `${CONTEXT}\n\n対象質問 ID=${q.id}: 「${q.text}」\n\n財務・会計の専門知識問題です。宮西ゼミで学んだ内容（DCF・CAPM・3ファクターモデル・線形判別関数・財務諸表分析論Ⅱ）を活かし、式や具体例を含めてレジュメ形式で生成してください。`,
      { label: `F:${q.id}`, phase: '財務S級' }
    ).then(result => ({ id: q.id, file: q.file, result }))
  )
)

log(`財務S級生成完了: ${financeResults.filter(Boolean).length}/${FINANCE_S_QUESTIONS.length}問`)

// ============================================================
// Fact照合フェーズ（全生成分まとめてスキャン）
// ============================================================

phase('Fact照合')

const allGenerated = [...sResults, ...aResults, ...financeResults].filter(Boolean)

const verifiedResults = await agent(
  `以下の回答群を profile/facts.md の ✅実績と照合してください。

  チェック観点:
  1. ⚠️印なしで⚠️実績を使っていないか
  2. 数字の誇張がないか（TOEIC825以外のスコア等）
  3. 大和の実績と混同していないか（Web開発・システム開発は大和担当）
  4. 停止済み事業を現在進行形で語っていないか

  問題のある回答はその ID を列挙し、修正が必要な箇所を指摘してください。
  問題のない回答は「✅OK」と明記してください。

  回答数: ${allGenerated.length}問

  ${allGenerated.map(r => `[${r.id}]\n${r.result}`).join('\n\n---\n\n')}`,
  { label: 'fact-check-all', phase: 'Fact照合' }
)

log(`Fact照合完了`)

// ============================================================
// 最終レポート
// ============================================================

return {
  totalGenerated: allGenerated.length,
  sCount: sResults.filter(Boolean).length,
  aCount: aResults.filter(Boolean).length,
  financeCount: financeResults.filter(Boolean).length,
  factCheckSummary: verifiedResults,
  message: `想定問答 ${allGenerated.length}問の下書きを生成しました。interview/mitsubishi/ の各ファイルに手動で貼り付け、qa-status.md を🔄に更新してください。`,
}
