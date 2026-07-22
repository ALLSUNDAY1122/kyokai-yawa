import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'data','works.js'),'utf8'),context);
const works=context.window.KYOKAI_WORKS||[];
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const tools=fs.readFileSync(path.join(root,'data','archive-tools.js'),'utf8');
const errors=[];
const warnings=[];
const minutes=work=>Number.parseInt(String(work.mins).match(/\d+/)?.[0]||'0',10);
const byId=new Map(works.map(work=>[work.id,work]));

const categories=[
  {key:'quick',title:'6分以内で読める話',count:works.filter(work=>minutes(work)<=6).length,ids:['MKB-007','MKB-008','KRS-011']},
  {key:'fear5',title:'恐怖度5の話',count:works.filter(work=>Number(work.fear)===5).length,ids:['KKS-S1E09','KKS-S1E11','KKS-S1E12']},
  {key:'standalone',title:'単独で読みやすい一話完結',count:works.filter(work=>work.series!=='境界観測記').length,ids:['MKB-001','KRS-001','SKK-001']},
  {key:'serial',title:'境界観測記を最初から',count:works.filter(work=>work.series==='境界観測記').length,ids:['KKS-S1E01','KKS-S1E02','KKS-S1E03']},
  {key:'long',title:'10分以上の話',count:works.filter(work=>minutes(work)>=10).length,ids:['KRS-003','SKK-012','KKS-S1E05']},
];

if(works.length!==48)errors.push(`作品数が48話ではありません（${works.length}話）`);
if((html.match(/<!-- READING_PATHS_START -->/g)||[]).length!==1)errors.push('READING_PATHS_STARTが1件ではありません');
if((html.match(/<!-- READING_PATHS_END -->/g)||[]).length!==1)errors.push('READING_PATHS_ENDが1件ではありません');
if((html.match(/data\/reading-paths\.css/g)||[]).length!==1)errors.push('reading-paths.css参照が1件ではありません');
if((html.match(/href="#discover">選び方<\/a>/g)||[]).length!==1)errors.push('主要メニューの「選び方」リンクが1件ではありません');
if(!fs.existsSync(path.join(root,'data','reading-paths.css')))errors.push('data/reading-paths.cssがありません');

const section=html.match(/<!-- READING_PATHS_START -->([\s\S]*?)<!-- READING_PATHS_END -->/)?.[1]||'';
const cardCount=(section.match(/data-reading-path=/g)||[]).length;
if(cardCount!==categories.length)errors.push(`比較カードが${categories.length}件ではありません（${cardCount}件）`);

let representativeLinks=0;
for(const category of categories){
  const card=section.match(new RegExp(`<article[^>]+data-reading-path=["']${category.key}["'][^>]*>([\\s\\S]*?)<\\/article>`))?.[1]||'';
  if(!card){errors.push(`${category.key}: カードがありません`);continue;}
  if(!card.includes(category.title))errors.push(`${category.key}: 見出しがありません`);
  if(!card.includes(`${category.count}話`))errors.push(`${category.key}: 件数${category.count}話がありません`);
  if(!card.includes(`/?pick=${category.key}#works`))errors.push(`${category.key}: 一覧表示リンクが不正です`);
  for(const id of category.ids){
    const work=byId.get(id);
    if(!work){errors.push(`${category.key}: 代表作${id}が作品データにありません`);continue;}
    const href=`/kyokai-yawa/stories/${work.file}`;
    if(!card.includes(href))errors.push(`${category.key}: 代表作${id}へのリンクがありません`);
    else representativeLinks+=1;
    if(!fs.existsSync(path.join(root,'stories',work.file)))errors.push(`${category.key}: ${work.file}がありません`);
  }
}

for(const value of ['quick','fear5','standalone','serial','long']){
  if(!tools.includes(`value:'${value}'`))errors.push(`archive-tools.jsに${value}フィルターがありません`);
}
for(const value of ['short','long','fear']){
  if(!tools.includes(`value:'${value}'`))errors.push(`archive-tools.jsに${value}並べ替えがありません`);
}
if(!tools.includes("params.get('pick')"))errors.push('URLのpick条件を復元していません');
if(!tools.includes('history.replaceState'))errors.push('検索条件をURLへ同期していません');
if(!tools.includes("work.series!=='境界観測記'"))errors.push('単独読書フィルターの定義がありません');
if(!tools.includes("work.series==='境界観測記'"))errors.push('連作フィルターの定義がありません');

const report=[
  '# 境界夜話 選び方別作品導線監査','',
  `- 公開作品: ${works.length}話`,
  `- 選び方カード: ${cardCount}/${categories.length}`,
  `- 静的代表作リンク: ${representativeLinks}/${categories.length*3}`,
  `- URL連動フィルター: 5種類`,
  `- 並べ替え: 公開順・短い順・長い順・恐怖度順`,
  `- エラー: ${errors.length}`,
  `- 警告: ${warnings.length}`,'',
  '## 分類件数','',
  '| 分類 | 作品数 |','|---|---:|',
  ...categories.map(category=>`| ${category.title} | ${category.count} |`),'',
  '## エラー','',...(errors.length?errors.map(error=>`- ${error}`):['- なし']),'',
  '## 警告','',...(warnings.length?warnings.map(warning=>`- ${warning}`):['- なし']),'',
].join('\n');
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports','reading-paths-audit.md'),report);
console.log(report);
if(errors.length)process.exitCode=1;
