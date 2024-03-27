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

export async function getEventsLocations() {
	const events = (await getCollection("events")).filter((event) => !event.data.draft);
	return [
		...new Set(events.map((event) => event.data.municipality).flat())
	];
}

export async function getEventsMunicipalitiesByDepartments() {
	// Fetch all events
	const events = await getCollection("events");

	// Filter out drafts
	const publishedEvents = events.filter((event) => !event.data.draft);

	// Group by department and municipality
	const grouped = publishedEvents.reduce((acc: { [key: string]: Set<string> }, event) => {
		const department = event.data.department;
		const municipality = event.data.municipality;

		// Initialize department if it doesn't exist
		if (!acc[department]) {
			acc[department] = new Set();
		}

		// Add municipality to department
		acc[department].add(municipality);

		return acc;
	}, {});

	// Convert sets to arrays, sort them, and convert them back to sets
	for (const department in grouped) {
		grouped[department] = new Set([...grouped[department]].sort());
	}

	// Sort departments
	const sorted = Object.keys(grouped).sort().reduce((acc: { [key: string]: Set<string> }, department) => {
		acc[department] = grouped[department];
		return acc;
	}, {});

	return sorted;
}