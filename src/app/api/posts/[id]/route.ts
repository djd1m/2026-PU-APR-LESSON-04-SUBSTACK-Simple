import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const post = await prisma.post.findUnique({
    where: { id },
    include: { publication: { select: { authorId: true } } },
  });

  if (!post || post.publication.authorId !== session.user.id) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const post = await prisma.post.findUnique({
    where: { id },
    include: { publication: { select: { authorId: true } } },
  });

  if (!post || post.publication.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const updated = await prisma.post.update({
    where: { id },
    data: {
      title: body.title ?? post.title,
      subtitle: body.subtitle !== undefined ? body.subtitle : post.subtitle,
      content: body.content !== undefined ? body.content : post.content,
      contentHtml: body.contentHtml !== undefined ? body.contentHtml : post.contentHtml,
      accessLevel: body.accessLevel ?? post.accessLevel,
      excerpt: body.excerpt !== undefined ? body.excerpt : post.excerpt,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const post = await prisma.post.findUnique({
    where: { id },
    include: { publication: { select: { authorId: true } } },
  });

  if (!post || post.publication.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ message: "Удалено" });
}
