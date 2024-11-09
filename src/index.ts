import {Modal, Plugin, Setting, App, Notice, PluginSettingTab} from 'obsidian';
import { syncBookmarkData } from './background.js';

interface MyPluginSettings {
    apiKey: string;
    syncOnOpen: boolean;
    syncFrequency: string;
    defaultDirectory: string;
    syncTime: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
    apiKey: '',
    syncOnOpen: false,
    syncFrequency: '0',
    defaultDirectory: 'cangquyun',
    syncTime: '2024-10-01 00:00:00',
}

export default class MyPlugin extends Plugin {
    settings!: MyPluginSettings;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new MySettingTab(this.app, this));

        if (this.settings.syncOnOpen){
             this.syncData();
        }

        // 创建一个侧边快捷按钮
        this.addRibbonIcon('sync', 'Sync Data', () => {
            this.syncData();
        });

        (global as any).myPluginInstance = this;

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
        console.log("updateSettings =",settings)
        this.settings = settings;
        await this.saveSettings();
    }

    async syncData() {
        const apiKey = this.settings.apiKey;
        if (!apiKey) {
            new Notice('API KEY 未设置');
            return;
        }

        // 调用同步逻辑
        await syncBookmarkData(this.app, this.settings.defaultDirectory,this.settings.apiKey);
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
        new Setting(containerEl)
            .setName('API KEY')
            .setDesc('请在PC端藏趣云网页的设置中,生成API KEY 填到此处')
            .addText(text => text
                .setPlaceholder('API KEY')
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    await this.plugin.saveSettings();
                    console.log('设置API Setting 1: ' + value);
                }))

    }
        // 同步配置
    displaySyncSettings(containerEl: HTMLElement): void {
        // 添加标题
        containerEl.createEl('h2', { text: '同步配置' });


        new Setting(containerEl)
            .setName('打开app是否同步')
            .setDesc('打开app就同步')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.syncOnOpen)
                .onChange(async (value) => {
                    this.plugin.settings.syncOnOpen = value;
                    await this.plugin.saveSettings();
                    console.log('打开app是否同步: ' + value);
                }));

        new Setting(containerEl)
            .setName('手动同步')
            .setDesc('同步一次')
            .addButton(button => button
                .setButtonText('同步一次')
                .onClick(() => {
                    window.open('https://doc.cangquyun.com', '_blank');
                }));

        new Setting(containerEl)
            .setName('上次同步时间')
            .setDesc('只会同步此时间之后的数据')
            .addText(text => text
                .setPlaceholder('')
                .setValue(this.plugin.settings.syncTime)
                .onChange(async (value) => {
                    this.plugin.settings.syncTime = value;
                    await this.plugin.saveSettings();
                }));

        // 新增的设置项：设置同步频率
        new Setting(containerEl)
            .setName('定时同步')
            .setDesc('设置同步频率')
            .addDropdown(dropdown => dropdown
                .addOption('0', '关闭')
                .addOption('5', '5分钟')
                .addOption('15', '15分钟')
                .addOption('30', '30分钟')
                .setValue(this.plugin.settings.syncFrequency)
                .onChange(async (value) => {
                    this.plugin.settings.syncFrequency = value;
                    await this.plugin.saveSettings();
                    console.log('设置同步频率: ' + value);
                }));
    }

    // 规则配置
    displayRuleSettings(containerEl: HTMLElement): void {
        // 添加标题
        containerEl.createEl('h2', { text: '规则配置' });

        new Setting(containerEl)
            .setName('默认目录')
            .setDesc('默认目录')
            .addText(text => text
                .setPlaceholder('')
                .setValue(this.plugin.settings.defaultDirectory)
                .onChange(async (value) => {
                    this.plugin.settings.defaultDirectory = value;
                    await this.plugin.saveSettings();
                    console.log('设置默认目录: ' + value);
                }));

        new Setting(containerEl)
            .setName('配置同步模板格式')
            .setDesc('同步配置配置')
            .addButton(button => button
                .setButtonText('配置模板')
                .onClick(() => {
                    window.open('https://doc.cangquyun.com', '_blank');
                }));
    }
    displayFooter(containerEl: HTMLElement): void {
        const footerEl = containerEl.createEl('p');
        footerEl.innerHTML = '<a href="https://doc.cangquyun.com" target="_blank">意见反馈</a>   <a href="https://doc.cangquyun.com" target="_blank">更新日志</a> <a href="https://www.cangquyun.com" target="_blank">藏趣云官网</a>';

        const versionEl = containerEl.createEl('p');
        versionEl.innerHTML = `版本: v1.0.0`;
    }


    displayHeader(containerEl: HTMLElement): void {
        containerEl.createEl('h1', { text: '藏趣云 - 网页剪藏标注助手' });

    }
}


export const myPluginInstance = (global as any).myPluginInstance as MyPlugin;

