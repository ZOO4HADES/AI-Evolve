const data = require('./js/data-bundle-mixed-v2.js');

console.log('=== 验证2月数据 ===\n');

const febData = data.months[1]; // 2月数据
console.log(`日期: ${febData.date}`);
console.log(`说明: ${febData.description}\n`);

console.log('前10名:');
febData.models.forEach((m, i) => {
    console.log(`Rank ${m.rank}: ${m.name} - ELO ${m.elo} - ${m.organization}`);
});

console.log('\n=== 对比截图数据 ===');
console.log('截图数据应该显示：');
console.log('1. Grok-3 - 1402 - xAI');
console.log('2. Gemini 2.0 Flash Thinking - 1385 - Google');
console.log('3. Gemini 2.0 Pro - 1379 - Google');
console.log('4. Chatgpt-4o - 1377 - OpenAI');
console.log('5. DeepSeek R1 - 1361 - DeepSeek');
console.log('6. Gemini 2.0 Flash - 1356 - Google');
console.log('7. ChatGPT-o1 - 1353 - OpenAI');
console.log('8. Qwen2.5 MAX - 1332 - Alibaba');
console.log('9. DeepSeek-V3 - 1317 - DeepSeek');
console.log('10. Qwen2.5 Plus - 1313 - Alibaba');
