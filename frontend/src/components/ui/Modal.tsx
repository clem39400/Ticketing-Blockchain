'use client';

import { X } from 'lucide-react';

/**
 * Shared modal shell: backdrop, centered panel and a titled header.
 * While `busy` is true the modal cannot be dismissed (in-flight request).
 */
export function Modal({
  icon,
  title,
  subtitle,
  busy = false,
  onClose,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  busy?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
        onClick={busy ? undefined : onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md bg-card rounded-2xl shadow-lift overflow-hidden animate-fade-up">
          <div className="flex items-center justify-between p-5 border-b border-line">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center text-white">
                {icon}
              </div>
              <div>
                <h2 className="font-semibold text-ink leading-tight">{title}</h2>
                {subtitle && <p className="text-xs text-ink-faint">{subtitle}</p>}
              </div>
            </div>
            {!busy && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-page flex items-center justify-center text-ink-faint hover:text-ink transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </>
  );
}
