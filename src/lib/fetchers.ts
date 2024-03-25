import { getCollection } from "astro:content";

export async function getEventsCategories() {
	const events = await getCollection("events");
	return [
		...new Set(events.map((event) => event.data.category).flat())
	];
}

export async function getEvents() {
	return (await getCollection("events"))
		.filter((event) => event.data.eventDate)
		.sort((b, a) => b.data.eventDate.valueOf() - a.data.eventDate.valueOf());

}