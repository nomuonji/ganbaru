import { Composition } from "remotion";
import { z } from "zod";
import { MorningVideo } from "./videos/MorningVideo";
import { NightVideo } from "./videos/NightVideo";
import { SummaryVideo, UserComment } from "./videos/SummaryVideo";
import { PromotionalSummaryVideo } from "./videos/PromotionalSummaryVideo";
import { sampleComments } from "./data/sampleComments";

// ショート動画の設定（縦長 9:16）
const SHORT_VIDEO_CONFIG = {
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 30 * 15, // 15秒
};

// まとめ動画の設定（横長 16:9）
const SUMMARY_VIDEO_CONFIG = {
    width: 1920,
    height: 1080,
    fps: 30,
};

// 今日の日付
const today = new Date().toISOString().split("T")[0];

// 両方コメントしたユーザーを優先でソート
const sortedComments: UserComment[] = [...sampleComments].sort((a, b) => {
    const aHasBoth = a.morningGoal && a.nightAchievement;
    const bHasBoth = b.morningGoal && b.nightAchievement;
    if (aHasBoth && !bHasBoth) return -1;
    if (!aHasBoth && bHasBoth) return 1;
    return 0;
});

// まとめ動画の長さを計算
const calculateSummaryDuration = (commentsCount: number) => {
    const fps = 30;
    const introFrames = fps * 4; // イントロ4秒
    const perUserFrames = fps * 6; // ユーザーあたり6秒
    const listViewFrames = fps * 5; // 一覧表示5秒
    const outroFrames = fps * 4; // エンディング4秒
    return introFrames + commentsCount * perUserFrames + listViewFrames + outroFrames;
};

// スキーマ定義
const morningVideoSchema = z.object({
    date: z.string(),
});

const nightVideoSchema = z.object({
    date: z.string(),
});

const userCommentSchema = z.object({
    username: z.string(),
    userId: z.string(),
    morningGoal: z.string().optional(),
    nightAchievement: z.string().optional(),
    avatarColor: z.string(),
    avatarUrl: z.string().optional(),
});

const summaryVideoSchema = z.object({
    date: z.string(),
    comments: z.array(userCommentSchema),
});

const promotionalVideoSchema = z.object({
    date: z.string(),
});

export const RemotionRoot: React.FC = () => {
    return (
        <>
            {/* 朝の動画 - 今日の目標を募る */}
            <Composition
                id="MorningVideo"
                component={MorningVideo}
                schema={morningVideoSchema}
                {...SHORT_VIDEO_CONFIG}
                defaultProps={{
                    date: today,
                }}
            />

            {/* 夜の動画 - 今日できたことを募る */}
            <Composition
                id="NightVideo"
                component={NightVideo}
                schema={nightVideoSchema}
                {...SHORT_VIDEO_CONFIG}
                defaultProps={{
                    date: today,
                }}
            />

            {/* まとめ動画 - サンプルデータでプレビュー */}
            <Composition
                id="SummaryVideo"
                component={SummaryVideo}
                schema={summaryVideoSchema}
                {...SUMMARY_VIDEO_CONFIG}
                durationInFrames={calculateSummaryDuration(sortedComments.length)}
                defaultProps={{
                    date: today,
                    comments: sortedComments,
                }}
            />

            {/* まとめ動画（少人数版） - 3人のみでテスト */}
            <Composition
                id="SummaryVideo-Short"
                component={SummaryVideo}
                schema={summaryVideoSchema}
                {...SUMMARY_VIDEO_CONFIG}
                durationInFrames={calculateSummaryDuration(3)}
                defaultProps={{
                    date: today,
                    comments: sortedComments.slice(0, 3),
                }}
            />

            {/* 広報動画 - コメントがない日用 */}
            <Composition
                id="PromotionalVideo"
                component={PromotionalSummaryVideo}
                schema={promotionalVideoSchema}
                {...SUMMARY_VIDEO_CONFIG}
                durationInFrames={30 * 30} // 30秒
                defaultProps={{
                    date: today,
                }}
            />
        </>
    );
};

export default RemotionRoot;
