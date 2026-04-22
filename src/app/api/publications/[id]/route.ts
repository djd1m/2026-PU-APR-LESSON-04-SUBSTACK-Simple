import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publicationSchema } from "@/lib/validators";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const publication = await prisma.publication.findUnique({
    where: { id },
    include: { author: { select: { name: true, avatar: true } } },
  });

  if (!publication) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  return NextResponse.json(publication);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const publication = await prisma.publication.findUnique({ where: { id } });

  if (!publication || publication.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = publicationSchema.partial().parse(body);

    const updated = await prisma.publication.update({
      where: { id },
      data: {
        ...data,
        paidEnabled: body.paidEnabled ?? publication.paidEnabled,
        monthlyPrice: body.monthlyPrice ?? publication.monthlyPrice,
        yearlyPrice: body.yearlyPrice ?? publication.yearlyPrice,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
