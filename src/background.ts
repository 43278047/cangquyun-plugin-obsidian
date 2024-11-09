import * as fs from 'fs';
import * as path from 'path';
import {Notice, Vault} from 'obsidian';
import {getBookmarkContentList} from './api';
import FileNameUtils from "./utils";
import {renderTemplate} from "./template";

const pageSize = 50;
// 同步函数
async function syncBookmarkData(app: any, defaultDirectory: string, apiKey: string): Promise<void> {
    let pageNum = 1;
    let count = 0;
    try {
        // 无限循环的翻页至到 response.data = []
        while (true) {
            const response = await getBookmarkContentList(apiKey, pageNum, pageSize);
            console.log("response=",JSON.stringify(response))
            if (response.code == 200) {
                if (response.data.length === 0) {
                    new Notice(`同步结束，成功同步`+count+`条数据`);
                    return ;
                }
                count += response.data.length;
                await bookmarkListWriteFile(app, defaultDirectory, response.data);

            } else {
                new Notice(`同步失败：`+response.msg);
                return ;
            }
            pageNum++;
        }

    } catch (error) {
        new Notice('同步失败：系统异常请稍后再试');
        console.error('Error fetching bookmark content:', error);
    }
}


async function bookmarkListWriteFile(app: any, defaultDirectory: string, BookmarkContentList: any[]): Promise<string> {
    const vault = app.vault;
    const basePath = path.join(vault.adapter.basePath, defaultDirectory);

    for (const bookmarkContent of BookmarkContentList) {
        if (BookmarkContentList.length === 0) {
            continue;
        }
        const [year, month, day] = bookmarkContent.create_time.substring(0, 10).split('-');
        // 创建目录
        const directoryPath = path.join(basePath, `${year}-${month}-${day}`);
        await createDirectory(directoryPath);

        // 创建文件
        const cleanedFileName = FileNameUtils.cleanFileName(bookmarkContent.title) + '.md';
        const filePath = path.join(directoryPath, cleanedFileName);
        // 模板
        const markdownContent = renderTemplate(bookmarkContent);
        if (!markdownContent){
            continue;
        }
        await createFile(filePath, markdownContent);
    }
    return 'Files created successfully'; // 返回一个字符串表示操作成功
}

// 创建目录
async function createDirectory(directoryPath: string): Promise<void> {
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, {recursive: true});
    }
}

// 创建文件并写入内容
async function createFile(filePath: string, content: string): Promise<void> {
    // 如果文件存在，先删除它
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
    // 创建新的文件并写入内容
    fs.writeFileSync(filePath, content);
}

export {syncBookmarkData};
