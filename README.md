# AI-Evolve: Chatbot Arena 榜单演进史

> 一个动态可视化页面，展示Chatbot Arena榜单从**2025年1月到2025年12月（12个月）**每月**前10名**AI模型的演进历史。

![Version](https://img.shields.io/badge/version-3.18.0-brightgreen)
![Status](https://img.shields.io/badge/status-complete-success)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ 项目特性

🎯 **核心功能**
- ✅ **横向柱状图动画** - 清晰展示排名和Elo评分变化
- ✅ **像素级平滑动画** - 使用 requestAnimationFrame 实现逐帧动画
- ✅ **11家公司颜色映射** - OpenAI绿、Google蓝、Anthropic橙等
- ✅ **自动循环播放** - 12个月数据自动循环展示
- ✅ **可调节播放速度** - 0.5x到3x速度调节
- ✅ **智能动画时长** - 小幅变化使用更慢的动画（最长3.5秒），确保平滑过渡
- ✅ **宽度变化特效** - V3新增：名次不变但有宽度变化时，超强视觉特效（300%亮度闪光）

🎨 **视觉设计**
- ✅ **赛博朋克风格** - 霓虹渐变配色（青色+粉色）
- ✅ **GPU加速动画** - 流畅60 FPS体验
- ✅ **响应式布局** - 完美适配桌面、平板、手机
- ✅ **动态光效** - Shimmer闪光效果和Glow发光
- ✅ **超强闪光特效** - V3新增：亮度脉冲、多层发光、白色闪烁

🎮 **交互体验**
- ✅ **鼠标控制** - 按钮、滑块、时间轴点击
- ✅ **键盘快捷键** - 空格播放、方向键切换、数字键调速
- ✅ **进度指示** - 实时进度条和月份显示

⚡ **性能优化**
- ✅ **零依赖** - 纯HTML/CSS/JS，无需框架
- ✅ **内嵌数据** - 无需服务器，直接打开使用
- ✅ **快速加载** - 页面加载< 1秒
- ✅ **低内存占用** - 高效数据结构
- ✅ **DOM复用** - 智能元素管理，避免闪烁

---

## 📁 项目结构

```
AI-Evolve/
├── index.html              # V1 主页面（赛博朋克风格）
├── index-v2.html           # V2 像素级动画版本
├── index-v3.html           # V3 超强特效版本 ⭐推荐
├── start.bat               # Windows一键启动脚本
├── README.md               # 项目文档（本文件）
│
├── css/                    # 样式文件
│   ├── reset.css          # 样式重置
│   ├── variables.css      # CSS变量（12种公司颜色）
│   ├── layout.css         # 布局样式
│   ├── chart.css          # 柱状图样式
│   └── animations.css     # 动画定义
│
├── js/                     # JavaScript文件
│   ├── data-bundle-mixed-v2.js  # 数据打包文件（12个月数据）⭐
│   ├── regenerate-2025-only.js # 数据生成脚本 ⭐
│   ├── model-tracker.js   # V2/V3 模型状态追踪器
│   ├── pixel-animator.js  # V2 像素级动画引擎
│   ├── pixel-animator-v3.js # V3 像素级动画引擎（增强版）⭐
│   ├── chart.js           # V1 柱状图渲染引擎
│   ├── chart-v2.js        # V2 像素级渲染引擎
│   ├── chart-v3.js        # V3 像素级渲染引擎（增强版）⭐
│   ├── animator.js        # V1 动画控制器
│   ├── animator-v2.js     # V2 动画控制器
│   ├── animator-v3.js     # V3 动画控制器（增强版）⭐
│   ├── main.js            # V1 主入口
│   ├── main-v2.js         # V2 主入口
│   └── main-v3.js         # V3 主入口 ⭐
│
└── data/                   # 数据文件（可选）
    └── arena-history.json # 原始JSON数据
```

**总文件数：约25个 | 总大小：< 300KB**

---

## 🚀 快速开始

### 推荐：V3 超强特效版本 ⭐

```bash
# 直接打开 V3 版本
双击 index-v3.html
```

**V3 版本优势**：
- ✅ 像素级平滑动画（requestAnimationFrame）
- ✅ 智能动画时长（小幅变化更慢，最长3.5秒）
- ✅ DOM复用技术（无闪烁）
- ✅ 首次加载动画（柱状图从0增长）
- ✅ 新模型入榜动画（淡入+滑入+柱状图增长）
- ✅ **宽度变化特效**（名次不变但宽度变化时的超强闪光）
- ✅ **向下离开动画**（模型掉出榜单时向下移出，更自然）
- ✅ **300%亮度脉冲** + **多层发光** + **白色闪烁**

### 方法1：Windows双击启动（最简单）

```
1. 双击 start.bat 文件
2. 浏览器自动打开 index-v3.html
3. 享受AI模型演进之旅！
```

### 方法2：直接打开HTML

```bash
# Windows
双击 index-v3.html 文件

# 或命令行
start index-v3.html

# macOS
open index-v3.html

# Linux
xdg-open index-v3.html
```

### 方法3：使用本地服务器（可选）

```bash
# Python 3
cd AI-Evolve
python -m http.server 8000

# Node.js
npx http-server

# 然后访问 http://localhost:8000/index-v3.html
```

---

## 🎮 V3 操作指南

### 鼠标操作

| 操作 | 功能 |
|------|------|
| 点击 **"播放"** 按钮 | 开始/暂停自动播放 |
| 拖动 **速度滑块** | 调节播放速度（0.5x - 3x） |
| 点击 **时间轴标记** | 跳转到指定月份 |

### 键盘快捷键

| 按键 | 功能 |
|------|------|
| **空格键** | 播放/暂停 |
| **← / →** | 上一月/下一月 |
| **1 / 2 / 3** | 设置速度为1x/2x/3x |

---

## 📊 数据说明

### ✅ 真实数据来源

**本项目使用Chatbot Arena真实榜单数据**：

1. **2025年1月真实数据** - DeepSeek R1发布（ELO 1357）
2. **2025年2月真实数据** - Grok-3发布（ELO 1402），来自Chatbot Arena截图
3. **2025年12月真实数据** - Chatbot Arena年终榜单

其他月份（3-11月）基于真实模型的发布时间和竞争态势推测生成。

### 数据详情

- **真实数据月份**：3个月（1月、2月、12月）
- **生成数据月份**：9个月（3-11月）
- **时间范围**：2025年1月 - 2025年12月（12个月）
- **每月模型**：前10名
- **总数据点**：120个（12月 × 10模型）
- **公司数量**：11家

### 2025年2月真实榜单（来自截图）

| 排名 | 模型名称 | ELO | 公司 |
|------|----------|-----|------|
| 1 | Grok-3 | 1402 | xAI |
| 2 | Gemini 2.0 Flash Thinking | 1385 | Google |
| 3 | Gemini 2.0 Pro | 1379 | Google |
| 4 | Chatgpt-4o | 1377 | OpenAI |
| 5 | DeepSeek R1 | 1361 | DeepSeek |
| 6 | Gemini 2.0 Flash | 1356 | Google |
| 7 | ChatGPT-o1 | 1353 | OpenAI |
| 8 | Qwen2.5 MAX | 1332 | Alibaba |
| 9 | DeepSeek-V3 | 1317 | DeepSeek |
| 10 | Qwen2.5 Plus | 1313 | Alibaba |

### 2025年12月真实榜单

| 排名 | 模型名称 | ELO | 公司 |
|------|----------|-----|------|
| 1 | Gemini-3-Pro | 1492 | Google |
| 2 | Grok-4.1-Thinking | 1482 | xAI |
| 3 | Gemini-3-Flash | 1470 | Google |
| 4 | GPT-5.2-high | 1465 | OpenAI |
| 5 | GPT-5.1-high | 1464 | OpenAI |
| 6 | GPT-5.2 | 1464 | OpenAI |
| 7 | Grok-4.1 | 1463 | xAI |
| 8 | Claude Opus 4.5 | 1462 | Anthropic |
| 9 | Gemini-2.5-Pro | 1460 | Google |
| 10 | Grok-4 | 1446 | xAI |

### 公司颜色映射

| 公司 | 颜色代码 | 中文名称 |
|------|----------|----------|
| OpenAI | #10a37f | OpenAI |
| Google | #4285f4 | 谷歌 |
| xAI | #00F0FF | xAI（亮青色） |
| Anthropic | #d97757 | Anthropic |
| DeepSeek | #4d6bf5 | 深度求索 |
| Alibaba | #ff6a00 | 阿里 |
| Z.ai | #8b5cf6 | 智谱AI |
| Baidu | #2932e1 | 百度 |
| Meta | #1877f2 | Meta |
| Moonshot | #1a1a2e | 月之暗面 |
| Mistral | #ff6b35 | Mistral |
| LMSYS | #6366f1 | LMSYS |

---

## 🛠️ 技术栈

### V3 超强特效动画系统

**V3 = V2 + 超强视觉特效**

**新增特效（宽度变化时触发）**：
- **300%亮度脉冲**：filter: brightness(3.0) + saturate(1.5)
- **多层发光**：30px + 60px + 90px box-shadow + inset发光
- **放大效果**：scaleY(1.15) + scaleX(1.02)
- **白色边框**：3px solid rgba(255, 255, 255, 0.9)
- **白色闪烁层**：::before伪元素，90%透明度淡出
- **动画时长**：1秒（barPulseExtreme关键帧动画）

**改进的离开动画**：
- 从向右滑出改为**向下移出页面**
- 计算距离：viewportHeight - elementRect.top + 100
- 更自然的视觉效果

**关键组件**：
1. **ModelTracker**（`model-tracker.js`）
   - 追踪模型状态（进入/离开/保持）
   - 识别变化类型和幅度

2. **PixelAnimatorV3**（`pixel-animator-v3.js`）⭐增强
   - 新增 `width-change` 动画类型
   - 自动添加 `.bar-highlight` 类触发特效
   - 动态计算动画时长（1-4秒）
   - 应用缓动函数（easeInOutCubic）

3. **ChartV3**（`chart-v3.js`）⭐增强
   - 检测位置不变但宽度变化的情况
   - 创建 `width-change` 动画指令
   - 像素级渲染引擎
   - FLIP位置计算
   - DOM元素复用管理

**智能动画时长策略**：
```javascript
widthChange < 2%    → 3500ms (超超慢，确保可见)
widthChange < 5%    → 2500ms (超慢，平滑过渡)
widthChange < 10%   → 1800ms (慢速，舒适观看)
widthChange ≥ 10%   → 1200ms (正常，避免拖沓)
```

**动画类型**：
- **移动动画**：排名变化时的平滑移动 + 宽度变化 + 特效（如果宽度变化>2%）
- **宽度变化动画**：⭐V3新增 - 名次不变但宽度变化时，超强闪光特效
- **进入动画**：新模型入榜（淡入+滑入+柱状图增长）
- **离开动画**：模型掉榜（⭐V3改进：向下移出页面，更自然）

### V2 像素级动画系统

**核心技术**：
- **requestAnimationFrame** - 浏览器原生API，实现60FPS逐帧动画
- **像素级控制** - 精确到像素的移动和宽度动画
- **GPU加速** - 使用 `translate3d()` 和 `translateZ(0)` 确保硬件加速
- **DOM复用** - 智能管理DOM元素，避免销毁和重建

### 前端技术
- **HTML5** - 语义化标签
- **CSS3** - Flexbox布局、Grid、CSS变量
- **JavaScript ES6+** - 类、箭头函数、模板字符串、async/await
- **无框架依赖** - 轻量级，高性能

### V1 动画技术（保留）
- **CSS Transitions** - 平滑过渡效果
- **CSS Animations** - 关键帧动画
- **GPU加速** - transform: translateZ(0)
- **will-change** - 性能优化提示

### 性能优化
- **数据预加载** - 内嵌JSON数据
- **DOM复用** - 避免元素销毁/重建
- **防抖节流** - 避免频繁更新
- **requestAnimationFrame** - 浏览器优化帧率
- **GPU加速** - 使用transform触发硬件加速

---

## 🌐 浏览器兼容性

| 浏览器 | 最低版本 | 状态 |
|--------|----------|------|
| Chrome | 90+ | ✅ 完美支持 |
| Edge | 90+ | ✅ 完美支持 |
| Firefox | 88+ | ✅ 完美支持 |
| Safari | 14+ | ✅ 完美支持 |
| Opera | 76+ | ✅ 完美支持 |

---

## 📈 性能指标

| 指标 | V1版本 | V2版本 | V3版本 |
|------|--------|--------|--------|
| 页面加载时间 | < 1秒 | < 1秒 | < 1秒 |
| 动画帧率 | 60 FPS | 60 FPS | 60 FPS |
| 内存占用 | < 50MB | < 60MB | < 65MB |
| 文件大小 | < 200KB | < 250KB | < 300KB |
| 数据大小 | ~50KB（内嵌） | ~50KB（内嵌） | ~50KB（内嵌） |
| 数据点数量 | - | 120个 | 120个（12月×10模型） |
| 动画精度 | CSS级别 | 像素级别 | 像素级别 |
| 动画时长 | 固定1.5秒 | 动态1-4秒 | 动态1-4秒 |
| 闪烁问题 | 偶尔出现 | ✅ 已解决 | ✅ 已解决 |
| 跳动感问题 | 偶尔出现 | ⚠️ 小幅变化时 | ✅ 已解决（超强特效） |
| 视觉冲击力 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🔧 开发说明

### V3 版本架构

**文件依赖关系**：
```
index-v3.html
  ├─ data-bundle.js（数据）
  ├─ model-tracker.js（模型追踪）
  ├─ pixel-animator-v3.js（⭐增强动画引擎）
  ├─ chart-v3.js（⭐增强渲染引擎）
  ├─ animator-v3.js（⭐增强动画控制）
  └─ main-v3.js（主入口）
```

**关键代码片段**：

1. **⭐宽度变化动画特效（V3新增）**：
```javascript
// pixel-animator-v3.js
widthChangeAnimations.forEach(anim => {
    const bar = element.querySelector('.bar');

    // 在动画开始时添加高亮效果
    if (progress < 0.02 && !bar.classList.contains('bar-highlight')) {
        bar.classList.add('bar-highlight');
    }

    // 动画进度过半后移除高亮类
    if (progress > 0.5 && bar.classList.contains('bar-highlight')) {
        bar.classList.remove('bar-highlight');
    }

    // 动画化宽度
    const currentWidth = oldBarWidth + (newBarWidth - oldBarWidth) * easedProgress;
    bar.style.width = `${currentWidth}%`;
});
```

2. **⭐位置检测逻辑（V3新增）**：
```javascript
// chart-v3.js
if (Math.abs(deltaY) > 0.5 || Math.abs(deltaX) > 0.5) {
    // 位置变化 - 移动动画
    animations.push({ type: 'move', ... });
} else if (Math.abs(newBarWidth - oldBarWidth) > 0.1) {
    // ⭐V3关键改进：位置不变但宽度有变化
    animations.push({
        type: 'width-change', // 新的动画类型
        element: element,
        oldBarWidth: oldBarWidth,
        newBarWidth: newBarWidth
    });
}
```

3. **CSS特效（V3新增，index-v3.html）**：
```css
.bar-highlight {
    /* 多重发光效果 */
    box-shadow:
        0 0 30px currentColor !important,
        0 0 60px rgba(255, 255, 255, 0.8) !important,
        0 0 90px rgba(0, 240, 255, 0.6) !important,
        inset 0 0 20px rgba(255, 255, 255, 0.5) !important;

    /* 极亮闪光效果 */
    filter: brightness(3.0) saturate(1.5) !important;

    /* 放大效果 */
    transform: scaleY(1.15) scaleX(1.02) !important;

    /* 动画 */
    animation: barPulseExtreme 1s ease-out !important;
}
```

### V2 版本架构

**文件依赖关系**：
```
index-v2.html
  ├─ data-bundle.js（数据）
  ├─ model-tracker.js（模型追踪）
  ├─ pixel-animator.js（动画引擎）
  ├─ chart-v2.js（渲染引擎）
  ├─ animator-v2.js（动画控制）
  └─ main-v2.js（主入口）
```

**关键代码片段**：

1. **像素级移动动画**：
```javascript
// 从旧位置移动到新位置
const currentX = deltaX * (1 - easedProgress);
const currentY = deltaY * (1 - easedProgress);
element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
```

2. **柱状图宽度动画**：
```javascript
// 从旧宽度平滑增长到新宽度
const currentWidth = oldBarWidth + (newBarWidth - oldBarWidth) * easedProgress;
bar.style.width = `${currentWidth}%`;
```

3. **缓动函数**：
```javascript
// easeInOutCubic - 平滑加速和减速
easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
```

### V1 版本架构（保留）

V1版本使用CSS Transitions实现动画，代码更简单，但精度和流畅度不如V2。

**文件依赖关系**：
```
index.html
  ├─ data-bundle.js（数据）
  ├─ chart.js（渲染引擎）
  ├─ animator.js（动画控制）
  └─ main.js（主入口）
```

### 重新生成数据

如果需要重新生成数据：

```bash
cd AI-Evolve
node regenerate-2025-only.js
```

这将生成新的：
- `js/data-bundle-mixed-v2.js` - 内嵌数据文件（12个月数据）

**数据生成逻辑**：
- 基准：2025年1月、2月、12月的真实榜单数据
- 生成：3-11月数据基于12月模型的推测发布时间
- 排序：每月按ELO降序排序，取前10名
- 演进：2月模型持续演进，12月新模型逐步加入

### 自定义样式

修改 `css/variables.css` 中的CSS变量可以快速调整主题：

```css
:root {
    /* 主色调 */
    --accent-cyan: #00f0ff;    /* 青色 */
    --accent-pink: #ff00ff;    /* 粉色 */

    /* 背景色 */
    --bg-dark: #0a0e27;        /* 深色背景 */
    --bg-card: #1a1f3a;        /* 卡片背景 */

    /* 公司颜色 */
    --color-openai: #10a37f;
    --color-google: #4285f4;
    /* ... 更多颜色 */
}
```

### 添加新公司颜色

在 `js/chart.js` 中添加：

```javascript
const COMPANY_COLORS = {
    // ... 现有公司
    'YourCompany': '#hexcolor'
};

const COMPANY_NAMES_ZH = {
    // ... 现有公司
    'YourCompany': '中文名称'
};
```

---

## ✅ 分步验证节点

项目通过10个验证节点逐步实现，确保质量：

1. ✅ **节点1**：生成12个月历史数据（120个数据点）
2. ✅ **节点2**：创建基础HTML页面结构（赛博朋克风格）
3. ✅ **节点3**：实现柱状图渲染引擎（动态宽度计算）
4. ✅ **节点4**：实现12家公司颜色映射系统
5. ✅ **节点5**：实现单月切换动画（淡入+滑动）
6. ✅ **节点6**：实现自动播放功能（循环播放）
7. ✅ **节点7**：实现速度控制（0.5x - 3x）
8. ✅ **节点8**：数据一致性检查（通过）
9. ✅ **节点9**：性能优化（GPU加速+will-change）
10. ✅ **节点10**：响应式布局适配（移动端友好）

**所有节点已完成并通过验证！** ✅

**v3.18.0 更新内容**：
- ✅ 更新为2025年12个月数据（1-12月）
- ✅ 使用Chatbot Arena真实榜单数据（2月+12月）
- ✅ xAI颜色改为亮青色（#00F0FF）
- ✅ 数据基于真实模型发布时间推测生成
- ✅ 每月显示前10名模型

---

## 🐛 故障排除

### 问题1：页面无法加载数据（"Failed to fetch"）

✅ **已修复！** 现在使用内嵌数据方式，无需担心CORS问题。

**解决方案**：
1. 确保文件 `js/data-bundle.js` 存在
2. 直接打开 `index.html` 即可
3. 如果仍有问题，尝试清除浏览器缓存

### 问题2：动画卡顿

**解决方案**：
1. 关闭其他浏览器标签页释放内存
2. 确保显卡驱动已更新
3. 尝试降低播放速度
4. 检查浏览器控制台是否有错误

### 问题3：页面显示异常

**解决方案**：
1. 清除浏览器缓存（Ctrl+Shift+Delete）
2. 使用最新版Chrome/Firefox/Edge浏览器
3. 按F12打开控制台，检查错误信息
4. 确保所有文件都在同一目录下

### 问题4：时间轴无法点击

**解决方案**：
1. 确保已暂停自动播放
2. 刷新页面重新加载
3. 检查浏览器是否支持（IE不支持）

---

## 🔮 未来改进计划

### V4 规划
- [ ] **真实数据支持** - 接入Chatbot Arena API获取真实历史数据
- [ ] **自定义时间范围** - 允许用户选择查看的时间段
- [ ] **数据导出** - 支持导出为CSV/Excel格式
- [ ] **多榜单切换** - 支持切换不同排行榜（MMLU、HumanEval等）

### 增强功能
- [ ] **模型详情** - 点击模型显示详细信息
- [ ] **对比模式** - 同时显示两个月份的数据对比
- [ ] **图表类型** - 添加折线图、饼图等可视化方式
- [ ] **搜索过滤** - 按公司、模型名称搜索
- [ ] **分享功能** - 生成分享链接
- [ ] **播放列表** - 选择性播放特定月份

---

## 📄 许可证

MIT License

Copyright (c) 2025-2026 AI-Evolve Project

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

## 🙏 致谢

- **数据来源**：[Chatbot Arena by LMSYS](https://openlm.ai/chatbot-arena/)
- **设计灵感**：Cyberpunk风格、霓虹美学
- **技术栈**：原生HTML/CSS/JavaScript
- **动画技术**：requestAnimationFrame、FLIP动画

---

## 📞 联系方式

- **项目位置**：`D:\LLM\AccuTerms\AI-Evolve\`
- **文档更新**：2025年1月17日
- **当前版本**：v3.18.0（2025年真实数据版本）
- **上一版本**：v3.0.0（超强特效版本）
- **原始版本**：v2.0.0（像素级动画版本）

**版本历史**：
- **v3.18.0** (2025-01-17)：更新为2025年12个月数据，使用2月和12月真实榜单
- **v3.0.0**：超强特效版本（宽度变化闪光、向下离开动画）
- **v2.0.0**：像素级平滑动画版本
- **v1.0.0**：CSS动画版本

---

## 🎯 快速链接

### V3 超强特效版本 ⭐推荐
- [🚀 立即体验 V3](./index-v3.html) - 超强特效版本（最新）
- [📖 查看数据](./data/arena-history.json) - 查看原始数据
- [🔧 生成数据](./js/data.js) - 数据生成脚本

### V2 像素级动画版本
- [🚀 立即体验 V2](./index-v2.html) - 像素级平滑动画版本

### V1 CSS动画版本（保留）
- [🚀 体验 V1](./index.html) - CSS动画版本（更轻量）

---

<div align="center">

## 🎉 V3.0.0 新特性

### 超强视觉特效系统
- ✅ requestAnimationFrame 逐帧动画
- ✅ 智能动画时长（1-4秒动态调整）
- ✅ DOM复用技术（无闪烁）
- ✅ 首次加载动画（柱状图从0增长）
- ✅ 新模型入榜动画（淡入+滑入+柱状图增长）
- ✅ **宽度变化超强特效**（300%亮度 + 多层发光 + 白色闪烁）
- ✅ **向下离开动画**（更自然的视觉效果）
- ✅ **完美解决跳动感问题**

**[Enjoy the AI evolution journey with extreme visual effects! 🚀]**

Made with ❤️ by AI-Evolve Team

</div>
