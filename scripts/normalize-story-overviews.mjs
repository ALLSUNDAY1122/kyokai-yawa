import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const context={window:{}};
const worksPath=path.join(root,'data','works.js');
vm.runInNewContext(fs.readFileSync(worksPath,'utf8'),context,{filename:worksPath});
const works=context.window.KYOKAI_WORKS||[];
const taxonomyPath=path.join(root,'data','story-taxonomy.json');
if(!fs.existsSync(taxonomyPath))throw new Error('data/story-taxonomy.jsonが存在しません');
const taxonomy=JSON.parse(fs.readFileSync(taxonomyPath,'utf8'));
if(works.length!==48)throw new Error(`公開作品が48話ではありません（${works.length}話）`);

const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const plain=value=>String(value??'').replace(/<br\s*\/?>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const episodeNumber=work=>Number(work.id.match(/E(\d+)$/)?.[1]||work.id.match(/-(\d+)$/)?.[1]||0);
const readingGuide=work=>{
  if(work.series==='境界観測記')return episodeNumber(work)===1?'Season 1の開始話です。この話から順番に読めます。':'連作です。Season 1第1話から順番に読むことを推奨します。';
  if(work.series==='榊家異聞')return 'この話だけでも読めますが、家族の背景を追う場合は第1話からの公開順を推奨します。';
  return '一話完結です。この作品から単独で読めます。';
};
const formatLabel=work=>work.series==='境界観測記'?'連作・順番推奨':'一話完結';
const styleBlock='<!-- STORY_OVERVIEW_STYLES_START -->\n<link rel="stylesheet" href="/kyokai-yawa/data/story-overview.css">\n<!-- STORY_OVERVIEW_STYLES_END -->';
let changed=0;

for(const work of works){
  const info=taxonomy[work.id];
  if(!info||!Array.isArray(info.tags))throw new Error(`${work.id}: 題材分類がありません`);
  const filePath=path.join(root,'stories',work.file);
  let html=fs.readFileSync(filePath,'utf8');
  const before=html;
  const summaryMatch=html.match(/<p\s+class=["'][^"']*\bsummary\b[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
  const synopsis=plain(summaryMatch?.[1])||work.desc;
  if(!synopsis)throw new Error(`${work.id}: あらすじがありません`);

  html=html.replace(/\s*<!-- STORY_OVERVIEW_STYLES_START -->[\s\S]*?<!-- STORY_OVERVIEW_STYLES_END -->/g,'');
  html=html.replace(/\s*<link\s+rel=["']stylesheet["']\s+href=["']\/kyokai-yawa\/data\/story-overview\.css["'][^>]*>/gi,'');
  html=html.replace(/<\/head>/i,`${styleBlock}\n</head>`);
  html=html.replace(/\s*<!-- STORY_OVERVIEW_START -->[\s\S]*?<!-- STORY_OVERVIEW_END -->/g,'');
  html=html.replace(/\s*<p\s+class=["'][^"']*\bsummary\b[^"']*["'][^>]*>[\s\S]*?<\/p>/i,'');

  const fear=Math.max(1,Math.min(5,Number(work.fear)||1));
  const fearBars=Array.from({length:5},(_,index)=>`<span${index<fear?' class="is-filled"':''}></span>`).join('');
  const overview=`<!-- STORY_OVERVIEW_START -->\n<section class="story-overview" aria-labelledby="story-overview-title">\n  <div class="story-overview__grid">\n    <div>\n      <p class="story-overview__eyebrow">BEFORE READING</p>\n      <h2 class="story-overview__title" id="story-overview-title">読む前の作品情報</h2>\n      <p class="story-overview__summary"><strong>あらすじ</strong><br>${esc(synopsis)}</p>\n    </div>\n    <dl class="story-overview__metrics">\n      <div><dt>読了目安</dt><dd>${esc(work.mins)}</dd></div>\n      <div><dt>恐怖度</dt><dd><span aria-label="5段階中${fear}">${fear} / 5</span><span class="story-fear" aria-hidden="true">${fearBars}</span></dd></div>\n      <div><dt>形式</dt><dd>${esc(formatLabel(work))}</dd></div>\n    </dl>\n  </div>\n  <div class="story-overview__footer">\n    <div>\n      <p class="story-overview__eyebrow">題材</p>\n      <div class="story-overview__tags" aria-label="この作品の題材">${info.tags.map(tag=>`<span class="story-overview__tag">${esc(tag)}</span>`).join('')}</div>\n      <p class="story-overview__guide">${esc(readingGuide(work))}</p>\n    </div>\n    <a class="story-overview__start" href="#story">本文を読む</a>\n  </div>\n</section>\n<!-- STORY_OVERVIEW_END -->`;
  const metaPattern=/(<div\s+class=["'][^"']*\bmeta\b[^"']*["'][^>]*>[\s\S]*?<\/div>)/i;
  if(!metaPattern.test(html))throw new Error(`${work.id}: meta要素が見つかりません`);
  html=html.replace(metaPattern,`$1\n${overview}`);
  fs.writeFileSync(filePath,html);
  if(html!==before)changed++;
}

console.log(`# 作品冒頭情報欄の正規化\n\n- 公開作品: ${works.length}話\n- あらすじ統合: ${works.length}件\n- 読了目安・恐怖度・形式: ${works.length}件\n- 題材タグ表示: ${works.length}件\n- 読む順番案内: ${works.length}件\n- 更新ページ: ${changed}ページ\n`);
