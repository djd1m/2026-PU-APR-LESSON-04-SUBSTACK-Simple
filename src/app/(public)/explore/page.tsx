import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Авторы",
  description: "Найдите интересных авторов на SubStack RU",
};

export default async function ExplorePage() {
  const publications = await prisma.publication.findMany({
    include: {
      author: { select: { name: true } },
      _count: {
        select: {
          subscribers: { where: { status: "ACTIVE" } },
          posts: { where: { status: "PUBLISHED" } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Авторы</h1>

      {publications.length === 0 ? (
        <p className="text-gray-500 text-center py-12">Авторов пока нет</p>
      ) : (
        <div className="space-y-4">
          {publications.map((pub) => (
            <Link
              key={pub.id}
              href={`/${pub.slug}`}
              className="block bg-white p-6 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-4">
                {pub.avatar ? (
                  <img src={pub.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                    {pub.name[0]}
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="font-semibold text-lg">{pub.name}</h2>
                  {pub.author.name && (
                    <p className="text-sm text-gray-500">{pub.author.name}</p>
                  )}
                  {pub.description && (
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{pub.description}</p>
                  )}
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>{pub._count.subscribers} подписчиков</span>
                    <span>{pub._count.posts} статей</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
