/**
 * Chatbot Arena 2023年真实历史数据
 * 数据来源: LMSYS官方博客文章
 * - https://lmsys.org/blog/2023-05-10-leaderboard/ (May 8, 2023)
 * - https://lmsys.org/blog/2023-06-22-leaderboard/ (June 19, 2023)
 * - https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard/raw/main/leaderboard_table_20231206.csv (Dec 6, 2023)
 * 生成时间: 2025-01-17
 * 总月份数: 3
 */

const ARENA_DATA_2023 = {
    metadata: {
        generated: new Date().toISOString(),
        source: "LMSYS Official Blog Posts + Hugging Face Spaces",
        urls: [
            "https://lmsys.org/blog/2023-05-10-leaderboard/",
            "https://lmsys.org/blog/2023-06-22-leaderboard/",
            "https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard"
        ],
        total_months: 3,
        note: "2023年数据来自LMSYS官方博客和CSV文件，包含真实ELO评分"
    },
    months: [
        {
            date: "2023-05",
            description: "Week 2 (April 24 - May 8, 2023) - 13,000 votes",
            models: [
                {
                    rank: 1,
                    name: "GPT-4",
                    elo: 1274,
                    organization: "OpenAI",
                    license: "Proprietary"
                },
                {
                    rank: 2,
                    name: "Claude-v1",
                    elo: 1224,
                    organization: "Anthropic",
                    license: "Proprietary"
                },
                {
                    rank: 3,
                    name: "GPT-3.5-turbo",
                    elo: 1155,
                    organization: "OpenAI",
                    license: "Proprietary"
                },
                {
                    rank: 4,
                    name: "Vicuna-13B",
                    elo: 1083,
                    organization: "LMSYS",
                    license: "Non-commercial"
                },
                {
                    rank: 5,
                    name: "Koala-13B",
                    elo: 1022,
                    organization: "BAIR",
                    license: "Non-commercial"
                },
                {
                    rank: 6,
                    name: "RWKV-4-Raven-14B",
                    elo: 989,
                    organization: "RWKV",
                    license: "Apache 2.0"
                },
                {
                    rank: 7,
                    name: "Oasst-Pythia-12B",
                    elo: 928,
                    organization: "LAION",
                    license: "Apache 2.0"
                },
                {
                    rank: 8,
                    name: "ChatGLM-6B",
                    elo: 918,
                    organization: "Tsinghua",
                    license: "Non-commercial"
                },
                {
                    rank: 9,
                    name: "StableLM-Tuned-Alpha-7B",
                    elo: 906,
                    organization: "Stability AI",
                    license: "CC-BY-NC-SA-4.0"
                },
                {
                    rank: 10,
                    name: "Alpaca-13B",
                    elo: 904,
                    organization: "Stanford",
                    license: "Non-commercial"
                }
            ]
        },
        {
            date: "2023-06",
            description: "Week 8 (April 24 - June 19, 2023) - 42,000 votes",
            models: [
                {
                    rank: 1,
                    name: "GPT-4",
                    elo: 1227,
                    organization: "OpenAI",
                    license: "Proprietary"
                },
                {
                    rank: 2,
                    name: "Claude-v1",
                    elo: 1178,
                    organization: "Anthropic",
                    license: "Proprietary"
                },
                {
                    rank: 3,
                    name: "GPT-3.5-turbo",
                    elo: 1130,
                    organization: "OpenAI",
                    license: "Proprietary"
                },
                {
                    rank: 4,
                    name: "Claude-instant-v1",
                    elo: 1156,
                    organization: "Anthropic",
                    license: "Proprietary"
                },
                {
                    rank: 5,
                    name: "Vicuna-33B",
                    elo: 1093,
                    organization: "LMSYS",
                    license: "Non-commercial"
                },
                {
                    rank: 6,
                    name: "Guanaco-33B",
                    elo: 1065,
                    organization: "UW",
                    license: "Non-commercial"
                },
                {
                    rank: 7,
                    name: "PaLM-Chat-Bison-001",
                    elo: 1038,
                    organization: "Google",
                    license: "Proprietary"
                },
                {
                    rank: 8,
                    name: "Vicuna-13B",
                    elo: 1061,
                    organization: "LMSYS",
                    license: "Non-commercial"
                },
                {
                    rank: 9,
                    name: "WizardLM-13B",
                    elo: 1048,
                    organization: "Microsoft",
                    license: "Non-commercial"
                },
                {
                    rank: 10,
                    name: "Vicuna-7B",
                    elo: 1008,
                    organization: "LMSYS",
                    license: "Non-commercial"
                }
            ]
        },
        {
            date: "2023-12",
            description: "December 2023 - CSV Export",
            models: [
                {
                    rank: 1,
                    name: "GPT-4-Turbo",
                    elo: 1217,
                    organization: "OpenAI",
                    license: "Proprietary"
                },
                {
                    rank: 2,
                    name: "GPT-4-0314",
                    elo: 1201,
                    organization: "OpenAI",
                    license: "Proprietary"
                },
                {
                    rank: 3,
                    name: "Claude-1",
                    elo: 1153,
                    organization: "Anthropic",
                    license: "Proprietary"
                },
                {
                    rank: 4,
                    name: "GPT-4-0613",
                    elo: 1152,
                    organization: "OpenAI",
                    license: "Proprietary"
                },
                {
                    rank: 5,
                    name: "Claude-2.0",
                    elo: 1127,
                    organization: "Anthropic",
                    license: "Proprietary"
                },
                {
                    rank: 6,
                    name: "Claude-2.1",
                    elo: 1118,
                    organization: "Anthropic",
                    license: "Proprietary"
                },
                {
                    rank: 7,
                    name: "GPT-3.5-turbo-0613",
                    elo: 1112,
                    organization: "OpenAI",
                    license: "Proprietary"
                },
                {
                    rank: 8,
                    name: "Claude-instant-1",
                    elo: 1109,
                    organization: "Anthropic",
                    license: "Proprietary"
                },
                {
                    rank: 9,
                    name: "GPT-3.5-turbo-0314",
                    elo: 1105,
                    organization: "OpenAI",
                    license: "Proprietary"
                },
                {
                    rank: 10,
                    name: "Tulu-2-DPO-70B",
                    elo: 1105,
                    organization: "AllenAI",
                    license: "AI2 ImpACT Low-risk"
                }
            ]
        }
    ]
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ARENA_DATA_2023;
}
