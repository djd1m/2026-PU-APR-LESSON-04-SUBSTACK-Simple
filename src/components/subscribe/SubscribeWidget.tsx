"use client";

import { useState } from "react";

interface Props {
  publicationId: string;
}

export function SubscribeWidget({ publicationId }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const res = await fetch("/api/subscribers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, publicationId }),
    });

    const data = await res.json();

    if (res.ok) {
      setStatus("success");
      setMessage("Проверьте почту для подтверждения подписки!");
      setEmail("");
    } else {
      setStatus("error");
      setMessage(typeof data.error === "string" ? data.error : "Ошибка подписки");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <p className="text-green-700 font-medium">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="Ваш email"
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 font-medium whitespace-nowrap"
      >
        {status === "loading" ? "..." : "Подписаться"}
      </button>
      {status === "error" && (
        <p className="text-sm text-red-600 mt-1">{message}</p>
      )}
    </form>
  );
}
