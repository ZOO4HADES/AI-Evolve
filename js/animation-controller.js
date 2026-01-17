/**
 * Animation Controller - FLIP动画引擎
 * 实现平滑的DOM元素位置变换动画
 */

class AnimationController {
    constructor(options = {}) {
        this.isAnimating = false;
        this.animationDuration = options.duration || 1500; // 默认1500ms，更慢的动画
        this.debugMode = false; // 调试模式
    }

    /**
     * 执行FLIP动画（使用预捕获的位置数据）
     * @param {Map} oldPositions - 旧位置Map
     * @param {Map} newPositions - 新位置Map
     * @returns {Promise} 动画完成的Promise
     */
    async executeFlipAnimationWithData(oldPositions, newPositions) {
        if (this.isAnimating) {
            this._debug('动画正在进行中，跳过');
            return;
        }

        this.isAnimating = true;

        try {
            this._debug('First positions:', oldPositions);
            this._debug('Last positions:', newPositions);

            // Invert: 计算偏移并应用
            const animations = this.calculateInversionsFromData(oldPositions, newPositions);
            this._debug('Animations:', animations);

            if (animations.length > 0) {
                console.log('[FLIP] 执行', animations.length, '个动画');
                animations.forEach(anim => {
                    console.log(`[FLIP] ${anim.type}:`, anim.element.dataset.modelName,
                                'deltaY:', anim.deltaY, 'deltaX:', anim.deltaX);
                });
            }

            this.applyInversions(animations);

            // Play: 执行动画
            await this.playAnimations(animations);

            // 清理
            this.cleanup(animations);

        } finally {
            this.isAnimating = false;
        }
    }

    /**
     * 从位置数据计算偏移量
     * @param {Map} oldPositions - 初始位置
     * @param {Map} newPositions - 最终位置
     * @returns {Array} - 动画指令数组
     */
    calculateInversionsFromData(oldPositions, newPositions) {
        const animations = [];

        this._debug('计算位置差异...');
        this._debug('  旧位置数量:', oldPositions.size);
        this._debug('  新位置数量:', newPositions.size);

        // 找出保持不变的元素（通过dataset.modelName匹配）
        newPositions.forEach((newPos, newId) => {
            const element = newPos.element;
            const modelName = element.dataset.modelName;

            if (!modelName) {
                // 没有modelName的元素，视为新元素
                this._debug('  新元素(无modelName):', element);
                animations.push({
                    type: 'enter',
                    element: element,
                    from: null,
                    to: newPos
                });
                return;
            }

            // 在oldPositions中查找相同modelName的元素
            let oldPos = oldPositions.get(modelName);

            if (oldPos) {
                // 元素存在，计算移动距离
                const deltaY = oldPos.top - newPos.top;
                const deltaX = oldPos.left - newPos.left;

                this._debug(`  ${modelName}: 旧top=${oldPos.top.toFixed(1)} 新top=${newPos.top.toFixed(1)} deltaY=${deltaY.toFixed(1)}px`);

                if (Math.abs(deltaY) > 0.5 || Math.abs(deltaX) > 0.5) {
                    // 位置有变化，需要移动动画
                    animations.push({
                        type: 'move',
                        element: element,
                        from: oldPos,
                        to: newPos,
                        deltaX: deltaX,
                        deltaY: deltaY
                    });
                } else {
                    this._debug(`  位置未变: ${modelName}`);
                }
            } else {
                // 新元素
                this._debug('  新元素:', modelName);
                animations.push({
                    type: 'enter',
                    element: element,
                    from: null,
                    to: newPos
                });
            }
        });

        // 找出离开的元素
        oldPositions.forEach((oldPos, oldId) => {
            const element = oldPos.element;
            const modelName = element.dataset.modelName;

            if (!modelName) return;

            // 检查是否在新位置中存在
            let stillExists = false;
            newPositions.forEach((newPos, newId) => {
                if (newPos.element.dataset.modelName === modelName) {
                    stillExists = true;
                }
            });

            if (!stillExists) {
                // 元素离开了
                this._debug('  离开元素:', modelName);
                animations.push({
                    type: 'leave',
                    element: element,
                    from: oldPos,
                    to: null
                });
            }
        });

        return animations;
    }

