/**
 * 尝试下载2024年的历史CSV文件
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 尝试的日期列表（基于常见的发布时间）
const TRY_DATES = [
    '20240115',
    '20240215',
    '20240315',
    '20240420', // Llama 3发布后
    '20240515',
    '20240615',
    '20240715',
    '20240815',
    '20240915',
    '20241015',
    '20241115',
    '20241215'
];

const BASE_URL = 'https://huggingface.co/spaces/lmarena-ai/chatbot-arena-leaderboard/raw/main/leaderboard_table_';

async function downloadCSV(date) {
    return new Promise((resolve, reject) => {
        const url = `${BASE_URL}${date}.csv`;
        const options = {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        };

        console.log(`  尝试: ${date}`);

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

function convertToOurFormat(date, data) {
    const top10 = data.slice(0, 10);
    return top10.map((model, index) => ({
        rank: index + 1,
        name: model.Model || model['Model Name'] || model.model,
        elo: parseInt(model['Arena Elo rating'] || model['Arena Elo'] || model.Elo || model.elo) || 1200,
        mt_bench: parseFloat(model['MT-bench (score)'] || model['MT-bench'] || 0),
        organization: model.Organization || model.organization || 'Unknown',
        license: model.License || model.license || 'Unknown'
    }));
}

async function main() {
    console.log('========================================');
    console.log('尝试获取2024年历史CSV文件');
    console.log('========================================\n');

    const results = [];

    for (const date of TRY_DATES) {
        try {
            const csvData = await downloadCSV(date);
            const parsedData = parseCSV(csvData);

            if (parsedData.length > 0) {
                // 检查是否有真实ELO数据
                const hasELO = parsedData.some(m => {
                    const elo = m['Arena Elo rating'] || m['Arena Elo'] || m.Elo || m.elo;
                    return elo && elo !== '-' && elo !== '1200';
                });

                if (hasELO) {
                    console.log(`  ✅ 成功: ${date} (${parsedData.length} 个模型, 包含ELO)`);
                    results.push({
                        date: date,
                        models: convertToOurFormat(date, parsedData)
                    });
                } else {
                    console.log(`  ⚠️  ${date}: 有数据但无ELO评分`);
                }
            }
        } catch (error) {
            console.log(`  ❌ 失败: ${date} (${error.message})`);
        }
    }

    console.log('\n========================================');
    console.log(`成功获取 ${results.length} 个月的数据`);
    console.log('========================================\n');

    if (results.length > 0) {
        // 生成文件
        const output = `/**
 * Chatbot Arena 2024年真实历史数据
 * 数据来源: Hugging Face Spaces - lmarena-ai/chatbot-arena-leaderboard
 * 生成时间: ${new Date().toISOString()}
 * 总月份数: ${results.length}
 */

const ARENA_DATA_2024 = {
    metadata: {
        generated: new Date().toISOString(),
        source: "Hugging Face Spaces - lmarena-ai/chatbot-arena-leaderboard",
        url: "https://huggingface.co/spaces/lmarena-ai/chatbot-arena-leaderboard",
        total_months: ${results.length}
    },
    months: ${JSON.stringify(results, null, 2)}
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ARENA_DATA_2024;
}
`;

        const outputFile = path.join(__dirname, 'js', 'data-bundle-2024-real.js');
        fs.writeFileSync(outputFile, output, 'utf8');
        console.log(`✅ 已生成: ${outputFile}\n`);

        // 显示摘要
        results.forEach(r => {
            const top3 = r.models.slice(0, 3).map(m => `${m.name} (ELO: ${m.elo})`).join(', ');
            console.log(`${r.date}: ${top3}`);
        });
    } else {
        console.log('⚠️  没有找到包含ELO数据的2024年CSV文件');
    }
}

main().catch(console.error);
