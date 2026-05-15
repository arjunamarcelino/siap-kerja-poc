"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  CAREER_ROLES,
  type AnalysisResult,
  type CareerRole,
  type RoadmapStep,
} from "@/types/analysis";

type PageState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "success"; data: AnalysisResult }
  | { status: "error"; message: string };

const LOADING_MESSAGES = [
  { at: 0, text: "Membaca CV Anda... / Reading your CV..." },
  { at: 5000, text: "Menganalisis pasar kerja... / Analyzing job market..." },
  { at: 20000, text: "Menyusun roadmap karier Anda... / Building your roadmap..." },
  { at: 45000, text: "Hampir selesai... / Almost there..." },
];

export default function AnalyzePage() {
  const [state, setState] = useState<PageState>({ status: "idle" });
  const [file, setFile] = useState<File | null>(null);
  const [career, setCareer] = useState<CareerRole | "">("");
  const [fileError, setFileError] = useState("");
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0].text);
  const abortRef = useRef<AbortController | null>(null);

  // Loading message rotation
  useEffect(() => {
    if (state.status !== "uploading") return;

    const timers = LOADING_MESSAGES.slice(1).map(({ at, text }) =>
      setTimeout(() => setLoadingMessage(text), at)
    );
    return () => timers.forEach(clearTimeout);
  }, [state.status]);

  // Warn before navigating away during analysis
  useEffect(() => {
    if (state.status !== "uploading") return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [state.status]);

  function validateFile(f: File): string | null {
    if (f.type !== "application/pdf") return "Please upload a PDF file.";
    if (f.size > 5 * 1024 * 1024) return "File must be under 5 MB.";
    return null;
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError("");
    const f = e.target.files?.[0];
    if (!f) {
      setFile(null);
      return;
    }
    const error = validateFile(f);
    if (error) {
      setFileError(error);
      setFile(null);
      return;
    }
    setFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !career) return;

    setState({ status: "uploading" });
    setLoadingMessage(LOADING_MESSAGES[0].text);

    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 90_000);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("career_aspiration", career);

      const res = await apiFetch<{ data: AnalysisResult }>("/api/ai/analyze-cv", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      setState({ status: "success", data: res.data });
    } catch (err) {
      if (controller.signal.aborted) {
        setState({
          status: "error",
          message: "Analysis timed out. Please try again.",
        });
      } else {
        setState({
          status: "error",
          message:
            err instanceof Error ? err.message : "Analysis failed. Please try again.",
        });
      }
    } finally {
      clearTimeout(timeout);
      abortRef.current = null;
    }
  }

  const canSubmit = file && career && state.status !== "uploading";

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
        {state.status === "success" ? (
          <AnalysisResults data={state.data} onReset={() => setState({ status: "idle" })} />
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-900">Analyze Your CV</h1>
            <p className="mt-2 text-slate-600">
              Upload your CV and select your target career to get a personalized skill
              gap analysis and learning roadmap.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {state.status === "error" && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {state.message}
                </div>
              )}

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Your CV (PDF)
                </label>
                <div className="mt-1.5">
                  {file ? (
                    <div className="flex items-center justify-between rounded-lg border border-slate-300 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <svg
                          className="h-5 w-5 text-red-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-sm font-medium text-slate-500 hover:text-slate-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 px-6 py-10 transition-colors hover:border-blue-400 hover:bg-blue-50/50">
                      <svg
                        className="h-10 w-10 text-slate-400"
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
                      <p className="mt-3 text-sm font-medium text-slate-600">
                        Click to upload your CV
                      </p>
                      <p className="mt-1 text-xs text-slate-500">PDF up to 5 MB</p>
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                  {fileError && (
                    <p className="mt-2 text-sm text-red-600">{fileError}</p>
                  )}
                </div>
              </div>

              {/* Career Selection */}
              <div>
                <label
                  htmlFor="career"
                  className="block text-sm font-medium text-slate-700"
                >
                  Target Career
                </label>
                <select
                  id="career"
                  value={career}
                  onChange={(e) => setCareer(e.target.value as CareerRole)}
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select a career path</option>
                  {CAREER_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex h-14 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {state.status === "uploading" ? (
                  <LoadingStepper />
                ) : (
                  "Analyze My CV"
                )}
              </button>
            </form>

            {state.status === "uploading" && (
              <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
                <LoadingSteps message={loadingMessage} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function LoadingStepper() {
  return (
    <span className="flex items-center gap-2">
      <svg
        className="h-5 w-5 animate-spin"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      Analyzing...
    </span>
  );
}

function LoadingSteps({ message }: { message: string }) {
  const steps = LOADING_MESSAGES.map((m) => m.text);
  const currentIndex = steps.indexOf(message);

  return (
    <div className="space-y-4">
      {steps.map((step, i) => {
        const isComplete = i < currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <div key={i} className="flex items-start gap-3">
            <div className="relative flex flex-col items-center">
              {isComplete ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                  <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : isCurrent ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                </div>
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200">
                  <div className="h-2 w-2 rounded-full bg-slate-400" />
                </div>
              )}
              {i < steps.length - 1 && (
                <div className={`mt-1 h-4 w-0.5 ${i < currentIndex ? "bg-blue-600" : "bg-slate-200"}`} />
              )}
            </div>
            <p className={`text-sm ${isCurrent ? "font-medium text-slate-900" : isComplete ? "text-slate-500" : "text-slate-400"}`}>
              {step}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function AnalysisResults({
  data,
  onReset,
}: {
  data: AnalysisResult;
  onReset: () => void;
}) {
  return (
    <div className="space-y-8">
      {/* Summary Card */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-blue-100">Target Role</p>
            <h2 className="mt-1 text-2xl font-bold">{data.target_role}</h2>
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
        <h3 className="text-lg font-semibold text-slate-900">Skills You Have</h3>
        {data.matching_skills.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            That&apos;s okay — everyone starts somewhere. Here&apos;s your path forward.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {data.matching_skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {skill}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Skills to Develop */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900">Skills to Develop</h3>
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

      {/* Learning Roadmap */}
      {data.roadmap.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-slate-900">
            Your Learning Path
          </h3>
          <div className="mt-4 space-y-0">
            {data.roadmap.map((step, i) => (
              <RoadmapCard key={step.step} step={step} isLast={i === data.roadmap.length - 1} />
            ))}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={onReset}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          Analyze Another CV
        </button>
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

function RoadmapCard({ step, isLast }: { step: RoadmapStep; isLast: boolean }) {
  return (
    <div className="flex gap-4">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
          {step.step}
        </div>
        {!isLast && <div className="h-full w-0.5 bg-blue-200" />}
      </div>

      {/* Content */}
      <div className="mb-6 flex-1 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between">
          <h4 className="font-semibold text-slate-900">{step.title}</h4>
          <span className="ml-2 whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {step.duration}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {step.description}
        </p>

        {step.skills_covered.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {step.skills_covered.map((skill) => (
              <span
                key={skill}
                className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {step.resources.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-slate-500">Resources</p>
            <ul className="mt-1 space-y-1">
              {step.resources.map((resource, i) => (
                <li key={i} className="text-xs text-slate-600">
                  • {resource}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
