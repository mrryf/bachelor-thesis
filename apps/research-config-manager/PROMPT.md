# Electron Build Recovery

Fix all errors in the Research Config Manager Electron app until typecheck, tests, and build all pass.

## Verification Steps (run in order)

1. **TypeScript Type Check**
   ```bash
   npm run typecheck
   ```

2. **Unit Tests**
   ```bash
   npm test
   ```

3. **Production Build**
   ```bash
   npm run build
   ```

## Fix Priority Order

1. Type errors first (cascade across node/web contexts)
2. Test failures second (logic issues)
3. Build errors last (config/path issues)

## Common Issues

- **IPC Channel Mismatches**: Channel names in `src/shared/channels.ts` must match main/preload/renderer
- **Preload Path Errors**: Check path in main/index.ts matches build output
- **Svelte 5 Runes**: Use `$state()`, `$derived()`, `$effect()`, `$props()`
- **Context Isolation**: Preload scripts run in isolated context - use contextBridge
- **Node Integration**: Main process has Node.js APIs, renderer does not

## Debugging Tips

- Check `out/` directory structure matches path references
- Verify IPC channel names are consistent across all three contexts
- Look for TypeScript strict mode issues (null checks, undefined)

## Completion Signal

Output exactly "DONE" when all three verification steps pass with exit code 0.
