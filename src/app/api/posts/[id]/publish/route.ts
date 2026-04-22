import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPostNotificationEmail } from "@/lib/email/send";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      publication: {
        select: { id: true, authorId: true, slug: true, name: true },
      },
    },
  });

  if (!post || post.publication.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (post.status === "PUBLISHED") {
    return NextResponse.json({ error: "Уже опубликовано" }, { status: 400 });
  }

  // Publish the post
  const published = await prisma.post.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  // Send emails to subscribers
  const subscriberFilter: any = {
    publicationId: post.publication.id,
    status: "ACTIVE",
  };
  if (post.accessLevel === "PAID") {
    subscriberFilter.tier = "PAID";
  }

  const subscribers = await prisma.subscriber.findMany({
    where: subscriberFilter,
  });

  // Create EmailSend records and send in batches
  for (const sub of subscribers) {
    try {
      const emailSend = await prisma.emailSend.create({
        data: {
          postId: post.id,
          subscriberId: sub.id,
        },
      });

      await sendPostNotificationEmail(
        sub.email,
        {
          title: post.title,
          contentHtml: (post.contentHtml || post.excerpt || "") as string,
          slug: post.slug,
          publicationSlug: post.publication.slug,
          publicationName: post.publication.name,
        },
        sub.unsubscribeToken,
        emailSend.trackingPixelId
      );

      await prisma.emailSend.update({
        where: { id: emailSend.id },
        data: { status: "SENT", sentAt: new Date() },
      });
    } catch (error) {
      console.error(`Email send failed for ${sub.email}:`, error);
    }
  }

  return NextResponse.json({
    ...published,
    emailsSent: subscribers.length,
  });
}
