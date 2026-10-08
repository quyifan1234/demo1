import { createFileRoute, Link } from '@tanstack/react-router';
import { useApps, useKeys, useSkills, useAssets, usePrefs } from '../../lib/queries';
import { isQuotaAlert, timeAgo, fmtDate } from '../../lib/format';
import { InitialAvatar, PageHeader, QuotaBar } from '../../components/bits';
import { RowList, RowChevron, RowSkeleton, SectionTitle } from '../../components/rows';
import { LIBRARY_NAV } from '../../components/libraryNav';
import { cn } from '../../lib/utils';

export const Route = createFileRoute('/_app/')({
  component: Dashboard,
});

function Dashboard() {
  const apps = useApps();
  const keys = useKeys();
  const skills = useSkills();
  const assets = useAssets();
  const prefs = usePrefs();
  const threshold = prefs.data?.quota_threshold ?? 20;
  const loading = apps.isLoading || keys.isLoading || skills.isLoading || assets.isLoading;

  const appList = apps.data ?? [];
  const alerts = appList.filter((a) => isQuotaAlert(a.quota_remaining, a.quota_total, threshold));
  const favCount = appList.filter((a) => a.is_favorite).length;

  const counts: Record<string, number> = {
    '/apps': appList.length,
    '/assets': assets.data?.length ?? 0,
    '/skills': skills.data?.length ?? 0,
    '/keys': keys.data?.length ?? 0,
  };

  const recent = [
    ...appList.map((a) => ({ type: '应用', name: a.name, id: `/apps/${a.id}`, updated_at: a.updated_at })),
    ...(keys.data ?? []).map((k) => ({ type: '密钥', name: k.name, id: `/keys/${k.id}`, updated_at: k.updated_at })),
    ...(skills.data ?? []).map((s) => ({ type: '技能', name: s.name, id: `/skills/${s.id}`, updated_at: s.updated_at })),
    ...(assets.data ?? []).map((a) => ({ type: '素材', name: a.name, id: `/assets/${a.id}`, updated_at: a.updated_at })),
  ].sort((x, y) => y.updated_at.localeCompare(x.updated_at)).slice(0, 8);

  return (
    <div>
      <PageHeader
        title="资料库"
        desc={favCount > 0 ? `已收藏 ${favCount} 个应用` : '把散落的 AI 应用、密钥与提示词收进一处'}
        action={
          <Link to="/apps" className="pt-1 text-[15px] font-medium text-primary">
            全部应用
          </Link>
        }
      />

      {loading ? (
        <RowSkeleton rows={4} />
      ) : (
        <>
          <SectionTitle>最近使用</SectionTitle>
          {recent.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">还没有记录，去添加第一条吧</p>
          ) : (
            <div className="-mx-4 overflow-x-auto px-4 md:-mx-10 md:px-10">
              <div className="flex gap-4 pb-2">
                {recent.map((r) => (
                  <Link key={r.type + r.id} to={r.id} className="w-24 shrink-0" title={`${r.name} · ${fmtDate(r.updated_at)}`}>
                    <InitialAvatar name={r.name} size={96} />
                    <p className="mt-2 line-clamp-2 text-[13px] leading-snug">{r.name}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{timeAgo(r.updated_at)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <SectionTitle>资料库</SectionTitle>
          <RowList>
            {LIBRARY_NAV.map(({ to, label, Icon }) => (
              <Link key={to} to={to} className="flex items-center gap-3 px-1 py-3">
                <InitialAvatar name={label} size={48} />
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="flex items-center gap-2 text-[16px]">
                    <Icon size={16} className="text-muted-foreground" />
                    {label}
                  </span>
                </div>
                <span className="shrink-0 text-[15px] text-muted-foreground">{counts[to] ?? 0}</span>
                <RowChevron />
              </Link>
            ))}
          </RowList>

          <SectionTitle className={cn(alerts.length > 0 && 'text-destructive')}>额度告警</SectionTitle>
          {alerts.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">额度都还挺充裕</p>
          ) : (
            <RowList>
              {alerts.map((a) => (
                <Link key={a.id} to="/apps/$appId" params={{ appId: a.id }} className="flex items-center gap-3 px-1 py-3">
                  <InitialAvatar name={a.name} size={48} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[16px]">{a.name}</div>
                    <div className="mt-1.5 max-w-xs">
                      <QuotaBar remaining={a.quota_remaining} total={a.quota_total} thresholdPct={threshold} unit={a.quota_unit} />
                    </div>
                  </div>
                  <RowChevron />
                </Link>
              ))}
            </RowList>
          )}
        </>
      )}
    </div>
  );
}
