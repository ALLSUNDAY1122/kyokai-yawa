import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const worksPath = path.join(root, 'data', 'works.js');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(worksPath, 'utf8'), context, { filename: worksPath });
const works = context.window.KYOKAI_WORKS || [];

const block = `<!-- SW_REGISTER_START -->\n<script src="/kyokai-yawa/data/sw-register.js" defer></script>\n<!-- SW_REGISTER_END -->`;
const pages = [
  path.join(root, 'index.html'),
  path.join(root, '404.html'),
  path.join(root, 'offline.html'),
  ...works.map(work => path.join(root, 'stories', work.file)),
];

let changed = 0;
for (const file of pages) {
  if (!fs.existsSync(file)) throw new Error(`HTMLが存在しません: ${path.relative(root, file)}`);
  const original = fs.readFileSync(file, 'utf8');
  let html = original
    .replace(/\s*<!-- SW_REGISTER_START -->[\s\S]*?<!-- SW_REGISTER_END -->\s*/g, '\n')
    .replace(/\s*<script\s+src=["']\/kyokai-yawa\/data\/sw-register\.js["'][^>]*><\/script>\s*/gi, '\n');

  if (!/<\/body>/i.test(html)) throw new Error(`</body>がありません: ${path.relative(root, file)}`);
  html = html.replace(/<\/body>/i, `${block}\n</body>`);
  if (html !== original) {
    fs.writeFileSync(file, html);
    changed += 1;
  }
}

console.log(`service worker登録を正規化: ${pages.length}ページ、変更${changed}ページ`);
