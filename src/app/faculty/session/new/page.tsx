import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { NewSessionForm } from "./NewSessionForm";

export default async function NewSessionPage() {
  const session = await auth();
  if (!session?.user || (session.user as any)?.role !== "FACULTY") {
    redirect("/login");
  }

  return (
    <AppShell
      user={{
        name: session.user.name || "Faculty",
        email: session.user.email || "",
        role: "FACULTY",
      }}
    >
      <NewSessionForm />
    </AppShell>
  );
}