    /**
     * 执行FLIP动画
     * @param {Array} oldElements - 旧的DOM元素数组
     * @param {Array} newElements - 新的DOM元素数组
     * @returns {Promise} 动画完成的Promise
     */
    async executeFlipAnimation(oldElements, newElements) {
        if (this.isAnimating) {
            this._debug('动画正在进行中，跳过');
            return;
        }

        this.isAnimating = true;

        try {
            // First: 记录旧元素位置
            const firstPositions = this.capturePositions(oldElements);
            this._debug('First positions:', firstPositions);

            // Last: 新位置已经渲染完成（在DOM中）
            const lastPositions = this.capturePositions(newElements);
            this._debug('Last positions:', lastPositions);

            // Invert: 计算偏移并应用
            const animations = this.calculateInversions(firstPositions, lastPositions);
            this._debug('Animations:', animations);

            if (animations.length > 0) {
                console.log('[FLIP] 执行', animations.length, '个动画');
                animations.forEach(anim => {
                    console.log(`[FLIP] ${anim.type}:`, anim.element.dataset.modelName,
                                'deltaY:', anim.deltaY, 'deltaX:', anim.deltaX);
                });
            }

            this.applyInversions(animations);

            // Play: 执行动画
            await this.playAnimations(animations);

            // 清理
            this.cleanup(animations);

        } finally {
            this.isAnimating = false;
        }
    }

    /**
     * 捕获元素位置信息
     * @param {Array} elements - DOM元素数组
     * @returns {Map} - Map<elementId, {top, left, width, height, element}>
     */
    capturePositions(elements) {
        const positions = new Map();

        elements.forEach(element => {
            if (!element) return;

            const rect = element.getBoundingClientRect();
            const id = this._getElementId(element);

            positions.set(id, {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                element: element
            });
        });

        return positions;
    }

    /**
     * 计算偏移量
     * @param {Map} firstPositions - 初始位置
     * @param {Map} lastPositions - 最终位置
     * @returns {Array} - 动画指令数组
     */
    calculateInversions(firstPositions, lastPositions) {
        const animations = [];

        this._debug('计算位置差异...');
        this._debug('  旧元素数量:', firstPositions.size);
        this._debug('  新元素数量:', lastPositions.size);

        // 找出保持不变的元素（通过dataset.modelName匹配）
        lastPositions.forEach((lastPos, lastId) => {
            const element = lastPos.element;
            const modelName = element.dataset.modelName;

            if (!modelName) {
                // 没有modelName的元素，视为新元素
                this._debug('  新元素(无modelName):', element);
                animations.push({
                    type: 'enter',
                    element: element,
                    from: null,
                    to: lastPos
                });
                return;
            }

            // 在firstPositions中查找相同modelName的元素
            let firstPos = null;
            firstPositions.forEach((pos, id) => {
                if (pos.element.dataset.modelName === modelName) {
                    firstPos = pos;
                }
            });

            if (firstPos) {
                // 元素存在，计算移动距离
                const deltaY = firstPos.top - lastPos.top;
                const deltaX = firstPos.left - lastPos.left;

                if (Math.abs(deltaY) > 0.5 || Math.abs(deltaX) > 0.5) {
                    // 位置有变化，需要移动动画
                    this._debug(`  移动: ${modelName} deltaY=${deltaY.toFixed(1)}px deltaX=${deltaX.toFixed(1)}px`);
                    animations.push({
                        type: 'move',
                        element: element,
                        from: firstPos,
                        to: lastPos,
                        deltaX: deltaX,
                        deltaY: deltaY
                    });
                } else {
                    this._debug(`  位置未变: ${modelName}`);
                }
            } else {
                // 新元素
                this._debug('  新元素:', modelName);
                animations.push({
                    type: 'enter',
                    element: element,
                    from: null,
                    to: lastPos
                });
            }
        });

        // 找出离开的元素
        firstPositions.forEach((firstPos, firstId) => {
            const element = firstPos.element;
            const modelName = element.dataset.modelName;

            if (!modelName) return;

            // 检查是否在新位置中存在
            let stillExists = false;
            lastPositions.forEach((lastPos, lastId) => {
                if (lastPos.element.dataset.modelName === modelName) {
                    stillExists = true;
                }
            });

            if (!stillExists) {
                // 元素离开了
                animations.push({
                    type: 'leave',
                    element: element,
                    from: firstPos,
                    to: null
                });
            }
        });

        return animations;
    }

