import nunjucks from 'nunjucks';
// 定义模板
const template = `
## 页面信息
- 书签ID: {{ bookmark_id }}
- 标题: {{ title }}
- URL: [原文链接]({{ url }})
- 其他URL: {{ urls }}
- 创建时间: {{ create_time }}
- 更新时间: {{ update_time }}

{% if highlight_list.length > 0 %}
## 划线列表
{% for item in highlight_list %}
- 划线ID: {{ item.highlight_id }}
  - 颜色类型: {{ item.color_type }}
  - 划线类型: {{ item.dashing_type }}
  - 划线内容: {{ item.annotation_content }}
  - 修改后的划线内容: {{ item.annotation_modify_content }}
  - 笔记内容: {{ item.note_content }}
  - 版本: {{ item.version }}
  - 创建时间: {{ item.create_time }}
  - 更新时间: {{ item.update_time }}
{% endfor %}
{% endif %}

{% if markdown_content %}
## 全文剪藏
{{ markdown_content }}
{% endif %}
`;

export function renderTemplate(data: BookmarkContent) {
    if (!data){
        return "";
    }
    return nunjucks.renderString(template, data);
}
