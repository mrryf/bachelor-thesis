<script lang="ts">
    import { Clock } from "lucide-svelte";

    export let minutes: number;
</script>

<div class="flex items-center gap-2 text-sm text-muted-foreground">
    <Clock class="h-4 w-4" />
    <span>{minutes} min read</span>
</div>
