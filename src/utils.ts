class FileNameUtils {
    // 定义需要替换的特殊字符
    private static readonly INVALID_CHARS = /[<>:"/\\|?*\x00-\x1F]/g;
    private static readonly REPLACEMENT_CHAR = '_';

    // 清理文件名中的特殊字符
    public static cleanFileName(fileName: string): string {
        return fileName.replace(FileNameUtils.INVALID_CHARS, FileNameUtils.REPLACEMENT_CHAR);
    }
}

export default FileNameUtils;
