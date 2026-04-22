"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    fetch(`/api/register?action=verify&token=${token}`)
      .then((res) => {
        setStatus(res.ok ? "success" : "error");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="text-center">
      {status === "loading" && <p className="text-gray-600">Подтверждаем email...</p>}
      {status === "success" && (
        <>
          <h2 className="text-2xl font-bold mb-4">Email подтверждён!</h2>
          <p className="text-gray-600 mb-6">Теперь вы можете войти в свой аккаунт.</p>
          <Link href="/login" className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
            Войти
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <h2 className="text-2xl font-bold mb-4 text-red-600">Ошибка</h2>
          <p className="text-gray-600">Неверная или устаревшая ссылка подтверждения.</p>
        </>
      )}
    </div>
  );
}
