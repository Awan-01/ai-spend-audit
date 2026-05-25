# Operational Benchmarks & KPIs

This document outlines the main operational metrics we monitor to verify if the tool is providing value and converting visitors. Because this is a lightweight MVP, these figures represent target benchmarks rather than absolute live metrics.

---

## 📊 Loose Funnel Benchmarks

We measure user behavior across these key milestones:

### 1. Form Commencement Ratio
* **Definition**: `(Audits Started / Unique Landings) * 100`
* **Target Assumption**: **~40% - 50%**
* **Why it matters**: Tells us if our homepage headline is clear and trustworthy. If this drops below 30%, it means users might be getting confused or scared that we require bank logins.

### 2. Form Completion Rate
* **Definition**: `(Audits Completed / Audits Started) * 100`
* **Target Assumption**: **~75% - 85%**
* **Why it matters**: Monitors if the entry form is too annoying or tedious. Since we pre-fill monthly cost estimates and keep fields simple, completion should remain high.

### 3. Playbook Conversion Rate
* **Definition**: `(Lead Form Submissions / Audits Completed) * 100`
* **Target Assumption**: **~20% - 30%**
* **Why it matters**: Measures if the PDF playbook and templates are actually appealing to users.

### 4. Average Savings Found per Stack
* **Definition**: `Sum(savings across all audits) / Count(audits)`
* **Grounded Benchmark**: **~$300 - $500 / month**
* **Why it matters**: Proves that our rules engine in `lib/auditEngine.ts` is actually finding real-world overlaps.

---

## 🔄 Simple Share Loops

The app is built to grow organically using co-founder sharing. We outline this dynamic using a simple viral coefficient guess ($K$):

$$K = \text{Share Rate} \times \text{Conversion Rate of Shared Link}$$

### Benchmark Values
* **Share Rate**: **~30%** (About 3 out of 10 users copy and share their private results page).
* **Click-Through Rate (CTR)**: **~50%** (Half of the team members landing on a shared `/share/[id]` URL click the bottom button to run an audit for their own projects).
* **Viral Coefficient Guess ($K$)**: `0.30 * 0.50 = 0.15`
  * *Meaning*: For every 100 completed audits, we expect about 15 new audits to be triggered organically through simple co-founder share loops.
