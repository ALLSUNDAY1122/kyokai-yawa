# 境界夜話 公開サイト オフライン・PWA 実ブラウザー監査

- 実行日時: 2026-08-29T23:37:09.539Z
- 実行対象: https://allsunday1122.github.io/kyokai-yawa/
- 実行環境: chromium-desktop / webkit-mobile
- 対象操作: Service Worker登録・事前保存・閲覧済み作品再読・未保存ページのオフライン案内・読書記録のオフライン表示・manifest/icon配信
- 通信遮断検証: Chromiumは実際のオフライン画面遷移、WebKitはPlaywright内部エラー回避のためService WorkerのCache Storage応答本文と依存資産を直接検証
- テスト領域: 実行ごとに独立したブラウザー保存領域
- テスト結果: passed
- 成功: 10
- 失敗: 0
- スキップ: 0
- 所要時間: 20.6秒

## ケース別結果

| ブラウザー | テスト | 結果 | 時間 |
|---|---|---:|---:|
| chromium-desktop | offline-pwa.spec.mjs › manifestとアプリアイコンが公開されている | passed | 1032ms |
| chromium-desktop | offline-pwa.spec.mjs › Service Workerが登録され、PWA共通資産を事前保存する | passed | 1357ms |
| chromium-desktop | offline-pwa.spec.mjs › 一度開いた作品を通信遮断後も本文付きで再読できる | passed | 1159ms |
| chromium-desktop | offline-pwa.spec.mjs › 未保存の作品は通信遮断時にオフライン案内を表示する | passed | 921ms |
| chromium-desktop | offline-pwa.spec.mjs › 読書記録ページを未訪問でもオフラインで開ける | passed | 1048ms |
| webkit-mobile | offline-pwa.spec.mjs › manifestとアプリアイコンが公開されている | passed | 1417ms |
| webkit-mobile | offline-pwa.spec.mjs › Service Workerが登録され、PWA共通資産を事前保存する | passed | 7061ms |
| webkit-mobile | offline-pwa.spec.mjs › 一度開いた作品を通信遮断後も本文付きで再読できる | passed | 1235ms |
| webkit-mobile | offline-pwa.spec.mjs › 未保存の作品は通信遮断時にオフライン案内を表示する | passed | 1188ms |
| webkit-mobile | offline-pwa.spec.mjs › 読書記録ページを未訪問でもオフラインで開ける | passed | 1160ms |

## エラー

- なし
