import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root=process.cwd();
const errors=[];
const warnings=[];
const read=file=>fs.existsSync(path.join(root,file))?fs.readFileSync(path.join(root,file),'utf8'):'';
const builderPath='scripts/build-public-audit-performance-diagnostics.mjs';
const workflowPath='.github/workflows/public-audit-weekly-summary.yml';
const diagnosticsPath='reports/public-audit-performance-diagnostics.json';
const builder=read(builderPath);
const workflow=read(workflowPath);
const diagnosticsText=read(diagnosticsPath);

for(const [file,text] of [[builderPath,builder],[workflowPath,workflow],[diagnosticsPath,diagnosticsText]])if(!text)errors.push(`${file}が存在しないか空です`);

const builderTokens=[
  'kyokai-public-audit-performance-diagnostics-v1',
  "['diff','--name-status'",
  "['log','--reverse'",
  "['rev-parse',`${reportCommit}^`]",
  'baseCommit',
  'headCommit',
  'siteFileCount',
  'monitoringFileCount',
  'maxCommits=20',
  'maxFiles=40',
  "process.argv.includes('--self-test')",
  'performance.totals?.retryDegraded',
  'source.durationDegraded',
];
for(const token of builderTokens)if(!builder.includes(token))errors.push(`差分診断処理に必要な定義がありません: ${token}`);

const workflowTokens=[
  'node scripts/build-public-audit-performance-diagnostics.mjs',
  'node scripts/build-public-audit-performance-diagnostics.mjs --self-test',
  'node scripts/audit-public-audit-performance-diagnostics.mjs',
  'reports/public-audit-performance-diagnostics.json',
  'reports/public-audit-performance-diagnostics-audit.md',
  "const diagnostics=JSON.parse",
  '### 推定変更範囲',
  'window.commits',
  'window.files',
];
for(const token of workflowTokens)if(!workflow.includes(token))errors.push(`週次ワークフローに差分診断連携がありません: ${token}`);

let diagnostics=null;
try{diagnostics=JSON.parse(diagnosticsText);}catch{errors.push('差分診断JSONを解析できません');}
if(diagnostics){
  if(diagnostics.schema!=='kyokai-public-audit-performance-diagnostics-v1')errors.push('差分診断JSONのschemaが不正です');
  if(typeof diagnostics.breached!=='boolean')errors.push('差分診断JSONに性能判定がありません');
  if(!Array.isArray(diagnostics.windows))errors.push('差分診断JSONに比較区間配列がありません');
  if(diagnostics.limits?.commits!==20||diagnostics.limits?.files!==40)errors.push('Issue添付件数の上限が不正です');
  if(diagnostics.breached&&!diagnostics.windows.length)errors.push('性能基準超過時の比較区間がありません');
  if(!diagnostics.breached&&diagnostics.windows.length)warnings.push('性能基準内ですが比較区間が生成されています');
  for(const window of diagnostics.windows||[]){
    if(!window.baseCommit||!window.headCommit)errors.push(`${window.label||window.kind}: 比較コミットがありません`);
    if(!Array.isArray(window.commits)||!Array.isArray(window.files))errors.push(`${window.label||window.kind}: コミットまたはファイル一覧がありません`);
    if(window.commits?.length>20||window.files?.length>40)errors.push(`${window.label||window.kind}: Issue添付上限を超えています`);
    if(!Number.isInteger(window.siteFileCount)||!Number.isInteger(window.monitoringFileCount))errors.push(`${window.label||window.kind}: ファイル分類件数が不正です`);
  }
}

try{
  const sample=execFileSync(process.execPath,[builderPath,'--self-test'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']});
  const parsed=JSON.parse(sample);
  if(!parsed.selfTest||!parsed.windows?.length)errors.push('差分診断の自己試験で比較区間を生成できません');
  const window=parsed.windows?.[0];
  if(!window?.baseCommit||!window?.headCommit)errors.push('差分診断の自己試験に比較コミットがありません');
}catch(error){
  errors.push(`差分診断の自己試験に失敗しました: ${error instanceof Error?error.message:String(error)}`);
}

const report=[
  '# 境界夜話 公開監査 性能劣化Issue差分診断監査',
  '',
  '- 比較基準: 直近の正常監査から基準超過監査まで',
  '- 比較対象: 監査結果コミットの直前にある実試験済みサイト状態',
  '- 関連コミット上限: 20件/区間',
  '- 変更ファイル上限: 40件/区間',
  '- ファイル分類: サイト・テスト本体 / 監視・レポート系',
  '- Issue添付: 比較コミット・関連コミット・変更ファイル・省略件数',
  `- 現在の性能判定: ${diagnostics?.breached?'要確認':'正常'}`,
  `- 現在の比較区間: ${diagnostics?.windows?.length||0}件`,
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
fs.writeFileSync(path.join(root,'reports','public-audit-performance-diagnostics-audit.md'),report);
console.log(report);
if(errors.length)process.exitCode=1;
