'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input, Select, showCustomToast } from '../../components/ui';
import { AIToolSpend } from '../../types/audit';
import { saveAuditToDb } from '../../lib/db';
import { calculateAudit } from '../../lib/auditEngine';

// Supported AI Tools
const SUPPORTED_TOOLS = [
  { value: 'ChatGPT', label: 'ChatGPT' },
  { value: 'Claude', label: 'Claude' },
  { value: 'Cursor', label: 'Cursor' },
  { value: 'GitHub Copilot', label: 'GitHub Copilot' },
  { value: 'Gemini', label: 'Gemini' },
  { value: 'OpenAI API', label: 'OpenAI API' },
  { value: 'Anthropic API', label: 'Anthropic API' },
  { value: 'Windsurf', label: 'Windsurf' },
  { value: 'Other', label: 'Other' }
];

// Plan Options
const PLAN_OPTIONS = [
  { value: 'Free', label: 'Free Tier' },
  { value: 'Individual/Pro', label: 'Individual / Pro ($10-$20/mo)' },
  { value: 'Team/Business', label: 'Team / Business ($19-$40/mo)' },
  { value: 'Enterprise', label: 'Enterprise / Custom Contract' }
];

// Prefill pricing matrix
const pricingMatrix: Record<string, Record<string, number>> = {
  ChatGPT: { Free: 0, 'Individual/Pro': 20, 'Team/Business': 30, Enterprise: 60 },
  Claude: { Free: 0, 'Individual/Pro': 20, 'Team/Business': 30, Enterprise: 75 },
  Cursor: { Free: 0, 'Individual/Pro': 20, 'Team/Business': 40, Enterprise: 80 },
  'GitHub Copilot': { Free: 0, 'Individual/Pro': 10, 'Team/Business': 19, Enterprise: 39 },
  Gemini: { Free: 0, 'Individual/Pro': 20, 'Team/Business': 30, Enterprise: 45 },
  Windsurf: { Free: 0, 'Individual/Pro': 15, 'Team/Business': 30, Enterprise: 60 },
};

const DEFAULT_TOOL: AIToolSpend = {
  toolName: 'ChatGPT',
  plan: 'Individual/Pro',
  monthlySpend: 20,
  seats: 1,
  primaryUseCase: 'General Development / Writing'
};

