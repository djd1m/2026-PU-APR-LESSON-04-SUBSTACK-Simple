"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PostEditor } from "@/components/editor/PostEditor";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [accessLevel, setAccessLevel] = useState<"FREE" | "PAID">("FREE");
  const [content, setContent] = useState<any>(null);
  const [contentHtml, setContentHtml] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [hasPublication, setHasPublication] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/publications")
      .then((r) => r.json())
      .then((pubs) => setHasPublication(Array.isArray(pubs) && pubs.length > 0))
      .catch(() => setHasPublication(false));
  }, []);

  const handleEditorChange = useCallback((json: any, html: string) => {
    setContent(json);
    setContentHtml(html);
  }, []);

  async function saveDraft() {
    if (!title.trim()) return;
    setSaving(true);
    setError("");

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, subtitle, content, accessLevel }),
    });

    const post = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(typeof post.error === "string" ? post.error : "Ошибка сохранения");
      return;
    }

    // Save HTML too
    await fetch(`/api/posts/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentHtml }),
    });
    router.push(`/dashboard/posts/${post.id}/edit`);
  }

  async function publish() {
    if (!title.trim()) return;
    setPublishing(true);
    setError("");

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, subtitle, content, accessLevel }),
    });

    const post = await res.json();
    if (!res.ok) {
      setError(typeof post.error === "string" ? post.error : "Ошибка сохранения");
      setPublishing(false);
      return;
    }

    // Save HTML
    await fetch(`/api/posts/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentHtml }),
    });

    // Publish
    await fetch(`/api/posts/${post.id}/publish`, { method: "POST" });
    setPublishing(false);
    router.push("/dashboard/posts");
  }

  if (hasPublication === null) return <div className="text-gray-500">Загрузка...</div>;

  if (!hasPublication) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
          <h2 className="text-lg font-semibold mb-2">Сначала создайте публикацию</h2>
          <p className="text-gray-600 mb-4">Чтобы писать статьи, нужна публикация.</p>
          <Link
            href="/dashboard/settings"
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            Создать публикацию
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium text-gray-500">Новая статья</h1>
        <div className="flex gap-2">
          <button
            onClick={saveDraft}
            disabled={saving || !title.trim()}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {saving ? "Сохранение..." : "Сохранить черновик"}
          </button>
          <button
            onClick={publish}
            disabled={publishing || !title.trim()}
            className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {publishing ? "Публикация..." : "Опубликовать"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg mb-4">{error}</div>
      )}

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Заголовок"
        className="w-full text-3xl font-bold outline-none mb-2 placeholder:text-gray-300"
      />
      <input
        type="text"
        value={subtitle}
        onChange={(e) => setSubtitle(e.target.value)}
        placeholder="Подзаголовок (необязательно)"
        className="w-full text-lg text-gray-500 outline-none mb-6 placeholder:text-gray-300"
      />

      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Доступ:</span>
          <select
            value={accessLevel}
            onChange={(e) => setAccessLevel(e.target.value as "FREE" | "PAID")}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="FREE">Все подписчики</option>
            <option value="PAID">Только платные</option>
          </select>
        </label>
      </div>

      <PostEditor onChange={handleEditorChange} />
    </div>
  );
}
