import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function LandingPage() {
  return (
    <>
      <PublicHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-24 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
              Публикуй. Зарабатывай.
              <br />
              <span className="text-orange-500">Без посредников.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Российская платформа для независимых авторов. Создавайте email-рассылки,
              зарабатывайте на платных подписках и владейте своей аудиторией.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-4 bg-gray-900 text-white text-lg rounded-lg hover:bg-gray-800 font-medium"
              >
                Создать публикацию
              </Link>
              <Link
                href="/explore"
                className="px-8 py-4 border border-gray-300 text-gray-700 text-lg rounded-lg hover:bg-gray-50 font-medium"
              >
                Найти авторов
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Всё для авторов</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Редактор",
                  desc: "Удобный редактор с Markdown и форматированием. Пишите статьи за минуты.",
                },
                {
                  title: "Email-рассылка",
                  desc: "Каждая статья автоматически отправляется подписчикам. Открытия и клики отслеживаются.",
                },
                {
                  title: "Платные подписки",
                  desc: "Принимайте платежи через СБП и карты Mir. Комиссия всего 10%.",
                },
                {
                  title: "SEO",
                  desc: "Публичные страницы оптимизированы для Яндекса. Ваш контент находят читатели.",
                },
                {
                  title: "Аналитика",
                  desc: "Подписчики, доходы, открытия писем — всё в одном дашборде.",
                },
                {
                  title: "Экспорт аудитории",
                  desc: "Ваши подписчики — ваши. CSV-экспорт в любой момент.",
                },
              ].map((f) => (
                <div key={f.title} className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-gray-600 text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Начните бесплатно</h2>
            <p className="text-gray-600 mb-8">
              Создайте публикацию за 2 минуты. Платите только когда начнёте зарабатывать.
            </p>
            <Link
              href="/register"
              className="px-8 py-4 bg-orange-500 text-white text-lg rounded-lg hover:bg-orange-600 font-medium"
            >
              Создать публикацию
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
