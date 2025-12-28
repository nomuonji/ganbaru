// 共通ユーティリティ：日本時間の日付を取得

/**
 * 日本時間での今日の日付をYYYY-MM-DD形式で取得
 */
export function getJSTDate() {
    const now = new Date();
    // 日本時間 (UTC+9) に変換
    const jstOffset = 9 * 60; // 分
    const utcOffset = now.getTimezoneOffset(); // 分（UTCからのオフセット、符号反転）
    const jstTime = new Date(now.getTime() + (utcOffset + jstOffset) * 60 * 1000);

    const year = jstTime.getFullYear();
    const month = String(jstTime.getMonth() + 1).padStart(2, "0");
    const day = String(jstTime.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

/**
 * 日本時間での現在時刻をISO形式で取得
 */
export function getJSTISOString() {
    const now = new Date();
    const jstOffset = 9 * 60;
    const utcOffset = now.getTimezoneOffset();
    const jstTime = new Date(now.getTime() + (utcOffset + jstOffset) * 60 * 1000);

    return jstTime.toISOString().replace("Z", "+09:00");
}
