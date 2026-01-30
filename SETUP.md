# Setup Instructions

After extracting this boilerplate, run these commands to complete the setup:

## 1. Initialise git repository
```bash
git init
git add -A
git commit -m "Initial commit from prompt2production-starter"
```

> **Important:** Do this first to ensure `.gitignore` is in place before installing dependencies.

## 2. Install dependencies
```bash
npm install
```

## 3. Initialise shadcn/ui
```bash
npx shadcn@latest init
```

When prompted, select:
- **Style:** Default
- **Base color:** Slate
- **CSS variables:** Yes

(Components will be installed on-demand by the agent as needed)

## 4. Install Playwright browsers
```bash
npx playwright install
```

## 5. Setup environment
```bash
cp .env.example .env
# Edit .env with your database credentials
```

## 6. Start database

**Windows users:** Ensure Docker Desktop is running before executing this command. Wait for the whale icon in the system tray to stop animating.

```bash
docker-compose -f docker-compose.infrastructure.yml up -d
```

## 7. Run migrations
```bash
npx prisma migrate dev --name init
npx prisma generate
```

## 8. Verify setup
```bash
npm run test
npm run dev
```

Open http://localhost:2812 — you should see the Prompt2Production starter page.

---

## Next Step

Setup complete! Now read **[GETTING_STARTED.md](./GETTING_STARTED.md)** to learn how to build your first feature using the Ralph Wiggum workflow.
