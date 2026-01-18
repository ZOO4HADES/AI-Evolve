/**
 * Main Entry Point V4
 * 改进的动画版本
 */

let chartV4 = null;
let animatorV4 = null;

/**
 * 初始化应用 V4
 */
async function initAppV4() {
    try {
        console.log('========================================');
        console.log('AI-Evolve V4 应用启动（改进动画版本）');
        console.log('========================================\n');

        // 检查依赖
        console.log('[V4] 检查依赖加载...');
        console.log('[V4] V4StateManager:', typeof V4StateManager !== 'undefined' ? '✓' : '✗');
        console.log('[V4] V4AnimationEngine:', typeof V4AnimationEngine !== 'undefined' ? '✓' : '✗');
        console.log('[V4] ChartV4:', typeof ChartV4 !== 'undefined' ? '✓' : '✗');
        console.log('[V4] ChartAnimatorV4:', typeof ChartAnimatorV4 !== 'undefined' ? '✓' : '✗');
        console.log('[V4] ARENA_DATA:', typeof ARENA_DATA !== 'undefined' ? '✓' : '✗');
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
            throw new Error('无法加载数据。请确保 data-bundle-mixed-v2.js 文件存在。');
        }

        console.log(`✓ 数据加载成功: ${data.months.length} 个月`);
        console.log(`✓ 时间范围: ${data.months[0].date} 至 ${data.months[data.months.length - 1].date}`);

        // 初始化图表 V4
        console.log('\n初始化图表 V4...');
        chartV4 = new ChartV4('chart');
        console.log('✓ 图表 V4 初始化完成');

        // 生成图例和时间轴
        chartV4.generateLegend();
        console.log('✓ 图例生成完成');

        chartV4.generateTimeline(data.months.length);
        console.log('✓ 时间轴生成完成');

        // 初始化动画器 V4
        console.log('\n初始化动画器 V4...');
        animatorV4 = new ChartAnimatorV4(data, chartV4);
        animatorV4.initControls();
        console.log('✓ 动画器 V4 初始化完成');

        // 渲染首月数据
        console.log('\n渲染首月数据...');
        await animatorV4.renderCurrentMonth();
        console.log('✓ 首月数据渲染完成');

        console.log('\n========================================');
        console.log('🎉 V4 应用初始化完成！');
        console.log('========================================\n');
        console.log('🆕 V4 特性：');
        console.log('  - 标准化模型名称匹配');
        console.log('  - 精确的位置捕获逻辑');
        console.log('  - 改进的动画指令计算');
        console.log('  - 详细的调试日志\n');

        console.log('操作提示：');
        console.log('  - 点击"播放"按钮开始自动播放');
        console.log('  - 使用滑块调整播放速度');
        console.log('  - 键盘快捷键：');
        console.log('    * 空格键：播放/暂停');
        console.log('    * ← / →：上一月/下一月');
        console.log('    * 1/2/3：设置播放速度\n');

    } catch (error) {
        console.error('[V4] 初始化失败:', error);

        // 显示错误信息
        if (chartV4) {
            chartV4.showError(`加载数据失败: ${error.message}<br>请确保 data-bundle-mixed-v2.js 文件存在`);
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
    document.addEventListener('DOMContentLoaded', initAppV4);
} else {
    initAppV4();
}

/**
 * 页面卸载时清理资源
 */
window.addEventListener('beforeunload', () => {
    if (animatorV4) {
        animatorV4.destroy();
    }
});

/**
 * 导出全局对象（用于调试）
 */
window.AI_Evolve_V4 = {
    chartV4,
    animatorV4,
    initAppV4
};
