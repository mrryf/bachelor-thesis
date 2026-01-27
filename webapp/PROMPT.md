# Webapp Test Recovery

Run full webapp verification and fix any errors.

## Verification Steps

1. **Unit Tests**
   ```bash
   npm test
   ```

2. **Type Check**
   ```bash
   npx svelte-kit sync && npx svelte-check --tsconfig ./tsconfig.json
   ```

3. **Production Build**
   ```bash
   npm run build
   ```

## Fix Priority

1. Type errors first (cause cascading failures)
2. Test failures second (logic issues)
3. Build errors last (SSR/config issues)

## Common Issues

- **Svelte 5 Runes**: Use `$state()`, `$derived()`, `$effect()`, `$props()` instead of old reactive syntax
- **Import Errors**: Check `$lib/` paths are correct
- **SSR Issues**: Ensure browser APIs are only used in `onMount()` or guarded with `browser` check
- **Type Mismatches**: Add proper types or fix incorrect type assertions

## Svelte 5 Migration Patterns

```svelte
<!-- Old syntax -->
let count = 0;
$: doubled = count * 2;

<!-- New syntax (Svelte 5) -->
let count = $state(0);
let doubled = $derived(count * 2);
```

## Completion Signal

Output exactly "DONE" when all three verification steps pass with exit code 0.
