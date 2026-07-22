import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const indexPath=path.join(root,'index.html');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'data','works.js'),'utf8'),context);
const works=context.window.KYOKAI_WORKS||[];
if(works.length!==48)throw new Error(`作品数が48話ではありません（${works.length}話）`);

const byId=new Map(works.map(work=>[work.id,work]));
const minutes=work=>Number.parseInt(String(work.mins).match(/\d+/)?.[0]||'0',10);
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const storyLink=work=>`<li><a href="/kyokai-yawa/stories/${esc(work.file)}"><span class="reading-path-id">${esc(work.id)}</span><span class="reading-path-title">${esc(work.title)}</span><span class="reading-path-time">${esc(work.mins)}・恐怖${esc(work.fear)}</span></a></li>`;
const select=ids=>ids.map(id=>{const work=byId.get(id);if(!work)throw new Error(`代表作${id}がありません`);return work;});

const categories=[
  {
    key:'quick',kicker:'時間から選ぶ',title:'6分以内で読める話',
    summary:'移動中や就寝前に、一話の怪異・対処・結末まで短時間で読み切れる作品です。',
    works:works.filter(work=>minutes(work)<=6),
    featured:select(['MKB-007','MKB-008','KRS-011']),
  },
  {
    key:'fear5',kicker:'強さから選ぶ',title:'恐怖度5の話',
    summary:'現在の最高恐怖レベルに設定された3作品です。いずれも境界観測記Season 1後半のため、第1話から読むと人物関係と伏線を追えます。',
    works:works.filter(work=>Number(work.fear)===5),
    featured:select(['KKS-S1E09','KKS-S1E11','KKS-S1E12']),
    secondary:{href:'/kyokai-yawa/series/kansoku.html',label:'境界観測記の順番を見る'},
  },
  {
    key:'standalone',kicker:'読み方から選ぶ',title:'単独で読みやすい一話完結',
    summary:'前の話を知らなくても、依頼・怪異・調査または対処・結果まで理解できる3シリーズ36作品です。',
    works:works.filter(work=>work.series!=='境界観測記'),
    featured:select(['MKB-001','KRS-001','SKK-001']),
  },
  {
    key:'serial',kicker:'連作から選ぶ',title:'境界観測記を最初から',
    summary:'佐伯冬真と御厨澪、青い避難所札の伏線を追う場合は、Season 1第1話から公開順に読んでください。',
    works:works.filter(work=>work.series==='境界観測記'),
    featured:select(['KKS-S1E01','KKS-S1E02','KKS-S1E03']),
    secondary:{href:'/kyokai-yawa/series/kansoku.html',label:'全12話の順番を見る'},
  },
  {
    key:'long',kicker:'読み応えから選ぶ',title:'10分以上の話',
    summary:'調査や家族関係、怪異の規則を時間をかけて読む中長編です。読了時間の長い順にも並べ替えられます。',
    works:works.filter(work=>minutes(work)>=10),
    featured:select(['KRS-003','SKK-012','KKS-S1E05']),
  },
];

const cards=categories.map((category,index)=>`<article class="reading-path${index===4?' reading-path-wide':''}" data-reading-path="${category.key}">
  <div class="reading-path-head"><div><p class="reading-path-kicker">${esc(category.kicker)}</p><h3>${esc(category.title)}</h3></div><span class="reading-path-count">${category.works.length}話</span></div>
  <p class="reading-path-summary">${esc(category.summary)}</p>
  <ul class="reading-path-stories">${category.featured.map(storyLink).join('')}</ul>
  <div class="reading-path-actions"><a class="reading-path-action" data-reading-filter="${category.key}" href="/kyokai-yawa/?pick=${category.key}#works">該当作品を一覧表示</a>${category.secondary?`<a class="reading-path-action secondary" href="${category.secondary.href}">${esc(category.secondary.label)}</a>`:''}</div>
</article>`).join('\n');

const section=`<!-- READING_PATHS_START -->
<section class="section reading-paths" id="discover" aria-labelledby="reading-paths-title">
  <div class="wrap">
    <div class="section-head">
      <div class="reading-paths-intro"><p class="eyebrow">FIND YOUR NEXT STORY</p><h2 id="reading-paths-title">選び方から作品を探す</h2></div>
      <p>所要時間、恐怖度、単独で読めるか、連作かで絞り込めます。代表作から直接読むことも、条件に合う全作品を一覧表示することもできます。</p>
    </div>
    <div class="reading-path-grid">${cards}</div>
    <p class="reading-path-note">「該当作品を一覧表示」は下の48作品一覧へ移動し、検索条件を適用します。検索条件は組み合わせて変更できます。</p>
  </div>
</section>
<!-- READING_PATHS_END -->`;

let html=fs.readFileSync(indexPath,'utf8');
const before=html;
const cssTag='<link rel="stylesheet" href="/kyokai-yawa/data/reading-paths.css">';
html=html.replaceAll(cssTag,'');
html=html.replace(/<\/head>/i,`${cssTag}\n</head>`);
html=html.replace(/<a href="#discover">選び方<\/a>/g,'');
html=html.replace(/(<a href="#start">初めての方<\/a>)/,`$1<a href="#discover">選び方</a>`);
html=html.replace(/\s*<!-- READING_PATHS_START -->[\s\S]*?<!-- READING_PATHS_END -->/g,'');
const entryEnd='<!-- ENTRY_GUIDE_END -->';
if(!html.includes(entryEnd))throw new Error('初読者向け入口の終了マーカーがありません');
html=html.replace(entryEnd,`${entryEnd}\n${section}`);
fs.writeFileSync(indexPath,html);

console.log([
  '# 選び方別作品導線の正規化','',
  `- 公開作品: ${works.length}話`,
  ...categories.map(category=>`- ${category.title}: ${category.works.length}話`),
  `- 更新: ${html===before?'なし':'あり'}`,'',
].join('\n'));
