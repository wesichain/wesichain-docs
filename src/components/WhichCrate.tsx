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
    description: 'Choose the primary use case for your project',
    options: [
      { label: 'A ReAct agent with tools', next: 'agent-memory' },
      { label: 'A RAG pipeline', next: 'rag-complexity' },
      { label: 'A custom LLM workflow', next: 'workflow-type' },
      { label: 'Just getting started', result: 'wesichain' },
    ],
  },
  'agent-memory': {
    id: 'agent-memory',
    question: 'Does your agent need persistence?',
    description: 'Save and resume agent state across restarts',
    options: [
      { label: 'Yes, I need checkpointing', next: 'checkpoint-backend' },
      { label: 'No, in-memory is fine', result: 'wesichain-agent' },
    ],
  },
  'checkpoint-backend': {
    id: 'checkpoint-backend',
    question: 'Which checkpoint backend?',
    options: [
      { label: 'SQLite (local, embedded)', result: 'wesichain-checkpoint-sqlite' },
      { label: 'PostgreSQL (production)', result: 'wesichain-checkpoint-postgres' },
      { label: 'Custom SQL backend', result: 'wesichain-checkpoint-sql' },
    ],
  },
  'rag-complexity': {
    id: 'rag-complexity',
    question: 'How complex is your RAG pipeline?',
    options: [
      { label: 'Simple: vector search + generate', result: 'wesichain-rag' },
      { label: 'Advanced: multi-step retrieval, reranking', next: 'retrieval-source' },
    ],
  },
  'retrieval-source': {
    id: 'retrieval-source',
    question: 'Where are your documents stored?',
    options: [
      { label: 'Pinecone', result: 'wesichain-pinecone' },
      { label: 'In-memory or custom vector store', result: 'wesichain-retrieval' },
    ],
  },
  'workflow-type': {
    id: 'workflow-type',
    question: 'What kind of workflow?',
    options: [
      { label: 'Sequential chain (prompt → LLM → parser)', result: 'wesichain-core' },
      { label: 'State graph with conditional routing', result: 'wesichain-graph' },
      { label: 'Streaming with callbacks', next: 'observability' },
    ],
  },
  observability: {
    id: 'observability',
    question: 'Do you need observability?',
    options: [
      { label: 'LangSmith integration', result: 'wesichain-langsmith' },
      { label: 'Custom tracing', result: 'wesichain-core' },
    ],
  },
};

const crateResults: Record<string, CrateResult> = {
  wesichain: {
    crate: 'wesichain',
    description: 'The umbrella crate — best for getting started. Includes all core functionality with sensible defaults.',
    install: 'cargo add wesichain --features llm-ollama',
    example: `use wesichain::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let agent = AgentBuilder::new()
        .with_llm(Ollama::new())
        .with_tool(Calculator)
        .build()?;

    let result = agent.run("What is 2 + 2?").await?;
    println!("{}", result);
    Ok(())
}`,
  },
  'wesichain-agent': {
    crate: 'wesichain-agent',
    description: 'ReAct agent implementation with tool calling and memory. Use directly if you want more control over dependencies.',
    install: 'cargo add wesichain-agent',
    example: `use wesichain_agent::{Agent, Tool};
use wesichain_llm::Ollama;

let agent = Agent::builder()
    .llm(Ollama::new())
    .tool(Calculator)
    .max_iterations(10)
    .build();`,
  },
  'wesichain-checkpoint-sqlite': {
    crate: 'wesichain-checkpoint-sqlite',
    description: 'SQLite-based checkpointing for resumable agents. Perfect for single-node deployments.',
    install: 'cargo add wesichain-checkpoint-sqlite',
    example: `use wesichain_checkpoint_sqlite::SqliteCheckpointer;

let checkpointer = SqliteCheckpointer::new("./checkpoints.db").await?;
let agent = Agent::builder()
    .checkpointer(checkpointer)
    .build();`,
  },
  'wesichain-checkpoint-postgres': {
    crate: 'wesichain-checkpoint-postgres',
    description: 'PostgreSQL checkpointing for distributed production deployments.',
    install: 'cargo add wesichain-checkpoint-postgres',
    example: `use wesichain_checkpoint_postgres::PostgresCheckpointer;

let checkpointer = PostgresCheckpointer::new(
    "postgres://user:pass@localhost/wesichain"
).await?;`,
  },
  'wesichain-checkpoint-sql': {
    crate: 'wesichain-checkpoint-sql',
    description: 'Generic SQL checkpointer trait. Implement this for custom database backends.',
    install: 'cargo add wesichain-checkpoint-sql',
    example: `use wesichain_checkpoint_sql::{SqlCheckpointer, CheckpointRow};

#[async_trait]
impl SqlCheckpointer for MyBackend {
    async fn save(&self, row: CheckpointRow) -> Result<()> { ... }
}`,
  },
  'wesichain-rag': {
    crate: 'wesichain-rag',
    description: 'High-level RAG pipeline with retrieval and generation.',
    install: 'cargo add wesichain-rag',
    example: `use wesichain_rag::{RagPipeline, Document};

let pipeline = RagPipeline::builder()
    .embedder(Ollama::new())
    .vector_store(store)
    .build();

let answer = pipeline.query("What is Wesichain?").await?;`,
  },
  'wesichain-pinecone': {
    crate: 'wesichain-pinecone',
    description: 'Pinecone vector store integration for production RAG.',
    install: 'cargo add wesichain-pinecone',
    example: `use wesichain_pinecone::PineconeStore;

let store = PineconeStore::new("api-key", "index-name").await?;`,
  },
  'wesichain-retrieval': {
    crate: 'wesichain-retrieval',
    description: 'Document loading, text splitting, and vector search utilities.',
    install: 'cargo add wesichain-retrieval',
    example: `use wesichain_retrieval::{TextSplitter, Document};

let splitter = TextSplitter::recursive()
    .chunk_size(1000)
    .overlap(200);

let chunks = splitter.split(document);`,
  },
  'wesichain-core': {
    crate: 'wesichain-core',
    description: 'Core traits and types (Runnable, Chain, Tool, StreamEvent). Build your own abstractions.',
    install: 'cargo add wesichain-core',
    example: `use wesichain_core::{Runnable, StreamEvent};

#[async_trait]
impl Runnable<String, String> for MyComponent {
    async fn invoke(&self, input: String) -> Result<String> {
        Ok(input.to_uppercase())
    }
}`,
  },
  'wesichain-graph': {
    crate: 'wesichain-graph',
    description: 'Stateful graph execution with conditional edges and checkpointing per node.',
    install: 'cargo add wesichain-graph',
    example: `use wesichain_graph::{GraphBuilder, StateSchema};

let graph = GraphBuilder::new()
    .add_node("retriever", retriever)
    .add_node("generator", generator)
    .add_edge("retriever", "generator")
    .set_entry("retriever")
    .build()?;`,
  },
  'wesichain-langsmith': {
    crate: 'wesichain-langsmith',
    description: 'LangSmith observability integration for tracing and monitoring.',
    install: 'cargo add wesichain-langsmith',
    example: `use wesichain_langsmith::LangSmithTracer;

let tracer = LangSmithTracer::new("api-key");
let chain = chain.with_callback(tracer);`,
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
            <span className="text-sm font-medium text-rust-500">Recommended Crate</span>
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
