import { google } from "googleapis";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const youtube = google.youtube("v3");

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

// 動画タイプの設定
const VIDEO_CONFIGS = {
    morning: {
        title: (date) => `【${date}】おはよう！今日の目標は？🌅`,
        description: `今日も一日頑張ろう！

あなたの今日の目標をコメントで教えてください✨

小さな目標でもOK！
みんなで共有して、一緒に頑張りましょう！

#今日の頑張り #毎日投稿 #モチベーション`,
        tags: ["今日の頑張り", "モチベーション", "目標", "毎日投稿", "頑張る"],
        categoryId: "22", // People & Blogs
    },
    night: {
        title: (date) => `【${date}】おつかれさま！今日できたことは？🌙`,
        description: `今日も一日お疲れ様でした！

今日できたことをコメントで教えてください🌟

どんな小さなことでも、自分を褒めてあげよう！
みんなの頑張りを見て、明日も頑張れる！

#今日の頑張り #毎日投稿 #振り返り #お疲れ様`,
        tags: ["今日の頑張り", "振り返り", "お疲れ様", "毎日投稿", "頑張った"],
        categoryId: "22",
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
    },
};

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
    const today = new Date().toISOString().split("T")[0];
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

        // 動画IDを環境変数ファイルに保存（次回のコメント取得用）
        const envPath = path.resolve(".env");
        let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";

        if (type === "morning") {
            envContent = envContent.replace(/MORNING_VIDEO_ID=.*\n?/, "");
            envContent += `\nMORNING_VIDEO_ID=${result.id}`;
        } else if (type === "night") {
            envContent = envContent.replace(/NIGHT_VIDEO_ID=.*\n?/, "");
            envContent += `\nNIGHT_VIDEO_ID=${result.id}`;
        }

        fs.writeFileSync(envPath, envContent.trim() + "\n");
        console.log("動画IDを.envに保存しました");

    } catch (error) {
        console.error("アップロードエラー:", error.message);
        process.exit(1);
    }
}

main().catch(console.error);
