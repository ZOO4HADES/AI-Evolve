/**
 * 从LMSYS官方博客抓取历史排行榜数据
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// LMSYS博客文章列表
const BLOG_POSTS = [
    {
        url: 'https://lmsys.org/blog/2023-05-10-leaderboard/',
        date: '2023-05-08',
        description: 'Week 2 Update'
    },
    {
        url: 'https://lmsys.org/blog/2023-06-22-leaderboard/',
        date: '2023-06-19',
        description: 'Week 8 Update'
    },
    {
        url: 'https://lmsys.org/blog/2023-05-03-arena/',
        date: '2023-05-03',
        description: 'Initial Release'
    }
];

async function fetchHTML(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        };

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) resolve(data);
                else reject(new Error(`HTTP ${res.statusCode}`));
            });
        }).on('error', reject);
    });
}

function extractLeaderboardFromHTML(html, date) {
    const models = [];

    // 尝试提取表格数据
    // 查找包含Elo rating的行
    const eloPattern = /(\w+(?:-\w+)*)\s+(\d+)\s+Elo/gi;
    let match;

    while ((match = eloPattern.exec(html)) !== null) {
        models.push({
            name: match[1],
            elo: parseInt(match[2])
        });
    }

    return models;
}

async function main() {
    console.log('========================================');
    console.log('从 LMSYS 博客抓取历史排行榜数据');
    console.log('========================================\n');

    const allData = [];

    for (const post of BLOG_POSTS) {
        console.log(`正在获取 ${post.description} (${post.date})...`);

        try {
            const html = await fetchHTML(post.url);
            const models = extractLeaderboardFromHTML(html, post.date);

            if (models.length > 0) {
                console.log(`  ✅ 提取了 ${models.length} 个模型`);

                allData.push({
                    date: post.date,
                    description: post.description,
                    models: models.slice(0, 20) // 只保留前20名
                });
            } else {
                console.log(`  ⚠️  未能提取模型数据`);
            }
        } catch (error) {
            console.log(`  ❌ 失败: ${error.message}`);
        }
    }

    console.log('\n========================================');
    console.log(`总共获取了 ${allData.length} 个时间点的数据`);
    console.log('========================================\n');

    // 保存为JSON格式
    const outputFile = path.join(__dirname, 'blog-leaderboards.json');
    fs.writeFileSync(outputFile, JSON.stringify(allData, null, 2), 'utf8');
    console.log(`✅ 已保存到: ${outputFile}\n`);

    // 显示摘要
    allData.forEach(data => {
        const top3 = data.models.slice(0, 3).map(m => `${m.name} (${m.elo})`).join(', ');
        console.log(`${data.date}: ${top3}`);
    });
}

main().catch(console.error);
