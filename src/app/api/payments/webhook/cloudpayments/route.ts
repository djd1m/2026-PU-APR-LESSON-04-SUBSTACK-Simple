import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      TransactionId,
      Amount,
      Status,
      SubscriptionId,
      AccountId,
      Data,
    } = body;

    const subscriptionId = Data?.subscriptionId;
    if (!subscriptionId) {
      return NextResponse.json({ code: 0 }); // CloudPayments expects {code: 0} for success
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      return NextResponse.json({ code: 13, message: "Subscription not found" });
    }

    const platformFee = Math.round(Amount * 100 * 0.1);
    const authorPayout = Math.round(Amount * 100) - platformFee;

    if (Status === "Completed") {
      // Successful payment
      await prisma.payment.create({
        data: {
          subscriptionId: subscription.id,
          provider: "CLOUDPAYMENTS",
          externalId: String(TransactionId),
          amountKopecks: Math.round(Amount * 100),
          platformFeeKopecks: platformFee,
          authorPayoutKopecks: authorPayout,
          status: "SUCCEEDED",
          paidAt: new Date(),
          rawWebhook: body,
        },
      });

      // Extend subscription period
      const periodEnd = new Date();
      if (subscription.plan === "MONTHLY") periodEnd.setMonth(periodEnd.getMonth() + 1);
      else periodEnd.setFullYear(periodEnd.getFullYear() + 1);

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "ACTIVE",
          externalId: SubscriptionId ? String(SubscriptionId) : undefined,
          currentPeriodStart: new Date(),
          currentPeriodEnd: periodEnd,
        },
      });

      // Ensure subscriber tier is PAID
      const user = await prisma.user.findUnique({
        where: { id: subscription.userId },
      });
      if (user) {
        await prisma.subscriber.updateMany({
          where: {
            email: user.email,
            publicationId: subscription.publicationId,
          },
          data: { tier: "PAID" },
        });
      }
    } else {
      // Failed payment
      await prisma.payment.create({
        data: {
          subscriptionId: subscription.id,
          provider: "CLOUDPAYMENTS",
          externalId: String(TransactionId),
          amountKopecks: Math.round(Amount * 100),
          platformFeeKopecks: platformFee,
          authorPayoutKopecks: authorPayout,
          status: "FAILED",
          rawWebhook: body,
        },
      });

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: "PAST_DUE" },
      });
    }

    return NextResponse.json({ code: 0 });
  } catch (error) {
    console.error("CloudPayments webhook error:", error);
    return NextResponse.json({ code: 0 });
  }
}
