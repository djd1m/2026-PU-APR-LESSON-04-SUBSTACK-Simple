"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { PostEditor } from "@/components/editor/PostEditor";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [accessLevel, setAccessLevel] = useState<"FREE" | "PAID">("FREE");
  const [content, setContent] = useState<any>(null);
  const [contentHtml, setContentHtml] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setPost(data);
        setTitle(data.title);
        setSubtitle(data.subtitle || "");
        setAccessLevel(data.accessLevel);
        setContent(data.content);
        setContentHtml(data.contentHtml || "");
        setStatus(data.status);
      });
  }, [id]);

  const handleEditorChange = useCallback((json: any, html: string) => {
    setContent(json);
    setContentHtml(html);
  }, []);

  async function save() {
    setSaving(true);
    await fetch(`/api/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, subtitle, content, contentHtml, accessLevel }),
    });
    setSaving(false);
  }

  async function publish() {
    setPublishing(true);
    await save();
    await fetch(`/api/posts/${id}/publish`, { method: "POST" });
    setPublishing(false);
    router.push("/dashboard/posts");
  }

  async function handleDelete() {
    if (!confirm("Удалить статью?")) return;
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    router.push("/dashboard/posts");
  }

  if (!post) return <div className="text-gray-500">Загрузка...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-medium text-gray-500">Редактирование</h1>
          <span className={`px-2 py-0.5 text-xs rounded ${
            status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
          }`}>
            {status === "PUBLISHED" ? "Опубликовано" : "Черновик"}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
          >
            Удалить
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
          {status !== "PUBLISHED" && (
            <button
              onClick={publish}
              disabled={publishing}
              className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {publishing ? "Публикация..." : "Опубликовать"}
            </button>
          )}
        </div>
      </div>

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

      <PostEditor content={post.content} onChange={handleEditorChange} />
    </div>
  );
}
