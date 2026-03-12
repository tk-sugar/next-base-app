import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST: リポジトリの選択をトグル
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { repoId } = await req.json();
  if (!repoId) {
    return NextResponse.json({ error: "repoId is required" }, { status: 400 });
  }

  const userId = session.user.id;

  const existing = await prisma.userRepository.findUnique({
    where: { userId_repoId: { userId, repoId } },
  });

  if (existing) {
    await prisma.userRepository.delete({
      where: { userId_repoId: { userId, repoId } },
    });
    return NextResponse.json({ selected: false });
  } else {
    await prisma.userRepository.create({ data: { userId, repoId } });
    return NextResponse.json({ selected: true });
  }
}
