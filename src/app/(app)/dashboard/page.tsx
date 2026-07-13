import { DashboardCharts } from "@/components/dashboard-charts";
import { getDashboardData } from "@/lib/data";

export default async function DashboardPage() {
  const { courses, activityLogs, summary, setupStatus } = await getDashboardData();

  return (
    <div className="space-y-6">
      {!setupStatus.schemaReady ? (
        <section className="soft-ring rounded-[28px] border border-amber-300 bg-amber-50 p-5 text-amber-900">
          <p className="text-xs uppercase tracking-[0.28em]">Setup required</p>
          <h2 className="mt-2 text-2xl font-semibold">Supabase schema is not installed yet</h2>
          <p className="mt-3 text-sm leading-6">
            {setupStatus.message} After running that SQL in the Supabase SQL editor, refresh this page.
          </p>
        </section>
      ) : null}

      <DashboardCharts activityLogs={activityLogs} courses={courses} summary={summary} />
    </div>
  );
}
