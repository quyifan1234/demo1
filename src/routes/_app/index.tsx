import { createFileRoute } from '@tanstack/react-router';
import { useApps, useKeys, useSkills, useAssets, usePrefs } from '../../lib/queries';
import { LibraryOverview } from '../../components/library-overview';
import { QueryError } from '../../components/bits';

export const Route = createFileRoute('/_app/')({
  component: Dashboard,
});

function Dashboard() {
  const apps = useApps();
  const keys = useKeys();
  const skills = useSkills();
  const assets = useAssets();
  const prefs = usePrefs();
  const queries = [apps, keys, skills, assets];
  if (queries.some((query) => query.isError)) {
    return <QueryError onRetry={() => { queries.forEach((query) => query.refetch()); }} />;
  }
  return <LibraryOverview apps={apps.data ?? []} keys={keys.data ?? []}
    skills={skills.data ?? []} assets={assets.data ?? []}
    threshold={prefs.data?.quota_threshold ?? 20}
    loading={queries.some((query) => query.isLoading)} />;
}
