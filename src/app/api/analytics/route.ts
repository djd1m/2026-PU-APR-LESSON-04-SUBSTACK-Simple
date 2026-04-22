import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRubles } from "@/lib/utils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const publication = await prisma.publication.findFirst({
    where: { authorId: session.user.id },
  });

  if (!publication) {
    return NextResponse.json({
      hasPublication: false,
      subscriberCount: 0,
      paidCount: 0,
      revenue: "0 ₽",
      openRate: "—",
    });
  }

  const [subscriberCount, paidCount, payments, emailSends] = await Promise.all([
    prisma.subscriber.count({
      where: { publicationId: publication.id, status: "ACTIVE" },
    }),
    prisma.subscriber.count({
      where: { publicationId: publication.id, status: "ACTIVE", tier: "PAID" },
    }),
    prisma.payment.aggregate({
      where: {
        subscription: { publicationId: publication.id },
        status: "SUCCEEDED",
        paidAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { authorPayoutKopecks: true },
    }),
    prisma.emailSend.findMany({
      where: {
        post: { publicationId: publication.id },
        status: { in: ["SENT", "DELIVERED"] },
      },
      select: { openedAt: true },
    }),
  ]);

  const revenue = formatRubles(payments._sum.authorPayoutKopecks || 0);
  const totalSent = emailSends.length;
  const totalOpened = emailSends.filter((e) => e.openedAt).length;
  const openRate = totalSent > 0 ? `${Math.round((totalOpened / totalSent) * 100)}%` : "—";

  return NextResponse.json({
    hasPublication: true,
    subscriberCount,
    paidCount,
    revenue,
    openRate,
  });
}
