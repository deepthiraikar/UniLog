import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { TimetableManager } from "./TimetableManager";

export default async function AdminTimetablePage() {
  const session = await auth();
  if (!session?.user || (session.user as any)?.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <AppShell
      user={{
        name: session.user.name || "Administrator",
        email: session.user.email || "",
        role: "ADMIN",
      }}
    >
      <TimetableManager />
    </AppShell>
  );
}
