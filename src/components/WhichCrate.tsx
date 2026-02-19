import { useState } from 'react';

type Option = {
  label: string;
  next?: string;
  result?: string;
};

type Step = {
  id: string;
  question: string;
  description?: string;
  options: Option[];
};

type CrateResult = {
  crate: string;
  description: string;
  install: string;
  example: string;
};

const steps: Record<string, Step> = {
  start: {
    id: 'start',
    question: 'What are you building?',
    description: 'Choose your primary project goal',
    options: [
      { label: 'ReAct agent with tools', next: 'agent-runtime' },
      { label: 'RAG application', next: 'rag-store' },
      { label: 'Custom graph workflow', next: 'graph-persistence' },
      { label: 'Migrating from Python', next: 'migration-path' },
    ],
  },
  'agent-runtime': {
    id: 'agent-runtime',
    question: 'Which runtime style do you want?',
    options: [
      { label: 'Graph-based ReAct (recommended)', next: 'agent-persistence' },
      { label: 'FSM/event runtime (v0.3 track)', result: 'wesichain-agent' },
    ],
  },
  'agent-persistence': {
    id: 'agent-persistence',
    question: 'Do you need resumable persistence?',
    options: [
      { label: 'No, in-memory is fine', result: 'graph-react-minimal' },
      { label: 'Yes, local SQLite', result: 'graph-react-sqlite' },
      { label: 'Yes, PostgreSQL', result: 'graph-react-postgres' },
      { label: 'Yes, Redis', result: 'graph-react-redis' },
    ],
  },
  'graph-persistence': {
    id: 'graph-persistence',
    question: 'Does this graph need checkpoint persistence?',
    options: [
      { label: 'No persistence yet', result: 'wesichain-graph' },
      { label: 'Yes, I need persistence', next: 'checkpoint-backend' },
    ],
  },
  'checkpoint-backend': {
    id: 'checkpoint-backend',
    question: 'Which checkpoint backend fits best?',
    options: [
      { label: 'SQLite (embedded/local)', result: 'wesichain-checkpoint-sqlite' },
      { label: 'PostgreSQL (production)', result: 'wesichain-checkpoint-postgres' },
      { label: 'Redis (session-heavy)', result: 'wesichain-checkpoint-redis' },
      { label: 'Implement custom SQL', result: 'wesichain-checkpoint-sql' },
    ],
  },
  'rag-store': {
    id: 'rag-store',
    question: 'Where are your vectors stored?',
    options: [
      { label: 'Not sure yet / local first', result: 'wesichain-rag' },
      { label: 'Pinecone', result: 'wesichain-pinecone' },
      { label: 'Qdrant', result: 'wesichain-qdrant' },
      { label: 'Weaviate', result: 'wesichain-weaviate' },
      { label: 'Chroma', result: 'wesichain-chroma' },
    ],
  },
  'migration-path': {
    id: 'migration-path',
    question: 'How do you want to migrate?',
    options: [
      { label: 'Incremental compatibility-first', result: 'wesichain-compat' },
      { label: 'Fresh Rust implementation', result: 'graph-react-minimal' },
    ],
  },
};

