import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#E8ECF3] dark:bg-[#232733]">
      <div className="neu-raised rounded-3xl p-8 max-w-md w-full text-center bg-[#E8ECF3] dark:bg-[#232733] border border-white/60 dark:border-white/5 space-y-4">
        <div className="w-16 h-16 rounded-2xl neu-inset mx-auto flex items-center justify-center text-[#4F6AE8]">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-[#1E293B] dark:text-[#F1F5F9]">
          Page Not Found
        </h1>
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
          The page you requested does not exist or may have been relocated.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 neu-button-primary rounded-xl px-5 py-2.5 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}