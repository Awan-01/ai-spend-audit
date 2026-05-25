# Prompt Design: Executive Summaries

This document logs the prompts and parameters we used to generate executive cost summaries in the `/api/summary` endpoint.

---

## ⚙️ API Configuration

* **Endpoint**: `/api/summary`
* **Model**: `gpt-4o-mini` (Fast, cheap, and very good at following length limits)
* **Temperature**: `0.7` (Keeps the summary direct and natural)
* **Max Tokens**: `200` (Forces a strict limit so the summary is a short, readable 100-word paragraph)

---

## 📝 The Prompts We Used

### 1. System Role
```text
You are an elite, concise SaaS optimization advisor. Analyze AI tools spend audits and write highly personalized, direct, and actionable executive summaries (approx. 100 words). Do not use generic intros. Speak directly to the business owner or engineering leader.
```

### 2. User Instructions
We format the user inputs and calculated savings into this prompt template:

```text
Analyze the following AI software spend data and recommendations.
Write a highly professional, action-oriented executive summary of approximately 100 words.
Focus on:
1. Identifying the primary source of waste/inefficiency in their AI stack.
2. The concrete financial impact (Total savings: $<savings>/month, which is $<savings * 12>/year).
3. The recommended strategic path forward to maintain productivity while cutting costs.

CURRENT AI TOOL SUITE:
<toolsDescription>

RECOMMENDATIONS:
<recsDescription>

TOTAL MONTHLY SAVINGS IDENTIFIED: $<totalSavings>
```

---

## 🧠 Why We Designed It This Way

* **Consistent Math**: We pass the pre-calculated financial metrics directly as variables. This ensures the LLM doesn't hallucinate incorrect math or calculate mismatched totals.
* **No Introduction Boilerplate**: We blocked the model from writing standard corporate intro lines (e.g. *"Based on your audit, I found..."*) to keep the output focused and readable on the Results dashboard.

---

## 💾 The Local Template Fallback

If the OpenAI API key is missing or the request times out, `/api/summary` programmatically shifts to `generateFallbackSummary()`. This ensures the app is highly reliable:

```typescript
function generateFallbackSummary(
  tools: AIToolSpend[],
  totalSavings: number,
  recommendations: Recommendation[]
): string {
  const toolNames = tools.map(t => t.toolName).join(', ');
  
  if (totalSavings === 0) {
    return `Your AI tool suite (${tools.length} tool${tools.length === 1 ? '' : 's'}: ${toolNames}) is exceptionally well-optimized. You are currently utilizing precise seat-to-plan ratios with zero capability overlaps or enterprise plan inflation. Standardizing on your current stack is the right move for maintaining peak developer efficiency.`;
  }

  const biggestRec = recommendations.reduce((max, r) => r.savings > max.savings ? r : max, recommendations[0]);
  const yearlySavings = totalSavings * 12;

  let highlight = '';
  if (biggestRec) {
    highlight = `Consolidating or optimizing ${biggestRec.toolName} represents your single greatest lever, yielding $${biggestRec.savings}/month in immediate returns.`;
  }

  return `Our analysis of your AI stack (${toolNames}) reveals a clear optimization pathway. By eliminating redundant assistant and editor licenses, you can capture $${totalSavings}/month ($${yearlySavings}/year) in waste without degrading developer productivity. ${highlight} We recommend standardizing your developer environments on Cursor and migrating general tools to Team tiers to secure organizational data privacy.`;
}
```
