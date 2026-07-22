import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const worksPath = path.join(root, 'data', 'works.js');
const indexPath = path.join(root, 'index.html');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(worksPath, 'utf8'), context, { filename: worksPath });
const works = context.window.KYOKAI_WORKS || [];
const errors = [];
const warnings = [];
const rows = [];
const seenTitles = new Map();
const seenCanonicals = new Map();
const seenHeadlines = new Map();
const existingStoryPaths = new Set(works.map(work => `/kyokai-yawa/stories/${work.file}`));
const knownTopAnchors = new Set(['works', 'series-makabe', 'series-kurose', 'series-sakaki', 'series-kansoku']);

const countMatches = (value, regex) => [...value.matchAll(regex)].length;
const textContent = value => value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const addSeen = (map, value, id, label) => {
  if (!value) return;
  const prior = map.get(value);
  if (prior) errors.push(`${id}: ${label}が${prior}と重複しています（${value}）`);
  else map.set(value, id);
};

const indexHtml = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : '';
for (const anchor of knownTopAnchors) {
  if (!new RegExp(`id=["']${anchor}["']`).test(indexHtml)) {
    errors.push(`index.html: #${anchor} が存在しません`);
  }
}

for (const work of works) {
  const filePath = path.join(root, 'stories', work.file);
  if (!fs.existsSync(filePath)) {
    errors.push(`${work.id}: 作品ファイルが存在しません`);
    continue;
  }
  const html = fs.readFileSync(filePath, 'utf8');

  const lang = html.match(/<html\b[^>]*\blang=["']([^"']+)["']/i)?.[1] || '';
  const title = textContent(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '');
  const description = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1] || '';
  const robots = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i)?.[1] || '';
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1] || '';
  const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']*)["']/i)?.[1] || '';
  const ogDescription = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']*)["']/i)?.[1] || '';
  const ogUrl = html.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']*)["']/i)?.[1] || '';
  const twitterCard = html.match(/<meta\s+name=["']twitter:card["']\s+content=["']([^"']*)["']/i)?.[1] || '';
  const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  const headline = textContent(h1Matches[0]?.[1] || '');
  const expectedCanonical = `https://allsunday1122.github.io/kyokai-yawa/stories/${work.file}`;

  if (lang !== 'ja') errors.push(`${work.id}: html langがjaではありません（${lang || 'なし'}）`);
  if (!/<meta\s+charset=["']?utf-8["']?\s*\/?>/i.test(html)) errors.push(`${work.id}: UTF-8 charsetがありません`);
  if (!/<meta\s+name=["']viewport["']\s+content=["'][^"']*width=device-width/i.test(html)) errors.push(`${work.id}: viewportがありません`);
  if (!title) errors.push(`${work.id}: titleがありません`);
  if (title && !title.includes(work.title)) errors.push(`${work.id}: titleに作品名がありません`);
  if (title && !title.includes('境界夜話')) errors.push(`${work.id}: titleにサイト名がありません`);
  if (!description) errors.push(`${work.id}: meta descriptionがありません`);
  if (description && [...description].length < 35) warnings.push(`${work.id}: descriptionが短いです（${[...description].length}文字）`);
  if (description && [...description].length > 160) warnings.push(`${work.id}: descriptionが長いです（${[...description].length}文字）`);
  if (!robots) errors.push(`${work.id}: robotsがありません`);
  if (canonical !== expectedCanonical) errors.push(`${work.id}: canonical不一致（${canonical || 'なし'}）`);
  if (!ogTitle) errors.push(`${work.id}: og:titleがありません`);
  if (!ogDescription) errors.push(`${work.id}: og:descriptionがありません`);
  if (ogUrl !== expectedCanonical) errors.push(`${work.id}: og:url不一致（${ogUrl || 'なし'}）`);
  if (!twitterCard) errors.push(`${work.id}: twitter:cardがありません`);
  if (h1Matches.length !== 1) errors.push(`${work.id}: H1が${h1Matches.length}件です`);
  if (headline !== work.title) errors.push(`${work.id}: H1と一覧作品名が不一致（${headline || 'なし'}）`);
  if (!/<article\b[^>]*\bid=["']story["'][^>]*\btabindex=["']-1["']/i.test(html) && !/<article\b[^>]*\btabindex=["']-1["'][^>]*\bid=["']story["']/i.test(html)) {
    errors.push(`${work.id}: article#storyにtabindex=-1がありません`);
  }
  if (!/<a\b[^>]*class=["'][^"']*skip[^"']*["'][^>]*href=["']#story["']/i.test(html) && !/<a\b[^>]*href=["']#story["'][^>]*class=["'][^"']*skip[^"']*["']/i.test(html)) {
    errors.push(`${work.id}: 本文スキップリンクがありません`);
  }

  const jsonText = html.match(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/i)?.[1] || '';
  let jsonLd = null;
  if (!jsonText) {
    errors.push(`${work.id}: JSON-LDがありません`);
  } else {
    try {
      jsonLd = JSON.parse(jsonText);
    } catch (error) {
      errors.push(`${work.id}: JSON-LDが不正です（${error.message}）`);
    }
  }
  if (jsonLd) {
    if (jsonLd['@type'] !== 'ShortStory') errors.push(`${work.id}: JSON-LD @typeがShortStoryではありません`);
    if (jsonLd.headline !== work.title) errors.push(`${work.id}: JSON-LD headline不一致`);
    if (jsonLd.url !== expectedCanonical) errors.push(`${work.id}: JSON-LD URL不一致`);
    if (jsonLd.inLanguage !== 'ja') errors.push(`${work.id}: JSON-LD inLanguageがjaではありません`);
    if (!/^PT\d+M$/.test(String(jsonLd.timeRequired || ''))) errors.push(`${work.id}: JSON-LD timeRequiredが不正です`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(jsonLd.datePublished || ''))) errors.push(`${work.id}: JSON-LD datePublishedが不正です`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(jsonLd.dateModified || ''))) errors.push(`${work.id}: JSON-LD dateModifiedが不正です`);
  }

  const hrefs = [...html.matchAll(/href=["']([^"']+)["']/gi)].map(match => match[1]);
  for (const href of hrefs) {
    if (!href.startsWith('/kyokai-yawa/')) continue;
    if (href.startsWith('/kyokai-yawa/stories/')) {
      const pathOnly = href.split('#')[0];
      if (!existingStoryPaths.has(pathOnly)) errors.push(`${work.id}: 存在しない作品リンク ${href}`);
      continue;
    }
    if (href === '/kyokai-yawa/' || href === '/kyokai-yawa/#works') continue;
    if (href.startsWith('/kyokai-yawa/#')) {
      const anchor = href.slice('/kyokai-yawa/#'.length);
      if (!knownTopAnchors.has(anchor)) errors.push(`${work.id}: 存在しないトップアンカー #${anchor}`);
      continue;
    }
    errors.push(`${work.id}: 未確認の内部リンク ${href}`);
  }

  addSeen(seenTitles, title, work.id, 'title');
  addSeen(seenCanonicals, canonical, work.id, 'canonical');
  addSeen(seenHeadlines, headline, work.id, 'H1');
  rows.push({ id: work.id, title, descriptionLength: [...description].length, internalLinks: hrefs.filter(href => href.startsWith('/kyokai-yawa/')).length });
}

const report = [
  '# 境界夜話 HTML・内部リンク・アクセシビリティ監査',
  '',
  `- 対象: ${works.length}話`,
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
  '## 作品別概要',
  '',
  '| ID | title | description文字数 | 内部リンク数 |',
  '|---|---|---:|---:|',
  ...rows.map(row => `| ${row.id} | ${row.title.replace(/\|/g, '｜')} | ${row.descriptionLength} | ${row.internalLinks} |`),
  '',
].join('\n');

fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
fs.writeFileSync(path.join(root, 'reports', 'html-basics-audit.md'), report);
console.log(report);
if (errors.length) process.exitCode = 1;
