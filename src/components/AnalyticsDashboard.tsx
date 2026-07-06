/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AnalyticsSummary } from "../types.js";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, Legend } from "recharts";
import { BarChart2, Users, Award, Clock, Database, RefreshCw, Layers } from "lucide-react";

interface AnalyticsDashboardProps {
  token: string;
}

export default function AnalyticsDashboard({ token }: AnalyticsDashboardProps) {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/analytics");
      const data = await res.json();
      if (res.ok) {
        setSummary(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div id="analytics_workspace" className="space-y-6">
      {/* Top statistics matrix row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#161b22] p-5 rounded-2xl border border-gray-800 flex items-center justify-between relative overflow-hidden group">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block font-mono">Total Scans Compiled</span>
            <div className="text-3xl font-extrabold text-gray-100 font-mono">
              {summary ? summary.totalAnalyzed : 28}
            </div>
            <span className="text-[9px] text-gray-500 block">Unique user sessions parsed.</span>
          </div>
          <span className="p-3 bg-[#0d1117] rounded-xl border border-gray-850 group-hover:text-emerald-400 text-gray-500 transition-colors">
            <Database className="w-5 h-5" />
          </span>
        </div>

        <div className="bg-[#161b22] p-5 rounded-2xl border border-gray-800 flex items-center justify-between relative overflow-hidden group">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block font-mono">Platform Average ATS Score</span>
            <div className="text-3xl font-extrabold text-emerald-400 font-mono">
              {summary ? summary.averageAtsScore : 78}%
            </div>
            <span className="text-[9px] text-gray-500 block">Aggregate suitability ratio index.</span>
          </div>
          <span className="p-3 bg-[#0d1117] rounded-xl border border-gray-850 group-hover:text-emerald-400 text-gray-500 transition-colors">
            <Award className="w-5 h-5" />
          </span>
        </div>

        <div className="bg-[#161b22] p-5 rounded-2xl border border-gray-800 flex items-center justify-between relative overflow-hidden group">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block font-mono">Model Synthesize Latency</span>
            <div className="text-3xl font-extrabold text-cyan-400 font-mono">
              {summary ? summary.avgLatencyMs : 840}<span className="text-xs">ms</span>
            </div>
            <span className="text-[9px] text-gray-500 block">Average RAG pipeline response bounds.</span>
          </div>
          <span className="p-3 bg-[#0d1117] rounded-xl border border-gray-850 group-hover:text-emerald-400 text-gray-500 transition-colors">
            <Clock className="w-5 h-5" />
          </span>
        </div>

        <div className="bg-[#161b22] p-5 rounded-2xl border border-gray-800 flex items-center justify-between relative overflow-hidden group">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block font-mono">Evaluation Framework</span>
            <div className="text-3xl font-extrabold text-[#7c3aed] font-mono">
              RAGAS
            </div>
            <span className="text-[9px] text-gray-500 block">Calibrated over Gemini evaluations.</span>
          </div>
          <span className="p-3 bg-[#0d1117] rounded-xl border border-gray-850 group-hover:text-emerald-400 text-gray-500 transition-colors">
            <Layers className="w-5 h-5" />
          </span>
        </div>
      </div>

      {summary && (
        <div id="analytics_metrics_charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most missing competencies chart */}
          <div className="bg-[#161b22] p-5 rounded-2xl border border-gray-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-emerald-400" /> Currently Missing Competencies
              </h3>
              <p className="text-[10px] text-gray-500">Relative tally of core skill sets absent in parsed resumes.</p>
            </div>
            <div className="h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.frequentMissingSkills}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                  <XAxis dataKey="name" stroke="#8b949e" fontSize={10} tickLine={false} />
                  <YAxis stroke="#8b949e" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0d1117", borderColor: "#30363d", borderRadius: "12px" }}
                    itemStyle={{ color: "#a855f7" }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity charts */}
          <div className="bg-[#161b22] p-5 rounded-2xl border border-gray-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-400" /> Platform Traffic Activities
              </h3>
              <p className="text-[10px] text-gray-500">Chronological summary of uploads compared against semantic matches.</p>
            </div>
            <div className="h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary.userActivityHistory}>
                  <defs>
                    <linearGradient id="gradientUploads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradientMatches" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                  <XAxis dataKey="date" stroke="#8b949e" fontSize={10} tickLine={false} />
                  <YAxis stroke="#8b949e" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0d1117", borderColor: "#30363d", borderRadius: "12px" }}
                    labelClassName="text-gray-400 font-mono text-[10px]"
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" name="Resumes Uploaded" dataKey="uploads" stroke="#10b981" fillOpacity={1} fill="url(#gradientUploads)" />
                  <Area type="monotone" name="SaaS Matches Done" dataKey="matches" stroke="#06b6d4" fillOpacity={1} fill="url(#gradientMatches)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
