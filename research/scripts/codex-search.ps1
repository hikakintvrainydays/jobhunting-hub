# codex-search.ps1 — codex CLI を使ったウェブ検索ラッパー
# 使い方: .\research\scripts\codex-search.ps1 "検索クエリ"
# 目的: Claude Codeのコンテキストを使わずにcodex CLIに検索させる

param(
    [Parameter(Mandatory=$true)]
    [string]$Query,
    [string]$Model = "gpt-5.5",
    [string]$OutputFile = ""
)

$prompt = @"
以下のクエリについてウェブで調べ、結果を簡潔にまとめてください。
Markdown形式で出力してください。余計な前置きは不要です。

クエリ: $Query
"@

$tmpPrompt = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllText($tmpPrompt, $prompt, [System.Text.Encoding]::UTF8)

Write-Host "Searching: $Query" -ForegroundColor Cyan
Write-Host "Using model: $Model" -ForegroundColor Gray

# codex exec にstdinからプロンプトを渡す（stdin=ファイルでブロッキングを回避）
$result = Get-Content $tmpPrompt | npx @openai/codex exec --model $Model --ephemeral 2>&1

Remove-Item $tmpPrompt -ErrorAction SilentlyContinue

if ($OutputFile) {
    $result | Out-File -FilePath $OutputFile -Encoding UTF8
    Write-Host "Result saved to: $OutputFile" -ForegroundColor Green
} else {
    $result
}
