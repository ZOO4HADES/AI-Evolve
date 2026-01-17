/**
 * 批量获取 Chatbot Arena 历史数据（2024年1月 - 2025年6月）
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const DATASET_ID = 'mathewhe/chatbot-arena-elo';
const BASE_URL = 'https://huggingface.co/datasets/mathewhe/chatbot-arena-elo';

// 要获取的月份列表
const MONTHS = [
    '202401', '202402', '202403', '202404', '202405', '202406',
    '202407', '202408', '202409', '202410', '202411', '202412',
    '202501', '202502', '202503', '202504', '202505', '202506'
];

/**
 * 获取特定日期的数据
 */
async function fetchDate(dateTag) {
    return new Promise((resolve, reject) => {
        const url = `${BASE_URL}/resolve/${dateTag}/elo.csv`;
        console.log(`  尝试: ${dateTag}`);

        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        };

        https.get(url, options, (res) => {
            // 处理重定向
            if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
                let redirectUrl = res.headers.location;

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
 * 解析 CSV
 */
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

/**
 * 转换为我们的格式
 */
function convertToOurFormat(data) {
    const top10 = data.slice(0, 10);
    return top10.map((model, index) => ({
        rank: index + 1,
        name: model.Model || model['Model Markup'],
        elo: parseInt(model['Arena Score']) || 1200,
        organization: model.Organization || 'Unknown',
        votes: parseInt(model.Votes) || 0,
        license: model.License || 'Unknown'
    }));
}

/**
 * 为每个月尝试多个日期标签
 */
async function fetchMonthData(yearMonth) {
    const year = yearMonth.substring(0, 4);
    const month = yearMonth.substring(4, 6);

    // 尝试这个月的多个日期（月初、月中、月末）
    const datesToTry = [
        `${yearMonth}01`,  // 月初
        `${yearMonth}15`,  // 月中
        `${yearMonth}25`,  // 月末
    ];

    for (const dateTag of datesToTry) {
        try {
            const csvData = await fetchDate(dateTag);
            const parsedData = parseCSV(csvData);

            if (parsedData.length > 0) {
                console.log(`  ✅ 成功: ${dateTag} (${parsedData.length} 个模型)`);
                return {
                    date: `${year}-${month}`,
                    models: convertToOurFormat(parsedData),
                    sourceTag: dateTag
                };
            }
        } catch (error) {
            // 继续尝试下一个日期
            continue;
        }
    }

    console.log(`  ❌ 失败: ${yearMonth} (所有日期都失败)`);
    return null;
}

/**
 * 主函数
 */
async function fetchAllData() {
    console.log('========================================');
    console.log('Chatbot Arena 历史数据批量下载工具');
    console.log('========================================\n');
    console.log(`目标时间范围: ${MONTHS[0]} - ${MONTHS[MONTHS.length - 1]}`);
    console.log(`总月份数: ${MONTHS.length}\n`);

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < MONTHS.length; i++) {
        const yearMonth = MONTHS[i];
        console.log(`[${i + 1}/${MONTHS.length}] 正在获取 ${yearMonth}...`);

        const monthData = await fetchMonthData(yearMonth);

        if (monthData) {
            results.push(monthData);
            successCount++;
        } else {
            failCount++;
        }

        console.log('');
    }

    console.log('========================================');
    console.log('下载完成！');
    console.log('========================================\n');
    console.log(`成功: ${successCount}/${MONTHS.length} 个月`);
    console.log(`失败: ${failCount}/${MONTHS.length} 个月\n`);

    // 按日期排序
    results.sort((a, b) => a.date.localeCompare(b.date));

    // 生成最终文件
    generateFinalFile(results);

    return results;
}

/**
 * 生成最终的数据文件
 */
function generateFinalFile(monthlyData) {
    const output = `/**
 * Chatbot Arena 真实历史数据
 * 数据来源: Hugging Face - mathewhe/chatbot-arena-elo
 * 生成时间: ${new Date().toISOString()}
 * 时间范围: ${monthlyData[0]?.date || 'N/A'} - ${monthlyData[monthlyData.length - 1]?.date || 'N/A'}
 * 总月份数: ${monthlyData.length}
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

    const outputPath = path.join(__dirname, 'js', 'data-bundle-real-full.js');
    fs.writeFileSync(outputPath, output, 'utf8');

    console.log('✅ 已生成文件: js/data-bundle-real-full.js\n');

    // 同时生成一个CSV摘要
    generateSummaryCSV(monthlyData);
}

/**
 * 生成数据摘要CSV
 */
function generateSummaryCSV(monthlyData) {
    const summary = monthlyData.map(month => {
        const top3 = month.models.slice(0, 3).map(m => `${m.name} (${m.elo})`).join(', ');
        return {
            日期: month.date,
            数据源: month.sourceTag,
            模型数: month.models.length,
            Top3: top3
        };
    });

    const csvPath = path.join(__dirname, 'data-summary.csv');
    const csvContent = [
        Object.keys(summary[0]).join(','),
        ...summary.map(row => Object.values(row).join(','))
    ].join('\n');

    fs.writeFileSync(csvPath, csvContent, 'utf8');
    console.log('✅ 已生成摘要: data-summary.csv\n');
}

// 运行主函数
if (require.main === module) {
    fetchAllData().catch(console.error);
}

module.exports = { fetchAllData, fetchMonthData };
