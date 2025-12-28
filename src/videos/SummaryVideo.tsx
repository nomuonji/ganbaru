import React from "react";
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
    spring,
    Sequence,
} from "remotion";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { UserCharacter } from "../components/UserCharacter";
import { CommentBubble } from "../components/CommentBubble";

export interface UserComment {
    username: string;
    userId: string;
    morningGoal?: string; // 朝のコメント（今日の目標）
    nightAchievement?: string; // 夜のコメント（できたこと）
    avatarColor: string;
}

interface SummaryVideoProps {
    date: string;
    comments: UserComment[];
}

export const SummaryVideo: React.FC<SummaryVideoProps> = ({ date, comments }) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    // 日付フォーマット
    const formattedDate = format(new Date(date), "yyyy年M月d日(E)", { locale: ja });

    // イントロアニメーション（最初の3秒）
    const introFrames = fps * 3;

    // 各ユーザーの表示時間
    const perUserFrames = fps * 5;

    // エンディング（最後の3秒）
    const outroFrames = fps * 3;

    // イントロのアニメーション
    const introTitleScale = spring({
        frame,
        fps,
        from: 0,
        to: 1,
        config: { damping: 12, stiffness: 80 },
    });

    const introOpacity = interpolate(
        frame,
        [0, 30, introFrames - 30, introFrames],
        [0, 1, 1, 0],
        { extrapolateRight: "clamp" }
    );

    // 背景のパーティクル
    const particles = [...Array(30)].map((_, i) => ({
        x: (i * 67 + frame * 0.5) % 1920,
        y: ((i * 43 + frame * 0.3) % 1080),
        size: 3 + (i % 4) * 2,
        opacity: 0.1 + (i % 5) * 0.05,
    }));

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
                fontFamily: "'Noto Sans JP', sans-serif",
            }}
        >
            {/* 背景パーティクル */}
            {particles.map((p, i) => (
                <div
                    key={i}
                    style={{
                        position: "absolute",
                        left: p.x,
                        top: p.y,
                        width: p.size,
                        height: p.size,
                        borderRadius: "50%",
                        background: "white",
                        opacity: p.opacity,
                    }}
                />
            ))}

            {/* イントロセクション */}
            {frame < introFrames && (
                <AbsoluteFill
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: introOpacity,
                    }}
                >
                    <div
                        style={{
                            fontSize: 48,
                            color: "rgba(255, 255, 255, 0.9)",
                            marginBottom: 30,
                        }}
                    >
                        {formattedDate}
                    </div>
                    <div
                        style={{
                            fontSize: 100,
                            fontWeight: 900,
                            color: "white",
                            textShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
                            transform: `scale(${introTitleScale})`,
                        }}
                    >
                        みんなの今日の頑張り ✨
                    </div>
                    <div
                        style={{
                            fontSize: 48,
                            color: "rgba(255, 255, 255, 0.9)",
                            marginTop: 40,
                        }}
                    >
                        {comments.length}人が参加してくれました！
                    </div>
                </AbsoluteFill>
            )}

            {/* 各ユーザーのコメント表示 */}
            {comments.map((comment, index) => {
                const userStartFrame = introFrames + index * perUserFrames;
                const userEndFrame = userStartFrame + perUserFrames;

                if (frame < userStartFrame || frame >= userEndFrame) return null;

                const localFrame = frame - userStartFrame;

                return (
                    <Sequence key={comment.userId} from={userStartFrame} durationInFrames={perUserFrames}>
                        <UserCommentSection
                            comment={comment}
                            localFrame={localFrame}
                            fps={fps}
                        />
                    </Sequence>
                );
            })}

            {/* エンディングセクション */}
            {frame >= durationInFrames - outroFrames && (
                <AbsoluteFill
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            fontSize: 80,
                            fontWeight: 900,
                            color: "white",
                            textShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
                        }}
                    >
                        今日もみんなお疲れ様！🎉
                    </div>
                    <div
                        style={{
                            fontSize: 48,
                            color: "rgba(255, 255, 255, 0.9)",
                            marginTop: 40,
                        }}
                    >
                        明日も一緒に頑張ろう！
                    </div>
                    <div
                        style={{
                            fontSize: 36,
                            color: "rgba(255, 255, 255, 0.8)",
                            marginTop: 60,
                        }}
                    >
                        #今日の頑張り #みんなの頑張り
                    </div>
                </AbsoluteFill>
            )}
        </AbsoluteFill>
    );
};

// 個別ユーザーのコメントセクション
interface UserCommentSectionProps {
    comment: UserComment;
    localFrame: number;
    fps: number;
}

const UserCommentSection: React.FC<UserCommentSectionProps> = ({
    comment,
    localFrame,
    fps,
}) => {
    // キャラクター登場アニメーション
    const characterX = interpolate(
        localFrame,
        [0, fps * 0.5],
        [-300, 200],
        { extrapolateRight: "clamp" }
    );

    const characterScale = spring({
        frame: localFrame,
        fps,
        from: 0,
        to: 1,
        config: { damping: 10, stiffness: 100 },
    });

    // 目標（朝のコメント）の吹き出し
    const goalBubbleOpacity = interpolate(
        localFrame,
        [fps * 0.5, fps * 0.8],
        [0, 1],
        { extrapolateRight: "clamp" }
    );

    // 達成（夜のコメント）の吹き出し
    const achievementBubbleOpacity = interpolate(
        localFrame,
        [fps * 1.5, fps * 1.8],
        [0, 1],
        { extrapolateRight: "clamp" }
    );

    // 成功エフェクト
    const successEffectOpacity = interpolate(
        localFrame,
        [fps * 2.5, fps * 3, fps * 4],
        [0, 1, 0],
        { extrapolateRight: "clamp" }
    );

    return (
        <AbsoluteFill
            style={{
                display: "flex",
                alignItems: "center",
                padding: 80,
            }}
        >
            {/* キャラクター */}
            <div
                style={{
                    transform: `translateX(${characterX}px) scale(${characterScale})`,
                }}
            >
                <UserCharacter
                    username={comment.username}
                    avatarColor={comment.avatarColor}
                />
            </div>

            {/* コメント吹き出しエリア */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 40,
                    marginLeft: 100,
                }}
            >
                {/* 目標の吹き出し */}
                {comment.morningGoal && (
                    <div style={{ opacity: goalBubbleOpacity }}>
                        <CommentBubble
                            type="goal"
                            content={comment.morningGoal}
                        />
                    </div>
                )}

                {/* 達成の吹き出し */}
                {comment.nightAchievement && (
                    <div style={{ opacity: achievementBubbleOpacity }}>
                        <CommentBubble
                            type="achievement"
                            content={comment.nightAchievement}
                        />
                    </div>
                )}
            </div>

            {/* 成功エフェクト */}
            {comment.morningGoal && comment.nightAchievement && (
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: 200,
                        opacity: successEffectOpacity,
                    }}
                >
                    🎊
                </div>
            )}
        </AbsoluteFill>
    );
};

export default SummaryVideo;
