/**
 * 从 Hugging Face 获取 Chatbot Arena 真实历史数据
 * 并转换为 data-bundle.js 格式
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Hugging Face 数据集配置
const DATASET_ID = 'mathewhe/chatbot-arena-elo';
const BASE_URL = 'https://huggingface.co/datasets';
const RAW_URL = 'https://huggingface.co/datasets/mathewhe/chatbot-arena-elo/resolve/main';

/**
 * 下载 CSV 文件（处理重定向）
 */
async function downloadCSV(filename) {
    return new Promise((resolve, reject) => {
        const url = `${RAW_URL}/${filename}`;
        console.log(`正在下载: ${url}`);

        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        };

        https.get(url, options, (res) => {
            // 处理重定向
            if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
                let redirectUrl = res.headers.location;
                console.log(`  → 重定向到: ${redirectUrl}`);

                // 处理相对路径
                if (redirectUrl.startsWith('/')) {
                    const urlObj = new URL(url);
                    redirectUrl = `${urlObj.protocol}//${urlObj.host}${redirectUrl}`;
                }

                https.get(redirectUrl, options, (redirectRes) => {
                    let data = '';
                    redirectRes.on('data', (chunk) => { data += chunk; });
                    redirectRes.on('end', () => {
                        if (redirectRes.statusCode === 200) {
                            resolve(data);
                        } else {
                            reject(new Error(`HTTP ${redirectRes.statusCode}`));
                        }
                    });
                }).on('error', reject);
                return;
            }

            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(data);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
        }).on('error', reject);
    });
}

/**
 * 解析 CSV 到对象数组
 */
function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
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

/**
 * 转换为我们的数据格式
 */
function convertToOurFormat(data) {
    // 只取前10名
    const top10 = data.slice(0, 10);

    return top10.map((model, index) => {
        return {
            rank: index + 1,
            name: model.Model || model['Model Markup'],
            elo: parseInt(model['Arena Score']) || 1200,
            organization: model.Organization || 'Unknown',
            votes: parseInt(model.Votes) || 0,
            license: model.License || 'Unknown'
        };
    });
}

/**
 * 生成 data-bundle.js 文件
 */
function generateDataBundle(monthlyData) {
    const output = `/**
 * Chatbot Arena 真实历史数据
 * 数据来源: Hugging Face - mathewhe/chatbot-arena-elo
 * 生成时间: ${new Date().toISOString()}
 */

const ARENA_DATA = {
    metadata: {
        generated: new Date().toISOString(),
        source: "Hugging Face - mathewhe/chatbot-arena-elo",
        url: "https://huggingface.co/datasets/mathewhe/chatbot-arena-elo",
        total_months: ${monthlyData.length}
    },
    months: ${JSON.stringify(monthlyData, null, 2)}
};

// 导出数据（兼容不同环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ARENA_DATA;
}
`;

    fs.writeFileSync(
        path.join(__dirname, 'js', 'data-bundle-real.js'),
        output,
        'utf8'
    );

    console.log('✅ 已生成 js/data-bundle-real.js');
}

/**
 * 主函数：获取历史数据
 */
async function fetchHistoricalData() {
    console.log('========================================');
    console.log('Chatbot Arena 真实历史数据获取工具');
    console.log('========================================\n');

    try {
        // 1. 下载最新数据
        console.log('步骤 1/3: 下载最新数据...');
        const latestCSV = await downloadCSV('elo.csv');
        const latestData = parseCSV(latestCSV);
        console.log(`✅ 获取到 ${latestData.length} 个模型的最新数据`);

        // 2. 转换格式
        console.log('\n步骤 2/3: 转换数据格式...');
        const convertedData = convertToOurFormat(latestData);
        console.log(`✅ 提取了前 ${convertedData.length} 名模型`);

        // 3. 生成文件
        console.log('\n步骤 3/3: 生成 data-bundle-real.js...');
        generateDataBundle([{
            date: '2025-07',
            models: convertedData
        }]);

        console.log('\n========================================');
        console.log('✅ 完成！');
        console.log('========================================\n');
        console.log('下一步：');
        console.log('1. 检查 js/data-bundle-real.js 文件');
        console.log('2. 在 index-v3.html 中引用：');
        console.log('   <script src="js/data-bundle-real.js"></script>');
        console.log('\n注意：');
        console.log('- 当前只有最新数据（2025年7月）');
        console.log('- 需要手动添加更多历史月份的数据');
        console.log('- 可以通过指定 revision 参数获取历史版本：');
        console.log('  例如: revision="20241024"');

    } catch (error) {
        console.error('❌ 错误:', error.message);
        console.error('\n可能的原因：');
        console.error('1. 网络连接问题');
        console.error('2. Hugging Face 访问受限');
        console.error('\n建议：');
        console.error('- 使用代理或 VPN');
        console.error('- 或直接访问 Hugging Face 网站下载 CSV 文件');
    }
}

/**
 * 批量获取历史数据（需要知道具体的 revision 标签）
 */
async function fetchMultipleRevisions(revisions) {
    console.log(`\n批量获取 ${revisions.length} 个历史版本...\n`);

    const monthlyData = [];

    for (const revision of revisions) {
        try {
            console.log(`正在获取 ${revision}...`);

            // 这里需要使用 Hugging Face API 或 git 来获取特定 revision
            // 暂时跳过，需要手动指定
            console.log(`⚠️  ${revision}: 需要手动处理`);

        } catch (error) {
            console.error(`❌ ${revision}: ${error.message}`);
        }
    }

    return monthlyData;
}

// 运行主函数
if (require.main === module) {
    fetchHistoricalData().catch(console.error);
}

module.exports = {
    fetchHistoricalData,
    downloadCSV,
    parseCSV,
    convertToOurFormat
};
