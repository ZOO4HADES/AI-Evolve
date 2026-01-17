const data = require('./js/data-bundle-mixed-v2.js');

console.log('=================================================');
console.log('          2025年2月 真实数据（来自截图）');
console.log('=================================================\n');

const feb = data.months[1];
console.log(`📅 日期: ${feb.date}`);
console.log(`📝 说明: ${feb.description}\n`);

console.log('排名   模型名称                                    ELO    公司');
console.log('─────────────────────────────────────────────────────────────────');
feb.models.forEach(m => {
    const name = m.name.padEnd(42);
    const elo = m.elo.toString().padStart(6);
    const org = m.organization.padEnd(12);
    console.log(`#${m.rank.toString().padEnd(4)} ${name} ${elo}  ${org}`);
});

console.log('\n');
console.log('=================================================');
console.log('          2025年12月 真实数据（榜单数据）');
console.log('=================================================\n');

const dec = data.months[11];
console.log(`📅 日期: ${dec.date}`);
console.log(`📝 说明: ${dec.description}\n`);

console.log('排名   模型名称                                    ELO    公司');
console.log('─────────────────────────────────────────────────────────────────');
dec.models.forEach(m => {
    const name = m.name.padEnd(42);
    const elo = m.elo.toString().padStart(6);
    const org = m.organization.padEnd(12);
    console.log(`#${m.rank.toString().padEnd(4)} ${name} ${elo}  ${org}`);
});

console.log('\n');
console.log('=================================================');
console.log('                   数据统计');
console.log('=================================================');
console.log(`总月份数: ${data.metadata.total_months}`);
console.log(`真实数据月份数: ${data.metadata.real_data_months}`);
console.log(`生成数据月份数: ${data.metadata.generated_data_months}`);
