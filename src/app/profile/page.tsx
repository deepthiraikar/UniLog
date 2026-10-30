import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <AppShell
      user={{
        name: session.user.name || "User",
        email: session.user.email || "",
        role: ((session.user as any)?.role || "STUDENT") as any,
      }}
    >
      <ProfileForm />
    </AppShell>
  );
}
