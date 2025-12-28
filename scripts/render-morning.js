import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { getJSTDate } from "./utils/date.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
    const today = getJSTDate();
    console.log(`日付 (JST): ${today}`);

    const outputDir = process.env.OUTPUT_DIR || "./output";
    const outputPath = path.join(outputDir, `morning_${today}.mp4`);

    console.log("Remotionバンドルを作成中...");
    const bundleLocation = await bundle({
        entryPoint: path.resolve(__dirname, "../src/index.ts"),
        webpackOverride: (config) => config,
    });

    console.log("コンポジションを選択中...");
    const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: "MorningVideo",
        inputProps: {
            date: today,
        },
    });

    console.log(`朝の動画をレンダリング中... (${composition.width}x${composition.height})`);
    await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: "h264",
        outputLocation: outputPath,
        inputProps: {
            date: today,
        },
        chromiumOptions: {
            gl: "swangle",
        },
    });

    console.log(`朝の動画を保存しました: ${outputPath}`);
}

main().catch(console.error);
