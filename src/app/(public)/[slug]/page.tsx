import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { SubscribeWidget } from "@/components/subscribe/SubscribeWidget";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pub = await prisma.publication.findUnique({ where: { slug } });
  if (!pub) return {};
  return {
    title: pub.name,
    description: pub.description || `Публикация ${pub.name} на SubStack RU`,
  };
}

export default async function PublicationPage({ params }: Props) {
  const { slug } = await params;
  const publication = await prisma.publication.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          subtitle: true,
          excerpt: true,
          accessLevel: true,
          publishedAt: true,
        },
      },
    },
  });

  if (!publication) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Subscribe widget */}
      <div className="mb-8">
        <SubscribeWidget publicationId={publication.id} />
      </div>

      {/* Posts */}
      {publication.posts.length === 0 ? (
        <p className="text-center text-gray-500 py-12">Статей пока нет</p>
      ) : (
        <div className="space-y-6">
          {publication.posts.map((post) => (
            <article key={post.id} className="border-b border-gray-100 pb-6">
              <Link href={`/${slug}/${post.slug}`} className="block group">
                <h2 className="text-xl font-semibold group-hover:underline mb-1">
                  {post.title}
                </h2>
                {post.subtitle && (
                  <p className="text-gray-600 mb-2">{post.subtitle}</p>
                )}
                {post.excerpt && (
                  <p className="text-gray-500 text-sm line-clamp-2">{post.excerpt}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                  {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
                  {post.accessLevel === "PAID" && (
                    <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded">
                      Платный
                    </span>
                  )}
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
