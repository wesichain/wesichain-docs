import { useState } from 'react';
import type { Example, ExampleCategory, ExampleDifficulty } from '../data/examples';

const CATEGORY_LABELS: Record<ExampleCategory, string> = {
  agent: 'Agent',
  rag: 'RAG',
  graph: 'Graph',
  server: 'Server',
  observability: 'Observability',
  tools: 'Tools',
};

const DIFFICULTY_STYLES: Record<ExampleDifficulty, string> = {
  beginner: 'bg-green-900/50 text-green-400 border border-green-800',
  intermediate: 'bg-yellow-900/50 text-yellow-400 border border-yellow-800',
  advanced: 'bg-orange-900/50 text-orange-400 border border-orange-800',
};

const ALL_CATEGORIES: ExampleCategory[] = ['agent', 'rag', 'graph', 'server', 'observability', 'tools'];
const ALL_DIFFICULTIES: ExampleDifficulty[] = ['beginner', 'intermediate', 'advanced'];

const GITHUB_BASE = 'https://github.com/wesichain/wesichain/blob/main/';

type Props = { examples: Example[] };

export default function ExamplesGallery({ examples }: Props) {
  const [activeCategory, setActiveCategory] = useState<ExampleCategory | 'all'>('all');
  const [activeDifficulty, setActiveDifficulty] = useState<ExampleDifficulty | 'all'>('all');

  const filtered = examples.filter(ex => {
    const catMatch = activeCategory === 'all' || ex.categories.includes(activeCategory);
    const diffMatch = activeDifficulty === 'all' || ex.difficulty === activeDifficulty;
    return catMatch && diffMatch;
  });

  const pillBase = 'rounded-full px-3 py-1 text-sm font-medium transition-colors cursor-pointer';
  const pillActive = 'bg-rust-600 text-white';
  const pillInactive = 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700';

  return (
    <div>
      {/* Filter row */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          className={`${pillBase} ${activeCategory === 'all' ? pillActive : pillInactive}`}
          onClick={() => setActiveCategory('all')}
        >
          All Categories
        </button>
        {ALL_CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`${pillBase} ${activeCategory === cat ? pillActive : pillInactive}`}
            onClick={() => setActiveCategory(cat)}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          className={`${pillBase} ${activeDifficulty === 'all' ? pillActive : pillInactive}`}
          onClick={() => setActiveDifficulty('all')}
        >
          All Levels
        </button>
        {ALL_DIFFICULTIES.map(diff => (
          <button
            key={diff}
            className={`${pillBase} ${activeDifficulty === diff ? pillActive : pillInactive}`}
            onClick={() => setActiveDifficulty(diff)}
          >
            {diff.charAt(0).toUpperCase() + diff.slice(1)}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-sm text-neutral-500 mb-6">
        {filtered.length} {filtered.length === 1 ? 'example' : 'examples'}
      </p>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(ex => (
          <div
            key={ex.id}
            className="relative rounded-2xl border border-neutral-800 bg-neutral-900 p-6 flex flex-col"
          >
            {/* Difficulty badge */}
            <span className={`absolute top-4 right-4 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${DIFFICULTY_STYLES[ex.difficulty]}`}>
              {ex.difficulty}
            </span>

            <h3 className="text-base font-semibold text-white pr-20 mb-2">{ex.title}</h3>
            <p className="text-sm text-neutral-400 mb-4 flex-1">{ex.description}</p>

            {/* Crate chips */}
            <div className="flex flex-wrap gap-1.5 mb-4 overflow-x-auto">
              {ex.crates.map(crate => (
                <span key={crate} className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300 whitespace-nowrap">
                  {crate}
                </span>
              ))}
            </div>

            {/* CTA row */}
            <div className="flex items-center gap-4 text-sm">
              <a
                href={GITHUB_BASE + ex.githubPath}
                target="_blank"
                rel="noopener noreferrer"
                className="text-rust-400 hover:text-rust-300 transition-colors"
              >
                View Source →
              </a>
              {ex.docPath && (
                <a
                  href={ex.docPath}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Guide →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-neutral-500 py-12">No examples match the selected filters.</p>
      )}
    </div>
  );
}
