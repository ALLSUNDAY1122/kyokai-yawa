from __future__ import annotations

import html
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATE = "2026-07-18"

STORIES = [
    {
        "id": "MKB-009",
        "slug": "mkb-009-yoyakusha-mei-wa-kuran",
        "title": "予約者名は空欄",
        "series": "真壁夜話",
        "eyebrow": "Makabe Night Tales · MKB-009",
        "episode": "第9話",
        "length": "短編",
        "read": "約6分",
        "minutes": "PT6M",
        "fear": "4",
        "description": "予約者名だけが空欄の会議室予約が、別々の利用者六人を一件の参加者へ統合し、準備担当者を最後に予約者へ確定する都市怪談。",
        "summary": "予約者名だけが空欄の4B会議室。人数、座席、飲料、入室順は先に決まり、別々の予約を取り消された六人が一件の参加者として処理されていく。",
        "notice": "この作品はフィクションです。完全オリジナル作品として編集確認を経て掲載しています。実在の貸会議室、予約サービス、企業、人物とは関係ありません。",
        "template": "stories/mkb-008-mujin-reji-no-miseisansha.html",
        "body_file": "publish-mkb009.body.txt",
        "card": "予約者名だけが空欄の会議室予約が、座席と飲料に合わせて無関係な六人を統合し、受付担当者を主催者へ確定する。",
        "genres": ["怪談", "ホラー", "都市", "記録"],
        "work_marker": "/kyokai-yawa/stories/krs-001-sanbonme-no-sakaigi.html",
        "list_marker": "<li><a class=\"story-link\" href=\"/kyokai-yawa/stories/mkb-008-mujin-reji-no-miseisansha.html\"",
        "sitemap_marker": "  <url><loc>https://allsunday1122.github.io/kyokai-yawa/stories/krs-001-sanbonme-no-sakaigi.html</loc>",
    },
    {
        "id": "KRS-009",
        "slug": "krs-009-gakko-enkaku-no-kuhakunen",
        "title": "学校沿革の空白年",
        "series": "黒瀬蒐集録",
        "eyebrow": "Kurose Archive · KRS-009",
        "episode": "第9話",
        "length": "中編",
        "read": "約12分",
        "minutes": "PT12M",
        "fear": "4",
        "description": "閉校した分校の沿革誌から一年度だけが抜け、補遺を作るたび次の年度へ空白が移る記録怪談。",
        "summary": "閉校した分校の沿革誌から昭和六十二年度だけが欠落している。資料を照合して補遺を作ると、空白は翌年度へ移動する。",
        "notice": "この作品はフィクションです。完全オリジナル作品として編集確認を経て掲載しています。実在の学校、自治体、資料館、人物とは関係ありません。",
        "template": "stories/krs-008-se-o-mukeru-hokora.html",
        "body_file": "publish-krs009.body.txt",
        "card": "分校の沿革誌から一年度だけが欠落し、資料を復元すると空白が翌年度へ移り、未来日付の補遺が先に届く。",
        "genres": ["怪談", "ホラー", "民俗", "学校記録"],
        "work_marker": "/kyokai-yawa/stories/skk-001-butsuma-no-natsufuku.html",
        "list_marker": "<li><a class=\"story-link\" href=\"/kyokai-yawa/stories/krs-008-se-o-mukeru-hokora.html\"",
        "sitemap_marker": "  <url><loc>https://allsunday1122.github.io/kyokai-yawa/stories/skk-001-butsuma-no-natsufuku.html</loc>",
    },
]


def paragraphs(body: str) -> str:
    return "\n".join(f"      <p>{html.escape(line)}</p>" for line in body.splitlines() if line.strip())


def replace_once(text: str, pattern: str, replacement: str, label: str, flags: int = 0) -> str:
    new, count = re.subn(pattern, replacement, text, count=1, flags=flags)
    if count != 1:
        raise RuntimeError(f"Replacement failed for {label}: {count}")
    return new


