"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeLoginType, setActiveLoginType] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const executeSignIn = async (
    userEmail: string,
    userPass: string,
    roleLabel?: string,
    targetRolePath?: string
  ) => {
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: userEmail.trim().toLowerCase(),
        password: userPass,
        redirect: false,
      });

      if (res?.error) {
        console.error("[Login] Sign-in failed:", res.error);
        setErrorMsg("Invalid credentials. Please verify your email and password.");
        toast.error("Authentication failed. Please check your credentials.");
        setLoading(false);
        setActiveLoginType(null);
      } else {
        toast.success(roleLabel ? `Signed in as ${roleLabel}! Redirecting...` : "Login successful! Redirecting...");
        
        let destination = callbackUrl && callbackUrl !== "/login" ? callbackUrl : "/dashboard";
        if (targetRolePath && destination === "/dashboard") {
          destination = targetRolePath;
        }

        // Full page redirect ensures new auth cookies are attached to all subsequent SSR queries
        window.location.href = destination;
      }
    } catch (err: any) {
      console.error("[Login] Sign-in error:", err);
      setErrorMsg("An unexpected error occurred during sign in.");
      toast.error("Error signing in. Try again.");
      setLoading(false);
      setActiveLoginType(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActiveLoginType("manual");

    let target = "/dashboard";
    const em = email.toLowerCase();
    if (em.includes("admin")) target = "/admin";
    else if (em.includes("faculty")) target = "/faculty";
    else if (em.includes("aarav") || em.includes("rohan") || em.includes("student")) target = "/student";

    await executeSignIn(email, password, undefined, target);
  };

  const handleInstantDemoLogin = async (
    demoEmail: string,
    roleName: string,
    typeKey: string,
    directPath: string
  ) => {
    setEmail(demoEmail);
    setPassword("password123");
    setActiveLoginType(typeKey);
    await executeSignIn(demoEmail, "password123", roleName, directPath);
  };

  return (
    <div className="w-full max-w-md">
      {/* Brand header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-sm mb-4">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          UNILOG
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          College Attendance Management System
        </p>
      </div>

      {/* Login Card */}
      <div className="rounded-2xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Institutional Sign In
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Enter your college credentials or select a 1-click demo account
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-xl p-3 mb-5 flex items-center gap-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-0.5">
              Institutional Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                placeholder="name@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-0.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-xl py-2.5 px-4 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all shadow-sm shadow-blue-500/20"
          >
            {loading && activeLoginType === "manual" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Accounts */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              1-Click Demo Accounts
            </p>
            <span className="text-[11px] text-slate-400">Password: password123</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleInstantDemoLogin("admin@college.edu", "Admin", "admin", "/admin")}
              className="w-full rounded-xl py-2.5 px-3.5 text-xs flex items-center justify-between border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-900 dark:text-slate-100 text-left transition-all cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 shrink-0 border border-blue-100 dark:border-blue-900/40">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    Admin: Dr. Meera Iyer
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    admin@college.edu
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {loading && activeLoginType === "admin" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                ) : (
                  <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200/60 dark:border-blue-800/60 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    Login
                    <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </div>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleInstantDemoLogin("faculty@college.edu", "Faculty", "faculty", "/faculty")}
              className="w-full rounded-xl py-2.5 px-3.5 text-xs flex items-center justify-between border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-900 dark:text-slate-100 text-left transition-all cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 shrink-0 border border-emerald-100 dark:border-emerald-900/40">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    Faculty: Prof. Sharma
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    faculty@college.edu
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {loading && activeLoginType === "faculty" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                ) : (
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200/60 dark:border-emerald-800/60 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    Login
                    <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </div>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleInstantDemoLogin("aarav@college.edu", "Student", "student", "/student")}
              className="w-full rounded-xl py-2.5 px-3.5 text-xs flex items-center justify-between border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-900 dark:text-slate-100 text-left transition-all cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 shrink-0 border border-amber-100 dark:border-amber-900/40">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    Student: Aarav Patel
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    aarav@college.edu (CSE001)
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {loading && activeLoginType === "student" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                ) : (
                  <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200/60 dark:border-amber-800/60 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    Login
                    <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
      <Suspense
        fallback={
          <div className="w-full max-w-md h-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse shadow-sm" />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
