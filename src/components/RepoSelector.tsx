"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Repo = {
  id: string;
  name: string;
  orgName: string;
};

type Org = {
  id: string;
  name: string;
  repositories: { id: string; name: string }[];
};

export function RepoSelector({
  orgs,
  selectedRepoIds,
}: {
  orgs: Org[];
  selectedRepoIds: Set<string>;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(selectedRepoIds);
  const [isPending, startTransition] = useTransition();

  async function toggleRepo(repoId: string) {
    const res = await fetch("/api/repos/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoId }),
    });
    if (!res.ok) return;
    const { selected: isSelected } = await res.json();
    setSelected((prev) => {
      const next = new Set(prev);
      isSelected ? next.add(repoId) : next.delete(repoId);
      return next;
    });
    startTransition(() => router.refresh());
  }

  const selectedRepos: Repo[] = orgs.flatMap((org) =>
    org.repositories
      .filter((r) => selected.has(r.id))
      .map((r) => ({ id: r.id, name: r.name, orgName: org.name }))
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Org & repo list */}
      <div className="flex flex-col gap-6">
        {orgs.filter((org) => org.repositories.length > 0).map((org) => (
          <div key={org.id} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                {org.name}
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {org.repositories.map((repo) => {
                const isSelected = selected.has(repo.id);
                return (
                  <button
                    key={repo.id}
                    onClick={() => toggleRepo(repo.id)}
                    disabled={isPending}
                    className={`flex items-center justify-between rounded-lg border p-4 text-left transition-colors ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-400"
                    }`}
                  >
                    <div>
                      <p className={`font-medium ${isSelected ? "text-blue-700" : "text-gray-900"}`}>
                        {repo.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {org.name}/{repo.name}
                      </p>
                    </div>
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        isSelected
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selected repos */}
      {selectedRepos.length > 0 && (
        <div className="flex flex-col gap-3 border-t pt-6">
          <h3 className="text-sm font-semibold text-gray-700">
            選択中のリポジトリ ({selectedRepos.length}件)
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedRepos.map((repo) => (
              <Link
                key={repo.id}
                href={`/repos/${repo.id}`}
                className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-200 transition-colors"
              >
                {repo.orgName}/{repo.name}
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
