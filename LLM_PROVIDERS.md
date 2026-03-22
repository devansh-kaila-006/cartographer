# 🤖 LLM Providers Guide

This project supports **3 LLM providers** for AI-powered code analysis and semantic search.

## Supported Providers

### 1. Anthropic Claude (Recommended)
- **Model**: Claude 3 Haiku
- **Best for**: Code analysis, technical summaries
- **Pricing**: $0.25/M input tokens, $1.25/M output tokens
- **Get API Key**: https://console.anthropic.com/settings/keys
- **Key format**: `sk-ant-...`

### 2. OpenAI GPT
- **Model**: GPT-3.5 Turbo
- **Best for**: General code understanding
- **Pricing**: $0.50/M input tokens, $1.50/M output tokens
- **Get API Key**: https://platform.openai.com/api-keys
- **Key format**: `sk-...`

### 3. Google Gemini ⭐ NEW
- **Model**: Gemini 1.5 Flash
- **Best for**: Fast, cost-effective analysis
- **Pricing**: **Free** up to 15 requests/minute, then $0.075/M input tokens
- **Get API Key**: https://makersuite.google.com/app/apikey
- **Key format**: `AIza...`

## Quick Start

1. **Get an API key** from your preferred provider
2. Open Cartographer
3. Click **"➕ API Key"** button in the top-right
4. Select your provider (Claude, GPT, or Gemini)
5. Paste your API key
6. Click **"Save API Key"**

## Which Should You Choose?

### Choose **Gemini** if you want:
- ✅ **Free tier** (15 requests/minute)
- ✅ Fastest response times
- ✅ Most cost-effective for large projects
- ✅ Good balance of speed and quality

### Choose **Claude** if you want:
- ✅ Best code analysis quality
- ✅ More reliable structured outputs
- ✅ Excellent at following complex instructions
- ✅ Affordable for moderate use

### Choose **GPT** if you want:
- ✅ Widely tested and supported
- ✅ Good general-purpose understanding
- ✅ Fast response times
- ✅ Familiar OpenAI ecosystem

## Cost Comparison (per 1M tokens)

| Provider | Input | Output | Free Tier |
|----------|-------|--------|-----------|
| Gemini | $0.075 | $0.15 | ✅ 15 req/min |
| Claude | $0.25 | $1.25 | ❌ |
| GPT-3.5 | $0.50 | $1.50 | ❌ |

## Usage Tips

1. **Start with Gemini** - It's free and fast
2. **Upgrade to Claude** if you need better analysis quality
3. **Use GPT** if you're already in the OpenAI ecosystem
4. **API keys are stored locally** in your browser
5. **You can add multiple keys** and switch between them

## Rate Limits

- **Gemini**: 15 requests/minute (free tier)
- **Claude**: 50 requests/minute (tier 1)
- **GPT**: 3,000 requests/minute (tier 1)

The app automatically handles rate limiting with batch processing and delays.
