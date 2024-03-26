import { getCollection } from "astro:content";

export async function getEventsCategories() {
	const events = (await getCollection("events")).filter((event) => !event.data.draft);
	return [
		...new Set(events.map((event) => event.data.category).flat())
	];
}

export async function getEvents() {
	return (await getCollection("events"))
		.filter((event) => !event.data.draft)
		.filter((event) => event.data.eventDate > new Date())
		.sort((b, a) => b.data.eventDate.valueOf() - a.data.eventDate.valueOf());

}