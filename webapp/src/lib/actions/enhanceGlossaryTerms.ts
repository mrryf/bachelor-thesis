import { glossaryTerms } from "$lib/data/content";
import type { Action } from "svelte/action";

/**
 * Svelte action that enhances rendered HTML content by finding glossary terms
 * and adding interactive tooltips to them.
 *
 * Usage: <div use:enhanceGlossaryTerms>{@html content}</div>
 */
export const enhanceGlossaryTerms: Action = (node: HTMLElement) => {
	// Create a map of terms for quick lookup
	const termMap = new Map(glossaryTerms.map((t) => [t.term.toLowerCase(), t]));

	// Create regex pattern from glossary terms (longest first to avoid partial matches)
	const sortedTerms = [...termMap.keys()].sort((a, b) => b.length - a.length);
	const pattern = new RegExp(
		`\\b(${sortedTerms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
		"gi"
	);

	function processTextNodes(element: HTMLElement) {
		const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
			acceptNode(node) {
				// Skip text nodes inside code, pre, script, style tags
				const parent = node.parentElement;
				if (
					parent &&
					["CODE", "PRE", "SCRIPT", "STYLE", "ABBR"].includes(parent.tagName)
				) {
					return NodeFilter.FILTER_REJECT;
				}
				return NodeFilter.FILTER_ACCEPT;
			},
		});

		const textNodes: Text[] = [];
		let currentNode;

		while ((currentNode = walker.nextNode())) {
			textNodes.push(currentNode as Text);
		}

		// Process each text node
		textNodes.forEach((textNode) => {
			const text = textNode.textContent || "";
			const matches = [...text.matchAll(pattern)];

			if (matches.length === 0) return;

			const fragment = document.createDocumentFragment();
			let lastIndex = 0;

			matches.forEach((match) => {
				const matchText = match[0];
				const matchIndex = match.index!;

				// Add text before match
				if (matchIndex > lastIndex) {
					fragment.appendChild(
						document.createTextNode(text.slice(lastIndex, matchIndex))
					);
				}

				// Create enhanced term element
				const term = termMap.get(matchText.toLowerCase());
				if (term) {
					const abbr = document.createElement("abbr");
					abbr.textContent = matchText;
					abbr.className =
						"glossary-term border-b border-dotted border-primary cursor-help text-primary font-medium no-underline hover:border-solid transition-all";
					abbr.setAttribute("data-glossary-term", term.term);
					abbr.setAttribute("data-glossary-definition", term.definition);
					fragment.appendChild(abbr);
				} else {
					fragment.appendChild(document.createTextNode(matchText));
				}

				lastIndex = matchIndex + matchText.length;
			});

			// Add remaining text
			if (lastIndex < text.length) {
				fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
			}

			// Replace the text node with the fragment
			textNode.parentNode?.replaceChild(fragment, textNode);
		});
	}

	// Process the content
	processTextNodes(node);

	return {
		destroy() {
			// Cleanup if needed
		},
	};
};
