import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const base='https://allsunday1122.github.io/kyokai-yawa/';
const worksPath=path.join(root,'data','works.js');
const taxonomyPath=path.join(root,'data','story-taxonomy.json');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(worksPath,'utf8'),context,{filename:worksPath});
const works=context.window.KYOKAI_WORKS||[];
const seriesInfo=context.window.KYOKAI_SERIES||{};
const taxonomy=fs.existsSync(taxonomyPath)?JSON.parse(fs.readFileSync(taxonomyPath,'utf8')):{};
const socialImage=`${base}assets/social-card.png`;
const updated='2026-07-23';

const configs={
  '真壁夜話':{slug:'makabe',english:'MAKABE NIGHT RECORDS',lead:'勤怠、入館、予約、決済。日常を支える業務記録が、現実より先に結果を確定していく現代怪談。',flavor:'職場・設備・情報システム',start:'MKB-001「退勤記録 25:14」',order:'各話は独立。気になる題名から読めます。公開順では、記録が人間を従わせる規則の変化も追えます。',promise:'怪異の規則を確認し、記録と現実のずれを具体的な手順で閉じる一話完結型です。'},
  '黒瀬蒐集録':{slug:'kurose',english:'KUROSE COLLECTION',lead:'古地図、台帳、祭礼記録、土地の呼び名。残された資料を照合し、地域に埋め込まれた怪異を復元する調査怪談。',flavor:'民俗資料・土地・行政記録',start:'KRS-001「三本目の境木」',order:'各話は独立。公開順に読むと、黒瀬の宿泊室へ近づいてくる記録のつながりを拾えます。',promise:'資料提示だけで終わらず、現地調査、規則の特定、対処、その後の記録まで一話で描きます。'},
  '榊家異聞':{slug:'sakaki',english:'SAKAKI FAMILY ACCOUNTS',lead:'仏間、遺品、古い写真、家族だけの呼び名。家の中で共有されていた記憶が、人数と続柄を静かに組み替える家族怪談。',flavor:'家族・遺品・記憶',start:'SKK-001「仏間の夏服」',order:'各話は単独でも読めますが、家族の輪郭が徐々に変わるため第1話からの公開順を推奨します。',promise:'家族の感情と怪異の規則を分けて描き、各話の出来事には明確な対処と結果があります。'},
  '境界観測記':{slug:'kansoku',english:'BOUNDARY OBSERVATION LOG',lead:'佐伯冬真と御厨澪が、場所・記録・認識の境目に発生する案件を複数の観測手段で調査する連作怪談。',flavor:'調査チーム・境界現象・連作',start:'KKS-S1E01「境目の部屋」',order:'Season 1は第1話から第12話まで順番に読んでください。各事件は完結しますが、人物と青い避難所札の伏線が継続します。',promise:'各話の依頼、怪異、検証、対処、結果を完結させながら、全12話で一つの観測記録を形成します。'}
};

const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const xml=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');
const minutes=work=>Number.parseInt(String(work.mins).match(/\d+/)?.[0]||'0',10);
const seriesDir=path.join(root,'series');
fs.mkdirSync(seriesDir,{recursive:true});

