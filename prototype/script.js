// PingPong AI - UI V3.0 原型交互脚本

// 页面切换
function switchPage(pageId) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // 显示目标页面
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // 更新导航按钮状态
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === pageId) {
            btn.classList.add('active');
        }
    });
    
    // 如果切换到首页，重新运行动画
    if (pageId === 'home') {
        animateNumbers();
    }
}

// 导航按钮事件
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const pageId = btn.dataset.page;
        
        if (pageId === 'theme') {
            toggleTheme();
        } else {
            switchPage(pageId);
        }
    });
});

// 主题切换
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    
    // 更新按钮文本
    const themeBtn = document.querySelector('[data-page="theme"]');
    if (themeBtn) {
        themeBtn.textContent = isDark ? '🌙 深色' : '🌓 浅色';
    }
    
    // 保存偏好
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// 加载保存的主题偏好
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    const themeBtn = document.querySelector('[data-page="theme"]');
    if (themeBtn) {
        themeBtn.textContent = '🌙 深色';
    }
}

// 数字滚动动画
function animateNumbers() {
    const statValues = document.querySelectorAll('.stat-value[data-count]');
    
    statValues.forEach(el => {
        const target = parseInt(el.dataset.count);
        const duration = 500;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                el.textContent = target;
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(current);
            }
        }, 16);
    });
}

// 页面加载时运行动画
window.addEventListener('load', () => {
    animateNumbers();
});

// 上传区域交互
const uploadArea = document.getElementById('uploadArea');
if (uploadArea) {
    uploadArea.addEventListener('click', () => {
        alert('打开文件选择对话框\n（原型演示，实际功能需要实现文件上传）');
    });
    
    // 拖拽效果
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary-blue)';
        uploadArea.style.background = 'rgba(0, 102, 255, 0.05)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '';
        uploadArea.style.background = '';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '';
        uploadArea.style.background = '';
        alert('文件已放置\n（原型演示，实际功能需要实现文件上传）');
    });
}

// 分段控制器交互
document.querySelectorAll('.segmented-control').forEach(control => {
    const segments = control.querySelectorAll('.segment');
    
    segments.forEach(segment => {
        segment.addEventListener('click', () => {
            segments.forEach(s => s.classList.remove('active'));
            segment.classList.add('active');
        });
    });
});

// Tab Bar 交互
document.querySelectorAll('.tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
        // 移除其他 active 状态
        tab.parentElement.querySelectorAll('.tab-item').forEach(t => {
            t.classList.remove('active');
        });
        
        // 添加 active 状态
        if (!tab.classList.contains('center')) {
            tab.classList.add('active');
        }
    });
});

// 卡片悬浮效果增强
document.querySelectorAll('.action-card, .recent-item, .action-list-item').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-4px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// 按钮点击效果
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            left: ${x}px;
            top: ${y}px;
            width: 100px;
            height: 100px;
            margin-left: -50px;
            margin-top: -50px;
            pointer-events: none;
        `;
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// 添加涟漪动画
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 进度条动画
function animateProgressBar(selector, targetWidth) {
    const bar = document.querySelector(selector);
    if (bar) {
        bar.style.transition = 'width 1s ease';
        bar.style.width = targetWidth + '%';
    }
}

// 视频播放控制（原型演示）
document.querySelectorAll('.control-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const isPlay = this.textContent === '▶';
        this.textContent = isPlay ? '⏸' : '▶';
    });
});

// 收藏按钮交互
document.querySelectorAll('.icon-btn').forEach(btn => {
    if (btn.textContent === '❤️') {
        btn.addEventListener('click', function() {
            if (this.style.background === 'rgb(255, 59, 48)') {
                this.style.background = '';
                this.style.color = '';
            } else {
                this.style.background = 'var(--error)';
                this.style.color = 'white';
            }
        });
    }
});

// 查看更多交互
document.querySelectorAll('.see-all').forEach(link => {
    link.addEventListener('click', () => {
        alert('跳转到完整列表页\n（原型演示）');
    });
});

// 滚动时隐藏/显示 Tab Bar
let lastScrollY = 0;
const tabBar = document.querySelector('.tab-bar');

if (tabBar) {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.addEventListener('scroll', () => {
            const currentScrollY = mainContent.scrollTop;
            
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                tabBar.style.transform = 'translateY(100%)';
            } else {
                tabBar.style.transform = '';
            }
            
            lastScrollY = currentScrollY;
        });
    }
}

// 控制台输出
console.log('%c🏓 PingPong AI - UI V3.0 原型', 'color: #0066FF; font-size: 16px; font-weight: bold;');
console.log('%c设计版本：V3.0 | 日期：2026-03-25', 'color: #8B949E; font-size: 12px;');
console.log('\n%c可用功能:', 'color: #00C853; font-weight: bold;');
console.log('- 点击顶部导航切换页面');
console.log('- 点击 🌓 切换主题');
console.log('- 点击卡片查看悬浮效果');
console.log('- 点击按钮查看涟漪动画');
console.log('- 拖拽文件到上传区域');
console.log('- 点击分段控制器切换选项');
