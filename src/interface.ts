interface ApiResponse {
    msg: string;
    code: number;
    data: BookmarkContent[];
}

interface BookmarkContent {
    bookmark_id: string;
    title: string;
    url: string;
    urls: string;
    markdown_content: string;
    highlight_list: BookmarkHighlightsRsp[];
    create_time: string;
    update_time: string;
}

interface BookmarkHighlightsRsp {
    highlight_id: string;
    bookmark_id: string;
    color_type: number;
    dashing_type: number;
    annotation_content: string;
    annotation_modify_content: string;
    note_content: string;
    version: string;
    create_time: string;
    update_time: string;
}
