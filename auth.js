// 标签页切换
document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            // 更新按钮状态
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 更新表单显示
            if (tab === 'login') {
                loginForm.classList.add('active');
                registerForm.classList.remove('active');
            } else {
                registerForm.classList.add('active');
                loginForm.classList.remove('active');
            }
            
            // 清除错误信息
            document.getElementById('loginError').textContent = '';
            document.getElementById('registerError').textContent = '';
        });
    });
    
    // 登录表单提交
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('loginError');
        errorDiv.textContent = '';
        
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!username || !password) {
            errorDiv.textContent = '请输入用户名和密码';
            return;
        }
        
        try {
            const response = await authAPI.login(username, password);
            if (response.message === '登录成功') {
                window.location.href = 'chat.html';
            }
        } catch (error) {
            errorDiv.textContent = error.message || '登录失败，请稍后重试';
        }
    });
    
    // 注册表单提交
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('registerError');
        errorDiv.textContent = '';
        
        const username = document.getElementById('registerUsername').value.trim();
        const password = document.getElementById('registerPassword').value;
        
        if (!username || !password) {
            errorDiv.textContent = '请输入用户名和密码';
            return;
        }
        
        if (username.length < 3 || username.length > 50) {
            errorDiv.textContent = '用户名长度必须在3-50个字符之间';
            return;
        }
        
        if (password.length < 6) {
            errorDiv.textContent = '密码长度至少6个字符';
            return;
        }
        
        try {
            const response = await authAPI.register(username, password);
            if (response.message === '注册成功') {
                window.location.href = 'chat.html';
            }
        } catch (error) {
            errorDiv.textContent = error.message || '注册失败，请稍后重试';
        }
    });
    
    // 检查是否已登录
    checkAuth();
});

// 检查认证状态
async function checkAuth() {
    try {
        const response = await authAPI.getCurrentUser();
        if (response.user) {
            // 已登录，跳转到聊天页面
            window.location.href = 'chat.html';
        }
    } catch (error) {
        // 未登录，停留在登录页面
        console.log('未登录');
    }
}

