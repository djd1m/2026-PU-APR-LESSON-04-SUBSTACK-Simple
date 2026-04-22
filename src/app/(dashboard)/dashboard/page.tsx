"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Главная</h1>
        <Link
          href="/dashboard/posts/new"
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800"
        >
          + Новая статья
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Подписчики", value: stats?.subscriberCount ?? "—" },
          { label: "Платные", value: stats?.paidCount ?? "—" },
          { label: "Доход (мес)", value: stats?.revenue ?? "—" },
          { label: "Открытия", value: stats?.openRate ?? "—" },
        ].map((s) => (
          <div key={s.label} className="bg-white p-5 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {!loading && !stats?.hasPublication && (
        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
          <h2 className="text-lg font-semibold mb-2">Создайте публикацию</h2>
          <p className="text-gray-600 mb-4">Начните с настройки вашей публикации.</p>
          <Link
            href="/dashboard/settings"
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            Настроить публикацию
          </Link>
        </div>
      )}
    </div>
  );
}
