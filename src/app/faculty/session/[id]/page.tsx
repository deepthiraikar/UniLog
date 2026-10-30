import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { LiveSessionMarking } from "./LiveSessionMarking";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LiveSessionPage({ params }: Props) {
  const session = await auth();
  if (!session?.user || (session.user as any)?.role !== "FACULTY") {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <AppShell
      user={{
        name: session.user.name || "Faculty",
        email: session.user.email || "",
        role: "FACULTY",
      }}
    >
      <LiveSessionMarking sessionId={id} />
    </AppShell>
  );
}
