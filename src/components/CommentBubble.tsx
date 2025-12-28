import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

interface CommentBubbleProps {
    type: "goal" | "achievement";
    content: string;
}

export const CommentBubble: React.FC<CommentBubbleProps> = ({ type, content }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // 吹き出しの登場アニメーション
    const scale = spring({
        frame,
        fps,
        from: 0,
        to: 1,
        config: { damping: 12, stiffness: 100 },
    });

    const isGoal = type === "goal";

    return (
        <div
            style={{
                transform: `scale(${scale})`,
                transformOrigin: "left center",
            }}
        >
            {/* ラベル */}
            <div
                style={{
                    display: "inline-block",
                    padding: "8px 20px",
                    background: isGoal
                        ? "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)"
                        : "linear-gradient(135deg, #4ECDC4 0%, #44CF6C 100%)",
                    borderRadius: "20px 20px 0 0",
                    fontSize: 24,
                    fontWeight: 700,
                    color: "white",
                    marginBottom: -2,
                }}
            >
                {isGoal ? "🎯 今日の目標" : "✅ できたこと"}
            </div>

            {/* 吹き出し本体 */}
            <div
                style={{
                    position: "relative",
                    background: "white",
                    borderRadius: "0 30px 30px 30px",
                    padding: "30px 40px",
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
                    maxWidth: 800,
                }}
            >
                {/* 吹き出しの尻尾 */}
                <div
                    style={{
                        position: "absolute",
                        left: -20,
                        top: 30,
                        width: 0,
                        height: 0,
                        borderTop: "15px solid transparent",
                        borderBottom: "15px solid transparent",
                        borderRight: "25px solid white",
                    }}
                />

                {/* コンテンツ */}
                <div
                    style={{
                        fontSize: 36,
                        fontWeight: 500,
                        color: "#333",
                        lineHeight: 1.5,
                    }}
                >
                    {content}
                </div>

                {/* 装飾アイコン */}
                <div
                    style={{
                        position: "absolute",
                        bottom: -15,
                        right: 30,
                        fontSize: 40,
                    }}
                >
                    {isGoal ? "💪" : "🌟"}
                </div>
            </div>
        </div>
    );
};

export default CommentBubble;
