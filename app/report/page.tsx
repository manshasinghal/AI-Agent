"use client";
import { useEffect, useState } from "react";

export  interface ReportData {
  problemBreakdown: string;
  stakeholders: string;
  solutionApproach: string;
  actionPlan: string;
}

function normaliseField(value: unknown): string {
  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    const result = value
      .map((item, index) => {
        if (typeof item === "string") return `${index + 1}. ${item}`;

        if (typeof item === "object" && item !== null) {
          const fields = Object.entries(item as Record<string, unknown>)
            .map(([key, val]) => {
              const label = key.charAt(0).toUpperCase() + key.slice(1);
              return `${label}: ${normaliseField(val)}`;
            })
            .join(" | ");
          return `${index + 1}. ${fields}`;
        }

        return `${index + 1}. ${String(item)}`;
      })
      .join("\n");

    if (result.includes("[object Object]")) return JSON.stringify(value, null, 2);
    return result;
  }

  if (typeof value === "object" && value !== null) {
    const result = Object.entries(value as Record<string, unknown>)
      .map(([key, val]) => {
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        return `${label}: ${normaliseField(val)}`;
      })
      .join("\n");

    if (result.includes("[object Object]")) return JSON.stringify(value, null, 2);
    return result;
  }

  return String(value);
}

const handleDocx = async (data: ReportData) => {
  const { exportDocx } = await import("../components/lib/exports/docx");
  exportDocx(data);
};

const handlePDF = async (data: ReportData) => {
  const { exportPDF } = await import("../components/lib/exports/pdf");
  exportPDF(data);
};

const SECTION_CONFIG: {
  key: keyof ReportData;
  title: string;
  icon: string;
  accent: string;
  border: string;
  badge: string;
}[] = [
  {
    key: "problemBreakdown",
    title: "Problem Breakdown",
    icon: "◈",
    accent: "from-rose-500 to-pink-500",
    border: "border-rose-500/60",
    badge: "bg-rose-500/10 text-rose-400",
  },
  {
    key: "stakeholders",
    title: "Stakeholders",
    icon: "◎",
    accent: "from-sky-500 to-cyan-400",
    border: "border-sky-500/60",
    badge: "bg-sky-500/10 text-sky-400",
  },
  {
    key: "solutionApproach",
    title: "Solution Approach",
    icon: "◇",
    accent: "from-violet-500 to-purple-500",
    border: "border-violet-500/60",
    badge: "bg-violet-500/10 text-violet-400",
  },
  {
    key: "actionPlan",
    title: "Action Plan",
    icon: "◆",
    accent: "from-amber-500 to-orange-400",
    border: "border-amber-500/60",
    badge: "bg-amber-500/10 text-amber-400",
  },
];

export default function Report() {
  const [data, setData] = useState<ReportData | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editInstruction, setEditInstruction] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [versions, setVersions] = useState<Record<string, string[]>>({});
  const [docxLoading, setDocxLoading] = useState(false);

