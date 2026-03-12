import { Octokit } from "@octokit/rest";
import { prisma } from "@/lib/prisma";

export async function syncReviews(
  repoId: string,
  owner: string,
  repo: string,
  octokit: Octokit
): Promise<number> {
  const pullRequests = await prisma.pullRequest.findMany({
    where: { repoId },
    select: { id: true, githubPrNumber: true },
  });

  let count = 0;
  for (const pr of pullRequests) {
    const reviews = await octokit.paginate(octokit.pulls.listReviews, {
      owner,
      repo,
      pull_number: pr.githubPrNumber,
      per_page: 100,
    });

    for (const review of reviews) {
      const githubReviewId = String(review.id);
      const existing = await prisma.review.findUnique({
        where: { githubReviewId },
      });

      const data = {
        reviewer: review.user?.login ?? "",
        comment: review.body ?? null,
        state: review.state,
        createdAt: new Date(review.submitted_at ?? Date.now()),
      };

      if (existing) {
        await prisma.review.update({ where: { githubReviewId }, data });
      } else {
        await prisma.review.create({
          data: { pullRequestId: pr.id, githubReviewId, ...data },
        });
      }
      count++;
    }
  }

  return count;
}
