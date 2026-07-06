/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { MultiAgentWorkflowResult, ParsedResume } from "../types.js";
import { Play, Sparkles, RefreshCw, Layers, CheckCircle2, Circle, AlertCircle, ArrowRight } from "lucide-react";

interface MultiAgentWorkflowProps {
  token: string;
  resume: ParsedResume;
}

export default function MultiAgentWorkflow({ token, resume }: MultiAgentWorkflowProps) {
  const [workflow, setWorkflow] = useState<MultiAgentWorkflowResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [selectedAgentTab, setSelectedAgentTab] = useState<string>("analysis");

  const runWorkflow = async () => {
    setIsLoading(true);
    setWorkflow(null);
    setActiveStepIndex(-1);

    try {
      const res = await fetch("/api/resume/multiactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ resumeId: resume.id })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Multi-agent graph runtime crashed.");
      }

      // Stagger trace activation for smooth animation matching real LangGraph execution
      setWorkflow(data);
      for (let i = 0; i < data.traces.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setActiveStepIndex(i);
      }

    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="multi_agent_workspace" className="bg-[#161b22] p-6 rounded-2xl border border-gray-800 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            LangGraph Multi-Agent Orchestration Flow
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Simulate an asynchronous StateGraph routing tasks sequentially across specialized AI agents.
          </p>
        </div>
        <button
          id="btn_run_workflow"
          onClick={runWorkflow}
          disabled={isLoading}
          className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-[#0d1117] flex items-center gap-2 transition-colors duration-150 shadow-lg shrink-0 disabled:bg-gray-800 disabled:text-gray-600"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#0d1117]" />
               Running StateGraph Nodes...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#0d1117]" />
              Trigger Multi-Agent System
            </>
          )}
        </button>
      </div>

      {!workflow ? (
        <div className="h-64 border border-dashed border-gray-800 rounded-2xl flex flex-col justify-center items-center text-center p-6 bg-[#0d1117]/30">
          <Layers className="w-10 h-10 text-gray-600 mb-2" />
          <span className="text-xs text-gray-400 font-medium">Ready to Orchestrate StateGraph Sequences</span>
          <span className="text-[10px] text-gray-500 mt-1">Triggers evaluation workflows over active resume profiles using 5 agents.</span>
        </div>
      ) : (
        <div id="agent_execution_container" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual trace nodes timeline */}
          <div className="lg:col-span-2 space-y-3.5 bg-[#0d1117] p-4 rounded-xl border border-gray-800/80">
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block pb-1.5 border-b border-gray-800/40">StateGraph Step Trace Execution Log</span>
            
            <div className="space-y-2.5">
              {workflow.traces.map((trace, idx) => {
                const isActive = idx <= activeStepIndex;
                const isCurrent = idx === activeStepIndex;
                
                let iconColor = "text-gray-500";
                if (isActive) iconColor = "text-emerald-400";
                if (isCurrent) iconColor = "text-cyan-400 animate-pulse";

                return (
                  <div
                    key={trace.agentId}
                    className={`flex items-start gap-3 p-3 rounded-lg border text-xs transition-colors duration-200 ${
                      isCurrent 
                        ? "bg-cyan-950/20 border-cyan-500/40" 
                        : isActive 
                          ? "bg-emerald-950/10 border-emerald-900/40 text-gray-300"
                          : "bg-gray-900/10 border-gray-800/40 text-gray-500"
                    }`}
                  >
                    <span className="mt-0.5">
                      {isCurrent ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                      ) : isActive ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-600" />
                      )}
                    </span>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className={`font-bold ${isCurrent ? "text-cyan-300" : isActive ? "text-gray-200" : "text-gray-500"}`}>{trace.agentName}</span>
                        <span className="text-[9px] text-gray-500 font-mono">NODE_{idx + 1}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed font-sans">{trace.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Collapsible output cards from individual agents */}
          <div className="bg-[#0d1117] p-5 rounded-xl border border-gray-800 flex flex-col justify-between h-[340px]">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block border-b border-gray-800/40 pb-2">Agent Synthesis Results</span>
              
              <div className="flex gap-1.5 py-3 overflow-x-auto shrink-0">
                {Object.keys(workflow.agentSummaries).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedAgentTab(tab)}
                    className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-md font-mono border transition-all ${
                      selectedAgentTab === tab
                        ? "bg-emerald-500 border-emerald-400 text-[#0d1117]"
                        : "bg-[#161b22] border-gray-800 text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div id="agent_summary_content" className="p-3 bg-[#161b22]/50 border border-gray-800/80 rounded-xl space-y-2 mt-1 min-h-[140px] text-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                  {selectedAgentTab === "analysis" && "Resume Analysis Outcome"}
                  {selectedAgentTab === "ats" && "ATS Optimizations Blueprint"}
                  {selectedAgentTab === "careerCoach" && "Emergent Skill Coach Suggestion"}
                  {selectedAgentTab === "interview" && "Technical Interview Design Plan"}
                  {selectedAgentTab === "improvement" && "Aggregated Improvement Matrix"}
                </div>
                <p id="agent_summary_text" className="text-[11px] text-gray-300 leading-relaxed font-sans">
                  {workflow.agentSummaries[selectedAgentTab as keyof typeof workflow.agentSummaries]}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-800/40 mt-2">
              <div className="text-[9.5px] text-gray-500 font-mono flex items-center justify-between">
                <span>Health Index: {workflow.overallHealthStatus}</span>
                <span>Active Traces Sync Code: OK</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
