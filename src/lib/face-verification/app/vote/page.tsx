import { redirect } from "next/navigation";
import { getSession } from "@/lib/verification/session";

export default async function VotePage() {
  const session = await getSession();

  // Guard against reaching /vote without ever passing verification.
  if (!session || session.status !== "approved") {
    redirect("/verify");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Ballot</h1>
      <p className="max-w-sm text-sm text-slate-600">
        Placeholder voting page. Identity verified for student {session.studentId}.
      </p>
    </main>
  );
}
