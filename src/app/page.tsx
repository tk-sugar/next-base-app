import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/SignInButton";

export default async function Home() {
  const session = await auth();
  if (session) redirect("/repos");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold text-gray-900">GitHub AI Report</h1>
        <p className="max-w-md text-gray-600">
          GitHub の開発活動を AI が自動でレポートします
        </p>
        <SignInButton />
      </div>
    </div>
  );
}
