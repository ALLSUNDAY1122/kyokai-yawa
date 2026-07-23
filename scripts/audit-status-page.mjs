import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const errors=[];
const warnings=[];
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const exists=file=>fs.existsSync(path.join(root,file));
for(const file of ['status.html','data/status.css','data/status.js','reports/public-monitoring-history.json'])if(!exists(file))errors.push(`${file}が存在しません`);

const context={window:{}};
vm.runInNewContext(read('data/works.js'),context);
const works=context.window.KYOKAI_WORKS||[];
if(works.length!==48)errors.push(`公開作品が48話ではありません（${works.length}話）`);

const linkedPages=[['トップ','index.html'],['読書記録','reading-log.html'],...['makabe.html','kurose.html','sakaki.html','kansoku.html'].map(file=>[`series/${file}`,`series/${file}`]),...works.map(work=>[work.id,`stories/${work.file}`])];
for(const [label,file] of linkedPages){
  if(!exists(file)){errors.push(`${label}: ページが存在しません`);continue;}
  const html=read(file);
  const links=(html.match(/href=["']\/kyokai-yawa\/status\.html["']/g)||[]).length;
  if(links!==1)errors.push(`${label}: 運用状況リンクが1件ではありません（${links}件）`);
}
if(linkedPages.length!==54)errors.push(`導線確認ページが54件ではありません（${linkedPages.length}件）`);

if(exists('status.html')){
  const html=read('status.html');
  const required=[
    '<title>運用状況｜境界夜話</title>',
    'name="robots" content="noindex,follow"',
    'href="https://allsunday1122.github.io/kyokai-yawa/status.html"',
    'href="/kyokai-yawa/data/status.css"',
    'src="/kyokai-yawa/data/status.js"',
    'data-status-page','data-status-overall','data-status-updated','data-status-grid','data-status-history','data-status-message','aria-live="polite"',
  ];
  for(const token of required)if(!html.includes(token))errors.push(`status.htmlに必要要素がありません: ${token}`);
  if((html.match(/aria-current="page"[^>]*href="\/kyokai-yawa\/status\.html"/g)||[]).length!==1)errors.push('status.htmlの現在ページ表示が不正です');
}

if(exists('data/status.js')){
  const js=read('data/status.js');
  const required=["const SOURCE='/kyokai-yawa/reports/public-monitoring-history.json'","expectedKinds=['reading','site-health','offline','incident-config']","cache:'no-store'","credentials:'same-origin'",'5*60*1000','visibilitychange','Asia/Tokyo','data.monitoringState'];
  for(const token of required)if(!js.includes(token))errors.push(`status.jsに必要処理がありません: ${token}`);
  if(js.includes('XMLHttpRequest'))errors.push('status.jsがXMLHttpRequestを含んでいます');
  const external=[...js.matchAll(/https?:\/\/[^'"`\s)]+/g)].map(match=>match[0]);
  if(external.length)errors.push(`status.jsが外部URLを含んでいます: ${external.join(', ')}`);
}

let latest=[];
if(exists('reports/public-monitoring-history.json')){
  try{
    const history=JSON.parse(read('reports/public-monitoring-history.json'));
    if(history.version!==1)errors.push(`監視履歴versionが1ではありません（${String(history.version)}）`);
    if(!Array.isArray(history.entries))errors.push('監視履歴entriesが配列ではありません');
    else{
      const kinds=['reading','site-health','offline','incident-config'];
      const sorted=[...history.entries].sort((a,b)=>Date.parse(b.executedAt||0)-Date.parse(a.executedAt||0));
      latest=kinds.map(kind=>sorted.find(entry=>entry.kind===kind)).filter(Boolean);
      if(latest.length!==4)errors.push(`最新監視種別が4件そろっていません（${latest.length}件）`);
      for(const entry of latest){
        if(entry.status!=='passed'||Number(entry.failed||0)!==0)warnings.push(`${entry.label||entry.kind}: 最新状態が正常ではありません`);
      }
    }
  }catch(error){errors.push(`監視履歴JSONを解析できません: ${error.message}`);}
}

if(exists('scripts/normalize-reading-log.mjs')){
  const normalizer=read('scripts/normalize-reading-log.mjs');
  if(!normalizer.includes('<a href="/kyokai-yawa/status.html">運用状況</a>'))errors.push('読書記録正規化に運用状況導線がありません');
}

const report=['# 境界夜話 運用状況ページ監査','',`- 導線: ${linkedPages.length}/54ページ`,'- 運用状況ページ: 1','- 監視種別: 読書機能・54ページ品質・オフラインPWA・障害Issue通知','- データ取得: 同一サイト内JSON・no-store','- 自動更新: 5分ごと・タブ復帰時','- 検索登録: noindex,follow',`- 最新正常監視: ${latest.filter(entry=>entry.status==='passed'&&Number(entry.failed||0)===0).length}/4`,`- エラー: ${errors.length}`,`- 警告: ${warnings.length}`,'','## エラー','',...(errors.length?errors.map(error=>`- ${error}`):['- なし']),'','## 警告','',...(warnings.length?warnings.map(warning=>`- ${warning}`):['- なし']),''].join('\n');
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports','status-page-audit.md'),report);
console.log(report);
if(errors.length)process.exitCode=1;