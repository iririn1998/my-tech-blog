import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
	schema: z.object({
		title: z.string(),
		excerpt: z.string(),
		pubDate: z.coerce.date(),
		tags: z.array(z.string()).min(1),
		featured: z.boolean().default(false),
		showToc: z.boolean().default(true),
	}),
});

export const collections = { blog };
