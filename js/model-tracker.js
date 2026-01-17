/**
 * Model Tracker - 模型状态追踪器
 * 追踪模型在月份之间的变化（进入/离开/保持）
 */

/**
 * ModelState - 单个模型的状态
 */
class ModelState {
    constructor(modelData) {
        this.name = modelData.name;
        this.rank = modelData.rank;
        this.elo = modelData.elo;
        this.organization = modelData.organization;
        this.element = null; // DOM元素引用
    }

    /**
     * 更新模型数据
     */
    update(newData) {
        this.rank = newData.rank;
        this.elo = newData.elo;
        // organization 通常不变，但如果有需要可以更新
        if (newData.organization) {
            this.organization = newData.organization;
        }
    }

    /**
     * 绑定DOM元素
     */
    bindElement(element) {
        this.element = element;
        // 存储模型名称到 dataset，便于调试
        if (element) {
            element.dataset.modelName = this.name;
        }
    }

    /**
     * 获取DOM元素
     */
    getElement() {
        return this.element;
    }

    /**
     * 清除DOM元素引用
     */
    unbindElement() {
        this.element = null;
    }
}

/**
 * ModelTracker - 追踪所有模型的状态变化
 */
class ModelTracker {
    constructor() {
        // Map<modelName, ModelState>
        this.modelsByName = new Map();
    }

    /**
     * 更新模型状态，返回变化分类
     * @param {Object} monthData - 新月份的数据 {date, models: [...]}
     * @returns {Object} {entering: [], leaving: [], staying: []}
     */
    update(monthData) {
        // 获取新旧模型名称集合
        const currentNames = new Set(monthData.models.map(m => m.name));
        const previousNames = new Set(this.modelsByName.keys());

        // 分类模型
        const entering = [...currentNames].filter(n => !previousNames.has(n));
        const leaving = [...previousNames].filter(n => !currentNames.has(n));
        const staying = [...currentNames].filter(n => previousNames.has(n));

        // 更新或创建状态
        monthData.models.forEach(model => {
            let state = this.modelsByName.get(model.name);

            if (!state) {
                // 新模型，创建状态
                state = new ModelState(model);
                this.modelsByName.set(model.name, state);
            } else {
                // 已存在的模型，更新状态
                state.update(model);
            }
        });

        // 清理离开的模型
        leaving.forEach(name => {
            const state = this.modelsByName.get(name);
            if (state) {
                state.unbindElement(); // 清除DOM引用
                this.modelsByName.delete(name);
            }
        });

        return {
            entering,  // 新进入榜单的模型名称数组
            leaving,   // 离开榜单的模型名称数组
            staying    // 保持在榜单的模型名称数组
        };
    }

    /**
     * 获取模型状态
     * @param {string} modelName - 模型名称
     * @returns {ModelState|null}
     */
    getState(modelName) {
        return this.modelsByName.get(modelName) || null;
    }

    /**
     * 获取所有当前模型的状态
     * @returns {Array<ModelState>}
     */
    getAllStates() {
        return Array.from(this.modelsByName.values());
    }

    /**
     * 重置所有状态（用于重新开始）
     */
    reset() {
        this.modelsByName.forEach(state => state.unbindElement());
        this.modelsByName.clear();
    }

    /**
     * 获取当前追踪的模型数量
     */
    get size() {
        return this.modelsByName.size;
    }
}

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModelTracker, ModelState };
}
