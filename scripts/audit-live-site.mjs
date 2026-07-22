import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { performance } from 'node:perf_hooks';

const root = process.cwd();
const base = 'https://allsunday1122.github.io/kyokai-yawa/';
const worksPath = path.join(root, 'data', 'works.js');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(worksPath, 'utf8'), context, { filename: worksPath });
const works = context.window.KYOKAI_WORKS || [];
const errors = [];
const warnings = [];
const rows = [];
const pageBodies = new Map();

const request = async (url, options = {}) => {
  const started = performance.now();
  const response = await fetch(url, {
    redirect: options.redirect || 'follow',
    cache: 'no-store',
    headers: {
      'user-agent': 'KyokaiYawa-Live-Audit/1.0 (+https://allsunday1122.github.io/kyokai-yawa/)',
      accept: options.accept || '*/*',
    },
  });
  const elapsed = performance.now() - started;
  const body = options.body === false ? '' : await response.text();
  return { response, body, elapsed };
};

const median = values => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const percentile = (values, rate) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * rate) - 1)];
};
const formatMs = value => `${Math.round(value)}ms`;
const contentType = response => response.headers.get('content-type') || '';
const headerSummary = response => ({
  cacheControl: response.headers.get('cache-control') || '-',
  etag: response.headers.get('etag') || '-',
  lastModified: response.headers.get('last-modified') || '-',
  encoding: response.headers.get('content-encoding') || '-',
  server: response.headers.get('server') || '-',
  xCache: response.headers.get('x-cache') || '-',
});

const htmlTargets = [
  { id: 'TOP', url: base, canonical: base, title: '境界夜話' },
  ...works.map(work => ({
    id: work.id,
    url: `${base}stories/${work.file}`,
    canonical: `${base}stories/${work.file}`,
    title: work.title,
  })),
];
const iconFragments = [
  '<link rel="manifest" href="/kyokai-yawa/manifest.webmanifest">',
  '<link rel="icon" type="image/svg+xml" href="/kyokai-yawa/assets/app-icon.svg">',
  '<link rel="icon" type="image/png" sizes="192x192" href="/kyokai-yawa/assets/app-icon-192.png">',
  '<link rel="apple-touch-icon" sizes="180x180" href="/kyokai-yawa/assets/apple-touch-icon.png">',
  '<meta name="apple-mobile-web-app-title" content="境界夜話">',
];

for (const target of htmlTargets) {
  try {
    const { response, body, elapsed } = await request(target.url, { accept: 'text/html' });
    const type = contentType(response);
    rows.push({ id: target.id, url: target.url, status: response.status, type, elapsed, headers: headerSummary(response) });
    pageBodies.set(target.url, body);
    if (response.status !== 200) errors.push(`${target.id}: HTTP ${response.status}`);
    if (!type.toLowerCase().includes('text/html')) errors.push(`${target.id}: Content-TypeがHTMLではありません（${type || 'なし'}）`);
    if (!body.includes(`<link rel="canonical" href="${target.canonical}">`) && !body.includes(`<link rel='canonical' href='${target.canonical}'>`)) {
      errors.push(`${target.id}: 本番HTMLのcanonicalが不正です`);
    }
    if (!body.includes(target.title)) errors.push(`${target.id}: 本番HTMLにtitle文字列がありません`);
    for (const fragment of iconFragments) {
      if (!body.includes(fragment)) errors.push(`${target.id}: 本番HTMLにサイトアイコン設定がありません（${fragment}）`);
    }
  } catch (error) {
    errors.push(`${target.id}: 取得失敗（${error.message}）`);
  }
}

const topHtml = pageBodies.get(base) || '';
const staticStoryLinks = [...topHtml.matchAll(/href=["']\/kyokai-yawa\/stories\/([^"']+)["']/g)]
  .map(match => match[1])
  .filter(link => link.endsWith('.html'));
const uniqueStaticLinks = new Set(staticStoryLinks);
if (uniqueStaticLinks.size !== works.length) errors.push(`トップページの静的作品リンクが${works.length}件ではありません（${uniqueStaticLinks.size}件）`);
for (const work of works) if (!uniqueStaticLinks.has(work.file)) errors.push(`トップページに${work.id}の静的リンクがありません`);

const iconAssetPaths = [
  'manifest.webmanifest',
  'assets/app-icon.svg',
  'assets/app-icon-192.png',
  'assets/app-icon-512.png',
  'assets/apple-touch-icon.png',
];
const assetPaths = new Set([
  'assets/social-card.png',
  ...iconAssetPaths,
  'feed.xml',
  'sitemap.xml',
  'robots.txt',
]);
for (const body of pageBodies.values()) {
  for (const match of body.matchAll(/(?:src|href)=["']\/kyokai-yawa\/([^"'#?]+)["']/g)) {
    const asset = match[1];
    if (!asset.startsWith('stories/') && asset) assetPaths.add(asset);
  }
}

const expectedTypes = asset => {
  if (asset.endsWith('.png')) return ['image/png'];
  if (asset.endsWith('.svg')) return ['image/svg+xml'];
  if (asset.endsWith('.css')) return ['text/css'];
  if (asset.endsWith('.js')) return ['javascript'];
  if (asset.endsWith('.xml')) return ['xml'];
  if (asset.endsWith('.webmanifest')) return ['manifest+json', 'application/json'];
  if (asset.endsWith('.txt')) return ['text/plain'];
  return [];
};

