import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function PublicationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const publication = await prisma.publication.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true, avatar: true } },
      _count: { select: { subscribers: { where: { status: "ACTIVE" } } } },
    },
  });

  if (!publication) notFound();

  return (
    <div>
      {/* Author header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          {publication.avatar && (
            <img
              src={publication.avatar}
              alt={publication.name}
              className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
            />
          )}
          <h1 className="text-2xl font-bold mb-1">
            <Link href={`/${slug}`}>{publication.name}</Link>
          </h1>
          {publication.author.name && (
            <p className="text-gray-500 text-sm mb-2">от {publication.author.name}</p>
          )}
          {publication.description && (
            <p className="text-gray-600 mb-4 max-w-md mx-auto">{publication.description}</p>
          )}
          <p className="text-sm text-gray-400">
            {publication._count.subscribers} подписчиков
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}
