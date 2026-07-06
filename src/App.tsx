/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, ParsedResume, ATSResult } from "./types.js";

// Import custom analytical dashboard modules
import AuthScreen from "./components/AuthScreen.tsx";
import UploadSection from "./components/UploadSection.tsx";
import ATSDashboard from "./components/ATSDashboard.tsx";
import JobDescriptionMatcher from "./components/JobDescriptionMatcher.tsx";
import RAGAssistant from "./components/RAGAssistant.tsx";
import MultiAgentWorkflow from "./components/MultiAgentWorkflow.tsx";
import CareerCoachPlan from "./components/CareerCoachPlan.tsx";
import InterviewSimulator from "./components/InterviewSimulator.tsx";
import ResumeComparison from "./components/ResumeComparison.tsx";
import AnalyticsDashboard from "./components/AnalyticsDashboard.tsx";
import EvaluationDashboard from "./components/EvaluationDashboard.tsx";

import {
  FileText,
  TrendingUp,
  Briefcase,
  MessageSquare,
  Layers,
  GraduationCap,
  HelpCircle,
  GitCompare,
  BarChart2,
  ShieldCheck,
  LogOut,
  Sparkles,
  ChevronRight,
  Database
} from "lucide-react";

type NavigationSection =
  | "upload"
  | "ats"
  | "match"
  | "chat"
  | "agents"
  | "career"
  | "interview"
  | "compare"
  | "analytics"
  | "logs";

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [resumes, setResumes] = useState<ParsedResume[]>([]);
  const [activeResume, setActiveResume] = useState<ParsedResume | null>(null);
  const [activeATS, setActiveATS] = useState<ATSResult | null>(null);
  const [activeTab, setActiveTab] = useState<NavigationSection>("upload");

  // Load token from local storage on bootstrap
  useEffect(() => {
    const savedToken = localStorage.getItem("resume_auth_token");
    const savedUser = localStorage.getItem("resume_auth_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Fetch updated list of resumes whenever token is available
  const fetchUserResumes = async (authToken: string) => {
    try {
      const res = await fetch("/api/resume/list", {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      const data = await res.json();
      if (res.ok && data.resumes) {
        setResumes(data.resumes);
        if (data.resumes.length > 0) {
          // Default to latest resume uploaded
          const sorted = [...data.resumes].sort(
            (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
          );
          setActiveResume(sorted[0]);
          fetchResumeATSDetails(sorted[0].id, authToken);
        }
      }
    } catch (e) {
      console.error("Failed to load resumes:", e);
    }
  };

  const fetchResumeATSDetails = async (resumeId: string, authToken: string) => {
    try {
      const res = await fetch(`/api/resume/${resumeId}`, {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      const data = await res.json();
      if (res.ok && data.atsResult) {
        setActiveATS(data.atsResult);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserResumes(token);
    }
  }, [token]);

  const handleAuthSuccess = (newToken: string, authUser: any) => {
    setToken(newToken);
    setUser(authUser);
    localStorage.setItem("resume_auth_token", newToken);
    localStorage.setItem("resume_auth_user", JSON.stringify(authUser));
  };

  const handleSignOut = () => {
    setToken(null);
    setUser(null);
    setResumes([]);
    setActiveResume(null);
    setActiveATS(null);
    setActiveTab("upload");
    localStorage.removeItem("resume_auth_token");
    localStorage.removeItem("resume_auth_user");
  };

  const handleUploadSuccess = (newResume: any, atsResult: any) => {
    setResumes((prev) => [newResume, ...prev]);
    setActiveResume(newResume);
    setActiveATS(atsResult);
    setActiveTab("ats"); // Automatically switch to scores dashboard after processing completes!
  };

  const selectActiveResume = (resumeId: string) => {
    const found = resumes.find(r => r.id === resumeId);
    if (found && token) {
      setActiveResume(found);
      fetchResumeATSDetails(found.id, token);
    }
  };

  if (!token || !user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // Sidebar components links definitions
  const sidebarLinks = [
    { id: "upload", name: "Resume Terminal", icon: Database },
    { id: "ats", name: "ATS Weighted Scores", icon: TrendingUp, disabled: !activeResume },
    { id: "match", name: "Job Suitability", icon: Briefcase, disabled: !activeResume },
    { id: "chat", name: "RAG Assistant Chat", icon: MessageSquare, disabled: !activeResume },
    { id: "agents", name: "Multi-Agent Graph", icon: Layers, disabled: !activeResume },
    { id: "career", name: "Learning Roadmap", icon: GraduationCap, disabled: !activeResume },
    { id: "interview", name: "Interview simulator", icon: HelpCircle, disabled: !activeResume },
    { id: "compare", name: "Version comparison", icon: GitCompare, disabled: resumes.length < 2 },
    { id: "analytics", name: "Analytics Hub", icon: BarChart2 },
    { id: "logs", name: "RAGAS Calibration", icon: ShieldCheck }
  ];

  return (
    <div id="app_root_layout" className="min-h-screen bg-[#0d1117] text-gray-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Upper header banner */}
      <header className="bg-[#161b22] border-b border-gray-800 h-16 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              GenAI Resume Intelligence
            </h1>
            <div className="text-[10px] text-gray-500 font-mono tracking-wider uppercase mt-0.5">Enterprise LLMOps Suite</div>
          </div>
        </div>

        {/* User login dropdown status */}
        <div className="flex items-center gap-4">
          {resumes.length > 0 && activeResume && (
            <div className="hidden md:flex items-center gap-2 text-xs bg-[#0d1117] border border-gray-800 px-3 py-1.5 rounded-xl">
              <span className="text-gray-500 font-bold uppercase tracking-wider text-[9px]">Scope:</span>
              <select
                id="header_resume_selector"
                value={activeResume.id}
                onChange={(e) => selectActiveResume(e.target.value)}
                className="bg-transparent text-gray-300 font-medium font-mono text-[11px] outline-none cursor-pointer"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id} className="bg-[#161b22] text-gray-300">
                    {r.filename} (v{r.version})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-gray-300">{user.name}</div>
              <div className="text-[10px] text-gray-500 font-mono">{user.email}</div>
            </div>
            <button
              id="btn_signout"
              onClick={handleSignOut}
              className="p-2 rounded-xl bg-[#0d1117] hover:bg-red-950/20 border border-gray-850 hover:border-red-900/40 text-gray-400 hover:text-red-400 transition-all duration-150"
              title="Sign Out Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main split work column panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left navigation sidebar panel */}
        <aside className="w-64 bg-[#161b22] border-r border-gray-800/80 p-4 flex flex-col justify-between shrink-0 hidden lg:flex">
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2 font-mono">Platform Nodes navigation</div>
            <nav className="space-y-1">
              {sidebarLinks.map((link) => (
                <button
                  key={link.id}
                  id={`nav_link_${link.id}`}
                  disabled={link.disabled}
                  onClick={() => setActiveTab(link.id as NavigationSection)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group ${
                    activeTab === link.id
                      ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 text-emerald-400"
                      : link.disabled
                        ? "text-gray-600 cursor-not-allowed opacity-50"
                        : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/20 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <link.icon className={`w-4 h-4 shrink-0 transition-colors ${activeTab === link.id ? "text-emerald-400" : "text-gray-500 group-hover:text-gray-300"}`} />
                    <span>{link.name}</span>
                  </div>
                  {!link.disabled && <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </button>
              ))}
            </nav>
          </div>

          {/* Core system active indicator footer */}
          <div className="p-3 bg-[#0d1117] border border-gray-850 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Core Agent Server Live</span>
            </div>
            <p className="text-[9.5px] text-gray-500 leading-normal">
              Fully integrated with Gemini API. Multi-Agent feedback calibrations operating perfectly.
            </p>
          </div>
        </aside>

        {/* Right workspace area */}
        <main className="flex-1 p-6 overflow-y-auto bg-[#0d1117]">
          {/* Mobile responsive toolbar dropdown menu */}
          <div className="lg:hidden p-3 bg-[#161b22] border border-gray-800 rounded-xl mb-4 text-xs flex justify-between items-center">
            <span className="font-bold uppercase text-[10px] tracking-wider text-gray-400">Section Navigator:</span>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as NavigationSection)}
              className="bg-[#0d1117] text-emerald-400 font-bold border border-gray-800 rounded px-2.5 py-1 outline-none"
            >
              {sidebarLinks.map((link) => (
                <option key={link.id} value={link.id} disabled={link.disabled}>
                  {link.name} {link.disabled ? "(Locked)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div id="workspace_content_render" className="space-y-6 max-w-6xl mx-auto animate-fade-in">
            {activeTab === "upload" && (
              <UploadSection token={token} onUploadSuccess={handleUploadSuccess} />
            )}

            {activeTab === "ats" && activeResume && activeATS && (
              <ATSDashboard atsResult={activeATS} resume={activeResume} />
            )}

            {activeTab === "match" && activeResume && (
              <JobDescriptionMatcher token={token} resume={activeResume} />
            )}

            {activeTab === "chat" && activeResume && (
              <RAGAssistant token={token} resume={activeResume} />
            )}

            {activeTab === "agents" && activeResume && (
              <MultiAgentWorkflow token={token} resume={activeResume} />
            )}

            {activeTab === "career" && activeResume && (
              <CareerCoachPlan token={token} resume={activeResume} />
            )}

            {activeTab === "interview" && activeResume && (
              <InterviewSimulator token={token} resume={activeResume} />
            )}

            {activeTab === "compare" && resumes.length >= 2 && (
              <ResumeComparison token={token} resumes={resumes} />
            )}

            {activeTab === "analytics" && (
              <AnalyticsDashboard token={token} />
            )}

            {activeTab === "logs" && (
              <EvaluationDashboard token={token} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
