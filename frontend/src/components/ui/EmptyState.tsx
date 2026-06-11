/** Card-styled placeholder for empty / error / not-found page states. */
export function EmptyState({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card text-center py-20">
      <div className="w-14 h-14 rounded-2xl bg-page border border-line flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <p className="font-semibold text-ink mb-1">{title}</p>
      <p className="text-sm text-ink-faint">{subtitle}</p>
      {action}
    </div>
  );
}
