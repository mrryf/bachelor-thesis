<script lang="ts">
	import { sanitizeHtml } from "$lib/utils";

	let { content, class: className = "" }: { content: string; class?: string } = $props();

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
