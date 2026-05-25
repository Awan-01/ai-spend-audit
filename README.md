# AI Spend Audit (Engineering Assignment MVP)

This project is a lightweight proof-of-concept built as a startup engineering assignment. Its goal is to help small teams quickly estimate their AI tool spend and find obvious plan downgrades or licensing overlaps (like paying for both Cursor and Copilot at the same time).

Rather than connecting invasive finance APIs or bank logins, we built this to rely on quick, anonymous manual inputs. It calculates savings instantly on the client, saves the profile to a database (with a local storage fallback if the database is offline), and uses a simple OpenAI call for a brief summary.

---

## 🛠️ The Stack

We wanted to keep the setup as simple as possible:
* **Framework**: Next.js 15.2 (App Router)
* **Styling**: Tailwind CSS v4 (vanilla dark theme, glassmorphic cards)
* **Database**: Supabase (JS Client SDK)
* **AI Summary**: OpenAI API (using `gpt-4o-mini`, with a local template fallback)
* **Testing**: Node's native test runner (no heavy Jest setup required)

---


## Live Demo

https://ai-spend-audit-opal.vercel.app/

## Screenshots

### Homepage

![Homepage](public/screenshots/home.png)

### Audit Form

![Audit Form](public/screenshots/form.png)

### Results Page

![Results](public/screenshots/results.png)

## 🚀 Local Setup

### 1. Environment Variables
Create a `.env.local` file in the root directory:
```env
# Supabase (Optional - if missing, it auto-falls back to LocalStorage)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-string

# OpenAI API Key (Optional - if missing, a local template generates a fallback summary)
OPENAI_API_KEY=sk-proj-your-key
```

### 2. Install & Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) to see the app.

### 3. Running Tests
We used Node's built-in runner to keep things fast:
```bash
node --import tsx --test lib/auditEngine.test.ts
```

---

## 🧠 Simple Design Decisions & Tradeoffs

* **Manual Input over Automated Sync**: We purposely skipped Okta, Plaid, or billing integrations. Founders are skeptical about linking their credit cards or company directories to a random audit tool. Manual input takes 60 seconds, doesn't need security permissions, and completely eliminates setup friction.
* **Stateless URLs**: Audit sharing is handled by simple unique IDs `/share/[id]`. This made building the share feature much easier and avoids managing session states or user logins.
* **Client-Side Calculations**: The mathematical engine runs entirely in TypeScript on the user's browser. It's incredibly fast (under 5ms) and guarantees we aren't wasting server cycles or throwing math exceptions.

---

## ⚠️ Honest Limitations

Since this is an MVP built for an assignment, it has several limitations:
1. **Outdated Pricing Risk**: SaaS pricing plans change constantly. The current matrix (ChatGPT Pro at $20, Claude Team at $30, etc.) is hardcoded into `app/audit/page.tsx` and the helper logic. If these platforms raise prices, the code must be updated manually.
2. **Heuristic-Based Logic**: The audit engine uses standard rule sets based on common small-team developer behaviors. It won't capture highly complex custom enterprise contract terms or volume discounts.
3. **Small Interview Sample**: The discovery interviews and GTM outlines were drafted after talking to only two startup founder friends. They reflect real complaints, but don't represent a statistically significant market study.
4. **No Real Telemetry**: There is no live tracking or telemetry connected to monitor real-world page views, drop-offs, or tool selections.
