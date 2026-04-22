import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publicationSchema } from "@/lib/validators";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const publications = await prisma.publication.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(publications);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = publicationSchema.parse(body);

    const existing = await prisma.publication.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return NextResponse.json({ error: "Этот URL уже занят" }, { status: 409 });
    }

    const publication = await prisma.publication.create({
      data: {
        ...data,
        authorId: session.user.id,
      },
    });

    // Upgrade user role to AUTHOR if needed
    if (session.user.role === "READER") {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { role: "AUTHOR" },
      });
    }

    return NextResponse.json(publication, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Publication create error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
