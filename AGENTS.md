<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Deployment (macOS 12.6 workaround)

Local `npm run deploy` fails — workerd binary (`@cloudflare/workerd-darwin-64`) crashes with `__ZNSt3__122__libcpp_verbose_abort` on macOS 12.6.

**Fix:** Set env vars and bypass the `getPlatformProxy` call:

1. `npm run build` (standard Next.js build)
2. `npx opennextjs-cloudflare build` (generates `.open-next/worker.js`)
3. Deploy with:
```bash
CLOUDFLARE_API_TOKEN=$(cat ~/Library/Preferences/.wrangler/config/default.toml | head -1 | cut -d'"' -f2) \
CLOUDFLARE_ACCOUNT_ID=2bc3ee9be606fbb4d3a414f915db53e0 \
npx opennextjs-cloudflare deploy
```

The account ID and token path above are specific to this machine. The `getPlatformProxy` call in `helpers.js` and the JSON parse in `ensure-r2-bucket.js` have patches applied in `node_modules` to make this work. If `node_modules` is cleaned, re-apply patches or use CI to deploy instead.
