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
import { selectChillBgm } from "../utils/bgm";

interface NightVideoProps {
    date: string;
}

export const NightVideo: React.FC<NightVideoProps> = ({ date }) => {
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

    // 星のきらめき効果
    const starOpacity = interpolate(frame % 60, [0, 30, 60], [0.3, 1, 0.3]);

    // BGM選択（日付をシードにしてランダム）
    const bgmSrc = selectChillBgm(date);

    // 星の位置を生成
    const stars = [
        { top: 15, left: 10, size: 6 },
        { top: 8, left: 25, size: 4 },
        { top: 20, left: 40, size: 5 },
        { top: 12, left: 60, size: 4 },
        { top: 25, left: 80, size: 6 },
        { top: 35, left: 15, size: 4 },
        { top: 40, left: 85, size: 5 },
        { top: 55, left: 8, size: 4 },
        { top: 60, left: 90, size: 5 },
        { top: 70, left: 20, size: 4 },
        { top: 75, left: 75, size: 6 },
        { top: 85, left: 45, size: 4 },
    ];

    return (
        <AbsoluteFill
            style={{
                background: `linear-gradient(${gradientAngle}deg, 
          #1a1a2e 0%, 
          #16213e 30%, 
          #0f3460 60%, 
          #1a1a2e 100%)`,
                fontFamily: "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {/* BGM */}
            <Audio src={bgmSrc} volume={0.3} />

            {/* 星の装飾 */}
            {stars.map((star, i) => (
                <div
                    key={i}
                    style={{
                        position: "absolute",
                        top: `${star.top}%`,
                        left: `${star.left}%`,
                        width: star.size,
                        height: star.size,
                        borderRadius: "50%",
                        background: "white",
                        opacity: starOpacity * (0.4 + (i % 3) * 0.2),
                        boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.6)`,
                    }}
                />
            ))}

            {/* 月の装飾 */}
            <div
                style={{
                    position: "absolute",
                    top: 100,
                    right: 80,
                    width: 140,
                    height: 140,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #f5f5dc 0%, #fffacd 100%)",
                    boxShadow: "0 0 80px rgba(255, 250, 205, 0.5)",
                }}
            />

            {/* 日付 */}
            <div
                style={{
                    fontSize: 56,
                    color: "rgba(255, 255, 255, 0.9)",
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
                        fontSize: 110,
                        fontWeight: 900,
                        color: "white",
                        textShadow: "0 6px 30px rgba(0, 0, 0, 0.4)",
                        lineHeight: 1.3,
                    }}
                >
                    おつかれさま！
                </div>
                <div
                    style={{
                        fontSize: 80,
                        fontWeight: 800,
                        color: "#FFD700",
                        marginTop: 30,
                        textShadow: "0 6px 30px rgba(255, 215, 0, 0.4)",
                    }}
                >
                    今日できたことは？
                </div>
            </div>

            {/* サブテキスト */}
            <div
                style={{
                    fontSize: 44,
                    color: "rgba(255, 255, 255, 0.95)",
                    marginTop: 60,
                    opacity: subtitleOpacity,
                    lineHeight: 1.8,
                    textAlign: "center",
                }}
            >
                小さなことでもOK！<br />
                今日できたことを<br />
                コメントで教えてね🌙
            </div>

            {/* まとめ動画紹介バナー */}
            <div
                style={{
                    marginTop: 60,
                    background: "linear-gradient(135deg, rgba(255, 215, 0, 0.4), rgba(255, 165, 0, 0.3))",
                    borderRadius: 25,
                    padding: "20px 45px",
                    border: "3px solid rgba(255, 215, 0, 0.7)",
                    boxShadow: "0 8px 40px rgba(255, 165, 0, 0.5)",
                    opacity: ctaOpacity,
                }}
            >
                <div
                    style={{
                        fontSize: 44,
                        color: "#FFD700",
                        fontWeight: 800,
                        textAlign: "center",
                        textShadow: "0 3px 15px rgba(0, 0, 0, 0.5)",
                    }}
                >
                    🎬 今夜の動画であなたを紹介！
                </div>
            </div>

            {/* CTA */}
            <div
                style={{
                    marginTop: 50,
                    padding: "30px 60px",
                    background: "linear-gradient(135deg, rgba(255, 215, 0, 0.25), rgba(255, 215, 0, 0.1))",
                    borderRadius: 100,
                    fontSize: 48,
                    fontWeight: 700,
                    color: "white",
                    opacity: ctaOpacity,
                    transform: `scale(${pulseScale})`,
                    backdropFilter: "blur(10px)",
                    border: "3px solid rgba(255, 215, 0, 0.4)",
                    boxShadow: "0 10px 40px rgba(255, 215, 0, 0.2)",
                }}
            >
                👇 コメントで参加
            </div>

            {/* 注意書き（コンパクトに） */}
            <div
                style={{
                    marginTop: 30,
                    fontSize: 28,
                    color: "rgba(255, 255, 255, 0.7)",
                    opacity: ctaOpacity,
                }}
            >
                ※コメント=まとめ動画への出演同意
            </div>
        </AbsoluteFill>
    );
};

export default NightVideo;
