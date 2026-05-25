import { AIToolSpend, Recommendation, AuditResult } from '../types/audit';

export function calculateAudit(tools: AIToolSpend[]): AuditResult {
  const recommendations: Recommendation[] = [];
  let totalSavings = 0;
  const currentSpend = tools.reduce((acc, t) => acc + (t.monthlySpend || 0), 0);

  // Helper to add a recommendation
  const addRec = (rec: Recommendation) => {
    if (rec.savings > 0) {
      recommendations.push(rec);
      totalSavings += rec.savings;
    }
  };

  // Group tools for analysis
  const hasChatGPT = tools.some(t => t.toolName.toLowerCase().includes('chatgpt'));
  const hasClaude = tools.some(t => t.toolName.toLowerCase().includes('claude'));
  const hasGemini = tools.some(t => t.toolName.toLowerCase().includes('gemini'));
  
  const hasCursor = tools.some(t => t.toolName.toLowerCase().includes('cursor'));
  const hasCopilot = tools.some(t => t.toolName.toLowerCase().includes('copilot'));
  const hasWindsurf = tools.some(t => t.toolName.toLowerCase().includes('windsurf'));

  // 1. General Assistant Consolidation
  // If team is paying for multiple general-purpose assistants (e.g., ChatGPT + Claude), suggest consolidating.
  if (hasChatGPT && hasClaude) {
    const chatGPTObs = tools.find(t => t.toolName.toLowerCase().includes('chatgpt'))!;
    const claudeObs = tools.find(t => t.toolName.toLowerCase().includes('claude'))!;
    const potentialSavings = Math.min(chatGPTObs.monthlySpend, claudeObs.monthlySpend);
    
    addRec({
      toolName: `${chatGPTObs.toolName} & ${claudeObs.toolName}`,
      currentPlan: `${chatGPTObs.plan} & ${claudeObs.plan}`,
      recommendedPlan: `Consolidate to a single Assistant platform (ChatGPT or Claude)`,
      savings: potentialSavings,
      reasoning: `Your team is paying for both ChatGPT and Claude. The overlap in capabilities between GPT-4o and Claude 3.5 Sonnet is huge for daily writing, summaries, and general brainstorming. We recommend picking one to save $${potentialSavings}/month. **Operational Tradeoff:** Some team members might miss Claude's Artifacts or ChatGPT's Custom GPTs, so you might need to keep 1 or 2 individual subscriptions for power users while standardizing the rest of the team.`
    });
  } else if (hasChatGPT && hasGemini) {
    const chatGPTObs = tools.find(t => t.toolName.toLowerCase().includes('chatgpt'))!;
    const geminiObs = tools.find(t => t.toolName.toLowerCase().includes('gemini'))!;
    const potentialSavings = Math.min(chatGPTObs.monthlySpend, geminiObs.monthlySpend);
    
    addRec({
      toolName: `${chatGPTObs.toolName} & ${geminiObs.toolName}`,
      currentPlan: `${chatGPTObs.plan} & ${geminiObs.plan}`,
      recommendedPlan: `Consolidate to ChatGPT`,
      savings: potentialSavings,
      reasoning: `Your team is paying for both ChatGPT and Gemini. Unless your developers specifically need Gemini's 2-million context window for analyzing massive log files, standardizing on ChatGPT will clear up bill clutter and save $${potentialSavings}/month. **Operational Tradeoff:** You lose native Google Workspace sidebar integrations, but simplify billing and standard help docs.`
    });
  } else if (hasClaude && hasGemini) {
    const claudeObs = tools.find(t => t.toolName.toLowerCase().includes('claude'))!;
    const geminiObs = tools.find(t => t.toolName.toLowerCase().includes('gemini'))!;
    const potentialSavings = Math.min(claudeObs.monthlySpend, geminiObs.monthlySpend);
    
    addRec({
      toolName: `${claudeObs.toolName} & ${geminiObs.toolName}`,
      currentPlan: `${claudeObs.plan} & ${geminiObs.plan}`,
      recommendedPlan: `Consolidate to Claude`,
      savings: potentialSavings,
      reasoning: `Your team has active subscriptions for both Claude and Gemini. Claude 3.5 Sonnet is generally preferred for technical tasks, while Gemini serves general inquiries. Consolidating onto Claude saves $${potentialSavings}/month. **Operational Tradeoff:** Some team members will miss Gemini's integration with Google Drive files, but standardizing on Claude provides better technical output across the board.`
    });
  }

  // 2. Code Assistant Consolidation
  // If team is paying for both Cursor and Copilot or Cursor and Windsurf
  if (hasCursor && hasCopilot) {
    const copilotObs = tools.find(t => t.toolName.toLowerCase().includes('copilot'))!;
    addRec({
      toolName: 'GitHub Copilot',
      currentPlan: copilotObs.plan,
      recommendedPlan: 'Consolidate into Cursor Pro/Business',
      savings: copilotObs.monthlySpend,
      reasoning: `Your developers are paying for both Cursor and GitHub Copilot. Cursor includes its own fast autocomplete and inline edits, so keeping Copilot active inside Cursor is a complete double-spend. Disabling Copilot saves $${copilotObs.monthlySpend}/month. **Operational Tradeoff:** Developers might miss Copilot's repository-level indexing in the cloud, but Cursor's local codebase search is extremely fast, private, and fits perfectly inside modern developer workflows.`
    });
  } else if (hasWindsurf && hasCopilot) {
    const copilotObs = tools.find(t => t.toolName.toLowerCase().includes('copilot'))!;
    addRec({
      toolName: 'GitHub Copilot',
      currentPlan: copilotObs.plan,
      recommendedPlan: 'Consolidate into Windsurf',
      savings: copilotObs.monthlySpend,
      reasoning: `Your developers are split between Windsurf and Copilot. Windsurf already has built-in autocomplete that covers what Copilot does. Turning off separate Copilot licenses saves $${copilotObs.monthlySpend}/month. **Operational Tradeoff:** A few developers might have to adjust to Windsurf's specific autocomplete shortcut keys.`
    });
  } else if (hasCursor && hasWindsurf) {
    const windsurfObs = tools.find(t => t.toolName.toLowerCase().includes('windsurf'))!;
    addRec({
      toolName: 'Windsurf',
      currentPlan: windsurfObs.plan,
      recommendedPlan: 'Consolidate onto a single AI IDE (Cursor)',
      savings: windsurfObs.monthlySpend,
      reasoning: `Your developer base is split between Cursor and Windsurf. Standardizing on a single editor makes it much easier to share custom configs and setup guides, and saves $${windsurfObs.monthlySpend}/month. We recommend Cursor since it has a much larger extension library. **Operational Tradeoff:** Windsurf fans will have to get used to Cursor's agent panel, but having a unified team editor is worth it.`
    });
  }

  // 3. Rule for Small Teams (< 15 seats) on Enterprise plans
  tools.forEach(t => {
    const planName = t.plan.toLowerCase();
    const isEnterprise = planName.includes('enterprise');
    const toolLower = t.toolName.toLowerCase();

    if (isEnterprise && t.seats < 15) {
      let suggestedPlan = 'Team/Business';
      let estimatedUnitCostDiff = 0; // Cost difference per seat

      if (toolLower.includes('chatgpt')) {
        // Enterprise is ~$60/seat, Team is $30/seat
        estimatedUnitCostDiff = 30;
        suggestedPlan = 'ChatGPT Team';
      } else if (toolLower.includes('claude')) {
        // Enterprise is ~$75/seat, Team is $30/seat
        estimatedUnitCostDiff = 45;
        suggestedPlan = 'Claude Team';
      } else if (toolLower.includes('copilot')) {
        // Enterprise is $39/seat, Business is $19/seat
        estimatedUnitCostDiff = 20;
        suggestedPlan = 'Copilot Business';
      } else if (toolLower.includes('cursor')) {
        // Enterprise is ~$80/seat, Business is $40/seat
        estimatedUnitCostDiff = 40;
        suggestedPlan = 'Cursor Business';
      }

      if (estimatedUnitCostDiff > 0) {
        const potentialSavings = estimatedUnitCostDiff * t.seats;
        addRec({
          toolName: t.toolName,
          currentPlan: t.plan,
          recommendedPlan: suggestedPlan,
          savings: potentialSavings,
          reasoning: `Your team (${t.seats} seats) is too small to justify expensive custom Enterprise contracts for ${t.toolName}. Downgrading to the standard ${suggestedPlan} tier gives you the same security profile (zero data training models) and admin tools for $${potentialSavings}/month less. **Operational Tradeoff:** You lose dedicated account managers, priority server speed during peak load times, and custom SSO (though Team plans now support standard Google Workspace login anyway).`
        });
      }
    }
  });

  // 4. API Spend Optimization
  tools.forEach(t => {
    const isAPI = t.toolName.toLowerCase().includes('api');
    if (isAPI && t.monthlySpend >= 150) {
      const isAnthropic = t.toolName.toLowerCase().includes('anthropic');
      const isOpenAI = t.toolName.toLowerCase().includes('openai');
      
      let potentialSavings = 0;
      let reasoning = '';
      const recommendedPlan = 'Optimized API Routing & Caching';

      if (isAnthropic) {
        potentialSavings = Math.round(t.monthlySpend * 0.50); // up to 50% savings via caching
        reasoning = `Your Anthropic API spend ($${t.monthlySpend}/month) is pretty high. You can cut it by about half (saving $${potentialSavings}/month) by: 1) Turning on prompt caching for large system instructions or codebase files (which is up to 90% cheaper), and 2) Routing basic classification or parsing tasks to Claude 3.5 Haiku, which is way cheaper. **Operational Tradeoff:** You'll need some dev time to pin system prompts in your code to hit the cache, and setup routing logic between models.`;
      } else if (isOpenAI) {
        potentialSavings = Math.round(t.monthlySpend * 0.40); // 40% savings
        reasoning = `Your OpenAI API spend ($${t.monthlySpend}/month) can be optimized by 40% (saving $${potentialSavings}/month). We suggest: 1) Routing simple formatting or summary tasks to gpt-4o-mini (25x cheaper), 2) Adding a simple Redis caching layer to block duplicate queries, and 3) Testing open-source options like DeepSeek-R1 or DeepSeek-V3 on Together AI for massive throughput tasks. **Operational Tradeoff:** Your team will need to build and maintain the caching layer and update prompts for different LLMs.`;
      } else {
        potentialSavings = Math.round(t.monthlySpend * 0.40);
        reasoning = `Your LLM API spend ($${t.monthlySpend}/month) is high. Consolidating under a gateway like LiteLLM, deploying local caching layers to prevent duplicate calls, and routing basic text formatting jobs to smaller open-source models will reduce your bills by ~40% (saving $${potentialSavings}/month). **Operational Tradeoff:** Requires some developer time to setup the proxy gateway and audit your prompt calls.`;
      }

      addRec({
        toolName: t.toolName,
        currentPlan: 'API Usage (Pay-as-you-go)',
        recommendedPlan,
        savings: potentialSavings,
        reasoning
      });
    }
  });

  // 5. Over-provisioned Seats Rule & Small Team Downgrade (ChatGPT/Claude Team < 5 users)
  tools.forEach(t => {
    const planName = t.plan.toLowerCase();
    const isTeam = planName.includes('team') || planName.includes('business');
    const toolLower = t.toolName.toLowerCase();
    
    if (isTeam) {
      // Rule 5a: Single-seat team plan
      if (t.seats === 1) {
        let unitCostDiff = 0;
        let recommendedPlan = 'Individual/Pro';
        
        if (toolLower.includes('chatgpt')) {
          unitCostDiff = 10; // Team is $30, Pro is $20
          recommendedPlan = 'ChatGPT Plus';
        } else if (toolLower.includes('claude')) {
          unitCostDiff = 10; // Team is $30, Pro is $20
          recommendedPlan = 'Claude Pro';
        } else if (toolLower.includes('cursor')) {
          unitCostDiff = 20; // Business is $40, Pro is $20
          recommendedPlan = 'Cursor Pro';
        }

        if (unitCostDiff > 0) {
          addRec({
            toolName: t.toolName,
            currentPlan: t.plan,
            recommendedPlan,
            savings: unitCostDiff,
            reasoning: `You are paying for a Team/Business subscription of ${t.toolName} for only 1 seat. Switching to the ${recommendedPlan} tier gives you the same model access for $${unitCostDiff}/month less. **Operational Tradeoff:** You lose the team admin dashboard, but for a team of one, it's not doing anything anyway.`
          });
        }
      }
      
      // Rule 5b: Small technical team (< 5 seats) on collaborative team plans
      else if (t.seats < 5 && t.seats > 1) {
        let recommendedPlan = 'Individual/Pro';
        let unitCostDiff = 0;

        if (toolLower.includes('chatgpt')) {
          unitCostDiff = 10; // ChatGPT Team ($30) vs ChatGPT Plus ($20)
          recommendedPlan = 'ChatGPT Plus';
        } else if (toolLower.includes('claude')) {
          unitCostDiff = 10; // Claude Team ($30) vs Claude Pro ($20)
          recommendedPlan = 'Claude Pro';
        }

        if (unitCostDiff > 0) {
          const totalTeamSavings = unitCostDiff * t.seats;
          addRec({
            toolName: t.toolName,
            currentPlan: t.plan,
            recommendedPlan: `Downgrade to ${recommendedPlan} plans`,
            savings: totalTeamSavings,
            reasoning: `For small teams under 5 users, ChatGPT Team or Claude Team plans ($30/seat) usually duplicate collaboration features you already have on Slack or GitHub. Moving everyone to individual ${recommendedPlan} accounts combined with Cursor Pro ($20/seat) reduces redundant team premium margins while keeping model limits high. This saves $${totalTeamSavings}/month. **Operational Tradeoff:** You lose central admin control and billing (each dev will need to expense their own $20 subscription), and team workspace projects will be disabled.`
          });
        }
      }
    }
  });

  // 6. Developer-Specific Assistant Redundancy (Cursor + Standalone Pro Subscriptions)
  if (hasCursor) {
    const cursorObs = tools.find(t => t.toolName.toLowerCase().includes('cursor'))!;
    
    tools.forEach(t => {
      const toolLower = t.toolName.toLowerCase();
      const isAssistant = toolLower.includes('chatgpt') || toolLower.includes('claude');
      const isTechnicalUseCase = t.primaryUseCase.toLowerCase().includes('code') || 
                                 t.primaryUseCase.toLowerCase().includes('dev') || 
                                 t.primaryUseCase.toLowerCase().includes('eng') ||
                                 t.primaryUseCase.toLowerCase().includes('program');
      
      if (isAssistant && isTechnicalUseCase) {
        // Find maximum overlapping technical seats
        const overlapSeats = Math.min(cursorObs.seats, t.seats);
        // Standard Individual/Pro cost is $20, Team is $30
        const isTeam = t.plan.toLowerCase().includes('team') || t.plan.toLowerCase().includes('business');
        const unitCost = isTeam ? 30 : 20;
        const potentialSavings = overlapSeats * unitCost;

        addRec({
          toolName: `${t.toolName} (Technical Overlap)`,
          currentPlan: t.plan,
          recommendedPlan: `De-provision separate assistant accounts for developers`,
          savings: potentialSavings,
          reasoning: `Your developers are using Cursor Pro ($20/seat) which already includes fast access to Claude 3.5 Sonnet and GPT-4o. If they also have separate ChatGPT Plus or Claude Pro accounts ($20-$30/seat) for coding, you are paying twice for the exact same underlying intelligence. De-provisioning these redundant assistant licenses for your ${overlapSeats} developers saves $${potentialSavings}/month. **Operational Tradeoff:** Developers lose standalone web history logs and mobile app sync, so you might need to keep 1 or 2 accounts active for non-coding workflows.`
        });
      }
    });
  }

  const optimizedSpend = Math.max(0, currentSpend - totalSavings);
  const yearlySavings = totalSavings * 12;

  return {
    totalSavings,
    yearlySavings,
    currentSpend,
    optimizedSpend,
    recommendations
  };
}
