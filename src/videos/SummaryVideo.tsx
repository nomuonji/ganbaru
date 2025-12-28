import React from "react";
import {
    AbsoluteFill,
    Audio,
    Img,
    Sequence,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
    spring,
} from "remotion";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { UserCharacter } from "../components/UserCharacter";
import { CommentBubble } from "../components/CommentBubble";
import { selectChillBgm, EFFECT_SOUNDS } from "../utils/bgm";

export interface UserComment {
    username: string;
    userId: string;
    morningGoal?: string;
    nightAchievement?: string;
    avatarColor: string;
    avatarUrl?: string; // プロフィール画像URL（YouTube APIから取得）
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

    // タイミング設定
    const introFrames = fps * 4; // イントロ4秒
    const perUserFrames = fps * 6; // ユーザーあたり6秒
    const userSectionFrames = comments.length * perUserFrames; // 全ユーザー分
    const listViewFrames = fps * 5; // 一覧表示5秒
    const outroFrames = fps * 4; // エンディング4秒

    // 各セクションの開始フレーム
    const listViewStartFrame = introFrames + userSectionFrames;
    const outroStartFrame = listViewStartFrame + listViewFrames;

    // 現在どのセクションか判定
    const isIntro = frame < introFrames;
    const isListView = frame >= listViewStartFrame && frame < outroStartFrame;
    const isOutro = frame >= outroStartFrame;

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

    // 一覧ビューのアニメーション
    const listViewLocalFrame = frame - listViewStartFrame;
    const listViewOpacity = interpolate(
        listViewLocalFrame,
        [0, 20],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    // スクロール量（コメント数が多いときにスクロール）
    const rowHeight = 120; // 1行あたりの高さ
    const visibleRows = 6; // 画面に表示できる行数
    const totalRows = comments.length;
    const needsScroll = totalRows > visibleRows;

    const scrollOffset = needsScroll
        ? interpolate(
            listViewLocalFrame,
            [fps * 0.5, listViewFrames - fps * 0.5],
            [0, Math.max(0, (totalRows - visibleRows) * rowHeight)],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        )
        : 0;

    // アウトロのアニメーション
    const outroOpacity = interpolate(
        frame,
        [outroStartFrame, outroStartFrame + 30],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    // 背景のパーティクル
    const particles = [...Array(25)].map((_, i) => ({
        x: (i * 79 + frame * 0.3) % 1920,
        y: (i * 47 + frame * 0.2) % 1080,
        size: 4 + (i % 4) * 2,
        opacity: 0.08 + (i % 5) * 0.03,
    }));

    // 現在表示すべきユーザーのインデックス
    const getCurrentUserIndex = () => {
        if (isIntro || isListView || isOutro) return -1;
        const userFrame = frame - introFrames;
        return Math.floor(userFrame / perUserFrames);
    };

    const currentUserIndex = getCurrentUserIndex();
    const currentUser = comments[currentUserIndex];
    const localFrame = currentUserIndex >= 0
        ? (frame - introFrames) % perUserFrames
        : 0;

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

            {/* イントロセクション */}
            {isIntro && (
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
                            fontWeight: 500,
                        }}
                    >
                        {formattedDate}
                    </div>
                    <div
                        style={{
                            fontSize: 100,
                            fontWeight: 900,
                            color: "white",
                            textShadow: "0 6px 30px rgba(0, 0, 0, 0.3)",
                            transform: `scale(${introTitleScale})`,
                            textAlign: "center",
                        }}
                    >
                        みんなの今日の頑張り ✨
                    </div>
                    <div
                        style={{
                            fontSize: 52,
                            color: "rgba(255, 255, 255, 0.95)",
                            marginTop: 50,
                            fontWeight: 600,
                        }}
                    >
                        {comments.length}人が参加してくれました！
                    </div>

                    {/* 統計情報 */}
                    <div
                        style={{
                            display: "flex",
                            gap: 60,
                            marginTop: 60,
                        }}
                    >
                        <StatBadge
                            emoji="🎯"
                            label="目標を宣言"
                            count={comments.filter(c => c.morningGoal).length}
                        />
                        <StatBadge
                            emoji="✅"
                            label="達成を報告"
                            count={comments.filter(c => c.nightAchievement).length}
                        />
                        <StatBadge
                            emoji="🎊"
                            label="両方達成"
                            count={comments.filter(c => c.morningGoal && c.nightAchievement).length}
                        />
                    </div>
                </AbsoluteFill>
            )}

