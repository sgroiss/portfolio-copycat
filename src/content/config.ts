import { defineCollection, z } from "astro:content";

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    desc: z.string(),
    img: z.string().optional(),
    year: z.number().optional(),
    client: z.string().optional(),
    role: z.array(z.string()).optional(),
    featured: z.boolean().optional().default(true),
    order: z.number().optional(),
  }),
});

export const collections = {
  projects,
};
