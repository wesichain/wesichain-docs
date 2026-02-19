import { useState, useEffect } from 'react';
import { Check, Copy } from 'lucide-react';
import clsx from 'clsx';
import { splitterRows, typicalPythonSplitterRangeMibPerSec } from '../data/benchmarks';

interface Scenario {
  id: string;
  title: string;
  python: {
    code: string;
    issues: string[];
    stats: { label: string; value: string };
  };
  rust: {
    code: string;
    benefits: string[];
    stats: { label: string; value: string };
  };
}

const scenarios: Scenario[] = [
  {
    id: 'react-agent',
    title: 'ReAct Agent',
    python: {
      code: `from langchain.agents import AgentExecutor
from langchain_openai import ChatOpenAI

llm = ChatOpenAI()
tools = [search, calculator]

agent = AgentExecutor(
    llm=llm,
    tools=tools,
    handle_parsing_errors=True
)

result = agent.invoke({"input": "What is 2+2?"})`,
      issues: ['Interpreter overhead', 'Runtime variability', 'GIL constraints'],
      stats: {
        label: 'Splitter baseline',
        value: `~${typicalPythonSplitterRangeMibPerSec.low}-${typicalPythonSplitterRangeMibPerSec.high} MiB/s`
      }
    },
    rust: {
      code: `use wesichain_graph::ReActGraphBuilder;

let graph = ReActGraphBuilder::new()
    .llm(openai)
    .tools(vec![search, calc])
    .build::<AppState>()?;

let result = graph.invoke_graph(state).await?;`,
      benefits: ['Async-native runtime', 'Composable graph state', 'Reproducible benchmarks'],
      stats: {
        label: 'Splitter benchmark',
        value: `${Math.min(...splitterRows.map((row) => row.throughputMibPerSec))}-${Math.max(...splitterRows.map((row) => row.throughputMibPerSec))} MiB/s`
      }
    }
  },
  {
    id: 'rag-pipeline',
    title: 'RAG Pipeline',
    python: {
      code: `from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA

vectorstore = Chroma.from_documents(docs)
qa = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=vectorstore.as_retriever()
)

result = qa.invoke(query)`,
      issues: ['Async not native', 'Memory-heavy', 'Complex deps'],
      stats: { label: 'Complexity', value: 'Higher runtime overhead' }
    },
    rust: {
      code: `use wesichain_rag::{Retriever, Pipeline};

let pipeline = Pipeline::builder()
    .embedder(embedder)
    .store(vector_store)
    .llm(llm)
    .build()?;

let stream = pipeline.stream(query).await?;`,
      benefits: ['Streaming-native', 'Typed interfaces', 'Modular crates'],
      stats: { label: 'Artifact-backed', value: 'Bench snapshots in repo' }
    }
  },
  {
    id: 'graph-workflow',
    title: 'Graph Workflow',
    python: {
      code: `from langgraph.graph import StateGraph
from langgraph.checkpoint import MemorySaver

builder = StateGraph(State)
builder.add_node("agent", agent_node)
builder.add_edge("start", "agent")

graph = builder.compile(checkpointer=MemorySaver())
result = graph.invoke(state, config)`,
      issues: ['Limited checkpointing', 'State serialization', 'Debugging difficulty'],
      stats: { label: 'Persistence', value: 'Depends on integration setup' }
    },
    rust: {
      code: `use wesichain_graph::GraphBuilder;

let graph = GraphBuilder::new()
    .add_node("agent", agent)
    .set_entry("agent")
    .with_checkpointer(checkpointer, "thread-1")
    .build()?;

let result = graph.invoke_graph(state).await?;`,
      benefits: ['Full checkpointing', 'Type-safe state', 'Debuggable'],
      stats: { label: 'Execution model', value: 'Stateful + resumable' }
    }
  }
];

export function CodeComparison() {
  const lowerMultiplier = Math.round(
    Math.max(...splitterRows.map((row) => row.throughputMibPerSec)) /
      typicalPythonSplitterRangeMibPerSec.high
  );
  const upperMultiplier = Math.round(
    Math.max(...splitterRows.map((row) => row.throughputMibPerSec)) /
      typicalPythonSplitterRangeMibPerSec.low
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // Auto-rotate scenarios
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % scenarios.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const activeScenario = scenarios[activeIndex];

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(activeScenario.rust.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full">
      {/* Scenario tabs */}
      <div className="flex gap-2 mb-4">
        {scenarios.map((scenario, index) => (
          <button
            key={scenario.id}
            onClick={() => setActiveIndex(index)}
            className={clsx(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              index === activeIndex
                ? 'bg-rust-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
            )}
          >
            {scenario.title}
          </button>
        ))}
      </div>

      {/* Code comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Python side */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-950">
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-medium">Python</span>
              <span className="text-neutral-500">(LangChain)</span>
            </div>
            <div className="flex gap-1.5">
              {activeScenario.python.issues.map((issue, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400">
                  {issue}
                </span>
              ))}
            </div>
          </div>
          <div className="p-4">
            <pre className="text-sm text-neutral-300 overflow-x-auto">
              <code>{activeScenario.python.code}</code>
            </pre>
          </div>
          <div className="px-4 py-2 border-t border-neutral-800 bg-neutral-950/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">{activeScenario.python.stats.label}</span>
              <span className="text-red-400 font-mono">{activeScenario.python.stats.value}</span>
            </div>
          </div>
        </div>

        {/* Rust side */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-950">
            <div className="flex items-center gap-2">
              <span className="text-rust-500 font-medium">Rust</span>
              <span className="text-neutral-500">(Wesichain)</span>
            </div>
            <div className="flex gap-1.5">
              {activeScenario.rust.benefits.map((benefit, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">
                  {benefit}
                </span>
              ))}
            </div>
          </div>
          <div className="p-4">
            <pre className="text-sm text-neutral-300 overflow-x-auto">
              <code>{activeScenario.rust.code}</code>
            </pre>
          </div>
          <div className="px-4 py-2 border-t border-neutral-800 bg-neutral-950/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 text-sm">{activeScenario.rust.stats.label}</span>
              <span className="text-green-400 font-mono text-sm">{activeScenario.rust.stats.value}</span>
            </div>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-green-500">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Speed comparison */}
      <div className="mt-4 flex items-center justify-center gap-4 text-sm">
        <span className="text-red-400">⚠️ Python baseline</span>
        <span className="text-neutral-600">→</span>
        <span className="text-green-400 font-medium">✅ Published splitter benchmark shows ~{lowerMultiplier}-{upperMultiplier}x throughput improvement</span>
      </div>
    </div>
  );
}
