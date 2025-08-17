# 🌱 Qweb - Sustainable AI-Powered Search Engine

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org)

**An AI-powered sustainable search engine that pays websites per crawl**

*Revolutionizing the web by incentivizing content creation through crypto micropayments*

## 🌐 Live Applications

**🔗 Main Application**: [https://definitely-glowing-mutt.ngrok-free.app](https://definitely-glowing-mutt.ngrok-free.app)

**🏪 Provider Portal**: [https://provider-portal-peach.vercel.app](https://provider-portal-peach.vercel.app)

</div>

## 🚀 Overview

Qweb is pioneering a new era of sustainable web search by addressing a critical problem in the modern internet ecosystem: **websites are not getting human traffic and hence no revenue from ads or human network effects**. As we transition into an AI-dominated search landscape, Qweb provides a solution by **paying websites for their content through instant, cheap crypto micropayments**.

### 🎯 The Problem We Solve

- Traditional search engines crawl websites for free, providing no direct compensation to content creators
- Websites lose revenue as AI systems consume content without generating ad impressions or human engagement
- Content creators lack incentives to optimize their content for LLMs and AI systems
- The web ecosystem becomes unsustainable as AI consumes content without contributing back

### 💡 Our Solution

Qweb transforms web crawling from an extractive process into a **mutually beneficial ecosystem**:

- **Pay-per-crawl model**: Websites receive instant compensation for their content
- **Crypto micropayments**: Fast, cheap transactions using USDC stablecoins through x402 protocol
- **Provider Portal**: Easy monetization through our [Provider Portal](https://provider-portal-peach.vercel.app/) - websites simply list their URL and desired USDC payment amount
- **Incentivized optimization**: Websites are motivated to create better content and optimize for LLMs
- **Sustainable web economy**: Creating a future where content creation is directly rewarded

## 🔮 Vision: The Future of Web Content

We're building toward an era where:
- **Gated content for LLMs**: Websites can gate their content, requiring AI systems to pay with x402 before accessing content
- **Direct creator compensation**: Content creators receive immediate value for their intellectual property
- **Optimized AI content**: Websites are incentivized to structure content specifically for AI consumption
- **Sustainable web ecosystem**: A self-sustaining economy where content creation and consumption are balanced

## ✨ Features

### 🔍 **Advanced AI Search**
- **Intelligent Query Processing**: Understands context and intent, not just keywords
- **Multiple Focus Modes**: Specialized search for different content types
  - Academic Search for research papers
  - YouTube Search for video content
  - Reddit Search for community discussions
  - Wolfram Alpha for computational queries
  - Writing Assistant for content creation
- **Real-time Results**: Always up-to-date information through SearXNG integration

### 💰 **Sustainable Payment System**
- **Instant Micropayments**: Pay websites immediately upon crawling using x402 protocol
- **USDC Payments**: Reliable, predictable payments using USDC stablecoin across multiple chains
- **Provider Portal**: Simple registration at [provider-portal-peach.vercel.app](https://provider-portal-peach.vercel.app/) - just list your URL and desired USDC amount
- **Cross-chain Support**: Use USDC from any supported chain through Circle's CCTP protocol
- **Transparent Pricing**: Clear, fair compensation based on content quality and relevance

### 🤖 **AI-Powered Intelligence**
- **Local LLM Support**: Use models like Llama3 and Mixtral through Ollama
- **Multiple AI Providers**: Integration with OpenAI, Anthropic, Google Gemini, Groq, and more
- **Smart Source Attribution**: Proper citation and compensation for content sources
- **Advanced Embeddings**: Sophisticated similarity searching and content understanding

### 🔧 **Developer-Friendly**
- **RESTful API**: Integrate Qweb's capabilities into your applications
- **Open Source**: Built on transparent, community-driven development
- **Extensible Architecture**: Easy to add new payment methods and search providers

## 🚀 Getting Started

Ready to set up Qweb? Check out our comprehensive [Development Guide](DEV.md) for detailed installation instructions, configuration, and setup steps.

## 🏗️ Architecture & Technical Stack

Qweb is built on a modern, scalable architecture with integrated crypto payment infrastructure:

### Core Application
- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes with serverless functions
- **Search Engine**: SearXNG for comprehensive web search
- **AI Models**: Multiple provider support (OpenAI, Ollama, Anthropic, etc.)
- **Database**: Drizzle ORM with SQLite/PostgreSQL

### Payment Infrastructure
- **Wallet System**: Coinbase embedded wallets for seamless user authentication and onboarding
- **Server Wallets**: Individual server-side wallets created for each user to enable automated x402 payments
- **Payment Protocol**: [x402-qweb implementation](https://github.com/qweb-project/x402-qweb) for website micropayments
- **Cross-chain USDC**: Circle's CCTP (Cross-Chain Transfer Protocol) SDK for multi-chain USDC support
- **Provider Portal**: Dedicated platform for websites to monetize their content

### How It Works
1. **User Authentication**: Users log in using Coinbase embedded wallets
2. **Server Wallet Creation**: Each user gets a dedicated server-side wallet for automated payments
3. **Search & Pay**: Our meta search agent uses the server wallet to pay x402 requests to participating websites
4. **Cross-chain Flexibility**: Users can fund their wallets with USDC from any supported blockchain
5. **Website Monetization**: Content creators register via our Provider Portal to receive payments

For more details, see our [architecture documentation](docs/architecture/README.md).

## 🛠️ Local Development

Once set up locally, you can use Qweb as your default search engine or integrate it via our API. See [DEV.md](DEV.md) for usage instructions and browser integration steps.

## 📊 API Usage

Qweb provides a powerful API for developers:

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "sustainable web search", "focus": "all"}'
```

See our [API documentation](docs/API/SEARCH.md) for complete details.

## 🤝 Contributing

We welcome contributions from the community! See our [Contributing Guide](CONTRIBUTING.md) for guidelines on how to get involved, coding standards, and project structure.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Qweb Ecosystem

Explore our complete ecosystem of repositories in the [qweb-project organization](https://github.com/qweb-project):

- **[x402-qweb](https://github.com/qweb-project/x402-qweb)**: Core x402 protocol implementation for website micropayments
- **[qweb-contracts](https://github.com/qweb-project/qweb-contracts)**: Smart contracts powering the payment infrastructure
- **[providers-portal](https://github.com/qweb-project/providers-portal)**: Website monetization platform for content creators
- **Additional implementations**: Various supporting tools and integrations

## 🙏 Acknowledgments

Qweb stands on the shoulders of giants. We're grateful to the open-source community:

- **[Perplexica](https://github.com/ItzCrazyKns/Perplexica)**: The foundation and boilerplate for our AI-powered search engine. Their open-source approach made Qweb possible.
- **[SearXNG](https://github.com/searxng/searxng)**: Our search backend that provides comprehensive, privacy-respecting web search capabilities.
- **[Ollama](https://ollama.ai)**: Local LLM support for privacy-focused AI inference.
- **[Coinbase](https://www.coinbase.com/developer-platform)**: Embedded wallet infrastructure for seamless user onboarding.
- **[Circle](https://www.circle.com/en/cross-chain-transfer-protocol)**: CCTP protocol enabling cross-chain USDC transfers.

The open-source community continues to drive innovation and make projects like Qweb possible. Thank you! 🚀

## 🔮 Roadmap

- [ ] **Enhanced Payment Portal**: Advanced analytics and payment customization for websites
- [ ] **LLM Content Gates**: Direct integration for websites to gate content behind x402 payments
- [ ] **Quality Scoring**: AI-powered content quality assessment for fair compensation
- [ ] **Multi-chain Support**: Expand beyond current blockchain to support multiple payment networks
- [ ] **Creator Dashboard**: Comprehensive analytics and earnings tracking for content creators
- [ ] **API Marketplace**: Allow third-party developers to build payment-enabled search applications

## 📞 Support

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/your-username/qweb/issues)
- 💬 [Discussions](https://github.com/your-username/qweb/discussions)
- 📧 Email: support@qweb.com

---

<div align="center">

**Building a sustainable future for web content, one search at a time** 🌱

Made with ❤️ by the Qweb team

</div>
