import nunjucks from 'nunjucks';
// 定义模板
const template = `
---
title: 我的笔记
author: 张三
date: 2023-10-01
tags: [笔记, Obsidian]
---

书签ID: {{ bookmarkId }}
标题: {{ title }}
URL: [原文链接]({{ url }})
其他URL: {{ urls }}
创建时间: {{ createTime }}
更新时间: {{ updateTime }}


{% if highlightList.length > 0 %}
## 划线列表
{% for item in highlightList %}
划线ID: {{ item.highlightId }}
   颜色类型: {{ item.colorType }}
   划线类型: {{ item.dashingType }}
   划线内容: {{ item.annotationContent }}
   修改后的划线内容: {{ item.annotationModifyContent }}
   笔记内容: {{ item.noteContent }}
   版本: {{ item.version }}
   创建时间: {{ item.createTime }}
   更新时间: {{ item.updateTime }}
{% endfor %}
{% endif %}

{% if markdownContent %}
## 全文剪藏
{{ markdownContent }}
{% endif %}
`;

export function renderTemplate(data: BookmarkContent) {
    if (!data){
        return "";
    }
    return nunjucks.renderString(template, data);
}
