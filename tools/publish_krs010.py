from pathlib import Path
import html
import json
import re

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
SITEMAP = ROOT / "sitemap.xml"
TEMPLATE = ROOT / "stories/krs-009-gakko-enkaku-no-kuhakunen.html"
STORY_PATH = ROOT / "stories/krs-010-hashikyakuno-shita-no-banchi.html"
URL = "https://allsunday1122.github.io/kyokai-yawa/stories/krs-010-hashikyakuno-shita-no-banchi.html"

story_text = """橋には、道路としての番号と、構造物としての番号がある。
路線名、橋梁番号、橋脚番号、管理区間。通常、それらは土地の住所とは別に扱われる。
だから橋脚の真下に番地が付いていても、直ちに異常とは限らない。河川改修前の地番が水面下や堤防内に残る例はある。
問題は、その番地に人が住み続けている記録があったことだった。
昨年、私は灰津町の古い橋の耐震補修に伴う資料整理を頼まれた。
橋は昭和四十八年に架けられた灰津橋で、町の旧市街と駅側を結んでいる。全長は百十メートルほど。川の中に二本の橋脚が立ち、上流側からP1、P2と呼ばれていた。
補修対象はP2だった。基礎周辺の洗掘を防ぐため、護床ブロックを追加し、河川占用区域を改めて確定する必要がある。
町から渡された地番図では、P2の直下に小さな一筆が残っていた。
川端四十四番三。
形は細長い台形で、面積は十八平方メートル。橋脚の基礎とほぼ重なっている。
現在の住宅地図では河川敷であり、建物はない。現地もコンクリートの橋脚と礫の河床だけだった。
しかし地番図の地目欄には「宅地」とあった。
登記簿上の所有者は町だった。昭和四十六年の河川改修時に買収され、その後橋梁用地へ編入されたことになっている。
宅地から公衆用道路や河川敷へ変更されなかった理由は不明だった。
橋梁台帳を確認すると、さらに妙な記載があった。
P2の所在地欄に「川端四十四番三地先」とある。ここまでは普通だが、維持管理責任者の欄に「居住者」と書かれていた。
橋脚の管理責任者が居住者になることはない。
古い様式を流用した誤記かと思ったが、昭和五十六年、平成三年、平成十九年の点検記録にも同じ表現が残っていた。
「基礎周辺の流木除去については居住者へ通知」
「河床清掃日は居住者立会い」
「占用更新時、居住者確認済み」
立会人の氏名は書かれていない。印鑑欄には、毎回異なる名字の認印が押されていた。
昭和五十六年は寺本、平成三年は井関、平成十九年は坂上。
いずれも橋の周辺に実在する家だった。
寺本家は上流側、井関家は右岸、坂上家は橋のたもとにある。三軒に血縁や土地共有の関係はない。
河川占用許可の資料を調べると、橋脚下の番地が一世帯として扱われる理由が少し見えた。
灰津橋の占用許可は町が申請者だが、P2周辺だけ「従前使用者あり」と記載されていた。
従前使用の内容は空欄だった。住居、耕作、係留、取水のどれにも印がない。
更新申請書には、従前使用者への通知が必要とされ、その通知先だけが毎回変わっていた。
昭和五十六年は寺本家、平成三年は井関家、平成十九年は坂上家。
橋梁台帳の認印と一致する。
役場の税務資料にも川端四十四番三が残っていた。
固定資産税は町有地のため非課税である。ところが住民税の世帯管理番号が一つ発行されていた。
氏名欄は空白。世帯人数は一。課税所得はゼロ。納税額もゼロ。
それでも毎年、申告案内と非課税決定通知が作成されていた。
宛名はない。
住所だけが「灰津町川端四十四番三」と印字されている。
発送記録では、通知書は近隣世帯の封筒へ同封されていた。
どの家へ同封されるかは年度ごとに違う。
税務課の担当者は、システムが氏名空欄の世帯を単独で出力できないため、同一町内の最寄り世帯へ関連付ける処理が行われたのではないかと言った。
だが、関連付け先は距離順ではなかった。
橋脚補修があった年は坂上家、河川清掃があった年は寺本家、住民税制度の変更年は井関家へ付いていた。
その年に必要となった行政手続きに応じて、責任を負わせやすい家へ移っているように見えた。
ごみ収集記録にも一世帯分が存在した。
川端地区の集積所利用世帯は二十七戸のはずだが、清掃当番表は二十八戸分で組まれていた。
二十八戸目の氏名欄は空白で、住所だけが四十四番三となっている。
空欄の当番日は削除されず、前後の家が交代で担当していた。
過去二十年分を並べると、空欄の前に置かれる家が定期的に変わっていた。
河川占用許可の通知先となった家が、その年度の空欄当番も引き受けている。
存在しない世帯を消すのではなく、どこかの家が一時的に二世帯分の役目を負っていた。
町の文書庫で、昭和四十八年の架橋工事関係書類を探した。
旧公図では、川端四十四番三に小さな家屋記号があった。
河川改修前、そこには木造平屋が建っていたらしい。
ただし買収台帳の居住者欄は空白だった。土地所有者は別の町に住んでおり、建物登記もない。
移転補償は支払われていない。
家屋調査票には、鉛筆で一行だけ書かれていた。
「居住実態なし。生活物件あり。世帯処理保留」
生活物件の内容は記されていない。
工事写真では、橋脚予定地に小さな屋根が写っていた。解体前、解体後の写真はあるが、内部写真だけ欠けている。
人が住んでいた証拠はない。
それでも世帯処理だけが保留され、そのまま橋脚の下へ残ったらしい。
現在の補修工事では、地番と占用関係を整理する必要があった。
町は川端四十四番三を隣接する河川敷地番へ合筆し、宅地扱いを解消する方針を決めた。
世帯管理番号も廃止し、ごみ収集名簿の空欄を削除する。
各課で別々に残っていた記録を、同じ日に消すことになった。
手続きを始めると、宛先のない通知書が四通出力された。
住民税世帯廃止通知。
ごみ集積所利用終了通知。
河川占用の従前使用権消滅通知。
橋梁管理協力者の指定解除通知。
いずれも宛名欄は空白で、住所だけが川端四十四番三だった。
郵送できないため、担当者は発送不要と判断した。
ところが翌日、文書管理システムでは四通とも「発送済み」になっていた。
郵便料金も計上され、追跡番号まで付いていた。
配送状況は「配達完了」。受領者欄は空白だった。
私は追跡番号を控え、郵便局へ照会した。
配達場所の登録は「灰津橋P2下部」。配達方法は「戸別受箱」とされていた。
現地に郵便受けはない。
橋脚の側面には点検用の標識板があるだけだった。
工事前の現地確認で、私はP2の周囲を一周した。
コンクリート表面に古いチョーク跡や測量記号はあったが、番地を示す表示は見つからなかった。
河床には補修資材が積まれ、橋の上を車が通るたびに細かな砂が落ちてきた。
工事は三か月で終わった。
P2周辺は護床ブロックで固められ、川端四十四番三は地番図から消えた。
橋梁台帳の「居住者」欄も削除され、ごみ収集当番は二十七戸に戻った。
整理は完了したように見えた。
その一週間後、橋のたもとの坂上家から役場へ問い合わせがあった。
住民票の住所が変わっているという。
坂上家の住所は、それまで川端四十四番二だった。家も土地も動いていない。
しかし住民基本台帳、固定資産の納税者住所、運転免許の照会先がすべて川端四十四番三へ変更されていた。
廃止したはずの橋脚下の番地である。
地番図上、四十四番三は存在しない。
登記上の坂上家は四十四番二のままだった。
住所表示だけが橋脚下へ移っていた。
役場は誤登録として修正しようとしたが、世帯管理番号がロックされていた。
理由欄には「河川占用関係世帯」と表示された。
坂上家の女性は、住所変更後から郵便物が届かなくなったと言った。
役場の通知、保険会社の書類、通販の荷物。発送元へ確認すると、どれも配達済みになっている。
郵便局で追跡すると、配達場所はすべて「灰津橋P2下部」だった。
配達時刻は毎日違う。受領印はない。
それでも配達担当端末には、戸別受箱への投函を示す処理が残っていた。
私は橋の下を再び確認した。
補修されたP2の表面は新しい保護材で覆われ、何も付いていなかった。
ただ、橋脚基礎の上流側に、郵便物ほどの幅の乾いた部分があった。
周囲は前夜の雨で濡れていたが、そこだけ四角く水を弾いていた。
何かが置かれていた形ではない。
コンクリートの表面に、受箱の輪郭だけが残っているように見えた。
坂上家の住所は、その後も四十四番三のままである。
家の表札には四十四番二と書かれている。住人も元の住所を使い続けている。
だが町から坂上家へ送る文書は、システム上では四十四番三へ発送される。
そしてすべて、橋脚下へ配達済みになる。
橋梁台帳の最新版では、P2の管理責任者欄は空白になっていた。
代わりに、所在地欄の下に以前はなかった項目が追加されている。
「関係世帯数　一」"""

