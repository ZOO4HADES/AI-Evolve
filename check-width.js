const data = require('./js/data-bundle-mixed-v2.js');

const m = data.months[11].models.find(m => m.name.includes('thinking-32k'));
console.log('=== Claude Opus 4.5 (thinking-32k) ===');
console.log('模型:', m.name);
console.log('ELO:', m.elo);
console.log('Rank:', m.rank);

const minElo = 1000, maxElo = 1600, minWidth = 30, maxWidth = 100;
const pct = (m.elo - minElo) / (maxElo - minElo);
const width = minWidth + pct * (maxWidth - minWidth);
console.log('计算宽度:', width.toFixed(1) + '%');

console.log('\n=== 12月前5名对比 ===');
data.months[11].models.slice(0, 5).forEach(x => {
    const p = (x.elo - minElo) / (maxElo - minElo);
    const w = minWidth + p * (maxWidth - minWidth);
    console.log(`  ${x.name}: ELO=${x.elo}, Rank=${x.rank}, 宽度=${w.toFixed(1)}%`);
});
