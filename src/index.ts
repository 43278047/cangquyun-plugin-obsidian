import { Plugin, Setting, App, Notice, PluginSettingTab} from 'obsidian';
import { syncBookmarkData } from './background.js';

interface MyPluginSettings {
    apiKey: string;
    syncOnOpen: boolean;
    syncFrequency: string;
    defaultDirectory: string;
    syncTime: string;
    template: string;
}

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

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new MySettingTab(this.app, this));

        if (this.settings.syncOnOpen){
             this.syncData();
        }

        this.addRibbonIcon('sync', '同步藏趣云数据', () => {
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
            .setDesc('每次同步，只会同步此时间之后的文章数据')
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
                .addOption('5', '5分钟')
                .addOption('15', '15分钟')
                .addOption('30', '30分钟')
                .setValue(this.plugin.settings.syncFrequency)
                .onChange(async (value) => {
                    this.plugin.settings.syncFrequency = value;
                    await this.plugin.saveSettings();
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
                    console.log('设置默认目录: ' + value);
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


export const myPluginInstance = (global as any).myPluginInstance as MyPlugin;

