import {performance} from 'node:perf_hooks';

const base='https://allsunday1122.github.io/kyokai-yawa/';
const pages=[
  {name:'真壁夜話',file:'makabe.html'},
  {name:'黒瀬蒐集録',file:'kurose.html'},
  {name:'榊家異聞',file:'sakaki.html'},
  {name:'境界観測記',file:'kansoku.html'},
];
const assets=['data/series-pages.css','data/series-links.js'];
const errors=[];
const warnings=[];
const rows=[];
const request=async url=>{
  const started=performance.now();
  const response=await fetch(url,{cache:'no-store',headers:{'user-agent':'KyokaiYawa-Series-Audit/1.0',accept:'*/*'}});
  const body=await response.text();
  return {response,body,elapsed:performance.now()-started};
};
const type=response=>response.headers.get('content-type')||'';
const percentile=(values,rate)=>{
  if(!values.length)return 0;
  const sorted=[...values].sort((a,b)=>a-b);
  return sorted[Math.min(sorted.length-1,Math.ceil(sorted.length*rate)-1)];
};
const median=values=>{
  if(!values.length)return 0;
  const sorted=[...values].sort((a,b)=>a-b),middle=Math.floor(sorted.length/2);
  return sorted.length%2?sorted[middle]:(sorted[middle-1]+sorted[middle])/2;
};

for(const page of pages){
  const url=`${base}series/${page.file}`;
  try{
    const {response,body,elapsed}=await request(url);
    rows.push({target:page.name,status:response.status,type:type(response),elapsed});
    if(response.status!==200)errors.push(`${page.name}: HTTP ${response.status}`);
    if(!type(response).includes('text/html'))errors.push(`${page.name}: Content-TypeがHTMLではありません`);
    if(!body.includes(`<link rel="canonical" href="${url}">`))errors.push(`${page.name}: canonicalが不正です`);
    if((body.match(/class="story-card"/g)||[]).length!==12)errors.push(`${page.name}: 作品カードが12件ではありません`);
    if((body.match(/href="\/kyokai-yawa\/stories\//g)||[]).length!==12)errors.push(`${page.name}: 作品リンクが12件ではありません`);
    if(!body.includes('/kyokai-yawa/data/series-pages.css'))errors.push(`${page.name}: 共通CSS参照がありません`);
    if(!body.includes('application/ld+json'))errors.push(`${page.name}: JSON-LDがありません`);
  }catch(error){errors.push(`${page.name}: 取得失敗（${error.message}）`);}
}

for(const asset of assets){
  try{
    const {response,elapsed}=await request(`${base}${asset}`);
    rows.push({target:asset,status:response.status,type:type(response),elapsed});
    if(response.status!==200)errors.push(`${asset}: HTTP ${response.status}`);
    const expected=asset.endsWith('.css')?'text/css':'javascript';
    if(!type(response).includes(expected))errors.push(`${asset}: Content-Typeが不正です（${type(response)}）`);
  }catch(error){errors.push(`${asset}: 取得失敗（${error.message}）`);}
}

try{
  const {response,body,elapsed}=await request(base);
  rows.push({target:'トップページ',status:response.status,type:type(response),elapsed});
  if(response.status!==200)errors.push(`トップページ: HTTP ${response.status}`);
  for(const page of pages)if(!body.includes(`/kyokai-yawa/series/${page.file}`))errors.push(`トップページ: ${page.name}の専用リンクがありません`);
}catch(error){errors.push(`トップページ: 取得失敗（${error.message}）`);}

try{
  const {response,body,elapsed}=await request(`${base}sitemap.xml`);
  rows.push({target:'sitemap.xml',status:response.status,type:type(response),elapsed});
  if(response.status!==200)errors.push(`sitemap.xml: HTTP ${response.status}`);
  for(const page of pages)if(!body.includes(`${base}series/${page.file}`))errors.push(`sitemap.xml: ${page.name}がありません`);
}catch(error){errors.push(`sitemap.xml: 取得失敗（${error.message}）`);}

const timings=rows.map(row=>row.elapsed);
if(percentile(timings,.95)>2000)warnings.push(`p95が2秒を超えています（${Math.round(percentile(timings,.95))}ms）`);
const report=[
  '# 境界夜話 本番シリーズ専用ページ監査','',
  `- 実行日時: ${new Date().toISOString()}`,
  `- シリーズページ: ${pages.length}件`,
  `- 関連資産: ${assets.length}件`,
  `- エラー: ${errors.length}`,
  `- 警告: ${warnings.length}`,
  `- 応答時間中央値: ${Math.round(median(timings))}ms`,
  `- 応答時間p95: ${Math.round(percentile(timings,.95))}ms`,'',
  '## エラー','',...(errors.length?errors.map(error=>`- ${error}`):['- なし']),'',
  '## 警告','',...(warnings.length?warnings.map(warning=>`- ${warning}`):['- なし']),'',
  '## 配信確認','',
  '| 対象 | HTTP | Content-Type | 応答 |','|---|---:|---|---:|',
  ...rows.map(row=>`| ${row.target} | ${row.status} | ${row.type.replaceAll('|','｜')} | ${Math.round(row.elapsed)}ms |`),'',
].join('\n');
await import('node:fs').then(fs=>{fs.mkdirSync('reports',{recursive:true});fs.writeFileSync('reports/live-series-pages-audit.md',report);});
console.log(report);
if(errors.length)process.exitCode=1;
