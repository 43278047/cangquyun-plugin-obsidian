// 定义接口返回的数据结构
import {config} from "./config";

// 封装请求方法
export const getBookmarkContentList = async (apiKey: string, pageNum: number, pageSize: number): Promise<ApiResponse> => {
    const url = config.BASE_URL + `/openApi/bookmarkContentList/v1?pageNum=${pageNum}&pageSize=${pageSize}`;

    // 确保 apiKey 以 "Bearer " 开头
    const authHeader = apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
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