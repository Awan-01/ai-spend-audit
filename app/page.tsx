'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Card, Badge } from '../components/ui';

// Mock testimonials/stats for premium credibility
const STATS = [
  { value: '$420/mo', label: 'Average Startup Saving' },
  { value: '2 Minutes', label: 'Time to Run Audit' },
  { value: '100% Secure', label: 'No Bank logins Required' },
  { value: 'No-Friction', label: 'Manual Estimates Only' },
];

const FEATURES = [
  {
    icon: (
      <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: 'License & Seat Consolidation',
    description: 'Find overlap between duplicate developers subscriptions (e.g. Cursor vs GitHub Copilot, or ChatGPT vs Claude Pro) and reclaim $20-$40 per seat.',
  },
  {
    icon: (
      <svg className="h-6 w-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Enterprise Tier Optimization',
    description: 'Stop paying enterprise premiums. If your team is under 15 users, we guide you back to highly secure, private Team tiers to cut billing in half.',
  },
  {
    icon: (
      <svg className="h-6 w-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Pragmatic API Caching',
    description: 'Analyze token volume and spending trends. Save up to 50% immediately with prompt caching guidelines, local gateways, and unified fallback models.',
  },
];

const FAQS = [
  {
    question: 'How long does the audit take?',
    answer: 'Under 2 minutes! You just select the AI tools your team uses (like ChatGPT, Claude, Cursor, Copilot, etc.), enter the plans and seat counts, and our engine calculates instant plan savings.',
  },
  {
    question: 'Do you require read-only billing or API connections?',
    answer: 'Absolutely not. To keep things 100% secure, private, and frictionless, you manually type in your estimates. We will never ask you to link a bank account, SaaS admin login, or copy secret API keys.',
  },
  {
    question: 'Is my company data kept confidential?',
    answer: 'Yes. We never expose your company name or email address in public share links. The shareable audit URL displays only aggregate tool usage and savings breakdowns, making it perfectly safe to post or share with co-founders.',
  },
  {
    question: 'How does the audit engine calculate savings?',
    answer: 'The engine uses a rigorous rule-based algorithm constructed with real-world SaaS tiers (ChatGPT Plus/Team/Enterprise, Claude Pro/Team/Enterprise, Cursor, Copilot, Windsurf) and flags redundant pricing, duplicate seats, and API optimization tactics.',
  },
  {
    question: 'Can I get a personalized report sent to my inbox?',
    answer: 'Yes! After your audit results page loads, you can enter your email address to lock in a full optimization report. This generates a public share page URL and links all customized savings rules to your email.',
  },
];

export default function LandingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="relative isolate overflow-hidden min-h-screen bg-gray-950">
      {/* Background Decorative Neon Orbs */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div 
          className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-600 to-indigo-700 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72rem]"
          style={{
            clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
          }}
        />
      </div>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8 lg:pt-32 text-center">
        <div className="flex justify-center mb-6">
          <Badge variant="info" className="px-4 py-1.5 text-xs font-semibold tracking-wide uppercase border-blue-500/30 bg-blue-500/10 text-blue-400 backdrop-blur-sm">
            ✨ Free 2-Minute AI Cost Audit
          </Badge>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl max-w-4xl mx-auto leading-none">
          Stop Overpaying For <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent pulse-glow">
            AI Tools
          </span>
        </h1>

        <p className="mt-6 text-lg leading-8 text-gray-400 max-w-2xl mx-auto">
          Startups waste up to 35% of their budget on duplicate developer seats, overpriced enterprise tiers, and raw API bloat. Get an instant, private audit of your AI spend now.
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/audit">
            <Button variant="primary" size="lg" className="px-8 py-4 font-bold text-sm text-white tracking-wide rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-105 transform transition-all duration-200">
              Start Free Audit
            </Button>
          </Link>
          <a href="#features" className="text-sm font-semibold leading-6 text-gray-300 hover:text-white transition-colors duration-150">
            See how it works <span aria-hidden="true">→</span>
          </a>
        </div>

        {/* Stats Grid */}
        <div className="mx-auto mt-20 max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-2 gap-y-12 gap-x-8 border-t border-gray-900 pt-16 text-center sm:grid-cols-4">
            {STATS.map((stat, idx) => (
              <div key={idx} className="mx-auto flex max-w-xs flex-col gap-y-2">
                <dd className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  {stat.value}
                </dd>
                <dt className="text-sm leading-6 text-gray-500 font-medium">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Visual Separation Line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent my-10" />

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base font-bold text-blue-500 tracking-wide uppercase">
            How It Works
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-white sm:text-4xl tracking-tight">
            How we find plan savings
          </p>
          <p className="mt-4 text-base text-gray-400">
            Our rules parse your tool profiles to find exact cost leaks. No bank logins or API connections required.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {FEATURES.map((feature, idx) => (
            <Card key={idx} hoverEffect className="p-8 flex flex-col gap-4 text-left">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-950 border border-gray-800 shadow-inner shadow-white/5">
                {feature.icon}
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Interactive FAQ Section */}
      <section id="faq" className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-base font-bold text-emerald-400 tracking-wide uppercase">
            Questions
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <Card 
                key={index} 
                className="overflow-hidden border border-gray-900 bg-gray-900/40 cursor-pointer"
                onClick={() => toggleFaq(index)}
              >
                <button className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none">
                  <span className="font-bold text-white text-base tracking-tight pr-4">
                    {faq.question}
                  </span>
                  <span className="shrink-0 text-gray-400">
                    {isOpen ? (
                      <svg className="h-5 w-5 transform rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </span>
                </button>
                <div 
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100 border-t border-gray-900/60' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <p className="px-6 py-5 text-sm leading-relaxed text-gray-400 bg-gray-950/20">
                    {faq.answer}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Decorative Bottom Glow */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
        <div 
          className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 bg-gradient-to-tr from-emerald-600 to-teal-700 opacity-15 sm:left-[calc(50%+36rem)] sm:w-[72rem]"
          style={{
            clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
          }}
        />
      </div>
    </div>
  );
}
