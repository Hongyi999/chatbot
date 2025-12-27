// 环境配置
// 根据当前环境自动选择API地址

const getApiConfig = () => {
    const hostname = window.location.hostname;
    
    // GitHub Pages 生产环境
    if (hostname.includes('github.io')) {
        return {
            apiBaseUrl: ' https://hongyi999.github.io/chatbot//api',  // 替换为你的实际后端服务器地址
            wsUrl: ' https://hongyi999.github.io/chatbot/'  // WebSocket地址
        };
    }
    
    // 本地开发环境
    return {
        apiBaseUrl: 'http://localhost:5001/api',
        wsUrl: 'http://localhost:5001'
    };
};

const API_CONFIG = getApiConfig();

