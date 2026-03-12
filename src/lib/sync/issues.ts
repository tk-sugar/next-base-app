import { Octokit } from "@octokit/rest";
import { prisma } from "@/lib/prisma";

export async function syncIssues(
  repoId: string,
  owner: string,
  repo: string,
  octokit: Octokit,
  since?: Date
): Promise<number> {
  const issues = await octokit.paginate(octokit.issues.listForRepo, {
    owner,
    repo,
    state: "all",
    per_page: 100,
    ...(since ? { since: since.toISOString() } : {}),
  });

  // GitHub の Issues API は PR も含むので除外
  const onlyIssues = issues.filter((i) => !i.pull_request);

  let count = 0;
  for (const issue of onlyIssues) {
    const existing = await prisma.issue.findFirst({
      where: { repoId, githubIssueNumber: issue.number },
    });

    const data = {
      title: issue.title,
      body: issue.body ?? null,
      assignee: issue.assignee?.login ?? null,
      state: issue.state,
      labels: issue.labels
        .map((l) => (typeof l === "string" ? l : l.name ?? ""))
        .filter(Boolean),
      createdAt: new Date(issue.created_at),
      closedAt: issue.closed_at ? new Date(issue.closed_at) : null,
    };

    if (existing) {
      await prisma.issue.update({ where: { id: existing.id }, data });
    } else {
      await prisma.issue.create({
        data: { repoId, githubIssueNumber: issue.number, ...data },
      });
    }
    count++;
  }

  return count;
}
