import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const href='/kyokai-yawa/data/accessibility-contrast.css';
const files=['reading-log.html',...['makabe.html','kurose.html','sakaki.html','kansoku.html'].map(file=>path.join('series',file))];
const errors=[];
const warnings=[];

for(const file of files){
  const filePath=path.join(root,file);
  if(!fs.existsSync(filePath)){errors.push(`${file}: HTMLが存在しません`);continue;}
  const html=fs.readFileSync(filePath,'utf8');
  const refs=(html.match(/\/kyokai-yawa\/data\/accessibility-contrast\.css/g)||[]).length;
  if(refs!==1)errors.push(`${file}: 配色補正CSS参照が1件ではありません（${refs}件）`);
}

const cssPath=path.join(root,'data','accessibility-contrast.css');
const css=fs.existsSync(cssPath)?fs.readFileSync(cssPath,'utf8'):'';
if(!css)errors.push('配色補正CSSが存在しません');
for(const token of ['color-scheme:dark','-webkit-text-fill-color','#eee6d8','.reading-log-page','@media(max-width:620px)'])if(!css.includes(token))errors.push(`配色補正CSSに必要定義がありません: ${token}`);
if(!css.includes('.series-tools select'))errors.push('シリーズ選択欄の配色補正がありません');
if(!css.includes('.reading-log-page .log-tools select'))errors.push('読書記録選択欄の配色補正がありません');

const workerPath=path.join(root,'service-worker.js');
if(fs.existsSync(workerPath)){
  const worker=fs.readFileSync(workerPath,'utf8');
  if(!worker.includes('data/accessibility-contrast.css'))warnings.push('Service Workerの事前保存対象に配色補正CSSがありません');
}

const report=[
  '# 境界夜話 配色補正CSS参照監査',
  '',
  `- 対象ページ: ${files.length}/5`,
  '- 読書記録ページ: 1',
  '- シリーズページ: 4',
  '- WebKit選択欄: dark color-scheme・明色文字を強制',
  '- モバイル読書記録: 暗色背景を強制',
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
fs.writeFileSync(path.join(root,'reports','accessibility-contrast-assets-audit.md'),report);
console.log(report);
if(errors.length)process.exitCode=1;
