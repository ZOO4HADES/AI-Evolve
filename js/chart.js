/**
 * Chart Renderer - 柱状图渲染引擎
 * 负责将数据渲染为横向柱状图
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
 * Chart类 - 柱状图渲染器
 */
class Chart {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container #${containerId} not found`);
        }

        // 初始化ModelTracker和AnimationController
        this.modelTracker = new ModelTracker();
        this.animationController = new AnimationController({
            duration: 1500 // 1500ms动画时长，更平滑
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
     * Elo范围: 1000-1500
     * 宽度范围: 40%-95%
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
                <span class="company" style="color: ${color}">${COMPANY_NAMES_ZH[model.organization] || model.organization}</span>
                <span class="elo">${model.elo}</span>
            </div>
        `;

        return row;
    }

    /**
     * 使用FLIP动画渲染月份数据（新方法）
     */
    async renderMonthWithFlip(monthData) {
        // ⚠️ 关键修复：在DOM更新前捕获旧位置！
        const oldElements = Array.from(this.currentElements.values());
        const oldPositions = new Map();

        oldElements.forEach(element => {
            if (!element) return;
            const rect = element.getBoundingClientRect();
            const id = element.dataset.modelName || `temp-${Math.random()}`;
            oldPositions.set(id, {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                element: element
            });
        });

        // 更新模型追踪器
        const changes = this.modelTracker.update(monthData);

        // 更新DOM（复用、创建、删除）
        this.updateDOM(monthData, changes);

        // ⚠️ 关键：强制浏览器回流，确保DOM更新后重新计算布局
        void this.container.offsetHeight;

        // 获取新位置
        const newElements = Array.from(this.currentElements.values());
        const newPositions = new Map();

        newElements.forEach(element => {
            if (!element) return;
            const rect = element.getBoundingClientRect();
            const id = element.dataset.modelName || `temp-${Math.random()}`;
            newPositions.set(id, {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                element: element
            });
        });

        // 执行FLIP动画（传入位置数据）
        await this.animationController.executeFlipAnimationWithData(oldPositions, newPositions);

        // 更新月份显示
        const monthDisplay = document.getElementById('currentMonth');
        if (monthDisplay) {
            monthDisplay.textContent = this.formatDate(monthData.date);
        }

        // 更新进度条
        this.updateProgress(monthData.date);
    }

    /**
     * 更新DOM（复用现有元素，创建新元素，删除旧元素）
     */
    updateDOM(monthData, changes) {
        const { entering, leaving, staying } = changes;

        // ⚠️ 关键修复：首次渲染时清空容器（移除"加载数据中..."提示）
        if (this.currentElements.size === 0) {
            this.container.innerHTML = '';
        }

        // 按排名排序模型
        const sortedModels = [...monthData.models].sort((a, b) => a.rank - b.rank);

        // 1. 删除离开的元素
        leaving.forEach(modelName => {
            const row = this.currentElements.get(modelName);
            if (row && row.parentNode === this.container) {
                this.container.removeChild(row);
            }
            this.currentElements.delete(modelName);
        });

        // 2. 创建新元素（暂存到临时Map）
        const newElementsMap = new Map();
        entering.forEach(modelName => {
            const model = sortedModels.find(m => m.name === modelName);
            if (model) {
                const index = sortedModels.indexOf(model);
                const row = this.createModelRow(model, index, false);
                row.dataset.modelName = model.name;
                newElementsMap.set(modelName, row);
            }
        });

        // 3. 更新现有元素的内容
        staying.forEach(modelName => {
            const row = this.currentElements.get(modelName);
            const model = sortedModels.find(m => m.name === modelName);
            if (row && model) {
                const index = sortedModels.indexOf(model);
                this.updateModelRow(row, model, index);
            }
        });

        // 4. 按正确顺序重新排列元素（不销毁任何DOM）
        // 获取容器中当前的第一个子元素作为参考点
        let referenceNode = this.container.firstChild;

        sortedModels.forEach((model) => {
            let row = this.currentElements.get(model.name);

            // 如果是新元素，从临时Map获取
            if (!row) {
                row = newElementsMap.get(model.name);
                if (row) {
                    this.currentElements.set(model.name, row);
                }
            }

            if (row) {
                // 如果元素已经在DOM中，移到正确位置
                if (row.parentNode === this.container) {
                    this.container.insertBefore(row, referenceNode);
                } else {
                    // 新元素，插入到正确位置
                    this.container.insertBefore(row, referenceNode);
                }
                // 更新参考点为当前元素
                referenceNode = row.nextSibling;
            }
        });

        // 5. 清理临时Map
        newElementsMap.clear();
    }

    /**
     * 更新单行模型数据的内容
     */
    updateModelRow(row, model, index) {
        // 更新data属性
        row.dataset.rank = model.rank;
        row.dataset.name = model.name;

        // 更新排名
        const rankEl = row.querySelector('.rank');
        if (rankEl) rankEl.textContent = model.rank;

        // 更新柱状图宽度
        const barWidth = this.calculateBarWidth(model.elo);
        const barEl = row.querySelector('.bar');
        if (barEl) barEl.style.width = `${barWidth}%`;

        // 更新模型名称（可能变化）
        const nameEl = row.querySelector('.model-name');
        if (nameEl) nameEl.textContent = model.name;

        // 更新公司颜色
        const color = this.getCompanyColor(model.organization);
        const companyEl = row.querySelector('.company');
        if (companyEl) {
            companyEl.textContent = COMPANY_NAMES_ZH[model.organization] || model.organization;
            companyEl.style.color = color;
        }

        // 更新Elo评分
        const eloEl = row.querySelector('.elo');
        if (eloEl) eloEl.textContent = model.elo;
    }

    /**
     * 渲染单个月份的数据（旧方法，保留用于首次渲染）
     */
    renderMonth(monthData) {
        // 清空现有内容
        this.container.innerHTML = '';
        this.currentElements.clear();
        this.modelTracker.reset(); // 重置模型追踪器

        // 按排名排序
        const sortedModels = [...monthData.models].sort((a, b) => a.rank - b.rank);

        // 渲染每一行（首次加载使用initial-load类）
        sortedModels.forEach((model, index) => {
            const row = this.createModelRow(model, index, true); // isInitialLoad = true
            row.dataset.modelName = model.name; // 设置标识
            this.container.appendChild(row);
            this.currentElements.set(model.name, row);
        });

        // ⚠️ 重要：初始化模型追踪器
        this.modelTracker.update(monthData);

        // 更新月份显示
        const monthDisplay = document.getElementById('currentMonth');
        if (monthDisplay) {
            monthDisplay.textContent = this.formatDate(monthData.date);
        }

        // 更新进度条
        this.updateProgress(monthData.date);
    }

    /**
     * 更新进度条
     */
    updateProgress(currentDate) {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');

        if (progressBar && progressText) {
            // 计算当前月份索引
            const startDate = new Date('2024-01-01');
            const currDate = new Date(currentDate + '-01');
            const monthDiff = (currDate.getFullYear() - startDate.getFullYear()) * 12 +
                             (currDate.getMonth() - startDate.getMonth()) + 1;

            // 更新进度条
            const progress = (monthDiff / 24) * 100;
            progressBar.style.width = `${progress}%`;

            // 更新进度文本
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

        // 获取所有使用的公司（去重）
        const usedCompanies = new Set();

        // 从最后一个月的数据中提取公司
        const allCompanies = Object.keys(COMPANY_COLORS);
        allCompanies.forEach(company => {
            usedCompanies.add(company);
        });

        // 生成图例HTML
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

// 导出Chart类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Chart, COMPANY_COLORS };
}
