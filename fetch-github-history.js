/**
 * 从 GitHub/Hugging Face Spaces 获取历史数据
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 从搜索结果发现的历史 CSV 文件
const HISTORICAL_FILES = [
    { date: '2023-10', url: 'https://huggingface.co/spaces/lmarena-ai/chatbot-arena-leaderboard/raw/main/leaderboard_table_20231002.csv' },
    { date: '2024-02', url: 'https://huggingface.co/spaces/lmarena-ai/chatbot-arena-leaderboard/raw/main/leaderboard_table_20240202.csv' },
    { date: '2024-08', url: 'https://huggingface.co/spaces/lmarena-ai/chatbot-arena-leaderboard/raw/main/leaderboard_table_20240830.csv' },
];

async function downloadCSV(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        };

        https.get(url, options, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
                let redirectUrl = res.headers.location;
                if (redirectUrl.startsWith('/')) {
                    const urlObj = new URL(url);
                    redirectUrl = `${urlObj.protocol}//${urlObj.host}${redirectUrl}`;
                }
                https.get(redirectUrl, options, (redirectRes) => {
                    let data = '';
                    redirectRes.on('data', (chunk) => { data += chunk; });
                    redirectRes.on('end', () => {
                        if (redirectRes.statusCode === 200) resolve(data);
                        else reject(new Error(`HTTP ${redirectRes.statusCode}`));
                    });
                }).on('error', reject);
                return;
            }

            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) resolve(data);
                else reject(new Error(`HTTP ${res.statusCode}`));
            });
        }).on('error', reject);
    });
}

function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((header, index) => {
            obj[header.trim()] = values[index] ? values[index].trim() : '';
        });
        return obj;
    });
}

function convertToOurFormat(data) {
    const top10 = data.slice(0, 10);
    return top10.map((model, index) => ({
        rank: index + 1,
        name: model.Model || model['Model Name'] || model.model,
        elo: parseInt(model['Arena Score'] || model.Elo || model.elo) || 1200,
        organization: model.Organization || model.organization || 'Unknown',
        votes: parseInt(model.Votes || model.votes) || 0,
        license: model.License || model.license || 'Unknown'
    }));
}

async function main() {
    console.log('========================================');
    console.log('从 Hugging Face Spaces 获取历史数据');
    console.log('========================================\n');

    const results = [];

    for (const file of HISTORICAL_FILES) {
        console.log(`正在获取 ${file.date}...`);
        try {
            const csvData = await downloadCSV(file.url);
            const parsedData = parseCSV(csvData);

            if (parsedData.length > 0) {
                console.log(`  ✅ 成功: ${parsedData.length} 个模型`);
                results.push({
                    date: file.date,
                    models: convertToOurFormat(parsedData)
                });
            }
        } catch (error) {
            console.log(`  ❌ 失败: ${error.message}`);
        }
    }

    // 添加之前获取的2025年数据
    console.log('\n添加之前获取的2025年数据...');
    try {
        const existingData = fs.readFileSync(path.join(__dirname, 'js', 'data-bundle-real-full.js'), 'utf8');
        // 提取 months 数组
        const match = existingData.match(/months: ([\s\S]+?)\n}/);
        if (match) {
            const months2025 = eval(match[0].replace('months: ', ''));
            results.push(...months2025);
            console.log(`  ✅ 添加了 ${months2025.length} 个月的2025年数据`);
        }
    } catch (error) {
        console.log(`  ⚠️  无法读取2025年数据`);
    }

    results.sort((a, b) => a.date.localeCompare(b.date));

    console.log('\n========================================');
    console.log(`总共获取了 ${results.length} 个月的数据`);
    console.log('========================================\n');

    // 生成最终文件
    const output = `/**
 * Chatbot Arena 真实历史数据
 * 数据来源: Hugging Face Spaces - lmarena-ai/chatbot-arena-leaderboard
 * 生成时间: ${new Date().toISOString()}
 * 总月份数: ${results.length}
 */

const ARENA_DATA = {
    metadata: {
        generated: new Date().toISOString(),
        source: "Hugging Face Spaces - lmarena-ai/chatbot-arena-leaderboard",
        url: "https://huggingface.co/spaces/lmarena-ai/chatbot-arena-leaderboard",
        total_months: ${results.length}
    },
    months: ${JSON.stringify(results, null, 2)}
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ARENA_DATA;
}
`;

    fs.writeFileSync(path.join(__dirname, 'js', 'data-bundle-historical.js'), output, 'utf8');
    console.log('✅ 已生成: js/data-bundle-historical.js\n');

    // 生成摘要
    results.forEach(r => {
        const top3 = r.models.slice(0, 3).map(m => `${m.name} (${m.elo})`).join(', ');
        console.log(`${r.date}: ${top3}`);
    });
}

main().catch(console.error);
