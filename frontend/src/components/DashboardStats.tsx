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

  const totalTickets = categories.reduce(
    (sum, c) => sum + Number(c.maxSupply),
    0
  );
  const totalSold = categories.reduce(
    (sum, c) => sum + Number(c.totalMinted),
    0
  );
  const fillPct = totalTickets > 0 ? Math.round((totalSold / totalTickets) * 100) : 0;

  const stats = [
    {
      label: 'Catégories',
      value: categories.length.toString(),
      icon: BarChart2,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
    },
    {
      label: 'Billets vendus',
      value: `${totalSold} / ${totalTickets}`,
      icon: Ticket,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Taux de remplissage',
      value: `${fillPct}%`,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'ETH collecté',
      value: contractBalance
        ? `${parseFloat(formatEther(contractBalance.value)).toFixed(4)} ETH`
        : '—',
      icon: Wallet,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="card">
          <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
          <p className="text-xs text-white/40">{label}</p>
        </div>
      ))}
    </div>
  );
}
