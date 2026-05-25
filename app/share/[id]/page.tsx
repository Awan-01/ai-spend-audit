import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, Badge, Button } from '@/components/ui';
import { getAuditFromDb } from '@/lib/db';
import { AIToolSpend, Recommendation } from '@/types/audit';

interface PageProps {
  params: Promise<{ id: string }>;
}

// 1. Generate SEO and OpenGraph Metadata dynamically on the Server
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  try {
    const audit = await getAuditFromDb(id);
    if (!audit) {
      return {
        title: 'Audit Not Found | AISpendAudit',
        description: 'The requested AI Spend Audit could not be found or has expired.',
      };
    }

    const title = `AI Spend Audit: Saving $${audit.totalSavings}/mo`;
    const description = `This team audited their AI tools stack (ChatGPT, Claude, Cursor, Copilot) and identified $${audit.totalSavings}/month ($${audit.totalSavings * 12}/year) in immediate waste reduction. Run your free 2-minute audit.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        images: [
          {
            url: 'https://ai-spend-audit.vercel.app/og-image.png',
            width: 1200,
            height: 630,
            alt: 'AI Spend Audit Savings Dashboard',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['https://ai-spend-audit.vercel.app/og-image.png'],
      },
    };
  } catch {
    return {
      title: 'AI Spend Audit Savings',
    };
  }
}

// 2. High-Performance Next.js 15 Server Component Page
export default async function PublicSharePage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const audit = await getAuditFromDb(id);
  
  if (!audit) {
    notFound();
  }

  const currentSpend = audit.tools.reduce((acc, t) => acc + (t.monthlySpend || 0), 0);
  const totalSavings = audit.totalSavings || 0;
  const optimizedSpend = Math.max(0, currentSpend - totalSavings);
  const yearlySavings = totalSavings * 12;
  const savingsPct = currentSpend > 0 ? Math.round((totalSavings / currentSpend) * 100) : 0;

  return (
    <div className="relative isolate min-h-screen bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative gradient glowing orb */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 -z-10 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Badge variant="success" className="px-3 py-1 text-xs font-bold tracking-wider uppercase">
            Shared Public Audit Results
          </Badge>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl tracking-tight mt-2">
            AI Cost Optimization Breakdown
          </h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Audit ID: <span className="font-mono text-gray-400 select-all">{id}</span>
          </p>
        </div>

        {/* METRICS DASHBOARD */}
        <Card className="p-6 md:p-8 border-gray-900 bg-gray-900/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-emerald-500/10 to-transparent pointer-events-none rounded-bl-full" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Monthly and Yearly Savings block */}
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Estimated Monthly Savings
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight flex items-baseline">
                ${totalSavings}
                <span className="text-sm font-semibold text-gray-500 ml-1">/mo</span>
              </h2>
              <div className="flex items-center gap-1.5 mt-2">
                <Badge variant="info" className="text-xs">
                  {savingsPct}% Reduced
                </Badge>
                <span className="text-xs text-gray-400 font-medium">
                  Saving ${yearlySavings}/yr
                </span>
              </div>
            </div>

            {/* Quick spend overview metrics */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-900/60">
                  <div className="text-xs text-gray-500 font-medium uppercase">Current Spend</div>
                  <div className="text-lg font-bold text-gray-300">${currentSpend}/mo</div>
                </div>
                <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-800/60">
                  <div className="text-xs text-emerald-400 font-medium uppercase">Optimized Spend</div>
                  <div className="text-lg font-bold text-white">${optimizedSpend}/mo</div>
                </div>
              </div>

              {/* Progress bar comparison */}
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-900 rounded-full overflow-hidden flex gap-1 p-0.5">
                  <div 
                    style={{ width: `${Math.max(5, Math.round((optimizedSpend / currentSpend) * 100))}%` }} 
                    className="h-full bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full" 
                  />
                  {totalSavings > 0 && (
                    <div 
                      style={{ width: `${Math.round((totalSavings / currentSpend) * 100)}%` }} 
                      className="h-full bg-blue-500/80 rounded-full animate-pulse" 
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* AUDITED TOOLS SUMMARY */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white tracking-tight">
            Audited Stack Profile ({audit.tools?.length || 0} tools)
          </h3>
          <Card className="overflow-hidden border-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-gray-950 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-900">
                  <tr>
                    <th className="px-6 py-4">AI Tool</th>
                    <th className="px-6 py-4">Plan Name</th>
                    <th className="px-6 py-4 text-center">Seats</th>
                    <th className="px-6 py-4 text-right">Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900/60 bg-gray-900/10">
                  {audit.tools?.map((tool: AIToolSpend, index: number) => (
                    <tr key={index} className="hover:bg-gray-900/20 transition-all duration-150">
                      <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shrink-0" />
                        {tool.toolName}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="neutral">{tool.plan}</Badge>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold">
                        {tool.toolName.toLowerCase().includes('api') ? 'API-driven' : tool.seats}
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-white">
                        ${tool.monthlySpend}/mo
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* RECOMMENDATION DETAILS CARDS */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white tracking-tight">
            Plan Suggestions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {audit.recommendations?.map((rec: Recommendation, idx: number) => (
              <Card key={idx} className="p-6 border-gray-900 bg-gray-900/20 flex flex-col justify-between">
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

                  <p className="text-xs leading-relaxed text-gray-400">
                    {rec.reasoning}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* BOTTOM BRANDING CTA TO RUN NEW AUDIT */}
        <Card className="p-6 md:p-8 border-blue-500/20 bg-gradient-to-r from-blue-500/10 via-transparent to-transparent flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white tracking-tight">
              Audit your own AI tools spend and cut bills
            </h3>
            <p className="text-xs text-gray-400 max-w-xl">
              Are you currently using ChatGPT, Claude, Cursor, or LLM APIs? Get a quick savings breakdown in under 2 minutes. No bank logins or card details required.
            </p>
          </div>
          <Link href="/audit" className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full sm:w-auto font-bold rounded-xl shadow-lg">
              Start Free Audit
            </Button>
          </Link>
        </Card>

      </div>
    </div>
  );
}
