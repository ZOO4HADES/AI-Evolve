const data = require('./js/data-bundle-mixed-v2.js');

console.log('=== 检查 Claude Opus 4.5 (thinking-32k) 是否已删除 ===\n');

let found = false;
data.months.forEach((month, idx) => {
    const model = month.models.find(m => m.name.includes('thinking-32k'));
    if (model) {
        console.log(`❌ 在 ${month.date} 找到: ${model.name} (Rank ${model.rank}, ELO ${model.elo})`);
        found = true;
    }
});

if (!found) {
    console.log('✅ Claude Opus 4.5 (thinking-32k) 已完全删除\n');

    console.log('=== 12月前10名（新排名）===');
    data.months[11].models.forEach((m, i) => {
        console.log(`Rank ${m.rank}: ${m.name} - ELO ${m.elo} - ${m.organization}`);
    });
}
