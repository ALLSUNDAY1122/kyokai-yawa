import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const worksPath = path.join(root, 'data', 'works.js');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(worksPath, 'utf8'), context, { filename: worksPath });
const works = context.window.KYOKAI_WORKS || [];
const errors = [];
const rows = [];
const counts = new Map([[3, 0], [4, 0], [5, 0]]);
const seriesCounts = new Map();

for (const work of works) {
  const listFear = Number(work.fear);
  if (![3, 4, 5].includes(listFear)) {
    errors.push(`${work.id}: 一覧の恐怖レベルが3〜5ではありません（${work.fear}）`);
    continue;
  }

  const filePath = path.join(root, 'stories', work.file);
  if (!fs.existsSync(filePath)) {
    errors.push(`${work.id}: 作品ファイルが存在しません`);
    continue;
  }

  const html = fs.readFileSync(filePath, 'utf8');
  const pageFear = Number(html.match(/<span>恐怖レベル\s*([1-5])<\/span>/i)?.[1]);
  if (![3, 4, 5].includes(pageFear)) {
    errors.push(`${work.id}: ページの恐怖レベルが3〜5で取得できません`);
  } else if (pageFear !== listFear) {
    errors.push(`${work.id}: ページ${pageFear}と一覧${listFear}が不一致です`);
  }

  counts.set(listFear, (counts.get(listFear) || 0) + 1);
  if (!seriesCounts.has(work.series)) seriesCounts.set(work.series, new Map([[3, 0], [4, 0], [5, 0]]));
  const seriesMap = seriesCounts.get(work.series);
  seriesMap.set(listFear, (seriesMap.get(listFear) || 0) + 1);
  rows.push({ id: work.id, series: work.series, title: work.title, fear: listFear });
}

const report = [
  '# 境界夜話 恐怖レベル監査',
  '',
  `- 対象: ${works.length}話`,
  `- エラー: ${errors.length}`,
  '- レベル3: 不穏さ中心。直接的生命危険や恒久的な自己喪失がない',
  '- レベル4: 生命・身体・住居・家族関係・身分に直接危険が及ぶ、または未解決の侵害が残る',
  '- レベル5: 死亡可能性、人物消去、集団災害など重大かつ不可逆性の高い危険',
  '',
  '## 全体分布',
  '',
  `- レベル3: ${counts.get(3)}話`,
  `- レベル4: ${counts.get(4)}話`,
  `- レベル5: ${counts.get(5)}話`,
  '',
  '## シリーズ別分布',
  '',
  '| シリーズ | レベル3 | レベル4 | レベル5 |',
  '|---|---:|---:|---:|',
  ...[...seriesCounts].map(([series, values]) => `| ${series} | ${values.get(3)} | ${values.get(4)} | ${values.get(5)} |`),
  '',
  '## エラー',
  '',
  ...(errors.length ? errors.map(error => `- ${error}`) : ['- なし']),
  '',
  '## 作品別一覧',
  '',
  '| ID | シリーズ | 作品名 | 恐怖レベル |',
  '|---|---|---|---:|',
  ...rows.map(row => `| ${row.id} | ${row.series} | ${row.title.replace(/\|/g, '｜')} | ${row.fear} |`),
  '',
].join('\n');

fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
fs.writeFileSync(path.join(root, 'reports', 'fear-level-audit.md'), report);
console.log(report);
if (errors.length) process.exitCode = 1;
