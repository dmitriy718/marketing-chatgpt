# Carolina Growth Web

Next.js App Router frontend for the public marketing website.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3001`.

## Docker
```bash
docker compose up --build web
```
Ports follow `.env` since Docker uses host networking here.

## Notes
- Theming is CSS-variable based with a light default and user toggle.
- Content lives in `src/content` and page routes in `src/app`.
- Content editing is provided by Decap CMS at `/admin`.
  Run `npx decap-server` for local Git-backed edits.
  Configure `apps/web/public/admin/config.yml` for your production backend.
