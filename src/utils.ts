export default class Utils {
    // 定义需要替换的特殊字符
    private static readonly INVALID_CHARS = /[<>:"/\\|?*\x00-\x1F]/g;
    private static readonly REPLACEMENT_CHAR = '_';

    // 清理文件名中的特殊字符
    public static cleanFileName(fileName: string): string {
        return fileName.replace(this.INVALID_CHARS, this.REPLACEMENT_CHAR);
    }
    public static getCurrentBeijingTime():string {
        // 获取当前时间
        const now = new Date();

        // 设置时区为北京时间（东八区）
        const beijingTime = new Date(now.toLocaleString('en-US', {timeZone: 'Asia/Shanghai'}));

        // 格式化日期和时间
        const year = beijingTime.getFullYear();
        const month = String(beijingTime.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1
        const day = String(beijingTime.getDate()).padStart(2, '0');
        const hours = String(beijingTime.getHours()).padStart(2, '0');
        const minutes = String(beijingTime.getMinutes()).padStart(2, '0');
        const seconds = String(beijingTime.getSeconds()).padStart(2, '0');

        // 返回格式化后的时间字符串
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    public static dateTimeStringToTimestamp(dateTimeString: string):string{
        // 使用 Date.parse 解析时间字符串
        const timestamp = Date.parse(dateTimeString);

        // 如果解析失败，返回 NaN
        if (isNaN(timestamp)) {
            throw new Error('Invalid date time string format');
        }

        return timestamp.toString();
    }
}
