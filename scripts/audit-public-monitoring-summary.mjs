import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const errors=[];
const warnings=[];
const required=[
  'scripts/update-public-monitoring-summary.mjs',
  '.github/workflows/public-monitoring-summary.yml',
  'reports/public-monitoring-history.json',
  'reports/public-monitoring-summary.md',
];
for(const file of required)if(!fs.existsSync(path.join(root,file)))errors.push(`${file}が存在しません`);

const workflow=fs.existsSync(path.join(root,'.github/workflows/public-monitoring-summary.yml'))?fs.readFileSync(path.join(root,'.github/workflows/public-monitoring-summary.yml'),'utf8'):'';
for(const [token,label] of [
  ["- 'Public Reading Browser Audit'",'読書・品質監査連携'],
  ["- 'Public Offline Browser Audit'",'オフライン監査連携'],
  ["- 'Public Audit Incident Notification'",'障害通知設定連携'],
  ["cron: '30 22 * * *'",'毎日07:30 JST実行'],
  ['timeout-minutes: 5','実行時間上限'],
  ['cancel-in-progress: true','重複実行停止'],
  ['reports/public-monitoring-history.json','履歴JSON保存'],
  ['reports/public-monitoring-summary.md','要約保存'],
])if(!workflow.includes(token))errors.push(`${label}がありません`);

let history=null;
try{history=JSON.parse(fs.readFileSync(path.join(root,'reports/public-monitoring-history.json'),'utf8'));}catch{errors.push('履歴JSONを解析できません');}
if(history){
  if(history.version!==1)errors.push('履歴JSONのversionが1ではありません');
  if(!Array.isArray(history.entries))errors.push('履歴JSONのentriesが配列ではありません');
  else{
    const keys=new Set();
    const counts={};
    for(const entry of history.entries){
      if(!entry.kind||!entry.executedAt||!['passed','failed'].includes(entry.status))errors.push('履歴に必須項目がない行があります');
      const key=`${entry.kind}:${entry.executedAt}`;
      if(keys.has(key))errors.push(`履歴が重複しています: ${key}`);
      keys.add(key);
      counts[entry.kind]=(counts[entry.kind]||0)+1;
    }
    for(const [kind,count] of Object.entries(counts))if(count>30)errors.push(`${kind}の履歴が30件を超えています（${count}件）`);
  }
}

const summary=fs.existsSync(path.join(root,'reports/public-monitoring-summary.md'))?fs.readFileSync(path.join(root,'reports/public-monitoring-summary.md'),'utf8'):'';
for(const token of ['# 境界夜話 公開監視サマリー','- 総合状態:','## 最新状態','## 直近20件','## 判定'])if(!summary.includes(token))errors.push(`要約に必要な項目がありません: ${token}`);
if(summary.includes('- 総合状態: 要確認'))warnings.push('最新監査に要確認状態があります');

const report=[
  '# 境界夜話 公開監視履歴・要約 設定監査',
  '',
  '- 連携監査: 読書・54ページ品質 / オフラインPWA / 障害Issue通知設定',
  '- 定期更新: 毎日07:30 JSTおよび各監査完了後',
  '- 履歴保持: 監査ごとに直近30回',
  '- 重複排除: 監査種別と実行日時の組み合わせ',
  '- 最新表示: 状態・成功・失敗・警告・所要時間・連続成功回数',
  `- エラー: ${errors.length}`,
  `- 警告: ${warnings.length}`,
  '',
  '## エラー','',...(errors.length?errors.map(value=>`- ${value}`):['- なし']),
  '',
  '## 警告','',...(warnings.length?warnings.map(value=>`- ${value}`):['- なし']),
  '',
].join('\n');
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports','public-monitoring-summary-audit.md'),report);
console.log(report);
if(errors.length)process.exitCode=1;
