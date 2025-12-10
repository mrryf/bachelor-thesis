<script lang="ts">
	import { glossaryTerms } from "$lib/data/content";
	import { sanitizeHtml } from "$lib/utils";
	import GlossaryTerm from "./GlossaryTerm.svelte";

	let { content, class: className = "" }: { content: string; class?: string } = $props();

	// Create a map of terms for quick lookup
	const termMap = new Map(glossaryTerms.map((t) => [t.term, t.definition]));

	// Parse HTML and identify glossary terms
	// This splits the content into parts, identifying glossary terms
	function parseContent(html: string) {
		const sanitized = sanitizeHtml(html);
		const parts: Array<{ type: "text" | "term"; content: string }> = [];

		// Create regex pattern from glossary terms (longest first to avoid partial matches)
		const sortedTerms = [...termMap.keys()].sort((a, b) => b.length - a.length);
		const pattern = new RegExp(
			`\\b(${sortedTerms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
			"g"
		);

		// Split content while preserving HTML tags
		const tempDiv = document.createElement("div");
		tempDiv.innerHTML = sanitized;

		function processTextNode(node: Node): Array<{ type: "text" | "term"; content: string }> {
			if (node.nodeType === Node.TEXT_NODE) {
				const text = node.textContent || "";
				const segments: Array<{ type: "text" | "term"; content: string }> = [];
				let lastIndex = 0;

				let match;
				while ((match = pattern.exec(text)) !== null) {
					// Add text before match
					if (match.index > lastIndex) {
						segments.push({ type: "text", content: text.slice(lastIndex, match.index) });
					}
					// Add matched term
					segments.push({ type: "term", content: match[0] });
					lastIndex = pattern.lastIndex;
				}

				// Add remaining text
				if (lastIndex < text.length) {
					segments.push({ type: "text", content: text.slice(lastIndex) });
				}

				return segments.length > 0 ? segments : [{ type: "text", content: text }];
			}

			return [{ type: "text", content: node.textContent || "" }];
		}

		// Process all text nodes in the parsed HTML
		function traverse(node: Node) {
			if (node.nodeType === Node.TEXT_NODE) {
				parts.push(...processTextNode(node));
			} else if (node.nodeType === Node.ELEMENT_NODE) {
				const element = node as Element;
				// Skip processing inside code, pre, or script tags
				if (["CODE", "PRE", "SCRIPT", "STYLE"].includes(element.tagName)) {
					parts.push({ type: "text", content: element.outerHTML });
				} else {
					node.childNodes.forEach(traverse);
				}
			}
		}

		tempDiv.childNodes.forEach(traverse);
		return parts.length > 0 ? parts : [{ type: "text", content: sanitized }];
	}

	// Simplified approach: just render the HTML and add a note about glossary terms
	// Full parsing would require client-side processing which is complex
	const sanitized = $derived(sanitizeHtml(content));
</script>

<div class={className}>
	{@html sanitized}
</div>

<!--
Note: For full glossary term highlighting, we would need to:
1. Parse the HTML on the client side
2. Identify glossary terms in text nodes
3. Wrap them with the GlossaryTerm component
This would require a more complex client-side approach or server-side preprocessing.

For now, glossary terms can be manually tagged in the content as needed.
-->
