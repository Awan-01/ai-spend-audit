import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AIToolSpend, Recommendation } from '../../../types/audit';

// Initialize OpenAI client only if API key is provided
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Dynamic rule-based fallback summary generator
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tools, totalSavings, recommendations } = body as {
      tools: AIToolSpend[];
      totalSavings: number;
      recommendations: Recommendation[];
    };

    if (!tools || !Array.isArray(tools)) {
      return NextResponse.json({ error: 'Invalid tools array' }, { status: 400 });
    }

    // If OpenAI is not configured, return fallback immediately
    if (!openai) {
      console.info('OpenAI API Key missing, serving dynamic rule-based summary fallback.');
      const fallback = generateFallbackSummary(tools, totalSavings, recommendations);
      return NextResponse.json({ summary: fallback, isFallback: true });
    }

    const toolsDescription = tools.map(t => 
      `- ${t.toolName}: ${t.plan} plan, ${t.seats} seats, $${t.monthlySpend}/month (Use case: ${t.primaryUseCase})`
    ).join('\n');

    const recsDescription = recommendations.map(r => 
      `- Recommendation for ${r.toolName}: Switch to ${r.recommendedPlan} to save $${r.savings}/month. Reason: ${r.reasoning}`
    ).join('\n');

    const prompt = `
Analyze the following AI software spend data and recommendations.
Write a highly professional, action-oriented executive summary of approximately 100 words.
Focus on:
1. Identifying the primary source of waste/inefficiency in their AI stack.
2. The concrete financial impact (Total savings: $${totalSavings}/month, which is $${totalSavings * 12}/year).
3. The recommended strategic path forward to maintain productivity while cutting costs.

CURRENT AI TOOL SUITE:
${toolsDescription}

RECOMMENDATIONS:
${recsDescription}

TOTAL MONTHLY SAVINGS IDENTIFIED: $${totalSavings}
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an elite, concise SaaS optimization advisor. Analyze AI tools spend audits and write highly personalized, direct, and actionable executive summaries (approx. 100 words). Do not use generic intros. Speak directly to the business owner or engineering leader.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const summaryText = response.choices[0]?.message?.content?.trim() || '';
    
    if (!summaryText) {
      throw new Error('Empty completion from OpenAI');
    }

    return NextResponse.json({ summary: summaryText, isFallback: false });

  } catch (err) {
    console.error('AI summary API error:', err);
    // Dynamic rule-based fallback if any API error occurs
    try {
      const body = await req.clone().json();
      const { tools, totalSavings, recommendations } = body;
      const fallback = generateFallbackSummary(tools || [], totalSavings || 0, recommendations || []);
      const errorMessage = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ summary: fallback, isFallback: true, error: errorMessage });
    } catch {
      return NextResponse.json({ 
        summary: 'Your AI spend audit is ready. Review the detailed tool consolidation and plan downgrades below to save on your monthly AI SaaS overhead.',
        isFallback: true
      });
    }
  }
}
