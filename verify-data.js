const data = require('./js/data-bundle-mixed-v2.js');

console.log('=== 1月数据（前6名）===');
data.months[0].models.slice(0, 6).forEach(m => {
    console.log(`Rank ${m.rank}: ${m.name} - ELO ${m.elo} - ${m.organization}`);
});

console.log('\n=== 2月数据（前6名）===');
data.months[1].models.slice(0, 6).forEach(m => {
    console.log(`Rank ${m.rank}: ${m.name} - ELO ${m.elo} - ${m.organization}`);
});

console.log('\n=== 12月数据（前6名）===');
data.months[11].models.slice(0, 6).forEach(m => {
    console.log(`Rank ${m.rank}: ${m.name} - ELO ${m.elo} - ${m.organization}`);
});

// 验证排序是否正确
console.log('\n=== 验证排序 ===');
data.months.forEach((month, idx) => {
    const sorted = [...month.models].sort((a, b) => b.elo - a.elo);
    let isCorrect = true;
    month.models.forEach((m, i) => {
        if (m.rank !== i + 1) isCorrect = false;
        if (Math.abs(m.elo - sorted[i].elo) > 0.1) isCorrect = false;
    });
    console.log(`${month.date}: ${isCorrect ? '✅ 排序正确' : '❌ 排序错误'}`);
});
