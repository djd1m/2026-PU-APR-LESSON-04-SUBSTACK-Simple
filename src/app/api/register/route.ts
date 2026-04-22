import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { sendVerificationEmail } from "@/lib/email/send";

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");
  const token = req.nextUrl.searchParams.get("token");

  if (action === "verify" && token) {
    const user = await prisma.user.findUnique({ where: { verifyToken: token } });
    if (!user) {
      return NextResponse.json({ error: "Неверный токен" }, { status: 400 });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verifyToken: null },
    });
    return NextResponse.json({ message: "Email подтверждён" });
  }

  return NextResponse.json({ error: "Неверный запрос" }, { status: 400 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 409 }
      );
    }

    const passwordHash = await hash(data.password, 12);
    const verifyToken = randomUUID();

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name || null,
        verifyToken,
      },
    });

    await sendVerificationEmail(user.email, verifyToken);

    return NextResponse.json(
      { message: "Регистрация успешна. Проверьте email для подтверждения." },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
