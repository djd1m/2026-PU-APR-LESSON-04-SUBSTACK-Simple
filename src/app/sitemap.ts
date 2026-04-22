import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const publications = await prisma.publication.findMany({
    select: { slug: true, updatedAt: true },
  });

  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: {
      slug: true,
      publishedAt: true,
      publication: { select: { slug: true } },
    },
  });

  const staticPages: MetadataRoute.Sitemap = [
    { url: appUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${appUrl}/explore`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ];

  const pubPages: MetadataRoute.Sitemap = publications.map((pub) => ({
    url: `${appUrl}/${pub.slug}`,
    lastModified: pub.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${appUrl}/${post.publication.slug}/${post.slug}`,
    lastModified: post.publishedAt || undefined,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...pubPages, ...postPages];
}
