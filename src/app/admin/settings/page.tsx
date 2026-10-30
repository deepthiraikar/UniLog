import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { SettingsManager } from "./SettingsManager";

export default async function AdminSettingsPage() {
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
      <SettingsManager />
    </AppShell>
  );
}