def sub_once(pattern: str, repl: str, text: str) -> str:
    result, count = re.subn(pattern, repl, text, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError(f"pattern not found exactly once: {pattern}")
    return result

# Create story page from the current KRS template so the design remains identical.
story = TEMPLATE.read_text(encoding="utf-8")
description = "橋脚直下の存在しない番地と一世帯分の行政記録が、周辺住民の住所と郵便配達を橋脚下へ接続する資料怪談。"
summary = "橋脚P2の直下には、建物のない宅地番と一世帯分の行政記録が残っていた。番号を消すと、その責任と郵便物が橋のたもとの家へ移り始める。"
story = sub_once(r"<title>.*?</title>", "<title>橋脚の下の番地｜黒瀬蒐集録｜境界夜話</title>", story)
story = sub_once(r'<meta name="description" content=".*?">', f'<meta name="description" content="{description}">', story)
story = sub_once(r'<link rel="canonical" href=".*?">', f'<link rel="canonical" href="{URL}">', story)
story = sub_once(r'<meta property="og:title" content=".*?">', '<meta property="og:title" content="橋脚の下の番地｜黒瀬蒐集録">', story)
story = sub_once(r'<meta property="og:description" content=".*?">', f'<meta property="og:description" content="{description}">', story)
story = sub_once(r'<meta property="og:url" content=".*?">', f'<meta property="og:url" content="{URL}">', story)
ld = {"@context":"https://schema.org","@type":"ShortStory","headline":"橋脚の下の番地","description":description,"isPartOf":{"@type":"CreativeWorkSeries","name":"黒瀬蒐集録"},"inLanguage":"ja","url":URL,"datePublished":"2026-07-18","timeRequired":"PT14M","genre":["怪談","ホラー","土地","行政記録"]}
story = sub_once(r'<script type="application/ld\+json">.*?</script>', '<script type="application/ld+json">'+json.dumps(ld, ensure_ascii=False, separators=(",",":"))+'</script>', story)
story = sub_once(r'<p class="eyebrow">.*?</p>', '<p class="eyebrow">Kurose Collection · KRS-010</p>', story)
story = sub_once(r'<h1>.*?</h1>', '<h1>橋脚の下の番地</h1>', story)
story = sub_once(r'<p class="summary">.*?</p>', f'<p class="summary">{summary}</p>', story)
story = sub_once(r'<div class="meta" aria-label="作品情報">.*?</div>', '<div class="meta" aria-label="作品情報"><span>黒瀬蒐集録</span><span>第10話</span><span>中編</span><span>約14分</span><span>恐怖レベル 3</span></div>', story)
article = "\n".join(f"<p>{html.escape(line)}</p>" for line in story_text.splitlines())
story = sub_once(r'<article id="story" tabindex="-1">.*?</article>', '<article id="story" tabindex="-1">\n'+article+'\n</article>', story)
story = sub_once(r'<p class="notice">.*?</p>', '<p class="notice">この作品はフィクションです。完全オリジナル作品として編集確認を経て掲載しています。実在の自治体、橋梁、住所、行政機関、人物とは関係ありません。</p>', story)
story = story.replace('/kyokai-yawa/#series-kurose', '/kyokai-yawa/#series-kurose')
STORY_PATH.write_text(story, encoding="utf-8")

# Add the work card and the series list item without changing the page design.
index = INDEX.read_text(encoding="utf-8")n = index.count('class="work-card"')
if n != 39:
    raise RuntimeError(f"expected 39 current work cards, found {n}")
if "krs-010-hashikyakuno-shita-no-banchi.html" in index:
    raise RuntimeError("KRS-010 already listed")
card = '      <a class="work-card" href="/kyokai-yawa/stories/krs-010-hashikyakuno-shita-no-banchi.html"><div><span class="id">KRS-010 · 黒瀬蒐集録</span><h3>橋脚の下の番地</h3><p>橋脚直下の存在しない番地と一世帯分の行政責任が、周辺住宅の住所と郵便配達を橋の下へ接続する。</p></div><div class="work-meta"><span class="tag">中編</span><span class="tag">約14分</span><span class="tag">恐怖 3</span></div></a>'
card_pattern = r'(<a class="work-card" href="/kyokai-yawa/stories/krs-009-gakko-enkaku-no-kuhakunen\.html">.*?</a>)'
index = sub_once(card_pattern, r'\1\n'+card, index)
head, tail = index.split('id="series-kurose"', 1)
tail = tail.replace('<span class="series-count">9話公開</span>', '<span class="series-count">10話公開</span>', 1)
index = head + 'id="series-kurose"' + tail
item = '<li><a class="story-link" href="/kyokai-yawa/stories/krs-010-hashikyakuno-shita-no-banchi.html"><span class="story-id">KRS-010</span><span class="story-title">橋脚の下の番地</span><span class="story-arrow">›</span></a></li>'
item_pattern = r'(<li><a class="story-link" href="/kyokai-yawa/stories/krs-009-gakko-enkaku-no-kuhakunen\.html">.*?</li>)'
index = sub_once(item_pattern, r'\1'+item, index)
INDEX.write_text(index, encoding="utf-8")

sitemap = SITEMAP.read_text(encoding="utf-8")
loc = f'  <url><loc>{URL}</loc><lastmod>2026-07-18</lastmod></url>'
if URL not in sitemap:
    sitemap = sitemap.replace('</urlset>', loc+'\n</urlset>')
SITEMAP.write_text(sitemap, encoding="utf-8")

# Remove one-shot publication helpers from the resulting commit.
for relative in ["tools/publish_krs010.py", ".github/workflows/publish-krs010.yml", ".publish-krs010-trigger"]:
    path = ROOT / relative
    if path.exists():
        path.unlink()

# Final checks.
index = INDEX.read_text(encoding="utf-8")
sitemap = SITEMAP.read_text(encoding="utf-8")
story = STORY_PATH.read_text(encoding="utf-8")
assert index.count('class="work-card"') == 40
assert index.count("krs-010-hashikyakuno-shita-no-banchi.html") == 2
assert '<span class="series-count">10話公開</span>' in index.split('id="series-kurose"',1)[1]
assert sitemap.count('<url>') == 41
assert story_text.splitlines()[0] in story
assert story_text.splitlines()[-1] in story
print("KRS-010 publication files validated")
