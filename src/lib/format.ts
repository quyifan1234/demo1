export function maskKey(value: string): string {
  if (!value) return '';
  if (value.length <= 8) return '••••••••';
  return `${value.slice(0, 4)}••••••${value.slice(-4)}`;
}

export function isQuotaAlert(remaining: number | null, total: number | null, thresholdPct: number): boolean {
  if (total == null || total <= 0 || remaining == null) return false;
  return remaining <= total * (thresholdPct / 100);
}

export function quotaPct(remaining: number | null, total: number | null): number {
  if (total == null || total <= 0) return 0;
  return Math.max(0, Math.min(1, (remaining ?? 0) / total));
}

export function fmtDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '刚刚';
  if (m < 60) return `${m}分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}小时前`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}天前`;
  return fmtDate(iso).slice(0, 10);
}
