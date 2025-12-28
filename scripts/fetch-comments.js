import { google } from "googleapis";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

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

// 動画のコメントを取得
async function fetchVideoComments(videoId, maxResults = 100) {
    const auth = getAuthClient();

    const response = await youtube.commentThreads.list({
        auth,
        part: ["snippet"],
        videoId,
        maxResults,
        order: "time",
    });

    return response.data.items.map((item) => ({
        commentId: item.id,
        userId: item.snippet.topLevelComment.snippet.authorChannelId?.value || "",
        username: item.snippet.topLevelComment.snippet.authorDisplayName,
        content: item.snippet.topLevelComment.snippet.textDisplay,
        publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
        avatarUrl: item.snippet.topLevelComment.snippet.authorProfileImageUrl,
    }));
}

// ユーザーIDから一意の色を生成
function generateAvatarColor(userId) {
    const colors = [
        "#FF6B6B", "#4ECDC4", "#45B7D1", "#96E6A1", "#DDA0DD",
        "#F7DC6F", "#BB8FCE", "#85C1E9", "#F8B500", "#58D68D",
        "#EC7063", "#5DADE2", "#AF7AC5", "#48C9B0", "#F4D03F",
    ];

    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
}

// 朝と夜のコメントをマージ
function mergeComments(morningComments, nightComments) {
    const userMap = new Map();

    // 朝のコメントを処理
    for (const comment of morningComments) {
        userMap.set(comment.userId, {
            username: comment.username,
            userId: comment.userId,
            morningGoal: comment.content,
            nightAchievement: undefined,
            avatarColor: generateAvatarColor(comment.userId),
        });
    }

    // 夜のコメントを処理（同じユーザーなら統合）
    for (const comment of nightComments) {
        const existing = userMap.get(comment.userId);
        if (existing) {
            existing.nightAchievement = comment.content;
        } else {
            userMap.set(comment.userId, {
                username: comment.username,
                userId: comment.userId,
                morningGoal: undefined,
                nightAchievement: comment.content,
                avatarColor: generateAvatarColor(comment.userId),
            });
        }
    }

    // 両方コメントしたユーザーを優先してソート
    const comments = Array.from(userMap.values());
    comments.sort((a, b) => {
        const aHasBoth = a.morningGoal && a.nightAchievement;
        const bHasBoth = b.morningGoal && b.nightAchievement;
        if (aHasBoth && !bHasBoth) return -1;
        if (!aHasBoth && bHasBoth) return 1;
        return 0;
    });

    return comments;
}

// メイン処理
async function main() {
    const morningVideoId = process.env.MORNING_VIDEO_ID;
    const nightVideoId = process.env.NIGHT_VIDEO_ID;

    if (!morningVideoId || !nightVideoId) {
        console.error("MORNING_VIDEO_ID と NIGHT_VIDEO_ID を.envに設定してください");
        process.exit(1);
    }

    console.log("朝の動画からコメントを取得中...");
    const morningComments = await fetchVideoComments(morningVideoId);
    console.log(`  ${morningComments.length}件のコメントを取得`);

    console.log("夜の動画からコメントを取得中...");
    const nightComments = await fetchVideoComments(nightVideoId);
    console.log(`  ${nightComments.length}件のコメントを取得`);

    console.log("コメントをマージ中...");
    const mergedComments = mergeComments(morningComments, nightComments);
    console.log(`  ${mergedComments.length}人のユーザーコメント`);

    // 出力ディレクトリ作成
    const outputDir = process.env.OUTPUT_DIR || "./output";
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // 今日の日付でファイル保存
    const today = new Date().toISOString().split("T")[0];
    const outputPath = path.join(outputDir, `comments_${today}.json`);

    fs.writeFileSync(outputPath, JSON.stringify({
        date: today,
        comments: mergedComments,
        stats: {
            totalUsers: mergedComments.length,
            bothCommented: mergedComments.filter((c) => c.morningGoal && c.nightAchievement).length,
            morningOnly: mergedComments.filter((c) => c.morningGoal && !c.nightAchievement).length,
            nightOnly: mergedComments.filter((c) => !c.morningGoal && c.nightAchievement).length,
        },
    }, null, 2));

    console.log(`コメントを保存しました: ${outputPath}`);
}

main().catch(console.error);
