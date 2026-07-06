/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { VersionComparison, ParsedResume } from "../types.js";
import { GitCompare, TrendingUp, Info, AlertOctagon, CheckSquare, Plus, Minus, RefreshCw } from "lucide-react";

interface ResumeComparisonProps {
  token: string;
  resumes: ParsedResume[];
}

export default function ResumeComparison({ token, resumes }: ResumeComparisonProps) {
  const [v1Id, setV1Id] = useState("");
  const [v2Id, setV2Id] = useState("");
  const [comparison, setComparison] = useState<VersionComparison | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const performComparison = async () => {
    if (!v1Id || !v2Id) {
      setErrorMessage("Please select two different resume versions to compare.");
      return;
    }
    if (v1Id === v2Id) {
      setErrorMessage("Please select two distinct versions. Cannot compare same file.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/resume/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ resumeV1Id: v1Id, resumeV2Id: v2Id })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to parse comparison charts.");
      }

      setComparison(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to fetch comparison delta.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="comparison_workspace" className="bg-[#161b22] p-6 rounded-2xl border border-gray-800 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-emerald-400" />
            Resume Version Comparison & Audit Ledger
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Compare side-by-side iterations of your profile document updates to track improvement differentials and keyword indexing gains.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-[#0d1117] p-4 rounded-xl border border-gray-800 text-xs">
        <div className="space-y-1.5">
          <label className="font-bold text-gray-400 block uppercase tracking-wider">Older Version (Resume V1)</label>
          <select
            id="v1_selector"
            value={v1Id}
            onChange={(e) => setV1Id(e.target.value)}
            className="w-full bg-[#161b22] border border-gray-800 focus:border-emerald-500 rounded-lg py-2 px-3 text-gray-300 outline-none"
          >
            <option value="">-- Select Resume --</option>
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.filename} (v{r.version})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-gray-400 block uppercase tracking-wider">Optimized Version (Resume V2)</label>
          <select
            id="v2_selector"
            value={v2Id}
            onChange={(e) => setV2Id(e.target.value)}
            className="w-full bg-[#161b22] border border-gray-800 focus:border-emerald-500 rounded-lg py-2 px-3 text-gray-300 outline-none"
          >
            <option value="">-- Select Resume --</option>
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.filename} (v{r.version})
              </option>
            ))}
          </select>
        </div>

        <button
          id="btn_trigger_compare"
          onClick={performComparison}
          disabled={isLoading || !v1Id || !v2Id}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-800 disabled:text-gray-600 text-[#0d1117] font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#0d1117]" /> Parsing delta...
            </>
          ) : (
            <>
              Compare Versions
            </>
          )}
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-950/20 border border-red-900/50 text-red-400 rounded-xl text-xs">
          {errorMessage}
        </div>
      )}

      {!comparison && !isLoading && (
        <div className="h-44 border border-dashed border-gray-800 rounded-2xl flex flex-col justify-center items-center text-center p-6 bg-[#0d1117]/30">
          <GitCompare className="w-10 h-10 text-gray-600 mb-2" />
          <span className="text-xs text-gray-400 font-medium font-mono">No comparison trace rendered.</span>
          <span className="text-[10px] text-gray-500 mt-1">Select V1 and V2 in the menu dropdowns above to trace differentials.</span>
        </div>
      )}

      {comparison && !isLoading && (
        <div id="compare_results_panel" className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
          {/* Comparison summary card */}
          <div className="p-5 bg-[#0d1117] border border-gray-800 rounded-2xl space-y-4">
            <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase block border-b border-gray-850 pb-2 font-mono">Improvement Diagnostics</span>
            
            <div className="flex gap-4 items-center justify-between">
              <div>
                <div className="text-3xl font-extrabold text-emerald-400 font-mono">+{comparison.scoreImprovement}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-1">Score Differential</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-gray-400">V1 Score: <span className="font-mono text-gray-200">{comparison.v1Overall}</span></div>
                <div className="text-[11px] text-gray-400 pt-0.5">V2 Score: <span className="font-mono text-emerald-400 font-bold">{comparison.v2Overall}</span></div>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-950/10 border border-emerald-900/40 rounded-xl space-y-1.5">
              <span className="font-bold text-emerald-300 block flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> Strategic Assessment:
              </span>
              <p className="text-gray-400 text-[11px] leading-relaxed font-sans">
                {comparison.scoreImprovement > 0 
                  ? "Outstanding gains in overall index. The latest version addresses core keywords and structures, optimizing relevance." 
                  : "Variance is nominal. Implement quantitative metric bullet highlights to increase weighted assessment indices further."}
              </p>
            </div>
          </div>

          {/* Skill variance list */}
          <div className="p-5 bg-[#0d1117] border border-gray-800 rounded-2xl space-y-4">
            <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase block border-b border-gray-850 pb-2 font-mono">Skills Variance Audit</span>
            
            <div className="space-y-3">
              <div>
                <div className="font-bold text-emerald-400 flex items-center gap-1 mb-1.5"><Plus className="w-4 h-4" /> Added Skill Marks</div>
                {comparison.skillsAdded.length === 0 ? (
                  <span className="text-gray-500 text-[11px] font-mono italic">No new skill identifiers noticed.</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {comparison.skillsAdded.map((s, idx) => (
                      <span key={idx} className="text-[10px] bg-emerald-950/20 border border-emerald-900/50 text-emerald-300 px-2.5 py-0.5 rounded font-mono">{s}</span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="font-bold text-gray-400 flex items-center gap-1 mb-1.5"><Minus className="w-4 h-4" /> Removed Skills/Synonyms</div>
                {comparison.skillsRemoved.length === 0 ? (
                  <span className="text-gray-500 text-[11px] font-mono italic">Zero removals recorded.</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {comparison.skillsRemoved.map((s, idx) => (
                      <span key={idx} className="text-[10px] bg-gray-900 border border-gray-800 text-gray-500 px-2 py-0.5 rounded font-mono">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Keywords & issues solved */}
          <div className="p-5 bg-[#0d1117] border border-gray-800 rounded-2xl space-y-4">
            <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase block border-b border-gray-850 pb-2 font-mono">Lexical Optimization</span>
            
            <div className="space-y-3 font-sans text-xs">
              <div className="space-y-1.5">
                <div className="font-bold text-gray-200">Better Actionable Keywords Integrated:</div>
                <div className="flex flex-wrap gap-1">
                  {comparison.betterKeywords.map((w, i) => (
                    <span key={i} className="text-[10px] bg-cyan-950/20 border border-cyan-900/50 text-cyan-300 px-2.5 py-0.5 rounded font-mono">{w}</span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="font-bold text-gray-200">Structural Pitfalls Decimated:</div>
                <ul className="space-y-1 text-gray-400">
                  {comparison.weakAreasAddressed.map((area, i) => (
                    <li key={i} className="flex gap-1.5 items-start">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
