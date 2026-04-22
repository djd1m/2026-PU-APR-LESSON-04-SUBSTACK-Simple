import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} SubStack RU. Все права защищены.
          </p>
          <nav className="flex gap-6 text-sm text-gray-500">
            <Link href="/explore" className="hover:text-gray-900">Авторы</Link>
            <a href="#" className="hover:text-gray-900">Политика конфиденциальности</a>
            <a href="#" className="hover:text-gray-900">Условия использования</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
