import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const worksPath = path.join(root, 'data', 'works.js');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(worksPath, 'utf8'), context, { filename: worksPath });
const works = context.window.KYOKAI_WORKS || [];

const styleBlock = `<!-- READER_STYLES_START -->\n<link rel="stylesheet" href="/kyokai-yawa/data/reader-tools.css">\n<!-- READER_STYLES_END -->`;
const scriptBlock = `<!-- READER_SCRIPT_START -->\n<script src="/kyokai-yawa/data/reader-tools.js" defer></script>\n<!-- READER_SCRIPT_END -->`;
const stylePattern = /\s*<!-- READER_STYLES_START -->[\s\S]*?<!-- READER_STYLES_END -->\s*/g;
const scriptPattern = /\s*<!-- READER_SCRIPT_START -->[\s\S]*?<!-- READER_SCRIPT_END -->\s*/g;

let changed = 0;
for (const work of works) {
  const file = path.join(root, 'stories', work.file);
  if (!fs.existsSync(file)) throw new Error(`${work.id}: ${work.file}が存在しません`);
  const original = fs.readFileSync(file, 'utf8');
  let html = original.replace(stylePattern, '\n').replace(scriptPattern, '\n');

  if (!html.includes('</head>')) throw new Error(`${work.id}: </head>がありません`);
  html = html.replace('</head>', `${styleBlock}\n</head>`);

  if (html.includes('<!-- SW_REGISTER_START -->')) {
    html = html.replace('<!-- SW_REGISTER_START -->', `${scriptBlock}\n<!-- SW_REGISTER_START -->`);
  } else if (html.includes('</body>')) {
    html = html.replace('</body>', `${scriptBlock}\n</body>`);
  } else {
    throw new Error(`${work.id}: </body>がありません`);
  }

  if (html !== original) {
    fs.writeFileSync(file, html);
    changed += 1;
  }
}

console.log(`Reader tools normalized: ${changed}/${works.length} pages changed.`);