            {/* 各ユーザーのコメント表示 */}
            {currentUser && !isIntro && !isListView && !isOutro && (
                <UserCommentSection
                    comment={currentUser}
                    localFrame={localFrame}
                    fps={fps}
                    userIndex={currentUserIndex}
                    totalUsers={comments.length}
                />
            )}

            {/* くす玉エフェクト音（両方コメントしたユーザーのみ） */}
            {comments.map((comment, index) => {
                if (!comment.morningGoal || !comment.nightAchievement) return null;
                const userStartFrame = introFrames + index * perUserFrames;
                const effectFrame = userStartFrame + Math.floor(fps * 3.5); // successDelayのタイミング
                return (
                    <Sequence key={comment.userId} from={effectFrame} durationInFrames={30}>
                        <Audio src={EFFECT_SOUNDS.決定ボタン} volume={0.5} />
                    </Sequence>
                );
            })}

            {/* 一覧表示セクション */}
            {isListView && (
                <AbsoluteFill
                    style={{
                        opacity: listViewOpacity,
                        padding: "60px 80px",
                    }}
                >
                    {/* タイトル */}
                    <div
                        style={{
                            textAlign: "center",
                            marginBottom: 30,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 56,
                                fontWeight: 800,
                                color: "white",
                                textShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                            }}
                        >
                            📋 今日のみんなの頑張り一覧
                        </div>
                    </div>

                    {/* スクロールする一覧 */}
                    <div
                        style={{
                            flex: 1,
                            overflow: "hidden",
                            borderRadius: 20,
                            background: "rgba(255, 255, 255, 0.1)",
                            backdropFilter: "blur(10px)",
                        }}
                    >
                        <div
                            style={{
                                transform: `translateY(-${scrollOffset}px)`,
                                padding: "20px 30px",
                            }}
                        >
                            {comments.map((comment, index) => (
                                <div
                                    key={comment.userId}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "15px 20px",
                                        marginBottom: 10,
                                        background: comment.morningGoal && comment.nightAchievement
                                            ? "linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 107, 107, 0.2) 100%)"
                                            : "rgba(255, 255, 255, 0.1)",
                                        borderRadius: 15,
                                        border: comment.morningGoal && comment.nightAchievement
                                            ? "2px solid rgba(255, 215, 0, 0.4)"
                                            : "1px solid rgba(255, 255, 255, 0.2)",
                                    }}
                                >
                                    {/* アバター */}
                                    <ListAvatar
                                        avatarUrl={comment.avatarUrl}
                                        avatarColor={comment.avatarColor}
                                        username={comment.username}
                                    />

                                    {/* 名前 */}
                                    <div
                                        style={{
                                            width: 150,
                                            fontSize: 28,
                                            fontWeight: 700,
                                            color: "white",
                                        }}
                                    >
                                        {comment.username}
                                    </div>

                                    {/* 目標 */}
                                    <div
                                        style={{
                                            flex: 1,
                                            fontSize: 22,
                                            color: "rgba(255, 255, 255, 0.9)",
                                            padding: "0 20px",
                                            borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                                        }}
                                    >
                                        {comment.morningGoal ? (
                                            <span>🎯 {comment.morningGoal.slice(0, 30)}{comment.morningGoal.length > 30 ? "..." : ""}</span>
                                        ) : (
                                            <span style={{ opacity: 0.5 }}>−</span>
                                        )}
                                    </div>

                                    {/* 達成 */}
                                    <div
                                        style={{
                                            flex: 1,
                                            fontSize: 22,
                                            color: "rgba(255, 255, 255, 0.9)",
                                            paddingLeft: 20,
                                        }}
                                    >
                                        {comment.nightAchievement ? (
                                            <span>✅ {comment.nightAchievement.slice(0, 30)}{comment.nightAchievement.length > 30 ? "..." : ""}</span>
                                        ) : (
                                            <span style={{ opacity: 0.5 }}>−</span>
                                        )}
                                    </div>

                                    {/* バッジ */}
                                    {comment.morningGoal && comment.nightAchievement && (
                                        <div
                                            style={{
                                                marginLeft: 20,
                                                fontSize: 36,
                                            }}
                                        >
                                            🎊
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* スクロールインジケーター */}
                    {needsScroll && (
                        <div
                            style={{
                                position: "absolute",
                                bottom: 80,
                                right: 100,
                                fontSize: 28,
                                color: "rgba(255, 255, 255, 0.7)",
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            <span>↓</span>
                            <span>スクロール中...</span>
                        </div>
                    )}
                </AbsoluteFill>
            )}

            {/* エンディングセクション */}
            {isOutro && (
                <AbsoluteFill
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: outroOpacity,
                    }}
                >
                    <div
                        style={{
                            fontSize: 90,
                            fontWeight: 900,
                            color: "white",
                            textShadow: "0 6px 30px rgba(0, 0, 0, 0.3)",
                        }}
                    >
                        今日もみんなお疲れ様！🎉
                    </div>
                    <div
                        style={{
                            fontSize: 52,
                            color: "rgba(255, 255, 255, 0.95)",
                            marginTop: 50,
                            fontWeight: 600,
                        }}
                    >
                        明日も一緒に頑張ろう！
                    </div>
                    <div
                        style={{
                            marginTop: 80,
                            padding: "25px 50px",
                            background: "rgba(255, 255, 255, 0.2)",
                            borderRadius: 60,
                            fontSize: 36,
                            color: "white",
                            fontWeight: 500,
                        }}
                    >
                        #今日の頑張り #みんなの頑張り
                    </div>
                </AbsoluteFill>
            )}
        </AbsoluteFill>
    );
};

// 統計バッジコンポーネント
const StatBadge: React.FC<{ emoji: string; label: string; count: number }> = ({
    emoji,
    label,
    count,
}) => (
    <div
        style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px 40px",
            background: "rgba(255, 255, 255, 0.15)",
            borderRadius: 20,
            backdropFilter: "blur(10px)",
        }}
    >
        <span style={{ fontSize: 48 }}>{emoji}</span>
        <span style={{ fontSize: 56, fontWeight: 800, color: "white", marginTop: 10 }}>
            {count}
        </span>
        <span style={{ fontSize: 24, color: "rgba(255, 255, 255, 0.9)" }}>
            {label}
        </span>
    </div>
);

