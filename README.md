# 🎯 頑張る - インタラクティブ動画自動生成システム

毎日の頑張りを共有するインタラクティブなYouTube動画を自動生成・投稿するシステムです。

## 🌟 コンセプト

1. **朝の動画** (7:00投稿) - 「今日の目標は？」をコメントで募集
2. **夜の動画** (19:00投稿) - 「今日できたことは？」をコメントで募集
3. **まとめ動画** (23:30投稿) - 両方の動画のコメントをマージして、キャラクターアニメーションで紹介

## 🚀 機能

- ✨ Remotionによる高品質な動画生成
- 🎨 ユーザーごとにユニークなキャラクター生成
- 💬 朝と夜のコメントを自動でマージ
- 📊 統計情報の自動集計
- 🤖 GitHub Actionsによる完全自動化

## 📁 プロジェクト構成

```
ganbaru/
├── src/
│   ├── Root.tsx              # Remotion構成定義
│   ├── index.ts              # エントリーポイント
│   ├── videos/
│   │   ├── MorningVideo.tsx  # 朝の動画コンポーネント
│   │   ├── NightVideo.tsx    # 夜の動画コンポーネント
│   │   └── SummaryVideo.tsx  # まとめ動画コンポーネント
│   └── components/
│       ├── UserCharacter.tsx # ユーザーキャラクター
│       └── CommentBubble.tsx # コメント吹き出し
├── scripts/
│   ├── fetch-comments.js     # YouTubeコメント取得
│   ├── render-morning.js     # 朝動画レンダリング
│   ├── render-night.js       # 夜動画レンダリング
│   ├── render-summary.js     # まとめ動画レンダリング
│   └── upload-youtube.js     # YouTube投稿
├── data/
│   └── video-status.json     # 動画ステータス管理（公開可）
├── .github/workflows/
│   ├── morning-video.yml     # 朝の自動投稿
│   ├── night-video.yml       # 夜の自動投稿
│   └── summary-video.yml     # まとめの自動投稿
└── output/                   # 生成された動画
```

## ⚙️ セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定（ローカル開発用）

`.env.example` をコピーして `.env` を作成し、YouTube API認証情報を設定:

```bash
cp .env.example .env
```

```env
YOUTUBE_CLIENT_ID=your_client_id
YOUTUBE_CLIENT_SECRET=your_client_secret
YOUTUBE_REFRESH_TOKEN=your_refresh_token
```

### 3. YouTube API認証の取得

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. YouTube Data API v3 を有効化
3. OAuth 2.0 クライアントIDを作成
4. [OAuth Playground](https://developers.google.com/oauthplayground) でリフレッシュトークンを取得

## 🔒 セキュリティ

このリポジトリは**公開リポジトリ**として安全に運用できます。

### 秘密情報の管理

| 項目 | 保存場所 | 公開可否 |
|------|---------|---------|
| Client ID | GitHub Secrets | ❌ 非公開 |
| Client Secret | GitHub Secrets | ❌ 非公開 |
| Refresh Token | GitHub Secrets | ❌ 非公開 |
| 動画ID | `data/video-status.json` | ✅ 公開可 |
| 投稿履歴 | `data/video-status.json` | ✅ 公開可 |

### .gitignore で保護されるファイル

- `.env` - ローカルの認証情報
- `output/` - レンダリングされた動画

## 🎬 使い方

### 開発モード（プレビュー）

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いて動画をプレビュー

### 手動レンダリング

```bash
# 朝の動画
npm run render:morning

# 夜の動画
npm run render:night

# まとめ動画（コメント取得後）
npm run fetch:comments
npm run render:summary
```

### 手動アップロード

```bash
npm run upload:youtube -- --type morning
npm run upload:youtube -- --type night
npm run upload:youtube -- --type summary
```

## 🤖 GitHub Actions設定

リポジトリの Settings > Secrets and variables > Actions で以下を設定:

### Secrets（必須）

| 名前 | 説明 |
|-----|------|
| `YOUTUBE_CLIENT_ID` | Google Cloud OAuth Client ID |
| `YOUTUBE_CLIENT_SECRET` | Google Cloud OAuth Client Secret |
| `YOUTUBE_REFRESH_TOKEN` | OAuth 2.0 リフレッシュトークン |

### 自動投稿スケジュール

| ワークフロー | 時刻 (JST) | 内容 |
|------------|-----------|------|
| morning-video.yml | 07:00 | 朝の動画投稿 |
| night-video.yml | 19:00 | 夜の動画投稿 |
| summary-video.yml | 23:30 | まとめ動画投稿 |

## 🎨 カスタマイズ

### 色・デザインの変更

各動画コンポーネント (`src/videos/*.tsx`) のスタイルを編集してください。

### キャラクターのカスタマイズ

`src/components/UserCharacter.tsx` を編集してキャラクターデザインを変更できます。

### 投稿時間の変更

`.github/workflows/*.yml` のcron設定を変更してください。

## 📝 動画の流れ

```
07:00 ─── 朝の動画投稿 ───┐
                         │ ユーザーがコメント
19:00 ─── 夜の動画投稿 ───┤
                         │ ユーザーがコメント
23:30 ─── まとめ動画投稿 ─┘
          └── 朝と夜のコメントをマージ
              同じユーザーは一緒に表示
```

## 🌈 今後の予定

- [ ] TikTok対応
- [ ] Instagram Reels対応
- [ ] コメントフィルタリング機能
- [ ] カスタムキャラクター画像対応
- [ ] BGM追加機能

## 📄 ライセンス

MIT
