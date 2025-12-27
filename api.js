// 从配置文件读取API地址
const API_BASE_URL = (typeof API_CONFIG !== 'undefined' && API_CONFIG.apiBaseUrl) 
    ? API_CONFIG.apiBaseUrl 
    : 'http://localhost:5001/api';

// 通用API请求函数
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
        credentials: 'include', // 包含cookies
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    const config = { ...defaultOptions, ...options };
    
    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || '请求失败');
        }
        
        return data;
    } catch (error) {
        console.error('API请求错误:', error);
        throw error;
    }
}

// 认证API
const authAPI = {
    register: (username, password) => {
        return apiRequest('/auth/register', {
            method: 'POST',
            body: { username, password },
        });
    },
    
    login: (username, password) => {
        return apiRequest('/auth/login', {
            method: 'POST',
            body: { username, password },
        });
    },
    
    logout: () => {
        return apiRequest('/auth/logout', {
            method: 'POST',
        });
    },
    
    getCurrentUser: () => {
        return apiRequest('/auth/me', {
            method: 'GET',
        });
    },
};

// 聊天API
const chatAPI = {
    getMessages: (limit = 50, offset = 0) => {
        return apiRequest(`/chat/messages?limit=${limit}&offset=${offset}`, {
            method: 'GET',
        });
    },
    
    saveMessage: (content, messageType = 'user') => {
        return apiRequest('/chat/messages', {
            method: 'POST',
            body: { content, message_type: messageType },
        });
    },
};

// 导出API对象
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { authAPI, chatAPI, apiRequest };
}

