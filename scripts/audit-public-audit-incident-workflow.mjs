import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const workflowPath='.github/workflows/public-audit-incident.yml';
const integratedPath='.github/workflows/reading-public-browser-audit.yml';
const managerPath='scripts/public-audit-incident.mjs';
const errors=[];
const warnings=[];

for(const file of [workflowPath,integratedPath,managerPath])if(!fs.existsSync(path.join(root,file)))errors.push(`${file}が存在しません`);
const workflow=fs.existsSync(path.join(root,workflowPath))?read(workflowPath):'';
const integrated=fs.existsSync(path.join(root,integratedPath))?read(integratedPath):'';
const manager=fs.existsSync(path.join(root,managerPath))?read(managerPath):'';

const offlineRequirements=[
  ['name: Public Audit Incident Notification','独立通知ワークフロー名'],
  ["- 'Public Offline Browser Audit'",'オフラインPWA監査トリガー'],
  ['types: [completed]','完了時トリガー'],
  ['issues: write','Issue更新権限'],
  ['actions: read','Actions参照権限'],
  ['contents: write','設定監査レポート保存権限'],
  ["head_repository.full_name == github.repository",'同一リポジトリ制限'],
  ["head_branch == 'main'",'mainブランチ制限'],
  ['const title=`[監視] 境界夜話 ${run.name} 失敗`','オフライン監査Issueタイトル'],
  ["const label='site-monitoring'",'固定監視ラベル'],
  ["new Set(['failure','timed_out','action_required','startup_failure','stale'])",'実障害の結論一覧'],
  ['const isIncident=incidentConclusions.has(run.conclusion)','実障害判定'],
  ["run.conclusion==='success'&&incident",'成功時だけの復旧判定'],
  ['障害判定から除外しました。Issueは変更しません。','除外結果の非通知処理'],
  ['github.rest.issues.create','障害Issue作成'],
  ['github.rest.issues.createComment','連続失敗・復旧コメント'],
  ["state:'closed'",'復旧時のIssueクローズ'],
  ['github.rest.issues.createLabel','監視ラベル自動作成'],
  ['github.paginate','既存Issueの全件確認'],
  ['cancel-in-progress: false','障害・復旧イベントの直列処理'],
  ['reports/public-audit-incident-workflow-audit.md','設定監査レポート'],
];
for(const [fragment,label] of offlineRequirements)if(!workflow.includes(fragment))errors.push(`${label}がありません`);

for(const duplicate of ["- 'Public Reading Browser Audit'","- 'Public Site Health Audit'"]){
  if(workflow.includes(duplicate))errors.push(`統合監査と重複する独立通知トリガーが残っています: ${duplicate}`);
}

const integratedRequirements=[
  ['name: Public Reading Browser Audit','統合監査ワークフロー'],
  ['issues: write','統合監査のIssue更新権限'],
  ['Open or resolve public site incident','統合Issue管理工程'],
  ['managePublicAuditIncident','統合Issue管理関数'],
  ["steps.tests.outcome == 'failure' || steps.health.outcome == 'failure'",'読書または品質監査の失敗判定'],
  ["steps.tests.outcome == 'success' && steps.health.outcome == 'success'",'両監査成功時の復旧判定'],
];
for(const [fragment,label] of integratedRequirements)if(!integrated.includes(fragment))errors.push(`${label}がありません`);

const managerRequirements=[
  ["INCIDENT_LABEL='public-site-incident'",'統合障害ラベル'],
  ["INCIDENT_MARKER='<!-- public-site-audit-incident -->'",'統合Issueマーカー'],
  ["LEGACY_INCIDENT_LABEL='site-monitoring'",'旧監視ラベル認識'],
  ["LEGACY_INCIDENT_MARKER='<!-- kyokai-public-audit-incident -->'",'旧Issueマーカー認識'],
  ["action:'migrated'",'旧Issueの統合移行'],
  ["action:incidents.all.length===1?'closed':'closed-multiple'",'統合・旧Issueの一括復旧'],
  ['closeLegacyDuplicates','旧重複Issue終了処理'],
];
for(const [fragment,label] of managerRequirements)if(!manager.includes(fragment))errors.push(`${label}がありません`);

const createCount=(workflow.match(/github\.rest\.issues\.create\(/g)||[]).length;
if(createCount!==1)errors.push(`オフラインIssue作成処理が1件ではありません（${createCount}件）`);
if(!workflow.includes("issues.find(issue=>!issue.pull_request&&issue.title===title)"))errors.push('同じオフライン監査の既存Issueを再利用する処理がありません');
if(!workflow.includes('if(incident)'))errors.push('連続失敗を既存Issueへ追記する分岐がありません');
if(!workflow.includes("else if(run.conclusion==='success'&&incident)"))errors.push('正常復旧時だけ該当Issueを閉じる分岐がありません');
if(workflow.includes("run.conclusion!=='success'"))errors.push('cancelled・skippedを含む全非success判定が残っています');
if(workflow.includes('pull_request_target')||integrated.includes('pull_request_target'))errors.push('pull_request_targetを使用しています');

const report=[
  '# 境界夜話 公開監査障害Issue通知 設定監査',
  '',
  '- 正本監視: Public Reading Browser Auditが読書機能と54ページ品質監査を統合判定',
  '- 統合Issue: public-site-incidentを1件だけ使用し、連続失敗は追記',
  '- 旧Issue移行: site-monitoringの読書・品質Issueを統合または復旧時に自動終了',
  '- 独立通知: Public Offline Browser Auditだけを監査別Issueで管理',
  '- 重複防止: Public Reading Browser AuditとPublic Site Health Auditを独立通知対象から除外',
  '- 障害判定: failure・timed_out・action_required・startup_failure・stale',
  '- 除外結果: cancelled・skipped・neutralはIssueを作成せず、既存Issueも変更しない',
  '- 実行制限: 同一リポジトリ・mainブランチのみ',
  '- 外部送信: なし',
  `- エラー: ${errors.length}`,
  `- 警告: ${warnings.length}`,
  '',
  '## エラー',
  '',
  ...(errors.length?errors.map(error=>`- ${error}`):['- なし']),
  '',
  '## 警告',
  '',
  ...(warnings.length?warnings.map(warning=>`- ${warning}`):['- なし']),
  '',
].join('\n');

fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports','public-audit-incident-workflow-audit.md'),report);
console.log(report);
if(errors.length)process.exitCode=1;
