import { Suspense } from 'react';
import { EventDetailPage } from '@/features/event-detail/EventDetailPage';
import { PageLoader } from '@/components/ui/Spinner';

// useSearchParams() requires a Suspense boundary at the page level.
export default function EventRoute() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <PageLoader />
        </div>
      }
    >
      <EventDetailPage />
    </Suspense>
  );
}