export default function AuditFormPage() {
  const router = useRouter();
  const [tools, setTools] = useState<AIToolSpend[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize: Load from localStorage or pre-fill with one default tool
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDraft = localStorage.getItem('ai_spend_audit_draft');
      if (savedDraft) {
        try {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setTools(JSON.parse(savedDraft));
          return;
        } catch {
          // ignore error
        }
      }
      setTools([{ ...DEFAULT_TOOL }]);
    }
  }, []);

  // Save changes to localStorage on edit
  const saveDraft = (newTools: AIToolSpend[]) => {
    setTools(newTools);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai_spend_audit_draft', JSON.stringify(newTools));
    }
  };

  // Add a new empty tool row
  const addToolRow = () => {
    const nextTool: AIToolSpend = {
      toolName: 'ChatGPT',
      plan: 'Individual/Pro',
      monthlySpend: 20,
      seats: 1,
      primaryUseCase: ''
    };
    saveDraft([...tools, nextTool]);
    showCustomToast('Added new tool row');
  };

  // Remove a tool row
  const removeToolRow = (index: number) => {
    const newTools = tools.filter((_, i) => i !== index);
    saveDraft(newTools.length === 0 ? [{ ...DEFAULT_TOOL }] : newTools);
    showCustomToast('Removed tool row');
  };

  // Handle value change for an entry
  const handleValueChange = (index: number, field: keyof AIToolSpend, value: string | number) => {
    const updatedTools = [...tools];
    const item = { ...updatedTools[index] };

    if (field === 'monthlySpend') {
      item.monthlySpend = Math.max(0, Number(value));
    } else if (field === 'seats') {
      item.seats = Math.max(1, parseInt(value as string) || 1);
    } else {
      (item as Record<string, string | number>)[field] = value;
    }

    // Auto-pricing updates if toolName or plan changes
    if (field === 'toolName' || field === 'plan') {
      const toolName = (field === 'toolName' ? value : item.toolName) as string;
      const plan = (field === 'plan' ? value : item.plan) as string;

      // APIs are usage-based and don't strictly have seat counts
      if (toolName.toLowerCase().includes('api')) {
        item.seats = 1;
        if (field === 'toolName') item.monthlySpend = 150; // default api guess
      } else {
        const costPerSeat = pricingMatrix[toolName]?.[plan];
        if (costPerSeat !== undefined) {
          item.monthlySpend = costPerSeat * item.seats;
        }
      }
    }

    // Auto-recalculate if seat count changes
    if (field === 'seats' && !item.toolName.toLowerCase().includes('api')) {
      const costPerSeat = pricingMatrix[item.toolName]?.[item.plan];
      if (costPerSeat !== undefined) {
        item.monthlySpend = costPerSeat * Number(value);
      }
    }

    updatedTools[index] = item;
    saveDraft(updatedTools);
  };

  // Submit dynamic audit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tools.length === 0) {
      showCustomToast('Please add at least one AI tool.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate optimized figures immediately using our TypeScript engine
      const calculation = calculateAudit(tools);

      // Save complete audit results directly into the database
      const auditId = await saveAuditToDb(
        tools,
        calculation.recommendations,
        calculation.totalSavings
      );

      // Clear draft localStorage
      localStorage.removeItem('ai_spend_audit_draft');
      
      showCustomToast('Audit calculated successfully!');
      
      // Navigate to detailed results
      router.push(`/results?id=${auditId}`);

    } catch (err) {
      console.error(err);
      showCustomToast('Failed to save audit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCalculatedSpend = tools.reduce((acc, t) => acc + (t.monthlySpend || 0), 0);

  return (
    <div className="relative isolate min-h-screen bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative gradient glowing orb */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 -z-10 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Audit Your AI Tool Spend
          </h1>
          <p className="mt-3 text-base text-gray-400 max-w-xl mx-auto">
            Input the AI tools, subscriptions, and seats currently deployed across your company. We&apos;ll find instant savings.
          </p>
        </div>

        {/* Dynamic Form container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 md:p-8 border-gray-900 bg-gray-900/40">
            <div className="space-y-6">
              {tools.map((tool, index) => {
                const isAPI = tool.toolName.toLowerCase().includes('api');
                return (
                  <div 
                    key={index} 
                    className="p-5 bg-gray-950/50 border border-gray-800/60 rounded-2xl relative flex flex-col md:flex-row md:items-end gap-4 transition-all duration-300 hover:border-gray-800"
                  >
                    {/* Row Index & Remove Button */}
                    <div className="absolute -top-3 -left-3 flex items-center justify-center h-7 w-7 rounded-lg bg-gray-900 border border-gray-800 text-xs font-bold text-gray-400">
                      {index + 1}
                    </div>

                    {index > 0 || tools.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeToolRow(index)}
                        className="absolute -top-3 -right-3 flex items-center justify-center h-7 w-7 rounded-lg bg-red-950/40 hover:bg-red-950 border border-red-500/30 hover:border-red-500 text-red-400 transition-all duration-200"
                        title="Remove tool"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    ) : null}

                    {/* Tool Name */}
                    <div className="flex-1">
                      <Select
                        label="AI Tool"
                        id={`toolName-${index}`}
                        options={SUPPORTED_TOOLS}
                        value={tool.toolName}
                        onChange={(e) => handleValueChange(index, 'toolName', e.target.value)}
                      />
                    </div>

                    {/* Plan */}
                    <div className="flex-1">
                      <Select
                        label="Subscription Plan"
                        id={`plan-${index}`}
                        options={PLAN_OPTIONS}
                        value={tool.plan}
                        onChange={(e) => handleValueChange(index, 'plan', e.target.value)}
                      />
                    </div>

                    {/* Seats (Only enabled if it is not an API key usage based) */}
                    <div className="w-full md:w-28">
                      <Input
                        label="Seats"
                        id={`seats-${index}`}
                        type="number"
                        min="1"
                        disabled={isAPI}
                        value={isAPI ? 1 : tool.seats}
                        onChange={(e) => handleValueChange(index, 'seats', e.target.value)}
                      />
                    </div>

                    {/* Monthly Spend */}
                    <div className="w-full md:w-36">
                      <Input
                        label="Monthly Spend ($)"
                        id={`spend-${index}`}
                        type="number"
                        min="0"
                        placeholder="0.00"
                        value={tool.monthlySpend || ''}
                        onChange={(e) => handleValueChange(index, 'monthlySpend', e.target.value)}
                      />
                    </div>

                    {/* Use Case */}
                    <div className="flex-1">
                      <Input
                        label="Primary Use Case"
                        id={`usecase-${index}`}
                        type="text"
                        placeholder="e.g. Copilot autocomplete, Copetition..."
                        value={tool.primaryUseCase}
                        onChange={(e) => handleValueChange(index, 'primaryUseCase', e.target.value)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Form Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-900 pt-6">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={addToolRow}
                className="w-full sm:w-auto font-semibold flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                Add Another AI Tool
              </Button>

              <div className="text-right text-sm text-gray-400 font-medium">
                Current Total Estimated Spend:{' '}
                <span className="text-white font-extrabold text-base tracking-tight">
                  ${totalCalculatedSpend}/month
                </span>
              </div>
            </div>
          </Card>

          {/* Form Submission CTA */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              className="w-full sm:w-60 font-bold rounded-2xl shadow-xl shadow-blue-500/10 hover:shadow-blue-500/25 hover:scale-[1.02] transform transition-all duration-200"
            >
              Analyze Stack & Show Savings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
