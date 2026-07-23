import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const base='https://allsunday1122.github.io/kyokai-yawa/';
const page=`<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>運用状況｜境界夜話</title>
<meta name="description" content="境界夜話の公開ページ、読書機能、オフライン機能、障害通知設定の最新監査状況を確認します。">
<meta name="robots" content="noindex,follow"><meta name="theme-color" content="#090b10">
<link rel="manifest" href="/kyokai-yawa/manifest.webmanifest"><link rel="icon" type="image/svg+xml" href="/kyokai-yawa/assets/app-icon.svg"><link rel="icon" type="image/png" sizes="192x192" href="/kyokai-yawa/assets/app-icon-192.png"><link rel="apple-touch-icon" sizes="180x180" href="/kyokai-yawa/assets/apple-touch-icon.png">
<meta name="application-name" content="境界夜話"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="境界夜話">
<link rel="canonical" href="${base}status.html">
<link rel="stylesheet" href="/kyokai-yawa/data/status.css">
<link rel="stylesheet" href="/kyokai-yawa/data/accessibility-contrast.css">
</head>
<body class="status-page" data-status-page>
<a class="skip" href="#main">本文へ移動</a>
<header class="site-header"><nav class="nav" aria-label="主要メニュー"><a class="brand" href="/kyokai-yawa/"><strong>境界夜話</strong><span>怪談アーカイブ</span></a><div class="nav-links"><a href="/kyokai-yawa/">トップ</a><a href="/kyokai-yawa/#works">作品</a><a href="/kyokai-yawa/#series">シリーズ</a><a href="/kyokai-yawa/reading-log.html">読書記録</a><a aria-current="page" href="/kyokai-yawa/status.html">運用状況</a></div></nav></header>
<main id="main">
<section class="hero" aria-labelledby="status-title"><div><p class="eyebrow">PUBLIC MONITORING</p><h1 id="status-title">運用状況</h1><p class="lead">公開中の54ページ、読書機能、オフライン機能、障害通知設定を実ブラウザーと自動監査で確認しています。</p></div><p class="status-note">このページは管理確認用です。検索結果には掲載しません。表示は同一サイト内の監査履歴から取得し、5分ごとに更新します。</p></section>
<section class="overall" aria-label="総合状態"><article class="overall-card" data-state="loading"><small>総合状態</small><strong data-status-overall>確認中</strong></article><article class="updated-card"><small>最終更新</small><time data-status-updated>確認中</time><p data-status-updated-note>最新の監視履歴を読み込んでいます。</p></article></section>
<p class="status-message" data-status-message aria-live="polite">最新の監視結果を確認しています。</p>
<section aria-labelledby="latest-title"><p class="eyebrow">LATEST CHECKS</p><h2 id="latest-title" class="skip">最新監査</h2><div class="status-grid" data-status-grid><p class="empty">監視結果を読み込んでいます。</p></div></section>
<section class="history-section" aria-labelledby="history-title"><div class="section-head"><div><p class="eyebrow">RECENT HISTORY</p><h2 id="history-title">直近の監査履歴</h2></div><p>監査種別ごとに直近30回を保持し、ここでは新しい20件を表示します。</p></div><div class="table-wrap"><table><thead><tr><th>実行日時</th><th>監査</th><th>状態</th><th>成功</th><th>失敗</th><th>警告</th><th>所要時間</th></tr></thead><tbody data-status-history><tr><td colspan="7">監視結果を読み込んでいます。</td></tr></tbody></table></div></section>
</main>
<footer>© 2026 境界夜話 <a href="/kyokai-yawa/reading-log.html">読書記録へ戻る</a></footer>
<script src="/kyokai-yawa/data/status.js"></script>
<script src="/kyokai-yawa/data/sw-register.js" defer></script>
</body>
</html>
`;
fs.writeFileSync(path.join(root,'status.html'),page);
console.log('# 運用状況ページ正規化\n\n- ページ: status.html\n- 監視種別: 読書・54ページ品質・オフラインPWA・障害Issue通知\n- 更新: 5分ごと・タブ復帰時\n- 検索登録: noindex,follow\n');