<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Deployment

**Standard flow — Cloudflare Pages auto-deploys from GitHub:**

1. `npm run build` (build locally — generates OG images, sitemap, and static export)
2. `git push origin main` (push to GitHub)
3. Cloudflare Pages auto-deploys from the `main` branch

**macOS 12.6 workaround (local testing only, not for production):**

Local `npm run deploy` fails — workerd binary crashes on macOS 12.6.  
If you need to test locally, follow the old opennextjs-cloudflare flow (see git history).  
Otherwise, just push — Cloudflare Pages handles the rest.
