/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CareerCoachResult, ParsedResume } from "../types.js";
import { GraduationCap, Award, TrendingUp, HelpCircle, BookOpen, Clock, Activity, ListTodo, RefreshCw } from "lucide-react";

interface CareerCoachPlanProps {
  token: string;
  resume: ParsedResume;
}

export default function CareerCoachPlan({ token, resume }: CareerCoachPlanProps) {
  const [coachPlan, setCoachPlan] = useState<CareerCoachResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchCoachPlan = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/resume/career", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ resumeId: resume.id })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to parse career advisor roadmap.");
      }

      setCoachPlan(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to compile roadmap.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="career_coach_workspace" className="bg-[#161b22] p-6 rounded-2xl border border-gray-800 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-400" />
            AI Career Advisor & Learning Roadmaps
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Formulates a personalized strategic career pivot mapping skill gaps, target titles, and structured learning schedules.
          </p>
        </div>
        {!coachPlan && !isLoading && (
          <button
            id="btn_get_career"
            onClick={fetchCoachPlan}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-[#0d1117] transition-colors"
          >
            Formulate Custom Roadmap
          </button>
        )}
      </div>

      {isLoading && (
        <div id="coach_loading_panel" className="h-64 flex flex-col justify-center items-center text-center p-6 text-gray-500">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
          <span className="text-xs font-mono">Compiling learning plans and analyzing strategic gap hierarchies...</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-950/20 border border-red-900/50 text-red-400 rounded-xl text-xs">
          {errorMessage}
        </div>
      )}

      {!coachPlan && !isLoading && (
        <div className="h-48 border border-dashed border-gray-800 rounded-2xl flex flex-col justify-center items-center text-center p-6 bg-[#0d1117]/30">
          <BookOpen className="w-10 h-10 text-gray-600 mb-2" />
          <span className="text-xs text-gray-400 font-medium font-mono">No active roadmap compiled yet.</span>
          <span className="text-[10px] text-gray-500 mt-1">Integrate parser elements to evaluate competencies.</span>
        </div>
      )}

      {coachPlan && !isLoading && (
        <div id="coach_results_grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Skill gaps and recommended opportunities */}
          <div className="space-y-4">
            <div className="p-4 bg-[#0d1117] border border-gray-800 rounded-xl space-y-2.5">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block font-mono">Strategic Skill Gap Analysis</span>
              <ul className="space-y-2 font-sans text-xs text-gray-300">
                {coachPlan.skillGapAnalysis.map((gap, id) => (
                  <li key={id} className="flex gap-2 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-[#0d1117] border border-gray-800 rounded-xl space-y-2.5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block font-mono">Target Pivot Roles</span>
              <div className="flex flex-wrap gap-1.5">
                {coachPlan.recommendedRoles.map((role, id) => (
                  <span key={id} className="text-[10px] font-bold bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 px-2.5 py-1 rounded-md font-sans">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-[#0d1117] border border-gray-800 rounded-xl space-y-2.5">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block font-mono">Weekly Agenda Priorities</span>
              <ul className="space-y-1.5 text-xs text-gray-300 font-sans">
                {coachPlan.weeklyLearningPlan.map((plan, id) => (
                  <li key={id} className="flex gap-2 items-start">
                    <span className="w-1.5 h-1.5 bg-cyan-400 mt-1.5 shrink-0" />
                    <span>{plan}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Detailed step-by-step sequential learning nodes */}
          <div className="lg:col-span-2 space-y-3.5 bg-[#0d1117] p-5 rounded-xl border border-gray-800/80 max-h-[380px] overflow-y-auto">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block pb-1.5 border-b border-gray-800/45 font-mono">Personalized Milestone Curriculum</span>
            
            <div className="space-y-4 pt-1">
              {coachPlan.learningRoadmap.map((node, i) => (
                <div key={i} className="relative pl-6 border-l border-gray-800 last:border-0 pb-2">
                  {/* Styled indicator node pin */}
                  <span className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-[#0d1117]" />
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-extrabold text-gray-200">{node.topic}</h4>
                      <span className="text-[10px] bg-emerald-950/20 border border-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded font-mono">{node.duration}</span>
                    </div>

                    <div className="text-[11px] text-gray-400 space-y-1.5 pt-1">
                      <span className="font-bold text-gray-300 block text-[10px] uppercase">Goal Milestone Actions:</span>
                      {node.milestones.map((m, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-mono">#</span>
                          <span>{m}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-[10px] text-cyan-400 pt-2 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-cyan-500" />
                      <span className="font-bold">Recommended Resources:</span>
                      <span className="text-gray-400 truncate pr-2 max-w-sm">{node.suggestedResources.join(", ")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
