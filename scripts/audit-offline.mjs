import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const worksPath = path.join(root, 'data', 'works.js');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(worksPath, 'utf8'), context, { filename: worksPath });
const works = context.window.KYOKAI_WORKS || [];
const errors = [];
const warnings = [];

const requiredFiles = [
  'service-worker.js',
  'offline.html',
  'data/sw-register.js',
];
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`${file}が存在しません`);
}

const workerPath = path.join(root, 'service-worker.js');
let worker = '';
if (fs.existsSync(workerPath)) worker = fs.readFileSync(workerPath, 'utf8');
const workerRequirements = [
  ["self.addEventListener('install'", 'installイベント'],
  ["self.addEventListener('activate'", 'activateイベント'],
  ["self.addEventListener('fetch'", 'fetchイベント'],
  ['self.skipWaiting()', '即時更新処理'],
  ['self.clients.claim()', '新service workerの制御取得'],
  ["request.mode === 'navigate'", '画面遷移の判定'],
  ["cache: 'no-store'", 'オンライン時の最新取得'],
  ['OFFLINE_URL', 'オフラインフォールバック'],
  ["key.startsWith('kyokai-yawa-')", '旧キャッシュ削除対象'],
  ['caches.delete(key)', '旧キャッシュ削除処理'],
];
for (const [fragment, label] of workerRequirements) {
  if (!worker.includes(fragment)) errors.push(`service-worker.jsに${label}がありません`);
}
const precache = worker.match(/const PRECACHE = \[([\s\S]*?)\];/)?.[1] || '';
if (precache.includes('/stories/')) errors.push('全作品本文を事前キャッシュしています。作品本文は閲覧時のみ保存してください');
if (!precache.includes('offline.html')) errors.push('offline.htmlが事前キャッシュされていません');
if (!worker.includes('storeSuccessfulResponse(PAGE_CACHE') && !worker.includes('networkFirst(request, PAGE_CACHE')) {
  errors.push('閲覧済みページを通信成功時に更新する処理がありません');
}

const registerPath = path.join(root, 'data', 'sw-register.js');
let register = '';
if (fs.existsSync(registerPath)) register = fs.readFileSync(registerPath, 'utf8');
const registerRequirements = [
  ["navigator.serviceWorker.register('/kyokai-yawa/service-worker.js'", 'service worker登録先'],
  ["scope: '/kyokai-yawa/'", 'service worker scope'],
  ["updateViaCache: 'none'", 'service worker本体のキャッシュ回避'],
  ['registration.update()', '更新確認'],
];
for (const [fragment, label] of registerRequirements) {
  if (!register.includes(fragment)) errors.push(`sw-register.jsの${label}が不正です`);
}

const offlinePath = path.join(root, 'offline.html');
let offline = '';
if (fs.existsSync(offlinePath)) offline = fs.readFileSync(offlinePath, 'utf8');
if (!/<meta\s+name=["']robots["'][^>]*noindex/i.test(offline)) errors.push('offline.htmlにnoindexがありません');
if (!offline.includes('href="/kyokai-yawa/"')) errors.push('offline.htmlにトップページへの復帰リンクがありません');
if (!offline.includes('必ず公開中の最新版を取得')) errors.push('offline.htmlに更新方針の説明がありません');

const pages = [
  ['TOP', path.join(root, 'index.html')],
  ['404', path.join(root, '404.html')],
  ['OFFLINE', offlinePath],
  ...works.map(work => [work.id, path.join(root, 'stories', work.file)]),
];
const scriptPattern = /<script\s+src=["']\/kyokai-yawa\/data\/sw-register\.js["'][^>]*><\/script>/gi;
for (const [id, file] of pages) {
  if (!fs.existsSync(file)) {
    errors.push(`${id}: HTMLが存在しません`);
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  const matches = [...html.matchAll(scriptPattern)];
  if (matches.length !== 1) errors.push(`${id}: service worker登録scriptが1件ではありません（${matches.length}件）`);
  if (matches[0] && !/\sdefer(?:\s|>)/i.test(matches[0][0])) errors.push(`${id}: service worker登録scriptにdeferがありません`);
  if (!html.includes('<!-- SW_REGISTER_START -->') || !html.includes('<!-- SW_REGISTER_END -->')) {
    errors.push(`${id}: service worker登録の正規化マーカーがありません`);
  }
}

const report = [
  '# 境界夜話 Service Worker・オフライン監査',
  '',
  `- HTML確認: ${pages.length}ページ`,
  `- 公開作品: ${works.length}話`,
  '- 更新方式: HTML・通常資産はnetwork-first、内容ハッシュ付きCSSのみcache-first',
  '- オフライン方式: 閲覧済みページを利用し、未保存ページはoffline.htmlへフォールバック',
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
fs.writeFileSync(path.join(root, 'reports', 'offline-audit.md'), report);
console.log(report);
if (errors.length) process.exitCode = 1;
