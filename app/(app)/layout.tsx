import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { AppShell } from "@/components/layout/AppShell";

function ShellFallback() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] pl-[240px]">
      <div className="p-8 text-sm text-gray-500">Chargement…</div>
    </div>
  );
}

export default async function AppSectionLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login");
  return (
    <Suspense fallback={<ShellFallback />}>
      <AppShell user={user}>{children}</AppShell>
    </Suspense>
  );
}
