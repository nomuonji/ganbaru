import { Config } from "@remotion/cli/config";

// Windows ARM対応: SwAngleレンダラーを使用
Config.setChromiumOpenGlRenderer("swangle");

// Edge を使用 (Windows ARM向け)
Config.setBrowserExecutable("C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe");
