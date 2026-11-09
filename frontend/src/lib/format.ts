/** "3h ago", "2d ago", "Just now" */
export function timeAgo(iso: string, now = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'New';
  const minutes = Math.max(0, Math.floor((now - then) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Best-effort monthly salary (in rupees) from the free-text salary fields.
 * Understands "12 LPA" and ranges like "₹20,000 - ₹70,000" (monthly) or
 * "₹6,00,000 - ₹12,00,000" (annual, detected by size). Returns the lower bound.
 */
export function monthlySalary(salary?: string | null, salaryRange?: string | null): number | null {
  for (const text of [salaryRange, salary]) {
    if (!text) continue;
    const lpa = text.match(/(\d+(?:\.\d+)?)\s*LPA/i);
    if (lpa) return (parseFloat(lpa[1]) * 100000) / 12;
    const numbers = (text.match(/\d[\d,]*/g) || []).map((n) => Number(n.replace(/,/g, ''))).filter((n) => n > 0);
    if (numbers.length) {
      const low = Math.min(...numbers);
      return low >= 200000 ? low / 12 : low;
    }
  }
  return null;
}

/** "₹6,00,000" style formatting for form previews. */
export const inr = (value: number) => `₹${value.toLocaleString('en-IN')}`;
