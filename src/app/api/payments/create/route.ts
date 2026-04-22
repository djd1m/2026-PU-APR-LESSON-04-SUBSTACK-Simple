import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWidgetConfig } from "@/lib/payments/cloudpayments";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { publicationId, plan } = await req.json();
  if (!publicationId || !["MONTHLY", "YEARLY"].includes(plan)) {
    return NextResponse.json({ error: "Неверные параметры" }, { status: 400 });
  }

  const publication = await prisma.publication.findUnique({
    where: { id: publicationId },
  });

  if (!publication || !publication.paidEnabled) {
    return NextResponse.json({ error: "Платная подписка недоступна" }, { status: 400 });
  }

  // Check existing subscription
  const existing = await prisma.subscription.findUnique({
    where: {
      userId_publicationId: {
        userId: session.user.id,
        publicationId,
      },
    },
  });

  if (existing?.status === "ACTIVE") {
    return NextResponse.json({ error: "Вы уже подписаны" }, { status: 409 });
  }

  const amount = plan === "MONTHLY"
    ? publication.monthlyPrice!
    : (publication.yearlyPrice || publication.monthlyPrice! * 10);

  const platformFee = Math.round(amount * 0.1);

  const now = new Date();
  const periodEnd = new Date(now);
  if (plan === "MONTHLY") periodEnd.setMonth(periodEnd.getMonth() + 1);
  else periodEnd.setFullYear(periodEnd.getFullYear() + 1);

  const subscription = existing
    ? await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          status: "ACTIVE",
          plan,
          amountKopecks: amount,
          platformFeeKopecks: platformFee,
          provider: "CLOUDPAYMENTS",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelledAt: null,
        },
      })
    : await prisma.subscription.create({
        data: {
          userId: session.user.id,
          publicationId,
          provider: "CLOUDPAYMENTS",
          plan,
          amountKopecks: amount,
          platformFeeKopecks: platformFee,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });

  // Upgrade subscriber tier
  await prisma.subscriber.updateMany({
    where: {
      email: session.user.email,
      publicationId,
    },
    data: { tier: "PAID" },
  });

  const publicId = process.env.CLOUDPAYMENTS_PUBLIC_ID || "";
  const widgetConfig = getWidgetConfig(
    publicId,
    amount,
    `Подписка на «${publication.name}»`,
    session.user.email,
    subscription.id,
    plan
  );

  return NextResponse.json({ subscription, widgetConfig });
}
