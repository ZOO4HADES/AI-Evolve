/**
 * 控制台诊断脚本
 * 在 index-v3.html 页面的浏览器控制台（F12）中运行此脚本
 */

console.log('========================================');
console.log('🔍 柱状图宽度诊断');
console.log('========================================');

// 1. 检查JS文件版本
console.log('\n1️⃣ 检查JS文件版本：');
const scripts = document.querySelectorAll('script[src]');
scripts.forEach(script => {
    if (script.src.includes('chart-v3.js')) {
        console.log(`chart-v3.js: ${script.src}`);
        if (script.src.includes('v=9')) {
            console.log('✅ 版本正确 (v=9)');
        } else {
            console.log('❌ 版本错误！应该是 v=9，当前是:', script.src.split('?v=')[1]);
        }
    }
});

// 2. 测试计算函数
console.log('\n2️⃣ 测试计算函数：');
function testCalculateBarWidth(elo) {
    const minElo = 1000;
    const maxElo = 1600;
    const minWidth = 30;
    const maxWidth = 100;

    const percentage = (elo - minElo) / (maxElo - minElo);
    const width = minWidth + percentage * (maxWidth - minWidth);

    return width;
}

[1400, 1500, 1567, 1600].forEach(elo => {
    const width = testCalculateBarWidth(elo);
    console.log(`ELO ${elo}: ${width.toFixed(2)}%`);
});

// 3. 检查当前页面的柱状图实际宽度
console.log('\n3️⃣ 检查实际渲染的柱状图宽度：');
const bars = document.querySelectorAll('.bar');
console.log(`找到 ${bars.length} 个柱状图`);

// 检查前5个
bars.forEach((bar, index) => {
    if (index < 5) {
        const row = bar.closest('.model-row');
        const elo = row.querySelector('.elo').textContent;
        const name = row.querySelector('.model-name').textContent;
        const computedWidth = window.getComputedStyle(bar).width;
        const styleWidth = bar.style.width;

        console.log(`\n#${index + 1} ${name}:`);
        console.log(`  ELO: ${elo}`);
        console.log(`  style.width: ${styleWidth}`);
        console.log(`  计算后宽度: ${computedWidth}`);

        // 检查是否有max-width限制
        const maxWidth = window.getComputedStyle(bar).maxWidth;
        console.log(`  max-width: ${maxWidth}`);

        if (maxWidth !== 'none') {
            console.log(`  ⚠️ 警告：存在max-width限制！`);
        }
    }
});

// 4. 查找ELO 1567的柱状图
console.log('\n4️⃣ 查找ELO 1567的柱状图：');
const allRows = document.querySelectorAll('.model-row');
allRows.forEach(row => {
    const elo = row.querySelector('.elo');
    const bar = row.querySelector('.bar');
    if (elo && bar && elo.textContent === '1567') {
        const name = row.querySelector('.model-name').textContent;
        const styleWidth = bar.style.width;
        const computedWidth = window.getComputedStyle(bar).width;
        const maxWidth = window.getComputedStyle(bar).maxWidth;

        console.log(`找到模型: ${name}`);
        console.log(`  ELO: ${elo.textContent}`);
        console.log(`  style.width: ${styleWidth}`);
        console.log(`  计算后宽度: ${computedWidth}`);
        console.log(`  max-width: ${maxWidth}`);

        // 计算预期宽度
        const expectedWidth = testCalculateBarWidth(1567);
        console.log(`  预期宽度: ${expectedWidth.toFixed(2)}%`);

        // 检查是否匹配
        const actualWidth = parseFloat(styleWidth);
        if (Math.abs(actualWidth - expectedWidth) < 0.1) {
            console.log('  ✅ 宽度计算正确！');
        } else {
            console.log(`  ❌ 宽度不匹配！实际${actualWidth}%，预期${expectedWidth.toFixed(2)}%`);
        }

        if (maxWidth !== 'none') {
            console.log(`  ⚠️ 存在max-width限制: ${maxWidth}`);
        }
    }
});

// 5. 检查CSS规则
console.log('\n5️⃣ 检查CSS规则：');
const allSheets = Array.from(document.styleSheets);
let foundBarRule = false;

allSheets.forEach(sheet => {
    try {
        const rules = Array.from(sheet.cssRules || sheet.rules || []);
        rules.forEach(rule => {
            if (rule.selectorText && rule.selectorText.includes('.bar')) {
                foundBarRule = true;
                console.log(`找到 .bar 规则: ${rule.cssText}`);
            }
        });
    } catch (e) {
        // CORS限制，无法读取
    }
});

if (!foundBarRule) {
    console.log('⚠️ 无法读取CSS规则（可能是CORS限制）');
}

// 6. 检查inline样式
console.log('\n6️⃣ 检查页面inline样式：');
const inlineStyles = document.querySelectorAll('style');
inlineStyles.forEach(style => {
    if (style.textContent.includes('.bar')) {
        console.log('找到inline样式包含.bar规则');
        if (style.textContent.includes('max-width')) {
            console.log('⚠️ inline样式中包含max-width规则');
        }
    }
});

console.log('\n========================================');
console.log('诊断完成');
console.log('========================================');

// 7. 提供修复建议
console.log('\n📋 修复建议：');
console.log('如果发现问题，请按以下步骤操作：');
console.log('1. 硬刷新页面：Ctrl + Shift + R (Windows) 或 Cmd + Shift + R (Mac)');
console.log('2. 清除浏览器缓存：Ctrl + Shift + Delete → 选择"缓存的图像和文件"');
console.log('3. 如果仍有问题，在控制台执行以下代码强制设置宽度：');
console.log(`
document.querySelectorAll('.bar').forEach(bar => {
    bar.style.maxWidth = 'none';
});
`);
