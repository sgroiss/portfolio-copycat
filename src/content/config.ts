// src/content/config.ts
import { defineCollection, z } from "astro:content";

// --- Sections-Schema --------------------------------------------------------

const sectionSchema = z.discriminatedUnion("type", [
  // Ein einzelnes Bild oder Video
  z.object({
    type: z.literal("media"),
    format: z.enum(["image", "video"]),
    src: z.string(),
    alt: z.string().optional(),
    poster: z.string().optional(),
    class: z.string().optional(),
    fullwidth: z.boolean().optional(),
  }),

  // Gruppe von Medien (z.B. 2 Bilder im Grid)
  z.object({
    type: z.literal("media-group"),
    layout: z.enum(["2col", "3col"]).default("2col"),
    gap: z.string().optional(), // z.B. "gap-4"
    items: z.array(
      z.object({
        format: z.enum(["image", "video"]),
        src: z.string(),
        alt: z.string().optional(),
        poster: z.string().optional(),
        class: z.string().optional(), // Tailwind für das einzelne Item
      }),
    ),
  }),

  // Textblock
  z.object({
    type: z.literal("text"),
    title: z.string(),
    body: z.string(),
  }),

  // Spacer / Vertical Space
  z.object({
    type: z.literal("spacer"),
    size: z.string().default("py-20"), // Tailwind-Klasse
  }),
]);

// --- Projects-Collection ----------------------------------------------------

const projectsCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    desc: z.string(),
    img: z.string(),
    imgAlt: z.string().optional(),
    year: z.number(),
    client: z.string().optional(),
    role: z.array(z.string()).optional(),
    featured: z.boolean().default(true),
    order: z.number().optional(),
    overlayColor: z.string().optional(),
    contentColor: z.string().optional(),
    contentTextColor: z.string().optional(),
    sections: z.array(sectionSchema).optional(),
  }),
});

export const collections = {
  projects: projectsCollection,
};
