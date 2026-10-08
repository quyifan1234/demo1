// @ts-nocheck — 平台 agent 遗留死代码，不再维护
import type { LucideIcon } from 'lucide-react';

interface Props {
  Icon: LucideIcon;
  title: string;
  desc?: string;
  action?: React.ReactNode;
}

export function EmptyState({ Icon, title, desc, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon size={22} />
      </span>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {desc && <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">{desc}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
