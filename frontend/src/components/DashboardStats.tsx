'use client';

import { formatEther } from 'viem';
import { useBalance } from 'wagmi';
import { CONTRACT_ADDRESS, type TicketCategory } from '@/contracts/EventTicket1155';
import { BarChart2, Ticket, TrendingUp, Wallet } from 'lucide-react';

type Props = { categories: TicketCategory[] };

export function DashboardStats({ categories }: Props) {
  const { data: contractBalance } = useBalance({
    address: CONTRACT_ADDRESS,
    query: { refetchInterval: 15_000 },
  });

  const totalTickets = categories.reduce((sum, c) => sum + Number(c.maxSupply), 0);
  const totalSold = categories.reduce((sum, c) => sum + Number(c.totalMinted), 0);
  const fillPct = totalTickets > 0 ? Math.round((totalSold / totalTickets) * 100) : 0;

  const stats = [
    { label: 'Catégories', value: categories.length.toString(), icon: BarChart2 },
    { label: 'Billets vendus', value: `${totalSold} / ${totalTickets}`, icon: Ticket },
    { label: 'Taux de remplissage', value: `${fillPct}%`, icon: TrendingUp },
    {
      label: 'ETH collecté',
      value: contractBalance
        ? `${parseFloat(formatEther(contractBalance.value)).toFixed(4)} ETH`
        : '—',
      icon: Wallet,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <div key={label} className="card p-5">
          <div className="w-10 h-10 rounded-xl bg-page border border-line flex items-center justify-center mb-3">
            <Icon className="w-5 h-5 text-ink" />
          </div>
          <p className="text-2xl font-bold text-ink mb-0.5 tabular-nums">{value}</p>
          <p className="text-xs text-ink-muted">{label}</p>
        </div>
      ))}
    </div>
  );
}
