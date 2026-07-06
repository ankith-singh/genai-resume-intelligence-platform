/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ATSResult, ParsedResume } from "../types.js";
import { ShieldAlert, CheckCircle, HelpCircle, Award, Target, Cpu, BookOpen, Layers } from "lucide-react";

interface ATSDashboardProps {
  atsResult: ATSResult;
  resume: ParsedResume;
}

export default function ATSDashboard({ atsResult, resume }: ATSDashboardProps) {
  const { overallScore, breakdown, missingKeywords, missingSkills, improvementSuggestions } = atsResult;

  const scoreColor = overallScore >= 85 
    ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/5 animate-pulse" 
    : overallScore >= 70 
      ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/5" 
      : "text-red-400 border-red-500/30 bg-red-500/5";

  // Score breakdown with weights configuration
  const weightsInfo = [
    { key: "skillsMatch", name: "Skills Match Ratio", weight: "30%", score: breakdown.skillsMatch, icon: Cpu, color: "from-emerald-500 to-teal-600" },
    { key: "keywordMatch", name: "Semantic Keyword Match", weight: "20%", score: breakdown.keywordMatch, icon: Target, color: "from-blue-500 to-cyan-600" },
    { key: "experienceMatch", name: "Experience Chronology", weight: "25%", score: breakdown.experienceMatch, icon: Award, color: "from-yellow-500 to-amber-600" },
    { key: "educationMatch", name: "Academic Pedigree", weight: "10%", score: breakdown.educationMatch, icon: BookOpen, color: "from-purple-500 to-indigo-600" },
    { key: "projectRelevance", name: "Project Applicability", weight: "15%", score: breakdown.projectRelevance, icon: Layers, color: "from-pink-500 to-rose-600" }
  ];

  return (
    <div id="ats_dashboard_workspace" className="bg-[#161b22] p-6 rounded-2xl border border-gray-800 space-y-6">
      <div className="flex justify-between items-start pb-4 border-b border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            ATS Weighted Scoring Engine
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Quantifiable algorithmic metrics based on corporate recruiter filters of parser elements.
          </p>
        </div>
        <div className={`p-4 rounded-xl border text-center ${scoreColor} shrink-0`}>
          <div className="text-4xl font-extrabold tracking-tight font-mono">{overallScore}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">Aggregate Score</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {weightsInfo.map((item) => (
          <div key={item.key} className="bg-[#0d1117] p-4 rounded-xl border border-gray-800 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <span className="p-1.5 rounded-lg bg-gray-800 text-gray-400 group-hover:text-emerald-400 transition-colors">
                <item.icon className="w-4 h-4" />
              </span>
              <span className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-400 font-mono">Weight: {item.weight}</span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-extrabold text-gray-100 font-mono">{item.score}%</div>
              <div className="text-[11px] text-gray-400 font-medium truncate mt-1">{item.name}</div>
            </div>
            {/* Visual bottom progress line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
              <div className={`h-full bg-gradient-to-r ${item.color}`} style={{ width: `${item.score}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            ATS Filter Critical Gaps
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#0d1117] p-4 rounded-xl border border-gray-800 space-y-2">
              <div className="text-xs font-bold text-gray-400">Missing Core Skills</div>
              {missingSkills.length === 0 ? (
                <div className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Skills complete!
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {missingSkills.map((s, i) => (
                    <span key={i} className="text-[10px] bg-red-950/20 border border-red-900/50 text-red-300 px-2.5 py-1 rounded-md font-mono">{s}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#0d1117] p-4 rounded-xl border border-gray-800 space-y-2">
              <div className="text-xs font-bold text-gray-400">Missing Action Keywords</div>
              {missingKeywords.length === 0 ? (
                <div className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Keywords complete!
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {missingKeywords.map((k, i) => (
                    <span key={i} className="text-[10px] bg-amber-950/20 border border-amber-900/50 text-amber-300 px-2.5 py-1 rounded-md font-mono">{k}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Algorithmic Optimization Recommendations
          </h3>
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2">
            {improvementSuggestions.map((suggestion, idx) => (
              <div key={idx} className="p-3 bg-[#0d1117] border border-gray-800 rounded-xl text-xs text-gray-300 flex gap-2">
                <span className="text-emerald-400 font-bold">#{idx + 1}</span>
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
