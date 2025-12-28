import React from "react";
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
    spring,
} from "remotion";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface MorningVideoProps {
    date: string;
}

export const MorningVideo: React.FC<MorningVideoProps> = ({ date }) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    // 日付フォーマット
    const formattedDate = format(new Date(date), "M月d日(E)", { locale: ja });

    // アニメーション値
    const titleScale = spring({
        frame,
        fps,
        from: 0,
        to: 1,
        config: { damping: 12, stiffness: 100 },
    });

    const dateOpacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: "clamp",
    });

    const subtitleOpacity = interpolate(frame, [40, 60], [0, 1], {
        extrapolateRight: "clamp",
    });

    const ctaOpacity = interpolate(frame, [80, 100], [0, 1], {
        extrapolateRight: "clamp",
    });

    const pulseScale = interpolate(frame % 30, [0, 15, 30], [1, 1.05, 1]);

    // 背景グラデーションアニメーション
    const gradientAngle = interpolate(frame, [0, durationInFrames], [135, 225]);

    return (
        <AbsoluteFill
            style={{
                background: `linear-gradient(${gradientAngle}deg, 
          #FF6B6B 0%, 
          #FF8E53 30%, 
          #FFC857 60%, 
          #FF8E53 100%)`,
                fontFamily: "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {/* 装飾的な円 - 右上 */}
            <div
                style={{
                    position: "absolute",
                    top: 100,
                    right: -80,
                    width: 300,
                    height: 300,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.15)",
                }}
            />

            {/* 装飾的な円 - 左下 */}
            <div
                style={{
                    position: "absolute",
                    bottom: 300,
                    left: -100,
                    width: 250,
                    height: 250,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.1)",
                }}
            />

            {/* 日付 */}
            <div
                style={{
                    fontSize: 56,
                    color: "rgba(255, 255, 255, 0.95)",
                    marginBottom: 60,
                    opacity: dateOpacity,
                    fontWeight: 600,
                }}
            >
                {formattedDate}
            </div>

            {/* メインタイトル */}
            <div
                style={{
                    transform: `scale(${titleScale})`,
                    textAlign: "center",
                }}
            >
                <div
                    style={{
                        fontSize: 120,
                        fontWeight: 900,
                        color: "white",
                        textShadow: "0 6px 30px rgba(0, 0, 0, 0.25)",
                        lineHeight: 1.3,
                    }}
                >
                    おはよう！
                </div>
                <div
                    style={{
                        fontSize: 88,
                        fontWeight: 800,
                        color: "white",
                        marginTop: 30,
                        textShadow: "0 6px 30px rgba(0, 0, 0, 0.25)",
                    }}
                >
                    今日の目標は？
                </div>
            </div>

            {/* サブテキスト */}
            <div
                style={{
                    fontSize: 44,
                    color: "rgba(255, 255, 255, 0.95)",
                    marginTop: 80,
                    opacity: subtitleOpacity,
                    lineHeight: 1.8,
                    textAlign: "center",
                }}
            >
                コメントで<br />
                あなたの今日の目標を<br />
                教えてください✨
            </div>

            {/* CTA */}
            <div
                style={{
                    marginTop: 100,
                    padding: "35px 70px",
                    background: "rgba(255, 255, 255, 0.25)",
                    borderRadius: 100,
                    fontSize: 52,
                    fontWeight: 700,
                    color: "white",
                    opacity: ctaOpacity,
                    transform: `scale(${pulseScale})`,
                    backdropFilter: "blur(10px)",
                    border: "3px solid rgba(255, 255, 255, 0.4)",
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
                }}
            >
                👇 コメントする
            </div>

            {/* フッター - まとめ動画掲載告知 */}
            <div
                style={{
                    position: "absolute",
                    bottom: 60,
                    left: 0,
                    right: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    opacity: ctaOpacity,
                }}
            >
                <div
                    style={{
                        fontSize: 32,
                        color: "rgba(255, 255, 255, 0.95)",
                        fontWeight: 600,
                        marginBottom: 15,
                        textAlign: "center",
                    }}
                >
                    📺 コメントは夜のまとめ動画で紹介！
                </div>
                <div
                    style={{
                        fontSize: 22,
                        color: "rgba(255, 255, 255, 0.75)",
                        textAlign: "center",
                        lineHeight: 1.5,
                        maxWidth: 900,
                        padding: "0 40px",
                    }}
                >
                    ※コメントすると、まとめ動画での紹介・
                    <br />
                    プロフィール画像の使用に同意したものとします
                </div>
                <div
                    style={{
                        fontSize: 28,
                        color: "rgba(255, 255, 255, 0.85)",
                        marginTop: 20,
                        fontWeight: 500,
                    }}
                >
                    #今日の頑張り #毎日投稿
                </div>
            </div>
        </AbsoluteFill>
    );
};

export default MorningVideo;
