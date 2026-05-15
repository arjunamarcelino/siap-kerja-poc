"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { JobMatch, JobMatchResponse } from "@/types/jobs";

type PageState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "no-analysis" }
  | { status: "success"; data: JobMatchResponse };

// Module-scoped cache for stale-while-revalidate on back-navigation
let cachedResult: JobMatchResponse | null = null;

function getInitialState(): PageState {
  if (cachedResult) {
    return { status: "success", data: cachedResult };
  }
  return { status: "loading" };
}

export default function JobMatchingPage() {
  const [state, setState] = useState<PageState>(getInitialState);
  const [slowLoad, setSlowLoad] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const controller = new AbortController();

    // Show slow-load message after 5 seconds
    timerRef.current = setTimeout(() => setSlowLoad(true), 5000);

    apiFetch<{ data: JobMatchResponse }>("/api/job-matches", {
      signal: controller.signal,
    })
      .then((res) => {
        if (controller.signal.aborted) return;
        cachedResult = res.data;
        setState({ status: "success", data: res.data });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error ? err.message : "Failed to load data";
        if (message.includes("No CV analysis found")) {
          setState({ status: "no-analysis" });
        } else if (!cachedResult) {
          // Only show error if we don't have cached data
          setState({ status: "error", message });
        }
      })
      .finally(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setSlowLoad(false);
      });

    return () => {
      controller.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-1 flex-col font-sans">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            href="/dashboard"
            className="text-xl font-bold tracking-tight text-slate-900"
          >
            Siap<span className="text-blue-600">Kerja</span>
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {state.status === "loading" && <LoadingSkeleton slowLoad={slowLoad} />}
        {state.status === "error" && <ErrorState message={state.message} />}
        {state.status === "no-analysis" && <NoAnalysisState />}
        {state.status === "success" && (
          <MatchResults data={state.data} />
        )}
      </main>
    </div>
  );
}

function LoadingSkeleton({ slowLoad }: { slowLoad: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Job Matching</h1>
        <p className="mt-1 text-slate-600">
          {slowLoad
            ? "Computing skill matches... This may take a moment."
            : "Finding jobs that match your skills..."}
        </p>
      </div>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-slate-200 bg-white p-6"
        >
          <div className="flex gap-6">
            <div className="h-12 w-16 rounded-lg bg-slate-200" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-2/3 rounded bg-slate-200" />
              <div className="h-4 w-1/3 rounded bg-slate-200" />
              <div className="flex gap-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-6 w-16 rounded-full bg-slate-200" />
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
        <svg
          className="h-8 w-8 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">
        Something went wrong
      </h2>
      <p className="mt-2 max-w-sm text-sm text-slate-600">{message}</p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

function NoAnalysisState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
        <svg
          className="h-8 w-8 text-blue-600"
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
      <h2 className="mt-4 text-lg font-semibold text-slate-900">
        No CV Analysis Yet
      </h2>
      <p className="mt-2 max-w-sm text-sm text-slate-600">
        Upload your CV and complete a skill analysis first to see matching jobs.
      </p>
      <Link
        href="/dashboard/analyze"
        className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Analyze Your CV
      </Link>
    </div>
  );
}

function MatchResults({ data }: { data: JobMatchResponse }) {
  if (data.matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
          <svg
            className="h-8 w-8 text-slate-400"
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
        <h2 className="mt-4 text-lg font-semibold text-slate-900">
          No Job Listings Found
        </h2>
        <p className="mt-2 max-w-sm text-sm text-slate-600">
          We couldn&apos;t find any job listings right now. Check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Job Matching</h1>
        <p className="mt-1 text-slate-600">
          {data.matches.length} jobs ranked by skill match
        </p>
      </div>

      <div className="space-y-4">
        {data.matches.map((job, index) => (
          <JobCard key={`${job.title}-${job.company}-${index}`} job={job} index={index} />
        ))}
      </div>

      <div className="flex gap-4 pt-4">
        <Link
          href="/dashboard/roadmap"
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          Continue Learning
        </Link>
        <Link
          href="/dashboard"
          className="flex flex-1 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

function getMatchStyle(pct: number) {
  if (pct >= 70) return { border: "border-l-emerald-500", badge: "bg-emerald-100 text-emerald-800", text: "text-emerald-700" };
  if (pct >= 40) return { border: "border-l-amber-500", badge: "bg-amber-100 text-amber-800", text: "text-amber-700" };
  return { border: "border-l-slate-300", badge: "bg-slate-100 text-slate-600", text: "text-slate-500" };
}

function JobCard({ job, index }: { job: JobMatch; index: number }) {
  const style = getMatchStyle(job.match_percentage);

  return (
    <div
      className={`rounded-xl border border-slate-200 border-l-4 ${style.border} bg-white p-6 transition-shadow hover:shadow-sm`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex gap-6">
        {/* Score zone */}
        <div className="flex w-20 flex-shrink-0 flex-col items-center justify-center">
          <span className={`text-3xl font-bold tabular-nums ${style.text}`}>
            {job.match_percentage}
          </span>
          <span className="text-xs text-slate-500">% match</span>
        </div>

        {/* Details zone */}
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-slate-900 truncate">
            {job.title}
          </h3>
          <p className="mt-0.5 text-sm text-slate-600">{job.company}</p>

          {/* Matched skills */}
          {job.matched_skills.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Your Skills
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {job.matched_skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing skills */}
          {job.missing_skills.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                To Develop
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {job.missing_skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
