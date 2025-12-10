import referencesData from './references.json';

export interface Reference {
	id: string;
	authors: string[];
	year: number;
	title: string;
	journal?: string;
	volume?: string;
	issue?: string;
	pages?: string;
	doi?: string;
	url?: string;
	type: 'article' | 'book' | 'conference' | 'thesis' | 'web';
	publisher?: string;
	booktitle?: string;
}

export const references: Reference[] = referencesData as Reference[];

// OPTIMIZATION: Memoization cache for getAuthorLastName
const authorLastNameCache = new Map<string, string>();

// OPTIMIZATION: Cache the built citation map (built once, reused)
let cachedCitationMap: Map<string, string> | null = null;

// Helper to get reference by ID
export function getReferenceById(id: string): Reference | undefined {
	return references.find(ref => ref.id === id);
}

// Helper to format authors for display
export function formatAuthors(authors: string[], maxDisplay: number = 3): string {
	if (authors.length <= maxDisplay) {
		if (authors.length === 1) return authors[0];
		if (authors.length === 2) return `${authors[0]} & ${authors[1]}`;
		return authors.slice(0, -1).join(', ') + ', & ' + authors[authors.length - 1];
	}
	return `${authors[0]} et al.`;
}

// Helper to format short citation (Author, Year)
export function formatShortCitation(ref: Reference): string {
	const authorsText = ref.authors.length === 1
		? ref.authors[0].split(',')[0] // Last name only
		: ref.authors.length === 2
		? `${ref.authors[0].split(',')[0]} & ${ref.authors[1].split(',')[0]}`
		: `${ref.authors[0].split(',')[0]} et al.`;

	return `${authorsText}, ${ref.year}`;
}

// Helper to get author last name (with memoization)
export function getAuthorLastName(author: string): string {
	// Check cache first
	if (authorLastNameCache.has(author)) {
		return authorLastNameCache.get(author)!;
	}

	let lastName: string;
	if (author.includes(',')) {
		lastName = author.split(',')[0].trim();
	} else {
		// Assume "First Last" format
		const parts = author.trim().split(/\s+/);
		lastName = parts[parts.length - 1];
	}

	// Cache for future use
	authorLastNameCache.set(author, lastName);
	return lastName;
}

// Build a map of possible citation formats to reference IDs (cached)
export function buildCitationMap(): Map<string, string> {
	// Return cached map if already built
	if (cachedCitationMap !== null) {
		return cachedCitationMap;
	}

	const citationMap = new Map<string, string>();

	for (const ref of references) {
		if (!ref.year || ref.year === 0) continue;

		const lastName = getAuthorLastName(ref.authors[0]);
		const year = ref.year.toString();

		// Single author: "Author, YEAR" or "(Author, YEAR)"
		if (ref.authors.length === 1) {
			// Basic formats
			citationMap.set(`${lastName}, ${year}`, ref.id);
			citationMap.set(`${lastName} (${year})`, ref.id);
			citationMap.set(`(${lastName}, ${year})`, ref.id);

			// With page numbers
			citationMap.set(`${lastName}, ${year},`, ref.id); // e.g., "Kelle, 2008, S. 174"
			citationMap.set(`(${lastName}, ${year},`, ref.id);

			// With vgl./cf./see
			citationMap.set(`(vgl. ${lastName}, ${year}`, ref.id);
			citationMap.set(`(cf. ${lastName}, ${year}`, ref.id);
			citationMap.set(`(see ${lastName}, ${year}`, ref.id);
		}
		// Two authors: "Author1 & Author2, YEAR"
		else if (ref.authors.length === 2) {
			const lastName2 = getAuthorLastName(ref.authors[1]);

			citationMap.set(`${lastName} & ${lastName2}, ${year}`, ref.id);
			citationMap.set(`${lastName} and ${lastName2}, ${year}`, ref.id);
			citationMap.set(`(${lastName} & ${lastName2}, ${year})`, ref.id);
			citationMap.set(`(${lastName} and ${lastName2}, ${year})`, ref.id);

			// With page numbers
			citationMap.set(`(${lastName} & ${lastName2}, ${year},`, ref.id);
			citationMap.set(`(${lastName} and ${lastName2}, ${year},`, ref.id);
		}
		// Multiple authors: "Author et al., YEAR"
		else {
			citationMap.set(`${lastName} et al., ${year}`, ref.id);
			citationMap.set(`${lastName} et al. (${year})`, ref.id);
			citationMap.set(`(${lastName} et al., ${year})`, ref.id);
			citationMap.set(`(${lastName} et al., ${year},`, ref.id); // with page numbers
		}
	}

	// Cache the map for future calls
	cachedCitationMap = citationMap;
	return citationMap;
}

// OPTIMIZATION: Clear caches (useful for testing or if references change)
export function clearCitationCaches(): void {
	authorLastNameCache.clear();
	cachedCitationMap = null;
}
