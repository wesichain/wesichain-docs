export type ExampleCategory = 'agent' | 'rag' | 'graph' | 'server' | 'observability' | 'tools';
export type ExampleDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type Example = {
  id: string;
  title: string;
  description: string;
  difficulty: ExampleDifficulty;
  categories: ExampleCategory[];
  crates: string[];
  githubPath: string;
  docPath?: string;
};

export const examples: Example[] = [
  {
    id: 'react-agent-subgraph',
    title: 'ReAct Agent with Graph',
    description: 'Tool-using ReAct agent built with ReActGraphBuilder and streaming output.',
    difficulty: 'beginner', categories: ['agent', 'graph'],
    crates: ['wesichain-core', 'wesichain-llm', 'wesichain-graph'],
    githubPath: 'wesichain/examples/src/bin/react_agent_subgraph.rs',
    docPath: '/docs/guides/react-agent',
  },
  {
    id: 'coding-agent',
    title: 'Autonomous Coding Agent',
    description: 'Full coding agent with filesystem tools, git, PathGuard sandboxing, and MCP.',
    difficulty: 'advanced', categories: ['agent', 'tools'],
    crates: ['wesichain-tools', 'wesichain-agent', 'wesichain-session', 'wesichain-mcp'],
    githubPath: 'wesichain/examples/src/bin/agent.rs',
    docPath: '/docs/guides/coding-agent',
  },
  {
    id: 'rag-stream',
    title: 'RAG with SSE Streaming',
    description: 'Ingest documents, embed, retrieve, and stream responses as Server-Sent Events.',
    difficulty: 'intermediate', categories: ['rag'],
    crates: ['wesichain-rag', 'wesichain-retrieval', 'wesichain-checkpoint-sqlite'],
    githubPath: 'wesichain/wesichain-rag/examples/simple-rag-stream.rs',
    docPath: '/docs/getting-started/quickstart-rag',
  },
  {
    id: 'persistent-conversation',
    title: 'Persistent Conversation',
    description: 'Multi-turn conversation with SQLite checkpointing and session resumption.',
    difficulty: 'intermediate', categories: ['graph'],
    crates: ['wesichain-graph', 'wesichain-checkpoint-sqlite'],
    githubPath: 'wesichain/wesichain-graph/examples/persistent_conversation.rs',
    docPath: '/docs/guides/checkpointing',
  },
  {
    id: 'hitl-approval',
    title: 'Human-in-the-Loop Approval',
    description: 'Agent workflow with an interrupt gate requiring human approval before tool execution.',
    difficulty: 'advanced', categories: ['agent', 'graph'],
    crates: ['wesichain-graph', 'wesichain-core'],
    githubPath: 'wesichain/wesichain-graph/examples/react_agent.rs',
    docPath: '/docs/guides/human-in-the-loop',
  },
  {
    id: 'streaming-server',
    title: 'HTTP + SSE Agent Server',
    description: 'Axum HTTP server exposing an agent as a streaming REST endpoint with Bearer auth.',
    difficulty: 'intermediate', categories: ['server'],
    crates: ['wesichain-server', 'wesichain-agent'],
    githubPath: 'wesichain/wesichain-server/examples/',
  },
  {
    id: 'langfuse-tracing',
    title: 'Langfuse Observability',
    description: 'Attach a Langfuse callback handler to trace LLM calls and agent runs.',
    difficulty: 'beginner', categories: ['observability'],
    crates: ['wesichain-langfuse', 'wesichain-core'],
    githubPath: 'wesichain/wesichain-langfuse/examples/',
  },
];
