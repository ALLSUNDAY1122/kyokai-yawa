import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const worksPath = path.join(root, 'data', 'works.js');
const sitemapPath = path.join(root, 'sitemap.xml');
const modifiedDate = '2026-07-22';
const charsPerMinute = 350;

const context = { window: {} };
let worksSource = fs.readFileSync(worksPath, 'utf8');
vm.runInNewContext(worksSource, context, { filename: worksPath });
const works = context.window.KYOKAI_WORKS || [];
const changes = [];

const decodeEntities = value => value
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'");

const articleText = html => {
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1];
  if (article === undefined) throw new Error('article要素がありません');
  return decodeEntities(article
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/[\s\u3000]+/g, ''));
};

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

for (const work of works) {
  const filePath = path.join(root, 'stories', work.file);
  let html = fs.readFileSync(filePath, 'utf8');
  const chars = Array.from(articleText(html)).length;
  const minutes = Math.max(1, Math.ceil(chars / charsPerMinute));
  const before = html;

  html = html.replace(
    /(<div class="meta"[^>]*>[\s\S]*?<span>約)\d+(分<\/span>)/i,
    `$1${minutes}$2`,
  );
  html = html.replace(/("timeRequired"\s*:\s*"PT)\d+(M")/i, `$1${minutes}$2`);

  if (/"dateModified"\s*:/i.test(html)) {
    html = html.replace(/("dateModified"\s*:\s*")[^"]+("\s*)/i, `$1${modifiedDate}$2`);
  } else {
    html = html.replace(/("datePublished"\s*:\s*"[^"]+")/i, `$1,"dateModified":"${modifiedDate}"`);
  }

  if (html === before) {
    throw new Error(`${work.id}: 読了時間またはJSON-LDの更新対象が見つかりません`);
  }

  fs.writeFileSync(filePath, html);
  changes.push(`${work.id}: ${chars.toLocaleString('ja-JP')}字 → 約${minutes}分`);

  const id = escapeRegExp(work.id);
  const worksRegex = new RegExp(`(\\{id:'${id}',[^\\n]*?mins:'約)\\d+(分')`);
  if (!worksRegex.test(worksSource)) throw new Error(`${work.id}: data/works.jsの対象行が見つかりません`);
  worksSource = worksSource.replace(worksRegex, `$1${minutes}$2`);
}

fs.writeFileSync(worksPath, worksSource);

let sitemap = fs.readFileSync(sitemapPath, 'utf8');
for (const work of works) {
  const url = `https://allsunday1122.github.io/kyokai-yawa/stories/${work.file}`;
  const regex = new RegExp(`(<loc>${escapeRegExp(url)}<\\/loc><lastmod>)[^<]+(<\\/lastmod>)`);
  if (!regex.test(sitemap)) throw new Error(`${work.id}: sitemapのURLが見つかりません`);
  sitemap = sitemap.replace(regex, `$1${modifiedDate}$2`);
}
sitemap = sitemap.replace(
  /(<loc>https:\/\/allsunday1122\.github\.io\/kyokai-yawa\/<\/loc><lastmod>)[^<]+(<\/lastmod>)/,
  `$1${modifiedDate}$2`,
);
fs.writeFileSync(sitemapPath, sitemap);

console.log(`# 読了時間正規化\n\n- 基準: ${charsPerMinute}文字／分、端数切り上げ\n- 更新日: ${modifiedDate}\n- 対象: ${works.length}話\n\n${changes.map(item => `- ${item}`).join('\n')}`);
