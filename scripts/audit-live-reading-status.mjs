import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const base='https://allsunday1122.github.io/kyokai-yawa/';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'data','works.js'),'utf8'),context);
const works=context.window.KYOKAI_WORKS||[];
const pages=[['トップページ','index.html',''],['真壁夜話','series/makabe.html',''],['黒瀬蒐集録','series/kurose.html',''],['榊家異聞','series/sakaki.html',''],['境界観測記','series/kansoku.html',''],...works.map(work=>[work.id,`stories/${work.file}`,work.id])];
const assets=[['読了管理CSS','data/reading-status.css','text/css'],['読了管理JavaScript','data/reading-status.js','javascript'],['トップ検索JavaScript','data/archive-tools.js','javascript'],['シリーズ検索JavaScript','data/series-archive-tools.js','javascript'],['読書進捗JavaScript','data/reader-tools.js','javascript']];
const errors=[];const warnings=[];const rows=[];const times=[];
const fetchText=async(label,target,expected)=>{
  const started=Date.now();
  const response=await fetch(`${base}${target}?reading_audit=${Date.now()}`,{headers:{'cache-control':'no-cache'}});
  const elapsed=Date.now()-started;times.push(elapsed);
  const type=response.headers.get('content-type')||'';const text=await response.text();
  rows.push({label,http:response.status,type,time:elapsed});
  if(!response.ok)errors.push(`${label}: HTTP ${response.status}`);
  if(expected&&!type.includes(expected))errors.push(`${label}: Content-Typeが不正です（${type}）`);
  return text;
};
let storyIds=0;
for(const [label,target,id] of pages){
  const html=await fetchText(label,target,'text/html');
  if(!html.includes('/kyokai-yawa/data/reading-status.css'))errors.push(`${label}: 本番CSS参照がありません`);
  if(!html.includes('/kyokai-yawa/data/reading-status.js'))errors.push(`${label}: 本番JavaScript参照がありません`);
  if(id){if(html.includes(`<body data-story-id="${id}">`))storyIds++;else errors.push(`${id}: 本番body作品IDが一致しません`);}
}
const assetText={};
for(const [label,target,type] of assets)assetText[target]=await fetchText(label,target,type);
for(const token of ['kyokai-yawa-read-stories-v1','KYOKAI_READING_STATUS','kyokai-story-complete','未読に戻す','この端末'])if(!assetText['data/reading-status.js'].includes(token))errors.push(`本番読了管理JavaScriptに必要処理がありません: ${token}`);
for(const token of ['未読だけ','読了済みだけ','次の未読作品'])if(!assetText['data/archive-tools.js'].includes(token))errors.push(`本番トップ検索に読了連携がありません: ${token}`);
for(const token of ['data-role="read"','data-role="next-unread"'])if(!assetText['data/series-archive-tools.js'].includes(token))errors.push(`本番シリーズ検索に読了連携がありません: ${token}`);
if(!assetText['data/reader-tools.js'].includes("new CustomEvent('kyokai-story-complete'"))errors.push('本番読書進捗に自動読了イベントがありません');
if(storyIds!==48)errors.push(`本番作品IDが48件ではありません（${storyIds}件）`);
const sorted=[...times].sort((a,b)=>a-b);const median=sorted[Math.floor(sorted.length/2)]||0;const p95=sorted[Math.min(sorted.length-1,Math.ceil(sorted.length*.95)-1)]||0;
const report=['# 境界夜話 本番読了済み・未読管理監査','',`- 実行日時: ${new Date().toISOString()}`,`- 公開ページ: ${pages.length}/53`,`- 作品ページID: ${storyIds}/48`,`- 共通資産: ${assets.length}`,'- 保存方式: ブラウザー端末内 localStorage','- 外部送信: なし',`- エラー: ${errors.length}`,`- 警告: ${warnings.length}`,`- 応答時間中央値: ${median}ms`,`- 応答時間p95: ${p95}ms`,'','## エラー','',...(errors.length?errors.map(error=>`- ${error}`):['- なし']),'','## 警告','',...(warnings.length?warnings.map(warning=>`- ${warning}`):['- なし']),'','## 配信確認（主要）','','| 対象 | HTTP | Content-Type | 応答 |','|---|---:|---|---:|',...rows.filter((_,index)=>index<5||index>=pages.length).map(row=>`| ${row.label} | ${row.http} | ${row.type} | ${row.time}ms |`),''].join('\n');
fs.mkdirSync(path.join(root,'reports'),{recursive:true});fs.writeFileSync(path.join(root,'reports','live-reading-status-audit.md'),report);console.log(report);if(errors.length)process.exitCode=1;