def make_story(story: dict[str, object]) -> None:
    template = (ROOT / str(story["template"])).read_text(encoding="utf-8")
    body = (ROOT / str(story["body_file"])).read_text(encoding="utf-8").strip()
    url = f"https://allsunday1122.github.io/kyokai-yawa/stories/{story['slug']}.html"
    ld = {
        "@context": "https://schema.org",
        "@type": "ShortStory",
        "headline": story["title"],
        "description": story["description"],
        "isPartOf": {"@type": "CreativeWorkSeries", "name": story["series"]},
        "inLanguage": "ja",
        "url": url,
        "datePublished": DATE,
        "timeRequired": story["minutes"],
        "genre": story["genres"],
    }

    text = template
    text = replace_once(text, r"<title>.*?</title>", f"<title>{story['title']}｜{story['series']}｜境界夜話</title>", "title")
    text = replace_once(text, r'<meta name="description" content=".*?">', f'<meta name="description" content="{story["description"]}">', "description")
    text = replace_once(text, r'<link rel="canonical" href=".*?">', f'<link rel="canonical" href="{url}">', "canonical")
    text = replace_once(text, r'<meta property="og:title" content=".*?">', f'<meta property="og:title" content="{story["title"]}｜{story["series"]}">', "og title")
    text = replace_once(text, r'<meta property="og:description" content=".*?">', f'<meta property="og:description" content="{story["description"]}">', "og description")
    text = replace_once(text, r'<meta property="og:url" content=".*?">', f'<meta property="og:url" content="{url}">', "og url")
    text = replace_once(text, r'<script type="application/ld\+json">.*?</script>', f'<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False, separators=(",", ":"))}</script>', "json ld")
    text = replace_once(text, r'<p class="eyebrow">.*?</p>', f'<p class="eyebrow">{story["eyebrow"]}</p>', "eyebrow")
    text = replace_once(text, r'<h1>.*?</h1>', f'<h1>{story["title"]}</h1>', "h1")
    text = replace_once(text, r'<p class="summary">.*?</p>', f'<p class="summary">{story["summary"]}</p>', "summary")
    text = replace_once(text, r'<div class="meta" aria-label="作品情報">.*?</div>', f'<div class="meta" aria-label="作品情報"><span>{story["series"]}</span><span>{story["episode"]}</span><span>{story["length"]}</span><span>{story["read"]}</span><span>恐怖レベル {story["fear"]}</span></div>', "meta")
    article = f'<article id="story" tabindex="-1">\n{paragraphs(body)}\n    </article>'
    text = replace_once(text, r'<article id="story" tabindex="-1">.*?</article>', article, "article", re.S)
    text = replace_once(text, r'<p class="notice">.*?</p>', f'<p class="notice">{story["notice"]}</p>', "notice")
    out = ROOT / "stories" / f"{story['slug']}.html"
    if out.exists():
        raise RuntimeError(f"Story already exists: {out}")
    out.write_text(text, encoding="utf-8")


def card(story: dict[str, object]) -> str:
    return (f'      <a class="work-card" href="/kyokai-yawa/stories/{story["slug"]}.html">'
            f'<div><span class="id">{story["id"]} · {story["series"]}</span><h3>{story["title"]}</h3>'
            f'<p>{story["card"]}</p></div><div class="work-meta"><span class="tag">{story["length"]}</span>'
            f'<span class="tag">{story["read"]}</span><span class="tag">恐怖 {story["fear"]}</span></div></a>')


def list_item(story: dict[str, object]) -> str:
    return (f'<li><a class="story-link" href="/kyokai-yawa/stories/{story["slug"]}.html">'
            f'<span class="story-id">{story["id"]}</span><span class="story-title">{story["title"]}</span>'
            f'<span class="story-arrow">›</span></a></li>')


for item in STORIES:
    make_story(item)

index_path = ROOT / "index.html"
index = index_path.read_text(encoding="utf-8")
if any(f"{item['slug']}.html" in index for item in STORIES):
    raise RuntimeError("One or more stories already listed")

