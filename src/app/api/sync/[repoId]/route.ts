import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getOctokit } from "@/lib/github";
import { syncPullRequests } from "@/lib/sync/pullRequests";
import { syncIssues } from "@/lib/sync/issues";
import { syncCommits } from "@/lib/sync/commits";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ repoId: string }> }
) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { repoId } = await params;
  const body = await req.json().catch(() => ({}));
  const since: Date | undefined = body.since ? new Date(body.since) : undefined;

  const repo = await prisma.repository.findUnique({
    where: { id: repoId },
    include: { organization: true },
  });
  if (!repo) {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }

  const owner = repo.organization.name;
  const repoName = repo.name;
  const octokit = getOctokit(session.accessToken);

  const [prs, issues, commits] = await Promise.all([
    syncPullRequests(repoId, owner, repoName, octokit, since),
    syncIssues(repoId, owner, repoName, octokit, since),
    syncCommits(repoId, owner, repoName, octokit, since),
  ]);

  return NextResponse.json({ synced: { prs, issues, commits } });
}
