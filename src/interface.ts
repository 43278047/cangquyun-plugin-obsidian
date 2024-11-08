interface BookmarkContent {
    bookmark_id: string;
    title: string;
    url: string;
    urls: string;
    markdown_content: string;
    highlight_list: any[];
    create_time: string;
    update_time: string;
}

interface ApiResponse {
    msg: string;
    code: number;
    data: BookmarkContent[];
}
