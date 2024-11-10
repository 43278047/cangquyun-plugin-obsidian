import { Plugin, Setting, App, Notice, PluginSettingTab } from 'obsidian';
import { syncBookmarkData } from './background.js';

const DEFAULT_SETTINGS: MyPluginSettings = {
    apiKey: '',
    syncOnOpen: false,
    syncFrequency: '0',
    defaultDirectory: 'cangquyun',
    syncTime: '2024-10-01 00:00:00',
    template: `---
标题: {{ title }}
URL: {{ url }}
创建时间: {{ createTime }}
更新时间: {{ updateTime }}
---
{% if highlightList.length > 0 %}
## 划线列表
{% for item in highlightList %}
>{{ item.annotationContent }}^{{ item.highlightId }}
{% if item.noteContent %}

{{ item.noteContent }}
{% endif %}
{% endfor %}
{% endif %}

{% if markdownContent %}
## 全文剪藏
{{ markdownContent }}
{% endif %}
`,
}

export default class MyPlugin extends Plugin {
    settings!: MyPluginSettings;
    private syncIntervalId: number | null = null;
    private syncInProgress: boolean = false;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new MySettingTab(this.app, this));

        if (this.settings.syncOnOpen) {
            this.syncData();
        }

        this.addRibbonIcon('sync', '同步藏趣云数据', () => {
            this.syncData();
        });

        (global as any).myPluginInstance = this;

        // 启动定时任务
        this.startSyncInterval();
    }

    onunload() {
        this.stopSyncInterval();
    }

    private startSyncInterval() {
        this.stopSyncInterval(); // 确保之前的定时任务被清除

        const syncFrequency = parseInt(this.settings.syncFrequency, 10);
        if (syncFrequency > 0) {
            this.syncIntervalId = window.setInterval(() => {
                this.syncData();
            }, syncFrequency * 60 * 1000); // 将分钟转换为毫秒
        }
    }

    private stopSyncInterval() {
        if (this.syncIntervalId !== null) {
            clearInterval(this.syncIntervalId);
            this.syncIntervalId = null;
        }
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async getSettings() {
        return this.settings;
    }

    async updateSettings(settings: MyPluginSettings) {
        this.settings = settings;
        await this.saveSettings();
    }
    async updateSyncFrequency(syncFrequency: string) {
        const newSyncFrequency = syncFrequency;
        const oldSyncFrequency = this.settings.syncFrequency;
        this.settings.syncFrequency = newSyncFrequency;
        await this.saveSettings();

        // 只有在 syncFrequency 发生变化时才重新启动定时任务
        if (oldSyncFrequency !== newSyncFrequency) {
            this.startSyncInterval();
        }
    }

    async syncData() {
        if (this.syncInProgress) {
            new Notice('藏趣云同步任务正在进行中，请稍后再试!');
            return;
        }

        this.syncInProgress = true;

        try {
            const apiKey = this.settings.apiKey;
            if (!apiKey) {
                new Notice('API KEY 未设置');
                return;
            }

            await syncBookmarkData(this.app,this);
        } finally {
            this.syncInProgress = false;
        }
    }
}

class MySettingTab extends PluginSettingTab {
    plugin: MyPlugin;

    constructor(app: App, plugin: MyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        this.displayHeader(containerEl)

        // 同步配置
        this.displaySyncUserSettings(containerEl);

        this.displaySyncSettings(containerEl);

        // 规则配置
        this.displayRuleSettings(containerEl);

        // 其他设置
        this.displayFooter(containerEl)
    }

    displaySyncUserSettings(containerEl: HTMLElement): void {
        let name = new Setting(containerEl)
            .setName('API KEY');
        const descText = document.createElement('span');
        descText.innerText = '请在PC端藏趣云网页的设置中，生成API KEY 填到此处，';
        const link = document.createElement('a');
        link.href = 'https://www.cangquyun.com/openApi?sqType=USER&libraryId=0';
        link.target = '_blank';
        link.innerText = '生成API KEY';
        descText.appendChild(link);
        name.descEl.appendChild(descText);

        name.addText(text => text
                .setPlaceholder('API KEY')
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    await this.plugin.saveSettings();
                }))
    }
    displaySyncSettings(containerEl: HTMLElement): void {
        containerEl.createEl('h2', { text: '同步配置' });


        new Setting(containerEl)
            .setName('打开客户端是否同步')
            .setDesc('打开客户端就触发文章同步任务')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.syncOnOpen)
                .onChange(async (value) => {
                    this.plugin.settings.syncOnOpen = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('手动同步')
            .setDesc('手动触发同步一次，同步范围是上次同步时间之后的所有数据，如果你需要同步全量的数据，把上次同步时间置空即可')
            .addButton(button => button
                .setButtonText('同步一次')
                .onClick(() => {
                    this.plugin.syncData();
                }));

        new Setting(containerEl)
            .setName('上次同步时间')
            .setDesc('每次同步，只会同步此时间之后的文章数据，如果为空则会同步全量的数据')
            .addText(text => text
                .setPlaceholder('')
                .setValue(this.plugin.settings.syncTime)
                .onChange(async (value) => {
                    this.plugin.settings.syncTime = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('定时同步')
            .setDesc('设置同步频率，在客户端打开的时候，定时去同步文章数据')
            .addDropdown(dropdown => dropdown
                .addOption('0', '关闭')
                .addOption('1', '1分钟')
                .addOption('5', '5分钟')
                .addOption('15', '15分钟')
                .addOption('30', '30分钟')
                .setValue(this.plugin.settings.syncFrequency)
                .onChange(async (value) => {
                    await this.plugin.updateSyncFrequency(value);
                }));
    }

    displayRuleSettings(containerEl: HTMLElement): void {
        containerEl.createEl('h2', { text: '规则配置' });
        new Setting(containerEl)
            .setName('同步文章根目录')
            .setDesc('同步文章的根目录，所有的数据都会存在这个目录下面')
            .addText(text => text
                .setPlaceholder('默认目录cangquyun')
                .setValue(this.plugin.settings.defaultDirectory)
                .onChange(async (value) => {
                    this.plugin.settings.defaultDirectory = value;
                    await this.plugin.saveSettings();
                }));


        const setting = new Setting(containerEl)
            .setName('文章模板');
        const descText = document.createElement('span');
        descText.innerText = '如果要使用自定义文章模板，可以根据教程自己配置 ';
        const link = document.createElement('a');
        link.href = 'https://doc.cangquyun.com';
        link.target = '_blank';
        link.innerText = '查看模板配置教程';
        descText.appendChild(link);
        setting.descEl.appendChild(descText);
        setting.addTextArea(text => text
            .setPlaceholder('')
            .setValue(this.plugin.settings.template)
            .onChange(async (value) => {
                this.plugin.settings.template = value;
                await this.plugin.saveSettings();
            })
            .then((textArea) => {
                // 设置高度和宽度
                textArea.inputEl.style.height = '200px';
                textArea.inputEl.style.width = '400px';
            }));

    }
    displayFooter(containerEl: HTMLElement): void {
        const footerEl = containerEl.createEl('p');
        footerEl.innerHTML = '意见反馈邮箱:43278047@qq.com   <a href="https://doc.cangquyun.com" target="_blank">更新日志</a> <a href="https://www.cangquyun.com" target="_blank">藏趣云官网</a>';
    }

    displayHeader(containerEl: HTMLElement): void {
        containerEl.createEl('h1', { text: '藏趣云 - 网页剪藏标注同步助手' });

    }
}

