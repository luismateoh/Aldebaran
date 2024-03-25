import {defineCollection, z} from "astro:content";

const blog = defineCollection({
    // Type-check frontmatter using a schema
    schema: ({image}) =>
        z.object({
            title: z.string(),
            description: z.string(),
            cover: z.string(),
            category: z.string(),
            // Transform string to Date object
            pubDate: z
                .string()
                .or(z.date())
                .transform((val) => new Date(val)),
            updatedDate: z
                .string()
                .optional()
                .transform((str) => (str ? new Date(str) : undefined)),
        }),
});

const docs = defineCollection({
    schema: z.object({
        title: z.string(),
        description: z.string(),
    }),
});

const guides = defineCollection({
    schema: z.object({
        title: z.string(),
        description: z.string(),
        published: z.boolean().default(true),
        featured: z.boolean().default(false),
        pubDate: z
            .string()
            .or(z.date())
            .transform((val) => new Date(val)),
    }),
});

const releases = defineCollection({
    // Type-check frontmatter using a schema
    schema: ({image}) =>
        z.object({
            title: z.string(),
            description: z.string(),
            versionNumber: z.string(),
            image: z.object({
                src: image(),
                alt: z.string(),
            }),
            // Transform string to Date object
            date: z.date({coerce: true}),
        }),
});

const events = defineCollection({
    schema: ({image}) =>
        z.object({
            title: z.string(),
            author: z.string().default("Alderaban"),
            publishDate: z
                .string()
                .or(z.date())
                .transform((val) => new Date(val)),
            draft: z.boolean(),
            category: z.string(),
            tags: z.array(z.string()),
            snippet: z.string(),
            municipality: z.string(),
            department: z.string(),
            altitude: z.string(),
            eventDate: z
                .string()
                .or(z.date())
                .transform((val) => new Date(val)),
            organizer: z.string(),
            registrationDeadline: z
                .string()
                .or(z.date())
                .optional()
                .transform((str) => (str ? new Date(str) : undefined)),
            registrationFeed: z.string(),
            website: z.string(),
            distances: z.array(z.string()),
            cover: z.string(),
        }),

});

export const collections = {blog, docs, guides, releases, events};
