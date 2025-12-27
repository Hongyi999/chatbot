let socket = null;
let currentUser = null;

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    // 检查登录状态
    await checkAuth();
    
    // 初始化WebSocket
    initSocket();
    
    // 加载消息历史
    await loadMessageHistory();
    
    // 绑定事件
    bindEvents();
});

// 检查认证状态
async function checkAuth() {
    try {
        const response = await authAPI.getCurrentUser();
        if (response.user) {
            currentUser = response.user;
            document.getElementById('usernameDisplay').textContent = currentUser.username;
        } else {
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('认证检查失败:', error);
        window.location.href = 'index.html';
    }
}

// 初始化WebSocket
function initSocket() {
    socket = io('http://localhost:5001', {
        withCredentials: true,
        transports: ['websocket', 'polling']
    });
    
    socket.on('connect', () => {
        console.log('WebSocket连接成功');
    });
    
    socket.on('connected', (data) => {
        console.log('服务器确认连接:', data);
    });
    
    socket.on('new_message', (data) => {
        addMessageToUI(data);
    });
    
    socket.on('error', (data) => {
        console.error('WebSocket错误:', data);
        showError(data.message || '连接错误');
    });
    
    socket.on('disconnect', () => {
        console.log('WebSocket断开连接');
        showError('连接已断开，请刷新页面');
    });
}

// 加载消息历史
async function loadMessageHistory() {
    try {
        const response = await chatAPI.getMessages(50, 0);
        const messages = response.messages || [];
        
        const container = document.getElementById('messagesContainer');
        const welcomeMsg = container.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }
        
        messages.forEach(msg => {
            addMessageToUI({
                content: msg.content,
                message_type: msg.message_type,
                username: msg.message_type === 'user' ? currentUser.username : 'AI助手',
                created_at: msg.created_at
            });
        });
        
        scrollToBottom();
    } catch (error) {
        console.error('加载消息历史失败:', error);
    }
}

// 绑定事件
function bindEvents() {
    const sendBtn = document.getElementById('sendBtn');
    const messageInput = document.getElementById('messageInput');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // 发送消息
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // 退出登录
    logoutBtn.addEventListener('click', async () => {
        try {
            await authAPI.logout();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('退出失败:', error);
            window.location.href = 'index.html';
        }
    });
}

// 发送消息
async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const content = messageInput.value.trim();
    
    if (!content) {
        return;
    }
    
    if (!socket || !socket.connected) {
        showError('连接未建立，请刷新页面');
        return;
    }
    
    // 禁用输入
    messageInput.disabled = true;
    sendBtn.disabled = true;
    
    try {
        // 通过WebSocket发送消息
        socket.emit('send_message', { content });
        
        // 清空输入框
        messageInput.value = '';
    } catch (error) {
        console.error('发送消息失败:', error);
        showError('发送消息失败，请稍后重试');
    } finally {
        // 恢复输入
        messageInput.disabled = false;
        sendBtn.disabled = false;
        messageInput.focus();
    }
}

// 添加消息到UI
function addMessageToUI(data) {
    const container = document.getElementById('messagesContainer');
    const welcomeMsg = container.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${data.message_type}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    const header = document.createElement('div');
    header.className = 'message-header';
    header.textContent = data.username || (data.message_type === 'user' ? currentUser?.username : 'AI助手');
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = data.content;
    
    const time = document.createElement('div');
    time.className = 'message-time';
    if (data.created_at) {
        const date = new Date(data.created_at);
        time.textContent = formatTime(date);
    }
    
    bubble.appendChild(header);
    bubble.appendChild(content);
    bubble.appendChild(time);
    messageDiv.appendChild(bubble);
    container.appendChild(messageDiv);
    
    scrollToBottom();
}

// 滚动到底部
function scrollToBottom() {
    const container = document.getElementById('messagesContainer');
    container.scrollTop = container.scrollHeight;
}

// 格式化时间
function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) {
        return '刚刚';
    } else if (minutes < 60) {
        return `${minutes}分钟前`;
    } else if (minutes < 1440) {
        return `${Math.floor(minutes / 60)}小时前`;
    } else {
        return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
}

// 显示错误
function showError(message) {
    // 可以在这里添加错误提示UI
    console.error(message);
    alert(message);
}

