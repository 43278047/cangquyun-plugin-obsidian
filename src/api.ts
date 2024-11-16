
import {config} from "./config";

export const getBookmarkContentList = async (apiKey: string, pageNum: number, pageSize: number, startTime: string): Promise<ApiResponse> => {
    const url = config.BASE_URL + `/openApi/bookmarkContentList/v1?pageNum=${pageNum}&pageSize=${pageSize}&startTime=${startTime}`;

    const authHeader = apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Plugin-Version': config.VERSION_NUM,
                'Plugin-Channel': config.CHANNEL,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Error fetching response.ok', response.ok);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        return data;
    } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            console.error('Network error: Failed to fetch data from the server.');
            throw new Error('网络错误：无法从服务器获取数据。');
        } else {
            console.error('Error fetching bookmark content list:', error);
            throw error;
        }
    }
};
