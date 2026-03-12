import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getOctokit } from "@/lib/github";
import { NextRequest, NextResponse } from "next/server";
import { redirect } from "next/navigation";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!orgId) {
    return NextResponse.json({ error: "orgId is required" }, { status: 400 });
  }

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const octokit = getOctokit(session.accessToken);
  const isPersonal = org.githubOrgId.startsWith("personal:");

  const githubRepos = await octokit.paginate(
    isPersonal ? octokit.repos.listForAuthenticatedUser : octokit.repos.listForOrg,
    isPersonal
      ? { per_page: 100, affiliation: "owner" }
      : { org: org.name, per_page: 100, type: "all" as const }
  );

  await Promise.all(
    githubRepos.map((githubRepo) =>
      prisma.repository.upsert({
        where: { githubRepoId: String(githubRepo.id) },
        create: {
          githubRepoId: String(githubRepo.id),
          name: githubRepo.name,
          orgId: org.id,
        },
        update: { name: githubRepo.name },
      })
    )
  );

  redirect("/repos");
}
