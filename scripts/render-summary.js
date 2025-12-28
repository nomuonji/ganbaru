import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { getJSTDate } from "./utils/date.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
    const today = getJSTDate();
    console.log(`日付 (JST): ${today}`);

    const outputDir = process.env.OUTPUT_DIR || "./output";
    const commentsPath = path.join(outputDir, `comments_${today}.json`);
    const outputPath = path.join(outputDir, `summary_${today}.mp4`);

    // コメントデータを読み込み
    if (!fs.existsSync(commentsPath)) {
        console.error(`コメントファイルが見つかりません: ${commentsPath}`);
        console.error("先に fetch-comments.js を実行してください");
        process.exit(1);
    }

    const commentsData = JSON.parse(fs.readFileSync(commentsPath, "utf-8"));
    const comments = commentsData.comments;

    if (comments.length === 0) {
        console.log("コメントがないため、まとめ動画は作成しません");
        process.exit(0);
    }

    console.log(`${comments.length}人のコメントを含むまとめ動画を作成します`);

    console.log("Remotionバンドルを作成中...");
    const bundleLocation = await bundle({
        entryPoint: path.resolve(__dirname, "../src/index.ts"),
        webpackOverride: (config) => config,
    });

    console.log("コンポジションを選択中...");
    const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: "SummaryVideo",
        inputProps: {
            date: today,
            comments,
        },
    });

    console.log(`まとめ動画をレンダリング中... (${composition.width}x${composition.height}, ${composition.durationInFrames}フレーム)`);
    await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: "h264",
        outputLocation: outputPath,
        inputProps: {
            date: today,
            comments,
        },
        chromiumOptions: {
            gl: "swangle",
        },
    });

    console.log(`まとめ動画を保存しました: ${outputPath}`);
    console.log(`統計: ${commentsData.stats.bothCommented}人が両方コメント、${commentsData.stats.morningOnly}人が朝のみ、${commentsData.stats.nightOnly}人が夜のみ`);
}

main().catch(console.error);