const crateResults: Record<string, CrateResult> = {
  'graph-react-minimal': {
    crate: 'wesichain-core + wesichain-llm + wesichain-graph',
    description:
      'Recommended default for new ReAct and orchestration projects. Uses the graph runtime and composable ReAct subgraph builder.',
    install: `cargo add wesichain-core@0.2.1\ncargo add wesichain-llm@0.2.1\ncargo add wesichain-graph@0.2.1`,
    example: `use wesichain_graph::ReActGraphBuilder;\n\nlet graph = ReActGraphBuilder::new()\n    .llm(llm)\n    .tools(tools)\n    .build::<AppState>()?;`,
  },
  'graph-react-sqlite': {
    crate: 'wesichain-graph + wesichain-checkpoint-sqlite',
    description:
      'Best for single-node deployments, local apps, and embedded persistence.',
    install:
      'cargo add wesichain-graph@0.2.1\ncargo add wesichain-checkpoint-sqlite@0.2.1',
    example: `let graph = GraphBuilder::new()\n    .add_node("agent", agent_node)\n    .set_entry("agent")\n    .with_checkpointer(sqlite_checkpointer, "thread-1")\n    .build();`,
  },
  'graph-react-postgres': {
    crate: 'wesichain-graph + wesichain-checkpoint-postgres',
    description: 'Production-oriented persistence with Postgres-backed checkpoints.',
    install:
      'cargo add wesichain-graph@0.2.1\ncargo add wesichain-checkpoint-postgres@0.2.1',
    example: `let checkpointer = PostgresCheckpointer::builder(database_url)\n    .max_connections(20)\n    .build()\n    .await?;`,
  },
  'graph-react-redis': {
    crate: 'wesichain-graph + wesichain-checkpoint-redis',
    description: 'Low-latency checkpoint storage for high-throughput session workflows.',
    install: 'cargo add wesichain-graph@0.2.1\ncargo add wesichain-checkpoint-redis@0.2.1',
    example: `let graph = GraphBuilder::new()\n    .with_checkpointer(redis_checkpointer, "session-42")\n    .build();`,
  },
  'wesichain-agent': {
    crate: 'wesichain-agent',
    description:
      'FSM/event runtime track for v0.3. Ideal if you are building around explicit runtime phases and event streams.',
    install: 'cargo add wesichain-agent@0.2.1',
    example: `use wesichain_agent::{AgentRuntime, AgentState};\n\n// Build policies, adapters, and tooling around AgentRuntime`,
  },
  'wesichain-graph': {
    crate: 'wesichain-graph',
    description:
      'State graph runtime with conditional edges, concurrency, interrupts, and observer hooks.',
    install: 'cargo add wesichain-graph@0.2.1',
    example: `let graph = GraphBuilder::new()\n    .add_node("a", node_a)\n    .add_node("b", node_b)\n    .add_edge("a", "b")\n    .set_entry("a")\n    .build();`,
  },
  'wesichain-checkpoint-sqlite': {
    crate: 'wesichain-checkpoint-sqlite',
    description: 'SQLite checkpoint backend for resumable workflows.',
    install: 'cargo add wesichain-checkpoint-sqlite@0.2.1',
    example: `let checkpointer = SqliteCheckpointer::builder("sqlite://./app.db")\n    .max_connections(5)\n    .build()\n    .await?;`,
  },
  'wesichain-checkpoint-postgres': {
    crate: 'wesichain-checkpoint-postgres',
    description: 'Postgres checkpoint backend for distributed systems.',
    install: 'cargo add wesichain-checkpoint-postgres@0.2.1',
    example: `let checkpointer = PostgresCheckpointer::builder(database_url)\n    .build()\n    .await?;`,
  },
  'wesichain-checkpoint-redis': {
    crate: 'wesichain-checkpoint-redis',
    description: 'Redis checkpoint backend for low-latency persistence.',
    install: 'cargo add wesichain-checkpoint-redis@0.2.1',
    example: `let checkpointer = RedisCheckpointer::builder(redis_url)\n    .build()\n    .await?;`,
  },
  'wesichain-checkpoint-sql': {
    crate: 'wesichain-checkpoint-sql',
    description: 'Shared SQL checkpoint operations for custom SQL backends.',
    install: 'cargo add wesichain-checkpoint-sql@0.2.1',
    example: 'Use this crate when implementing your own SQL storage backend.',
  },
  'wesichain-rag': {
    crate: 'wesichain-rag',
    description:
      'High-level RAG API on top of core graph/retrieval building blocks. Great starting point for document QA.',
    install:
      'cargo add wesichain-rag@0.2.1\ncargo add wesichain-checkpoint-sqlite@0.2.1',
    example: `let rag = WesichainRag::builder()\n    .with_checkpointer(checkpointer)\n    .build()?;`,
  },
  'wesichain-pinecone': {
    crate: 'wesichain-pinecone',
    description: 'Pinecone vector store integration for production RAG systems.',
    install: 'cargo add wesichain-pinecone@0.2.1',
    example: 'Use with wesichain-rag or custom retrieval flows.',
  },
  'wesichain-qdrant': {
    crate: 'wesichain-qdrant',
    description: 'Qdrant vector store integration with metadata filter support.',
    install: 'cargo add wesichain-qdrant@0.2.1',
    example: 'Use with wesichain-retrieval and wesichain-rag.',
  },
  'wesichain-weaviate': {
    crate: 'wesichain-weaviate',
    description: 'Weaviate vector store integration with GraphQL filter translation.',
    install: 'cargo add wesichain-weaviate@0.2.1',
    example: 'Use with wesichain-retrieval and wesichain-rag.',
  },
  'wesichain-chroma': {
    crate: 'wesichain-chroma',
    description: 'Chroma integration for local and prototyping retrieval setups.',
    install: 'cargo add wesichain-chroma@0.2.1',
    example: 'Use with wesichain-retrieval and wesichain-rag.',
  },
  'wesichain-compat': {
    crate: 'wesichain-compat',
    description:
      'Compatibility-focused crate for incremental migration from LangChain/LangGraph patterns.',
    install: 'cargo add wesichain-compat@0.2.1',
    example: 'Use alongside core graph crates while migrating system by system.',
  },
};

