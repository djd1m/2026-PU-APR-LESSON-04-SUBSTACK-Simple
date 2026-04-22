import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subscribeSchema } from "@/lib/validators";
import { getResend } from "@/lib/email/resend";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const from = process.env.EMAIL_FROM || "onboarding@resend.dev";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const publication = await prisma.publication.findFirst({
    where: { authorId: session.user.id },
  });
  if (!publication) return NextResponse.json([]);

  const subscribers = await prisma.subscriber.findMany({
    where: { publicationId: publication.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      tier: true,
      status: true,
      createdAt: true,
      confirmedAt: true,
    },
  });

  return NextResponse.json(subscribers);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = subscribeSchema.parse(body);

    // Check if already subscribed
    const existing = await prisma.subscriber.findUnique({
      where: {
        email_publicationId: {
          email: data.email,
          publicationId: data.publicationId,
        },
      },
    });

    if (existing) {
      if (existing.status === "ACTIVE") {
        return NextResponse.json({ error: "Вы уже подписаны" }, { status: 409 });
      }
      // Re-subscribe if was unsubscribed
      if (existing.status === "UNSUBSCRIBED") {
        await prisma.subscriber.update({
          where: { id: existing.id },
          data: { status: "ACTIVE", confirmedAt: new Date() },
        });
        return NextResponse.json({ message: "Подписка восстановлена!" });
      }
    }

    const { randomUUID } = await import("crypto");
    const confirmToken = randomUUID();

    await prisma.subscriber.create({
      data: {
        email: data.email,
        publicationId: data.publicationId,
        confirmToken,
      },
    });

    const publication = await prisma.publication.findUnique({
      where: { id: data.publicationId },
      select: { name: true },
    });

    // Send confirmation email via Resend
    const confirmUrl = `${appUrl}/api/subscribers/confirm?token=${confirmToken}`;
    await getResend().emails.send({
      from,
      to: data.email,
      subject: `Подтвердите подписку на «${publication?.name}»`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Подтвердите подписку</h2>
          <p>Вы подписываетесь на «${publication?.name}» на SubStack RU.</p>
          <a href="${confirmUrl}" style="display: inline-block; padding: 12px 24px; background: #0f172a; color: #fff; text-decoration: none; border-radius: 6px;">
            Подтвердить подписку
          </a>
          <p style="margin-top: 16px; color: #666; font-size: 14px;">
            Если вы не подписывались, просто проигнорируйте это письмо.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ message: "Проверьте почту для подтверждения" }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Subscribe error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
