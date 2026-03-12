"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SyncButton({ repoId }: { repoId: string }) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSync() {
    setSyncing(true);
    setResult(null);
    try {
      const res = await fetch(`/api/sync/${repoId}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "同期に失敗しました");
      const { prs, issues, commits } = data.synced;
      setResult(`PR: ${prs} / Issue: ${issues} / Commit: ${commits} 件を同期`);
      router.refresh();
    } catch (e) {
      setResult(e instanceof Error ? e.message : "同期に失敗しました");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleSync}
        disabled={syncing}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {syncing ? "同期中..." : "データを同期"}
      </button>
      {result && <p className="text-xs text-gray-500">{result}</p>}
    </div>
  );
}
