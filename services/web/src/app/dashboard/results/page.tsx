"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { AnalysisResult } from "@/types/analysis";

type PageState =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "error"; message: string }
  | { status: "ready"; analyses: AnalysisResult[]; selected: AnalysisResult };

export default function ResultsPage() {
  const [state, setState] = useState<PageState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    apiFetch<{ data: AnalysisResult[] }>("/api/ai/analyses", {
      signal: controller.signal,
    })
      .then((res) => {
        if (controller.signal.aborted) return;
        if (!res.data || res.data.length === 0) {
          setState({ status: "empty" });
          return;
        }
        setState({
          status: "ready",
          analyses: res.data,
          selected: res.data[0],
        });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Failed to load data",
        });
      });

    return () => controller.abort();
  }, []);

  function handleAnalysisChange(id: string) {
    if (state.status !== "ready") return;
    const selected = state.analyses.find((a) => a.id === id);
    if (selected) {
      setState({ ...state, selected });
    }
  }

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

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        {state.status === "loading" && (
          <div className="flex items-center justify-center py-20">
            <p className="text-slate-500">Loading results...</p>
          </div>
        )}

        {state.status === "error" && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.message}
          </div>
        )}

        {state.status === "empty" && (
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
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No Analysis Results Yet
            </h2>
            <p className="mt-2 max-w-sm text-sm text-slate-600">
              Upload your CV and select a target career to get a personalized
              skill analysis.
            </p>
            <Link
              href="/dashboard/analyze"
              className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Analyze Your CV
            </Link>
          </div>
        )}

        {state.status === "ready" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Analysis Results
              </h1>
              <p className="mt-1 text-slate-600">
                Your AI-powered career skill analysis
              </p>
            </div>

            {state.analyses.length > 1 && (
              <div>
                <label
                  htmlFor="result-select"
                  className="block text-sm font-medium text-slate-700"
                >
                  Analysis
                </label>
                <select
                  id="result-select"
                  value={state.selected.id}
                  onChange={(e) => handleAnalysisChange(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {state.analyses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.career_aspiration} —{" "}
                      {new Date(a.created_at).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <AnalysisDetails data={state.selected} />
          </div>
        )}
      </main>
    </div>
  );
}

function AnalysisDetails({ data }: { data: AnalysisResult }) {
  return (
    <div className="space-y-8">
      {/* Summary Card */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-blue-100">Target Role</p>
            <h2 className="mt-1 text-2xl font-bold">
              {data.career_aspiration}
            </h2>
          </div>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
            {data.experience_level}
          </span>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-blue-100">
          {data.cv_summary}
        </p>
        <div className="mt-4 flex gap-6 text-sm">
          <div>
            <p className="text-blue-200">Jobs Analyzed</p>
            <p className="text-lg font-semibold">{data.jobs_analyzed}</p>
          </div>
          <div>
            <p className="text-blue-200">Estimated Duration</p>
            <p className="text-lg font-semibold">{data.estimated_duration}</p>
          </div>
        </div>
      </div>

      {/* Skills You Have */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900">
          Skills You Have
        </h3>
        {data.matching_skills.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            That&apos;s okay — everyone starts somewhere. Here&apos;s your path
            forward.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {data.matching_skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {skill}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Skills to Develop */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900">
          Skills to Develop
        </h3>
        {data.skill_gaps.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            Great news — your skills are well-aligned with this role!
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {data.skill_gaps.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Required Skills */}
      {data.required_skills.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-slate-900">
            Required Skills for This Role
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.required_skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Link
          href="/dashboard/analyze"
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          Analyze Another CV
        </Link>
        <Link
          href="/dashboard/roadmap"
          className="flex flex-1 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          View Learning Roadmap
        </Link>
      </div>
    </div>
  );
}
