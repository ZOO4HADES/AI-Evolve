/**
 * Animator V3 - 超平滑动画控制器
 * 使用 ChartV3 和 PixelAnimatorV3
 */

/**
 * ChartAnimatorV3类
 */
class ChartAnimatorV3 {
    constructor(data, chart) {
        this.data = data;
        this.chart = chart;
        this.currentIndex = 0;
        this.isPlaying = false;
        this.speed = 1;
        this.interval = null;
        this.baseInterval = 2500; // 基础间隔2.5秒
    }

    /**
     * 渲染当前月份（使用像素级动画）
     */
    async renderCurrentMonthWithPixelAnimation() {
        if (!this.data.months || this.data.months.length === 0) {
            console.error('No month data available');
            return;
        }

        const monthData = this.data.months[this.currentIndex];
        await this.chart.renderMonthWithPixelAnimation(monthData);
        this.chart.updateTimeline(this.currentIndex);
    }

    /**
     * 下一月（使用像素级动画）
     * ✅ 修复：先更新索引，再检查是否到达最后一个月
     */
    async nextMonthWithPixelAnimation() {
        // 先更新索引
        this.currentIndex = (this.currentIndex + 1) % this.data.months.length;

        // 如果更新后是最后一个月，停止播放
        if (this.currentIndex >= this.data.months.length - 1) {
            console.log('已到达最后一个月，播放完当前月后停止');
            // 先渲染当前月，然后在 play() 循环中停止
        }

        await this.renderCurrentMonthWithPixelAnimation();
    }

    /**
     * 上一月（使用像素级动画）
     */
    async prevMonthWithPixelAnimation() {
        this.currentIndex = (this.currentIndex - 1 + this.data.months.length) % this.data.months.length;
        await this.renderCurrentMonthWithPixelAnimation();
    }

    /**
     * 跳转到指定月份（使用像素级动画）
     */
    async jumpToMonth(monthIndex) {
        if (monthIndex >= 0 && monthIndex < this.data.months.length) {
            this.currentIndex = monthIndex;
            await this.renderCurrentMonthWithPixelAnimation();
        }
    }

    /**
     * 播放
     * ✅ 修复抖动：等待动画完成后再播放下一帧
     * ✅ 到达最后一个月时自动停止
     */
    async play() {
        if (this.isPlaying) {
            console.log('Already playing');
            return;
        }

        // 如果已经在最后一个月，不播放
        if (this.currentIndex >= this.data.months.length - 1) {
            console.log('已在最后一个月，无法播放');
            return;
        }

        this.isPlaying = true;
        this.updatePlayButton();

        const interval = this.baseInterval / this.speed;

        // ✅ 使用异步循环，确保动画完成后才进入下一月
        const playLoop = async () => {
            // 检查是否到达最后一个月
            if (this.currentIndex >= this.data.months.length - 1) {
                console.log('到达最后一个月，停止播放');
                this.pause();
                return;
            }

            if (!this.isPlaying) return;

            await this.nextMonthWithPixelAnimation();

            // 等待指定间隔后再播放下一月
            if (this.isPlaying && this.currentIndex < this.data.months.length - 1) {
                this.timeoutId = setTimeout(playLoop, interval);
            }
        };

        // 开始播放循环
        this.timeoutId = setTimeout(playLoop, interval);

        console.log(`Playing at ${this.speed}x speed (${interval}ms per month)`);
    }

    /**
     * 暂停
     * ✅ 修复：同时清除timeout和interval
     */
    pause() {
        if (!this.isPlaying) {
            console.log('Already paused');
            return;
        }

        this.isPlaying = false;

        // 清除timeout和interval
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        this.updatePlayButton();
        console.log('Paused');
    }

    /**
     * 切换播放/暂停
     */
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    /**
     * 设置播放速度
     */
    setSpeed(speed) {
        this.speed = parseFloat(speed);
        console.log(`Speed set to ${this.speed}x`);

        if (this.isPlaying) {
            this.pause();
            this.play();
        }
    }

    /**
     * 更新播放按钮状态
     */
    updatePlayButton() {
        const playButton = document.getElementById('playPause');
        if (playButton) {
            if (this.isPlaying) {
                playButton.innerHTML = '<i class="icon-pause"></i> 暂停';
                playButton.classList.add('playing');
            } else {
                playButton.innerHTML = '<i class="icon-play"></i> 播放';
                playButton.classList.remove('playing');
            }
        }
    }

    /**
     * 初始化UI控件
     */
    initControls() {
        // 播放/暂停按钮
        const playButton = document.getElementById('playPause');
        if (playButton) {
            playButton.addEventListener('click', () => {
                this.togglePlay();
            });
        }

        // 速度控制
        const speedSlider = document.getElementById('speed');
        const speedDisplay = document.getElementById('speedDisplay');
        if (speedSlider && speedDisplay) {
            speedSlider.addEventListener('input', (e) => {
                const speed = parseFloat(e.target.value);
                speedDisplay.textContent = `${speed}x`;
                this.setSpeed(speed);
            });
        }

        // 键盘控制
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlay();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.pause();
                    this.prevMonthWithPixelAnimation();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.pause();
                    this.nextMonthWithPixelAnimation();
                    break;
                case 'Digit1':
                    this.setSpeed(1);
                    document.getElementById('speed').value = 1;
                    document.getElementById('speedDisplay').textContent = '1x';
                    break;
                case 'Digit2':
                    this.setSpeed(2);
                    document.getElementById('speed').value = 2;
                    document.getElementById('speedDisplay').textContent = '2x';
                    break;
                case 'Digit3':
                    this.setSpeed(3);
                    document.getElementById('speed').value = 3;
                    document.getElementById('speedDisplay').textContent = '3x';
                    break;
            }
        });

        // 时间轴点击
        const timelineMarkers = document.querySelectorAll('.timeline-marker');
        timelineMarkers.forEach(marker => {
            marker.addEventListener('click', () => {
                const monthIndex = parseInt(marker.dataset.month);
                this.pause();
                this.jumpToMonth(monthIndex);
            });
        });

        console.log('[AnimatorV3] Controls initialized');
        console.log('[AnimatorV3] Keyboard shortcuts: Space=Play/Pause, Arrow Left/Right=Prev/Next, 1/2/3=Speed');
    }

    /**
     * 销毁动画器
     */
    destroy() {
        this.pause();
        console.log('[AnimatorV3] Destroyed');
    }

    /**
     * 获取当前状态
     */
    getState() {
        return {
            currentIndex: this.currentIndex,
            isPlaying: this.isPlaying,
            speed: this.speed,
            currentMonth: this.data.months[this.currentIndex].date
        };
    }
}

// 导出AnimatorV3类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChartAnimatorV3 };
}
