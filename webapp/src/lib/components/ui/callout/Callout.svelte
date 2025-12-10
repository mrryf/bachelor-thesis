<script lang="ts">
	import { Info, AlertTriangle, AlertCircle, CheckCircle2, Lightbulb } from "lucide-svelte";
	import type { Snippet } from "svelte";
	import { cn } from "$lib/utils";

	let {
		type = "info",
		title,
		children,
		class: className,
		icon: customIcon,
	}: {
		type?: "info" | "warning" | "error" | "success" | "tip";
		title?: string;
		children?: Snippet;
		class?: string;
		icon?: typeof Info;
	} = $props();

	const icons = {
		info: Info,
		warning: AlertTriangle,
		error: AlertCircle,
		success: CheckCircle2,
		tip: Lightbulb,
	};

	const styles = {
		info: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
		warning: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800",
		error: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
		success: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
		tip: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800",
	};

	const iconStyles = {
		info: "text-blue-500 dark:text-blue-400",
		warning: "text-yellow-500 dark:text-yellow-400",
		error: "text-red-500 dark:text-red-400",
		success: "text-green-500 dark:text-green-400",
		tip: "text-purple-500 dark:text-purple-400",
	};

	const titleStyles = {
		info: "text-blue-900 dark:text-blue-100",
		warning: "text-yellow-900 dark:text-yellow-100",
		error: "text-red-900 dark:text-red-100",
		success: "text-green-900 dark:text-green-100",
		tip: "text-purple-900 dark:text-purple-100",
	};

	const Icon = $derived(customIcon || icons[type]);
</script>

<div
	class={cn(
		"border-l-4 rounded-r-lg p-4 my-4",
		styles[type],
		className
	)}
	role="note"
>
	<div class="flex gap-3">
		<Icon
			class="h-5 w-5 flex-shrink-0 mt-0.5 {iconStyles[type]}"
		/>
		<div class="flex-1 min-w-0">
			{#if title}
				<h4 class="font-semibold mb-1 {titleStyles[type]}">{title}</h4>
			{/if}
			<div class="text-sm text-foreground/90 [&>p]:mb-2 [&>p:last-child]:mb-0">
				{@render children?.()}
			</div>
		</div>
	</div>
</div>
