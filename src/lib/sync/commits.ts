import { Octokit } from "@octokit/rest";
import { prisma } from "@/lib/prisma";

export async function syncCommits(
  repoId: string,
  owner: string,
  repo: string,
  octokit: Octokit,
  since?: Date
): Promise<number> {
  const commits = await octokit.paginate(octokit.repos.listCommits, {
    owner,
    repo,
    per_page: 100,
    ...(since ? { since: since.toISOString() } : {}),
  });

  let count = 0;
  for (const commit of commits) {
    const existing = await prisma.commit.findFirst({
      where: { repoId, sha: commit.sha },
    });
    if (existing) continue;

    await prisma.commit.create({
      data: {
        repoId,
        sha: commit.sha,
        author: commit.commit.author?.name ?? commit.author?.login ?? "",
        message: commit.commit.message,
        date: new Date(commit.commit.author?.date ?? Date.now()),
      },
    });
    count++;
  }

  return count;
}
