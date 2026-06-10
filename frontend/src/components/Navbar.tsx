'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectWalletButton } from './ConnectWalletButton';
import { useIsOwner } from '@/hooks/useTicketContract';
import { LayoutDashboard, Ticket } from 'lucide-react';
import clsx from 'clsx';

export function Navbar() {
  const pathname = usePathname();
  const isOwner = useIsOwner();

  const links = [
    { href: '/', label: 'Billetterie', icon: Ticket },
    ...(isOwner ? [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-surface-border bg-surface/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
              <Ticket className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">
              Tracea<span className="text-gradient">Ticket</span>
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname === href
                    ? 'bg-brand-500/15 text-brand-400'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.05]'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <ConnectWalletButton />
      </div>
    </header>
  );
}
