/**
 * Pixel-Perfect Animator - 像素级动画引擎
 * 使用 requestAnimationFrame 实现逐帧平滑移动
 */

class PixelAnimator {
    constructor(options = {}) {
        this.animationDuration = options.duration || 1500; // 毫秒
        this.fps = 60; // 目标帧率
        this.frameInterval = 1000 / this.fps; // 每帧间隔（毫秒）
    }

    /**
     * 缓动函数：easeInOutCubic
     * 提供平滑的加速和减速效果
     */
    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * 执行像素级移动动画
     * @param {Array} animations - 动画指令数组
     * @returns {Promise} - 动画完成的Promise
     */
    async executePixelAnimations(animations) {
        if (animations.length === 0) {
            return;
        }

        console.log('[PixelAnimator] 开始执行', animations.length, '个像素级动画');

        return new Promise((resolve) => {
            const startTime = performance.now();
            const moveAnimations = animations.filter(a => a.type === 'move');
            const widthChangeAnimations = animations.filter(a => a.type === 'width-change'); // V3新增
            const enterAnimations = animations.filter(a => a.type === 'enter');
            const leaveAnimations = animations.filter(a => a.type === 'leave');

            // ⚠️ 计算最优动画时长：根据变化幅度动态调整
            // 变化幅度小 → 更慢的动画，确保过渡可见
            // 变化幅度大 → 正常速度，避免拖沓
            // ✅ V3.1更新：加快正常名次变化动画（原时长的50%）
            let maxDuration = this.animationDuration;

            moveAnimations.forEach(anim => {
                // 计算位置变化幅度（像素）
                const positionChange = Math.sqrt(
                    Math.pow(anim.deltaX || 0, 2) +
                    Math.pow(anim.deltaY || 0, 2)
                );

                // 计算柱状图宽度变化幅度（百分比）
                let widthChange = 0;
                if (anim.oldBarWidth !== undefined && anim.newBarWidth !== undefined) {
                    widthChange = Math.abs(anim.newBarWidth - anim.oldBarWidth);
                }

                // ⚠️ 根据变化幅度计算动画时长（加快版，原时长的约50%）
                // 极小变化 → 中速动画（1800ms）
                // 小变化 → 快速动画（1200ms）
                // 大变化 → 超快动画（600ms）

                let duration;

                if (widthChange < 2 && widthChange > 0) {
                    // 极小变化（<2%）：中速动画
                    duration = 1800;
                } else if (widthChange < 5) {
                    // 小变化（2-5%）：快速动画
                    duration = 1200;
                } else if (widthChange < 10) {
                    // 中小变化（5-10%）：较快动画
                    duration = 800;
                } else {
                    // 大变化（≥10%）：超快动画
                    duration = 600;
                }

                // 考虑位置变化：如果有大幅移动，适当延长时长
                if (positionChange > 200) {
                    duration += 100;
                } else if (positionChange > 100) {
                    duration += 50;
                }

                anim.duration = Math.min(Math.max(duration, 500), 2500); // 限制在500-2500ms

                maxDuration = Math.max(maxDuration, anim.duration);

                console.log(`[PixelAnimator] ${anim.element.dataset.modelName}: ` +
                    `位置变化=${positionChange.toFixed(1)}px, ` +
                    `宽度变化=${widthChange.toFixed(1)}%, ` +
                    `动画时长=${anim.duration}ms`);
            });

            // ⚠️ V3.1更新：为width-change动画计算时长（加快版，原时长的约50%）
            widthChangeAnimations.forEach(anim => {
                const widthChange = Math.abs(anim.newBarWidth - anim.oldBarWidth);

                // 使用与move动画相同的策略：变化越小，动画越慢
                let duration;

                if (widthChange < 2 && widthChange > 0) {
                    duration = 1800; // 极小变化（原3500ms）
                } else if (widthChange < 5) {
                    duration = 1200; // 小变化（原2500ms）
                } else if (widthChange < 10) {
                    duration = 800; // 中小变化（原1800ms）
                } else {
                    duration = 600; // 大变化（原1200ms）
                }

                anim.duration = Math.min(Math.max(duration, 500), 2500);

                maxDuration = Math.max(maxDuration, anim.duration);

                console.log(`[PixelAnimator] ${anim.element.dataset.modelName} (仅宽度): ` +
                    `宽度变化=${widthChange.toFixed(1)}%, ` +
                    `动画时长=${anim.duration}ms`);
            });

            // ⚠️ V3.1新增：离开动画使用3倍慢速（4500ms）
            if (leaveAnimations.length > 0) {
                const leaveDuration = this.animationDuration * 3; // 1500ms * 3 = 4500ms
                leaveAnimations.forEach(anim => {
                    anim.duration = leaveDuration;
                });
                maxDuration = Math.max(maxDuration, leaveDuration);
                console.log(`[PixelAnimator] 离开动画时长: ${leaveDuration}ms (3倍慢速)`);
            }

            console.log(`[PixelAnimator] 实际动画时长: ${maxDuration}ms`);

            // ⚠️ 关键优化：为进入和离开动画也使用 requestAnimationFrame
            // 确保所有动画同步开始

            // 注意：初始状态已经在 chart-v2.js 中设置
            // 这里只需要记录必要的数据

            // 处理进入动画 - 确保目标宽度已记录
            enterAnimations.forEach(anim => {
                const element = anim.element;
                const bar = element.querySelector('.bar');
                if (bar && !element._targetBarWidth) {
                    // 如果还没有记录目标宽度，现在记录
                    const targetWidth = bar.style.width;
                    element._targetBarWidth = targetWidth;
                    console.log(`[PixelAnimator] 补充记录目标宽度: ${element.dataset.modelName} -> ${targetWidth}`);
                }
            });

            // 处理离开动画 - 记录初始状态
            leaveAnimations.forEach(anim => {
                const element = anim.element;
                const bar = element.querySelector('.bar');
                if (bar && !element._currentBarWidth) {
                    // 如果还没有记录当前宽度，现在记录
                    element._currentBarWidth = bar.style.width;
                    console.log(`[PixelAnimator] 记录当前宽度: ${element.dataset.modelName} -> ${element._currentBarWidth}`);
                }
            });

            // 如果没有移动动画、宽度变化动画和进入动画，只处理离开动画
            if (moveAnimations.length === 0 && widthChangeAnimations.length === 0 && enterAnimations.length === 0) {
                // 离开动画单独处理
                const animateLeave = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / this.animationDuration, 1);
                    const easedProgress = this.easeInOutCubic(progress);

                    // ⚠️ V3改进：获取视口高度，用于计算向下移动距离
                    const viewportHeight = window.innerHeight;

                    leaveAnimations.forEach(anim => {
                        const element = anim.element;
                        const bar = element.querySelector('.bar');

                        // 透明度从1到0
                        element.style.opacity = (1 - easedProgress).toString();

                        // ⚠️ V3改进：向下移出页面，而不是向右
                        const elementRect = element.getBoundingClientRect();
                        const distanceToBottom = viewportHeight - elementRect.top + 100;
                        const moveDown = easedProgress * distanceToBottom;
                        element.style.transform = `translateY(${moveDown}px)`;

                        // 柱状图宽度从当前值到0
                        if (bar && element._currentBarWidth) {
                            const currentWidth = parseFloat(element._currentBarWidth) * (1 - easedProgress);
                            bar.style.width = `${currentWidth}%`;
                        }
                    });

                    if (progress < 1) {
                        requestAnimationFrame(animateLeave);
                    } else {
                        // 离开动画完成，清理
                        leaveAnimations.forEach(anim => {
                            anim.element.style.transform = '';
                            anim.element.style.opacity = '';
                            anim.element.style.visibility = '';
                        });
                        console.log('[PixelAnimator] 离开动画完成');
                        this.cleanup(animations);
                        resolve();
                    }
                };

                requestAnimationFrame(animateLeave);
                return;
            }

            // 执行移动、进入、离开动画（逐帧，同步进行）
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;

                // ⚠️ 关键改进：每个动画使用自己的时长
                // 变化小的动画会更快完成，变化大的动画需要更多时间

                let allAnimationsComplete = true;

                // 1. 更新移动动画的当前位置
                moveAnimations.forEach(anim => {
                    const element = anim.element;
                    const deltaX = anim.deltaX || 0;
                    const deltaY = anim.deltaY || 0;

                    // 使用该动画的独立时长
                    const duration = anim.duration || this.animationDuration;
                    const progress = Math.min(elapsed / duration, 1);
                    const easedProgress = this.easeInOutCubic(progress);

                    // 从初始transform位置平滑移动到0
                    const currentX = deltaX * (1 - easedProgress);
                    const currentY = deltaY * (1 - easedProgress);

                    // 使用 translate3d 确保GPU加速
                    element.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

                    // ⚠️ 同步动画化柱状图宽度
                    if (anim.oldBarWidth !== undefined && anim.newBarWidth !== undefined) {
                        const bar = element.querySelector('.bar');
                        if (bar) {
                            const currentWidth = anim.oldBarWidth + (anim.newBarWidth - anim.oldBarWidth) * easedProgress;
                            bar.style.width = `${currentWidth}%`;

                            // ⚠️ V3特效：宽度变化超过2%时添加高亮效果
                            const widthChange = Math.abs(anim.newBarWidth - anim.oldBarWidth);
                            if (widthChange > 2) {
                                if (progress < 0.02 && !bar.classList.contains('bar-highlight')) {
                                    bar.classList.add('bar-highlight');
                                }
                                if (progress > 0.5 && bar.classList.contains('bar-highlight')) {
                                    bar.classList.remove('bar-highlight');
                                }
                            }
                        }
                    }

                    // 检查是否完成
                    if (progress < 1) {
                        allAnimationsComplete = false;
                    }
                });

                // 2. ⚠️ V3新增：更新宽度变化动画（位置不变，只有宽度变化）
                widthChangeAnimations.forEach(anim => {
                    const element = anim.element;
                    const bar = element.querySelector('.bar');

                    // 使用该动画的独立时长
                    const duration = anim.duration || this.animationDuration;
                    const progress = Math.min(elapsed / duration, 1);
                    const easedProgress = this.easeInOutCubic(progress);

                    // ⚠️ V3特效：在动画开始时添加高亮效果
                    if (progress < 0.02 && !bar.classList.contains('bar-highlight')) {
                        bar.classList.add('bar-highlight');
                        console.log(`[PixelAnimator] ${element.dataset.modelName}: 添加宽度变化高亮特效`);
                    }

                    // ⚠️ V3特效：动画进度过半后移除高亮类，让效果自然消失
                    if (progress > 0.5 && bar.classList.contains('bar-highlight')) {
                        bar.classList.remove('bar-highlight');
                    }

                    // 只动画化柱状图宽度，位置不变
                    if (bar && anim.oldBarWidth !== undefined && anim.newBarWidth !== undefined) {
                        const currentWidth = anim.oldBarWidth + (anim.newBarWidth - anim.oldBarWidth) * easedProgress;
                        bar.style.width = `${currentWidth}%`;
                    }

                    // 检查是否完成
                    if (progress < 1) {
                        allAnimationsComplete = false;
                    }
                });

                // 3. 更新进入动画
                enterAnimations.forEach(anim => {
                    const element = anim.element;
                    const bar = element.querySelector('.bar');

                    // 进入动画使用全局时长（需要完整的进入效果）
                    const progress = Math.min(elapsed / this.animationDuration, 1);
                    const easedProgress = this.easeInOutCubic(progress);

                    // 透明度从0到1
                    element.style.opacity = easedProgress.toString();

                    // ⚠️ 首次渲染时跳过滑入效果，只播放柱状图增长动画
                    if (!element._isFirstRender) {
                        // 从左侧滑入到正常位置
                        const slideOffset = 100 * (1 - easedProgress);
                        element.style.transform = `translateX(-${slideOffset}px)`;
                    } else {
                        // 首次渲染：保持transform为0，不滑入
                        element.style.transform = 'translateX(0)';

                        // ⚠️ 调试：首次渲染时检查目标宽度
                        if (bar && element._targetBarWidth) {
                            const targetWidth = parseFloat(element._targetBarWidth);
                            const currentWidth = targetWidth * easedProgress;
                            bar.style.width = `${currentWidth}%`;

                            // 调试日志（只打印一次）
                            if (progress === 0.01) {
                                console.log(`[PixelAnimator] 首次渲染: ${element.dataset.modelName}, 目标宽度=${targetWidth}%, 当前进度=${easedProgress.toFixed(2)}, 当前宽度=${currentWidth.toFixed(1)}%`);
                            }
                        }
                    }

                    // 柱状图宽度从0到目标宽度（非首次渲染）
                    if (bar && !element._isFirstRender) {
                        if (element._targetBarWidth) {
                            const targetWidth = parseFloat(element._targetBarWidth);
                            const currentWidth = targetWidth * easedProgress;
                            bar.style.width = `${currentWidth}%`;
                        } else {
                            // 如果没有设置_targetBarWidth，使用当前宽度作为目标
                            const currentWidth = parseFloat(bar.style.width);
                            if (currentWidth > 0) {
                                // 从当前值增长
                                // 首次渲染时，这里可能已经是0了
                            }
                        }
                    }

                    // 检查是否完成
                    if (progress < 1) {
                        allAnimationsComplete = false;
                    }
                });

                // 4. 更新离开动画
                leaveAnimations.forEach(anim => {
                    const element = anim.element;
                    const bar = element.querySelector('.bar');

                    // 离开动画使用全局时长
                    const progress = Math.min(elapsed / this.animationDuration, 1);
                    const easedProgress = this.easeInOutCubic(progress);

                    // 透明度从1到0
                    element.style.opacity = (1 - easedProgress).toString();

                    // ⚠️ V3改进：向下移出页面，而不是向右
                    // 计算向下的距离（确保完全移出可视区域）
                    const viewportHeight = window.innerHeight;
                    const elementRect = element.getBoundingClientRect();
                    const distanceToBottom = viewportHeight - elementRect.top + 100; // 多移出100px确保完全离开
                    const moveDown = easedProgress * distanceToBottom;

                    element.style.transform = `translateY(${moveDown}px)`;

                    // 柱状图宽度从当前值到0
                    if (bar && element._currentBarWidth) {
                        const currentWidth = parseFloat(element._currentBarWidth) * (1 - easedProgress);
                        bar.style.width = `${currentWidth}%`;
                    }

                    // 检查是否完成
                    if (progress < 1) {
                        allAnimationsComplete = false;
                    }
                });

                // 动画未完成，继续下一帧
                if (!allAnimationsComplete) {
                    requestAnimationFrame(animate);
                } else {
                    // 动画完成，清理transform和恢复状态
                    moveAnimations.forEach(anim => {
                        const bar = anim.element.querySelector('.bar');
                        if (bar) {
                            bar.classList.remove('bar-highlight');
                        }
                        anim.element.style.transform = '';
                        anim.element.style.opacity = '';
                        anim.element.style.visibility = '';
                        console.log(`[PixelAnimator] ${anim.element.dataset.modelName} 移动动画完成`);
                    });

                    // ⚠️ V3新增：清理宽度变化动画
                    widthChangeAnimations.forEach(anim => {
                        const bar = anim.element.querySelector('.bar');
                        if (bar) {
                            bar.classList.remove('bar-highlight');
                        }
                        anim.element.style.transform = '';
                        anim.element.style.opacity = '';
                        anim.element.style.visibility = '';
                        console.log(`[PixelAnimator] ${anim.element.dataset.modelName} 宽度变化动画完成`);
                    });

                    enterAnimations.forEach(anim => {
                        anim.element.style.transform = '';
                        anim.element.style.opacity = '';
                        anim.element.style.visibility = '';
                        anim.element.style.position = '';
                        anim.element.style.pointerEvents = '';
                        // 清理首次渲染标记
                        delete anim.element._isFirstRender;
                        console.log(`[PixelAnimator] ${anim.element.dataset.modelName} 进入动画完成`);
                    });

                    leaveAnimations.forEach(anim => {
                        // 离开的元素会被移除，不需要清理
                        console.log(`[PixelAnimator] ${anim.element.dataset.modelName} 离开动画完成`);
                    });

                    console.log('[PixelAnimator] 所有像素动画完成');
                    this.cleanup(animations);
                    resolve();
                }
            };

            // 启动动画
            requestAnimationFrame(animate);
        });
    }

    /**
     * 清理动画类
     */
    cleanup(animations) {
        animations.forEach(anim => {
            if (!anim.element) return;
            anim.element.classList.remove(
                'pixel-moving',
                'pixel-enter',
                'pixel-enter-active',
                'pixel-leave',
                'pixel-leave-active'
            );
        });
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PixelAnimator };
}
