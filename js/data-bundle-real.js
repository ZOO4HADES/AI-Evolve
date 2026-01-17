/**
 * Chatbot Arena 真实历史数据
 * 数据来源: Hugging Face - mathewhe/chatbot-arena-elo
 * 生成时间: 2026-01-17T11:30:14.569Z
 */

const ARENA_DATA = {
    metadata: {
        generated: new Date().toISOString(),
        source: "Hugging Face - mathewhe/chatbot-arena-elo",
        url: "https://huggingface.co/datasets/mathewhe/chatbot-arena-elo",
        total_months: 1
    },
    months: [
  {
    "date": "2025-07",
    "models": [
      {
        "rank": 1,
        "name": "Gemini-2.5-Pro",
        "elo": 1474,
        "organization": "Google",
        "votes": 19209,
        "license": "Proprietary"
      },
      {
        "rank": 2,
        "name": "Gemini-2.5-Pro-Preview-05-06",
        "elo": 1446,
        "organization": "Google",
        "votes": 13692,
        "license": "Proprietary"
      },
      {
        "rank": 3,
        "name": "Grok-4-0709",
        "elo": 1443,
        "organization": "xAI",
        "votes": 5725,
        "license": "Proprietary"
      },
      {
        "rank": 4,
        "name": "ChatGPT-4o-latest (2025-03-26)",
        "elo": 1429,
        "organization": "OpenAI",
        "votes": 26230,
        "license": "Proprietary"
      },
      {
        "rank": 5,
        "name": "o3-2025-04-16",
        "elo": 1428,
        "organization": "OpenAI",
        "votes": 25442,
        "license": "Proprietary"
      },
      {
        "rank": 6,
        "name": "DeepSeek-R1-0528",
        "elo": 1424,
        "organization": "DeepSeek",
        "votes": 14514,
        "license": "MIT"
      },
      {
        "rank": 7,
        "name": "Grok-3-Preview-02-24",
        "elo": 1423,
        "organization": "xAI",
        "votes": 27643,
        "license": "Proprietary"
      },
      {
        "rank": 8,
        "name": "Gemini-2.5-Flash",
        "elo": 1417,
        "organization": "Google",
        "votes": 24656,
        "license": "Proprietary"
      },
      {
        "rank": 9,
        "name": "GPT-4.5-Preview",
        "elo": 1413,
        "organization": "OpenAI",
        "votes": 15271,
        "license": "Proprietary"
      },
      {
        "rank": 10,
        "name": "Gemini-2.5-Flash-Preview-04-17",
        "elo": 1397,
        "organization": "Google",
        "votes": 18607,
        "license": "Proprietary"
      }
    ]
  }
]
};

// 导出数据（兼容不同环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ARENA_DATA;
}
