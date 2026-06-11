import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

/** Inline rotating spinner. */
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={clsx('spin-slow', className ?? 'w-4 h-4')} />;
}

/** Centered full-width loading block used while a page query is pending. */
export function PageLoader() {
  return (
    <div className="py-20 text-center">
      <Spinner className="w-6 h-6 text-ink-faint mx-auto" />
    </div>
  );
}
