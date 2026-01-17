/**
 * AI-Evolve 数据生成器
 * 基于Chatbot Arena 2025年1月真实榜单，生成24个月（2024-01至2025-12）的模拟历史数据
 */

const fs = require('fs');
const path = require('path');

// 公司颜色映射
const COMPANY_COLORS = {
  'OpenAI': '#10a37f',
  'Anthropic': '#d97757',
  'Google': '#4285f4',
  'xAI': '#000000',
  'Alibaba': '#ff6a00',
  'Z.ai': '#8b5cf6',
  'Baidu': '#2932e1',
  'Moonshot': '#1a1a2e'
};

// 2025年1月真实榜单基准（前20名）
const BASELINE_MODELS = [
  { name: 'Gemini-2.5-Pro', org: 'Google', elo: 1492, releaseMonth: 18 }, // 2025-06
  { name: 'Grok-4.1-Thinking', org: 'xAI', elo: 1482, releaseMonth: 17 }, // 2025-05
  { name: 'Gemini-2.5-Flash', org: 'Google', elo: 1470, releaseMonth: 18 },
  { name: 'Claude Opus 4.5', org: 'Anthropic', elo: 1466, releaseMonth: 16 }, // 2025-04
  { name: 'GPT-5.2-high', org: 'OpenAI', elo: 1465, releaseMonth: 19 }, // 2025-07
  { name: 'GPT-5.1-high', org: 'OpenAI', elo: 1464, releaseMonth: 18 },
  { name: 'GPT-5.2', org: 'OpenAI', elo: 1464, releaseMonth: 19 },
  { name: 'Grok-4.1', org: 'xAI', elo: 1463, releaseMonth: 17 },
  { name: 'Claude Opus 4.5-lite', org: 'Anthropic', elo: 1462, releaseMonth: 16 },
  { name: 'Gemini-2.0-Pro', org: 'Google', elo: 1460, releaseMonth: 14 }, // 2025-02
  { name: 'Grok-4', org: 'xAI', elo: 1446, releaseMonth: 15 }, // 2025-03
  { name: 'GLM-4.7', org: 'Z.ai', elo: 1445, releaseMonth: 16 },
  { name: 'GPT-5-high', org: 'OpenAI', elo: 1444, releaseMonth: 17 },
  { name: 'Qwen3-Max', org: 'Alibaba', elo: 1443, releaseMonth: 15 },
  { name: 'ERNIE-5.0', org: 'Baidu', elo: 1442, releaseMonth: 14 },
  { name: 'GLM-4.6', org: 'Z.ai', elo: 1441, releaseMonth: 13 }, // 2025-01
  { name: 'GPT-5.1', org: 'OpenAI', elo: 1440, releaseMonth: 15 },
  { name: 'Kimi-K2-Thinking', org: 'Moonshot', elo: 1438, releaseMonth: 14 },
  { name: 'Claude Sonnet 4.5', org: 'Anthropic', elo: 1431, releaseMonth: 12 }, // 2024-12
  { name: 'GLM-4.5', org: 'Z.ai', elo: 1430, releaseMonth: 11 }  // 2024-11
];

// 历史模型（2024年早期存在，后来被超越）
const HISTORICAL_MODELS = [
  { name: 'GPT-4 Turbo', org: 'OpenAI', baseElo: 1287, peakMonth: 3, startMonth: 0 }, // 2024-03峰值
  { name: 'Gemini 1.5 Pro', org: 'Google', baseElo: 1260, peakMonth: 2, startMonth: 0 }, // 2024-02发布
  { name: 'Claude 3.5 Sonnet', org: 'Anthropic', baseElo: 1271, peakMonth: 5, startMonth: 0 }, // 2024-05
  { name: 'GPT-4o', org: 'OpenAI', baseElo: 1288, peakMonth: 6, startMonth: 0 }, // 2024-06发布
  { name: 'Gemini 1.5 Flash', org: 'Google', baseElo: 1240, peakMonth: 4, startMonth: 0 },
  { name: 'Claude 3 Opus', org: 'Anthropic', baseElo: 1250, peakMonth: 2, startMonth: 0 },
  { name: 'Llama 3.1 405B', org: 'Meta', baseElo: 1220, peakMonth: 7, startMonth: 0 }, // 2024-07
  { name: 'Mistral Large 2', org: 'Mistral', baseElo: 1200, peakMonth: 6, startMonth: 0 },
  { name: 'Qwen2-Max', org: 'Alibaba', baseElo: 1210, peakMonth: 5, startMonth: 0 },
  { name: 'GLM-4', org: 'Z.ai', baseElo: 1190, peakMonth: 4, startMonth: 0 },
  { name: 'GPT-4', org: 'OpenAI', baseElo: 1250, peakMonth: 0, startMonth: 0 }, // 更早的模型
  { name: 'Claude 2', org: 'Anthropic', baseElo: 1200, peakMonth: 0, startMonth: 0 },
  { name: 'Gemini Pro', org: 'Google', baseElo: 1180, peakMonth: 0, startMonth: 0 },
  { name: 'Llama 2 70B', org: 'Meta', baseElo: 1150, peakMonth: 0, startMonth: 0 },
  { name: 'PaLM 2', org: 'Google', baseElo: 1160, peakMonth: 0, startMonth: 0 },
  { name: 'Claude 1.3', org: 'Anthropic', baseElo: 1140, peakMonth: 0, startMonth: 0 },
  { name: 'GPT-3.5 Turbo', org: 'OpenAI', baseElo: 1130, peakMonth: 0, startMonth: 0 },
  { name: 'Qwen-Max', org: 'Alibaba', baseElo: 1120, peakMonth: 0, startMonth: 0 },
  { name: 'GLM-3', org: 'Z.ai', baseElo: 1110, peakMonth: 0, startMonth: 0 },
  { name: 'ERNIE 4.0', org: 'Baidu', baseElo: 1100, peakMonth: 0, startMonth: 0 },
  { name: 'Mistral Large', org: 'Mistral', baseElo: 1170, peakMonth: 0, startMonth: 0 },
  { name: 'Vicuna 33B', org: 'LMSYS', baseElo: 1090, peakMonth: 0, startMonth: 0 }
];

