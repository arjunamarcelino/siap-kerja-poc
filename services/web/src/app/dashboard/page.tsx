"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { AnalysisResult } from "@/types/analysis";

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisResult | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ data: User }>("/api/users/me")
      .then((res) => setUser(res.data))
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));

    // Fetch latest analysis (silently — don't block dashboard)
    apiFetch<{ data: AnalysisResult[] }>("/api/ai/analyses")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setLatestAnalysis(res.data[0]);
        }
      })
      .catch(() => {
        // Silently ignore — user just won't see "View Results"
      });
  }, [router]);

  async function handleLogout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore errors — clear local state regardless
    }
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center font-sans">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-1 flex-col font-sans">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <p className="text-xl font-bold tracking-tight text-slate-900">
            Siap<span className="text-blue-600">Kerja</span>
          </p>
          <button
            onClick={handleLogout}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome, {user.full_name}
        </h1>
        <p className="mt-2 text-slate-600">
          Your AI-powered career dashboard
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Upload CV — clickable */}
          <Link
            href="/dashboard/analyze"
            className="group rounded-2xl border border-slate-200 bg-white p-6 transition-colors hover:border-blue-300 hover:bg-blue-50/30"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">
              {latestAnalysis ? "Analyze CV" : "Upload CV"}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {latestAnalysis
                ? "Upload a new CV or analyze for a different career."
                : "Upload your CV to get started with AI-powered skill analysis."}
            </p>
            <p className="mt-3 text-xs font-medium text-blue-600 group-hover:text-blue-700">
              {latestAnalysis ? "New Analysis →" : "Get Started →"}
            </p>
          </Link>

          {/* Latest Analysis Results (if exists) */}
          {latestAnalysis ? (
            <Link
              href="/dashboard/results"
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition-colors hover:border-blue-300 hover:bg-blue-50/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">
                Latest Results
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {latestAnalysis.career_aspiration} — {latestAnalysis.skill_gaps?.length ?? 0} skill gaps identified
              </p>
              <p className="mt-3 text-xs font-medium text-blue-600 group-hover:text-blue-700">
                View Results →
              </p>
            </Link>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">
                Learning Roadmap
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Analyze your CV first to get a personalized learning roadmap.
              </p>
              <p className="mt-3 text-xs font-medium text-slate-400">
                Start by analyzing your CV
              </p>
            </div>
          )}

          {latestAnalysis && (
            <Link
              href="/dashboard/roadmap"
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition-colors hover:border-emerald-300 hover:bg-emerald-50/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">
                Learning Roadmap
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Track your progress through the learning path.
              </p>
              <p className="mt-3 text-xs font-medium text-emerald-600 group-hover:text-emerald-700">
                View Roadmap →
              </p>
            </Link>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">
              Job Matching
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Get matched with jobs that fit your skills and readiness.
            </p>
            <p className="mt-3 text-xs font-medium text-blue-600">
              Coming soon
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
