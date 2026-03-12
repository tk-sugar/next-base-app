import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RepoSelector } from "@/components/RepoSelector";

export default async function ReposPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [userOrgs, userRepos] = await Promise.all([
    prisma.userOrganization.findMany({
      where: { userId },
      include: {
        organization: {
          include: { repositories: { orderBy: { name: "asc" } } },
        },
      },
      orderBy: { organization: { name: "asc" } },
    }),
    prisma.userRepository.findMany({ where: { userId } }),
  ]);

  const orgs = userOrgs.map(({ organization }) => ({
    id: organization.id,
    name: organization.name,
    repositories: organization.repositories.map((r) => ({ id: r.id, name: r.name })),
  }));

  const selectedRepoIds = new Set(userRepos.map((ur) => ur.repoId));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">リポジトリ選択</h2>
          <p className="mt-1 text-sm text-gray-500">
            レポートを生成するリポジトリを選択してください
          </p>
        </div>
        <div className="flex gap-2">
          <SyncOrgsButton />
        </div>
      </div>

      {orgs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">Organization が見つかりません</p>
          <p className="mt-1 text-sm text-gray-400">
            「GitHub から同期」ボタンで取得してください
          </p>
        </div>
      ) : (
        <RepoSelector orgs={orgs} selectedRepoIds={selectedRepoIds} />
      )}
    </div>
  );
}

function SyncOrgsButton() {
  return (
    <a
      href="/api/github/orgs"
      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      GitHub から同期
    </a>
  );
}
