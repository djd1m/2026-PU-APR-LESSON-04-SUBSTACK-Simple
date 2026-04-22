"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/subscribers")
      .then((r) => r.json())
      .then((data) => {
        setSubscribers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleExport() {
    window.open("/api/subscribers/export", "_blank");
  }

  const activeCount = subscribers.filter((s) => s.status === "ACTIVE").length;
  const paidCount = subscribers.filter((s) => s.tier === "PAID").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Подписчики</h1>
        <button
          onClick={handleExport}
          disabled={subscribers.length === 0}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Экспорт CSV
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="bg-white px-4 py-3 rounded-lg border border-gray-200">
          <span className="text-sm text-gray-500">Всего: </span>
          <span className="font-semibold">{subscribers.length}</span>
        </div>
        <div className="bg-white px-4 py-3 rounded-lg border border-gray-200">
          <span className="text-sm text-gray-500">Активных: </span>
          <span className="font-semibold">{activeCount}</span>
        </div>
        <div className="bg-white px-4 py-3 rounded-lg border border-gray-200">
          <span className="text-sm text-gray-500">Платных: </span>
          <span className="font-semibold">{paidCount}</span>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Загрузка...</p>
      ) : subscribers.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
          <p className="text-gray-600">Подписчиков пока нет</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Тип</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Статус</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Дата</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{sub.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      sub.tier === "PAID" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {sub.tier === "PAID" ? "Платный" : "Бесплатный"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      sub.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                      sub.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {sub.status === "ACTIVE" ? "Активен" :
                       sub.status === "PENDING" ? "Ожидание" : "Отписан"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(sub.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
