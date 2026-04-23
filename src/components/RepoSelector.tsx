import Link from "next/link";

type Org = {
  id: string;
  name: string;
  repositories: { id: string; name: string }[];
};

export function RepoSelector({ orgs }: { orgs: Org[] }) {
  return (
    <div className="flex flex-col gap-6">
      {orgs
        .filter((org) => org.repositories.length > 0)
        .map((org) => (
          <div key={org.id} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                {org.name}
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {org.repositories.map((repo) => (
                <Link
                  key={repo.id}
                  href={`/repos/${repo.id}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 text-left transition-colors hover:border-gray-400 hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{repo.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {org.name}/{repo.name}
                    </p>
                  </div>
                  <svg
                    className="h-4 w-4 shrink-0 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