// ランダムな褒め言葉リスト
const PRAISE_MESSAGES = [
    "すごい！",
    "えらい！",
    "さすが！",
    "最高！",
    "完璧！",
    "天才！",
    "素晴らしい！",
    "やったね！",
    "お見事！",
    "グッジョブ！",
    "ナイス！",
    "神！",
    "がんばった！",
    "カッコいい！",
    "輝いてる！",
];

// ユーザーIDから一貫した褒め言葉を選択（同じユーザーには同じ褒め言葉）
const getPraiseMessage = (userId: string): string => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return PRAISE_MESSAGES[Math.abs(hash) % PRAISE_MESSAGES.length];
};

// 個別ユーザーのコメントセクション
interface UserCommentSectionProps {
    comment: UserComment;
    localFrame: number;
    fps: number;
    userIndex: number;
    totalUsers: number;
}

const UserCommentSection: React.FC<UserCommentSectionProps> = ({
    comment,
    localFrame,
    fps,
    userIndex,
    totalUsers,
}) => {
    // キャラクター登場アニメーション
    const characterX = spring({
        frame: localFrame,
        fps,
        from: -400,
        to: 0,
        config: { damping: 15, stiffness: 80 },
    });

    const characterScale = spring({
        frame: localFrame,
        fps,
        from: 0,
        to: 1,
        config: { damping: 12, stiffness: 100 },
    });

    // 吹き出しの登場
    const goalDelay = fps * 0.6;
    const achievementDelay = fps * 2;

    const goalOpacity = interpolate(
        localFrame,
        [goalDelay, goalDelay + fps * 0.4],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    const achievementOpacity = interpolate(
        localFrame,
        [achievementDelay, achievementDelay + fps * 0.4],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    // 成功エフェクト（両方コメントした場合）
    const hasBoth = comment.morningGoal && comment.nightAchievement;
    const successDelay = fps * 3.5;
    const successOpacity = hasBoth
        ? interpolate(
            localFrame,
            [successDelay, successDelay + fps * 0.3, successDelay + fps * 1.5],
            [0, 1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        )
        : 0;

    const successScale = hasBoth
        ? interpolate(
            localFrame,
            [successDelay, successDelay + fps * 0.3],
            [0.5, 1.2],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        )
        : 1;

    // 褒め言葉のアニメーション（くす玉の少し後に登場）
    const praiseDelay = successDelay + fps * 0.2;
    const praiseOpacity = hasBoth
        ? interpolate(
            localFrame,
            [praiseDelay, praiseDelay + fps * 0.3, successDelay + fps * 1.5],
            [0, 1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        )
        : 0;

    const praiseScale = hasBoth
        ? spring({
            frame: Math.max(0, localFrame - praiseDelay),
            fps,
            from: 0,
            to: 1,
            config: { damping: 8, stiffness: 150 },
        })
        : 0;

    // ユーザーごとの褒め言葉
    const praiseMessage = getPraiseMessage(comment.userId);

    return (
        <AbsoluteFill
            style={{
                display: "flex",
                alignItems: "center",
                padding: "60px 100px",
            }}
        >
            {/* 進捗インジケーター */}
            <div
                style={{
                    position: "absolute",
                    top: 40,
                    right: 60,
                    display: "flex",
                    alignItems: "center",
                    gap: 15,
                    fontSize: 28,
                    color: "rgba(255, 255, 255, 0.8)",
                }}
            >
                <span>{userIndex + 1}</span>
                <span>/</span>
                <span>{totalUsers}</span>
            </div>

            {/* キャラクター */}
            <div
                style={{
                    transform: `translateX(${characterX}px) scale(${characterScale})`,
                    flexShrink: 0,
                }}
            >
                <UserCharacter
                    username={comment.username}
                    avatarColor={comment.avatarColor}
                    avatarUrl={comment.avatarUrl}
                />
            </div>

            {/* コメント吹き出しエリア */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 30,
                    marginLeft: 80,
                    maxWidth: 1000,
                }}
            >
                {/* 目標の吹き出し */}
                {comment.morningGoal && (
                    <div style={{ opacity: goalOpacity, transform: `translateY(${(1 - goalOpacity) * 20}px)` }}>
                        <CommentBubble
                            type="goal"
                            content={comment.morningGoal}
                        />
                    </div>
                )}

                {/* 達成の吹き出し */}
                {comment.nightAchievement && (
                    <div style={{ opacity: achievementOpacity, transform: `translateY(${(1 - achievementOpacity) * 20}px)` }}>
                        <CommentBubble
                            type="achievement"
                            content={comment.nightAchievement}
                        />
                    </div>
                )}

                {/* 片方だけの場合のメッセージ */}
                {!comment.morningGoal && comment.nightAchievement && (
                    <div
                        style={{
                            opacity: goalOpacity,
                            fontSize: 28,
                            color: "rgba(255, 255, 255, 0.7)",
                            fontStyle: "italic",
                        }}
                    >
                        ※ 夜から参加！
                    </div>
                )}
                {comment.morningGoal && !comment.nightAchievement && (
                    <div
                        style={{
                            opacity: achievementOpacity,
                            fontSize: 28,
                            color: "rgba(255, 255, 255, 0.7)",
                            fontStyle: "italic",
                        }}
                    >
                        ※ 明日の報告を待ってるよ！
                    </div>
                )}
            </div>

            {/* 成功エフェクト - くす玉 */}
            {hasBoth && (
                <>
                    {/* 背景オーバーレイ */}
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.5) 0%, transparent 70%)",
                            opacity: successOpacity,
                            pointerEvents: "none",
                        }}
                    />

                    {/* くす玉と褒め言葉コンテナ */}
                    <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: `translate(-50%, -50%)`,
                            opacity: successOpacity,
                            pointerEvents: "none",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        {/* 背景パネル */}
                        <div
                            style={{
                                background: "linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 107, 107, 0.2) 100%)",
                                backdropFilter: "blur(20px)",
                                borderRadius: 30,
                                padding: "40px 80px",
                                border: "3px solid rgba(255, 255, 255, 0.3)",
                                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                transform: `scale(${praiseScale})`,
                            }}
                        >
                            {/* くす玉 */}
                            <div style={{ fontSize: 120 }}>
                                🎊
                            </div>

                            {/* 褒め言葉 */}
                            <div
                                style={{
                                    fontSize: 80,
                                    fontWeight: 900,
                                    color: "#FFD700",
                                    textShadow: `
                                        0 0 30px rgba(255, 215, 0, 0.9),
                                        0 0 60px rgba(255, 215, 0, 0.5),
                                        0 4px 8px rgba(0, 0, 0, 0.5)
                                    `,
                                    letterSpacing: 8,
                                    marginTop: 10,
                                }}
                            >
                                {praiseMessage}
                            </div>

                            {/* サブテキスト */}
                            <div
                                style={{
                                    marginTop: 20,
                                    fontSize: 32,
                                    color: "white",
                                    textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                                    fontWeight: 600,
                                }}
                            >
                                1日通して参加ありがとう！✨
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AbsoluteFill>
    );
};

// 一覧表示用のアバターコンポーネント
interface ListAvatarProps {
    avatarUrl?: string;
    avatarColor: string;
    username: string;
}

const ListAvatar: React.FC<ListAvatarProps> = ({
    avatarUrl,
    avatarColor,
    username,
}) => {
    const hasAvatar = avatarUrl && avatarUrl.length > 0;

    if (hasAvatar) {
        // プロフィール画像を使用
        return (
            <div
                style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    overflow: "hidden",
                    marginRight: 20,
                    border: "3px solid white",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                    flexShrink: 0,
                }}
            >
                <Img
                    src={avatarUrl}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                />
            </div>
        );
    }

    // キャラクター風アイコン（プロフィール画像がない場合）
    return (
        <div
            style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${avatarColor} 0%, ${adjustColorForList(avatarColor, -30)} 100%)`,
                marginRight: 20,
                position: "relative",
                border: "3px solid white",
                boxShadow: `0 4px 15px ${avatarColor}66`,
                flexShrink: 0,
            }}
        >
            {/* 目（左） */}
            <div
                style={{
                    position: "absolute",
                    top: "38%",
                    left: "22%",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#333",
                }}
            />
            {/* 目（右） */}
            <div
                style={{
                    position: "absolute",
                    top: "38%",
                    right: "22%",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#333",
                }}
            />
            {/* 目のハイライト（左） */}
            <div
                style={{
                    position: "absolute",
                    top: "36%",
                    left: "24%",
                    width: 3,
                    height: 3,
                    borderRadius: "50%",
                    background: "white",
                }}
            />
            {/* 目のハイライト（右） */}
            <div
                style={{
                    position: "absolute",
                    top: "36%",
                    right: "24%",
                    width: 3,
                    height: 3,
                    borderRadius: "50%",
                    background: "white",
                }}
            />
            {/* ほっぺ（左） */}
            <div
                style={{
                    position: "absolute",
                    top: "55%",
                    left: "8%",
                    width: 10,
                    height: 6,
                    borderRadius: "50%",
                    background: "#FF6B6B",
                    opacity: 0.6,
                }}
            />
            {/* ほっぺ（右） */}
            <div
                style={{
                    position: "absolute",
                    top: "55%",
                    right: "8%",
                    width: 10,
                    height: 6,
                    borderRadius: "50%",
                    background: "#FF6B6B",
                    opacity: 0.6,
                }}
            />
            {/* 口（笑顔） */}
            <div
                style={{
                    position: "absolute",
                    top: "62%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 14,
                    height: 7,
                    borderRadius: "0 0 14px 14px",
                    background: "#FF6B6B",
                    border: "1.5px solid #333",
                    borderTop: "none",
                }}
            />
        </div>
    );
};

// 色を明るくしたり暗くしたりするヘルパー関数
function adjustColorForList(hex: string, amount: number): string {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export default SummaryVideo;
