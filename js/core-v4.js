/**
 * Core Animation Engine V4 - 核心动画引擎
 * 核心改进：精确的位置捕获和动画指令计算
 */

class V4AnimationEngine {
    constructor(options = {}) {
        this.animationDuration = options.duration || 1500;
        this.fps = 60;
    }

    /**
     * 缓动函数
     */
    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * 计算动画指令
     */
    calculateAnimations(oldPositions, newPositions, oldModelNames, newModelNames) {
        const animations = [];

        console.log('[V4AnimationEngine] ========== 计算动画指令 ==========');
        console.log('[V4AnimationEngine] 旧位置数量:', oldPositions.size);
        console.log('[V4AnimationEngine] 新位置数量:', newPositions.size);

        // 使用标准化名称进行匹配
        newPositions.forEach((newPos, normalizedName) => {
            const oldPos = oldPositions.get(normalizedName);

            if (oldPos) {
                // 模型存在，计算变化
                const deltaY = oldPos.top - newPos.top;
                const deltaX = oldPos.left - newPos.left;
                const rankChanged = oldPos.rank !== newPos.rank;

                console.log(`[V4AnimationEngine] ${newPos.displayName || normalizedName}:`);
                console.log(`  旧排名: ${oldPos.rank}, 新排名: ${newPos.rank}, 排名变化: ${rankChanged ? '是' : '否'}`);
                console.log(`  旧top: ${oldPos.top.toFixed(1)}px, 新top: ${newPos.top.toFixed(1)}px`);
                console.log(`  deltaY: ${deltaY.toFixed(1)}px, deltaX: ${deltaX.toFixed(1)}px`);

                // ⚠️ V4 关键：同时检查排名变化和位置变化
                // 只要排名变化且位置有明显变化（> 1px），就执行移动动画
                if (rankChanged && Math.abs(deltaY) > 1) {
                    animations.push({
                        type: 'move',
                        element: newPos.element,
                        displayName: newPos.displayName || normalizedName,
                        deltaX: deltaX,
                        deltaY: deltaY,
                        oldRank: oldPos.rank,
                        newRank: newPos.rank
                    });
                    console.log(`  ✅ 需要移动动画`);
                } else if (!rankChanged && Math.abs(deltaY) > 0.5) {
                    // 排名不变但有位置变化，记录但不移动（可能是其他元素进出导致）
                    console.log(`  ⚠️ 排名不变但有位置变化 (${deltaY.toFixed(1)}px)，不执行移动动画`);
                } else {
                    console.log(`  ⏭️ 无需动画`);
                }
            } else {
                // 新模型
                console.log(`[V4AnimationEngine] 新模型: ${newPos.displayName || normalizedName}`);
                animations.push({
                    type: 'enter',
                    element: newPos.element,
                    displayName: newPos.displayName || normalizedName
                });
            }
        });

        // 找出离开的模型
        oldPositions.forEach((oldPos, normalizedName) => {
            if (!newPositions.has(normalizedName)) {
                console.log(`[V4AnimationEngine] 离开模型: ${oldPos.displayName || normalizedName}`);
                animations.push({
                    type: 'leave',
                    element: oldPos.element,
                    displayName: oldPos.displayName || normalizedName
                });
            }
        });

        console.log(`[V4AnimationEngine] 总动画数量: ${animations.length}`);
        return animations;
    }

    /**
     * 执行动画
     */
    async executeAnimations(animations) {
        if (animations.length === 0) {
            console.log('[V4AnimationEngine] 无需执行的动画');
            return;
        }

        return new Promise((resolve) => {
            const startTime = performance.now();
            const moveAnimations = animations.filter(a => a.type === 'move');
            const enterAnimations = animations.filter(a => a.type === 'enter');
            const leaveAnimations = animations.filter(a => a.type === 'leave');

            console.log(`[V4AnimationEngine] 开始执行动画 - 移动: ${moveAnimations.length}, 进入: ${enterAnimations.length}, 离开: ${leaveAnimations.length}`);

            // 应用初始状态
            this.applyInitialState(animations);

            // 动画循环
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / this.animationDuration, 1);
                const easedProgress = this.easeInOutCubic(progress);

                let allComplete = true;

                // 更新移动动画
                moveAnimations.forEach(anim => {
                    const currentX = anim.deltaX * (1 - easedProgress);
                    const currentY = anim.deltaY * (1 - easedProgress);
                    anim.element.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

                    if (progress < 1) allComplete = false;
                });

                // 更新进入动画
                enterAnimations.forEach(anim => {
                    anim.element.style.opacity = easedProgress.toString();

                    if (progress < 1) allComplete = false;
                });

                // 更新离开动画
                leaveAnimations.forEach(anim => {
                    anim.element.style.opacity = (1 - easedProgress).toString();
                    const moveDown = easedProgress * 200; // 向下移动 200px
                    anim.element.style.transform = `translateY(${moveDown}px)`;

                    if (progress < 1) allComplete = false;
                });

                if (!allComplete) {
                    requestAnimationFrame(animate);
                } else {
                    // 清理
                    this.cleanup(animations);
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }

    /**
     * 应用初始动画状态
     */
    applyInitialState(animations) {
        animations.forEach(anim => {
            if (anim.type === 'move') {
                // 应用初始 transform，让元素看起来还在旧位置
                anim.element.style.transform = `translate3d(${anim.deltaX}px, ${anim.deltaY}px, 0)`;
                console.log(`[V4AnimationEngine] 初始状态 - ${anim.displayName}: translate3d(${anim.deltaX.toFixed(1)}px, ${anim.deltaY.toFixed(1)}px, 0)`);
            } else if (anim.type === 'enter') {
                anim.element.style.opacity = '0';
            } else if (anim.type === 'leave') {
                anim.element.style.opacity = '1';
            }
        });
    }

    /**
     * 清理动画
     */
    cleanup(animations) {
        animations.forEach(anim => {
            if (anim.element) {
                anim.element.style.transform = '';
                anim.element.style.opacity = '';
                anim.element.style.transition = '';
            }
        });
        console.log('[V4AnimationEngine] 动画清理完成');
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { V4AnimationEngine };
}
