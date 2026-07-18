from __future__ import annotations

from html import escape
from pathlib import Path
import json
import subprocess

ROOT = Path(__file__).resolve().parent
DATE = "2026-07-18"
STORY_ID = "SKK-008"
TITLE = "秋の布団部屋"
SLUG = "skk-008-aki-no-futon-beya"
URL = f"https://allsunday1122.github.io/kyokai-yawa/stories/{SLUG}.html"
BODY = r'''祖母の家に親族が泊まったのは、十月の三連休だった。
祖母が亡くなってから五年、家は空き家のまま残っていた。法事や盆のたびに集まってはいたが、売るか残すかの話だけは決まらなかった。今回は母と伯父夫婦、従兄妹、弟の達也、私の七人で二泊し、家財の確認と不動産会社へ渡す書類をまとめることになっていた。
泊まりの準備をしたのは伯母の典子さんだった。
玄関脇の電話台に大学ノートを置き、到着した者の名前、車の台数、寝る部屋を書いた。古い家なので火の元と人数を確認するため、祖母が生きていた頃から、親族が大勢泊まる日は簡単な宿泊名簿を作っていたという。
一階の座敷に母と伯父夫婦。
二階の和室に従兄の圭介と達也。
従妹の美穂と私は、押入れのある八畳間。
七人だった。
布団部屋は廊下の突き当たりにあった。八畳の畳敷きで、壁一面が二段の押入れになっている。戸を開けると、湿った木と古い綿の匂いが流れ出した。
押入れの中には、敷布団と掛布団が十組ほど重ねられていた。どれも白い木綿のカバーに包まれ、端に色糸で番号が縫いつけてある。
典子さんは七組だけ出した。
「一番から七番までね」
畳へ並べると、部屋の空気が急に重くなった。押入れの湿気を吸った布団は冷たく、持ち上げるたび、乾ききらない綿の匂いがした。
私と美穂は六番と七番を使うことになった。
その夜は遅くまで売却書類を見ていた。十一時を過ぎてから各部屋へ分かれ、私は美穂と並んで寝た。窓側が六番、押入れ側が七番。私は窓側だった。
夜中に一度、寒さで目が覚めた。
十月とはいえ昼間は暖かかったのに、布団部屋だけが冷えていた。隣の美穂は背を向けて眠っている。押入れの襖は閉まっていた。
それ以外は何もなかった。
翌朝、典子さんが布団を上げに来て、入口で止まった。
「八つある」
敷かれていた布団は八組だった。
私と美穂が使った二組の横、押入れの前にもう一組あった。掛布団は胸のあたりまでめくれ、白い枕には頭の形の窪みが残っていた。
誰かが寝た跡だった。
典子さんが掛布団へ手を入れた。
「温かい」
私も触った。確かに内側だけがぬるく、敷布団の中央は人の汗を吸ったように湿っていた。
「達也じゃない？」
美穂が言った。
私は違うと答えた。達也は圭介と二階で寝ていた。
ところが達也は、朝食の席で当然のように言った。
「俺、途中から下へ来たよ」
「何時に？」
「一時くらい。圭介のいびきがうるさかったから」
圭介は否定した。
「達也は朝まで二階にいた。俺が先に起こした」
母は、押入れ前の布団で寝たのは圭介だと言った。
伯父は美穂だと思っていた。
七人全員、宿泊人数は七人だと答えた。それなのに、誰がどこで寝たかだけが一致しなかった。
典子さんが宿泊名簿を開いた。
寝場所の欄には、前夜に決めた通り書かれていた。
母・一階座敷。
正志・一階座敷。
典子・一階座敷。
圭介・二階和室。
達也・二階和室。
美穂・布団部屋七番。
奈津・布団部屋六番。
八組目の記載はなかった。
「片づける前に番号を見よう」
布団の端を探したが、八組目だけ番号がなかった。糸を抜いた跡もない。最初から誰にも割り当てられていない布団のようだった。
枕には窪みが残っていた。
丸い頭の跡ではなく、長い時間、同じ向きで寝た人のように右側だけ深く沈んでいる。枕カバーには短い髪が一本ついていた。
黒く、誰のものとも区別できなかった。
昼間、私たちは布団を干した。
庭へ七組並べ、番号のない一組だけは廊下に置いた。日差しを受けた布団からは、湿気と一緒に古い綿の匂いが強く立った。
夕方、取り込む段になると、母が言った。
「八番がない」
「八番は出してないよ」
典子さんが答えた。
母は庭を指した。
「朝、八番も干したでしょう」
誰も八番を見ていない。押入れの布団には一番から十番まで番号があり、八番はまだ上段に残っていた。
しかし母は、番号のない布団ではなく、八番に誰かが寝たと覚えていた。
伯父は三番だったと言った。
美穂は、私が七番に寝て、自分は番号のない布団だったと言い始めた。
私は窓側の六番で寝た記憶があった。畳の縁の模様も、窓から入る街灯の位置も覚えている。
それでも六番の敷布団を触ると、急に自信がなくなった。
その布団は完全に乾いていた。
私の寝汗も、体温も、何も残っていなかった。
反対に番号のない布団には、私が使っている柔軟剤に似た匂いがついていた。
二日目の夜、配置を記録することにした。
七組の布団を各部屋へ運び、枕元へ名前を書いた紙を置いた。布団部屋には私と美穂だけ。六番に私、七番に美穂。襖の取っ手には細い紙テープを貼り、誰かが開ければ切れるようにした。
番号のない布団は押入れの最上段へ入れた。
宿泊名簿にも赤字で書き足した。
「使用布団七組。布団部屋二名」
夜明け前、冷えで目が覚めた。
空が白む少し前だった。部屋の温度がひどく下がり、吐く息が見えそうなほどだった。
隣の七番には美穂がいた。
押入れの襖も閉まっている。取っ手の紙テープも切れていない。
それなのに、私と美穂の間に布団が一組敷かれていた。
番号のない布団だった。
掛布団は平らだった。誰かの姿はない。
ただ、敷布団の中央が深く沈み、枕には右向きの窪みがあった。掛布団の内側へ手を入れると、人が起きた直後のように温かかった。
畳もそこだけ湿っていた。
美穂を起こすと、彼女は布団を見て言った。
「奈津、そっちで寝てたでしょう」
「私は六番」
「違う。六番は私」
美穂の枕元には、確かに「美穂」と書いた紙があった。
だが紙は六番の上に置かれていた。
私の名前は、番号のない布団の枕元にあった。
自分で置いた覚えはない。
皆を呼ぶと、さらに記憶が分かれた。
母は、番号のない布団で典子さんが寝たと言った。
伯父は達也だと答えた。
達也は、そこは一晩中空いていたと言った。
圭介だけは、八人で泊まっているのだから八組で正しいと言った。
「八人目は誰？」
聞くと、圭介は家族全員の顔を数えた。
母、伯父、典子さん、圭介、美穂、達也、私。
七人で止まり、もう一度最初から数え直した。
「でも八人だろ」
彼はそれ以上説明できなかった。
朝食後、布団をすべて片づけた。
七組も、番号のない一組も、押入れに残っていた布団も全部まとめて業者へ運ぶことにした。誰がどれを使ったか考えないようにし、番号も見ず、圧縮袋へ詰めた。
袋の中の空気を抜くと、綿の匂いと押入れの湿気が部屋いっぱいに広がった。
畳には寝跡が残っていなかった。
枕の窪みも消えていた。
昼すぎ、私たちは家を出た。
典子さんが最後に宿泊名簿を確認した。
名前は七人分しかなかった。
ただし、寝場所の欄には八行あった。
最後の行に、青い字でこう書かれていた。
「氏名未記入　布団部屋・押入れ前　番号なし　二泊」
到着時刻と退出時刻も記録されていた。
到着、十月十一日、二十二時四十分。
退出、十月十三日、午前五時十二分。
その時刻は、二日とも私たちがまだ眠っていた時間だった。
誰の筆跡か分からなかった。
典子さんはその行を消そうとしたが、宿泊名簿は売却関係の書類と一緒に不動産会社へ提出する予定だった。人数欄にはすでに「八名」と清書され、訂正印まで押されていた。
七人全員が、印を押したのは自分ではないと言った。
それでも名簿だけは、八人が二泊した正式な記録として残った。'''

