import { Octokit } from "@octokit/rest";
import { prisma } from "@/lib/prisma";
import { syncReviews } from "./reviews";

export async function syncPullRequests(
  repoId: string,
  owner: string,
  repo: string,
  octokit: Octokit,
  since?: Date
): Promise<number> {
  const pulls = await octokit.paginate(octokit.pulls.list, {
    owner,
    repo,
    state: "all",
    per_page: 100,
    ...(since ? { sort: "updated", direction: "desc" } : {}),
  });

  let count = 0;
  for (const pr of pulls) {
    if (since && new Date(pr.updated_at) < since) break;

    const existing = await prisma.pullRequest.findFirst({
      where: { repoId, githubPrNumber: pr.number },
    });

    const data = {
      title: pr.title,
      body: pr.body ?? null,
      author: pr.user?.login ?? "",
      state: pr.state,
      labels: pr.labels.map((l) => l.name),
      createdAt: new Date(pr.created_at),
      mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
    };

    if (existing) {
      await prisma.pullRequest.update({ where: { id: existing.id }, data });
    } else {
      await prisma.pullRequest.create({
        data: { repoId, githubPrNumber: pr.number, ...data },
      });
    }
    count++;
  }

  await syncReviews(repoId, owner, repo, octokit);

  return count;
}
