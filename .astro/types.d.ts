declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"events": {
"2024-10-13_valledupar_mediamaratonvalledupar.md": {
	id: "2024-10-13_valledupar_mediamaratonvalledupar.md";
  slug: "2024-10-13_valledupar_mediamaratonvalledupar";
  body: string;
  collection: "events";
  data: InferEntrySchema<"events">
} & { render(): Render[".md"] };
"2024-10-20_barranquilla_carreradelasrosas.md": {
	id: "2024-10-20_barranquilla_carreradelasrosas.md";
  slug: "2024-10-20_barranquilla_carreradelasrosas";
  body: string;
  collection: "events";
  data: InferEntrySchema<"events">
} & { render(): Render[".md"] };
"2024-10-20_bucaramanga_mediamaratonbucaramanga.md": {
	id: "2024-10-20_bucaramanga_mediamaratonbucaramanga.md";
  slug: "2024-10-20_bucaramanga_mediamaratonbucaramanga";
  body: string;
  collection: "events";
  data: InferEntrySchema<"events">
} & { render(): Render[".md"] };
"2024-10-6_bogota_runtouravianca.md": {
	id: "2024-10-6_bogota_runtouravianca.md";
  slug: "2024-10-6_bogota_runtouravianca";
  body: string;
  collection: "events";
  data: InferEntrySchema<"events">
} & { render(): Render[".md"] };
"2024-10_20_bogota_allianz15k.md": {
	id: "2024-10_20_bogota_allianz15k.md";
  slug: "2024-10_20_bogota_allianz15k";
  body: string;
  collection: "events";
  data: InferEntrySchema<"events">
} & { render(): Render[".md"] };
"2024-11-17_bogota_corremitierra.md": {
	id: "2024-11-17_bogota_corremitierra.md";
  slug: "2024-11-17_bogota_corremitierra";
  body: string;
  collection: "events";
  data: InferEntrySchema<"events">
} & { render(): Render[".md"] };
"2024-11-24_cali_10kdelaluz.md": {
	id: "2024-11-24_cali_10kdelaluz.md";
  slug: "2024-11-24_cali_10kdelaluz";
  body: string;
  collection: "events";
  data: InferEntrySchema<"events">
} & { render(): Render[".md"] };
"2024-11-24_guasca_newbalanceguasca.md": {
	id: "2024-11-24_guasca_newbalanceguasca.md";
  slug: "2024-11-24_guasca_newbalanceguasca";
  body: string;
  collection: "events";
  data: InferEntrySchema<"events">
} & { render(): Render[".md"] };
"2024-4-21_bogota_carreraverdebogota.md": {
	id: "2024-4-21_bogota_carreraverdebogota.md";
  slug: "2024-4-21_bogota_carreraverdebogota";
  body: string;
  collection: "events";
  data: InferEntrySchema<"events">
} & { render(): Render[".md"] };
"2024-4-21_medellin_corremitierra.md": {
	id: "2024-4-21_medellin_corremitierra.md";
  slug: "2024-4-21_medellin_corremitierra";
  body: string;
  collection: "events";
  data: InferEntrySchema<"events">
} & { render(): Render[".md"] };
"2024-4-28_sanandres_vueltaatleticaalaisladesanandres.md": {
	id: "2024-4-28_sanandres_vueltaatleticaalaisladesanandres.md";
  slug: "2024-4-28_sanandres_vueltaatleticaalaisladesanandres";
  body: string;
  collection: "events";
  data: InferEntrySchema<"events">
} & { render(): Render[".md"] };
"2024-4-7_cali_carreraluzmerytristan.md": {
	id: "2024-4-7_cali_carreraluzmerytristan.md";
  slug: "2024-4-7_cali_carreraluzmerytristan";
  body: string;
  collection: "events";
  data: InferEntrySchema<"events">
} & { render(): Render[".md"] };
"2024-5-19_bogota_carreradelasrosas.md": {
	id: "2024-5-19_bogota_carreradelasrosas.md";
  slug: "2024-5-19_bogota_carreradelasrosas";
  body: string;
  collection: "events";
  data: InferEntrySchema<"events">
} & { render(): Render[".md"] };
"2024-5-25_medellin_medallorun.md": {
	id: "2024-5-25_medellin_medallorun.md";
  slug: "2024-5-25_medellin_medallorun";
  body: string;
  collection: "events";
  data: InferEntrySchema<"events">
} & { render(): Render[".md"] };
"2024-6-16_barranquilla_corremitierra.md": {
	id: "2024-6-16_barranquilla_corremitierra.md";
  slug: "2024-6-16_barranquilla_corremitierra";
  body: string;
  collection: "events";
  data: InferEntrySchema<"events">
} & { render(): Render[".md"] };
"2024-6-16_medellin_correporlavida.md": {
	id: "2024-6-16_medellin_correporlavida.md";
  slug: "2024-6-16_medellin_correporlavida";
  body: string;
  collection: "events";
  data: InferEntrySchema<"events">
} & { render(): Render[".md"] };
"2024-6-9_cali_newbalancemediamaratondecali.md": {
	id: "2024-6-9_cali_newbalancemediamaratondecali.md";
  slug: "2024-6-9_cali_newbalancemediamaratondecali";
  body: string;
  collection: "events";
  data: InferEntrySchema<"events">
} & { render(): Render[".md"] };
"2024-6-9_rionegro_mediamaratonderionegro.md": {
	id: "2024-6-9_rionegro_mediamaratonderionegro.md";
  slug: "2024-6-9_rionegro_mediamaratonderionegro";
  body: string;
  collection: "events";
  data: InferEntrySchema<"events">
} & { render(): Render[".md"] };
"2024-7-28_bogota_mediamaratondebogota.md": {
	id: "2024-7-28_bogota_mediamaratondebogota.md";
  slug: "2024-7-28_bogota_mediamaratondebogota";
  body: string;
  collection: "events";
  data: InferEntrySchema<"events">
} & { render(): Render[".md"] };
"2024-7-7_medellin_allianz15k.md": {
	id: "2024-7-7_medellin_allianz15k.md";
  slug: "2024-7-7_medellin_allianz15k";
  body: string;
  collection: "events";
  data: InferEntrySchema<"events">
} & { render(): Render[".md"] };
"2024-8-11_laceja_newbalancelaceja.md": {
	id: "2024-8-11_laceja_newbalancelaceja.md";
  slug: "2024-8-11_laceja_newbalancelaceja";
  body: string;
  collection: "events";
  data: InferEntrySchema<"events">
} & { render(): Render[".md"] };
"2024-8-18_cali_carreradelpacifico.md": {
	id: "2024-8-18_cali_carreradelpacifico.md";
  slug: "2024-8-18_cali_carreradelpacifico";
  body: string;
  collection: "events";
  data: InferEntrySchema<"events">
} & { render(): Render[".md"] };
"2024-9-1_medellin_maratonmedellin.md": {
	id: "2024-9-1_medellin_maratonmedellin.md";
  slug: "2024-9-1_medellin_maratonmedellin";
  body: string;
  collection: "events";
  data: InferEntrySchema<"events">
} & { render(): Render[".md"] };
"2024-9-29_medellin_carreradelasrosas.md": {
	id: "2024-9-29_medellin_carreradelasrosas.md";
  slug: "2024-9-29_medellin_carreradelasrosas";
  body: string;
  collection: "events";
  data: InferEntrySchema<"events">
} & { render(): Render[".md"] };
"2024-9-8_bogota_carreradelamujer.md": {
	id: "2024-9-8_bogota_carreradelamujer.md";
  slug: "2024-9-8_bogota_carreradelamujer";
  body: string;
  collection: "events";
  data: InferEntrySchema<"events">
} & { render(): Render[".md"] };
"2025-2-16_cartagena_mediamaratondelmar.md": {
	id: "2025-2-16_cartagena_mediamaratondelmar.md";
  slug: "2025-2-16_cartagena_mediamaratondelmar";
  body: string;
  collection: "events";
  data: InferEntrySchema<"events">
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = typeof import("../src/content/config.js");
}
