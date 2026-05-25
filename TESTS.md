# Testing & QA Protocol: AI Spend Audit

This document explains our testing structure and provides step-by-step manual checks to verify that the app behaves correctly during local reviews.

---

## 🧪 Automated Unit Tests

We use Node's native, lightweight test runner paired with `tsx` to compile TypeScript on the fly. This keeps dependencies minimal and executes our tests in under 1 second.

### How to Run Tests
In your terminal, execute the following command:
```bash
node --import tsx --test lib/auditEngine.test.ts
```

### What our Tests Check (8 Test Cases)

1. **`Audit Engine - Empty State`**: Verifies that passing an empty list of tools doesn't crash the calculator and returns zero savings.
2. **`Audit Engine - General Assistant Consolidation`**: Verifies that active Pro plans for both ChatGPT and Claude suggest picking one to save $20/month.
3. **`Audit Engine - Code Assistant Consolidation`**: Verifies that using both Cursor Pro and GitHub Copilot flags Copilot as redundant, saving $10/month.
4. **`Audit Engine - Enterprise Downgrade for Small Teams`**: Asserts that teams under 15 seats on custom Enterprise contracts are recommended standard Team plans to cut margins in half.
5. **`Audit Engine - API Spend Optimization`**: Checks that high API bills suggest prompt caching and selective model routing to save 40% (OpenAI) or 50% (Anthropic).
6. **`Audit Engine - Single-Seat Team Plan Downgrade`**: Verifies that paying for a Team tier with only 1 user suggests downgrading to an Individual plan.
7. **`Audit Engine - Small Technical Team Downgrade`**: Verifies that teams under 5 users on Team tiers suggest individual Plus accounts to bypass team margins.
8. **`Audit Engine - Developer-Specific Assistant Redundancy`**: Asserts that developers using Cursor Pro alongside separate ChatGPT/Claude Plus accounts for coding triggers seat de-provisioning, saving $20/seat.

---

## 🛠️ Manual QA Steps

To verify the app via the browser UI, follow these steps:

### 1. Landing Page
* Load `http://localhost:3000`.
* Check that background decorations load correctly and look clean.
* Verify that stats (savings, time) look grounded and don't make fake traction claims.
* Click the "Start Free Audit" button to verify routing.

### 2. Audit Entry Form
* Click "Add Another AI Tool" and check that a new dynamic row appears with a confirmation toast. Click the trash icon to confirm deletion.
* Select `ChatGPT` and set the subscription to `Team/Business`. Change the seat count to 3 and check that the "Monthly Spend" auto-calculates to $90 ($30/seat).
* Select `OpenAI API`. Verify that the "Seats" input box is disabled and locked to 1 since APIs are billed by usage.
* Click "Analyze Stack & Show Savings" and check that you are redirected to `/results?id=<uuid>`.

### 3. Results Dashboard
* Confirm that the comparison bar matches the calculations.
* Stop your internet or clear the `OPENAI_API_KEY` env variable, then refresh the dashboard. Verify that the Executive Summary renders a solid, templated local fallback text instead of failing or displaying a blank screen.
* Enter a mock email and company name, then click submit. Verify that the success block renders.
* *Honeypot Check*: Use DevTools to find the hidden `middle_name_verify` input and enter a value, then submit. Verify that the form silently intercepts the submission, blocks database operations, and displays success to confuse bots.
* Click "Get Public Share Link" and confirm the share URL is copied. Load the URL and verify that it hides all contact forms and company names, displaying only anonymized results.