STYLE = '''
    :root{color-scheme:dark;--bg:#090b10;--ink:#eee6d8;--muted:#b7afa2;--dim:#847c72;--line:#312d2a;--paper:#151310;--accent:#8f2630;--gold:#c7a76a;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--bg);color:var(--ink)}
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;min-height:100dvh;background:radial-gradient(800px 440px at 75% -10%,rgba(143,38,48,.2),transparent 62%),linear-gradient(180deg,#090b10,#0d0e11 55%,#07080b);color:var(--ink)}body:before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.13;background:linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px) 0 0/42px 42px,linear-gradient(0deg,rgba(255,255,255,.035) 1px,transparent 1px) 0 0/42px 42px}a{color:inherit}.skip{position:absolute;left:16px;top:-80px;background:var(--ink);color:#111;padding:10px 14px;z-index:10}.skip:focus{top:16px}.site-header{border-bottom:1px solid rgba(238,230,216,.1);background:rgba(9,11,16,.84);backdrop-filter:blur(14px);position:sticky;top:0;z-index:4}.nav{width:min(920px,calc(100% - 40px));min-height:62px;margin:auto;display:flex;align-items:center;justify-content:space-between;gap:18px}.brand{text-decoration:none;display:flex;align-items:baseline;gap:12px}.brand strong{font-family:Georgia,"Yu Mincho","Hiragino Mincho ProN",serif;font-size:1.2rem;font-weight:500}.brand span,.back{color:var(--muted);font-size:.9rem}.back{text-decoration:none;border:1px solid var(--line);background:#13110f;padding:8px 11px}main{width:min(840px,calc(100% - 40px));margin:0 auto;padding:62px 0 80px}.eyebrow{margin:0 0 16px;color:var(--gold);font-size:.78rem;letter-spacing:.14em;text-transform:uppercase}h1{font-family:Georgia,"Yu Mincho","Hiragino Mincho ProN",serif;font-size:clamp(2.5rem,7vw,4.5rem);font-weight:500;line-height:1.12;margin:0 0 20px}.summary{font-family:Georgia,"Yu Mincho","Hiragino Mincho ProN",serif;color:#ddd3c5;font-size:1.04rem;line-height:2;margin:0}.meta{display:flex;flex-wrap:wrap;gap:8px;margin:26px 0 42px}.meta span{border:1px solid var(--line);background:#13110f;color:var(--muted);padding:7px 10px;font-size:.84rem}article{border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:42px 0}article p{font-family:Georgia,"Yu Mincho","Hiragino Mincho ProN",serif;font-size:1.05rem;line-height:2.12;letter-spacing:.02em;margin:0 0 1.3em}.notice{margin-top:28px;border-left:3px solid var(--accent);background:var(--paper);padding:18px 20px;color:var(--muted);line-height:1.8;font-size:.9rem}.footer-nav{display:flex;justify-content:space-between;gap:16px;margin-top:34px}.footer-nav a{text-decoration:none;border:1px solid var(--line);background:#13110f;padding:11px 14px}footer{border-top:1px solid rgba(238,230,216,.1);padding:30px 20px;color:var(--dim);text-align:center;font-size:.88rem}:focus-visible{outline:3px solid var(--gold);outline-offset:4px}@media(max-width:600px){.nav{width:min(100% - 28px,920px);align-items:flex-start;flex-direction:column;padding:13px 0}main{width:min(100% - 28px,840px);padding-top:40px}article{padding:30px 0}article p{font-size:1rem;line-height:2.02}.footer-nav{flex-direction:column}}
'''.strip()

