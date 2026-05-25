import test from 'node:test';
import assert from 'node:assert';
import { calculateAudit } from './auditEngine';
import { AIToolSpend } from '../types/audit';

test('Audit Engine - Empty state', () => {
  const tools: AIToolSpend[] = [];
  const result = calculateAudit(tools);
  
  assert.strictEqual(result.totalSavings, 0);
  assert.strictEqual(result.currentSpend, 0);
  assert.strictEqual(result.optimizedSpend, 0);
  assert.strictEqual(result.recommendations.length, 0);
});

test('Audit Engine - General Assistant Consolidation (ChatGPT + Claude)', () => {
  const tools: AIToolSpend[] = [
    { toolName: 'ChatGPT Plus', plan: 'Individual/Pro', monthlySpend: 20, seats: 1, primaryUseCase: 'Writing' },
    { toolName: 'Claude Pro', plan: 'Individual/Pro', monthlySpend: 20, seats: 1, primaryUseCase: 'Writing general content' }
  ];
  
  const result = calculateAudit(tools);
  
  // Should trigger the general assistant overlap rule
  assert.ok(result.totalSavings > 0, 'Should find savings');
  assert.strictEqual(result.totalSavings, 20); // Should recommend saving the cheaper or one of them ($20)
  assert.ok(result.recommendations.some(r => r.reasoning.includes('overlap') || r.reasoning.includes('consolidating')));
});

test('Audit Engine - Code Assistant Consolidation (Cursor + GitHub Copilot)', () => {
  const tools: AIToolSpend[] = [
    { toolName: 'Cursor Pro', plan: 'Individual/Pro', monthlySpend: 20, seats: 1, primaryUseCase: 'Coding' },
    { toolName: 'GitHub Copilot', plan: 'Individual/Pro', monthlySpend: 10, seats: 1, primaryUseCase: 'Coding Autocomplete' }
  ];
  
  const result = calculateAudit(tools);
  
  // Should trigger Cursor + Copilot redundancy rule
  assert.strictEqual(result.totalSavings, 10); // Savings should equal GitHub Copilot's cost
  const rec = result.recommendations.find(r => r.toolName === 'GitHub Copilot');
  assert.ok(rec);
  assert.ok(rec?.reasoning.includes('redundant') || rec?.reasoning.includes('Cursor includes its own'));
});

test('Audit Engine - Enterprise Downgrade for Small Teams (< 15 seats)', () => {
  const tools: AIToolSpend[] = [
    { toolName: 'ChatGPT Enterprise', plan: 'Enterprise', monthlySpend: 600, seats: 10, primaryUseCase: 'Company-wide AI' }
  ];
  
  const result = calculateAudit(tools);
  
  // ChatGPT Enterprise for 10 seats should suggest downgrading to ChatGPT Team
  // Unit savings: $30/seat, for 10 seats = $300 savings
  assert.strictEqual(result.totalSavings, 300);
  const rec = result.recommendations.find(r => r.toolName === 'ChatGPT Enterprise');
  assert.ok(rec);
  assert.strictEqual(rec?.recommendedPlan, 'ChatGPT Team');
});

test('Audit Engine - API Spend Optimization (High OpenAI API Spend)', () => {
  const tools: AIToolSpend[] = [
    { toolName: 'OpenAI API', plan: 'API Usage (Pay-as-you-go)', monthlySpend: 1000, seats: 5, primaryUseCase: 'LLM features' }
  ];
  
  const result = calculateAudit(tools);
  
  // Should trigger API optimization (savings: ~40% = $400)
  assert.strictEqual(result.totalSavings, 400);
  const rec = result.recommendations.find(r => r.toolName === 'OpenAI API');
  assert.ok(rec);
  assert.ok(rec?.reasoning.includes('caching') || rec?.reasoning.includes('routing'));
});

test('Audit Engine - Single-Seat Team Plan Downgrade', () => {
  const tools: AIToolSpend[] = [
    { toolName: 'Claude Team', plan: 'Team/Business', monthlySpend: 30, seats: 1, primaryUseCase: 'Consulting' }
  ];
  
  const result = calculateAudit(tools);
  
  // 1 seat in Claude Team should recommend Claude Pro, saving $10
  assert.strictEqual(result.totalSavings, 10);
  const rec = result.recommendations.find(r => r.toolName === 'Claude Team');
  assert.ok(rec);
  assert.strictEqual(rec?.recommendedPlan, 'Claude Pro');
});

test('Audit Engine - Small Technical Team Downgrade (< 5 seats)', () => {
  const tools: AIToolSpend[] = [
    { toolName: 'ChatGPT Team', plan: 'Team/Business', monthlySpend: 90, seats: 3, primaryUseCase: 'General business' }
  ];
  
  const result = calculateAudit(tools);
  
  // ChatGPT Team ($30/seat) downgrade to ChatGPT Plus ($20/seat) saves $10/seat. 3 seats = $30.
  assert.strictEqual(result.totalSavings, 30);
  const rec = result.recommendations.find(r => r.toolName === 'ChatGPT Team');
  assert.ok(rec);
  assert.strictEqual(rec?.recommendedPlan, 'Downgrade to ChatGPT Plus plans');
});

test('Audit Engine - Developer-Specific Assistant Redundancy (Cursor + Standalone Pro)', () => {
  const tools: AIToolSpend[] = [
    { toolName: 'Cursor Pro', plan: 'Individual/Pro', monthlySpend: 40, seats: 2, primaryUseCase: 'Coding' },
    { toolName: 'ChatGPT Plus', plan: 'Individual/Pro', monthlySpend: 40, seats: 2, primaryUseCase: 'Coding and Dev Assistance' }
  ];
  
  const result = calculateAudit(tools);
  
  // 2 technical seats overlap. Cost per seat = $20. Savings: 2 * 20 = $40.
  assert.strictEqual(result.totalSavings, 40);
  const rec = result.recommendations.find(r => r.toolName.includes('Technical Overlap'));
  assert.ok(rec);
  assert.strictEqual(rec?.recommendedPlan, 'De-provision separate assistant accounts for developers');
});
