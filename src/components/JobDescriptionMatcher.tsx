/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { JobMatchResult, ParsedResume } from "../types.js";
import { Sparkles, FileText, Check, AlertTriangle, Briefcase, PlusCircle, RefreshCw } from "lucide-react";

interface JobDescriptionMatcherProps {
  token: string;
  resume: ParsedResume;
}

const DEFAULT_JD = `About the Role:
We are seeking a Senior Generative AI Engineer to architect high-capacity microservices on AWS, using FastAPI, LangChain, and LangGraph.

Requirements:
- Advanced expertise in Python, RAG architectures, and hybrid vector retrieval.
- Deployed multi-agent systems with trace telemetry.
- Skilled with Kubernetes, Docker, Pinecone databases, and real-time LLM evaluation metrics.`;

export default function JobDescriptionMatcher({ token, resume }: JobDescriptionMatcherProps) {
  const [jobDescription, setJobDescription] = useState(DEFAULT_JD);
  const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const triggerMatchAnalysis = async () => {
    if (!jobDescription.trim()) {
      setErrorMessage("Please insert a target job description text first.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/resume/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ resumeId: resume.id, jobDescription })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Analysis failed.");
      }

      setMatchResult(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to compare suitability profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="job_matcher_workspace" className="bg-[#161b22] p-6 rounded-2xl border border-gray-800 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-emerald-400" />
          Job Description Alignment Tool
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Paste a target job description from an external posting to evaluate semantic alignment and preparation feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input JD section */}
        <div className="space-y-4">
          <textarea
            id="job_description_textarea"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste target role specifications..."
            className="w-full h-72 bg-[#0d1117] border border-gray-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-4 text-xs font-mono text-gray-300 outline-none transition-all duration-150 resize-y"
          />

          {errorMessage && (
            <div className="p-3 bg-red-950/20 border border-red-900/50 text-red-400 rounded-xl text-xs">
              {errorMessage}
            </div>
          )}

          <div className="flex justify-end">
            <button
              id="btn_trigger_match"
              onClick={triggerMatchAnalysis}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-[#0d1117] shadow-lg flex items-center gap-2 transition-all duration-150"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#0d1117]" />
                  Comparing Match...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#0d1117]" />
                  Analyze Semantic Fit
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output metrics display */}
        <div className="space-y-4">
          {!matchResult ? (
            <div className="h-72 border border-dashed border-gray-800 rounded-2xl flex flex-col justify-center items-center text-center p-6 bg-[#0d1117]/30">
              <FileText className="w-8 h-8 text-gray-600 mb-2" />
              <span className="text-xs text-gray-400 font-medium">Ready for Semantic Suitability Scan</span>
              <span className="text-[10px] text-gray-500 mt-1">Output includes Recruiter Insights, gaps analysis, and suitability percentages.</span>
            </div>
          ) : (
            <div id="match_results_panel" className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
              <div className="flex gap-4 items-center p-4 bg-[#0d1117] rounded-xl border border-gray-800">
                <div className="text-3xl font-extrabold text-emerald-400 font-mono bg-emerald-500/5 border border-emerald-500/20 px-4 py-2 rounded-lg">
                  {matchResult.matchScore}%
                </div>
                <div>
                  <div className="text-xs font-extrabold text-gray-200">Suitability Match Score</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Semantic relevance ratio of skills to job expectations.</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#0d1117] border border-gray-800 rounded-xl space-y-2">
                  <div className="font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Matching Competencies
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {matchResult.matchingSkills.map((s, i) => (
                      <span key={i} className="text-[10px] bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 px-2 py-0.5 rounded font-mono">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-[#0d1117] border border-gray-800 rounded-xl space-y-2">
                  <div className="font-bold text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Missing Experience Gaps
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {matchResult.missingSkills.map((s, i) => (
                      <span key={i} className="text-[10px] bg-red-950/20 border border-red-900/40 text-red-300 px-2 py-0.5 rounded font-mono">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#0d1117] border border-gray-800 rounded-xl space-y-1.5">
                <div className="text-xs font-bold text-gray-300">Recruiter Insights Briefing</div>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  {matchResult.recruiterInsights}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
