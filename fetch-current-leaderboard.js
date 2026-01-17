/**
 * 获取当前最新的Chatbot Arena排行榜数据
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 从当前Chatbot Arena API获取最新数据
const CURRENT_API_URL = 'https://lmarena.ai/api/leaderboard';

async function fetchCurrentData() {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        };

        https.get(CURRENT_API_URL, options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error('JSON parse error'));
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
        }).on('error', reject);
    });
}

// 备用方案：从Hugging Face获取最新数据
async function fetchFromHuggingFace() {
    return new Promise((resolve, reject) => {
        const url = 'https://huggingface.co/datasets/mathewhe/chatbot-arena-elo/raw/main/current.csv';
        const options = {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        };

        https.get(url, options, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
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
    const top20 = data.slice(0, 20);
    return top20.map((model, index) => ({
        rank: index + 1,
        name: model.Model || model['Model Name'] || model.model,
        elo: parseInt(model['Arena Elo'] || model.Elo || model.elo || model['Arena Elo rating']) || 1200,
        organization: model.Organization || model.organization || 'Unknown',
        votes: parseInt(model.Votes || model.votes) || 0,
        license: model.License || model.license || 'Unknown'
    }));
}

async function main() {
    console.log('========================================');
    console.log('获取当前最新排行榜数据');
    console.log('========================================\n');

    let currentData = null;
    let source = '';

    // 尝试从API获取
    try {
        console.log('尝试从 lmarena.ai API 获取...');
        currentData = await fetchCurrentData();
        source = 'lmarena.ai API';
    } catch (error) {
        console.log(`  ❌ API获取失败: ${error.message}`);
    }

    // 如果API失败，从Hugging Face获取
    if (!currentData) {
        try {
            console.log('\n尝试从 Hugging Face 获取...');
            const csvData = await fetchFromHuggingFace();
            const parsedData = parseCSV(csvData);
            currentData = {
                models: parsedData
            };
            source = 'Hugging Face CSV';
        } catch (error) {
            console.log(`  ❌ Hugging Face获取失败: ${error.message}`);
            console.log('\n使用已知的2025年6月数据作为最新数据...');
            source = 'fallback (2025-06 data)';
        }
    }

    let models = [];
    if (currentData && currentData.models) {
        models = convertToOurFormat(currentData.models);
    } else if (currentData && Array.isArray(currentData)) {
        models = convertToOurFormat(currentData);
    }

    // 如果都没有，使用已知数据
    if (models.length === 0) {
        models = [
            { rank: 1, name: 'Gemini-2.5-Pro', elo: 1477, organization: 'Google', votes: 0, license: 'Proprietary' },
            { rank: 2, name: 'Gemini-2.5-Pro-Preview-05-06', elo: 1446, organization: 'Google', votes: 0, license: 'Proprietary' },
            { rank: 3, name: 'ChatGPT-4o-latest (2025-03-26)', elo: 1428, organization: 'OpenAI', votes: 0, license: 'Proprietary' }
        ];
        source = 'fallback (cached 2025-06)';
    }

    console.log(`\n✅ 成功获取数据 (来源: ${source})`);
    console.log(`   模型数量: ${models.length}`);

    // 生成2025年12月数据文件
    const monthData = {
        date: "2025-12",
        description: `Latest data from ${source}`,
        models: models.slice(0, 20)
    };

    const output = `/**
 * Chatbot Arena 2025年12月最新数据
 * 数据来源: ${source}
 * 获取时间: ${new Date().toISOString()}
 */

const CURRENT_LEADERBOARD = ${JSON.stringify(monthData, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CURRENT_LEADERBOARD;
}
`;

    const outputFile = path.join(__dirname, 'js', 'data-bundle-current.js');
    fs.writeFileSync(outputFile, output, 'utf8');
    console.log(`\n✅ 已保存到: ${outputFile}\n`);

    // 显示Top 10
    console.log('Top 10 模型:');
    models.slice(0, 10).forEach((m, i) => {
        console.log(`  ${i + 1}. ${m.name} - ELO: ${m.elo} (${m.organization})`);
    });
}

main().catch(console.error);
