# Developer Log: AI Spend Audit

A quick diary of how I built this project, the issues I ran into, and the lazy (but practical) hacks I used to keep the MVP working.

---

## 📅 The Daily Build Log

### Day 1: Laying the Groundwork & The Offline Hack
* **Goal**: Get the Next.js App Router running, set up a database schema, and write a database controller.
* **Progress**:
  * Set up the base folders (`app`, `components`, `lib`, `types`).
  * Defined simple TypeScript types in `types/audit.ts` to make auto-completion easier.
  * Wrote `lib/db.ts` to connect to Supabase.
* **The "No-Keys" Rescue Hack**:
  * *Hiccup*: I knew that anyone running this locally might not have their Supabase keys set up right away or might want to run it completely offline.
  * *Fix*: I wrote `lib/db.ts` to catch credential errors. If the keys are missing, the code silently redirects all reads and writes to `localStorage`. It prints a small warning in the developer console, but the app keeps running perfectly.

---

### Day 2: Dynamic Form & Rule Engine
* **Goal**: Create the entry form and write the cost-saving logic.
* **Progress**:
  * Built a dynamic, multi-row React form at `/audit`.
  * Wrote the main savings calculator in `lib/auditEngine.ts`.
  * Wrote native tests in `lib/auditEngine.test.ts` to make sure my logic was correct.
* **The "Plaid Headaches" Decision**:
  * *Thought*: Should I build a sync tool using Plaid or credit card uploads?
  * *Decision*: Absolutely not. I talked to a couple of founder friends and they said they'd never link their credit card logs or company admin accounts to an unverified audit tool. Manual input takes less than a minute, maintains 100% trust, and was much faster to write.

---

### Day 3: Summary API & Next.js 15 Quirks
* **Goal**: Build executive summaries and clean up build warnings.
* **Progress**:
  * Set up `/api/summary` to call OpenAI's `gpt-4o-mini` for a simple narrative block.
  * *Next.js Viewport Warning*: Next.js 15 threw a build warning because I had `viewport` declared inside the global `Metadata` object. I had to export it separately as `export const viewport: Viewport = { ... }` in the layout files to keep the compiler happy.
  * *Linter temporal dead zone*: Running `npm run lint` failed because `useEffect` in `/results/page.tsx` was calling `fetchAISummary` before it was declared in the file. Hoisted the helper functions above the mounting hook to fix this.
  * Got rid of standard `any` type flags in my form change handlers.

---

### Day 4: Engine Refining & CI/CD Pipeline
* **Goal**: Make recommendations operationally realistic and write a GitHub Actions workflow.
* **Progress**:
  * Upgraded `lib/auditEngine.ts` to detail specific real-world tradeoffs (like developers double-paying for Claude Pro when they already use Cursor Pro).
  * Added tests to cover these new edge cases.
  * Created a simple `.github/workflows/ci.yml` file to run tests and lints automatically on pull requests.