// 1. useEffect — add a double-parse guard in case localStorage holds a stringified string
useEffect(() => {
  const stored = localStorage.getItem("report");
  if (stored) {
    let parsed = JSON.parse(stored);

    // Guard: if JSON.parse returned a string, it was double-serialized — parse again
    if (typeof parsed === "string") {
      parsed = JSON.parse(parsed);
    }

    setData({
      problemBreakdown: normaliseField(parsed.problemBreakdown),
      stakeholders:     normaliseField(parsed.stakeholders),
      solutionApproach: normaliseField(parsed.solutionApproach),
      actionPlan:       normaliseField(parsed.actionPlan),
    });
  }
}, []);

  const handleEdit = async (sectionKey: keyof ReportData, sectionTitle: string) => {
    if (!data || !editInstruction.trim()) return;

    setEditLoading(true);
    try {
      const res = await fetch("/api/agent/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: data[sectionKey],
          instruction: editInstruction,
          sectionTitle,
        }),
      });

      if (!res.ok) throw new Error("Edit failed");
      const { updated } = await res.json();
      const normalisedUpdate = normaliseField(updated);

      // Save old version before overwriting
      setVersions((prev) => ({
        ...prev,
        [sectionKey]: [...(prev[sectionKey] ?? []), data[sectionKey]],
      }));

      const newData = { ...data, [sectionKey]: normalisedUpdate }; // ← use normalised value

      setData(newData);
      localStorage.setItem("report", JSON.stringify(newData));
      setEditingSection(null);
      setEditInstruction("");
    } catch (err) {
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleUndo = (sectionKey: keyof ReportData) => {
    if (!data || !versions[sectionKey]?.length) return;
    const prev = [...(versions[sectionKey] ?? [])];
    const last = prev.pop()!;
    const newData = { ...data, [sectionKey]: last };
    setData(newData);
    localStorage.setItem("report", JSON.stringify(newData));
    setVersions((v) => ({ ...v, [sectionKey]: prev }));
  };

  const handleDocxClick = async () => {
    if (!data) return;
    setDocxLoading(true);
    try {
      await handleDocx(data);
    } finally {
      setDocxLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex items-center gap-3 text-slate-400">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Loading report…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" id="report">
      {/* Sticky top bar */}
      <header className="sticky top-0 z-20 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              AI Planning Agent
            </p>
            <h1 className="text-lg font-bold tracking-tight text-white">
              Planning Report
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDocxClick}
              disabled={docxLoading}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
            >
              {docxLoading ? (
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                <span>📄</span>
              )}
              DOCX
            </button>
            <button onClick={() => handlePDF(data)}

              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
            >
              <span>📄</span> PDF
            </button>
          </div>
        </div>
      </header>

      {/* Sections */}
      <main className="mx-auto max-w-3xl space-y-4 px-6 py-10">
        {SECTION_CONFIG.map(({ key, title, icon, accent, border, badge }) => {
          const isEditing = editingSection === key;
          const hasHistory = (versions[key]?.length ?? 0) > 0;

          return (
            <div
              key={key}
              className={`group rounded-2xl border border-white/5 bg-white/[0.03] transition-all`}
            >
              {/* Colored top accent bar */}
              <div className={`h-0.5 w-full rounded-t-2xl bg-gradient-to-r ${accent}`} />

              <div className="p-6">
                {/* Header row */}
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className={`rounded-md px-2 py-1 text-sm font-bold ${badge}`}>
                      {icon}
                    </span>
                    <h2 className="text-base font-bold tracking-tight text-white">
                      {title}
                    </h2>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {hasHistory && (
                      <button
                        onClick={() => handleUndo(key)}
                        className="rounded-md px-2 py-1 text-xs text-slate-500 transition hover:text-slate-300"
                        title="Undo last edit"
                      >
                        ↩ Undo
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingSection(isEditing ? null : key);
                        setEditInstruction("");
                      }}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                        isEditing
                          ? "border-slate-600 text-slate-400 hover:text-slate-200"
                          : "border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
                      }`}
                    >
                      {isEditing ? "✕ Close" : "✏️ Edit"}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <p className={`text-sm leading-relaxed text-slate-300 whitespace-pre-line border-l-2 pl-4 ${border}`}>
                  {data[key]}
                </p>

                {/* Inline edit panel */}
                {isEditing && (
                  <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                      Edit Instruction
                    </p>
                    <input
                      type="text"
                      value={editInstruction}
                      onChange={(e) => setEditInstruction(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleEdit(key, title)}
                      placeholder="e.g. Make this more concise and actionable"
                      disabled={editLoading}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-white/20 focus:ring-1 focus:ring-white/10 disabled:opacity-50"
                    />
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(key, title)}
                        disabled={editLoading || !editInstruction.trim()}
                        className={`flex items-center gap-1.5 rounded-lg bg-gradient-to-r px-4 py-2 text-xs font-bold text-slate-900 transition active:scale-[0.98] disabled:opacity-50 ${accent}`}
                      >
                        {editLoading ? (
                          <>
                            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                            Applying…
                          </>
                        ) : (
                          "Apply"
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingSection(null);
                          setEditInstruction("");
                        }}
                        disabled={editLoading}
                        className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-slate-400 transition hover:text-slate-200 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}