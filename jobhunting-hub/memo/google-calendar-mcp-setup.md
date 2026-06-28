# Google Calendar MCP セットアップ手順

他のプロジェクトでも `mcp-google-calendar` を使えるようにするための手順書。

他のプロジェクトで使いたいときは手順書の Step 4 だけやれば OK（token は共通）。

## 前提

- Node.js / npx が使える
- Google Cloud Console へのアクセス権がある（kihamu2104@gmail.com）
- 対象プロジェクト: `studied-setting-472505-u0`（jobhunting-hub）

---

## Step 1 — Google Cloud Console でテストユーザーを追加

アプリが「テストモード」のため、使用するGoogleアカウントを明示的に許可する必要がある。

1. 以下のURLを開く:
   `https://console.cloud.google.com/auth/audience?project=studied-setting-472505-u0`

2. 左サイドバー → **「対象（Audience）」** をクリック

3. **「テストユーザー」** セクション → **「+ Add users」**

4. 使用するGoogleアカウントのメールアドレスを入力して保存
   - 例: `kihamu2104@gmail.com`

---

## Step 2 — credentials.json を配置

`credentials.json` は Google Cloud Console からダウンロード済みのものを使う。

保存先（共通):
```
C:/Users/kiham/.config/mcp-google-calendar/credentials.json
```

> 別プロジェクトでも同じ credentials.json・同じ Cloud Project を使い回せる。

---

## Step 3 — 手動認証でトークンを生成

新しい PowerShell ウィンドウで実行:

```powershell
$env:CREDENTIALS_PATH = "C:/Users/kiham/.config/mcp-google-calendar/credentials.json"
npx -y mcp-google-calendar
```

- ブラウザが自動で開く → Googleアカウントでログイン → 「続行」→ 「許可」
- 完了すると以下にトークンが生成される:
  ```
  C:/Users/kiham/.config/mcp-google-calendar/mcp-google-calendar-token.json
  ```

確認コマンド:
```powershell
Test-Path "C:/Users/kiham/.config/mcp-google-calendar/mcp-google-calendar-token.json"
# True が返れば成功
```

---

## Step 4 — プロジェクトの .mcp.json に追加

対象プロジェクトの `.mcp.json` の `mcpServers` に追記:

```json
"google-calendar": {
  "command": "npx",
  "args": ["-y", "mcp-google-calendar"],
  "env": {
    "CREDENTIALS_PATH": "C:/Users/kiham/.config/mcp-google-calendar/credentials.json"
  }
}
```

---

## Step 5 — Claude Code を再起動

Claude Code を完全に再起動すると google-calendar ツールがツール一覧に表示される。

---

## トラブルシューティング

| 症状 | 原因 | 対処 |
|---|---|---|
| `403 access_denied` | テストユーザー未登録 | Step 1 を再確認 |
| ブラウザが開かない・ハングする | MCP サーバーが stdin 待ち | 新しい PowerShell ウィンドウで実行する |
| `token.json` が見当たらない | ファイル名が違う | 正しいファイル名は `mcp-google-calendar-token.json` |
| 起動のたびにブラウザが開く | token が生成されていない | Step 3 を完走させる |

---

## 参考

- Cloud Project ID: `studied-setting-472505-u0`
- App 名: `jobhunting-hub`
- credentials.json の redirect_uri: `http://localhost`
- token 保存先: credentials.json と同じディレクトリ
