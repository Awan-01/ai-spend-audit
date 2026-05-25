export interface AIToolSpend {
  toolName: 'ChatGPT' | 'Claude' | 'Cursor' | 'GitHub Copilot' | 'Gemini' | 'OpenAI API' | 'Anthropic API' | 'Windsurf' | string;
  plan: 'Free' | 'Individual/Pro' | 'Team/Business' | 'Enterprise' | string;
  monthlySpend: number;
  seats: number;
  primaryUseCase: string;
}

export interface Recommendation {
  toolName: string;
  currentPlan: string;
  recommendedPlan: string;
  savings: number;
  reasoning: string;
}

export interface AuditResult {
  totalSavings: number;
  yearlySavings: number;
  currentSpend: number;
  optimizedSpend: number;
  recommendations: Recommendation[];
  aiSummary?: string;
}

export interface AuditRecord {
  id: string;
  tools: AIToolSpend[];
  recommendations: Recommendation[];
  totalSavings: number;
  createdAt: string;
}

export interface LeadRecord {
  id: string;
  email: string;
  companyName: string;
  role: string;
  teamSize: number;
  auditId: string;
}
