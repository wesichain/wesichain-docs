import { getCollection } from 'astro:content';

const GROUP_ORDER: Record<string, number> = {
  'Getting Started': 0,
  'Architecture': 1,
  'Guides': 2,
  'AI Tools': 3,
};

export type NavEntry = {
  slug: string;
  href: string;
  title: string;
  group: string;
  order: number;
};

export async function getDocsFlatNav(): Promise<NavEntry[]> {
  const docs = await getCollection('docs', ({ data }) => !data.draft);
  return docs
    .map(doc => ({
      slug: doc.slug,
      href: `/docs/${doc.slug}`,
      title: doc.data.title,
      group: doc.data.group ?? 'Other',
      order: doc.data.order ?? 999,
    }))
    .sort((a, b) => {
      const gDiff = (GROUP_ORDER[a.group] ?? 99) - (GROUP_ORDER[b.group] ?? 99);
      return gDiff !== 0 ? gDiff : a.order - b.order;
    });
}
