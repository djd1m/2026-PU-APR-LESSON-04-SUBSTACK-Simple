import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pubId = req.nextUrl.searchParams.get("pubId");
  const status = req.nextUrl.searchParams.get("status");

  const publication = pubId
    ? await prisma.publication.findUnique({ where: { id: pubId } })
    : await prisma.publication.findFirst({ where: { authorId: session.user.id } });

  if (!publication || publication.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const posts = await prisma.post.findMany({
    where: {
      publicationId: publication.id,
      ...(status ? { status: status as any } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      accessLevel: true,
      publishedAt: true,
      createdAt: true,
      excerpt: true,
    },
  });

  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const publication = await prisma.publication.findFirst({
    where: { authorId: session.user.id },
  });
  if (!publication) {
    return NextResponse.json({ error: "Сначала создайте публикацию" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const data = postSchema.parse(body);

    let slug = slugify(data.title);
    const existing = await prisma.post.findUnique({
      where: { publicationId_slug: { publicationId: publication.id, slug } },
    });
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;

    const post = await prisma.post.create({
      data: {
        publicationId: publication.id,
        title: data.title,
        slug,
        subtitle: data.subtitle,
        content: data.content || undefined,
        accessLevel: data.accessLevel,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Post create error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
