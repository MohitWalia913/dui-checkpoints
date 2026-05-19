import { DashboardApiContent } from "@/components/dashboard/dashboard-api-content";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-6 md:p-8">
      <div>
        <p className="font-montserrat text-sm font-semibold uppercase tracking-wider text-[#F57E3A]">
          Welcome back
        </p>
        <h1 className="font-montserrat mt-2 text-3xl font-bold text-white md:text-4xl">
          Dashboard
        </h1>
        <p className="font-inter mt-3 max-w-2xl text-base leading-relaxed text-white/70">
          Live DUI checkpoint intelligence for California — KPIs and upcoming
          operations loaded from your REST API.
        </p>
      </div>

      <DashboardApiContent />
    </div>
  );
}
