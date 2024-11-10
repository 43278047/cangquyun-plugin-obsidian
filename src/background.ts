import * as path from 'path';
import {Notice, Vault} from 'obsidian';
import {getBookmarkContentList} from './api';
import FileNameUtils from "./utils";
import {renderTemplate} from "./template";
import MyPlugin from "./index";

const pageSize = 50;

// 同步函数
async function syncBookmarkData(app: any, plugin: MyPlugin): Promise<void> {

    new Notice('🚀 藏趣云 开始同步');
    let pageNum = 1;
    let count = 0;
    let startTime = null;
    let syncTime: string = '';
    let newSyncTime = getCurrentBeijingTime();
    let template = '';
    let apiKey = '';
    let defaultDirectory = '';
    try {
        let settings = plugin.settings;
        syncTime = settings.syncTime;
        template = settings.template;
        apiKey = settings.apiKey;
        defaultDirectory = settings.defaultDirectory;
        if (!defaultDirectory) {
            defaultDirectory = 'cangquyun';
        }
        console.log('defaultDirectory =', defaultDirectory)
        startTime = dateTimeStringToTimestamp(syncTime);
    } catch (error) {
        new Notice('同步失败：时间格式错误，请检查时间格式是否为yyyy-MM-dd HH:mm:ss');
        return;
    }

    try {
        // 无限循环的翻页至到 response.data = []
        while (true) {
            const response = await getBookmarkContentList(apiKey, pageNum, pageSize);
            if (response.code == 200) {
                if (response.data.length === 0) {
                    await updateSyncTime(plugin, newSyncTime);
                    new Notice('🎉 藏趣云 已完成同步!');
                    return;
                }
                count += response.data.length;
                await bookmarkListWriteFile(app, defaultDirectory, response.data, template);

            } else {
                new Notice(`同步失败：` + response.msg);
                return;
            }
            pageNum++;
        }
    } catch (error) {
        new Notice('同步中断：系统异常请稍后再试');
        console.error('Error fetching bookmark content:', error);
        return;
    }


}
async function updateSyncTime(plugin: MyPlugin, newSyncTime: string){
    let settings = await plugin.getSettings();
    // 设置为当前北京时间
    settings.syncTime = newSyncTime;
    await plugin.updateSettings(settings);
}

async function bookmarkListWriteFile(app: any, defaultDirectory: string, BookmarkContentList: any[], template: string): Promise<string> {
    const vault = app.vault;

    for (const bookmarkContent of BookmarkContentList) {
        if (BookmarkContentList.length === 0) {
            continue;
        }
        const [year, month, day] = bookmarkContent.createTime.substring(0, 10).split('-');
        // 创建目录
        const directoryPath = path.join(defaultDirectory, `${year}-${month}-${day}`);
        await createDirectory(vault, directoryPath);

        // 创建文件
        const cleanedFileName = FileNameUtils.cleanFileName(bookmarkContent.title) + '.md';
        const filePath = path.join(directoryPath, cleanedFileName);
        // 模板
        const markdownContent = renderTemplate(template, bookmarkContent);
        if (!markdownContent) {
            continue;
        }
        await createFile(vault, filePath, markdownContent);
    }
    return 'success'; // 返回一个字符串表示操作成功
}

// 创建目录
async function createDirectory(vault: Vault, directoryPath: string): Promise<void> {
    if (!await vault.adapter.exists(directoryPath)) {
        await vault.createFolder(directoryPath);
    }
}

// 创建文件并写入内容
async function createFile(vault: Vault, filePath: string, content: string): Promise<void> {
    // 如果文件存在，先获取文件对象并删除它
    if (await vault.adapter.exists(filePath)) {
        const file = vault.getAbstractFileByPath(filePath);
        if (file) {
            await vault.delete(file);
        }
    }
    // 创建新的文件并写入内容
    await vault.create(filePath, content);
}

function getCurrentBeijingTime() {
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

function dateTimeStringToTimestamp(dateTimeString: string) {
    // 使用 Date.parse 解析时间字符串
    const timestamp = Date.parse(dateTimeString);

    // 如果解析失败，返回 NaN
    if (isNaN(timestamp)) {
        throw new Error('Invalid date time string format');
    }

    return timestamp;
}


export {syncBookmarkData};
