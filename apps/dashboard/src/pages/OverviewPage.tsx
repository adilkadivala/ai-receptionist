import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../layouts/AppLayout";
import { api } from "../lib/api";

export function OverviewPage() {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const { data, error } = await api.GET("/api/health");
      if (error || !data) throw new Error("The api didn't answer");
      return data;
    },
  });

  return (
    <>
      <PageHeader title="Overview">Calls answered, minutes used and anything that needs your attention.</PageHeader>
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Server status</h2>
        {health.isPending && <p className="mt-2 text-slate-500">Checking…</p>}
        {health.isError && <p className="mt-2 text-red-600">Can't reach the api. Is it running on port 8000?</p>}
        {health.data && (
          <p className="mt-2 text-slate-700">
            {health.data.missing.length === 0
              ? "Connected, and every provider key is set."
              : `Connected. Missing keys: ${health.data.missing.join(", ")}`}
          </p>
        )}
      </section>
    </>
  );
}
