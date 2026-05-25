import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-gray-900 bg-gray-950 py-10 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
            <span className="text-sm font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              AISpend<span className="text-blue-500 font-extrabold">Audit</span>
            </span>
          </div>

          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} AISpendAudit. Built with Next.js 15, Tailwind, and Supabase. No credentials required.
          </p>

          <div className="flex items-center gap-6">
            <Link href="/#features" className="text-xs text-gray-400 hover:text-white transition-colors duration-200">
              Features
            </Link>
            <Link href="/#faq" className="text-xs text-gray-400 hover:text-white transition-colors duration-200">
              FAQ
            </Link>
            <Link href="https://github.com" target="_blank" className="text-xs text-gray-400 hover:text-white transition-colors duration-200">
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
