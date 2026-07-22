# 境界夜話 読書機能 実ブラウザー監査

- 実行日時: 2026-07-22T22:30:30.656Z
- 実行対象: ローカル生成サイト
- 実行環境: chromium-desktop / webkit-mobile
- 対象操作: 読了切替・あとで読む・途中位置保存/再開・自動読了・次の未読・JSON書き出し/追加復元/置換復元・不正JSON拒否・画面反映
- Service Worker: 試験中は無効化し、現在配信中のHTML・JavaScriptを直接検証
- テスト結果: passed
- 成功: 17
- 失敗: 0
- スキップ: 1
- 所要時間: 26.5秒

## ケース別結果

| ブラウザー | テスト | 結果 | 時間 |
|---|---|---:|---:|
| chromium-desktop | reading-backup.spec.mjs › JSON書き出しに読了・履歴・保存・途中位置・文字サイズを収録する | passed | 720ms |
| chromium-desktop | reading-backup.spec.mjs › モバイル幅でバックアップ操作が横にはみ出さずタップできる | skipped | 250ms |
| chromium-desktop | reading-backup.spec.mjs › 壊れたJSONを拒否し、現在の記録を変更しない | passed | 577ms |
| chromium-desktop | reading-backup.spec.mjs › 未知の作品IDを含むJSONを拒否し、復元確認を表示しない | passed | 559ms |
| chromium-desktop | reading-backup.spec.mjs › 置換復元で旧記録と旧途中位置を消し、バックアップ状態だけを表示する | passed | 1352ms |
| chromium-desktop | reading-backup.spec.mjs › 追加復元で現在記録を残し、より進んだ途中位置と画面件数を反映する | passed | 1390ms |
| chromium-desktop | reading-state.spec.mjs › 作品ページの読了とあとで読むを切り替え、読書記録へ即時反映する | passed | 1172ms |
| chromium-desktop | reading-state.spec.mjs › 本文末尾で自動読了し、途中位置を削除して次の未読作品へ進める | passed | 2026ms |
| chromium-desktop | reading-state.spec.mjs › 途中位置を保存し、ボタンとresume=1の両方から再開する | passed | 1078ms |
| webkit-mobile | reading-backup.spec.mjs › JSON書き出しに読了・履歴・保存・途中位置・文字サイズを収録する | passed | 4784ms |
| webkit-mobile | reading-backup.spec.mjs › モバイル幅でバックアップ操作が横にはみ出さずタップできる | passed | 612ms |
| webkit-mobile | reading-backup.spec.mjs › 壊れたJSONを拒否し、現在の記録を変更しない | passed | 616ms |
| webkit-mobile | reading-backup.spec.mjs › 未知の作品IDを含むJSONを拒否し、復元確認を表示しない | passed | 638ms |
| webkit-mobile | reading-backup.spec.mjs › 置換復元で旧記録と旧途中位置を消し、バックアップ状態だけを表示する | passed | 1404ms |
| webkit-mobile | reading-backup.spec.mjs › 追加復元で現在記録を残し、より進んだ途中位置と画面件数を反映する | passed | 1598ms |
| webkit-mobile | reading-state.spec.mjs › 作品ページの読了とあとで読むを切り替え、読書記録へ即時反映する | passed | 2420ms |
| webkit-mobile | reading-state.spec.mjs › 本文末尾で自動読了し、途中位置を削除して次の未読作品へ進める | passed | 1159ms |
| webkit-mobile | reading-state.spec.mjs › 途中位置を保存し、ボタンとresume=1の両方から再開する | passed | 1441ms |

## エラー

- なし
