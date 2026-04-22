import Link from "next/link";
import { formatRubles } from "@/lib/utils";

interface Props {
  publicationName: string;
  monthlyPrice: number | null;
  publicationSlug: string;
}

export function PaywallBlock({ publicationName, monthlyPrice, publicationSlug }: Props) {
  return (
    <div className="relative mt-[-80px] pt-20">
      {/* Gradient fade */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-white" />

      {/* Paywall CTA */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">
          Эта статья доступна платным подписчикам
        </h3>
        <p className="text-gray-600 mb-4">
          Оформите подписку на «{publicationName}»{" "}
          {monthlyPrice ? `от ${formatRubles(monthlyPrice)}/мес` : ""}
        </p>
        <Link
          href={`/${publicationSlug}`}
          className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
        >
          Оформить подписку
        </Link>
        <p className="text-sm text-gray-400 mt-3">
          Уже подписаны?{" "}
          <Link href="/login" className="text-gray-900 hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
