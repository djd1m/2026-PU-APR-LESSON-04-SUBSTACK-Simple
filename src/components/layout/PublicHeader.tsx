"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function PublicHeader() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900">
          SubStack RU
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/explore" className="text-sm text-gray-600 hover:text-gray-900">
            Авторы
          </Link>
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Панель
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                Войти
              </Link>
              <Link
                href="/register"
                className="text-sm px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              >
                Создать публикацию
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
