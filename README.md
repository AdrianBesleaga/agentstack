# Agent Stack

> **Open runtime for turning AI agents into production services — in minutes.**

_Writing an agent is easy. Shipping one is not._

Agent Stack is the missing piece: plug in your agent code and get LLM routing, auth, storage, APIs, and a web UI—without rewriting a line of business logic.

[![Docs](https://img.shields.io/badge/docs-agentstack.beeai.dev-blue)](https://agentstack.beeai.dev/)
[![Discord](https://img.shields.io/badge/discord-join-7289da)](https://discord.gg/AZFrp3UF5k)
[![License](https://img.shields.io/github/license/i-am-bee/agentstack)](LICENSE)
[![Linux Foundation](https://img.shields.io/badge/Linux%20Foundation-member-003366)](https://www.linuxfoundation.org/)

---

## ⚡ Quickstart

**1. Install**

```sh
sh -c "$(curl -LsSf https://agentstack.beeai.dev/install.sh)"
```

**2. Build your first agent**

```sh
git clone https://github.com/i-am-bee/agentstack-starter my-agent
cd my-agent
uv run server               # Start your agent
```

**3. Run it**

```sh
agentstack run example_agent "Alice"  # → "Ciao Alice!" 🎉
```

See [Building Agents](https://agentstack.beeai.dev/stable/deploy-agents/building-agents) for a full step-by-step guide.

**Other useful commands**

```sh
agentstack ui              # Launch web interface
agentstack list            # See available agents
agentstack info 'My Agent' # View agent details
agentstack --help          # See all options
```

## 🤖 Already have an agent?

**Don't rewrite it.**

Install the [`agentstack-wrapper`](https://skills.sh/i-am-bee/agentstack/agentstack-wrapper) skill into your AI coding assistant. It works with LangChain, CrewAI, LangGraph, and more:

```sh
npx skills add https://github.com/i-am-bee/agentstack --skill agentstack-wrapper
```

Your assistant autonomously wraps the agent—wiring the entry point, LLM proxy, secrets, error handling, and dependencies.

No business-logic changes required.

## 💡 When to use Agent Stack

Agent Stack is an **agent runtime**, not an agent framework. Continue building agents with LangChain, LangGraph, CrewAI, or your own Python loops.

Use Agent Stack when you want to:

- **Ship agents to production** — Get LLM routing, auth, storage, and files out of the box
- **Run agents as HTTP services** — Expose them like any standard backend API
- **Avoid rewrites** — Autonomously wrap your existing agent code
- **Iterate fast** — Test in a local dev loop, then deploy the exact same code
- **Avoid lock-in** — Built on the open A2A Protocol, hosted by the Linux Foundation

## ✨ Features

| Category                          | What you get                                                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 🧠 **LLM & AI Services**          | LLM routing for 15+ providers (Anthropic, OpenAI, Gemini, watsonx.ai, Ollama, etc.) · Embeddings + vector search for RAG |
| 🚀 **Agent Runtime**              | Self-hostable server · Run agents in local or production environments                                                    |
| 🛠️ **Agent Management**           | CLI to deploy, update, run, and inspect agents                                                                           |
| 💾 **Storage & Documents**        | S3-compatible file storage · Document text extraction via Docling                                                        |
| 🔐 **Security**                   | Secrets management for API keys · OAuth for external integrations                                                        |
| 🖥️ **Interfaces**                 | Out-of-the-box Web UI · Client SDK for custom UIs                                                                        |
| 🔌 **Integrations**               | MCP protocol connectors (Slack, Google Drive, APIs, …)                                                                   |
| ☸️ **Deployment**                 | Helm chart for Kubernetes with customizable storage, databases, and auth                                                 |
| 🤝 **Framework Interoperability** | LangChain, LangGraph, CrewAI, or your own loop — all A2A-compatible                                                      |

## 📦 Reference Agents

Reference implementations demonstrating core Agent Stack capabilities.

| Agent                                                                                                                                | Highlights                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| [Chat Agent](https://github.com/i-am-bee/agentstack/tree/main/agents/chat)                                                           | Multi-turn conversation, tool use (DuckDuckGo, Wikipedia, OpenMeteo), streaming, citations, OpenTelemetry                     |
| [RAG Agent](https://github.com/i-am-bee/agentstack/tree/main/agents/rag)                                                             | 12+ file formats, dynamic vector stores, semantic search, document summaries, citation tracking                               |
| [Form Agent](https://github.com/i-am-bee/agentstack/tree/main/agents/form)                                                           | Form Extension with multiple field types, file uploads, validation, and structured output                                     |
| [Canvas Agent](https://github.com/i-am-bee/agentstack/tree/main/agents/canvas)                                                       | Multi-turn artifact editing with inline selection and targeted edits                                                          |
| [Agent Stack Showcase](https://github.com/jenna-winkler/agentstack-showcase)                                                         | Full-featured assistant: web search, PDF/CSV/JSON handling, ThinkTool, streaming, trajectory logging                          |
| [Serper Search Agent](https://github.com/jenna-winkler/serper-search-agent)                                                          | Runtime secrets management, custom tool creation, structured results with citations                                           |
| [GitHub Issue Writer](https://github.com/jenna-winkler/github_issue_writer)                                                          | Multi-field Form Extension, AI-enhanced drafting with ThinkTool, Markdown output                                              |
| [Vulnerability Agent](https://github.com/sandijean90/VulnerabilityAgent)                                                             | Scans Python deps for CVEs and files GitHub issues — form, secrets, MCP tools, trajectory logging                             |
| [OAuth Agent](https://github.com/i-am-bee/agentstack/blob/main/apps/agentstack-sdk-py/examples/oauth.py)                             | OAuth Extension demo: browser-based authorization, secure token management, Stripe MCP server access                          |
| [Dynamic Form Request Agent](https://github.com/i-am-bee/agentstack/blob/main/apps/agentstack-sdk-py/examples/form_request_agent.py) | Static and dynamic form generation, agent conditionally requests additional input mid-conversation                            |
| [Flight Search & Visualization Agent](https://github.com/jezekra1/agentstack-workshop)                                               | Kiwi.com MCP flight queries, Form Extension for missing params, PNG/HTML route visualizations, RequirementAgent orchestration |
| [Healthcare Agent](https://github.com/sandijean90/AgentStack-HealthcareAgent/tree/main)                                              | Discovers and invokes other Agent Stack agents, multi-turn context management, trajectory and UI components                   |

## 📖 Documentation

Full documentation at **[agentstack.beeai.dev](https://agentstack.beeai.dev/)**:

- [Quickstart](https://agentstack.beeai.dev/stable/introduction/quickstart)
- [Wrap existing agents](https://agentstack.beeai.dev/stable/deploy-agents/wrap-existing-agents)
- [Build new agents](https://agentstack.beeai.dev/stable/deploy-agents/building-agents)
- [Deploy to production](https://agentstack.beeai.dev/stable/deploy-agent-stack/deployment-guide)

## 🤝 Contributing

Contributions are welcome! See the [contributing guide](CONTRIBUTING.md) for details. Please note that our [Code of Conduct](CODE_OF_CONDUCT.md) applies to all community channels.

- 🐛 [Report bugs](https://github.com/i-am-bee/agentstack/issues)
- 💬 [Ask questions & share ideas](https://github.com/i-am-bee/agentstack/discussions)
- 🌐 [Discord community](https://discord.gg/AZFrp3UF5k)

Agent Stack is an open-source project maintained as part of the Linux Foundation community.

## ⚖️ License

[Apache 2.0](LICENSE)
