'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageLoader } from '@/components/ui/Spinner';
import { useAdminDashboard } from './useAdminDashboard';
import { DashboardStats } from './DashboardStats';
import { NewEventForm } from './NewEventForm';
import { CollectEthPanel } from './CollectEthPanel';
import { TicketsTable } from './TicketsTable';
import { EventsRecap } from './EventsRecap';
import { CreateCategoryModal } from './CreateCategoryModal';

/** Admin dashboard: event creation, stats, fund collection and ticket table. */
export function AdminPage() {
  const {
    events,
    eventsLoading,
    eventsError,
    allRows,
    allTickets,
    onChain,
    balances,
    refreshAll,
    stats,
  } = useAdminDashboard();

  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Admin</h1>
        <p className="text-ink-muted mt-1.5">
          Créez des événements, des billets et collectez l&apos;ETH des ventes.
        </p>
      </div>

      <NewEventForm />

      {eventsLoading ? (
        <div className="card">
          <PageLoader />
        </div>
      ) : eventsError ? (
        <EmptyState
          icon={<AlertCircle className="w-7 h-7 text-red-400" />}
          title="API indisponible"
          subtitle="Impossible de charger les événements depuis le back-office."
        />
      ) : (
        <>
          <DashboardStats
            ticketTypeCount={allTickets.length}
            totalSold={stats.totalSold}
            totalSupply={stats.totalSupply}
            totalEthWei={stats.totalEthWei}
          />

          <CollectEthPanel events={events} balances={balances} />

          <TicketsTable
            rows={allRows}
            onChain={onChain}
            balances={balances}
            onRefresh={refreshAll}
            onCreate={() => setShowCreateModal(true)}
            createDisabled={events.length === 0}
          />

          <EventsRecap events={events} />
        </>
      )}

      {showCreateModal && (
        <CreateCategoryModal
          events={events}
          onClose={() => setShowCreateModal(false)}
          onSuccess={refreshAll}
        />
      )}
    </div>
  );
}