    /**
     * 应用偏移（Invert阶段）
     * @param {Array} animations - 动画指令数组
     */
    applyInversions(animations) {
        console.log('[FLIP] 应用偏移...');
        animations.forEach(animation => {
            const element = animation.element;
            if (!element) return;

            if (animation.type === 'move') {
                // ⚠️ 关键：先添加flip-moving类（包含transition属性）
                // 必须在设置transform之前添加，否则transition不会生效
                element.classList.add('flip-moving');

                // 验证 transition 是否设置成功
                const computedStyle = window.getComputedStyle(element);
                console.log(`[FLIP] ${element.dataset.modelName} transition:`, computedStyle.transition);

                // 移动动画：应用反向transform，使其看起来还在原位置
                // 使用 translate3d 确保GPU加速
                element.style.transform = `translate3d(${animation.deltaX}px, ${animation.deltaY}px, 0)`;
                console.log(`[FLIP] 应用transform到 ${animation.element.dataset.modelName}: translate3d(${animation.deltaX.toFixed(1)}px, ${animation.deltaY.toFixed(1)}px, 0)`);
            } else if (animation.type === 'enter') {
                // 进入动画：设置初始状态
                element.classList.add('flip-enter');
                console.log(`[FLIP] 添加flip-enter到 ${animation.element.dataset.modelName}`);
            } else if (animation.type === 'leave') {
                // 离开动画：标记为即将离开
                element.classList.add('flip-leave');
                console.log(`[FLIP] 添加flip-leave到 ${animation.element.dataset.modelName}`);
            }
        });

        // ⚠️ 关键：在所有transform都设置完后，统一强制回流
        // 确保浏览器已经渲染了所有transform的初始状态
        void document.body.offsetHeight;
        console.log('[FLIP] 偏移应用完成');
    }

    /**
     * 执行动画（Play阶段）
     * @param {Array} animations - 动画指令数组
     * @returns {Promise} - 动画完成的Promise
     */
    playAnimations(animations) {
        return new Promise(resolve => {
            console.log('[FLIP] 开始播放动画...');

            // 下一帧开始动画
            requestAnimationFrame(() => {
                animations.forEach(animation => {
                    const element = animation.element;
                    if (!element) return;

                    if (animation.type === 'move') {
                        // ⚠️ 关键：使用显式的 transform 值，而不是空字符串
                        // 从 translate3d(deltaX, deltaY, 0) 过渡到 translate3d(0, 0, 0)
                        // 这样可以正确触发 CSS transition
                        element.style.transform = 'translate3d(0, 0, 0)';
                        console.log(`[FLIP] 移动到最终位置: ${element.dataset.modelName}`);
                    } else if (animation.type === 'enter') {
                        // 进入动画：移除flip-enter，添加flip-enter-active
                        element.classList.remove('flip-enter');
                        element.classList.add('flip-enter-active');
                        console.log(`[FLIP] 进入动画: ${element.dataset.modelName}`);
                    } else if (animation.type === 'leave') {
                        // 离开动画：添加flip-leave-active
                        element.classList.add('flip-leave-active');
                        console.log(`[FLIP] 离开动画: ${element.dataset.modelName}`);
                    }
                });

                console.log('[FLIP] 动画已触发，等待', this.animationDuration, 'ms...');

                // 等待动画完成
                setTimeout(() => {
                    console.log('[FLIP] 动画完成');
                    resolve();
                }, this.animationDuration);
            });
        });
    }

    /**
     * 清理动画类
     * @param {Array} animations - 动画指令数组
     */
    cleanup(animations) {
        animations.forEach(animation => {
            const element = animation.element;
            if (!element) return;

            // 移除所有FLIP相关类
            element.classList.remove('flip-moving', 'flip-enter', 'flip-enter-active', 'flip-leave', 'flip-leave-active');
        });
    }

    /**
     * 获取元素的唯一标识
     * @param {HTMLElement} element - DOM元素
     * @returns {string} - 元素ID
     */
    _getElementId(element) {
        // 使用dataset.modelName作为唯一标识
        return element.dataset.modelName || `element-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 调试输出
     */
    _debug(...args) {
        if (this.debugMode) {
            console.log('[AnimationController]', ...args);
        }
    }

    /**
     * 设置动画时长
     */
    setDuration(duration) {
        this.animationDuration = duration;
    }
}

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AnimationController };
}
