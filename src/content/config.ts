import { defineCollection, z } from 'astro:content';

const docs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().optional(),
    group: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { docs };
