/**
 * Animator V4 - 动画控制器
 * 使用 ChartV4 和 V4AnimationEngine
 */

class ChartAnimatorV4 {
    constructor(data, chart) {
        this.data = data;
        this.chart = chart;
        this.currentIndex = 0;
        this.isPlaying = false;
        this.speed = 1;
        this.baseInterval = 2500;
    }

    /**
     * 渲染当前月份
     */
    async renderCurrentMonth() {
        if (!this.data.months || this.data.months.length === 0) {
            console.error('No month data available');
            return;
        }

        const monthData = this.data.months[this.currentIndex];
        await this.chart.renderMonth(monthData);
        this.updateTimeline(this.currentIndex);
    }

    /**
     * 下一月
     */
    async nextMonth() {
        // 先更新索引
        this.currentIndex = (this.currentIndex + 1) % this.data.months.length;

        // 如果更新后是最后一个月，播放完当前月后停止
        if (this.currentIndex >= this.data.months.length - 1) {
            console.log('已到达最后一个月，播放完当前月后停止');
        }

        await this.renderCurrentMonth();
    }

    /**
     * 上一月
     */
    async prevMonth() {
        this.currentIndex = (this.currentIndex - 1 + this.data.months.length) % this.data.months.length;
        await this.renderCurrentMonth();
    }

    /**
     * 跳转到指定月份
     */
    async jumpToMonth(monthIndex) {
        if (monthIndex >= 0 && monthIndex < this.data.months.length) {
            this.currentIndex = monthIndex;
            await this.renderCurrentMonth();
        }
    }

    /**
     * 播放
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

        // 异步播放循环
        const playLoop = async () => {
            // 检查是否到达最后一个月
            if (this.currentIndex >= this.data.months.length - 1) {
                console.log('到达最后一个月，停止播放');
                this.pause();
                return;
            }

            if (!this.isPlaying) return;

            await this.nextMonth();

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
     */
    pause() {
        if (!this.isPlaying) {
            console.log('Already paused');
            return;
        }

        this.isPlaying = false;

        // 清除 timeout
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
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
     * 初始化 UI 控件
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
                    this.prevMonth();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.pause();
                    this.nextMonth();
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

        console.log('[AnimatorV4] Controls initialized');
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

    /**
     * 销毁动画器
     */
    destroy() {
        this.pause();
        console.log('[AnimatorV4] Destroyed');
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

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChartAnimatorV4 };
}
