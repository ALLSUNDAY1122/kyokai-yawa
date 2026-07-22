import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const context={window:{}};
const worksPath=path.join(root,'data','works.js');
vm.runInNewContext(fs.readFileSync(worksPath,'utf8'),context,{filename:worksPath});
const works=context.window.KYOKAI_WORKS||[];
const byId=new Map(works.map(work=>[work.id,work]));
const taxonomyPath=path.join(root,'data','story-taxonomy.json');
const errors=[];
const warnings=[];
if(!fs.existsSync(taxonomyPath))errors.push('data/story-taxonomy.jsonが存在しません');
const taxonomy=fs.existsSync(taxonomyPath)?JSON.parse(fs.readFileSync(taxonomyPath,'utf8')):{};
const inbound=Object.fromEntries(works.map(work=>[work.id,0]));
let sameSeriesLinks=0;
let crossSeriesLinks=0;
const tagSet=new Set();

if(works.length!==48)errors.push(`公開作品が48話ではありません（${works.length}話）`);
if(Object.keys(taxonomy).length!==works.length)errors.push(`分類データが${works.length}件ではありません（${Object.keys(taxonomy).length}件）`);

for(const work of works){
  const info=taxonomy[work.id];
  if(!info){errors.push(`${work.id}: 分類データがありません`);continue;}
  if(!Array.isArray(info.tags)||info.tags.length<3||info.tags.length>4)errors.push(`${work.id}: 題材タグが3〜4件ではありません`);
  else info.tags.forEach(tag=>tagSet.add(tag));
  if(!String(info.aftertaste||'').trim())errors.push(`${work.id}: 読後感がありません`);
  if(!Array.isArray(info.related)||info.related.length!==3){errors.push(`${work.id}: 関連作品が3話ではありません`);continue;}
  if(new Set(info.related).size!==3)errors.push(`${work.id}: 関連作品が重複しています`);
  if(info.related.includes(work.id))errors.push(`${work.id}: 自作品が関連作品に含まれています`);
  for(const id of info.related){
    const target=byId.get(id);
    if(!target){errors.push(`${work.id}: 関連先${id}が存在しません`);continue;}
    inbound[id]=(inbound[id]||0)+1;
    if(target.series===work.series)sameSeriesLinks++;else crossSeriesLinks++;
  }

  const filePath=path.join(root,'stories',work.file);
  if(!fs.existsSync(filePath)){errors.push(`${work.id}: HTMLが存在しません`);continue;}
  const html=fs.readFileSync(filePath,'utf8');
  const styleCount=(html.match(/\/kyokai-yawa\/data\/related-stories\.css/g)||[]).length;
  if(styleCount!==1)errors.push(`${work.id}: 関連作品CSS参照が1件ではありません（${styleCount}件）`);
  if(!html.includes('<!-- RELATED_STYLES_START -->')||!html.includes('<!-- RELATED_STYLES_END -->'))errors.push(`${work.id}: 関連作品CSSマーカーがありません`);
  const section=html.match(/<!-- RELATED_STORIES_START -->([\s\S]*?)<!-- RELATED_STORIES_END -->/)?.[1]||'';
  if(!section){errors.push(`${work.id}: 関連作品セクションがありません`);continue;}
  const tagCount=(section.match(/class="story-tag"/g)||[]).length;
  if(tagCount!==info.tags.length)errors.push(`${work.id}: HTMLの題材タグ数が分類データと一致しません`);
  for(const tag of info.tags)if(!section.includes(`>${tag}</span>`))errors.push(`${work.id}: 題材タグ「${tag}」がHTMLにありません`);
  if(!section.includes(info.aftertaste))errors.push(`${work.id}: 読後感がHTMLにありません`);
  const relatedIds=[...section.matchAll(/data-related-id="([^"]+)"/g)].map(match=>match[1]);
  if(relatedIds.length!==3)errors.push(`${work.id}: HTMLの関連作品リンクが3件ではありません（${relatedIds.length}件）`);
  if(JSON.stringify(relatedIds)!==JSON.stringify(info.related))errors.push(`${work.id}: HTMLの関連作品順が分類データと一致しません`);
  for(const id of info.related){
    const target=byId.get(id);
    if(target&&!section.includes(`/kyokai-yawa/stories/${target.file}`))errors.push(`${work.id}: ${id}への静的リンクがありません`);
  }
  const ldText=html.match(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/i)?.[1];
  if(!ldText){errors.push(`${work.id}: JSON-LDがありません`);continue;}
  try{
    const graph=JSON.parse(ldText);
    const keywords=String(graph.keywords||'');
    for(const tag of info.tags)if(!keywords.includes(tag))errors.push(`${work.id}: JSON-LD keywordsに「${tag}」がありません`);
    if(!Array.isArray(graph.about)||graph.about.length!==info.tags.length)errors.push(`${work.id}: JSON-LD aboutが題材タグと一致しません`);
  }catch(error){errors.push(`${work.id}: JSON-LDを解析できません`);}
}

const inboundValues=Object.values(inbound);
for(const [id,count] of Object.entries(inbound))if(count===0)errors.push(`${id}: 関連作品からの流入リンクがありません`);
const maxInbound=inboundValues.length?Math.max(...inboundValues):0;
if(maxInbound>8)warnings.push(`関連作品の被リンクが一部へ集中しています（最大${maxInbound}件）`);
if(crossSeriesLinks<works.length*2)warnings.push(`別シリーズへの関連リンクが想定より少ないです（${crossSeriesLinks}件）`);

const report=[
  '# 境界夜話 題材タグ・読後感・関連作品監査',
  '',
  `- 公開作品: ${works.length}話`,
  `- 分類データ: ${Object.keys(taxonomy).length}件`,
  `- 題材タグ種類: ${tagSet.size}種類`,
  `- 関連作品リンク: ${sameSeriesLinks+crossSeriesLinks}件`,
  `- 同シリーズ関連: ${sameSeriesLinks}件`,
  `- 別シリーズ関連: ${crossSeriesLinks}件`,
  `- 被リンク最小: ${inboundValues.length?Math.min(...inboundValues):0}件`,
  `- 被リンク最大: ${maxInbound}件`,
  `- JavaScriptなしの静的リンク: はい`,
  `- エラー: ${errors.length}`,
  `- 警告: ${warnings.length}`,
  '',
  '## エラー','',...(errors.length?errors.map(error=>`- ${error}`):['- なし']),
  '',
  '## 警告','',...(warnings.length?warnings.map(warning=>`- ${warning}`):['- なし']),
  '',
].join('\n');
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports','related-stories-audit.md'),report);
console.log(report);
if(errors.length)process.exitCode=1;
