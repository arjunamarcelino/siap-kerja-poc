"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import type {
  AnalysisResult,
  RoadmapProgressData,
  RoadmapStep,
  StepProgress,
  ToggleRequest,
} from "@/types/analysis";

type PageState =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "error"; message: string }
  | {
      status: "loading-progress";
      analysisId: string;
      analyses: AnalysisResult[];
    }
  | {
      status: "ready";
      analysisId: string;
      analyses: AnalysisResult[];
      selected: AnalysisResult;
      progress: RoadmapProgressData;
    };

export default function RoadmapPage() {
  const [state, setState] = useState<PageState>({ status: "loading" });
  const progressFetchAbortRef = useRef<AbortController | null>(null);
  const patchAbortRef = useRef<AbortController | null>(null);
  const patchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [patchError, setPatchError] = useState<string | null>(null);

  function fetchProgress(analysisId: string, analyses?: AnalysisResult[]) {
    progressFetchAbortRef.current?.abort();
    const controller = new AbortController();
    progressFetchAbortRef.current = controller;

    apiFetch<{ data: RoadmapProgressData }>(
      `/api/ai/analyses/${analysisId}/progress`,
      { signal: controller.signal }
    )
      .then((res) => {
        if (controller.signal.aborted) return;
        setState((prev) => {
          const allAnalyses =
            analyses ??
            ("analyses" in prev ? prev.analyses : ([] as AnalysisResult[]));
          const selected = allAnalyses.find((a) => a.id === analysisId);
          if (!selected) return prev;

          // Auto-expand first incomplete step
          const firstIncomplete = findFirstIncompleteStep(
            selected.roadmap,
            res.data.progress
          );
          setExpandedStep(firstIncomplete);

          return {
            status: "ready",
            analysisId,
            analyses: allAnalyses,
            selected,
            progress: res.data,
          };
        });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message:
            err instanceof Error ? err.message : "Failed to load progress",
        });
      });
  }

  // Initial load
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
        const latest = res.data[0];
        setState({
          status: "loading-progress",
          analysisId: latest.id,
          analyses: res.data,
        });
        fetchProgress(latest.id, res.data);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Failed to load data",
        });
      });

    return () => {
      controller.abort();
      progressFetchAbortRef.current?.abort();
      patchAbortRef.current?.abort();
      if (patchTimerRef.current) clearTimeout(patchTimerRef.current);
    };
  }, []);

  function handleAnalysisChange(newId: string) {
    // Abort in-flight requests and cancel pending timers
    progressFetchAbortRef.current?.abort();
    patchAbortRef.current?.abort();
    if (patchTimerRef.current) {
      clearTimeout(patchTimerRef.current);
      patchTimerRef.current = null;
    }
    setPatchError(null);

    setState((prev) => {
      if (!("analyses" in prev)) return prev;
      return {
        status: "loading-progress",
        analysisId: newId,
        analyses: prev.analyses,
      };
    });

    fetchProgress(newId);
  }

  function handleToggle(req: ToggleRequest) {
    if (state.status !== "ready") return;

    const prevProgress = state.progress;
    const analysisId = state.analysisId;
    setPatchError(null);

    // Optimistic update
    setState((prev) => {
      if (prev.status !== "ready" || prev.analysisId !== analysisId)
        return prev;
      const newProgress = applyOptimisticToggle(
        prev.progress,
        req,
        prev.selected.roadmap
      );
      return { ...prev, progress: newProgress };
    });

    // Debounced PATCH
    if (patchTimerRef.current) clearTimeout(patchTimerRef.current);

    patchTimerRef.current = setTimeout(() => {
      patchAbortRef.current?.abort();
      const controller = new AbortController();
      patchAbortRef.current = controller;

      apiFetch<{ data: RoadmapProgressData }>(
        `/api/ai/analyses/${analysisId}/progress`,
        {
          method: "PATCH",
          body: JSON.stringify(req),
          signal: controller.signal,
        }
      )
        .then((res) => {
          if (controller.signal.aborted) return;
          // Apply server's authoritative state
          setState((prev) => {
            if (prev.status !== "ready" || prev.analysisId !== analysisId)
              return prev;
            return { ...prev, progress: res.data };
          });
        })
        .catch((err) => {
          if (controller.signal.aborted) return;
          // Rollback on error
          setState((prev) => {
            if (prev.status !== "ready" || prev.analysisId !== analysisId)
              return prev;
            return { ...prev, progress: prevProgress };
          });
          setPatchError(
            err instanceof Error ? err.message : "Could not save progress"
          );
        });
    }, 300);
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

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        {state.status === "loading" && (
          <div className="flex items-center justify-center py-20">
            <p className="text-slate-500">Loading your roadmap...</p>
          </div>
        )}

        {state.status === "error" && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.message}
          </div>
        )}

        {state.status === "empty" && <EmptyRoadmap />}

        {state.status === "loading-progress" && (
          <div>
            <AnalysisSelector
              analyses={state.analyses}
              selectedId={state.analysisId}
              onChange={handleAnalysisChange}
            />
            <div className="mt-8 flex items-center justify-center py-12">
              <p className="text-slate-500">Loading progress...</p>
            </div>
          </div>
        )}

        {state.status === "ready" && (
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Learning Roadmap
            </h1>
            <p className="mt-1 text-slate-600">
              Track your progress through the learning path for{" "}
              <span className="font-medium text-slate-900">
                {state.selected.career_aspiration}
              </span>
            </p>

            {state.analyses.length > 1 && (
              <AnalysisSelector
                analyses={state.analyses}
                selectedId={state.analysisId}
                onChange={handleAnalysisChange}
              />
            )}

            <ProgressBar percentage={state.progress.progress_percentage} />

            {patchError && (
              <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {patchError}
              </div>
            )}

            <div className="mt-8">
              {state.selected.roadmap.map((step, i) => (
                <RoadmapStepCard
                  key={step.step}
                  step={step}
                  stepProgress={
                    state.progress.progress[String(step.step)] ?? null
                  }
                  isLast={i === state.selected.roadmap.length - 1}
                  isExpanded={expandedStep === step.step}
                  onToggleExpand={() =>
                    setExpandedStep(
                      expandedStep === step.step ? null : step.step
                    )
                  }
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyRoadmap() {
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
            d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
          />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">
        No Roadmap Yet
      </h2>
      <p className="mt-2 max-w-sm text-sm text-slate-600">
        Analyze your CV to get a personalized learning roadmap with actionable
        steps to reach your career goals.
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

function AnalysisSelector({
  analyses,
  selectedId,
  onChange,
}: {
  analyses: AnalysisResult[];
  selectedId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="mt-4">
      <label
        htmlFor="analysis-select"
        className="block text-sm font-medium text-slate-700"
      >
        Analysis
      </label>
      <select
        id="analysis-select"
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        {analyses.map((a) => (
          <option key={a.id} value={a.id}>
            {a.career_aspiration} —{" "}
            {new Date(a.created_at).toLocaleDateString()}
          </option>
        ))}
      </select>
    </div>
  );
}

function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">Overall Progress</span>
        <span className="font-semibold text-emerald-600">
          {percentage}%
        </span>
      </div>
      <div
        className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Overall progress: ${percentage}%`}
      >
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function RoadmapStepCard({
  step,
  stepProgress,
  isLast,
  isExpanded,
  onToggleExpand,
  onToggle,
}: {
  step: RoadmapStep;
  stepProgress: StepProgress | null;
  isLast: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggle: (req: ToggleRequest) => void;
}) {
  const skillsDone = stepProgress?.skills_done ?? [];
  const resourcesDone = stepProgress?.resources_done ?? [];
  const isComplete = stepProgress?.completed_at != null;
  const totalItems = step.skills_covered.length + step.resources.length;
  const doneItems = skillsDone.length + resourcesDone.length;

  return (
    <div className="flex gap-4">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <button
          onClick={onToggleExpand}
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
            isComplete
              ? "bg-emerald-500 text-white"
              : doneItems > 0
                ? "bg-blue-600 text-white"
                : "bg-slate-200 text-slate-500"
          }`}
          aria-label={`Step ${step.step}: ${step.title}`}
        >
          {isComplete ? (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            step.step
          )}
        </button>
        {!isLast && (
          <div
            className={`h-full w-0.5 ${isComplete ? "bg-emerald-300" : "bg-slate-200"}`}
          />
        )}
      </div>

      {/* Content */}
      <div className="mb-6 flex-1">
        <button
          onClick={onToggleExpand}
          className="w-full rounded-xl border border-slate-200 bg-white p-5 text-left transition-colors hover:border-slate-300"
          aria-expanded={isExpanded}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900">{step.title}</h4>
              {!isExpanded && totalItems > 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  {doneItems}/{totalItems} items completed
                </p>
              )}
            </div>
            <div className="ml-2 flex items-center gap-2">
              <span className="whitespace-nowrap rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                {step.duration}
              </span>
              <svg
                className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </button>

        {isExpanded && (
          <div className="mt-2 rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm leading-relaxed text-slate-600">
              {step.description}
            </p>

            {step.skills_covered.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Skills
                </p>
                <div className="mt-2 space-y-2">
                  {step.skills_covered.map((skill) => {
                    const checked = skillsDone.includes(skill);
                    return (
                      <label
                        key={skill}
                        className="flex cursor-pointer items-center gap-3"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            onToggle({
                              step: step.step,
                              type: "skill",
                              value: skill,
                              done: !checked,
                            })
                          }
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20"
                        />
                        <span
                          className={`text-sm ${checked ? "text-slate-400 line-through" : "text-slate-700"}`}
                        >
                          {skill}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {step.resources.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Resources
                </p>
                <div className="mt-2 space-y-2">
                  {step.resources.map((resource, idx) => {
                    const checked = resourcesDone.includes(idx);
                    return (
                      <label
                        key={idx}
                        className="flex cursor-pointer items-start gap-3"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            onToggle({
                              step: step.step,
                              type: "resource",
                              index: idx,
                              done: !checked,
                            })
                          }
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                        />
                        <span
                          className={`text-sm ${checked ? "text-slate-400 line-through" : "text-slate-700"}`}
                        >
                          {resource}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function applyOptimisticToggle(
  current: RoadmapProgressData,
  req: ToggleRequest,
  roadmap: RoadmapStep[]
): RoadmapProgressData {
  const stepKey = String(req.step);
  const existing = current.progress[stepKey] ?? {
    skills_done: [],
    resources_done: [],
    completed_at: null,
  };

  let newSkillsDone = [...existing.skills_done];
  let newResourcesDone = [...existing.resources_done];

  if (req.type === "skill") {
    if (req.done) {
      if (!newSkillsDone.includes(req.value)) {
        newSkillsDone.push(req.value);
      }
    } else {
      newSkillsDone = newSkillsDone.filter((s) => s !== req.value);
    }
  } else {
    if (req.done) {
      if (!newResourcesDone.includes(req.index)) {
        newResourcesDone.push(req.index);
      }
    } else {
      newResourcesDone = newResourcesDone.filter((i) => i !== req.index);
    }
  }

  // Evaluate completion
  const step = roadmap.find((s) => s.step === req.step);
  const allSkillsDone = step
    ? newSkillsDone.length >= step.skills_covered.length
    : false;
  const allResourcesDone = step
    ? newResourcesDone.length >= step.resources.length
    : false;
  const completedAt =
    allSkillsDone && allResourcesDone ? new Date().toISOString() : null;

  const newStepProgress: StepProgress = {
    skills_done: newSkillsDone,
    resources_done: newResourcesDone,
    completed_at:
      allSkillsDone && allResourcesDone
        ? existing.completed_at ?? completedAt
        : null,
  };

  const newProgress = { ...current.progress, [stepKey]: newStepProgress };

  // Recompute percentage
  let totalItems = 0;
  let doneItems = 0;
  for (const s of roadmap) {
    totalItems += s.skills_covered.length + s.resources.length;
    const sp = newProgress[String(s.step)];
    if (sp) {
      doneItems += sp.skills_done.length + sp.resources_done.length;
    }
  }
  const pct = totalItems === 0 ? 100 : Math.round((doneItems / totalItems) * 1000) / 10;

  return { progress: newProgress, progress_percentage: pct };
}

function findFirstIncompleteStep(
  roadmap: RoadmapStep[],
  progress: Record<string, StepProgress>
): number | null {
  for (const step of roadmap) {
    const sp = progress[String(step.step)];
    if (!sp || sp.completed_at == null) {
      return step.step;
    }
  }
  return roadmap.length > 0 ? roadmap[0].step : null;
}
