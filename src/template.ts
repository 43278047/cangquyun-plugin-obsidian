import nunjucks from 'nunjucks';
// 定义默认模板
const defaultTemplate =
`---
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
`;

export function renderTemplate(template:string, data: BookmarkContent) {
    if (!data){
        return "";
    }
    if (!template || !template.trim()){
        template = defaultTemplate;
    }
    template = initTemplate(template);
    try {
        return nunjucks.renderString(template, data)
    }catch (e) {
        return "";
    }
}


// 前置处理 处理模板
export function initTemplate(template:string) {

    // 把 {{ markdownContent }} 转成 {{ markdownContent | safe }}
    template = template.replace(/{{\s*markdownContent\s*}}/g, '{{ markdownContent | safe }}');
    template = template.replace(/{{\s*item.noteContent\s*}}/g, '{{ item.noteContent | safe }}');


    return template;
}
