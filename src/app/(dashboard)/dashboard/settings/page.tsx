"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [publication, setPublication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [paidEnabled, setPaidEnabled] = useState(false);
  const [monthlyPrice, setMonthlyPrice] = useState("");

  useEffect(() => {
    fetch("/api/publications")
      .then((r) => r.json())
      .then((pubs) => {
        if (pubs.length > 0) {
          const pub = pubs[0];
          setPublication(pub);
          setName(pub.name);
          setSlug(pub.slug);
          setDescription(pub.description || "");
          setPaidEnabled(pub.paidEnabled);
          setMonthlyPrice(pub.monthlyPrice ? String(pub.monthlyPrice / 100) : "");
        }
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const endpoint = publication
      ? `/api/publications/${publication.id}`
      : "/api/publications";
    const method = publication ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug,
        description: description || undefined,
        paidEnabled,
        monthlyPrice: monthlyPrice ? Number(monthlyPrice) * 100 : null,
      }),
    });

    setSaving(false);

    if (res.ok) {
      const data = await res.json();
      setPublication(data);
      setMessage("Сохранено!");
      if (!publication) router.refresh();
    } else {
      const data = await res.json();
      setMessage(typeof data.error === "string" ? data.error : "Ошибка сохранения");
    }
  }

  if (loading) return <div className="text-gray-500">Загрузка...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {publication ? "Настройки публикации" : "Создать публикацию"}
      </h1>

      <form onSubmit={handleSave} className="max-w-lg space-y-5">
        {message && (
          <div className={`p-3 text-sm rounded-lg ${message === "Сохранено!" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
            {message}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-1">substackru.com/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              required
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={300}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none"
          />
        </div>

        <div className="border-t pt-5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={paidEnabled}
              onChange={(e) => setPaidEnabled(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300"
            />
            <span className="font-medium">Включить платную подписку</span>
          </label>
        </div>

        {paidEnabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Цена в месяц, ₽
            </label>
            <input
              type="number"
              value={monthlyPrice}
              onChange={(e) => setMonthlyPrice(e.target.value)}
              min={100}
              placeholder="300"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Комиссия платформы: 10%</p>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 font-medium"
        >
          {saving ? "Сохранение..." : "Сохранить"}
        </button>
      </form>
    </div>
  );
}
