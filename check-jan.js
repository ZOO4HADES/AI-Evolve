const data = require('./js/data-bundle-mixed-v2.js');

console.log('=== 2025年1月数据 ===\n');
data.months[0].models.forEach(m => {
    console.log(`Rank #${m.rank}: ${m.name} - ELO ${m.elo} - ${m.organization}`);
});
console.log(`\n总计: ${data.months[0].models.length} 个模型`);
