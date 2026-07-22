import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const context={window:{}};
const worksPath=path.join(root,'data','works.js');
vm.runInNewContext(fs.readFileSync(worksPath,'utf8'),context,{filename:worksPath});
const works=context.window.KYOKAI_WORKS||[];
const seriesFiles=['makabe.html','kurose.html','sakaki.html','kansoku.html'];
const pages=[path.join(root,'index.html'),...seriesFiles.map(file=>path.join(root,'series',file)),...works.map(work=>path.join(root,'stories',work.file))];
const savedJs=fs.readFileSync(path.join(root,'data','saved-stories.js'),'utf8');
const savedCss=fs.readFileSync(path.join(root,'data','saved-stories.css'),'utf8');
const archiveJs=fs.readFileSync(path.join(root,'data','archive-tools.js'),'utf8');
const seriesJs=fs.readFileSync(path.join(root,'data','series-archive-tools.js'),'utf8');
const homeJs=fs.readFileSync(path.join(root,'data','home-personalization.js'),'utf8');
const homeNormalize=fs.readFileSync(path.join(root,'scripts','normalize-home-personalization.mjs'),'utf8');
const errors=[];const warnings=[];
const count=(text,pattern)=>(text.match(pattern)||[]).length;

if(works.length!==48)errors.push(`作品データが48件ではありません（${works.length}件）`);
let styled=0,scripted=0,storyIds=0;
for(const file of pages){
  if(!fs.existsSync(file)){errors.push(`${path.relative(root,file)}: ファイルがありません`);continue;}
  const html=fs.readFileSync(file,'utf8');
  const relative=path.relative(root,file);
  const styleCount=count(html,/\/kyokai-yawa\/data\/saved-stories\.css/g);
  const scriptCount=count(html,/\/kyokai-yawa\/data\/saved-stories\.js/g);
  if(styleCount!==1)errors.push(`${relative}: 保存管理CSS参照が1件ではありません（${styleCount}件）`);else styled++;
  if(scriptCount!==1)errors.push(`${relative}: 保存管理JavaScript参照が1件ではありません（${scriptCount}件）`);else scripted++;
  if(relative==='index.html'){
    if(!html.includes('data-personal-saved'))errors.push('index.html: あとで読む個別化欄がありません');
    if(html.indexOf('saved-stories.js')>html.indexOf('home-personalization.js'))errors.push('index.html: 保存管理が個別化処理より後に読み込まれます');
    if(html.indexOf('saved-stories.js')>html.indexOf('archive-tools.js'))errors.push('index.html: 保存管理が一覧検索より後に読み込まれます');
  }else if(relative.startsWith('series/')){
    if(html.indexOf('saved-stories.js')>html.indexOf('series-archive-tools.js'))errors.push(`${relative}: 保存管理がシリーズ検索より後に読み込まれます`);
  }else if(relative.startsWith('stories/')){
    const work=works.find(item=>relative.endsWith(item.file));
    if(work&&html.includes(`data-story-id="${work.id}"`))storyIds++;else errors.push(`${relative}: 作品IDが一致しません`);
    if(html.indexOf('saved-stories.js')>html.indexOf('reader-tools.js'))warnings.push(`${relative}: 保存管理が読書進捗より後に読み込まれます`);
  }
}
for(const token of ['kyokai-yawa-saved-stories-v1','savedAt','getSavedIds','isSaved','setSaved','toggle','kyokai-saved-stories-change','data-toggle-saved','あとで読むに保存'])if(!savedJs.includes(token))errors.push(`保存管理処理がありません: ${token}`);
for(const risky of ['fetch(','sendBeacon','XMLHttpRequest','WebSocket'])if(savedJs.includes(risky))errors.push(`保存管理JavaScriptに外部通信処理が含まれています: ${risky}`);
if(!savedJs.includes('localStorage.getItem')||!savedJs.includes('localStorage.setItem'))errors.push('localStorage保存処理がありません');
if(!savedCss.includes('.save-story-button')||!savedCss.includes('.saved-story-badge')||!savedCss.includes('@media(max-width:620px)'))errors.push('保存ボタン・バッジ・スマートフォン向けCSSが不足しています');
for(const token of ['savedOptions','matchesSaved','params.get(\'saved\')','kyokai-saved-stories-change'])if(!archiveJs.includes(token))errors.push(`トップ一覧の保存絞り込み処理がありません: ${token}`);
for(const token of ['data-role="saved"','matchesSaved','params.get(\'saved\')','kyokai-saved-stories-change'])if(!seriesJs.includes(token))errors.push(`シリーズ一覧の保存絞り込み処理がありません: ${token}`);
for(const token of ['savedApi','data-personal-saved','getSavedIds','kyokai-saved-stories-change'])if(!homeJs.includes(token))errors.push(`個別化欄の保存作品処理がありません: ${token}`);
if(!homeNormalize.includes('data-personal-saved'))errors.push('個別化欄の正規化処理にあとで読むがありません');
if(styled!==53||scripted!==53)errors.push(`共通資産の対象が53ページではありません（CSS ${styled}/JS ${scripted}）`);
if(storyIds!==48)errors.push(`作品ID確認が48件ではありません（${storyIds}件）`);

const report=['# 境界夜話 あとで読む管理監査','',`- 対象ページ: ${pages.length}/53`,`- CSS参照: ${styled}/53`,`- JavaScript参照: ${scripted}/53`,`- 作品ページID: ${storyIds}/48`,'- 登録・解除: 作品ページのボタン','- 一覧表示: 保存済みバッジ','- 絞り込み: トップ・4シリーズで「あとで読むだけ」','- 再訪者向け入口: 保存順で最大3話','- 読了状態との関係: 独立して保持','- 保存方式: ブラウザー端末内localStorage','- 外部送信: なし',`- エラー: ${errors.length}`,`- 警告: ${warnings.length}`,'','## エラー','',...(errors.length?errors.map(error=>`- ${error}`):['- なし']),'','## 警告','',...(warnings.length?warnings.map(warning=>`- ${warning}`):['- なし']),''].join('\n');
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports','saved-stories-audit.md'),report);
console.log(report);
if(errors.length)process.exitCode=1;