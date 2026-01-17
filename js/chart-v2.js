/**
 * Chart Renderer V2 - 像素级动画版本
 * 使用 PixelAnimator 实现逐帧平滑移动
 */

// 公司颜色映射
const COMPANY_COLORS = {
    'OpenAI': '#10a37f',
    'Anthropic': '#d97757',
    'Google': '#4285f4',
    'xAI': '#1a1a2e',
    'Alibaba': '#ff6a00',
    'Z.ai': '#8b5cf6',
    'Baidu': '#2932e1',
    'Moonshot': '#1a1a2e',
    'Meta': '#1877f2',
    'Mistral': '#ff6b35',
    'LMSYS': '#6366f1'
};

// 中文公司名称映射
const COMPANY_NAMES_ZH = {
    'OpenAI': 'OpenAI',
    'Anthropic': 'Anthropic',
    'Google': '谷歌',
    'xAI': 'xAI',
    'Alibaba': '阿里',
    'Z.ai': '智谱AI',
    'Baidu': '百度',
    'Moonshot': '月之暗面',
    'Meta': 'Meta',
    'Mistral': 'Mistral',
    'LMSYS': 'LMSYS'
};

/**
 * Chart V2 类 - 像素级动画渲染器
 */
class ChartV2 {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container #${containerId} not found`);
        }

        // 初始化ModelTracker和PixelAnimator
        this.modelTracker = new ModelTracker();
        this.pixelAnimator = new PixelAnimator({
            duration: 1500 // 1500ms动画时长
        });

        // 当前渲染的模型元素映射
        this.currentElements = new Map(); // Map<modelName, element>
    }

    /**
     * 获取公司颜色
     */
    getCompanyColor(organization) {
        return COMPANY_COLORS[organization] || '#888888';
    }

    /**
     * 计算柱状图宽度（基于Elo评分）
     */
    calculateBarWidth(elo) {
        const minElo = 1000;
        const maxElo = 1500;
        const minWidth = 40;
        const maxWidth = 95;

        const percentage = (elo - minElo) / (maxElo - minElo);
        return minWidth + percentage * (maxWidth - minWidth);
    }

    /**
     * 格式化日期显示
     */
    formatDate(dateStr) {
        const [year, month] = dateStr.split('-');
        const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月',
                           '7月', '8月', '9月', '10月', '11月', '12月'];
        return `${year}年${monthNames[parseInt(month) - 1]}`;
    }

    /**
     * 创建单行模型数据
     */
    createModelRow(model, index, isInitialLoad = false) {
        const row = document.createElement('div');
        row.className = isInitialLoad ? 'model-row initial-load' : 'model-row';
        row.dataset.rank = model.rank;
        row.dataset.name = model.name;

        // ⚠️ 关键修复：对于非首次加载的元素，立即隐藏
        // 避免在创建和动画开始之间出现闪烁
        if (!isInitialLoad) {
            row.style.opacity = '0';
            row.style.visibility = 'hidden';
            // ⚠️ 不再使用 position: absolute，因为 updateDOM 中使用了 display:none
        }

        // 计算柱状图宽度
        const barWidth = this.calculateBarWidth(model.elo);

        // 获取公司颜色
        const color = this.getCompanyColor(model.organization);

        // 创建HTML结构
        row.innerHTML = `
            <span class="rank">${model.rank}</span>
            <div class="bar-container">
                <div class="bar" style="width: ${barWidth}%; background: ${color};"></div>
                <span class="model-name">${model.name}</span>
                <span class="elo">${model.elo}</span>
                <span class="company" style="color: ${color}">${COMPANY_NAMES_ZH[model.organization] || model.organization}</span>
            </div>
        `;

        return row;
    }

    /**
     * 使用像素级动画渲染月份数据
     */
    async renderMonthWithPixelAnimation(monthData) {
        console.log('[ChartV2] 开始像素级动画渲染...');

        // ⚠️ 关键：在DOM更新前捕获旧位置
        const oldElements = Array.from(this.currentElements.values());
        const oldPositions = new Map();

        oldElements.forEach(element => {
            if (!element) return;
            const rect = element.getBoundingClientRect();
            const modelName = element.dataset.modelName;
            if (modelName) {
                oldPositions.set(modelName, {
                    top: rect.top,
                    left: rect.left,
                    element: element
                });
            }
        });

        // 更新模型追踪器
        const changes = this.modelTracker.update(monthData);

        // 更新DOM
        this.updateDOM(monthData, changes);

        // ⚠️ 检查是否为首次渲染（在DOM更新后检查）
        const isFirstRender = oldPositions.size === 0;

        // ⚠️ 关键修复：先插入所有新元素到DOM，确保能捕获位置
        // 特别是首次渲染时，所有元素都是新元素
        if (this._pendingElements && this._pendingElements.size > 0) {
            console.log(`[ChartV2] 先插入 ${this._pendingElements.size} 个新元素到DOM`);

            const sortedModels = [...monthData.models].sort((a, b) => a.rank - b.rank);

            this._pendingElements.forEach((element, modelName) => {
                const model = sortedModels.find(m => m.name === modelName);
                if (!model) return;

                const currentRank = parseInt(element.dataset.rank);

                // 找到正确的插入位置
                let referenceNode = null;
                for (const m of sortedModels) {
                    if (m.rank > currentRank) {
                        const existingRow = this.currentElements.get(m.name);
                        if (existingRow && existingRow.parentNode === this.container) {
                            referenceNode = existingRow;
                            break;
                        }
                    }
                }

                this.container.insertBefore(element, referenceNode);
                this.currentElements.set(modelName, element);
                console.log(`[ChartV2] 插入新元素 ${modelName} (排名${currentRank})`);
            });

            // 清空待插入集合
            this._pendingElements.clear();
        }

        // ⚠️ 优化方法：重新排序DOM获取准确位置，但立即应用transform避免可见的跳动
        // 先重新排序DOM
        if (this._pendingReorder) {
            let referenceNode = this.container.firstChild;
            this._pendingReorder.forEach(modelName => {
                const row = this.currentElements.get(modelName);
                if (row && row.parentNode === this.container) {
                    this.container.insertBefore(row, referenceNode);
                    referenceNode = row.nextSibling;
                }
            });
            console.log('[ChartV2] 重新排序DOM以获取准确位置');
        }

        // 强制回流
        void this.container.offsetHeight;

        // 获取准确的新位置（基于重新排序后的DOM）
        const sortedModels = [...monthData.models].sort((a, b) => a.rank - b.rank);
        const newPositions = new Map();

        sortedModels.forEach((model, index) => {
            const element = this.currentElements.get(model.name);
            if (!element) return;

            const rect = element.getBoundingClientRect();
            newPositions.set(model.name, {
                top: rect.top,
                left: rect.left,
                element: element,
                rank: model.rank
            });

            console.log(`[ChartV2] ${model.name} (排名${model.rank}) 实际位置: top=${rect.top.toFixed(1)}`);
        });

        // 计算动画指令
        const animations = this.calculateAnimations(oldPositions, newPositions);

        // ⚠️ 关键：在动画开始前，应用初始动画状态
        animations.forEach(anim => {
            if (anim.type === 'move') {
                // 移动动画：应用初始transform，让元素看起来还在旧位置
                anim.element.style.transform = `translate3d(${anim.deltaX}px, ${anim.deltaY}px, 0)`;
                console.log(`[ChartV2] 初始transform应用到 ${anim.element.dataset.modelName}: translate3d(${anim.deltaX.toFixed(1)}px, ${anim.deltaY.toFixed(1)}px, 0)`);
            } else if (anim.type === 'enter') {
                // 进入动画：设置初始状态（透明度为0，从左侧，柱状图为0）
                const element = anim.element;
                const bar = element.querySelector('.bar');

                // ⚠️ 立即恢复可见性，设置初始状态
                element.style.visibility = 'visible';

                if (bar) {
                    element._targetBarWidth = bar.style.width;
                    bar.style.width = '0%';
                }

                element.style.opacity = '0';

                // ⚠️ 关键修复：首次渲染时不要设置滑入的transform
                if (!element._isFirstRender) {
                    element.style.transform = 'translateX(-100px)';
                } else {
                    element.style.transform = 'translateX(0)';
                }

                console.log(`[ChartV2] 进入动画初始状态: ${element.dataset.modelName}`);
            } else if (anim.type === 'leave') {
                // 离开动画：保持可见
                anim.element.style.opacity = '1';
            }
        });

        // ⚠️ 首次渲染特殊处理：所有元素都作为enter动画，柱状图从0增长
        if (isFirstRender) {
            console.log('[ChartV2] ========== 首次渲染模式 ==========');
            const allElements = Array.from(this.currentElements.values());
            console.log(`[ChartV2] 找到 ${allElements.length} 个元素`);

            allElements.forEach((element, index) => {
                const bar = element.querySelector('.bar');
                const modelName = element.dataset.modelName;

                if (bar) {
                    // ⚠️ 关键修复：如果_targetBarWidth已经被设置（在进入动画初始状态中），就不要覆盖
                    // 如果还没有设置，从当前宽度读取
                    if (!element._targetBarWidth) {
                        const targetWidth = bar.style.width;
                        element._targetBarWidth = targetWidth;
                        console.log(`[ChartV2] ${index}. ${modelName}: 目标宽度=${targetWidth}（首次读取）`);
                    } else {
                        console.log(`[ChartV2] ${index}. ${modelName}: 目标宽度=${element._targetBarWidth}（已存在，保留）`);
                    }
                    bar.style.width = '0%';
                }

                // 设置初始状态
                element.style.opacity = '0';
                element.style.transform = 'translateX(0)';
                // 标记为首次渲染，动画引擎会跳过滑入效果
                element._isFirstRender = true;
                console.log(`[ChartV2] ${modelName}: 设置_isFirstRender=true`);
            });
            console.log('[ChartV2] 首次渲染：所有柱状图设置为0，准备播放增长动画');
        }

        // 执行像素级动画
        await this.pixelAnimator.executePixelAnimations(animations);

        // ⚠️ 清理待排序信息（已经在动画开始前应用了排序）
        this._pendingReorder = null;

        // ⚠️ 动画完成后，释放容器高度，恢复自动调整
        this.container.style.height = '';
        console.log('[ChartV2] 释放容器高度');

        // 更新月份显示
        const monthDisplay = document.getElementById('currentMonth');
        if (monthDisplay) {
            monthDisplay.textContent = this.formatDate(monthData.date);
        }

        // 更新进度条
        this.updateProgress(monthData.date);

        console.log('[ChartV2] 像素级动画渲染完成');
    }

    /**
     * 计算动画指令
     */
    calculateAnimations(oldPositions, newPositions) {
        const animations = [];

        console.log('[ChartV2] ========== 计算动画指令 ==========');
        console.log('[ChartV2] 旧位置数量:', oldPositions.size);
        console.log('[ChartV2] 新位置数量:', newPositions.size);

        // 找出移动和进入的元素
        newPositions.forEach((newPos, modelName) => {
            const element = newPos.element;
            const oldPos = oldPositions.get(modelName);

            if (oldPos) {
                // 元素存在，计算移动距离
                const deltaY = oldPos.top - newPos.top;
                const deltaX = oldPos.left - newPos.left;

                console.log(`[ChartV2] ${modelName}:`);
                console.log(`  旧top: ${oldPos.top.toFixed(1)}px, 新top: ${newPos.top.toFixed(1)}px`);
                console.log(`  deltaY: ${deltaY.toFixed(1)}px (${deltaY > 0 ? '向下' : deltaY < 0 ? '向上' : '无'}移动)`);
                console.log(`  deltaX: ${deltaX.toFixed(1)}px`);

                if (Math.abs(deltaY) > 0.5 || Math.abs(deltaX) > 0.5) {
                    // 位置有变化，需要移动动画
                    // deltaX/Y 是从旧位置到新位置的偏移量
                    // 动画会从 translate(deltaX, deltaY) 平滑移动到 translate(0, 0)

                    // ⚠️ 记录柱状图宽度变化（从旧元素的bar获取）
                    const oldBar = oldPos.element.querySelector('.bar');
                    const newBar = newPos.element.querySelector('.bar');

                    let oldBarWidth, newBarWidth;

                    if (oldBar && newBar) {
                        oldBarWidth = parseFloat(oldBar.style.width);
                        newBarWidth = parseFloat(newBar.style.width);

                        // ⚠️ 立即将新元素的bar重置为旧宽度
                        // 这样动画会从旧宽度平滑增长到新宽度
                        newBar.style.width = `${oldBarWidth}%`;
                    }

                    animations.push({
                        type: 'move',
                        element: element,
                        deltaX: deltaX,
                        deltaY: deltaY,
                        oldBarWidth: oldBarWidth,
                        newBarWidth: newBarWidth
                    });
                    console.log(`  ✅ 需要移动动画 (柱状图: ${oldBarWidth}% → ${newBarWidth}%)`);
                } else {
                    console.log(`  ⏭️  位置未变，跳过`);
                }
            } else {
                // 新元素
                console.log('[ChartV2] 新元素:', modelName);
                animations.push({
                    type: 'enter',
                    element: element
                });
            }
        });

        // 找出离开的元素
        oldPositions.forEach((oldPos, modelName) => {
            if (!newPositions.has(modelName)) {
                console.log('[ChartV2] 离开元素:', modelName);
                animations.push({
                    type: 'leave',
                    element: oldPos.element
                });
            }
        });

        console.log('[ChartV2] 总动画数量:', animations.length);
        return animations;
    }

    /**
     * 更新DOM（复用现有元素，创建新元素，删除旧元素）
     */
    updateDOM(monthData, changes) {
        const { entering, leaving, staying } = changes;

        // ⚠️ 首次渲染时清空容器
        if (this.currentElements.size === 0) {
            this.container.innerHTML = '';
        } else {
            // ⚠️ 关键修复：非首次渲染时，锁定容器高度，避免新入/掉出导致的抖动
            const currentHeight = this.container.offsetHeight;
            this.container.style.height = `${currentHeight}px`;
            console.log(`[ChartV2] 锁定容器高度: ${currentHeight}px`);
        }

        // 按排名排序模型
        const sortedModels = [...monthData.models].sort((a, b) => a.rank - b.rank);

        // ⚠️ 关键改进：只创建新元素，不插入DOM（避免占位抖动）
        const newElementsMap = new Map();
        entering.forEach(modelName => {
            const model = sortedModels.find(m => m.name === modelName);
            if (model) {
                const index = sortedModels.indexOf(model);
                const row = this.createModelRow(model, index, false);
                row.dataset.modelName = model.name;
                // ⚠️ 不设置 display，保持初始的 opacity: 0 和 visibility: hidden
                newElementsMap.set(modelName, row);
            }
        });

        // 1. 删除离开的元素
        leaving.forEach(modelName => {
            const row = this.currentElements.get(modelName);
            if (row && row.parentNode === this.container) {
                this.container.removeChild(row);
            }
            this.currentElements.delete(modelName);
        });

        // 2. 更新现有元素的内容
        staying.forEach(modelName => {
            const row = this.currentElements.get(modelName);
            const model = sortedModels.find(m => m.name === modelName);
            if (row && model) {
                const index = sortedModels.indexOf(model);
                this.updateModelRow(row, model, index);
            }
        });

        // 3. ⚠️ 关键改进：不重新排序现有元素，避免在动画期间引起抖动
        // 保存排序信息，在动画完成后再应用
        this._pendingReorder = sortedModels.map(m => m.name);

        // 4. 保存新元素到Map，等待动画开始时插入
        this._pendingElements = newElementsMap;

        console.log(`[ChartV2] DOM更新完成，${entering.length}个新元素待插入，排序将在动画后应用`);
    }

    /**
     * 更新单行模型数据的内容
     */
    updateModelRow(row, model, index) {
        row.dataset.rank = model.rank;
        row.dataset.name = model.name;

        const rankEl = row.querySelector('.rank');
        if (rankEl) rankEl.textContent = model.rank;

        const barWidth = this.calculateBarWidth(model.elo);
        const barEl = row.querySelector('.bar');
        if (barEl) barEl.style.width = `${barWidth}%`;

        const nameEl = row.querySelector('.model-name');
        if (nameEl) nameEl.textContent = model.name;

        const color = this.getCompanyColor(model.organization);
        const companyEl = row.querySelector('.company');
        if (companyEl) {
            companyEl.textContent = COMPANY_NAMES_ZH[model.organization] || model.organization;
            companyEl.style.color = color;
        }

        const eloEl = row.querySelector('.elo');
        if (eloEl) eloEl.textContent = model.elo;
    }

    /**
     * 更新进度条
     */
    updateProgress(currentDate) {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');

        if (progressBar && progressText) {
            const startDate = new Date('2024-01-01');
            const currDate = new Date(currentDate + '-01');
            const monthDiff = (currDate.getFullYear() - startDate.getFullYear()) * 12 +
                             (currDate.getMonth() - startDate.getMonth()) + 1;

            const progress = (monthDiff / 24) * 100;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${monthDiff} / 24`;
        }
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        this.container.innerHTML = '<div class="loading"><div class="spinner"></div><p>加载数据中...</p></div>';
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        this.container.innerHTML = `
            <div class="error">
                <p style="color: #ff6b6b; text-align: center; padding: 2rem;">
                    ❌ ${message}
                </p>
            </div>
        `;
    }

    /**
     * 生成图例
     */
    generateLegend() {
        const legendContainer = document.querySelector('.legend-items');
        if (!legendContainer) return;

        const usedCompanies = new Set();
        const allCompanies = Object.keys(COMPANY_COLORS);
        allCompanies.forEach(company => {
            usedCompanies.add(company);
        });

        const legendHTML = Array.from(usedCompanies).map(company => {
            const color = COMPANY_COLORS[company];
            const name = COMPANY_NAMES_ZH[company] || company;

            return `
                <div class="legend-item">
                    <div class="legend-color" style="background: ${color};"></div>
                    <span>${name}</span>
                </div>
            `;
        }).join('');

        legendContainer.innerHTML = legendHTML;
    }

    /**
     * 生成时间轴
     */
    generateTimeline(totalMonths) {
        const timelineTrack = document.querySelector('.timeline-track');
        if (!timelineTrack) return;

        const markers = [];
        for (let i = 0; i < totalMonths; i++) {
            const date = new Date('2024-01-01');
            date.setMonth(date.getMonth() + i);
            const year = date.getFullYear();
            const isYearStart = date.getMonth() === 0;

            markers.push(`
                <div class="timeline-marker" data-month="${i}" data-year="${year}" ${isYearStart ? 'data-show-year="true"' : ''}></div>
            `);
        }

        timelineTrack.innerHTML = markers.join('');
    }

    /**
     * 更新时间轴高亮
     */
    updateTimeline(currentMonthIndex) {
        const markers = document.querySelectorAll('.timeline-marker');
        markers.forEach((marker, index) => {
            if (index === currentMonthIndex) {
                marker.classList.add('active');
            } else {
                marker.classList.remove('active');
            }
        });
    }
}

// 导出ChartV2类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChartV2, COMPANY_COLORS };
}
