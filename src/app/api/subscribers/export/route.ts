import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const publication = await prisma.publication.findFirst({
    where: { authorId: session.user.id },
  });
  if (!publication) {
    return NextResponse.json({ error: "Публикация не найдена" }, { status: 404 });
  }

  const subscribers = await prisma.subscriber.findMany({
    where: { publicationId: publication.id },
    orderBy: { createdAt: "desc" },
  });

  const header = "email,tier,status,subscribed_at,confirmed_at\n";
  const rows = subscribers
    .map(
      (s) =>
        `${s.email},${s.tier},${s.status},${s.createdAt.toISOString()},${s.confirmedAt?.toISOString() || ""}`
    )
    .join("\n");

  const csv = header + rows;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="subscribers-${Date.now()}.csv"`,
    },
  });
}
