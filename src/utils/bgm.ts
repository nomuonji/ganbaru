// BGMファイルの定義
export const POP_BGM_FILES = [
    "SUMMER_TRIANGLE.mp3",
    "さみしいおばけと東京の月.mp3",
    "サンタは中央線でやってくる.mp3",
    "ステラと塔の物語.mp3",
    "ヒダマリトロニカ.mp3",
];

export const CHILL_BGM_FILES = [
    "カエルの勇者.mp3",
    "ローファイ少女は今日も寝不足.mp3",
    "宇宙飛行士が最後に見たもの.mp3",
    "神隠しの真相.mp3",
    "週末京都現実逃避.mp3",
];

// シード値から決定論的なランダムインデックスを取得
// (日付などをシードにして、同じシードなら同じBGMが選ばれる)
export const getSeededRandomIndex = (seed: string, arrayLength: number): number => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // 32bit整数に変換
    }
    return Math.abs(hash) % arrayLength;
};

// 朝用BGMのパスを取得（popフォルダからランダム）
export const getMorningBgmPath = (seed: string): string => {
    const index = getSeededRandomIndex(seed, POP_BGM_FILES.length);
    return `sounds/bgm/pop/${POP_BGM_FILES[index]}`;
};

// 夜用BGMのパスを取得（chillフォルダからランダム）
export const getNightBgmPath = (seed: string): string => {
    const index = getSeededRandomIndex(seed, CHILL_BGM_FILES.length);
    return `sounds/bgm/chill/${CHILL_BGM_FILES[index]}`;
};

// 静的インポート用のBGM定義
export const POP_BGM = {
    SUMMER_TRIANGLE: require("../../sounds/bgm/pop/SUMMER_TRIANGLE.mp3"),
    さみしいおばけと東京の月: require("../../sounds/bgm/pop/さみしいおばけと東京の月.mp3"),
    サンタは中央線でやってくる: require("../../sounds/bgm/pop/サンタは中央線でやってくる.mp3"),
    ステラと塔の物語: require("../../sounds/bgm/pop/ステラと塔の物語.mp3"),
    ヒダマリトロニカ: require("../../sounds/bgm/pop/ヒダマリトロニカ.mp3"),
};

export const CHILL_BGM = {
    カエルの勇者: require("../../sounds/bgm/chill/カエルの勇者.mp3"),
    ローファイ少女は今日も寝不足: require("../../sounds/bgm/chill/ローファイ少女は今日も寝不足.mp3"),
    宇宙飛行士が最後に見たもの: require("../../sounds/bgm/chill/宇宙飛行士が最後に見たもの.mp3"),
    神隠しの真相: require("../../sounds/bgm/chill/神隠しの真相.mp3"),
    週末京都現実逃避: require("../../sounds/bgm/chill/週末京都現実逃避.mp3"),
};

// BGMリストを配列として取得
export const getPopBgmList = (): string[] => Object.values(POP_BGM);
export const getChillBgmList = (): string[] => Object.values(CHILL_BGM);

// シードからBGMを選択
export const selectPopBgm = (seed: string): string => {
    const list = getPopBgmList();
    const index = getSeededRandomIndex(seed, list.length);
    return list[index];
};

export const selectChillBgm = (seed: string): string => {
    const list = getChillBgmList();
    const index = getSeededRandomIndex(seed, list.length);
    return list[index];
};

// エフェクト音
export const EFFECT_SOUNDS = {
    決定ボタン: require("../../sounds/effect/決定ボタンを押す42.mp3"),
};

