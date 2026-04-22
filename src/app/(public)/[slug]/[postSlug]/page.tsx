import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { SubscribeWidget } from "@/components/subscribe/SubscribeWidget";
import { PaywallBlock } from "@/components/posts/PaywallBlock";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string; postSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, postSlug } = await params;
  const post = await prisma.post.findFirst({
    where: {
      slug: postSlug,
      publication: { slug },
      status: "PUBLISHED",
    },
    include: { publication: { select: { name: true } } },
  });
  if (!post) return {};
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || post.subtitle || "",
    openGraph: {
      title: post.title,
      description: post.excerpt || post.subtitle || "",
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      ...(post.coverImage ? { images: [post.coverImage] } : {}),
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug, postSlug } = await params;

  const post = await prisma.post.findFirst({
    where: {
      slug: postSlug,
      publication: { slug },
      status: "PUBLISHED",
    },
    include: {
      publication: {
        select: {
          id: true,
          name: true,
          slug: true,
          monthlyPrice: true,
          paidEnabled: true,
          author: { select: { name: true } },
        },
      },
    },
  });

  if (!post) notFound();

  // Check paid access
  let hasAccess = post.accessLevel === "FREE";
  if (!hasAccess) {
    const session = await getServerSession(authOptions);
    if (session) {
      const subscription = await prisma.subscription.findUnique({
        where: {
          userId_publicationId: {
            userId: session.user.id,
            publicationId: post.publication.id,
          },
        },
      });
      hasAccess = subscription?.status === "ACTIVE";
    }
  }

  // Prepare content — show teaser for paywalled posts
  const fullHtml = post.contentHtml || "";
  let displayHtml = fullHtml;
  if (!hasAccess && post.accessLevel === "PAID") {
    // Show first ~500 chars as teaser
    const cutoff = fullHtml.indexOf("</p>", 500);
    displayHtml = cutoff > 0 ? fullHtml.slice(0, cutoff + 4) : fullHtml.slice(0, 500);
  }

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.publishedAt?.toISOString(),
    author: {
      "@type": "Person",
      name: post.publication.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: "SubStack RU",
    },
    description: post.excerpt || post.subtitle || "",
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article>
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
          {post.subtitle && (
            <p className="text-xl text-gray-500 mb-4">{post.subtitle}</p>
          )}
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span>{post.publication.author.name}</span>
            {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
            {post.accessLevel === "PAID" && (
              <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded">
                Платный
              </span>
            )}
          </div>
        </header>

        <div className="relative">
          <div
            className="prose-article"
            dangerouslySetInnerHTML={{ __html: displayHtml }}
          />

          {!hasAccess && post.accessLevel === "PAID" && (
            <PaywallBlock
              publicationName={post.publication.name}
              monthlyPrice={post.publication.monthlyPrice}
              publicationSlug={post.publication.slug}
            />
          )}
        </div>
      </article>

      {/* Bottom subscribe CTA */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <SubscribeWidget publicationId={post.publication.id} />
      </div>
    </div>
  );
}
