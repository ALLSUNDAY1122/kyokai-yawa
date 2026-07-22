import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const context={window:{}};
const worksPath=path.join(root,'data','works.js');
vm.runInNewContext(fs.readFileSync(worksPath,'utf8'),context,{filename:worksPath});
const works=context.window.KYOKAI_WORKS||[];
const taxonomyPath=path.join(root,'data','story-taxonomy.json');
const taxonomy=fs.existsSync(taxonomyPath)?JSON.parse(fs.readFileSync(taxonomyPath,'utf8')):{};
const errors=[];
const warnings=[];
let tagCount=0;
let standaloneCount=0;
let serialCount=0;

if(works.length!==48)errors.push(`公開作品が48話ではありません（${works.length}話）`);
const cssPath=path.join(root,'data','story-overview.css');
if(!fs.existsSync(cssPath))errors.push('data/story-overview.cssが存在しません');
else{
  const css=fs.readFileSync(cssPath,'utf8');
  if(!css.includes('@media(max-width:760px)'))errors.push('スマートフォン向けレイアウトがありません');
  if(!css.includes('min-height:46px'))errors.push('本文開始リンクのタップ領域が46px以上ではありません');
  if(!css.includes('@media(max-width:480px)'))warnings.push('小型画面向け調整がありません');
}

for(const work of works){
  const info=taxonomy[work.id];
  if(!info){errors.push(`${work.id}: 題材分類がありません`);continue;}
  const filePath=path.join(root,'stories',work.file);
  if(!fs.existsSync(filePath)){errors.push(`${work.id}: HTMLが存在しません`);continue;}
  const html=fs.readFileSync(filePath,'utf8');
  const styleCount=(html.match(/\/kyokai-yawa\/data\/story-overview\.css/g)||[]).length;
  if(styleCount!==1)errors.push(`${work.id}: 冒頭情報CSS参照が1件ではありません（${styleCount}件）`);
  if(!html.includes('<!-- STORY_OVERVIEW_STYLES_START -->')||!html.includes('<!-- STORY_OVERVIEW_STYLES_END -->'))errors.push(`${work.id}: 冒頭情報CSSマーカーがありません`);
  const sections=[...html.matchAll(/<!-- STORY_OVERVIEW_START -->([\s\S]*?)<!-- STORY_OVERVIEW_END -->/g)];
  if(sections.length!==1){errors.push(`${work.id}: 冒頭情報欄が1件ではありません（${sections.length}件）`);continue;}
  const section=sections[0][1];
  if(/<p\s+class=["'][^"']*\bsummary\b/i.test(html))errors.push(`${work.id}: 旧あらすじ表示が残っています`);
  if(!section.includes('読む前の作品情報'))errors.push(`${work.id}: 情報欄の見出しがありません`);
  if(!section.includes('<strong>あらすじ</strong>'))errors.push(`${work.id}: あらすじ項目がありません`);
  if(!section.includes(work.mins))errors.push(`${work.id}: 読了目安が作品データと一致しません`);
  if(!section.includes(`5段階中${work.fear}`)||!section.includes(`${work.fear} / 5`))errors.push(`${work.id}: 恐怖度が作品データと一致しません`);
  const expectedFormat=work.series==='境界観測記'?'連作・順番推奨':'一話完結';
  if(!section.includes(expectedFormat))errors.push(`${work.id}: 形式表示が不正です`);
  if(work.series==='境界観測記')serialCount++;else standaloneCount++;
  const tags=[...section.matchAll(/class="story-overview__tag">([^<]+)<\/span>/g)].map(match=>match[1]);
  tagCount+=tags.length;
  if(tags.length!==info.tags.length)errors.push(`${work.id}: 冒頭の題材タグ数が分類データと一致しません`);
  for(const tag of info.tags)if(!tags.includes(tag))errors.push(`${work.id}: 冒頭に題材タグ「${tag}」がありません`);
  if(!section.includes('href="#story"')||!section.includes('本文を読む'))errors.push(`${work.id}: 本文開始リンクがありません`);
  if(work.series==='境界観測記'&&!section.includes('Season 1'))errors.push(`${work.id}: 連作の読む順番案内がありません`);
  if(work.series!=='境界観測記'&&!section.includes('読めます'))errors.push(`${work.id}: 単独読書の案内がありません`);
  const overviewPos=html.indexOf('<!-- STORY_OVERVIEW_START -->');
  const articlePos=html.indexOf('<article');
  if(overviewPos<0||articlePos<0||overviewPos>articlePos)errors.push(`${work.id}: 冒頭情報欄が本文より前にありません`);
  if((html.match(/id="story-overview-title"/g)||[]).length!==1)errors.push(`${work.id}: 冒頭情報見出しIDが1件ではありません`);
}

const report=[
  '# 境界夜話 作品冒頭情報欄監査','',
  `- 公開作品: ${works.length}話`,
  `- 冒頭情報欄: ${works.length-errors.filter(error=>error.includes('冒頭情報欄が1件')).length}件`,
  `- 題材タグ表示: ${tagCount}件`,
  `- 一話完結表示: ${standaloneCount}件`,
  `- 連作・順番推奨表示: ${serialCount}件`,
  '- JavaScriptなしで本文開始可能: はい',
  `- エラー: ${errors.length}`,
  `- 警告: ${warnings.length}`,'',
  '## エラー','',...(errors.length?errors.map(error=>`- ${error}`):['- なし']),'',
  '## 警告','',...(warnings.length?warnings.map(warning=>`- ${warning}`):['- なし']),'',
].join('\n');
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports','story-overviews-audit.md'),report);
console.log(report);
if(errors.length)process.exitCode=1;
