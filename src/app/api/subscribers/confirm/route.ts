import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const action = req.nextUrl.searchParams.get("action");

  if (!token) {
    return NextResponse.json({ error: "Неверная ссылка" }, { status: 400 });
  }

  if (action === "unsubscribe") {
    // Unsubscribe via unsubscribeToken
    const subscriber = await prisma.subscriber.findUnique({
      where: { unsubscribeToken: token },
    });

    if (!subscriber) {
      return NextResponse.json({ error: "Подписка не найдена" }, { status: 404 });
    }

    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: { status: "UNSUBSCRIBED" },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/?unsubscribed=1`);
  }

  // Confirm subscription via confirmToken
  const subscriber = await prisma.subscriber.findUnique({
    where: { confirmToken: token },
  });

  if (!subscriber) {
    return NextResponse.json({ error: "Неверный токен" }, { status: 400 });
  }

  await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: {
      status: "ACTIVE",
      confirmedAt: new Date(),
      confirmToken: null,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return NextResponse.redirect(`${appUrl}/?subscribed=1`);
}