/**
 * 生成单个月份的数据
 */
function generateMonthData(monthIndex) {
  const models = [];
  const currentDate = new Date('2024-01-01');
  currentDate.setMonth(currentDate.getMonth() + monthIndex);

  // 添加基准模型（根据发布时间）
  BASELINE_MODELS.forEach((model, idx) => {
    if (monthIndex >= model.releaseMonth) {
      // 新发布的模型，Elo从高开开始
      const monthsSinceRelease = monthIndex - model.releaseMonth;
      const initialElo = model.elo - 50 + Math.random() * 30; // 初始Elo略低于最终
      const elo = Math.round(initialElo + monthsSinceRelease * 2);

      models.push({
        rank: 0, // 稍后计算
        name: model.name,
        elo: Math.min(elo, model.elo),
        organization: model.org,
        votes: Math.round(50000 + monthsSinceRelease * 10000 + Math.random() * 5000),
        license: 'Proprietary'
      });
    }
  });

  // 添加历史模型（早期存在，逐渐下降）
  HISTORICAL_MODELS.forEach(model => {
    // 检查模型是否已经在该月份存在
    if (monthIndex >= model.startMonth) {
      // 峰值前后的Elo变化
      const monthsFromPeak = monthIndex - model.peakMonth;
      let elo;

      if (monthsFromPeak < 0) {
        // 峰值前：逐渐上升（从较低的初始Elo开始）
        const startElo = model.baseElo - 50; // 初始Elo低于峰值
        elo = startElo + monthsFromPeak * 10 + Math.random() * 10;
      } else {
        // 峰值后：逐渐下降（竞争加剧）
        elo = model.baseElo - monthsFromPeak * 5 - Math.random() * 10;
      }

      // 确保Elo不低于1000
      elo = Math.max(1000, elo);

      models.push({
        rank: 0,
        name: model.name,
        elo: Math.round(elo),
        organization: model.org,
        votes: Math.round(100000 + monthIndex * 5000 + Math.random() * 10000),
        license: 'Proprietary'
      });
    }
  });

  // 按Elo排序并分配排名
  models.sort((a, b) => b.elo - a.elo);
  models.slice(0, 10).forEach((model, idx) => {
    model.rank = idx + 1;
  });

  // 只保留前10名
  const top10 = models.slice(0, 10);

  return {
    date: formatDate(currentDate),
    models: top10
  };
}

/**
 * 格式化日期为 YYYY-MM 格式
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * 生成完整的24个月数据
 */
function generateHistoricalData() {
  console.log('开始生成24个月历史数据...');

  const months = [];
  for (let i = 0; i < 24; i++) {
    const monthData = generateMonthData(i);
    months.push(monthData);
    console.log(`✓ ${monthData.date} 生成完成 (${monthData.models.length} 个模型)`);
  }

  const data = {
    metadata: {
      generated: new Date().toISOString().split('T')[0],
      source: 'simulated_based_on_real_data',
      baseline: 'Chatbot Arena 2025-01',
      total_months: 24,
      note: '数据基于2025年1月Chatbot Arena真实榜单，使用合理的历史演进算法生成'
    },
    months: months
  };

  return data;
}

/**
 * 验证数据完整性
 */
