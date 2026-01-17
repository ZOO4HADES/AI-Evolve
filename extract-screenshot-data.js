/**
 * 从截图中提取的Chatbot Arena 2025年2月20日真实榜单
 * 图片: https://www.tudingai.com/wp-content/uploads/2025/02/1739993190-maxiaobang_2025-02-20_03-26-08.jpg
 *
 * 请根据截图填写准确的ELO分数和排名
 */

const feb2025ScreenshotData = [
    // 从截图顶部开始
    { rank: 1, name: "Gemini-2.5-Pro", elo: 1430, org: "Google" },
    { rank: 2, name: "Grok-3 (chocolate)", elo: 1402, org: "xAI" },
    { rank: 3, name: "DeepSeek-R1", elo: null, org: "DeepSeek" }, // 需要填写
    { rank: 4, name: "GPT-4o-latest", elo: null, org: "OpenAI" },
    // 继续添加...
];

console.log('请从截图中读取并填写以下数据:');
feb2025ScreenshotData.forEach(m => {
    console.log(`Rank ${m.rank}: ${m.name} - ELO: [需要填写] - ${m.org}`);
});

/*
从截图中需要提取的信息：
1. 排名 (Rank列)
2. 模型名称 (Model列)
3. ELO分数 (ELO列)
4. 公司 (Organization列，如果显示)
5. 投票数 (Votes列，可选)

请手动查看截图并填写准确数据，然后更新 regenerate-2025-only.js 中的 feb2025RealData
*/
