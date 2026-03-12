import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getOctokit } from "@/lib/github";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

export async function GET() {
  const session = await auth();
  if (!session?.accessToken || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const octokit = getOctokit(session.accessToken);

  // 自分のリポジトリ・collaborator・org メンバーとして見えるリポジトリを全取得
  const allRepos = await octokit.paginate(octokit.repos.listForAuthenticatedUser, {
    affiliation: "owner,collaborator,organization_member",
    per_page: 100,
  });

  // オーナー (user / org) 別にグループ化
  const ownerMap = new Map<
    string,
    { login: string; githubOrgId: string; repos: typeof allRepos }
  >();

  for (const repo of allRepos) {
    const githubOrgId =
      repo.owner.type === "User"
        ? `personal:${repo.owner.id}`
        : String(repo.owner.id);

    if (!ownerMap.has(githubOrgId)) {
      ownerMap.set(githubOrgId, { login: repo.owner.login, githubOrgId, repos: [] });
    }
    ownerMap.get(githubOrgId)!.repos.push(repo);
  }

  // オーナーごとに Organization・Repository を upsert
  await Promise.all(
    [...ownerMap.values()].map(async (owner) => {
      const org = await prisma.organization.upsert({
        where: { githubOrgId: owner.githubOrgId },
        create: { githubOrgId: owner.githubOrgId, name: owner.login },
        update: { name: owner.login },
      });

      await prisma.userOrganization.upsert({
        where: {
          userId_organizationId: {
            userId: session.user.id,
            organizationId: org.id,
          },
        },
        create: { userId: session.user.id, organizationId: org.id },
        update: {},
      });

      await Promise.all(
        owner.repos.map((repo) =>
          prisma.repository.upsert({
            where: { githubRepoId: String(repo.id) },
            create: {
              githubRepoId: String(repo.id),
              name: repo.name,
              orgId: org.id,
            },
            update: { name: repo.name },
          })
        )
      );
    })
  );

  redirect("/repos");
}
