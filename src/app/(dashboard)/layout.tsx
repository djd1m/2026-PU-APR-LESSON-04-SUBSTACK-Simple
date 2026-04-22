import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 bg-gray-50">
        <div className="p-6 lg:p-8 max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
