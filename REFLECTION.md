# Retrospective & Engineering Reflection

An honest review of why I made certain technical decisions, the shortcuts I took to keep the MVP simple, and what I would improve if this became a real product.

---

## 🏛️ Why We Built It This Way

### 1. Manual Form Entry over Automated Billing APIs
* **The Option**: Connecting with billing card APIs (like Stripe, Expensify, or Plaid) or team directories (like Okta/Google Workspace) to pull seat counts automatically.
* **The Tradeoff**: 
  * *Security Obstacle*: Founders are highly skeptical about giving third-party tools access to their financial transactions or enterprise directories just to check if they are wasting money.
  * *Complexity*: Building OAuth sync handlers, webhook receivers, and managing tokens would have taken weeks.
  * *Decision*: Stuck with a 60-second manual form. It is 100% private, has zero setup friction, and was incredibly easy to write.

### 2. Client-Side Math over Server-Side AI
* **The Option**: Let a smart LLM agent read the list of tools and calculate savings dynamically.
* **The Tradeoff**: 
  * *Speed & Cost*: OpenAI calls take 3-5 seconds, cost money, and can hit rate limits or fail during heavy traffic.
  * *Accuracy*: LLMs are non-deterministic. A user could submit the same stack twice and get two different saving totals, which looks highly unprofessional.
  * *Decision*: We built a standard rule-based engine running locally in TypeScript. It runs instantly (under 2ms) and is 100% consistent. We only use OpenAI for a quick, optional summary narrative at the end.

### 3. Database Resilience (The Local Storage Fallback)
* **The Option**: Make database connections mandatory, returning a crash screen if Supabase is offline.
* **The Decision**: Reviewers and developers running this code locally won't always have databases set up or internet active. We wrote the database wrapper to automatically fallback to `localStorage` on any connection error, keeping the entire application functional.

---

## ⚠️ Honest Project Limitations

Since this was built as a short assignment MVP, there are several limitations that still exist:

1. **Hardcoded Pricing Data**: The SaaS prices (ChatGPT Plus at $20, Claude Team at $30, etc.) are statically written in the client-side matrix. If these vendors raise their fees, the tool's math will become outdated until a developer updates the code manually.
2. **Heuristic-Based Logic**: The audit engine uses standard rule sets based on common small-team developer behaviors. It won't capture highly complex custom enterprise contract terms or volume discounts.
3. **Small Sample Discovery**: The user discovery transcripts and strategy outlines were drafted after talking to only two startup founder friends. They reflect real complaints, but don't represent a statistically significant market study.
4. **No Telemetry or Live Data**: There is no analytics connected to track drop-off spots or which tools are audited most, making product iteration a guessing game for now.
