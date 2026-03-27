export type ChangelogSection = { heading: string; items: string[] };
export type ChangelogEntry = {
  version: string;
  date: string;
  tag: 'major' | 'minor' | 'patch';
  sections: ChangelogSection[];
};

export const changelog: ChangelogEntry[] = [
  {
    version: '0.3.0', date: '2026-03-22', tag: 'major',
    sections: [
      {
        heading: 'New Crates (9)',
        items: [
          '`wesichain-anthropic` — Anthropic Claude client: streaming, tool use, extended thinking',
          '`wesichain-tools` — Coding tools: ReadFileTool, WriteFileTool, EditFileTool, GlobTool, GrepTool, PatchTool, BashExecTool, git tools, PathGuard sandbox',
          '`wesichain-mcp` — MCP client (2024-11-05 spec) over stdio & HTTP/SSE, resources + sampling',
          '`wesichain-session` — Session persistence (FileSessionStore), cost/token tracking, budget enforcement',
          '`wesichain-server` — Axum HTTP server: Bearer auth, rate limiting, SSE streaming, body-size guard',
          '`wesichain-cli` — `wesichain new` scaffolding + `wesichain run` interactive REPL with ANSI diff viewer',
          '`wesichain-langfuse` — Langfuse observability callback handler with trace batching & PII redaction',
          '`wesichain-otel` — OpenTelemetry span parenting with W3C traceparent & OTLP export',
          '`wesichain-prompthub` — PromptHub trait + LocalPromptHub (YAML directory scanner)',
        ]
      },
      {
        heading: 'New APIs in Existing Crates',
        items: [
          '`wesichain-core` — ModelCapabilities, TokenBudget, TimeLimited, RateLimiter, ApprovalHandler',
          '`wesichain-agent` — AgentCheckpoint, ToolSet::tool_specs(), ToolCallEnvelope, FSM-based runtime, PermissionPolicy, AsToolExt',
          '`wesichain-graph` — Supervisor pattern, HITL nodes, parallel agents, fork_from_checkpoint()',
          '`wesichain-memory` — VectorMemoryStore, EntityMemory, SemanticMemoryStore',
          '`wesichain-retrieval` — CrossEncoderRetriever, KeywordReranker, Reranker trait',
          '`wesichain-llm` — Groq, Together AI, Azure OpenAI, Mistral providers',
        ]
      },
      {
        heading: 'AI Developer Experience',
        items: [
          '11 Claude Code skills for instant framework knowledge: wesichain-core, wesichain-graph, wesichain-llm, wesichain-memory, wesichain-checkpoint, wesichain-embeddings, wesichain-tools, wesichain-prompt, wesichain-langsmith, wesichain-rag, wesichain-react',
          'Download `wesichain.skills` from GitHub Releases and drag into Claude Code',
          'Skills provide copy-pasteable patterns for ReAct agents, RAG pipelines, checkpointing, and more',
        ]
      },
      {
        heading: 'Infrastructure',
        items: [
          'All 29 publishable crates have keywords, categories, and readme fields on crates.io',
          '194 test suites, 0 failures across full workspace',
        ]
      }
    ]
  },
  {
    version: '0.1.0', date: '2026-02-06', tag: 'minor',
    sections: [
      {
        heading: 'Initial Release',
        items: [
          '`wesichain-core` — Runnable, Tool, Chain, ToolCallingLlm traits',
          '`wesichain-graph` — GraphBuilder, StateSchema, ReActGraphBuilder',
          '`wesichain-llm` — OpenAI, Ollama providers',
          '`wesichain-rag` — WesichainRag pipeline with document ingestion and SSE streaming',
          '`wesichain-checkpoint-sqlite`, `wesichain-checkpoint-postgres`, `wesichain-checkpoint-redis`',
          '`wesichain-langsmith` — LangSmith observability callback handler',
        ]
      }
    ]
  }
];
