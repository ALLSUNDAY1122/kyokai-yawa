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
const lengthForMinutes = minutes => minutes <= 7 ? '短編' : minutes <= 11 ? '中編' : '長編';

for (const work of works) {
  const filePath = path.join(root, 'stories', work.file);
  let html = fs.readFileSync(filePath, 'utf8');
  const chars = Array.from(articleText(html)).length;
  const minutes = Math.max(1, Math.ceil(chars / charsPerMinute));
  const length = lengthForMinutes(minutes);
  const before = html;

  const pageTimePattern = /(<div class="meta"[^>]*>[\s\S]*?<span>約)\d+(分<\/span>)/i;
  const pageLengthPattern = /(<div class="meta"[^>]*>[\s\S]*?<span>)(短編|中編|長編)(<\/span>)/i;
  const jsonTimePattern = /("timeRequired"\s*:\s*"PT)\d+(M")/i;
  if (!pageTimePattern.test(html)) throw new Error(`${work.id}: ページ読了時間が見つかりません`);
  if (!pageLengthPattern.test(html)) throw new Error(`${work.id}: ページ長さ区分が見つかりません`);
  if (!jsonTimePattern.test(html)) throw new Error(`${work.id}: JSON-LD読了時間が見つかりません`);

  html = html.replace(pageTimePattern, `$1${minutes}$2`);
  html = html.replace(pageLengthPattern, `$1${length}$3`);
  html = html.replace(jsonTimePattern, `$1${minutes}$2`);

  if (/"dateModified"\s*:/i.test(html)) {
    html = html.replace(/("dateModified"\s*:\s*")[^"]+("\s*)/i, `$1${modifiedDate}$2`);
  } else {
    html = html.replace(/("datePublished"\s*:\s*"[^"]+")/i, `$1,"dateModified":"${modifiedDate}"`);
  }

  if (html !== before) {
    fs.writeFileSync(filePath, html);
    changes.push(`${work.id}: ${chars.toLocaleString('ja-JP')}字 → 約${minutes}分／${length}`);
  }

  const id = escapeRegExp(work.id);
  const timeRegex = new RegExp(`(\\{id:'${id}',[^\\n]*?mins:'約)\\d+(分')`);
  const lengthRegex = new RegExp(`(\\{id:'${id}',[^\\n]*?length:')(短編|中編|長編)(')`);
  if (!timeRegex.test(worksSource)) throw new Error(`${work.id}: data/works.jsの読了時間が見つかりません`);
  if (!lengthRegex.test(worksSource)) throw new Error(`${work.id}: data/works.jsの長さ区分が見つかりません`);
  worksSource = worksSource.replace(timeRegex, `$1${minutes}$2`);
  worksSource = worksSource.replace(lengthRegex, `$1${length}$3`);
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

console.log(`# 読了時間・長さ区分正規化\n\n- 基準: ${charsPerMinute}文字／分、端数切り上げ\n- 長さ区分: 短編7分以下／中編8〜11分／長編12分以上\n- 更新日: ${modifiedDate}\n- 対象: ${works.length}話\n- 変更: ${changes.length}話\n\n${changes.length ? changes.map(item => `- ${item}`).join('\n') : '- 変更なし'}`);
