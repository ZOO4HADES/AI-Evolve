/**
 * State Manager V4 - 改进的状态管理器
 * 核心改进：标准化模型名称，确保准确匹配
 */

class V4StateManager {
    constructor() {
        this.currentModels = new Map(); // Map<normalizedName, modelData>
        this.modelNameMapping = new Map(); // Map<normalizedName, displayName>
    }

    /**
     * 标准化模型名称（去除可能影响匹配的字符）
     * 例如：Claude Opus 4.5 (thinking-32k) -> claude opus 4.5
     */
    normalizeName(name) {
        return name.toLowerCase()
            .replace(/\s*\(.*?\)\s*/g, '')  // 移除括号内容，如 (thinking-32k)
            .replace(/\s+/g, ' ')           // 标准化空格
            .trim();
    }

    /**
     * 计算两个月份之间的变化
     * 返回: { entering, leaving, staying }
     */
    computeDiff(newMonthData) {
        const newModels = new Set();
        const entering = [];
        const leaving = [];
        const staying = [];

        // 标准化新月份的所有模型名称
        newMonthData.models.forEach(model => {
            const normalizedName = this.normalizeName(model.name);
            newModels.add(normalizedName);

            if (!this.currentModels.has(normalizedName)) {
                entering.push(model.name);
                console.log(`[V4StateManager] 新模型: ${model.name} (标准化: ${normalizedName})`);
            } else {
                staying.push(model.name);
                console.log(`[V4StateManager] 保留模型: ${model.name}`);
            }
        });

        // 找出离开的模型
        this.currentModels.forEach((modelData, normalizedName) => {
            if (!newModels.has(normalizedName)) {
                leaving.push(modelData.originalName);
                console.log(`[V4StateManager] 离开模型: ${modelData.originalName} (标准化: ${normalizedName})`);
            }
        });

        console.log(`[V4StateManager] 变化统计 - 进入: ${entering.length}, 保留: ${staying.length}, 离开: ${leaving.length}`);

        return {
            entering: entering.map(name => this.normalizeName(name)),
            leaving: leaving.map(name => this.normalizeName(name)),
            staying: staying.map(name => this.normalizeName(name)),
            enteringOriginal: entering,
            leavingOriginal: leaving,
            stayingOriginal: staying
        };
    }

    /**
     * 更新当前状态
     */
    updateState(newMonthData) {
        // 先计算差异
        const diff = this.computeDiff(newMonthData);

        // 更新当前模型映射
        this.currentModels.clear();
        this.modelNameMapping.clear();

        newMonthData.models.forEach(model => {
            const normalizedName = this.normalizeName(model.name);
            this.currentModels.set(normalizedName, {
                ...model,
                normalizedName: normalizedName
            });
            this.modelNameMapping.set(normalizedName, model.name);
        });

        return diff;
    }

    /**
     * 根据标准化名称获取原始名称
     */
    getOriginalName(normalizedName) {
        return this.modelNameMapping.get(normalizedName) || normalizedName;
    }

    /**
     * 检查模型是否存在
     */
    hasModel(name) {
        const normalizedName = this.normalizeName(name);
        return this.currentModels.has(normalizedName);
    }

    /**
     * 获取模型数据
     */
    getModel(name) {
        const normalizedName = this.normalizeName(name);
        return this.currentModels.get(normalizedName);
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { V4StateManager };
}
