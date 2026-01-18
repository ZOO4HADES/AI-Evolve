/**
 * Chart Renderer V4 - 改进的图表渲染器
 * 核心改进：精确的位置捕获和 DOM 更新顺序
 */

// 公司颜色映射（复用 V3）
const COMPANY_COLORS_V4 = {
    'OpenAI': '#10a37f',
    'Anthropic': '#d97757',
    'Google': '#4285f4',
    'xAI': '#00F0FF',
    'Alibaba': '#ff6a00',
    'Z.ai': '#8b5cf6',
    'Baidu': '#2932e1',
    'Moonshot': '#1a1a2e',
    'Meta': '#1877f2',
    'Mistral': '#ff6b35',
    'LMSYS': '#6366f1',
    'DeepSeek': '#4d6bf5'
};

// 中文公司名称映射
const COMPANY_NAMES_ZH_V4 = {
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
    'LMSYS': 'LMSYS',
    'DeepSeek': '深度求索'
};

/**
 * Chart V4 类
 */
class ChartV4 {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container #${containerId} not found`);
        }

        // 初始化状态管理器和动画引擎
        this.stateManager = new V4StateManager();
        this.animationEngine = new V4AnimationEngine({
            duration: 1500
        });

        // 当前渲染的模型元素映射（使用标准化名称）
        this.currentElements = new Map(); // Map<normalizedName, element>
        this.displayNameMap = new Map(); // Map<normalizedName, displayName>
    }

    /**
     * 标准化模型名称
     */
    normalizeName(name) {
        return name.toLowerCase()
            .replace(/\s*\(.*?\)\s*/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * 获取公司颜色
     */
    getCompanyColor(organization) {
        return COMPANY_COLORS_V4[organization] || '#888888';
    }

    /**
     * 计算柱状图宽度
     */
    calculateBarWidth(elo) {
        const minElo = 1000;
        const maxElo = 1500;
        const minWidth = 30;
        const maxWidth = 100;

        const percentage = (elo - minElo) / (maxElo - minElo);
        const width = minWidth + percentage * (maxWidth - minWidth);

        return width;
    }

    /**
     * 格式化日期
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
    createModelRow(model, index) {
        const row = document.createElement('div');
        row.className = 'model-row';
        row.dataset.rank = model.rank;
        row.dataset.name = model.name;

        const normalizedName = this.normalizeName(model.name);
        row.dataset.normalizedName = normalizedName;

        const barWidth = this.calculateBarWidth(model.elo);
        const color = this.getCompanyColor(model.organization);

        row.innerHTML = `
            <span class="rank">${model.rank}</span>
            <div class="bar-container">
                <div class="bar" style="width: ${barWidth}%; background: ${color};"></div>
            </div>
            <span class="model-name">${model.name}</span>
            <span class="elo">${model.elo}</span>
            <span class="company" style="color: ${color}">${COMPANY_NAMES_ZH_V4[model.organization] || model.organization}</span>
        `;

        return row;
    }

    /**
     * ⚠️ 核心渲染方法：改进的位置捕获和动画
     */
    async renderMonth(monthData) {
        console.log('[ChartV4] ========================================');
        console.log(`[ChartV4] 开始渲染: ${monthData.date}`);
        console.log('[ChartV4] ========================================');

        // ⚠️ 步骤 1: 在 DOM 更新前捕获旧位置
        const oldElements = Array.from(this.currentElements.values());
        const oldPositions = new Map();

        oldElements.forEach(element => {
            if (!element || !element.parentNode) return;

            const rect = element.getBoundingClientRect();
            const normalizedName = element.dataset.normalizedName;
            const displayName = element.dataset.name;

            if (normalizedName) {
                oldPositions.set(normalizedName, {
                    top: rect.top,
                    left: rect.left,
                    element: element,
                    rank: parseInt(element.dataset.rank),
                    displayName: displayName
                });
                console.log(`[ChartV4] 捕获旧位置: ${displayName} (排名${element.dataset.rank}, top=${rect.top.toFixed(1)}px)`);
            }
        });

        // ⚠️ 步骤 2: 更新状态（计算差异）
        const diff = this.stateManager.updateState(monthData);

        // ⚠️ 步骤 3: 更新 DOM
        this.updateDOM(monthData, diff);

        // ⚠️ 步骤 4: 捕获新位置（DOM 更新后，重新排序前）
        const sortedModels = [...monthData.models].sort((a, b) => a.rank - b.rank);
        const newPositions = new Map();

        // 强制回流
        void this.container.offsetHeight;

        sortedModels.forEach(model => {
            const normalizedName = this.normalizeName(model.name);
            const element = this.currentElements.get(normalizedName);

            if (element && element.parentNode) {
                const rect = element.getBoundingClientRect();
                newPositions.set(normalizedName, {
                    top: rect.top,
                    left: rect.left,
                    element: element,
                    rank: model.rank,
                    displayName: model.name
                });
                console.log(`[ChartV4] 捕获新位置: ${model.name} (排名${model.rank}, top=${rect.top.toFixed(1)}px)`);
            }
        });

        // ⚠️ 步骤 5: 重新排序 DOM
        this.reorderDOM(sortedModels);

        // ⚠️ 步骤 6: 计算动画指令
        const animations = this.animationEngine.calculateAnimations(oldPositions, newPositions);

        // ⚠️ 步骤 7: 执行动画
        await this.animationEngine.executeAnimations(animations);

        // ⚠️ 步骤 8: 清理离开的元素
        this.cleanupLeavingElements(diff.leavingOriginal);

        // 更新月份显示
        const monthDisplay = document.getElementById('currentMonth');
        if (monthDisplay) {
            monthDisplay.textContent = this.formatDate(monthData.date);
        }

        console.log(`[ChartV4] ✓ 渲染完成: ${monthData.date}`);
    }

    /**
     * 更新 DOM
     */
    updateDOM(monthData, diff) {
        const { enteringOriginal, leavingOriginal, stayingOriginal } = diff;

        console.log(`[ChartV4] 更新DOM - 进入: ${enteringOriginal.length}, 保留: ${stayingOriginal.length}, 离开: ${leavingOriginal.length}`);

        // ⚠️ 首次渲染时清空容器
        if (this.currentElements.size === 0) {
            this.container.innerHTML = '';
            console.log('[ChartV4] 首次渲染，清空容器');
        }

        const sortedModels = [...monthData.models].sort((a, b) => a.rank - b.rank);

        // 创建新元素（但不插入）
        const newElementsMap = new Map();
        enteringOriginal.forEach(modelName => {
            const model = sortedModels.find(m => m.name === modelName);
            if (model) {
                const row = this.createModelRow(model);
                newElementsMap.set(model.name, row);
            }
        });

        // 删除离开的元素（但不删除，只是从 currentElements 移除引用）
        // 离开动画会在动画完成后删除
        leavingOriginal.forEach(modelName => {
            const normalizedName = this.normalizeName(modelName);
            const element = this.currentElements.get(normalizedName);
            if (element) {
                console.log(`[ChartV4] 标记离开元素: ${modelName}`);
            }
        });

        // 更新保留元素的内容
        stayingOriginal.forEach(modelName => {
            const model = sortedModels.find(m => m.name === modelName);
            if (model) {
                const normalizedName = this.normalizeName(modelName);
                const element = this.currentElements.get(normalizedName);
                if (element && model) {
                    this.updateModelRow(element, model);
                }
            }
        });

        // 插入新元素
        newElementsMap.forEach((row, modelName) => {
            const normalizedName = this.normalizeName(modelName);
            const model = sortedModels.find(m => m.name === modelName);

            if (model) {
                // 找到正确的插入位置
                let referenceNode = null;
                for (const m of sortedModels) {
                    if (m.rank > model.rank) {
                        const refNormalizedName = this.normalizeName(m.name);
                        const existingRow = this.currentElements.get(refNormalizedName);
                        if (existingRow && existingRow.parentNode === this.container) {
                            referenceNode = existingRow;
                            break;
                        }
                    }
                }

                this.container.insertBefore(row, referenceNode);
                this.currentElements.set(normalizedName, row);
                this.displayNameMap.set(normalizedName, modelName);
                console.log(`[ChartV4] 插入新元素: ${modelName} (排名${model.rank})`);
            }
        });
    }

    /**
     * 重新排序 DOM
     */
    reorderDOM(sortedModels) {
        console.log('[ChartV4] 重新排序 DOM');
        let referenceNode = this.container.firstChild;

        sortedModels.forEach(model => {
            const normalizedName = this.normalizeName(model.name);
            const row = this.currentElements.get(normalizedName);
            if (row && row.parentNode === this.container) {
                this.container.insertBefore(row, referenceNode);
                referenceNode = row.nextSibling;
            }
        });
    }

    /**
     * 更新单行模型数据的内容
     */
    updateModelRow(row, model) {
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
            companyEl.textContent = COMPANY_NAMES_ZH_V4[model.organization] || model.organization;
            companyEl.style.color = color;
        }

        const eloEl = row.querySelector('.elo');
        if (eloEl) eloEl.textContent = model.elo;
    }

    /**
     * 清理离开的元素
     */
    cleanupLeavingElements(leavingModels) {
        leavingModels.forEach(modelName => {
            const normalizedName = this.normalizeName(modelName);
            const row = this.currentElements.get(normalizedName);
            if (row && row.parentNode === this.container) {
                this.container.removeChild(row);
                console.log(`[ChartV4] 删除离开元素: ${modelName}`);
            }
            this.currentElements.delete(normalizedName);
            this.displayNameMap.delete(normalizedName);
        });
    }

    /**
     * 生成图例
     */
    generateLegend() {
        const legendContainer = document.querySelector('.legend-items');
        if (!legendContainer) return;

        const usedCompanies = new Set();
        const allCompanies = Object.keys(COMPANY_COLORS_V4);
        allCompanies.forEach(company => {
            usedCompanies.add(company);
        });

        const legendHTML = Array.from(usedCompanies).map(company => {
            const color = COMPANY_COLORS_V4[company];
            const name = COMPANY_NAMES_ZH_V4[company] || company;

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
            const date = new Date('2025-01-01');
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
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChartV4, COMPANY_COLORS_V4 };
}