summary = "祖母の家へ泊まった親族は七人。しかし毎朝、温かく湿った八組目の寝跡が現れ、誰がどこで眠ったかという家族の記憶だけが変わっていく。"
description = "七人の親族が泊まった祖母の家で、温かい八組目の布団と氏名未記入の宿泊記録が残る家族怪談。"
structured = {
    "@context": "https://schema.org",
    "@type": "ShortStory",
    "headline": TITLE,
    "description": description,
    "isPartOf": {"@type": "CreativeWorkSeries", "name": "榊家異聞"},
    "inLanguage": "ja",
    "url": URL,
    "datePublished": DATE,
    "timeRequired": "PT12M",
    "genre": ["怪談", "ホラー", "家族", "記憶"],
}
paragraphs = "\n".join(f"      <p>{escape(line)}</p>" for line in BODY.splitlines() if line.strip())
html = f'''<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{TITLE}｜榊家異聞｜境界夜話</title>
  <meta name="description" content="{description}">
  <meta name="robots" content="index,follow,max-snippet:-1">
  <meta name="theme-color" content="#090b10">
  <link rel="canonical" href="{URL}">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="境界夜話">
  <meta property="og:title" content="{TITLE}｜榊家異聞">
  <meta property="og:description" content="{description}">
  <meta property="og:url" content="{URL}">
  <meta name="twitter:card" content="summary">
  <script type="application/ld+json">{json.dumps(structured, ensure_ascii=False, separators=(',', ':'))}</script>
  <style>
{STYLE}
  </style>
</head>
<body>
  <a class="skip" href="#story">本文へ移動</a>
  <header class="site-header"><nav class="nav" aria-label="主要メニュー"><a class="brand" href="/kyokai-yawa/"><strong>境界夜話</strong><span>怪談アーカイブ</span></a><a class="back" href="/kyokai-yawa/#works">公開作品へ戻る</a></nav></header>
  <main>
    <p class="eyebrow">Sakaki Family Tales · SKK-008</p>
    <h1>{TITLE}</h1>
    <p class="summary">{summary}</p>
    <div class="meta" aria-label="作品情報"><span>榊家異聞</span><span>第8話</span><span>中編</span><span>約12分</span><span>恐怖レベル 3</span></div>
    <article id="story" tabindex="-1">
{paragraphs}
    </article>
    <p class="notice">この作品はフィクションです。完全オリジナル作品として編集確認を経て掲載しています。実在の家族、住宅、宿泊記録、人物とは関係ありません。</p>
    <nav class="footer-nav" aria-label="作品ページ下部メニュー"><a href="/kyokai-yawa/">境界夜話トップ</a><a href="/kyokai-yawa/#series-sakaki">榊家異聞を見る</a></nav>
  </main>
  <footer>© 2026 境界夜話</footer>
</body>
</html>
'''

