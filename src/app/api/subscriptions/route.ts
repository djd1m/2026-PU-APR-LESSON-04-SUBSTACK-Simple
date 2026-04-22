import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session.user.id },
    include: {
      publication: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(subscriptions);
}
