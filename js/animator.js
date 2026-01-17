/**
 * Animator - 动画控制器
 * 负责处理月份切换动画、自动播放、速度控制
 */

/**
 * ChartAnimator类
 */
class ChartAnimator {
    constructor(data, chart) {
        this.data = data;
        this.chart = chart;
        this.currentIndex = 0;
        this.isPlaying = false;
        this.speed = 1; // 1 = 2.5秒/月
        this.interval = null;
        this.baseInterval = 2500; // 基础间隔2.5秒（动画1.5秒 + 间隔1秒）
        this.useFlipAnimation = true; // 是否使用FLIP动画
    }

    /**
     * 渲染当前月份
     */
    renderCurrentMonth() {
        if (!this.data.months || this.data.months.length === 0) {
            console.error('No month data available');
            return;
        }

        const monthData = this.data.months[this.currentIndex];
        this.chart.renderMonth(monthData);
        this.chart.updateTimeline(this.currentIndex);
    }

    /**
     * 使用FLIP动画渲染当前月份（新方法）
     */
    async renderCurrentMonthWithFlip() {
        if (!this.data.months || this.data.months.length === 0) {
            console.error('No month data available');
            return;
        }

        const monthData = this.data.months[this.currentIndex];
        await this.chart.renderMonthWithFlip(monthData);
        this.chart.updateTimeline(this.currentIndex);
    }

    /**
     * 渲染指定月份
     */
    renderMonth(monthIndex) {
        if (monthIndex < 0 || monthIndex >= this.data.months.length) {
            console.warn(`Month index ${monthIndex} out of range`);
            return;
        }

        this.currentIndex = monthIndex;
        this.renderCurrentMonth();
    }

    /**
     * 渲染指定月份（使用FLIP动画）
     */
    async renderMonthWithFlip(monthIndex) {
        if (monthIndex < 0 || monthIndex >= this.data.months.length) {
            console.warn(`Month index ${monthIndex} out of range`);
            return;
        }

        this.currentIndex = monthIndex;
        await this.renderCurrentMonthWithFlip();
    }

    /**
     * 下一月
     */
    nextMonth() {
        this.currentIndex = (this.currentIndex + 1) % this.data.months.length;
        this.renderCurrentMonth();
    }

    /**
     * 下一月（使用FLIP动画）
     */
    async nextMonthWithFlip() {
        this.currentIndex = (this.currentIndex + 1) % this.data.months.length;
        await this.renderCurrentMonthWithFlip();
    }

    /**
     * 上一月
     */
    prevMonth() {
        this.currentIndex = (this.currentIndex - 1 + this.data.months.length) % this.data.months.length;
        this.renderCurrentMonth();
    }

    /**
     * 上一月（使用FLIP动画）
     */
    async prevMonthWithFlip() {
        this.currentIndex = (this.currentIndex - 1 + this.data.months.length) % this.data.months.length;
        await this.renderCurrentMonthWithFlip();
    }

    /**
     * 跳转到指定月份
     */
    jumpToMonth(monthIndex) {
        if (monthIndex >= 0 && monthIndex < this.data.months.length) {
            this.currentIndex = monthIndex;
            if (this.useFlipAnimation) {
                this.renderCurrentMonthWithFlip();
            } else {
                this.renderCurrentMonth();
            }
        }
    }

    /**
     * 播放
     */
    play() {
        if (this.isPlaying) {
            console.log('Already playing');
            return;
        }

        this.isPlaying = true;
        this.updatePlayButton();

        const interval = this.baseInterval / this.speed;

        // 使用FLIP动画或普通渲染
        const renderMethod = this.useFlipAnimation
            ? () => this.nextMonthWithFlip()
            : () => this.nextMonth();

        this.interval = setInterval(renderMethod, interval);

        console.log(`Playing at ${this.speed}x speed (${interval}ms per month, FLIP: ${this.useFlipAnimation})`);
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
        clearInterval(this.interval);
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

        // 如果正在播放，重新启动以应用新速度
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
                    // 使用FLIP动画或普通渲染
                    if (this.useFlipAnimation) {
                        this.prevMonthWithFlip();
                    } else {
                        this.prevMonth();
                    }
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.pause();
                    // 使用FLIP动画或普通渲染
                    if (this.useFlipAnimation) {
                        this.nextMonthWithFlip();
                    } else {
                        this.nextMonth();
                    }
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

        console.log('Controls initialized');
        console.log('Keyboard shortcuts: Space=Play/Pause, Arrow Left/Right=Prev/Next, 1/2/3=Speed');
    }

    /**
     * 销毁动画器
     */
    destroy() {
        this.pause();
        console.log('Animator destroyed');
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

// 导出Animator类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChartAnimator };
}
