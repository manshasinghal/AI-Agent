"use client";

import { useState } from "react";

export default function Home() {
  const [problem, setProblem] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!problem.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Server error: ${res.status}`);
      }

      const data = await res.json();
      localStorage.setItem("report", JSON.stringify(data));
      window.location.href = "/report";
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 font-sans">
      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-xl">
        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              AI Planning Agent
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
              Turn problems into{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                action plans
              </span>
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Describe any challenge and get a structured, AI-generated roadmap
              in seconds.
            </p>
          </div>

          {/* Textarea */}
          <textarea
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 disabled:opacity-50"
            rows={5}
            placeholder="Describe your problem… e.g. Build a creator marketplace platform"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            disabled={isLoading}
          />

          {/* Error message */}
          {error && (
            <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <svg
                className="mt-0.5 h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              {error}
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || !problem.trim()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/20 transition hover:from-amber-300 hover:to-orange-300 hover:shadow-amber-400/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {isLoading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
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
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Generating plan…
              </>
            ) : (
              <>
                <span>⚡</span>
                Generate Plan
              </>
            )}
          </button>

          {/* Pipeline indicator */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
            {["Planner", "Insight", "Execution"].map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span
                  className={`font-medium transition-colors ${
                    isLoading ? "text-amber-400 animate-pulse" : "text-slate-400"
                  }`}
                >
                  {step}
                </span>
                {i < 2 && (
                  <svg
                    className="h-3 w-3 text-slate-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}