import type { Action } from 'svelte/action';
import { buildCitationMap } from '$lib/data/references';

// OPTIMIZATION: Pre-compile regex patterns (compiled once, not per text node)
const CITATION_PATTERNS = [
	// Multiple citations with semicolons + vgl.: (vgl. Author1, 2024; Author2, 2022)
	/\((?:vgl\.|cf\.|see)\s+([A-ZÄÖÜa-zäöüß][A-Za-zäöüÄÖÜß\-'\s.&]+(?:et al\.|AG|GmbH)?),\s*(\d{4}[a-z]?);\s*([A-ZÄÖÜa-zäöüß][A-Za-zäöüÄÖÜß\-'\s.&]+(?:et al\.|AG|GmbH)?),\s*(\d{4}[a-z]?)\)/g,
	// Multiple citations with semicolons: (Author1, 2024; Author2, 2022)
	/\(([A-ZÄÖÜa-zäöüß][A-Za-zäöüÄÖÜß\-'\s.&]+(?:et al\.|AG|GmbH)?),\s*(\d{4}[a-z]?);\s*([A-ZÄÖÜa-zäöüß][A-Za-zäöüÄÖÜß\-'\s.&]+(?:et al\.|AG|GmbH)?),\s*(\d{4}[a-z]?)\)/g,
	// Parenthetical: (Author et al., 2024) or (Author, 2024) or (Author & Author, 2024)
	/\(([A-ZÄÖÜa-zäöüß][A-Za-zäöüÄÖÜß\-'\s&]+(?:\s+et al\.)?),\s*(\d{4}[a-z]?)\)/g,
	// Narrative with et al.: Author et al. (2024) - MUST have et al.
	/([A-ZÄÖÜa-zäöüß][A-Za-zäöüÄÖÜß\-'&]+\s+et\s+al\.)\s+\((\d{4}[a-z]?)\)/g,
	// Narrative single author: Author (2024) - no et al.
	/([A-ZÄÖÜa-zäöüß][A-Za-zäöüÄÖÜß\-'\s]+)\s+\((\d{4}[a-z]?)\)/g,
] as const;

// Minimum citation length: "(A,2000)" = 8 chars
const MIN_CITATION_LENGTH = 8;

// OPTIMIZATION: Process nodes in chunks during idle time
const CHUNK_SIZE = 10; // Process 10 nodes per idle callback

/**
 * Process a single text node for citations
 */
function processTextNode(textNode: Text, citationMap: Map<string, string>): void {
		const text = textNode.textContent || '';

		// OPTIMIZATION: Early exit checks - avoid expensive regex if text can't contain citations
		if (!text.trim()) return;
		if (text.length < MIN_CITATION_LENGTH) return; // Too short for any citation
		if (!text.includes('(')) return; // No opening paren, can't have citations

		const allMatches: Array<{ text: string; index: number; refId: string | string[]; isSemicolon?: boolean }> = [];

		// Try each pre-compiled pattern
		for (let patternIdx = 0; patternIdx < CITATION_PATTERNS.length; patternIdx++) {
			const pattern = CITATION_PATTERNS[patternIdx];
			const matches = Array.from(text.matchAll(pattern));

			for (const match of matches) {
				const fullMatch = match[0];

				// Handle semicolon-separated citations (patterns 0 and 1)
				if ((patternIdx === 0 || patternIdx === 1) && match[3] && match[4]) {
					// Two citations: (Author1, YEAR1; Author2, YEAR2)
					const citations = [
						{ author: match[1]?.trim(), year: match[2]?.trim() },
						{ author: match[3]?.trim(), year: match[4]?.trim() }
					];

					// Process each citation separately but track as single match to avoid overlap
					const foundIds: string[] = [];
					for (const { author, year } of citations) {
						if (!author || !year) continue;

						// Try with full author name and last name
						const attempts = [
							`(${author}, ${year})`,
							`${author}, ${year}`,
							`${author} (${year})`,
						];

						// If author contains "et al.", also try without it
						if (author.includes('et al.')) {
							const authorWithoutEtAl = author.replace(/\s+et al\.$/, '');
							attempts.push(
								`(${authorWithoutEtAl}, ${year})`,
								`${authorWithoutEtAl}, ${year}`,
								`${authorWithoutEtAl} (${year})`
							);
						} else {
							// Only try lastWord extraction if NOT "et al." format
							const lastWord = author.split(/\s+/).pop() || author;
							attempts.push(
								`(${lastWord}, ${year})`,
								`${lastWord}, ${year}`,
								`${lastWord} (${year})`
							);
						}

						for (const attempt of attempts) {
							if (citationMap.has(attempt)) {
								foundIds.push(citationMap.get(attempt)!);
								break;
							}
						}
					}

					// Add as single match if we found both citations
					if (foundIds.length === 2) {
						allMatches.push({
							text: fullMatch,
							index: match.index!,
							refId: foundIds, // Array of two IDs
							isSemicolon: true
						});
					}
				} else {
					// Regular single citation
					const author = match[1]?.trim();
					const year = match[2]?.trim();

					if (!author || !year) continue;

					// Try to find reference ID
					let refId: string | undefined;

					// Build possible citation formats to check
					// Include attempts with just last name (for organization names)
					// But skip lastWord extraction if author contains "et al." (would extract "al." which is wrong)
					const attempts = [
						`(${author}, ${year})`, // (Full Author, YEAR)
						`${author}, ${year}`, // Full Author, YEAR
						`${author} (${year})`, // Full Author (YEAR)
					];

					// If author contains "et al.", also try without it (for data inconsistencies)
					if (author.includes('et al.')) {
						const authorWithoutEtAl = author.replace(/\s+et al\.$/, '');
						attempts.push(
							`(${authorWithoutEtAl}, ${year})`,
							`${authorWithoutEtAl}, ${year}`,
							`${authorWithoutEtAl} (${year})`
						);
					} else {
						// Only try lastWord extraction if NOT "et al." format
						const lastWord = author.split(/\s+/).pop() || author;
						attempts.push(
							`(${lastWord}, ${year})`, // (LastName, YEAR)
							`${lastWord}, ${year}`, // LastName, YEAR
							`${lastWord} (${year})` // LastName (YEAR)
						);
					}

					for (const attempt of attempts) {
						if (citationMap.has(attempt)) {
							refId = citationMap.get(attempt);
							break;
						}
					}

					if (refId) {
						allMatches.push({
							text: fullMatch,
							index: match.index!,
							refId
						});
					}
				}
			}
		}

		if (allMatches.length === 0) return;

		// Sort by index and remove overlaps
		allMatches.sort((a, b) => a.index - b.index);

		const uniqueMatches: typeof allMatches = [];
		for (const current of allMatches) {
			const currentEnd = current.index + current.text.length;

			const overlaps = uniqueMatches.some((existing) => {
				const existingEnd = existing.index + existing.text.length;
				return (
					(current.index >= existing.index && current.index < existingEnd) ||
					(currentEnd > existing.index && currentEnd <= existingEnd) ||
					(current.index <= existing.index && currentEnd >= existingEnd)
				);
			});

			if (!overlaps) {
				uniqueMatches.push(current);
			}
		}

		// Build replacement fragment
		const fragment = document.createDocumentFragment();
		let lastIndex = 0;

		uniqueMatches.forEach(({ text: matchText, index, refId, isSemicolon }) => {
			// Add text before match (preserve original text!)
			if (index > lastIndex) {
				fragment.appendChild(document.createTextNode(text.slice(lastIndex, index)));
			}

			// Handle semicolon-separated citations
			if (isSemicolon && Array.isArray(refId)) {
				// Split the text by semicolon
				const parts = matchText.replace(/^\(/, '').replace(/\)$/, '').split(';');

				fragment.appendChild(document.createTextNode('('));

				parts.forEach((part, idx) => {
					const cite = document.createElement('a');
					cite.textContent = part.trim();
					cite.href = `/downloads#ref-${refId[idx]}`;
					cite.className =
						'citation-ref text-primary font-medium underline decoration-dotted underline-offset-2 hover:decoration-solid hover:text-primary/80 transition-all cursor-pointer';
					cite.setAttribute('data-citation-id', refId[idx]);
					cite.setAttribute('onclick', 'event.preventDefault()');
					fragment.appendChild(cite);

					if (idx < parts.length - 1) {
						fragment.appendChild(document.createTextNode('; '));
					}
				});

				fragment.appendChild(document.createTextNode(')'));
			} else {
				// Regular single citation
				const cite = document.createElement('a');
				cite.textContent = matchText;
				cite.href = `/downloads#ref-${refId}`;
				cite.className =
					'citation-ref text-primary font-medium underline decoration-dotted underline-offset-2 hover:decoration-solid hover:text-primary/80 transition-all cursor-pointer';
				cite.setAttribute('data-citation-id', refId as string);
				cite.setAttribute('onclick', 'event.preventDefault()');
				fragment.appendChild(cite);
			}

			lastIndex = index + matchText.length;
		});

		// Add remaining text (important!)
		if (lastIndex < text.length) {
			fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
		}

		// Replace only if we have actual matches
		if (uniqueMatches.length > 0) {
			textNode.parentNode?.replaceChild(fragment, textNode);
		}
}

/**
 * Svelte action to enhance citation references in rendered HTML
 * Automatically detects and wraps citations with interactive elements
 * OPTIMIZATION: Uses requestIdleCallback for non-blocking processing
 */
export const enhanceCitations: Action = (node: HTMLElement) => {
	// Skip if already processed
	if (node.querySelector('.citation-ref')) return;

	// Build citation map (format -> ref ID)
	const citationMap = buildCitationMap();

	// Collect all text nodes to process
	const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
		acceptNode: (node) => {
			const parent = node.parentElement;
			if (!parent) return NodeFilter.FILTER_REJECT;
			// Skip if already processed or in code blocks
			if (
				parent.classList.contains('citation-ref') ||
				parent.tagName === 'CODE' ||
				parent.tagName === 'PRE' ||
				parent.tagName === 'SCRIPT'
			) {
				return NodeFilter.FILTER_REJECT;
			}
			return NodeFilter.FILTER_ACCEPT;
		}
	});

	const nodesToProcess: Text[] = [];
	let currentNode: Node | null;
	while ((currentNode = walker.nextNode())) {
		nodesToProcess.push(currentNode as Text);
	}

	// Track processing state
	let index = 0;
	let idleCallbackId: number | null = null;

	/**
	 * Process a chunk of text nodes during idle time
	 */
	function processChunk(deadline: IdleDeadline) {
		// Process nodes while we have idle time (or until deadline)
		while (
			index < nodesToProcess.length &&
			(deadline.timeRemaining() > 0 || deadline.didTimeout)
		) {
			const end = Math.min(index + CHUNK_SIZE, nodesToProcess.length);

			for (let i = index; i < end; i++) {
				processTextNode(nodesToProcess[i], citationMap);
			}

			index = end;
		}

		// Schedule next chunk if there are more nodes to process
		if (index < nodesToProcess.length) {
			idleCallbackId = requestIdleCallback(processChunk);
		}
	}

	// Start processing during idle time
	// Use timeout of 1000ms to ensure processing happens even if browser is busy
	idleCallbackId = requestIdleCallback(processChunk, { timeout: 1000 });

	return {
		destroy() {
			// Cancel any pending idle callbacks
			if (idleCallbackId !== null) {
				cancelIdleCallback(idleCallbackId);
			}
		}
	};
};
