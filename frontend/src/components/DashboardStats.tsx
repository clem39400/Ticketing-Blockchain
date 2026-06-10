'use client';

import { formatEther } from 'viem';
import { BarChart2, Ticket, TrendingUp, Wallet } from 'lucide-react';

type Props = {
  ticketTypeCount: number;
  totalSold: number;
  totalSupply: number;
  /** Sum of the ETH balances of all ticket contracts (wei). */
  totalEthWei?: bigint;
};

export function DashboardStats({
  ticketTypeCount,
  totalSold,
  totalSupply,
  totalEthWei,
}: Props) {
  const fillPct = totalSupply > 0 ? Math.round((totalSold / totalSupply) * 100) : 0;

  const stats = [
    { label: 'Types de billets', value: ticketTypeCount.toString(), icon: BarChart2 },
    { label: 'Billets vendus', value: `${totalSold} / ${totalSupply}`, icon: Ticket },
    { label: 'Taux de remplissage', value: `${fillPct}%`, icon: TrendingUp },
    {
      label: 'ETH collecté',
      value:
        totalEthWei !== undefined
          ? `${parseFloat(formatEther(totalEthWei)).toFixed(4)} ETH`
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