export default function WhichCrate() {
  const [history, setHistory] = useState<string[]>(['start']);
  const currentStep = steps[history[history.length - 1]];

  const handleOption = (option: Option) => {
    if (option.result) {
      setHistory([...history, option.result]);
    } else if (option.next) {
      setHistory([...history, option.next]);
    }
  };

  const handleBack = () => {
    if (history.length > 1) {
      setHistory(history.slice(0, -1));
    }
  };

  const handleReset = () => {
    setHistory(['start']);
  };

  const result = crateResults[currentStep.id];

  if (result) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-sm font-medium text-rust-500">Recommended Crate Set</span>
            <h3 className="mt-1 text-2xl font-bold text-white">{result.crate}</h3>
          </div>
          <button
            onClick={handleReset}
            className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-400 hover:border-neutral-600 hover:text-white"
          >
            Start Over
          </button>
        </div>

        <p className="mt-4 text-neutral-300">{result.description}</p>

        <div className="mt-6 space-y-4">
          <div>
            <span className="text-sm font-medium text-neutral-400">Install</span>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-neutral-950 p-3 text-sm">
              <code className="text-rust-400">{result.install}</code>
            </pre>
          </div>

          <div>
            <span className="text-sm font-medium text-neutral-400">Example</span>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-neutral-950 p-3 text-sm">
              <code className="text-neutral-300">{result.example}</code>
            </pre>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4 border-t border-neutral-800 pt-6">
          <button
            onClick={handleBack}
            className="text-sm text-neutral-400 hover:text-white"
          >
            ← Back
          </button>
          <span className="text-sm text-neutral-500">
            Not quite right? Adjust your answers above.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-rust-500">
          Step {history.length}
        </span>
        {history.length > 1 && (
          <button
            onClick={handleBack}
            className="text-sm text-neutral-400 hover:text-white"
          >
            ← Back
          </button>
        )}
      </div>

      <h3 className="mt-2 text-xl font-semibold text-white">
        {currentStep.question}
      </h3>

      {currentStep.description && (
        <p className="mt-2 text-neutral-400">{currentStep.description}</p>
      )}

      <div className="mt-6 space-y-3">
        {currentStep.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOption(option)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-left transition-colors hover:border-rust-600 hover:bg-rust-600/5"
          >
            <span className="font-medium text-white">{option.label}</span>
            {option.next && (
              <span className="ml-2 text-neutral-500">→</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