for(const [name,config] of Object.entries(configs)){
  const group=works.filter(work=>work.series===name);
  if(group.length!==12)throw new Error(`${name}: 12話ではありません（${group.length}話）`);
  const url=`${base}series/${config.slug}.html`;
  const graph={'@context':'https://schema.org','@graph':[
    {'@type':'CollectionPage','@id':`${url}#page`,name:`${name}｜境界夜話`,description:config.lead,url,inLanguage:'ja',isPartOf:{'@id':`${base}#website`},mainEntity:{'@id':`${url}#stories`},primaryImageOfPage:{'@type':'ImageObject',url:socialImage,width:1200,height:630}},
    {'@type':'CreativeWorkSeries','@id':`${url}#series`,name,description:config.lead,url,inLanguage:'ja',hasPart:group.map(work=>({'@type':'ShortStory',name:work.title,url:`${base}stories/${work.file}`}))},
    {'@type':'ItemList','@id':`${url}#stories`,name:`${name} 公開作品一覧`,numberOfItems:group.length,itemListOrder:'https://schema.org/ItemListOrderAscending',itemListElement:group.map((work,index)=>({'@type':'ListItem',position:index+1,url:`${base}stories/${work.file}`,name:work.title}))}
  ]};
  const cards=group.map((work,index)=>{
    const info=taxonomy[work.id]||{};
    const tags=Array.isArray(info.tags)?info.tags.slice(0,4):[];
    if(tags.length!==4)throw new Error(`${work.id}: 題材タグが4件ではありません`);
    const serial=work.series==='境界観測記';
    const format=serial?'連作・順番推奨':'一話完結';
    const dots=Array.from({length:5},(_,dot)=>`<i${dot<Number(work.fear)?' class="is-filled"':''}></i>`).join('');
    const search=esc(`${work.id} ${work.title} ${work.desc} ${format} ${tags.join(' ')}`);
    return `<a class="story-card" data-story-id="${esc(work.id)}" data-index="${index}" data-minutes="${minutes(work)}" data-fear="${esc(work.fear)}" data-format="${serial?'serial':'standalone'}" data-search="${search}" href="/kyokai-yawa/stories/${esc(work.file)}"><div class="story-card__head"><span class="story-number">${String(index+1).padStart(2,'0')}</span><span class="story-id">${esc(work.id)}</span><span class="story-format">${format}</span></div><div class="story-copy"><h3>${esc(work.title)}</h3><p>${esc(work.desc)}</p><div class="story-topic-tags" aria-label="題材">${tags.map(tag=>`<span class="story-topic-tag">${esc(tag)}</span>`).join('')}</div></div><div class="story-stats"><span><small>読了目安</small><strong>${esc(work.mins)}</strong></span><span><small>恐怖度</small><span class="story-fear"><strong>${esc(work.fear)} / 5</strong><span class="story-fear-dots" aria-hidden="true">${dots}</span></span></span><span><small>分量</small><strong>${esc(work.length)}</strong></span></div></a>`;
  }).join('');
  const others=Object.entries(configs).filter(([other])=>other!==name).map(([other,info])=>`<a href="/kyokai-yawa/series/${info.slug}.html"><strong>${esc(other)}</strong><span>›</span></a>`).join('');
  const html=`<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(name)}｜全12話・読む順番｜境界夜話</title>
<meta name="description" content="${esc(config.lead)} 全12話の一覧、シリーズの特徴、初めて読む人向けの入口と読む順番を案内します。">
<meta name="robots" content="index,follow,max-snippet:-1"><meta name="theme-color" content="#090b10">
<link rel="manifest" href="/kyokai-yawa/manifest.webmanifest"><link rel="icon" type="image/svg+xml" href="/kyokai-yawa/assets/app-icon.svg"><link rel="icon" type="image/png" sizes="192x192" href="/kyokai-yawa/assets/app-icon-192.png"><link rel="apple-touch-icon" sizes="180x180" href="/kyokai-yawa/assets/apple-touch-icon.png">
<meta name="application-name" content="境界夜話"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="境界夜話">
<link rel="canonical" href="${url}">
<meta property="og:locale" content="ja_JP"><meta property="og:type" content="website"><meta property="og:site_name" content="境界夜話"><meta property="og:title" content="${esc(name)}｜全12話・読む順番"><meta property="og:description" content="${esc(config.lead)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${socialImage}"><meta property="og:image:secure_url" content="${socialImage}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="境界夜話 四つの怪談アーカイブ"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${socialImage}"><meta name="twitter:image:alt" content="境界夜話 四つの怪談アーカイブ">
<script type="application/ld+json">${JSON.stringify(graph)}</script>
<link rel="stylesheet" href="/kyokai-yawa/data/series-pages.css">
<link rel="stylesheet" href="/kyokai-yawa/data/series-work-cards.css">
</head>
<body>
<a class="skip" href="#stories">作品一覧へ移動</a>
<header class="site-header"><nav class="nav" aria-label="主要メニュー"><a class="brand" href="/kyokai-yawa/"><strong>境界夜話</strong><span>怪談アーカイブ</span></a><a class="back" href="/kyokai-yawa/#series">四シリーズ一覧へ</a></nav></header>
<main>
<section class="hero"><div><p class="eyebrow">${esc(config.english)} · 12 STORIES</p><h1>${esc(name)}</h1><p class="lead">${esc(config.lead)}</p></div><dl class="hero-meta"><div><dt>主な題材</dt><dd>${esc(config.flavor)}</dd></div><div><dt>最初の一話</dt><dd>${esc(config.start)}</dd></div><div><dt>公開状況</dt><dd>全12話公開</dd></div></dl></section>
<section class="guide" aria-label="シリーズ案内"><article><h2>読む順番</h2><p>${esc(config.order)}</p></article><article><h2>一話の構成</h2><p>${esc(config.promise)}</p></article><article><h2>作品の選び方</h2><p>題材、読了時間、恐怖度、分量を比較できます。検索と並べ替えを使って、このシリーズ内から次の一話を選べます。</p></article></section>
<section id="stories" aria-labelledby="stories-title"><div class="section-heading"><h2 id="stories-title">全12話</h2><p>公開順・条件検索対応</p></div><div class="series-tools" data-series-tools hidden aria-label="シリーズ内の作品検索と並べ替え"><input type="search" data-role="query" aria-label="シリーズ内検索" placeholder="作品名・題材・あらすじ・IDで検索"><select data-role="filter" aria-label="条件で絞り込み"><option value="">すべての作品</option><option value="quick">6分以内</option><option value="fear5">恐怖度5</option><option value="long">10分以上</option></select><select data-role="sort" aria-label="並べ替え"><option value="public">公開順</option><option value="short">短い順</option><option value="long">長い順</option><option value="fear">恐怖度が高い順</option></select><button type="button" data-role="reset">条件をリセット</button><p data-role="result" aria-live="polite"></p></div><div class="story-grid">${cards}</div></section>
<nav class="other-series" aria-label="他のシリーズ"><h2>他の怪談シリーズ</h2><div class="other-series-list">${others}</div></nav>
</main>
<footer>© 2026 境界夜話</footer>
<script src="/kyokai-yawa/data/series-archive-tools.js" defer></script>
<script src="/kyokai-yawa/data/sw-register.js" defer></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(seriesDir,`${config.slug}.html`),html);
}

const indexPath=path.join(root,'index.html');
let indexHtml=fs.readFileSync(indexPath,'utf8');
indexHtml=indexHtml.replace(/\s*<script src="\/kyokai-yawa\/data\/series-links\.js" defer><\/script>/g,'');
indexHtml=indexHtml.replace(/<\!-- SW_REGISTER_START -->/,'<script src="/kyokai-yawa/data/series-links.js" defer></script>\n<!-- SW_REGISTER_START -->');
for(const [name,config] of Object.entries(configs)){
  const info=seriesInfo[name];
  if(!info)throw new Error(`${name}: KYOKAI_SERIESに存在しません`);
  const target=`<p>${esc(info.desc)}</p></div><ul class="story-list">`;
  const replacement=`<p>${esc(info.desc)}</p><a class="series-detail-link" href="/kyokai-yawa/series/${config.slug}.html">シリーズの案内と全話一覧</a></div><ul class="story-list">`;
  if(indexHtml.includes(target))indexHtml=indexHtml.replace(target,replacement);
}
fs.writeFileSync(indexPath,indexHtml);

const storyEntries=works.map(work=>{
  const html=fs.readFileSync(path.join(root,'stories',work.file),'utf8');
  const jsonText=html.match(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/i)?.[1]||'{}';
  const json=JSON.parse(jsonText);
  return {loc:`${base}stories/${work.file}`,lastmod:json.dateModified||json.datePublished||updated};
});
const seriesEntries=Object.values(configs).map(config=>({loc:`${base}series/${config.slug}.html`,lastmod:updated}));
const sitemapEntries=[{loc:base,lastmod:updated},...seriesEntries,...storyEntries];
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.map(entry=>`  <url><loc>${xml(entry.loc)}</loc><lastmod>${entry.lastmod}</lastmod></url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap);
console.log(`# シリーズ専用ページ正規化\n\n- シリーズページ: ${Object.keys(configs).length}ページ\n- 比較表示カード: ${works.length}話\n- 題材タグ: ${works.length*4}件\n- シリーズ内検索・絞り込み・並べ替え: 対応\n- sitemap URL: ${sitemapEntries.length}件\n`);