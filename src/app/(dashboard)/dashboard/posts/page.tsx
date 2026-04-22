"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default function PostsListPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "DRAFT" | "PUBLISHED">("all");

  useEffect(() => {
    const query = tab === "all" ? "" : `?status=${tab}`;
    fetch(`/api/posts${query}`)
      .then((r) => r.json())
      .then((data) => {
        setPosts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tab]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Статьи</h1>
        <Link
          href="/dashboard/posts/new"
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800"
        >
          + Новая статья
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { key: "all" as const, label: "Все" },
          { key: "DRAFT" as const, label: "Черновики" },
          { key: "PUBLISHED" as const, label: "Опубликованные" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setLoading(true); }}
            className={`px-3 py-1 text-sm rounded-lg ${
              tab === t.key ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Загрузка...</p>
      ) : posts.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
          <p className="text-gray-600 mb-4">Нет статей</p>
          <Link href="/dashboard/posts/new" className="text-gray-900 font-medium hover:underline">
            Написать первую статью
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/dashboard/posts/${post.id}/edit`}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-medium">{post.title}</p>
                <p className="text-sm text-gray-500">
                  {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {post.accessLevel === "PAID" && (
                  <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded">
                    Платный
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 text-xs rounded ${
                    post.status === "PUBLISHED"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {post.status === "PUBLISHED" ? "Опубликовано" : "Черновик"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
