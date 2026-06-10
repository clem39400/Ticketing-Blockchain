'use client';

import { Ticket } from 'lucide-react';
import clsx from 'clsx';

// Deterministic monochrome banner derived from the event name.
// (Real event banners come from the API / IPFS once wired.)
const PATTERNS = [
  'from-zinc-900 to-zinc-700',
  'from-zinc-800 to-zinc-600',
  'from-neutral-900 to-neutral-700',
  'from-stone-800 to-stone-600',
];

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

type Props = {
  name: string;
  className?: string;
  src?: string | null;
};

export function EventBanner({ name, className, src }: Props) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className={clsx('object-cover w-full h-full', className)} />;
  }

  const pattern = PATTERNS[hash(name) % PATTERNS.length];

  return (
    <div
      className={clsx(
        'relative w-full h-full overflow-hidden bg-gradient-to-br flex items-center justify-center',
        pattern,
        className
      )}
    >
      <Ticket className="absolute -right-6 -bottom-6 w-40 h-40 text-white/[0.06]" strokeWidth={1} />
      <span className="relative px-6 text-center text-white/90 font-extrabold tracking-tight text-xl sm:text-2xl line-clamp-2">
        {name}
      </span>
    </div>
  );
}
