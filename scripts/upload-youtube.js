import { google } from "googleapis";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { getJSTDate } from "./utils/date.js";

dotenv.config();

const youtube = google.youtube("v3");
const STATUS_FILE = "./data/video-status.json";

// OAuth2クライアントの設定
function getAuthClient() {
    const oauth2Client = new google.auth.OAuth2(
        process.env.YOUTUBE_CLIENT_ID,
        process.env.YOUTUBE_CLIENT_SECRET,
        "http://localhost:3000/oauth2callback"
    );

    oauth2Client.setCredentials({
        refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
    });

    return oauth2Client;
}

// ステータスファイルを読み込む
function loadStatus() {
    if (fs.existsSync(STATUS_FILE)) {
        return JSON.parse(fs.readFileSync(STATUS_FILE, "utf-8"));
    }
    return {
        lastUpdated: null,
        videos: {
            morning: { videoId: null, date: null, uploadedAt: null },
            night: { videoId: null, date: null, uploadedAt: null },
            summary: { videoId: null, date: null, uploadedAt: null },
        },
        history: [],
    };
}

// ステータスファイルを保存
function saveStatus(status) {
    // dataディレクトリがなければ作成
    const dataDir = path.dirname(STATUS_FILE);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2) + "\n");
}

// 動画タイプの設定
const VIDEO_CONFIGS = {
    morning: {
        title: (date) => `【${date}】おはよう！今日の目標は？🌅`,
        description: `今日も一日頑張ろう！

あなたの今日の目標をコメントで教えてください✨
📺 コメントは今夜23:30のまとめ動画で紹介されます！

小さな目標でもOK！
みんなで共有して、一緒に頑張りましょう！

#今日の頑張り #毎日投稿 #モチベーション #shorts`,
        tags: ["今日の頑張り", "モチベーション", "目標", "毎日投稿", "頑張る", "shorts"],
        categoryId: "22", // People & Blogs
        // 説明コメント
        pinnedComment: `🎬 コメントすると今夜の動画に出演できます！

━━━━━━━━━━━━━━━━━
📺 今夜23:30「まとめ動画」で
　 あなたのコメントをキャラクター付きで紹介✨
━━━━━━━━━━━━━━━━━

💬 今日の目標をコメントで宣言しよう！
　 例）「今日は読書を30分する！」
　 例）「仕事の資料を1つ仕上げる」

🌙 今夜19時の動画で達成報告もできます！

⚠️ コメント = まとめ動画への出演同意となります
　 （アイコン・お名前が紹介されます）`,
    },
    night: {
        title: (date) => `【${date}】おつかれさま！今日できたことは？🌙`,
        description: `今日も一日お疲れ様でした！

今日できたことをコメントで教えてください🌟
📺 コメントは今夜23:30のまとめ動画で紹介されます！

どんな小さなことでも、自分を褒めてあげよう！
みんなの頑張りを見て、明日も頑張れる！

#今日の頑張り #毎日投稿 #振り返り #お疲れ様 #shorts`,
        tags: ["今日の頑張り", "振り返り", "お疲れ様", "毎日投稿", "頑張った", "shorts"],
        categoryId: "22",
        // 説明コメント
        pinnedComment: `🎬 コメントすると今夜の動画に出演できます！

━━━━━━━━━━━━━━━━━
📺 今夜23:30「まとめ動画」で
　 あなたのコメントをキャラクター付きで紹介✨
━━━━━━━━━━━━━━━━━

💬 今日できたことをコメントで報告しよう！
　 例）「資格の勉強を1時間した！」
　 例）「部屋の掃除ができた！」

🌅 朝の動画でも目標宣言した方は
　 両方のコメントがまとめて紹介されます🎉

⚠️ コメント = まとめ動画への出演同意となります
　 （アイコン・お名前が紹介されます）`,
    },
    summary: {
        title: (date) => `【${date}】みんなの今日の頑張り✨`,
        description: `今日参加してくれたみんなの頑張りをまとめました！

朝に目標を宣言して、夜に達成報告をしてくれた方々を
キャラクターでアニメーション紹介しています🎉

明日もみんなで頑張ろう！

#今日の頑張り #みんなの頑張り #コミュニティ #毎日投稿`,
        tags: ["今日の頑張り", "みんなの頑張り", "コミュニティ", "まとめ", "毎日投稿"],
        categoryId: "22",
        // まとめ動画にはコメントしない
        pinnedComment: null,
    },
};