story_path = ROOT / "stories" / f"{SLUG}.html"
if story_path.exists():
    raise RuntimeError(f"Refusing to overwrite existing story: {story_path}")
story_path.write_text(html, encoding="utf-8")

index_path = ROOT / "index.html"
index = index_path.read_text(encoding="utf-8")
card_marker = '      <a class="work-card" href="/kyokai-yawa/stories/skk-010-futatsu-no-ie-no-komoriuta.html">'
card = '      <a class="work-card" href="/kyokai-yawa/stories/skk-008-aki-no-futon-beya.html"><div><span class="id">SKK-008 · 榊家異聞</span><h3>秋の布団部屋</h3><p>七人の宿泊に温かい八組目の寝跡が現れ、布団の湿気と温度が家族の寝場所記憶を別の配置へ書き換える。</p></div><div class="work-meta"><span class="tag">中編</span><span class="tag">約12分</span><span class="tag">恐怖 3</span></div></a>'
if card_marker not in index:
    raise RuntimeError("Card insertion marker missing")
index = index.replace(card_marker, card + "\n" + card_marker, 1)
list_marker = '<li><a class="story-link" href="/kyokai-yawa/stories/skk-010-futatsu-no-ie-no-komoriuta.html">'
list_item = '<li><a class="story-link" href="/kyokai-yawa/stories/skk-008-aki-no-futon-beya.html"><span class="story-id">SKK-008</span><span class="story-title">秋の布団部屋</span><span class="story-arrow">›</span></a></li>'
if list_marker not in index:
    raise RuntimeError("Series insertion marker missing")
index = index.replace(list_marker, list_item + list_marker, 1)
old_count = '<h3>榊家異聞</h3><span class="series-count">8話公開</span>'
new_count = '<h3>榊家異聞</h3><span class="series-count">9話公開</span>'
if old_count not in index:
    raise RuntimeError("Series count marker missing")
index = index.replace(old_count, new_count, 1)
index_path.write_text(index, encoding="utf-8")

sitemap_path = ROOT / "sitemap.xml"
sitemap = sitemap_path.read_text(encoding="utf-8")
site_marker = '  <url><loc>https://allsunday1122.github.io/kyokai-yawa/stories/skk-010-futatsu-no-ie-no-komoriuta.html</loc>'
site_line = f'  <url><loc>{URL}</loc><lastmod>{DATE}</lastmod></url>'
if site_marker not in sitemap:
    raise RuntimeError("Sitemap insertion marker missing")
sitemap = sitemap.replace(site_marker, site_line + "\n" + site_marker, 1)
sitemap_path.write_text(sitemap, encoding="utf-8")

if index.count('class="work-card"') != 33:
    raise RuntimeError("Expected 33 work cards, got %s" % index.count('class="work-card"'))
for series, expected in (("真壁夜話", 8), ("黒瀬蒐集録", 8), ("榊家異聞", 9), ("境界観測記", 8)):
    marker = f'<h3>{series}</h3><span class="series-count">{expected}話公開</span>'
    if marker not in index:
        raise RuntimeError(f"Series count not updated: {series}")
if sitemap.count("<loc>") != 34:
    raise RuntimeError("Expected 34 sitemap URLs, got %s" % sitemap.count("<loc>"))
if escape(BODY.splitlines()[0]) not in html or escape(BODY.splitlines()[-1]) not in html:
    raise RuntimeError("Story boundary validation failed")

for temp in [
    ROOT / "publish_skk008_20260718.py",
    ROOT / "publish-skk008-20260718.trigger",
    ROOT / ".github" / "workflows" / "publish-skk008-20260718.yml",
]:
    if temp.exists():
        temp.unlink()

subprocess.run(["git", "config", "user.name", "github-actions[bot]"], cwd=ROOT, check=True)
subprocess.run(["git", "config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"], cwd=ROOT, check=True)
subprocess.run(["git", "add", "-A"], cwd=ROOT, check=True)
subprocess.run(["git", "commit", "-m", "Publish SKK-008"], cwd=ROOT, check=True)
subprocess.run(["git", "push", "origin", "HEAD:main"], cwd=ROOT, check=True)
