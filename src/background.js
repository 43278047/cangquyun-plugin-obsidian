// background.js
const fs = require('fs');
const path = require('path');
const { Notice } = require('obsidian');

// Mock 数据
const mockData = [
    {
        title: '标题 文章1',
        content: '# 文章1\n\n这是文章1的内容。888888888',
        date: '2023-10-01'
    },
    {
        title: '标题 文章2',
        content: '# 文章2\n\n这是文章2的内容。',
        date: '2023-10-02'
    },
    {
        title: '标题 文章3',
        content: '# 文章3\n\n这是文章3的内容。',
        date: '2023-10-03'
    }
];

// 同步函数
async function syncBookmarkData(app, defaultDirectory) {
    const vault = app.vault;
    const basePath = path.join(vault.adapter.basePath, defaultDirectory);

    for (const article of mockData) {
        const { title, content, date } = article;
        const [year, month, day] = date.split('-');

        // 创建目录
        const directoryPath = path.join(basePath, `${year}-${month}-${day}`);
        await createDirectory(directoryPath);

        // 创建文件
        const filePath = path.join(directoryPath, `${title}.md`);
        await createFile(filePath, content);
    }
    new Notice(`同步结束`);
}

// 创建目录
async function createDirectory(directoryPath) {
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
    }
}

// 创建文件并写入内容
async function createFile(filePath, content) {
    // 如果文件存在，先删除它
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
    // 创建新的文件并写入内容
    fs.writeFileSync(filePath, content);
}

module.exports = {
    syncBookmarkData
};
