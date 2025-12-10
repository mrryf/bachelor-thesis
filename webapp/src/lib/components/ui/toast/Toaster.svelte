<script lang="ts">
	import { toast } from "$lib/stores/toast.svelte";
	import { fly, fade } from "svelte/transition";
	import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-svelte";
	import { Button } from "$lib/components/ui/button";

	const icons = {
		success: CheckCircle2,
		error: XCircle,
		info: Info,
		warning: AlertTriangle,
	};

	const styles = {
		success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100",
		error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100",
		info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100",
		warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100",
	};

	const iconStyles = {
		success: "text-green-500 dark:text-green-400",
		error: "text-red-500 dark:text-red-400",
		info: "text-blue-500 dark:text-blue-400",
		warning: "text-yellow-500 dark:text-yellow-400",
	};
</script>

<div class="fixed bottom-0 right-0 z-50 p-4 space-y-2 pointer-events-none max-w-md">
	{#each toast.toasts as toastItem (toastItem.id)}
		{@const ToastIcon = icons[toastItem.type]}
		<div
			transition:fly={{ y: 50, duration: 200 }}
			class="pointer-events-auto border rounded-lg shadow-lg p-4 flex items-start gap-3 {styles[toastItem.type]}"
		>
			<ToastIcon
				class="h-5 w-5 flex-shrink-0 {iconStyles[toastItem.type]}"
			/>
			<p class="flex-1 text-sm font-medium">{toastItem.message}</p>
			<Button
				variant="ghost"
				size="icon"
				class="h-6 w-6 flex-shrink-0 opacity-70 hover:opacity-100"
				onclick={() => toast.remove(toastItem.id)}
			>
				<X class="h-4 w-4" />
			</Button>
		</div>
	{/each}
</div>