for item in STORIES:
    marker = f'      <a class="work-card" href="{item["work_marker"]}'
    if marker not in index:
        raise RuntimeError(f'Work marker missing: {item["id"]}')
    index = index.replace(marker, card(item) + "\n" + marker, 1)

for item in STORIES:
    marker_start = str(item["list_marker"])
    start = index.find(marker_start)
    if start < 0:
        raise RuntimeError(f'List marker missing: {item["id"]}')
    end = index.find("</li>", start)
    if end < 0:
        raise RuntimeError(f'List item end missing: {item["id"]}')
    end += len("</li>")
    index = index[:end] + list_item(item) + index[end:]

index = index.replace('<h3>真壁夜話</h3><span class="series-count">8話公開</span>', '<h3>真壁夜話</h3><span class="series-count">9話公開</span>', 1)
index = index.replace('<h3>黒瀬蒐集録</h3><span class="series-count">8話公開</span>', '<h3>黒瀬蒐集録</h3><span class="series-count">9話公開</span>', 1)
index_path.write_text(index, encoding="utf-8")

sitemap_path = ROOT / "sitemap.xml"
sitemap = sitemap_path.read_text(encoding="utf-8")
for item in STORIES:
    url_line = f'  <url><loc>https://allsunday1122.github.io/kyokai-yawa/stories/{item["slug"]}.html</loc><lastmod>{DATE}</lastmod></url>'
    marker = str(item["sitemap_marker"])
    if marker not in sitemap:
        raise RuntimeError(f'Sitemap marker missing: {item["id"]}')
    sitemap = sitemap.replace(marker, url_line + "\n" + marker, 1)
sitemap_path.write_text(sitemap, encoding="utf-8")

if index.count('class="work-card"') != 35:
    raise RuntimeError("Expected 35 work cards, got %s" % index.count('class="work-card"'))
expected_counts = {"真壁夜話": 9, "黒瀬蒐集録": 9, "榊家異聞": 9, "境界観測記": 8}
for series, count in expected_counts.items():
    if f'<h3>{series}</h3><span class="series-count">{count}話公開</span>' not in index:
        raise RuntimeError(f"Series count not updated: {series}")
if sitemap.count("<loc>") != 36:
    raise RuntimeError("Expected 36 sitemap URLs, got %s" % sitemap.count("<loc>"))
for item in STORIES:
    story_html = (ROOT / "stories" / f"{item['slug']}.html").read_text(encoding="utf-8")
    body = (ROOT / str(item["body_file"])).read_text(encoding="utf-8").strip()
    first = body.splitlines()[0]
    last = body.splitlines()[-1]
    if html.escape(first) not in story_html or html.escape(last) not in story_html:
        raise RuntimeError(f'Story boundary validation failed: {item["id"]}')
    if story_html.count('<article id="story"') != 1:
        raise RuntimeError(f'Article structure invalid: {item["id"]}')
    if f"{item['slug']}.html" not in index or f"{item['slug']}.html" not in sitemap:
        raise RuntimeError(f'Archive registration failed: {item["id"]}')

temp_paths = [
    ROOT / "publish-mkb009.body.txt",
    ROOT / "publish-krs009.body.txt",
    ROOT / "publish_batch_20260718_4.py",
    ROOT / "publish-batch-20260718-4.trigger",
    ROOT / ".github" / "workflows" / "publish-batch-20260718-4.yml",
]
for temp in temp_paths:
    if temp.exists():
        temp.unlink()

subprocess.run(["git", "config", "user.name", "github-actions[bot]"], cwd=ROOT, check=True)
subprocess.run(["git", "config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"], cwd=ROOT, check=True)
subprocess.run(["git", "add", "-A"], cwd=ROOT, check=True)
subprocess.run(["git", "commit", "-m", "Publish MKB-009 and KRS-009"], cwd=ROOT, check=True)
subprocess.run(["git", "push", "origin", "HEAD:main"], cwd=ROOT, check=True)
