'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectWalletButton } from './ConnectWalletButton';
import { Ticket } from 'lucide-react';
import clsx from 'clsx';

const LINKS = [
  { href: '/', label: 'Events', match: (p: string) => p === '/' || p.startsWith('/event') },
  { href: '/my-tickets', label: 'My tickets', match: (p: string) => p.startsWith('/my-tickets') },
  { href: '/admin', label: 'Admin', match: (p: string) => p.startsWith('/admin') },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-xl border-b border-line">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-9">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center group-hover:scale-105 transition-transform">
              <Ticket className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold tracking-tight text-ink text-[15px]">TicketMaster</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {LINKS.map(({ href, label, match }) => {
              const active = match(pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    active ? 'text-ink' : 'text-ink-faint hover:text-ink'
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <ConnectWalletButton />
      </div>
    </header>
  );
}
