# v3.18.0 更新日志

## 更新日期
2025年1月17日

## 主要变更

### 📊 数据更新

1. **时间范围变更**
   - ❌ 旧版：2024年1月 - 2025年12月（24个月）
   - ✅ 新版：2025年1月 - 2025年12月（12个月）

2. **真实数据来源**
   - ✅ 2025年1月：DeepSeek R1发布（ELO 1357）
   - ✅ 2025年2月：Grok-3发布（ELO 1402），来自Chatbot Arena截图
   - ✅ 2025年12月：Chatbot Arena年终榜单（前10名）
   - 📈 其他月份：基于真实模型发布时间推测生成

3. **2025年2月真实榜单**（来自截图）
   ```
   Rank 1: Grok-3 - 1402 - xAI
   Rank 2: Gemini 2.0 Flash Thinking - 1385 - Google
   Rank 3: Gemini 2.0 Pro - 1379 - Google
   Rank 4: Chatgpt-4o - 1377 - OpenAI
   Rank 5: DeepSeek R1 - 1361 - DeepSeek
   Rank 6: Gemini 2.0 Flash - 1356 - Google
   Rank 7: ChatGPT-o1 - 1353 - OpenAI
   Rank 8: Qwen2.5 MAX - 1332 - Alibaba
   Rank 9: DeepSeek-V3 - 1317 - DeepSeek
   Rank 10: Qwen2.5 Plus - 1313 - Alibaba
   ```

4. **新增模型**（从2月榜单添加）
   - Gemini 2.0 Flash Thinking (Google)
   - Chatgpt-4o (OpenAI)
   - Gemini 2.0 Flash (Google)
   - ChatGPT-o1 (OpenAI)
   - Qwen2.5 MAX (Alibaba)
   - Qwen2.5 Plus (Alibaba)

5. **模型名称更新**
   - `Grok-3 (chocolate)` → `Grok-3`
   - `DeepSeek-R1` → `DeepSeek R1`
   - `GPT-4o-latest` → `Chatgpt-4o`

### 🎨 视觉更新

1. **xAI颜色调整**
   - ❌ 旧版：`#1a1a2e`（深色）
   - ✅ 新版：`#00F0FF`（亮青色）

### 📁 文件变更

1. **新增文件**
   - `regenerate-2025-only.js` - 数据生成脚本

2. **修改文件**
   - `js/data-bundle-mixed-v2.js` - 重新生成数据（12个月）
   - `js/chart-v3.js` - 更新公司颜色映射
   - `index-v3.html` - 版本号更新为 v=18
   - `README.md` - 更新项目文档

3. **删除的模型**
   - ❌ Claude Opus 4.5 (thinking-32k) - 已从所有数据中删除

### 📈 数据统计

| 项目 | 旧版 | 新版 |
|------|------|------|
| 时间范围 | 24个月 | 12个月 |
| 数据点数量 | 240个 | 120个 |
| 真实数据月份 | 1个月 | 3个月（1月、2月、12月）|
| 每月模型数 | 前10名 | 前10名 |
| 公司数量 | 11家 | 12家 |
| 数据文件大小 | ~94KB | ~50KB |

### 🔧 技术细节

**数据生成逻辑**：
```javascript
// 1. 使用2月和12月的真实数据作为基准
// 2. 12月模型按推测发布时间逐步加入（3-11月）
// 3. 2月模型持续演进，如果在12月榜单则增长，否则下降
// 4. 每月按ELO降序排序，取前10名
```

**模型发布时间推测**：
- Grok-3: 2025-02
- Gemini 2.0系列: 2025-02
- ChatGPT-o1: 2025-02
- Qwen2.5系列: 2025-02
- DeepSeek-V3: 2025-02
- Gemini-2.5-Pro: 2025-03
- 其他模型：根据12月榜单推测

---

## 下一步计划

### v3.19.0 规划
- [ ] 添加更多历史真实数据（如有可能）
- [ ] 优化模型发布时间推测算法
- [ ] 添加数据来源链接到Chatbot Arena

### v4.0.0 规划
- [ ] 接入Chatbot Arena API获取实时数据
- [ ] 支持自定义时间范围
- [ ] 添加数据导出功能

---

## 致谢

特别感谢 Chatbot Arena (LMSYS) 提供的公开数据：
- 网址：https://openlm.ai/chatbot-arena/
- 2月截图来源：https://www.tudingai.com/wp-content/uploads/2025/02/1739993190-maxiaobang_2025-02-20_03-26-08.jpg
