'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, Badge, Input, Select, showCustomToast } from '../../components/ui';
import { AuditRecord } from '../../types/audit';
import { getAuditFromDb, saveLeadToDb } from '../../lib/db';

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const auditId = searchParams?.get('id') || '';

  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState<AuditRecord | null>(null);
  
  // AI summary state
  const [aiLoading, setAiLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState('');
  
  // Lead capture state
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('Founder / Exec');
  const [teamSize, setTeamSize] = useState(5);
  const [honeypot, setHoneypot] = useState(''); // Spam protection honeypot
  const [leadSaved, setLeadSaved] = useState(false);
  const [leadSaving, setLeadSaving] = useState(false);

  // Call API summary route
  const fetchAISummary = async (auditRecord: AuditRecord) => {
    try {
      setAiLoading(true);
      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tools: auditRecord.tools,
          totalSavings: auditRecord.totalSavings,
          recommendations: auditRecord.recommendations
        })
      });
      const data = await res.json();
      if (data.summary) {
        setAiSummary(data.summary);
      } else {
        setAiSummary('Failed to load summary. Read your detailed saving cards below.');
      }
    } catch (err) {
      console.error(err);
      setAiSummary('System offline. Read your detailed plan suggestions below.');
    } finally {
      setAiLoading(false);
    }
  };

  // Load audit data
  useEffect(() => {
    if (!auditId) {
      router.push('/audit');
      return;
    }

    const fetchAudit = async () => {
      try {
        setLoading(true);
        const data = await getAuditFromDb(auditId);
        if (data) {
          setAudit(data);
          // Trigger AI summary generation immediately
          fetchAISummary(data);
        } else {
          showCustomToast('Audit not found. Redirecting...');
          router.push('/audit');
        }
      } catch (err) {
        console.error(err);
        showCustomToast('Failed to load audit data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAudit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditId]);

  // Copy share link to clipboard
  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/share/${auditId}`;
    navigator.clipboard.writeText(shareUrl);
    showCustomToast('Public shareable link copied to clipboard!');
  };

  // Lead Form submission
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot spam check
    if (honeypot) {
      console.warn('Honeypot field filled. Blocking form submission.');
      setLeadSaved(true); // Pretend success to confuse bot
      return;
    }

    if (!email || !companyName) {
      showCustomToast('Please enter your email and company name.');
      return;
    }

    setLeadSaving(true);
    try {
      const success = await saveLeadToDb(email, companyName, role, teamSize, auditId);
      if (success) {
        setLeadSaved(true);
        showCustomToast('Report unlocked successfully!');
        
        // Trigger high-end developer confetti simulation or glow burst
        if (typeof document !== 'undefined') {
          const body = document.body;
          body.classList.add('neon-glow-indigo');
          setTimeout(() => body.classList.remove('neon-glow-indigo'), 2000);
        }
      } else {
        showCustomToast('Failed to save. Try again.');
      }
    } catch (err) {
      console.error(err);
      showCustomToast('Error unlocking report.');
    } finally {
      setLeadSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-gray-950 py-32">
        <div className="text-center flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-gray-400 font-medium text-sm tracking-wide">Calculating cost savings...</span>
        </div>
      </div>
    );
  }

  if (!audit) return null;

  const currentSpend = audit.tools.reduce((acc, t) => acc + (t.monthlySpend || 0), 0);
  const totalSavings = audit.totalSavings || 0;
  const optimizedSpend = Math.max(0, currentSpend - totalSavings);
  const yearlySavings = totalSavings * 12;

  // Visual percentages for the savings display bars
  const savingsPct = currentSpend > 0 ? Math.round((totalSavings / currentSpend) * 100) : 0;

  return (
    <div className="relative isolate min-h-screen bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      {/* Dynamic colorful decorative blur orbs */}
      <div className="absolute top-10 left-10 -z-10 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
      <div className="absolute top-40 right-10 -z-10 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl" />

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* TOP SUMMARY CARD (Savings Numbers) */}
        <Card className="p-6 md:p-8 border-gray-900 bg-gray-900/30 neon-glow-blue relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-blue-500/10 to-transparent pointer-events-none rounded-bl-full" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Primary Savings Display */}
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Total Monthly Savings
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight flex items-baseline">
                ${totalSavings}
                <span className="text-sm font-semibold text-gray-500 ml-1">/mo</span>
              </h2>
              <div className="flex items-center gap-1.5 mt-2">
                <Badge variant="success" className="text-xs">
                  {savingsPct}% Cut
                </Badge>
                <span className="text-xs text-gray-400 font-medium">
                  Saving ${yearlySavings}/yr
                </span>
              </div>
            </div>

            {/* Quick Spend Indicators & visual bars */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-900/60">
                  <div className="text-xs text-gray-500 font-medium uppercase">Current Spend</div>
                  <div className="text-lg font-bold text-gray-300">${currentSpend}/mo</div>
                </div>
                <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-800/60">
                  <div className="text-xs text-blue-400 font-medium uppercase">Optimized Spend</div>
                  <div className="text-lg font-bold text-white">${optimizedSpend}/mo</div>
                </div>
              </div>

              {/* Pure CSS Spend comparison visual bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                  <span>Spend Footprint Comparison</span>
                  <span>{savingsPct}% recovered</span>
                </div>
                <div className="h-3 w-full bg-gray-900 rounded-full overflow-hidden flex gap-1 p-0.5">
                  <div 
                    style={{ width: `${Math.round((optimizedSpend / currentSpend) * 100)}%` }} 
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" 
                  />
                  {totalSavings > 0 && (
                    <div 
                      style={{ width: `${Math.round((totalSavings / currentSpend) * 100)}%` }} 
                      className="h-full bg-emerald-500/80 rounded-full animate-pulse" 
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* AI personalized Executive summary */}
        <Card className="p-6 border-gray-800/80 bg-gray-900/40 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />
          <h3 className="text-base font-bold text-white tracking-tight mb-3 flex items-center gap-2">
            <svg className="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Personalized Executive Summary
          </h3>

          {aiLoading ? (
            <div className="space-y-3 py-2 animate-pulse">
              <div className="h-3.5 bg-gray-800 rounded-full w-full" />
              <div className="h-3.5 bg-gray-800 rounded-full w-5/6" />
              <div className="h-3.5 bg-gray-800 rounded-full w-4/5" />
            </div>
          ) : (
            <p className="text-sm text-gray-300 leading-relaxed font-medium">
              {aiSummary}
            </p>
          )}
        </Card>

        {/* HIGH SAVINGS CTA OR LOW WASTE NOTICE */}
        {totalSavings > 500 ? (
          <Card className="p-5 border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold text-xl shrink-0">
                💎
              </span>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">
                  High Savings Found!
                </h4>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed max-w-xl">
                  Since your estimated savings are pretty high (over $500/mo), it might be worth talking through these plan transitions. Feel free to book a short 1-on-1 chat to discuss setting up prompt caching or team downgrades.
                </p>
              </div>
            </div>
            <a href="https://calendly.com" target="_blank" className="w-full md:w-auto">
              <Button variant="secondary" size="sm" className="w-full md:w-auto font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/10">
                Book a Chat
              </Button>
            </a>
          </Card>
        ) : totalSavings <= 50 ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-left flex items-start gap-3">
            <span className="text-lg">✅</span>
            <div>
              <div className="text-sm font-bold text-emerald-400 tracking-tight">Stack Looks Great!</div>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                Your AI tool spend is already really well optimized. You have no obvious duplicates or overprovisioned seats. Keep running your current stack!
              </p>
            </div>
          </div>
        ) : null}

        {/* DETAILED PLAN RECOMMENDATIONS CARDS */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white tracking-tight">
            Cost Saving Recommendations
          </h3>

          {audit.recommendations && audit.recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {audit.recommendations.map((rec, idx) => (
                <Card key={idx} hoverEffect className="p-6 bg-gray-900/20 border-gray-900 hover:border-gray-800 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="info" className="mb-2">
                          {rec.toolName}
                        </Badge>
                        <h4 className="text-sm font-bold text-white tracking-tight">
                          {rec.recommendedPlan}
                        </h4>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                          Savings
                        </span>
                        <span className="text-lg font-extrabold text-emerald-400">
                          +${rec.savings}<span className="text-xs font-medium text-emerald-500">/mo</span>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs bg-gray-950/40 p-2.5 rounded-xl border border-gray-900/60">
                      <div>
                        <span className="text-gray-500 block font-medium">Current Status</span>
                        <span className="text-gray-300 font-bold">{rec.currentPlan}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block font-medium">Recommended Action</span>
                        <span className="text-white font-bold">{rec.recommendedPlan}</span>
                      </div>
                    </div>

                    <p className="text-xs leading-relaxed text-gray-400">
                      {rec.reasoning}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center border-dashed border-gray-800 bg-transparent">
              <p className="text-sm text-gray-500 font-medium">
                No adjustments suggested. Your current SaaS configuration is flawless!
              </p>
            </Card>
          )}
        </div>

        {/* LEAD CAPTURE & REPORT ACTIONS CARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Share/Actions Grid */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <Card className="p-6 border-gray-900 bg-gray-900/40 flex flex-col gap-4 h-full">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Share Results
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Copy a private link of this page to share with your team. Company names and emails are automatically hidden from shared results to keep things private.
              </p>

              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleCopyLink}
                className="w-full font-bold flex items-center justify-center gap-2 border-gray-800"
              >
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 10.742l-2.777 1.111A1 1 0 005 12.755V14a1 1 0 00.553.894l2.778 1.112a1 1 0 001.332-.505l.397-.993m0-4.016a1 1 0 00-.73-.66l-2.778-1.112A1 1 0 005 9.755V11a1 1 0 00.553.894l2.778 1.112a1 1 0 001.332-.505l.397-.993m0 0a1 1 0 00.73-.66l2.778-1.112A1 1 0 0013 7.755V9a1 1 0 00.553.894l2.778 1.112a1 1 0 001.332-.505l.397-.993M11 13a1 1 0 011-1h2a1 1 0 011 1v1a1 1 0 01-1 1h-2a1 1 0 01-1-1v-1z" />
                </svg>
                Get Public Share Link
              </Button>
            </Card>
          </div>

          {/* Lead capture Form card */}
          <div className="md:col-span-2">
            <Card className="p-6 md:p-8 border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent relative overflow-hidden h-full">
              {leadSaved ? (
                <div className="text-center py-10 flex flex-col items-center gap-3">
                  <span className="text-4xl">🎉</span>
                  <h3 className="text-lg font-bold text-white tracking-tight">Playbook and Templates Unlocked!</h3>
                  <p className="text-xs text-gray-400 max-w-sm">
                    We've saved your email and sent over the PDF handbook containing prompt caching templates and negotiation scripts.
                  </p>
                  
                  <div className="flex gap-4 mt-4">
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                      Print detailed audit
                    </Button>
                    <Link href="/audit">
                      <Button variant="primary" size="sm">
                        Create New Audit
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <Badge variant="success" className="text-xs uppercase font-bold tracking-wide">
                      Get PDF Playbook
                    </Badge>
                    <h3 className="text-base font-extrabold text-white tracking-tight">
                      Get the PDF Cost Checklist & Templates
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Enter your details to get a PDF summary of these recommendations along with our prompt caching guides and template negotiation emails.
                    </p>
                  </div>

                  {/* Honeypot field (hidden from users, acts as spam capture) */}
                  <div className="hidden" aria-hidden="true">
                    <input 
                      type="text" 
                      name="middle_name_verify" 
                      value={honeypot} 
                      onChange={(e) => setHoneypot(e.target.value)} 
                      placeholder="Do not fill this" 
                      tabIndex={-1} 
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Business Email"
                      id="lead-email"
                      type="email"
                      required
                      placeholder="alex@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                      label="Company Name"
                      id="lead-company"
                      type="text"
                      required
                      placeholder="Acme Inc."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Your Role"
                      id="lead-role"
                      options={[
                        { value: 'Founder / Exec', label: 'Founder / Exec' },
                        { value: 'CTO / Engineering Lead', label: 'CTO / Engineering Lead' },
                        { value: 'Finance Director / Ops', label: 'Finance Director / Ops' },
                        { value: 'Developer / Designer', label: 'Developer / Designer' },
                        { value: 'Other', label: 'Other' }
                      ]}
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    />

                    <Input
                      label="Team Size"
                      id="lead-teamSize"
                      type="number"
                      min="1"
                      required
                      value={teamSize}
                      onChange={(e) => setTeamSize(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      variant="secondary"
                      size="md"
                      loading={leadSaving}
                      className="w-full sm:w-60 font-bold bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/10 text-white"
                    >
                      Get PDF Playbook
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <span className="text-gray-400 font-semibold">Loading audit workspace...</span>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
