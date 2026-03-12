import { prisma } from "./prisma";

export async function getRepoMetrics(repoId: string) {
  const staleCutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const [
    prTotal,
    prMerged,
    mergedPrs,
    prReviewPending,
    prStale,
    issueTotal,
    issueClosed,
    issueOpen,
    commitTotal,
    contributorGroups,
    reviewTotal,
    reviewerDist,
  ] = await Promise.all([
    prisma.pullRequest.count({ where: { repoId } }),
    prisma.pullRequest.count({ where: { repoId, mergedAt: { not: null } } }),
    prisma.pullRequest.findMany({
      where: { repoId, mergedAt: { not: null } },
      select: { createdAt: true, mergedAt: true },
    }),
    // レビュー待ち: open かつレビューなし
    prisma.pullRequest.count({
      where: { repoId, state: "open", mergedAt: null, reviews: { none: {} } },
    }),
    // 長期未マージ: open かつ 14 日以上経過
    prisma.pullRequest.count({
      where: { repoId, state: "open", mergedAt: null, createdAt: { lt: staleCutoff } },
    }),
    prisma.issue.count({ where: { repoId } }),
    prisma.issue.count({ where: { repoId, state: "closed" } }),
    prisma.issue.count({ where: { repoId, state: "open" } }),
    prisma.commit.count({ where: { repoId } }),
    prisma.commit.groupBy({ by: ["author"], where: { repoId } }),
    prisma.review.count({ where: { pullRequest: { repoId } } }),
    prisma.review.groupBy({
      by: ["reviewer"],
      where: { pullRequest: { repoId } },
      _count: { reviewer: true },
      orderBy: { _count: { reviewer: "desc" } },
      take: 10,
    }),
  ]);

  const avgMergeTimeHours =
    mergedPrs.length > 0
      ? mergedPrs.reduce(
          (sum, pr) => sum + (pr.mergedAt!.getTime() - pr.createdAt.getTime()),
          0
        ) /
        mergedPrs.length /
        (1000 * 60 * 60)
      : null;

  return {
    pr: {
      total: prTotal,
      merged: prMerged,
      avgMergeTimeHours,
      reviewPending: prReviewPending,
      stale: prStale,
    },
    issue: {
      total: issueTotal,
      closed: issueClosed,
      open: issueOpen,
    },
    commit: {
      total: commitTotal,
      contributors: contributorGroups.length,
    },
    review: {
      total: reviewTotal,
      byReviewer: reviewerDist.map((r) => ({
        reviewer: r.reviewer,
        count: r._count.reviewer,
      })),
    },
  };
}

export type RepoMetrics = Awaited<ReturnType<typeof getRepoMetrics>>;
