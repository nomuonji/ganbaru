import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

interface UserCharacterProps {
    username: string;
    avatarColor: string;
}

export const UserCharacter: React.FC<UserCharacterProps> = ({
    username,
    avatarColor,
}) => {
    const frame = useCurrentFrame();

    // アイドルアニメーション（ふわふわ浮遊）
    const floatY = Math.sin(frame * 0.1) * 5;

    // 瞬きアニメーション
    const blinkPhase = frame % 120;
    const eyeScaleY = blinkPhase > 115 ? 0.1 : 1;

    // ほっぺのアニメーション
    const cheekOpacity = interpolate(
        Math.sin(frame * 0.05),
        [-1, 1],
        [0.4, 0.7]
    );

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transform: `translateY(${floatY}px)`,
            }}
        >
            {/* キャラクター本体 */}
            <div
                style={{
                    width: 200,
                    height: 200,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${avatarColor} 0%, ${adjustColor(avatarColor, -30)} 100%)`,
                    position: "relative",
                    boxShadow: `0 10px 40px ${avatarColor}66`,
                    border: "6px solid white",
                }}
            >
                {/* 目 */}
                <div
                    style={{
                        position: "absolute",
                        top: "40%",
                        left: "25%",
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "#333",
                        transform: `scaleY(${eyeScaleY})`,
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        top: "40%",
                        right: "25%",
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "#333",
                        transform: `scaleY(${eyeScaleY})`,
                    }}
                />

                {/* 目のハイライト */}
                <div
                    style={{
                        position: "absolute",
                        top: "38%",
                        left: "28%",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "white",
                        opacity: eyeScaleY,
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        top: "38%",
                        right: "28%",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "white",
                        opacity: eyeScaleY,
                    }}
                />

                {/* ほっぺ */}
                <div
                    style={{
                        position: "absolute",
                        top: "55%",
                        left: "10%",
                        width: 30,
                        height: 20,
                        borderRadius: "50%",
                        background: "#FF6B6B",
                        opacity: cheekOpacity,
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        top: "55%",
                        right: "10%",
                        width: 30,
                        height: 20,
                        borderRadius: "50%",
                        background: "#FF6B6B",
                        opacity: cheekOpacity,
                    }}
                />

                {/* 口（笑顔） */}
                <div
                    style={{
                        position: "absolute",
                        top: "65%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 40,
                        height: 20,
                        borderRadius: "0 0 40px 40px",
                        background: "#FF6B6B",
                        border: "3px solid #333",
                        borderTop: "none",
                    }}
                />
            </div>

            {/* ユーザー名 */}
            <div
                style={{
                    marginTop: 20,
                    padding: "10px 30px",
                    background: "rgba(255, 255, 255, 0.95)",
                    borderRadius: 50,
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#333",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                }}
            >
                {username}
            </div>
        </div>
    );
};

// 色を明るくしたり暗くしたりするヘルパー関数
function adjustColor(hex: string, amount: number): string {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export default UserCharacter;
