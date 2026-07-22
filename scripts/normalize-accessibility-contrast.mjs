import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const href='/kyokai-yawa/data/accessibility-contrast.css';
const link=`<link rel="stylesheet" href="${href}">`;
const targets=[
  {file:'reading-log.html',anchor:'<link rel="stylesheet" href="/kyokai-yawa/data/reading-log.css">'},
  ...['makabe.html','kurose.html','sakaki.html','kansoku.html'].map(file=>({file:path.join('series',file),anchor:'<link rel="stylesheet" href="/kyokai-yawa/data/series-work-cards.css">'})),
];

for(const target of targets){
  const filePath=path.join(root,target.file);
  let html=fs.readFileSync(filePath,'utf8');
  html=html.replace(new RegExp(`\\s*<link\\s+rel=["']stylesheet["']\\s+href=["']${href.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}["']\\s*\\/?>`,'g'),'');
  if(!html.includes(target.anchor))throw new Error(`${target.file}: 配色CSSの挿入位置がありません`);
  html=html.replace(target.anchor,`${target.anchor}\n${link}`);
  fs.writeFileSync(filePath,html);
}

console.log(`# 配色補正CSS正規化\n\n- 対象: ${targets.length}ページ\n- 読書記録: 1ページ\n- シリーズ: 4ページ\n- CSS参照: 各1件\n`);
