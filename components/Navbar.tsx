'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const isAuditPage = pathname?.includes('/audit') || pathname?.includes('/results') || pathname?.includes('/share');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-900 bg-gray-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </span>
              <span className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent group-hover:to-white transition-all duration-200">
                AISpend<span className="text-blue-500 font-extrabold">Audit</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
              Features
            </Link>
            <Link href="/#faq" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
              FAQ
            </Link>
            <Link href="/#pricing" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
              Pricing
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {!isAuditPage ? (
              <Link href="/audit">
                <Button variant="primary" size="sm" className="hidden sm:inline-flex">
                  Start Free Audit
                </Button>
              </Link>
            ) : (
              <Link href="/">
                <Button variant="outline" size="sm">
                  Back Home
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
