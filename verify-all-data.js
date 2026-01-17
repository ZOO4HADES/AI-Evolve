const data = require('./js/data-bundle-mixed-v2.js');

console.log('=================================================');
console.log('        2025年全年数据验证（12个月）');
console.log('=================================================\n');

data.months.forEach((month, idx) => {
    console.log(`\n${month.date} (${month.models.length}个模型)`);
    console.log('─────────────────────────────────────────────────────────────');
    month.models.slice(0, 5).forEach(m => {
        console.log(`  #${m.rank} ${m.name.padEnd(35)} ELO: ${m.elo}  ${m.organization}`);
    });
    if (month.models.length > 5) {
        console.log(`  ... 还有 ${month.models.length - 5} 个模型`);
    }
});

console.log('\n=================================================');
console.log('              数据演进趋势');
console.log('=================================================\n');

// 显示几个关键模型在不同月份的ELO变化
const keyModels = ['Grok-3', 'DeepSeek R1', 'Gemini-3-Pro', 'GPT-5.2-high'];

keyModels.forEach(modelName => {
    console.log(`\n${modelName}:`);
    data.months.forEach(month => {
        const model = month.models.find(m => m.name === modelName);
        if (model) {
            console.log(`  ${month.date}: ELO ${model.elo} (Rank #${model.rank})`);
        }
    });
});

console.log('\n=================================================');
console.log('              统计信息');
console.log('=================================================\n');
console.log(`总月份数: ${data.metadata.total_months}`);
console.log(`真实数据月份: ${data.metadata.real_data_months} (1月、2月、12月)`);
console.log(`生成数据月份: ${data.metadata.generated_data_months}`);
