# 境界夜話 公開監査障害Issue通知 設定監査

- 正本監視: Public Reading Browser Auditが読書機能と54ページ品質監査を統合判定
- 統合Issue: public-site-incidentを1件だけ使用し、連続失敗は追記
- 旧Issue移行: site-monitoringの読書・品質Issueを統合または復旧時に自動終了
- 独立通知: Public Offline Browser Auditだけを監査別Issueで管理
- 重複防止: Public Reading Browser AuditとPublic Site Health Auditを独立通知対象から除外
- 障害判定: failure・timed_out・action_required・startup_failure・stale
- 除外結果: cancelled・skipped・neutralはIssueを作成せず、既存Issueも変更しない
- 実行制限: 同一リポジトリ・mainブランチのみ
- 外部送信: なし
- エラー: 0
- 警告: 0

## エラー

- なし

## 警告

- なし