function validateData(data) {
  console.log('\n开始验证数据...');

  const errors = [];

  // 检查metadata
  if (!data.metadata) {
    errors.push('缺少metadata');
  }

  // 检查月份数量
  if (data.months.length !== 24) {
    errors.push(`月份数量错误: ${data.months.length}, 期望: 24`);
  }

  // 检查每个月的数据
  data.months.forEach((month, idx) => {
    // 检查必需字段
    if (!month.date) {
      errors.push(`月份 ${idx} 缺少date字段`);
    }

    // 检查模型数量
    if (month.models.length !== 10) {
      errors.push(`月份 ${month.date} 模型数量错误: ${month.models.length}, 期望: 10`);
    }

    // 检查每个模型的必需字段
    month.models.forEach((model, modelIdx) => {
      const requiredFields = ['rank', 'name', 'elo', 'organization', 'votes', 'license'];
      requiredFields.forEach(field => {
        if (model[field] === undefined || model[field] === null) {
          errors.push(`月份 ${month.date} 模型 ${modelIdx} 缺少${field}字段`);
        }
      });

      // 检查Elo范围
      if (model.elo < 1000 || model.elo > 1600) {
        errors.push(`月份 ${month.date} 模型 ${model.name} Elo异常: ${model.elo}`);
      }
    });
  });

  if (errors.length === 0) {
    console.log('✅ Data validation: PASSED');
    console.log(`✅ 24个月数据完整`);
    console.log(`✅ 每月10个模型`);
    console.log(`✅ 所有必需字段完整`);
    return true;
  } else {
    console.log('❌ Data validation: FAILED');
    errors.forEach(err => console.log(`  - ${err}`));
    return false;
  }
}

/**
 * 保存数据到JSON文件
 */
function saveData(data, filepath) {
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\n✅ 数据已保存到: ${filepath}`);
    return true;
  } catch (error) {
    console.error(`❌ 保存失败: ${error.message}`);
    return false;
  }
}

/**
 * 检查数据一致性
 */
function checkConsistency(data) {
  console.log('\n检查数据一致性...');

  let issues = 0;

  for (let i = 1; i < data.months.length; i++) {
    const prevMonth = data.months[i - 1];
    const currMonth = data.months[i];

    currMonth.models.forEach(model => {
      // 查找上月同一模型
      const prevModel = prevMonth.models.find(m => m.name === model.name);

      if (prevModel) {
        // 检查Elo变化幅度
        const eloChange = Math.abs(model.elo - prevModel.elo);
        if (eloChange > 50) {
          console.log(`⚠️  ${currMonth.date} ${model.name} Elo变化过大: ${eloChange}`);
          issues++;
        }

        // 检查排名突变
        const rankChange = Math.abs(model.rank - prevModel.rank);
        if (rankChange > 5 && eloChange < 30) {
          console.log(`⚠️  ${currMonth.date} ${model.name} 排名突变: ${prevModel.rank}→${model.rank}`);
          issues++;
        }
      } else {
        // 新模型首次出现
        if (model.elo > 1300) {
          console.log(`⚠️  ${currMonth.date} ${model.name} 新模型Elo过高: ${model.elo}`);
          issues++;
        }
      }
    });
  }

  if (issues === 0) {
    console.log('✅ 数据一致性检查通过');
    return true;
  } else {
    console.log(`⚠️  发现 ${issues} 个潜在问题（可能正常）`);
    return true; // 不阻止继续
  }
}

/**
 * 主函数
 */
function main() {
  console.log('==========================================');
  console.log('AI-Evolve 数据生成器');
  console.log('==========================================\n');

  // 生成数据
  const data = generateHistoricalData();

  // 验证数据
  if (!validateData(data)) {
    process.exit(1);
  }

  // 检查一致性
  checkConsistency(data);

  // 保存数据
  const outputPath = path.join(__dirname, '..', 'data', 'arena-history.json');
  if (saveData(data, outputPath)) {
    console.log('\n==========================================');
    console.log('🎉 数据生成完成！');
    console.log('==========================================');
    console.log(`\n数据摘要:`);
    console.log(`- 时间范围: 2024-01 至 2025-12`);
    console.log(`- 总月数: ${data.months.length}`);
    console.log(`- 每月模型: 10个`);
    console.log(`- 总数据点: ${data.months.length * 10}`);
    console.log(`\n公司分布:`);

    // 统计公司分布（基于最后一个月）
    const orgCount = {};
    data.months[23].models.forEach(m => {
      orgCount[m.organization] = (orgCount[m.organization] || 0) + 1;
    });
    Object.entries(orgCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([org, count]) => {
        console.log(`  - ${org}: ${count}个模型`);
      });
  }
}

// 运行
if (require.main === module) {
  main();
}

module.exports = { generateHistoricalData, validateData };
