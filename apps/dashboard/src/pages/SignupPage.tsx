import { useSearchParams } from "react-router";

export function SignupPage() {
  const [params] = useSearchParams();
  const plan = params.get("plan") ?? "starter";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans text-slate-900">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-slate-600">Plan: {plan}. Sign-up arrives in build step 5.</p>
      </div>
    </main>
  );
}
