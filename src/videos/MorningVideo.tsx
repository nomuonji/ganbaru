import React from "react";
import {
    AbsoluteFill,
    Audio,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
    spring,
} from "remotion";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { selectPopBgm } from "../utils/bgm";

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

    // 雲のふわふわアニメーション
    const cloudFloat1 = Math.sin(frame * 0.03) * 8;
    const cloudFloat2 = Math.sin(frame * 0.025 + 1) * 10;
    const cloudFloat3 = Math.sin(frame * 0.035 + 2) * 6;

    // 太陽の輝きアニメーション
    const sunGlow = interpolate(frame % 120, [0, 60, 120], [0.8, 1, 0.8]);

    // BGM選択（日付をシードにしてランダム）
    const bgmSrc = selectPopBgm(date);

    // 雲の配置
    const clouds = [
        { top: 12, left: 5, width: 180, float: cloudFloat1, opacity: 0.9 },
        { top: 25, left: 70, width: 150, float: cloudFloat2, opacity: 0.8 },
        { top: 45, left: -5, width: 200, float: cloudFloat3, opacity: 0.7 },
        { top: 60, left: 80, width: 160, float: cloudFloat1, opacity: 0.85 },
        { top: 75, left: 25, width: 140, float: cloudFloat2, opacity: 0.75 },
    ];

    return (
        <AbsoluteFill
            style={{
                background: `linear-gradient(${gradientAngle}deg, 
          #87CEEB 0%,
          #5DADE2 20%,
          #3498DB 40%,
          #5DADE2 60%,
          #87CEEB 80%,
          #B0E0E6 100%)`,
                fontFamily: "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {/* BGM */}
            <Audio src={bgmSrc} volume={0.3} />

            {/* 太陽の装飾 */}
            <div
                style={{
                    position: "absolute",
                    top: 80,
                    right: 60,
                    width: 160,
                    height: 160,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #fff700 0%, #ffcc00 50%, #ff9500 100%)",
                    boxShadow: `
                        0 0 60px rgba(255, 215, 0, ${sunGlow * 0.8}),
                        0 0 120px rgba(255, 165, 0, ${sunGlow * 0.6}),
                        0 0 180px rgba(255, 100, 0, ${sunGlow * 0.4})
                    `,
                    opacity: sunGlow,
                }}
            />
            {/* 太陽の光芒 */}
            {[...Array(8)].map((_, i) => (
                <div
                    key={i}
                    style={{
                        position: "absolute",
                        top: 160,
                        right: 140,
                        width: 4,
                        height: 60,
                        background: "linear-gradient(to bottom, rgba(255, 215, 0, 0.8), transparent)",
                        transformOrigin: "center -80px",
                        transform: `rotate(${i * 45}deg)`,
                        opacity: sunGlow * 0.6,
                    }}
                />
            ))}

            {/* 雲の装飾 */}
            {clouds.map((cloud, i) => (
                <div
                    key={i}
                    style={{
                        position: "absolute",
                        top: `${cloud.top}%`,
                        left: `${cloud.left}%`,
                        transform: `translateY(${cloud.float}px)`,
                        opacity: cloud.opacity,
                    }}
                >
                    <Cloud width={cloud.width} />
                </div>
            ))}

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

// 雲コンポーネント
const Cloud: React.FC<{ width: number }> = ({ width }) => {
    const height = width * 0.4;
    const circleSize = width * 0.35;

    return (
        <div
            style={{
                position: "relative",
                width,
                height,
            }}
        >
            {/* 左の丸 */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: width * 0.05,
                    width: circleSize * 0.8,
                    height: circleSize * 0.8,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.95)",
                }}
            />
            {/* 中央の丸（大） */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: width * 0.25,
                    width: circleSize,
                    height: circleSize,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.98)",
                }}
            />
            {/* 右側の丸 */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    right: width * 0.15,
                    width: circleSize * 0.9,
                    height: circleSize * 0.9,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.95)",
                }}
            />
            {/* ベース（楕円） */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: "5%",
                    width: "90%",
                    height: circleSize * 0.5,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.9)",
                }}
            />
        </div>
    );
};

export default MorningVideo;
