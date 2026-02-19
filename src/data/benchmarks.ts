export type SplitterRow = {
  size: string;
  throughputMibPerSec: number;
  avgTime: string;
};

export type ConnectorRow = {
  name: string;
  wesichainMs: number;
  baselineMs: number;
  caveat: string;
};

export const splitterRows: SplitterRow[] = [
  { size: '16 KB', throughputMibPerSec: 221, avgTime: '70.8 us' },
  { size: '128 KB', throughputMibPerSec: 218, avgTime: '572 us' },
  { size: '1 MB', throughputMibPerSec: 201, avgTime: '4.97 ms' },
];

export const typicalPythonSplitterRangeMibPerSec = {
  low: 50,
  high: 100,
};

export const connectorRows: ConnectorRow[] = [
  {
    name: 'Qdrant payload construction',
    wesichainMs: 0.801,
    baselineMs: 0.998,
    caveat: 'single local run, synthetic dataset, no network',
  },
  {
    name: 'Weaviate payload construction',
    wesichainMs: 1.099,
    baselineMs: 1.45,
    caveat: 'single local run, synthetic dataset, no network',
  },
];

export const benchmarkSources = {
  splitterReadme: 'wesichain/docs/benchmarks/README.md',
  qdrantJson: 'wesichain/docs/benchmarks/data/qdrant-2026-02-16.json',
  weaviateJson: 'wesichain/docs/benchmarks/data/weaviate-2026-02-16.json',
};
