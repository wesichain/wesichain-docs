import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, Loader2 } from 'lucide-react';

interface SearchResult {
  url: string;
  title: string;
  excerpt: string;
}

export function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search with Pagefind
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const search = async () => {
      setIsLoading(true);
      try {
        // Pagefind is loaded dynamically from the built index
        const pagefind = await (window as unknown as { pagefind: { search: (q: string) => Promise<{ results: { data: () => Promise<{ url: string; meta: { title: string }; excerpt: string }> }[] }> } }).pagefind);
        const searchResult = await pagefind.search(query);
        const searchResults = await Promise.all(
          searchResult.results.slice(0, 8).map(r => r.data())
        );
        setResults(searchResults.map(r => ({
          url: r.url,
          title: r.meta.title,
          excerpt: r.excerpt,
        })));
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeout = setTimeout(search, 150);
    return () => clearTimeout(timeout);
  }, [query]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-400 hover:border-neutral-700 hover:text-white transition-colors"
      >
        <SearchIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-neutral-700 bg-neutral-800 px-1.5 text-xs text-neutral-500">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[20vh] p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-neutral-800 px-4 py-3">
          <SearchIcon className="h-5 w-5 text-neutral-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documentation..."
            className="flex-1 bg-transparent text-white placeholder-neutral-500 outline-none"
          />
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />}
          <button
            onClick={() => setIsOpen(false)}
            className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {results.length === 0 && query.trim() && !isLoading && (
            <div className="px-4 py-8 text-center text-neutral-500">
              No results found for &quot;{query}&quot;
            </div>
          )}

          {results.length > 0 && (
            <ul className="divide-y divide-neutral-800">
              {results.map((result, index) => (
                <li key={index}>
                  <a
                    href={result.url}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 hover:bg-neutral-800 transition-colors"
                  >
                    <div className="font-medium text-white">{result.title}</div>
                    <div
                      className="mt-1 text-sm text-neutral-400 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: result.excerpt }}
                    />
                  </a>
                </li>
              ))}
            </ul>
          )}

          {!query.trim() && (
            <div className="px-4 py-8 text-center text-neutral-500">
              Start typing to search documentation...
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-950 px-4 py-2 text-xs text-neutral-500">
          <div className="flex items-center gap-4">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <span>Powered by Pagefind</span>
        </div>
      </div>
    </div>
  );
}
