import {getCollection} from "astro:content";

export async function getCategories() {
    const posts = await getCollection("blog");
    const categories = [
        ...new Set(posts.map((post) => post.data.category).flat()),
    ];

    return categories;
}

export async function getEventsCategories() {
    const events = await getCollection("events");
    const categories = [
        ...new Set(events.map((event) => event.data.category).flat()),
    ];

    return categories;

}

export async function getPosts() {
    const posts = (await getCollection("blog")).sort(
        (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
    );

    return posts;
}

export async function getEvents() {
    return (await getCollection("events"))
        .filter((event) => event.data.publishDate)
        .sort((a, b) => b.data.eventDate.valueOf() - a.data.eventDate.valueOf());

}

export async function getPostsByCategory(category: string) {
    const posts = (await getCollection("blog"))
        .filter((post) => post.data.category.includes(category))
        .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

    return posts;
}

export async function getGuides() {
    const guides = (await getCollection("guides"))
        .filter((guide) => guide.data.published)
        .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

    return guides;
}