for (const asset of [...assetPaths].sort()) {
  const url = `${base}${asset}`;
  try {
    const { response, body, elapsed } = await request(url);
    const type = contentType(response);
    rows.push({ id: asset, url, status: response.status, type, elapsed, headers: headerSummary(response) });
    if (response.status !== 200) errors.push(`${asset}: HTTP ${response.status}`);
    const expected = expectedTypes(asset);
    if (expected.length && !expected.some(value => type.toLowerCase().includes(value))) {
      errors.push(`${asset}: Content-Type不一致（${type || 'なし'}）`);
    }
    if (asset === 'manifest.webmanifest') {
      try {
        const manifest = JSON.parse(body);
        if (manifest.name !== '境界夜話｜四つの怪談アーカイブ') errors.push('manifest.webmanifest: nameが不正です');
        if (manifest.start_url !== '/kyokai-yawa/' || manifest.scope !== '/kyokai-yawa/') errors.push('manifest.webmanifest: start_urlまたはscopeが不正です');
        if (!Array.isArray(manifest.icons) || manifest.icons.length < 2) errors.push('manifest.webmanifest: アイコンが2件未満です');
      } catch (error) {
        errors.push(`manifest.webmanifest: 本番JSONが不正です（${error.message}）`);
      }
    }
  } catch (error) {
    errors.push(`${asset}: 取得失敗（${error.message}）`);
  }
}

try {
  const { response } = await request('https://allsunday1122.github.io/kyokai-yawa', { redirect: 'manual', body: false });
  const location = response.headers.get('location') || '';
  if (![301, 302, 307, 308].includes(response.status)) errors.push(`末尾スラッシュなしURL: HTTP ${response.status}（リダイレクトではありません）`);
  if (location && !location.endsWith('/kyokai-yawa/')) errors.push(`末尾スラッシュなしURL: 転送先が不正です（${location}）`);
} catch (error) {
  errors.push(`末尾スラッシュなしURL: 取得失敗（${error.message}）`);
}

try {
  const missingUrl = `${base}__live-audit-missing-${Date.now()}.html`;
  const { response, body } = await request(missingUrl, { accept: 'text/html' });
  if (response.status !== 404) errors.push(`存在しないURL: HTTP ${response.status}（404ではありません）`);
  if (!body.includes('その記録は見つかりません')) errors.push('存在しないURL: カスタム404本文が配信されていません');
  if (!/noindex/i.test(body)) errors.push('存在しないURL: 404本文にnoindexがありません');
  for (const fragment of iconFragments) {
    if (!body.includes(fragment)) errors.push(`存在しないURL: 404本文にサイトアイコン設定がありません（${fragment}）`);
  }
} catch (error) {
  errors.push(`存在しないURL: 取得失敗（${error.message}）`);
}

const timings = rows.map(row => row.elapsed);
const htmlRows = rows.filter(row => row.type.toLowerCase().includes('text/html'));
const topRow = rows.find(row => row.id === 'TOP');
if (topRow && topRow.headers.cacheControl === '-') warnings.push('トップページにCache-Controlがありません');
if (topRow && topRow.headers.encoding === '-') warnings.push('トップページのContent-Encodingが確認できません');
if (percentile(timings, 0.95) > 2000) warnings.push(`本番取得時間のp95が2秒を超えています（${formatMs(percentile(timings, 0.95))}）`);

const report = [
  '# 境界夜話 本番配信監査',
  '',
  `- 実行日時: ${new Date().toISOString()}`,
  `- HTML確認: ${htmlTargets.length}ページ`,
  `- 公開資産確認: ${assetPaths.size}件`,
  `- アイコン・manifest本番確認: ${iconAssetPaths.length}件`,
  `- エラー: ${errors.length}`,
  `- 警告: ${warnings.length}`,
  `- 応答時間中央値: ${formatMs(median(timings))}`,
  `- 応答時間p95: ${formatMs(percentile(timings, 0.95))}`,
  `- 最大応答時間: ${formatMs(Math.max(0, ...timings))}`,
  '',
  '## エラー',
  '',
  ...(errors.length ? errors.map(error => `- ${error}`) : ['- なし']),
  '',
  '## 警告',
  '',
  ...(warnings.length ? warnings.map(warning => `- ${warning}`) : ['- なし']),
  '',
  '## 本番ヘッダー概要',
  '',
  '| 対象 | HTTP | Content-Type | Cache-Control | ETag | Last-Modified | Encoding | 応答 |',
  '|---|---:|---|---|---|---|---|---:|',
  ...rows.map(row => `| ${row.id} | ${row.status} | ${row.type.replaceAll('|', '｜')} | ${row.headers.cacheControl.replaceAll('|', '｜')} | ${row.headers.etag.replaceAll('|', '｜')} | ${row.headers.lastModified.replaceAll('|', '｜')} | ${row.headers.encoding.replaceAll('|', '｜')} | ${formatMs(row.elapsed)} |`),
  '',
  '## 集計',
  '',
  `- HTML 200応答: ${htmlRows.filter(row => row.status === 200).length}/${htmlTargets.length}`,
  `- トップ静的作品リンク: ${uniqueStaticLinks.size}/${works.length}`,
  `- アイコン・manifest HTTP 200: ${rows.filter(row => iconAssetPaths.includes(row.id) && row.status === 200).length}/${iconAssetPaths.length}`,
  `- 監査対象総数: ${rows.length}件`,
  '',
].join('\n');

fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
fs.writeFileSync(path.join(root, 'reports', 'live-site-audit.md'), report);
console.log(report);
if (errors.length) process.exitCode = 1;
