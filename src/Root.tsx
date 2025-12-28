import { Composition } from "remotion";
import { MorningVideo } from "./videos/MorningVideo";
import { NightVideo } from "./videos/NightVideo";
import { SummaryVideo } from "./videos/SummaryVideo";

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
    durationInFrames: 30 * 60, // 60秒（動的に調整可能）
};

export const RemotionRoot: React.FC = () => {
    return (
        <>
            {/* 朝の動画 - 今日の目標を募る */}
            <Composition
                id="MorningVideo"
                component={MorningVideo}
                {...SHORT_VIDEO_CONFIG}
                defaultProps={{
                    date: new Date().toISOString().split("T")[0],
                }}
            />

            {/* 夜の動画 - 今日できたことを募る */}
            <Composition
                id="NightVideo"
                component={NightVideo}
                {...SHORT_VIDEO_CONFIG}
                defaultProps={{
                    date: new Date().toISOString().split("T")[0],
                }}
            />

            {/* まとめ動画 - ユーザーのコメントをアニメーション表示 */}
            <Composition
                id="SummaryVideo"
                component={SummaryVideo}
                {...SUMMARY_VIDEO_CONFIG}
                defaultProps={{
                    date: new Date().toISOString().split("T")[0],
                    comments: [],
                }}
                calculateMetadata={async ({ props }) => {
                    // コメント数に応じて動画の長さを調整
                    const commentsCount = props.comments?.length || 0;
                    const baseDuration = 30 * 10; // 最低10秒
                    const perCommentDuration = 30 * 5; // コメントあたり5秒
                    const durationInFrames = Math.max(
                        baseDuration,
                        baseDuration + commentsCount * perCommentDuration
                    );
                    return { durationInFrames };
                }}
            />
        </>
    );
};

export default RemotionRoot;
