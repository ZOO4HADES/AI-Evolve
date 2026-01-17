/**
 * Main Entry Point
 * 主入口文件，负责初始化应用
 */

let chart = null;
let animator = null;

/**
 * 初始化应用
 */
async function initApp() {
    try {
        console.log('========================================');
        console.log('AI-Evolve 应用启动');
        console.log('========================================\n');

        // 调试：检查各个类是否已加载
        console.log('[调试] 检查依赖加载...');
        console.log('[调试] ModelTracker 定义:', typeof ModelTracker !== 'undefined' ? '✓' : '✗');
        console.log('[调试] AnimationController 定义:', typeof AnimationController !== 'undefined' ? '✓' : '✗');
        console.log('[调试] Chart 定义:', typeof Chart !== 'undefined' ? '✓' : '✗');
        console.log('[调试] ChartAnimator 定义:', typeof ChartAnimator !== 'undefined' ? '✓' : '✗');
        console.log('[调试] ARENA_DATA 定义:', typeof ARENA_DATA !== 'undefined' ? '✓' : '✗');
        console.log('');

        // 显示加载状态
        const chartContainer = document.getElementById('chart');
        if (chartContainer) {
            chartContainer.innerHTML = '<div class="loading"><div class="spinner"></div><p>加载数据中...</p></div>';
        }

        // 加载数据 - 优先使用内嵌数据
        console.log('正在加载数据...');
        let data;

        // 方案1：使用内嵌数据（推荐，可直接打开HTML文件）
        if (typeof ARENA_DATA !== 'undefined') {
            data = ARENA_DATA;
            console.log('✓ 使用内嵌数据');
        } else {
            // 方案2：使用fetch（需要HTTP服务器）
            try {
                const response = await fetch('data/arena-history.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                data = await response.json();
                console.log('✓ 使用外部JSON文件');
            } catch (fetchError) {
                // fetch失败，显示友好提示
                console.warn('Fetch失败，尝试使用内嵌数据:', fetchError);
                throw new Error('无法加载数据。请确保data-bundle.js文件存在，或使用HTTP服务器运行。');
            }
        }

        console.log(`✓ 数据加载成功: ${data.months.length} 个月`);
        console.log(`✓ 时间范围: ${data.months[0].date} 至 ${data.months[data.months.length - 1].date}`);

        // 初始化图表
        console.log('\n初始化图表...');
        chart = new Chart('chart');
        console.log('✓ 图表初始化完成');

        // 生成图例和时间轴
        chart.generateLegend();
        console.log('✓ 图例生成完成');

        chart.generateTimeline(data.months.length);
        console.log('✓ 时间轴生成完成');

        // 初始化动画器
        console.log('\n初始化动画器...');
        animator = new ChartAnimator(data, chart);
        animator.initControls();
        console.log('✓ 动画器初始化完成');

        // 渲染首月数据（使用FLIP动画，确保currentElements初始化）
        console.log('\n渲染首月数据...');
        await animator.renderCurrentMonthWithFlip();
        console.log('✓ 首月数据渲染完成');

        console.log('\n========================================');
        console.log('🎉 应用初始化完成！');
        console.log('========================================\n');
        console.log('操作提示：');
        console.log('  - 点击"播放"按钮开始自动播放');
        console.log('  - 使用滑块调整播放速度');
        console.log('  - 键盘快捷键：');
        console.log('    * 空格键：播放/暂停');
        console.log('    * ← / →：上一月/下一月');
        console.log('    * 1/2/3：设置播放速度\n');

    } catch (error) {
        console.error('初始化失败:', error);

        // 显示错误信息
        if (chart) {
            chart.showError(`加载数据失败: ${error.message}<br>请确保 data/arena-history.json 文件存在`);
        } else {
            const chartContainer = document.getElementById('chart');
            if (chartContainer) {
                chartContainer.innerHTML = `
                    <div class="error">
                        <p style="color: #ff6b6b; text-align: center; padding: 2rem;">
                            ❌ 初始化失败: ${error.message}<br>
                            请检查浏览器控制台获取详细信息
                        </p>
                    </div>
                `;
            }
        }
    }
}

/**
 * 页面加载完成后初始化
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

/**
 * 页面卸载时清理资源
 */
window.addEventListener('beforeunload', () => {
    if (animator) {
        animator.destroy();
    }
});

/**
 * 导出全局对象（用于调试）
 */
window.AI_Evolve = {
    chart,
    animator,
    initApp
};
