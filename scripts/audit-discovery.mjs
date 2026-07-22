import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const base = 'https://allsunday1122.github.io/kyokai-yawa/';
const errors = [];
const warnings = [];
const worksPath = path.join(root, 'data', 'works.js');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(worksPath, 'utf8'), context, { filename: worksPath });
const works = context.window.KYOKAI_WORKS || [];
const expectedUrls = new Set(works.map(work => `${base}stories/${work.file}`));

const required = ['index.html', '404.html', 'robots.txt', 'sitemap.xml', 'feed.xml'];
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`${file}が存在しません`);
}

const indexHtml = fs.existsSync(path.join(root, 'index.html')) ? fs.readFileSync(path.join(root, 'index.html'), 'utf8') : '';
const graphText = indexHtml.match(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/i)?.[1] || '';
let graph = null;
try { graph = JSON.parse(graphText); } catch (error) { errors.push(`index.htmlのJSON-LDが不正です（${error.message}）`); }
if (graph) {
  const nodes = Array.isArray(graph['@graph']) ? graph['@graph'] : [graph];
  const website = nodes.find(node => node['@type'] === 'WebSite');
  const collection = nodes.find(node => node['@type'] === 'CollectionPage');
  const list = nodes.find(node => node['@type'] === 'ItemList');
  if (!website) errors.push('index.html: WebSite構造化データがありません');
  if (!collection) errors.push('index.html: CollectionPage構造化データがありません');
  if (!list) errors.push('index.html: ItemList構造化データがありません');
  if (list) {
    const items = Array.isArray(list.itemListElement) ? list.itemListElement : [];
    if (list.numberOfItems !== works.length) errors.push(`ItemList numberOfItemsが${works.length}ではありません`);
    if (items.length !== works.length) errors.push(`ItemList項目が${works.length}件ではありません`);
    const urls = new Set(items.map(item => item.url));
    for (const url of expectedUrls) if (!urls.has(url)) errors.push(`ItemListに${url}がありません`);
  }
}
if (!indexHtml.includes('type="application/rss+xml"') || !indexHtml.includes(`${base}feed.xml`)) {
  errors.push('index.htmlにRSS alternateリンクがありません');
}

if (fs.existsSync(path.join(root, '404.html'))) {
  const html404 = fs.readFileSync(path.join(root, '404.html'), 'utf8');
  if (!/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html404)) errors.push('404.htmlにnoindexがありません');
  if (!html404.includes('href="/kyokai-yawa/"')) errors.push('404.htmlにトップへ戻るリンクがありません');
  if (!/<title>[^<]*境界夜話[^<]*<\/title>/i.test(html404)) errors.push('404.htmlのtitleにサイト名がありません');
}

if (fs.existsSync(path.join(root, 'robots.txt'))) {
  const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
  if (!/User-agent:\s*\*/i.test(robots)) errors.push('robots.txtにUser-agent: *がありません');
  if (!/Allow:\s*\//i.test(robots)) errors.push('robots.txtにAllow: /がありません');
  if (!robots.includes(`Sitemap: ${base}sitemap.xml`)) errors.push('robots.txtのSitemap URLが不正です');
}

if (fs.existsSync(path.join(root, 'sitemap.xml'))) {
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  if (urls.length !== works.length + 1) errors.push(`sitemap URL数が${works.length + 1}件ではありません（${urls.length}件）`);
  if (!urls.includes(base)) errors.push('sitemapにトップURLがありません');
  for (const url of expectedUrls) if (!urls.includes(url)) errors.push(`sitemapに${url}がありません`);
}

let feedItems = [];
if (fs.existsSync(path.join(root, 'feed.xml'))) {
  const feed = fs.readFileSync(path.join(root, 'feed.xml'), 'utf8');
  if (!feed.includes('<rss version="2.0"')) errors.push('feed.xmlがRSS 2.0ではありません');
  if (!feed.includes(`<atom:link href="${base}feed.xml" rel="self"`)) errors.push('feed.xmlにselfリンクがありません');
  feedItems = [...feed.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>[\s\S]*?<\/item>/g)].map(match => match[1]);
  if (feedItems.length !== works.length) errors.push(`RSS項目が${works.length}件ではありません（${feedItems.length}件）`);
  for (const url of expectedUrls) if (!feedItems.includes(url)) errors.push(`RSSに${url}がありません`);
}

const ogImageCount = [indexHtml, ...works.map(work => fs.readFileSync(path.join(root, 'stories', work.file), 'utf8'))]
  .filter(html => /<meta\s+property=["']og:image["']/i.test(html)).length;
if (ogImageCount === 0) warnings.push('SNS共有画像（og:image）が未設定です。PNGまたはJPEGの共通カードを作成後に反映してください');

const report = [
  '# 境界夜話 検索流入・404・フィード監査',
  '',
  `- 公開作品: ${works.length}話`,
  `- sitemap URL: ${works.length + 1}件`,
  `- RSS項目: ${feedItems.length}件`,
  `- エラー: ${errors.length}`,
  `- 警告: ${warnings.length}`,
  '',
  '## エラー',
  '',
  ...(errors.length ? errors.map(error => `- ${error}`) : ['- なし']),
  '',
  '## 警告',
  '',
  ...(warnings.length ? warnings.map(warning => `- ${warning}`) : ['- なし']),
  '',
].join('\n');
fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
fs.writeFileSync(path.join(root, 'reports', 'discovery-audit.md'), report);
console.log(report);
if (errors.length) process.exitCode = 1;