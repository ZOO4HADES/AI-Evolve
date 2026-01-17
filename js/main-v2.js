/**
 * Main Entry Point V2
 * 像素级动画版本
 */

let chartV2 = null;
let animatorV2 = null;

/**
 * 初始化应用V2
 */
async function initAppV2() {
    try {
        console.log('========================================');
        console.log('AI-Evolve V2 应用启动（像素级动画）');
        console.log('========================================\n');

        // 调试：检查各个类是否已加载
        console.log('[V2 调试] 检查依赖加载...');
        console.log('[V2 调试] ModelTracker 定义:', typeof ModelTracker !== 'undefined' ? '✓' : '✗');
        console.log('[V2 调试] PixelAnimator 定义:', typeof PixelAnimator !== 'undefined' ? '✓' : '✗');
        console.log('[V2 调试] ChartV2 定义:', typeof ChartV2 !== 'undefined' ? '✓' : '✗');
        console.log('[V2 调试] ChartAnimatorV2 定义:', typeof ChartAnimatorV2 !== 'undefined' ? '✓' : '✗');
        console.log('[V2 调试] ARENA_DATA 定义:', typeof ARENA_DATA !== 'undefined' ? '✓' : '✗');
        console.log('');

        // 显示加载状态
        const chartContainer = document.getElementById('chart');
        if (chartContainer) {
            chartContainer.innerHTML = '<div class="loading"><div class="spinner"></div><p>加载数据中...</p></div>';
        }

        // 加载数据
        console.log('正在加载数据...');
        let data;

        if (typeof ARENA_DATA !== 'undefined') {
            data = ARENA_DATA;
            console.log('✓ 使用内嵌数据');
        } else {
            throw new Error('无法加载数据。请确保data-bundle.js文件存在。');
        }

        console.log(`✓ 数据加载成功: ${data.months.length} 个月`);
        console.log(`✓ 时间范围: ${data.months[0].date} 至 ${data.months[data.months.length - 1].date}`);

        // 初始化图表V2
        console.log('\n初始化图表V2...');
        chartV2 = new ChartV2('chart');
        console.log('✓ 图表V2初始化完成');

        // 生成图例和时间轴
        chartV2.generateLegend();
        console.log('✓ 图例生成完成');

        chartV2.generateTimeline(data.months.length);
        console.log('✓ 时间轴生成完成');

        // 初始化动画器V2
        console.log('\n初始化动画器V2...');
        animatorV2 = new ChartAnimatorV2(data, chartV2);
        animatorV2.initControls();
        console.log('✓ 动画器V2初始化完成');

        // 渲染首月数据（使用像素级动画）
        console.log('\n渲染首月数据...');
        await animatorV2.renderCurrentMonthWithPixelAnimation();
        console.log('✓ 首月数据渲染完成');

        console.log('\n========================================');
        console.log('🎉 V2 应用初始化完成！');
        console.log('========================================\n');
        console.log('🆕 V2 特性：');
        console.log('  - 使用 requestAnimationFrame 实现逐帧动画');
        console.log('  - 真正的像素级平滑移动');
        console.log('  - 缓动函数：easeInOutCubic');
        console.log('  - 60 FPS 流畅体验\n');

        console.log('操作提示：');
        console.log('  - 点击"播放"按钮开始自动播放');
        console.log('  - 使用滑块调整播放速度');
        console.log('  - 键盘快捷键：');
        console.log('    * 空格键：播放/暂停');
        console.log('    * ← / →：上一月/下一月');
        console.log('    * 1/2/3：设置播放速度\n');

    } catch (error) {
        console.error('[V2] 初始化失败:', error);

        // 显示错误信息
        if (chartV2) {
            chartV2.showError(`加载数据失败: ${error.message}<br>请确保 data/arena-history.json 文件存在`);
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
    document.addEventListener('DOMContentLoaded', initAppV2);
} else {
    initAppV2();
}

/**
 * 页面卸载时清理资源
 */
window.addEventListener('beforeunload', () => {
    if (animatorV2) {
        animatorV2.destroy();
    }
});

/**
 * 导出全局对象（用于调试）
 */
window.AI_Evolve_V2 = {
    chartV2,
    animatorV2,
    initAppV2
};
