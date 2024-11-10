interface ApiResponse {
    msg: string;
    code: number;
    data: BookmarkContent[];
}

interface BookmarkContent {
    bookmarkId: string;
    title: string;
    url: string;
    urls: string;
    markdownContent: string;
    highlightList: BookmarkHighlightsRsp[];
    createTime: string;
    updateTime: string;
}

interface BookmarkHighlightsRsp {
    highlightId: string;
    bookmarkId: string;
    colorType: number;
    dashingType: number;
    annotationContent: string;
    annotationModifyContent: string;
    noteContent: string;
    version: string;
    createTime: string;
    updateTime: string;
}

interface MyPluginSettings {
    apiKey: string;
    syncOnOpen: boolean;
    syncFrequency: string;
    defaultDirectory: string;
    syncTime: string;
    template: string;
}

