# 闇語り文庫

怖い話・怪談を、カテゴリ、舞台、恐怖レベル、長さ、結末、シリーズから探せる静的ライブラリーサイトです。Astroで各作品を静的HTMLとして生成し、検索エンジンが本文を読める構成にしています。

## 1. サイト概要

- 作品本文は `src/content/stories/*.md` で管理します。
- お気に入り、読書履歴、表示設定はブラウザのlocalStorageに保存します。
- 実閲覧数、コメント数、ユーザー評価はMVPでは表示しません。
- ランキングは編集部選定のおすすめ順です。

## 2. 技術構成

- Astro
- TypeScript
- Astro Content Collections
- Markdown
- Pagefind
- GitHub Actions
- GitHub Pages

## 3. 必要なソフト

- Node.js 20以上
- npm 10以上

このリポジトリは `pnpm-lock.yaml` を含みます。GitHub Actionsではpnpmを使いますが、ローカル運用は `npm run dev` などのnpmコマンドでも同じスクリプトを実行できます。

## 4. 初回セットアップ

```bash
npm install
```

pnpmを使う場合:

```bash
pnpm install
```

## 5. ローカル起動

```bash
npm run dev
```

標準では `http://localhost:4321/` で確認できます。

## 6. 新しい怪談の追加

1. `src/content/stories/` にMarkdownファイルを追加します。
2. 既存作品を参考にfrontmatterをすべて入力します。
3. `slug` は英小文字、数字、ハイフンのみで重複しない値にします。
4. AI支援を使った場合は `aiAssisted: true` にします。
5. 公開前に `reviewStatus` を段階的に確認し、公開する作品だけ `published` にします。

## 7. カテゴリの追加

`src/data/taxonomy.ts` の `mainCategories` に追加します。カテゴリページは自動生成されます。カテゴリ説明は検索流入用の薄いページにならないよう、独自説明文を書いてください。

## 8. 画像の追加

画像を使う場合は `public/images/` などに置き、Markdownまたはコンポーネントから参照します。画像には必ずaltを設定してください。未設定の画像パスは `npm run content:check` で検査対象にします。

## 9. コンテンツチェック

```bash
npm run content:check
```

検査項目:

- 必須項目の欠損
- タイトル重複
- slug重複
- 本文の極端な短さ、長さ
- 同一表現の過剰反復
- 収録作品同士の類似度
- 仮テキスト
- 未設定画像パス
- 不正な内部リンク
- 公開日形式

## 10. ビルド

```bash
npm run build
```

`dist/` に静的サイトを生成し、Pagefind検索インデックスも作成します。

## 11. GitHub Pages公開

`.github/workflows/deploy-pages.yml` が `main` または `master` へのpushで実行されます。

GitHub側で次を設定してください。

1. Repository Settings → Pages
2. Sourceを「GitHub Actions」に設定
3. Project Pagesの場合はそのまま利用
4. 独自ドメインを使う場合は `PUBLIC_SITE_URL` と `PUBLIC_BASE_PATH` をGitHub Variablesで調整

標準のProject Pages URL:

```text
https://<owner>.github.io/<repository>/
```

## 12. よくあるエラー

- `slug: Required`
  - Astroではfrontmatterの `slug` は予約フィールドです。コードでは `story.slug` を参照します。frontmatter自体にはslugを書いてください。
- `Cannot find module`
  - `npm install` を実行してください。
- 検索が動かない
  - Pagefindは `npm run build` 後に有効になります。開発サーバーだけでは検索インデックスがない場合があります。
- GitHub Pagesでパスが壊れる
  - `PUBLIC_BASE_PATH` がリポジトリ名と合っているか確認してください。

## 13. 将来機能

`docs/phase2-backlog.md` に整理しています。

- 投稿レビュー
- 実閲覧数ランキング
- アカウント連携のお気に入り
- コメント
- 朗読
- 有料コンテンツ
- メールマガジン
