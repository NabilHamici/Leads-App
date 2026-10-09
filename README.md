# Live Leads

A small proof of concept: someone submits a **Meta Lead Ads** form, and the lead shows up
**live** on a React Native screen — no refresh, no pull-to-refresh, no touching the phone.

```
Meta Lead Ad  ──HTTPS webhook──▶  Express API  ──socket.io──▶  React Native screen
 (testing tool)                    (Node, on a VPS)             (already open)
```

Two connections do all the work. Meta **pushes** the lead into the server, and the server
**pushes** it out to every open app over a WebSocket. That second hop is what makes the card
appear on its own.

---

## Stack

| | |
|---|---|
| Backend | Node + **Express 5** + **socket.io 4**, plain JavaScript |
| Frontend | **React Native 0.87** + TypeScript, community CLI (no Expo) |
| Transport | WebSocket via socket.io, with heartbeat + auto-reconnect |
| Storage | in-memory `Map` (see assumptions) |
| Meta | Lead Ads Testing Tool, Marketing API `v22.0` |

---

## Repo layout

```
Backend/
  src/
    config.js            reads .env, fails fast, freezes config
    app.js               express app: /health, routers, 404, error handler
    server.js            entry point — creates the HTTP server, attaches socket.io
    routes/
      webhook.js         Meta handshake (GET) + lead receiver (POST)
      leads.js           GET /api/leads · DELETE /api/leads/:id · DELETE /api/leads
      privacy.js         serves /privacy-policy (required by Meta)
    services/
      meta.js            fetches the real fields from the Graph API
      leads.js           in-memory store + event bus
    realtime/
      socket.js          subscribes to the bus, broadcasts to the app
Frontend/
  src/
    config.ts            builds the URLs from .env
    api/leadsApi.ts      HTTP client (getLeads, deleteLead, clearLeads)
    hooks/useLeadsSocket.ts   the whole realtime state machine
    components/LeadCard.tsx   one card
    screens/LeadsScreen.tsx   the screen
```

---

## Run the backend

```bash
cd Backend
npm install
cp .env.example .env      # then fill it in (see below)
npm run dev               # nodemon, or: npm start
```

Server answers on `http://localhost:4000/health`.

### `.env`

| Variable | Required | What it is |
|---|---|---|
| `VERIFY_TOKEN` | ✅ | Any string **you choose**. Must match the token you type into the Meta dashboard when it verifies your webhook. |
| `PAGE_ACCESS_TOKEN` | for real leads | Permanent **Page** access token, scoped to your test Page. Without it the app still runs — leads arrive flagged `incomplete`. |
| `APP_SECRET` | optional | Your Meta app secret. |
| `GRAPH_API_VERSION` | optional | Defaults to `v22.0`. |
| `PORT` | optional | Defaults to `4000`. |
| `NODE_ENV` | optional | `production` hides error details in responses. |

If a required variable is missing, the server **crashes at boot** with a clear message —
better than a mysterious `403` from Meta two hours later.

> `.env` is git-ignored. Only `.env.example` is committed. Never commit a real token.

---

## Run the app

```bash
cd Frontend
npm install
bundle install && bundle exec pod install     # first time only
```

Create `Frontend/.env`:

```
API_BASE_URL=http://localhost:4000
```

For a real device or the deployed backend, point it at the live URL instead:

```
API_BASE_URL=https://your-domain.com
```

Then:

```bash
npx react-native start        # terminal 1
npx react-native run-ios      # terminal 2
```

After editing anything in `src/`, press **R** in the simulator to reload.

---

## Using it

1. Open the app — the list loads over REST and the header badge turns **Live** once the socket
   connects.
2. Go to Meta's **Lead Ads Testing Tool**, pick your Page and form, and submit a test lead
   (use *Preview Form* to type real values instead of Meta's placeholders).
3. Within about a second the card appears at the top of the list — name, email, phone and a
   green **Live** badge. Nobody touched the phone.
4. Each card has an **×** to delete just that lead, and the header has **Clear** to empty the
   list. Both hit the real API and sync to every connected screen.

### Two Meta things worth knowing

- The webhook payload is **almost empty** — it only carries a `leadgen_id`. The real fields
  have to be fetched from the Graph API, which is what `services/meta.js` does.
- Meta **redelivers** webhooks if the response is slow. So we reply `200` first and process in
  the background, and dedupe by `leadgen_id` in two places.

---

## API

| Method | Path | Notes |
|---|---|---|
| `GET` | `/health` | uptime + env |
| `GET` | `/privacy-policy` | HTML, required by Meta |
| `GET` | `/webhook` | Meta's handshake — echoes the challenge |
| `POST` | `/webhook` | receives the lead, answers `200` immediately |
| `GET` | `/api/leads` | list, newest first |
| `DELETE` | `/api/leads/:id` | `404` if the id doesn't exist |
| `DELETE` | `/api/leads` | clear everything |

### Socket events (server → app)

| Event | Payload | Effect |
|---|---|---|
| `lead:new` | the lead object | renders a new card |
| `lead:deleted` | `{ id }` | removes that card |
| `lead:cleared` | `{ removed }` | empties the list |

---

## Design notes

- **socket.io over polling/SSE/raw ws** — auto-reconnect and a heartbeat (ping 25s, timeout 20s)
  out of the box. A demo can't afford a dead-looking screen or a dropped connection.
- **Public HTTPS is not optional** — Meta only delivers webhooks to a publicly reachable HTTPS
  URL. It won't touch `localhost` or plain HTTP, which is why the backend runs behind nginx and
  a real certificate.
- **The data layer never imports socket.io.** `services/leads.js` stores leads and fires a name
  on an `EventEmitter`; `realtime/socket.js` decides what that name means. Adding delete and
  clear changed nothing in the data layer's dependencies.
- **Degrade, don't drop.** If the Graph API call fails, the lead is still stored as a placeholder
  flagged `incomplete: true` and shows an amber banner in the app — visible, not lost.

---

## Assumptions

- Leads are kept **in memory** — restarting the server clears the list. Fine for a PoC, swap
  `services/leads.js` for a database and nothing else changes.
- Tested only with Meta's **Lead Ads Testing Tool** on a test Page and form — no real ads.
- The access token is a permanent Page token scoped to the test Page.
- A privacy-policy page is served from the backend because Meta requires a public URL.

---

## Endpoints at a glance

`/health` · `/privacy-policy` · `/webhook` · `GET /api/leads` · `DELETE /api/leads/:id` ·
`DELETE /api/leads`
