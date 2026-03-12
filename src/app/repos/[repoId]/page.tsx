import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getRepoMetrics, RepoMetrics } from "@/lib/metrics";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SyncButton } from "@/components/SyncButton";

export default async function RepoDashboardPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  void (await auth());

  const repo = await prisma.repository.findUnique({
    where: { id: repoId },
    include: { organization: true },
  });
  if (!repo) notFound();

  const metrics = await getRepoMetrics(repoId);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/repos" className="text-sm text-gray-500 hover:text-gray-700">
            ← リポジトリ一覧
          </Link>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">
            {repo.organization.name}/{repo.name}
          </h2>
        </div>
        <SyncButton repoId={repoId} />
      </div>

      {/* PR 指標 */}
      <MetricSection title="PR 指標">
        <StatCard label="PR 作成数" value={metrics.pr.total} />
        <StatCard label="PR マージ数" value={metrics.pr.merged} />
        <StatCard
          label="平均マージ時間"
          value={formatMergeTime(metrics.pr.avgMergeTimeHours)}
          unit=""
        />
        <StatCard
          label="レビュー待ち PR"
          value={metrics.pr.reviewPending}
          alert={metrics.pr.reviewPending > 0}
        />
        <StatCard
          label="長期未マージ PR"
          value={metrics.pr.stale}
          alert={metrics.pr.stale > 0}
        />
      </MetricSection>

      {/* Issue 指標 */}
      <MetricSection title="Issue 指標">
        <StatCard label="Issue 作成数" value={metrics.issue.total} />
        <StatCard label="Issue クローズ数" value={metrics.issue.closed} />
        <StatCard
          label="未解決 Issue"
          value={metrics.issue.open}
          alert={metrics.issue.open > 0}
        />
      </MetricSection>

      {/* Commit 指標 */}
      <MetricSection title="Commit 指標">
        <StatCard label="コミット数" value={metrics.commit.total} />
        <StatCard label="Contributor 数" value={metrics.commit.contributors} />
      </MetricSection>

      {/* レビュー指標 */}
      <MetricSection title="レビュー指標">
        <StatCard label="レビュー数" value={metrics.review.total} />
      </MetricSection>

      {/* レビュワー分布 */}
      {metrics.review.byReviewer.length > 0 && (
        <ReviewerDistribution data={metrics.review.byReviewer} />
      )}
    </div>
  );
}

function MetricSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  alert,
}: {
  label: string;
  value: number | string;
  unit?: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border bg-white p-5 shadow-sm ${
        alert ? "border-amber-300 bg-amber-50" : ""
      }`}
    >
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold ${
          alert ? "text-amber-600" : "text-gray-900"
        }`}
      >
        {value}
        {unit !== undefined ? (
          <span className="ml-1 text-sm font-normal text-gray-400">{unit}</span>
        ) : null}
      </p>
    </div>
  );
}

function ReviewerDistribution({
  data,
}: {
  data: RepoMetrics["review"]["byReviewer"];
}) {
  const max = Math.max(...data.map((d) => d.count));
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        レビュワー分布
      </h3>
      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3">
          {data.map((d) => (
            <div key={d.reviewer} className="flex items-center gap-3">
              <span className="w-32 shrink-0 truncate text-sm font-medium text-gray-700">
                {d.reviewer}
              </span>
              <div className="flex flex-1 items-center gap-2">
                <div className="h-5 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${(d.count / max) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sm text-gray-500">{d.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatMergeTime(hours: number | null): string {
  if (hours === null) return "—";
  if (hours < 1) return `${Math.round(hours * 60)}分`;
  if (hours < 24) return `${Math.round(hours)}時間`;
  return `${Math.round(hours / 24)}日`;
}
