import Image from 'next/image';

const LOGOS: Record<string, string> = {
  amazon: '/images/amazon.png',
  tesla: '/images/img2.png',
  swiggy: '/images/swiggy.png',
};

const PALETTE = ['bg-violet-100 text-violet-700', 'bg-sky-100 text-sky-700', 'bg-amber-100 text-amber-700', 'bg-emerald-100 text-emerald-700', 'bg-rose-100 text-rose-700'];

/** Known company logos, otherwise a coloured initials tile (no external image service). */
export function CompanyLogo({ name, size = 64 }: { name: string; size?: number }) {
  const src = LOGOS[name.trim().toLowerCase()];
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
  const colour = PALETTE[[...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % PALETTE.length];

  return (
    <div
      className="flex flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white p-2"
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image src={src} alt={`${name} logo`} width={size - 16} height={size - 16} className="object-contain" />
      ) : (
        <span className={`flex h-full w-full items-center justify-center rounded-lg text-lg font-bold ${colour}`} aria-hidden="true">
          {initials || '?'}
        </span>
      )}
    </div>
  );
}
