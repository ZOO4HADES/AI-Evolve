const https = require('https');
const fs = require('fs');

const testUrls = [
    'https://huggingface.co/spaces/lmarena-ai/chatbot-arena-leaderboard/raw/main/leaderboard_table_20231002.csv',
    'https://huggingface.co/spaces/lmarena-ai/chatbot-arena-leaderboard/raw/main/leaderboard_table_20240202.csv'
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

async function main() {
    for (const url of testUrls) {
        console.log(`\n========================================`);
        console.log(`测试URL: ${url}`);
        console.log(`========================================\n`);

        try {
            const csvData = await downloadCSV(url);
            const lines = csvData.split('\n').slice(0, 15); // 只看前15行
            lines.forEach((line, i) => {
                console.log(`行${i}: ${line.substring(0, 200)}`);
            });

            // 保存完整文件
            const filename = url.split('/').pop();
            fs.writeFileSync(filename, csvData, 'utf8');
            console.log(`\n✅ 已保存完整文件到: ${filename}`);
        } catch (error) {
            console.log(`❌ 错误: ${error.message}`);
        }
    }
}

main();
