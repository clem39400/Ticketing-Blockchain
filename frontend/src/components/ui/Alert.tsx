import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import clsx from 'clsx';

type Variant = 'error' | 'warning' | 'success';

const STYLES: Record<Variant, string> = {
  error: 'bg-red-50 border-red-200 text-red-600',
  warning: 'bg-amber-50 border-amber-200 text-amber-700',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
};

const ICONS: Record<Variant, typeof AlertCircle> = {
  error: AlertCircle,
  warning: Clock,
  success: CheckCircle2,
};

/** Inline alert banner (form errors, demo notices, confirmations). */
export function Alert({
  variant,
  children,
  className,
}: {
  variant: Variant;
  children: React.ReactNode;
  className?: string;
}) {
  const Icon = ICONS[variant];
  return (
    <div
      className={clsx(
        'flex items-start gap-2 p-3 rounded-xl border text-sm',
        STYLES[variant],
        className
      )}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <span className="break-words min-w-0">{children}</span>
    </div>
  );
}
