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

interface PromotionalSummaryVideoProps {
    date: string;
}

// サンプルで表示するダミーユーザー（雰囲気伝達用）
const SAMPLE_USERS = [
    { name: "Aさん", color: "#FF6B6B", goal: "朝活を始める", achievement: "6時に起きれた！" },
    { name: "Bさん", color: "#4ECDC4", goal: "読書30分", achievement: "50ページ読めた" },
    { name: "Cさん", color: "#45B7D1", goal: "運動する", achievement: "ジョギング完了！" },
    { name: "Dさん", color: "#96E6A1", goal: "勉強1時間", achievement: "集中できた" },
    { name: "Eさん", color: "#DDA0DD", goal: "早寝する", achievement: "23時に就寝" },
];

export const PromotionalSummaryVideo: React.FC<PromotionalSummaryVideoProps> = ({ date }) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    // 日付フォーマット
    const formattedDate = format(new Date(date), "yyyy年M月d日(E)", { locale: ja });

    // セクション分け
    const introFrames = fps * 5;
    const explainFrames = fps * 8;
    const exampleFrames = fps * 10;
    const ctaFrames = fps * 7;

    const isIntro = frame < introFrames;
    const isExplain = frame >= introFrames && frame < introFrames + explainFrames;
    const isExample = frame >= introFrames + explainFrames && frame < introFrames + explainFrames + exampleFrames;
    const isCta = frame >= introFrames + explainFrames + exampleFrames;

    // 背景パーティクル
    const particles = [...Array(30)].map((_, i) => ({
        x: (i * 67 + frame * 0.3) % 1920,
        y: (i * 43 + frame * 0.2) % 1080,
        size: 4 + (i % 4) * 2,
        opacity: 0.08 + (i % 5) * 0.03,
    }));

    // アニメーション
    const fadeIn = (startFrame: number, duration: number = 30) =>
        interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        });

    const scaleIn = (startFrame: number) =>
        spring({
            frame: Math.max(0, frame - startFrame),
            fps,
            from: 0,
            to: 1,
            config: { damping: 12, stiffness: 100 },
        });

    // BGM選択（日付をシードにしてランダム）
    const bgmSrc = selectChillBgm(date);

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
                fontFamily: "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif",
            }}
        >
            {/* BGM */}
            <Audio src={bgmSrc} volume={0.2} />

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

            {/* イントロ: チャンネル紹介 */}
            {isIntro && (
                <AbsoluteFill
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: fadeIn(0),
                    }}
                >
                    <div style={{ fontSize: 48, color: "rgba(255,255,255,0.9)", marginBottom: 30 }}>
                        {formattedDate}
                    </div>
                    <div
                        style={{
                            fontSize: 100,
                            fontWeight: 900,
                            color: "white",
                            textShadow: "0 6px 30px rgba(0,0,0,0.3)",
                            transform: `scale(${scaleIn(20)})`,
                            textAlign: "center",
                        }}
                    >
                        📺 今日の頑張り
                    </div>
                    <div
                        style={{
                            fontSize: 48,
                            color: "rgba(255,255,255,0.95)",
                            marginTop: 40,
                            opacity: fadeIn(60),
                        }}
                    >
                        みんなで毎日の頑張りを共有するチャンネル
                    </div>
                </AbsoluteFill>
            )}

            {/* 説明: このチャンネルの仕組み */}
            {isExplain && (
                <AbsoluteFill
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 80,
                        opacity: fadeIn(introFrames),
                    }}
                >
                    <div
                        style={{
                            fontSize: 64,
                            fontWeight: 800,
                            color: "white",
                            marginBottom: 60,
                            textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                        }}
                    >
                        🎯 参加方法はカンタン！
                    </div>

                    <div style={{ display: "flex", gap: 60 }}>
                        {/* Step 1 */}
                        <div
                            style={{
                                background: "rgba(255,255,255,0.15)",
                                backdropFilter: "blur(10px)",
                                borderRadius: 30,
                                padding: 40,
                                width: 400,
                                textAlign: "center",
                                transform: `scale(${scaleIn(introFrames + 30)})`,
                            }}
                        >
                            <div style={{ fontSize: 72, marginBottom: 20 }}>🌅</div>
                            <div style={{ fontSize: 36, fontWeight: 700, color: "white", marginBottom: 15 }}>
                                ① 朝の動画
                            </div>
                            <div style={{ fontSize: 28, color: "rgba(255,255,255,0.9)" }}>
                                今日の目標を<br />コメントで宣言！
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div
                            style={{
                                background: "rgba(255,255,255,0.15)",
                                backdropFilter: "blur(10px)",
                                borderRadius: 30,
                                padding: 40,
                                width: 400,
                                textAlign: "center",
                                transform: `scale(${scaleIn(introFrames + 60)})`,
                            }}
                        >
                            <div style={{ fontSize: 72, marginBottom: 20 }}>🌙</div>
                            <div style={{ fontSize: 36, fontWeight: 700, color: "white", marginBottom: 15 }}>
                                ② 夜の動画
                            </div>
                            <div style={{ fontSize: 28, color: "rgba(255,255,255,0.9)" }}>
                                今日できたことを<br />コメントで報告！
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div
                            style={{
                                background: "linear-gradient(135deg, rgba(255,215,0,0.25), rgba(255,107,107,0.25))",
                                backdropFilter: "blur(10px)",
                                borderRadius: 30,
                                padding: 40,
                                width: 400,
                                textAlign: "center",
                                border: "2px solid rgba(255,215,0,0.4)",
                                transform: `scale(${scaleIn(introFrames + 90)})`,
                            }}
                        >
                            <div style={{ fontSize: 72, marginBottom: 20 }}>🎊</div>
                            <div style={{ fontSize: 36, fontWeight: 700, color: "#FFD700", marginBottom: 15 }}>
                                ③ まとめ動画
                            </div>
                            <div style={{ fontSize: 28, color: "rgba(255,255,255,0.9)" }}>
                                あなたの頑張りを<br />アニメーションで紹介！
                            </div>
                        </div>
                    </div>
                </AbsoluteFill>
            )}

            {/* 例: こんな感じになります */}
            {isExample && (
                <AbsoluteFill
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 60,
                        opacity: fadeIn(introFrames + explainFrames),
                    }}
                >
                    <div
                        style={{
                            fontSize: 56,
                            fontWeight: 800,
                            color: "white",
                            marginBottom: 40,
                            textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                        }}
                    >
                        ✨ まとめ動画のイメージ
                    </div>

                    <div
                        style={{
                            background: "rgba(255,255,255,0.1)",
                            backdropFilter: "blur(10px)",
                            borderRadius: 20,
                            padding: "30px 40px",
                            width: "90%",
                        }}
                    >
                        {SAMPLE_USERS.map((user, index) => {
                            const delay = introFrames + explainFrames + index * 20;
                            const opacity = fadeIn(delay, 20);
                            const scale = scaleIn(delay);

                            return (
                                <div
                                    key={index}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "15px 20px",
                                        marginBottom: 15,
                                        background: "rgba(255,255,255,0.1)",
                                        borderRadius: 15,
                                        opacity,
                                        transform: `scale(${scale})`,
                                    }}
                                >
                                    {/* アバター */}
                                    <div
                                        style={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: "50%",
                                            background: user.color,
                                            marginRight: 25,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 28,
                                            fontWeight: 700,
                                            color: "white",
                                        }}
                                    >
                                        {user.name.charAt(0)}
                                    </div>
                                    <div style={{ width: 120, fontSize: 28, fontWeight: 700, color: "white" }}>
                                        {user.name}
                                    </div>
                                    <div style={{ flex: 1, fontSize: 24, color: "rgba(255,255,255,0.9)", paddingRight: 20 }}>
                                        🎯 {user.goal}
                                    </div>
                                    <div style={{ flex: 1, fontSize: 24, color: "rgba(255,255,255,0.9)" }}>
                                        ✅ {user.achievement}
                                    </div>
                                    <div style={{ fontSize: 36 }}>🎊</div>
                                </div>
                            );
                        })}
                    </div>

                    <div
                        style={{
                            marginTop: 30,
                            fontSize: 32,
                            color: "rgba(255,255,255,0.8)",
                            fontStyle: "italic",
                        }}
                    >
                        ※ イメージです。実際はあなたのコメントが表示されます！
                    </div>
                </AbsoluteFill>
            )}

            {/* CTA: 参加を呼びかけ */}
            {isCta && (
                <AbsoluteFill
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: fadeIn(introFrames + explainFrames + exampleFrames),
                    }}
                >
                    <div
                        style={{
                            fontSize: 90,
                            fontWeight: 900,
                            color: "white",
                            textShadow: "0 6px 30px rgba(0,0,0,0.3)",
                            transform: `scale(${scaleIn(introFrames + explainFrames + exampleFrames + 20)})`,
                            textAlign: "center",
                        }}
                    >
                        明日から参加してみよう！
                    </div>

                    <div
                        style={{
                            marginTop: 50,
                            fontSize: 48,
                            color: "rgba(255,255,255,0.95)",
                            textAlign: "center",
                            lineHeight: 1.6,
                            opacity: fadeIn(introFrames + explainFrames + exampleFrames + 60),
                        }}
                    >
                        朝7時の動画に目標をコメント 🌅<br />
                        夜9時の動画に達成報告 🌙<br />
                        みんなで一緒に頑張ろう！💪
                    </div>

                    <div
                        style={{
                            marginTop: 80,
                            padding: "30px 60px",
                            background: "rgba(255,255,255,0.2)",
                            borderRadius: 60,
                            fontSize: 40,
                            color: "white",
                            fontWeight: 600,
                            opacity: fadeIn(introFrames + explainFrames + exampleFrames + 100),
                        }}
                    >
                        チャンネル登録よろしくね 🔔
                    </div>

                    <div
                        style={{
                            marginTop: 60,
                            fontSize: 32,
                            color: "rgba(255,255,255,0.8)",
                            opacity: fadeIn(introFrames + explainFrames + exampleFrames + 120),
                        }}
                    >
                        #今日の頑張り #毎日投稿
                    </div>
                </AbsoluteFill>
            )}
        </AbsoluteFill>
    );
};

export default PromotionalSummaryVideo;
