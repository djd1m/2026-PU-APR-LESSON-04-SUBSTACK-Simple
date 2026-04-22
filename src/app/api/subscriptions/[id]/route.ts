import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cancelRecurrent } from "@/lib/payments/cloudpayments";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { action } = await req.json();

  const subscription = await prisma.subscription.findUnique({ where: { id } });

  if (!subscription || subscription.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (action === "cancel") {
    // Cancel recurring in payment provider
    if (subscription.externalId && subscription.provider === "CLOUDPAYMENTS") {
      try {
        await cancelRecurrent(subscription.externalId);
      } catch (e) {
        console.error("Failed to cancel recurrent:", e);
      }
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