// 動画にコメントを投稿
async function postComment(videoId, commentText) {
    const auth = getAuthClient();

    try {
        const response = await youtube.commentThreads.insert({
            auth,
            part: ["snippet"],
            requestBody: {
                snippet: {
                    videoId: videoId,
                    topLevelComment: {
                        snippet: {
                            textOriginal: commentText,
                        },
                    },
                },
            },
        });

        console.log(`コメントを投稿しました: ${response.data.id}`);
        return response.data;
    } catch (error) {
        console.error("コメント投稿エラー:", error.message);
        // コメント投稿失敗は致命的ではないので続行
        return null;
    }
}

async function uploadVideo(videoPath, type, date) {
    const auth = getAuthClient();
    const config = VIDEO_CONFIGS[type];

    if (!config) {
        throw new Error(`不明な動画タイプ: ${type}`);
    }

    const formattedDate = new Date(date).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    console.log(`動画をアップロード中: ${videoPath}`);

    const response = await youtube.videos.insert({
        auth,
        part: ["snippet", "status"],
        requestBody: {
            snippet: {
                title: config.title(formattedDate),
                description: config.description,
                tags: config.tags,
                categoryId: config.categoryId,
                defaultLanguage: "ja",
                defaultAudioLanguage: "ja",
            },
            status: {
                privacyStatus: "public",
                selfDeclaredMadeForKids: false,
            },
        },
        media: {
            body: fs.createReadStream(videoPath),
        },
    });

    return response.data;
}

async function main() {
    const args = process.argv.slice(2);
    const typeIndex = args.indexOf("--type");

    if (typeIndex === -1 || !args[typeIndex + 1]) {
        console.error("使用法: node upload-youtube.js --type <morning|night|summary>");
        process.exit(1);
    }

    const type = args[typeIndex + 1];
    const today = getJSTDate();
    console.log(`日付 (JST): ${today}`);

    const outputDir = process.env.OUTPUT_DIR || "./output";

    let videoPath;
    switch (type) {
        case "morning":
            videoPath = path.join(outputDir, `morning_${today}.mp4`);
            break;
        case "night":
            videoPath = path.join(outputDir, `night_${today}.mp4`);
            break;
        case "summary":
            videoPath = path.join(outputDir, `summary_${today}.mp4`);
            break;
        default:
            console.error(`不明な動画タイプ: ${type}`);
            process.exit(1);
    }

    if (!fs.existsSync(videoPath)) {
        console.error(`動画ファイルが見つかりません: ${videoPath}`);
        process.exit(1);
    }

    try {
        const result = await uploadVideo(videoPath, type, today);
        console.log("アップロード成功！");
        console.log(`動画ID: ${result.id}`);
        console.log(`URL: https://www.youtube.com/watch?v=${result.id}`);

        // 説明コメントを投稿（設定されている場合のみ）
        const config = VIDEO_CONFIGS[type];
        if (config.pinnedComment) {
            console.log("\n説明コメントを投稿中...");
            // 少し待ってから投稿（動画の処理完了を待つ）
            await new Promise(resolve => setTimeout(resolve, 5000));
            await postComment(result.id, config.pinnedComment);
        }

        // ステータスファイルに動画IDを保存
        const status = loadStatus();
        const now = new Date().toISOString();

        // 現在の動画情報を更新
        status.videos[type] = {
            videoId: result.id,
            date: today,
            uploadedAt: now,
        };
        status.lastUpdated = now;

        // 履歴に追加（最新100件まで保持）
        status.history.unshift({
            type,
            videoId: result.id,
            date: today,
            uploadedAt: now,
            title: result.snippet?.title || null,
        });
        if (status.history.length > 100) {
            status.history = status.history.slice(0, 100);
        }

        saveStatus(status);
        console.log("動画IDをステータスファイルに保存しました");

        // GitHub Actions用に出力
        if (process.env.GITHUB_OUTPUT) {
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `video_id=${result.id}\n`);
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `video_url=https://www.youtube.com/watch?v=${result.id}\n`);
        }

    } catch (error) {
        console.error("アップロードエラー:", error.message);
        if (error.response) {
            console.error("詳細:", JSON.stringify(error.response.data, null, 2));
        }
        process.exit(1);
    }
}

main().catch(console.error);
