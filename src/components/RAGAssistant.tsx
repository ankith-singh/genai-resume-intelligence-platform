/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ParsedResume, ChatMessage } from "../types.js";
import { MessageSquare, Send, Database, Cpu, ShieldCheck, ChevronDown, ChevronUp, Zap } from "lucide-react";

interface RAGAssistantProps {
  token: string;
  resume: ParsedResume;
}

const PRESET_QUESTIONS = [
  "What are my strengths?",
  "What should I improve in my experience highlights?",
  "Which projects are relevant to scaling high-throughput servers?",
  "Generate professional summary formatted for recruiters of top companies"
];

export default function RAGAssistant({ token, resume }: RAGAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTrace, setActiveTrace] = useState<{
    contexts: Array<{ text: string; source: string; score: number }>;
    evaluation: {
      faithfulness: number;
      contextPrecision: number;
      contextRecall: number;
      answerRelevancy: number;
      hallucinationRate: number;
      latencyMs: number;
    };
  } | null>(null);

  const [showTrace, setShowTrace] = useState(true);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    setIsLoading(true);
    setInputText("");

    // Add user message to state
    const newUserMsg: ChatMessage = {
      id: "user_" + Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, newUserMsg]);

    try {
      const res = await fetch("/api/resume/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ resumeId: resume.id, question: text })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "RAG answering failed.");
      }

      if (data.history) {
        setMessages(data.history);
      } else if (data.response) {
        setMessages((prev) => [...prev, data.response]);
      }
      if (data.response && data.response.retrievedContexts) {
        setActiveTrace({
          contexts: data.response.retrievedContexts,
          evaluation: data.response.evaluation
        });
      }
    } catch (err: any) {
      console.error(err);
      const errResponse: ChatMessage = {
        id: "err_" + Date.now(),
        sender: "assistant",
        text: "Apologies, the secure RAG evaluation pipeline hit a network limit. Please try querying another technical keyword.",
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="rag_chatbot_panel" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Visual Workspace Chat area */}
      <div className="xl:col-span-2 bg-[#161b22] p-6 rounded-2xl border border-gray-800 flex flex-col h-[500px]">
        <div className="flex justify-between items-center pb-3 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-extrabold text-gray-200">Interactive Resume QA Chatbot</h2>
              <div className="text-[10px] text-gray-500 font-mono">Pipeline: Chunks → BM25 + Vector Embedding Hybrid Match → Synthesis</div>
            </div>
          </div>
          <button
            onClick={() => setShowTrace(!showTrace)}
            className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 shrink-0"
          >
            {showTrace ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showTrace ? "Hide Retrieval Telemetry" : "Expose Retrieval Telemetry"}
          </button>
        </div>

        {/* Message bubble thread representation */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 min-h-[250px]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center p-6 text-gray-500 space-y-3">
              <Database className="w-10 h-10 text-gray-600 animate-bounce" />
              <div className="max-w-md">
                <span className="text-xs font-semibold text-gray-300 block">Hybrid Search RAG Vector Stage Active</span>
                <span className="text-[11px] text-gray-500 block mt-1">
                  Ask targeted corporate recruiter screening queries, or click a fast preset query below to test search boundaries.
                </span>
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-emerald-500 text-[#0d1117] rounded-tr-none font-medium font-sans"
                    : "bg-[#0d1117] border border-gray-800 text-gray-200 rounded-tl-none font-sans"
                }`}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span className="text-[9px] text-gray-500 block text-right mt-1.5 font-mono">{m.timestamp}</span>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="p-3.5 bg-[#0d1117] border border-gray-800 rounded-2xl rounded-tl-none text-xs text-gray-400 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce delay-75" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce delay-150" />
                </div>
                <span className="font-mono text-[10px]">Retrieving BM25 chunks & scoring cosine similarity...</span>
              </div>
            </div>
          )}
        </div>

        {/* Preset selections */}
        <div className="flex flex-wrap gap-2 py-3 border-t border-gray-800 shrink-0 overflow-x-auto">
          {PRESET_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              disabled={isLoading}
              className="text-[10px] bg-[#0d1117] hover:bg-emerald-950/20 border border-gray-800 hover:border-emerald-500/30 text-gray-300 hover:text-emerald-300 py-1.5 px-3 rounded-lg transition-colors whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Query Input area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputText);
          }}
          className="flex gap-2 shrink-0 pt-3 border-t border-gray-800"
        >
          <input
            type="text"
            id="rag_chat_input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Query details: e.g. 'Tell me about Alex Chen's AWS architecture and scale achievements'"
            className="flex-1 bg-[#0d1117] border border-gray-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2 text-xs text-gray-300 outline-none transition-all duration-150"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-800 disabled:text-gray-600 text-[#0d1117] font-semibold rounded-xl text-xs transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* RAGAS & DeepEval visual pipeline telemetry */}
      {showTrace && (
        <div id="telemetry_trace_drawer" className="bg-[#161b22] p-6 rounded-2xl border border-gray-800 h-[500px] flex flex-col">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-2 mb-3 pb-2 border-b border-gray-800">
            <Zap className="w-4 h-4" /> Active RAG Alignment Telemetry
          </h3>

          {!activeTrace ? (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-6 text-gray-500">
              <Cpu className="w-8 h-8 text-gray-700 animate-spin mb-1" />
              <span className="text-[11px] block font-mono">No active trace collected.</span>
              <span className="text-[9px] text-gray-600 mt-1 block">Telemetry logs are generated dynamically during active chatbot query synthesis.</span>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* Score evaluation grid */}
              <div className="p-3.5 bg-[#0d1117] rounded-xl border border-gray-800 space-y-3.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 block pb-1 border-b border-gray-800/40">DoubleEval Framework Calibration</span>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-400">RAGAS Faithfulness:</span>
                    <span className="font-mono text-emerald-400 font-extrabold">{(activeTrace.evaluation.faithfulness * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1 bg-gray-800 rounded-full">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${activeTrace.evaluation.faithfulness * 100}%` }} />
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-400">Context Precision:</span>
                    <span className="font-mono text-cyan-400 font-extrabold">{(activeTrace.evaluation.contextPrecision * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1 bg-gray-800 rounded-full">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${activeTrace.evaluation.contextPrecision * 100}%` }} />
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-400">Answer Relevancy:</span>
                    <span className="font-mono text-purple-400 font-extrabold">{(activeTrace.evaluation.answerRelevancy * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1 bg-gray-800 rounded-full">
                    <div className="h-full bg-purple-400 rounded-full" style={{ width: `${activeTrace.evaluation.answerRelevancy * 100}%` }} />
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-400">Hallucination Rate:</span>
                    <span className="font-mono text-red-400 font-bold">{(activeTrace.evaluation.hallucinationRate * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1 bg-gray-800 rounded-full">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${activeTrace.evaluation.hallucinationRate * 100}%` }} />
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 pt-1">
                    <span>Synthesizer Latency:</span>
                    <span>{activeTrace.evaluation.latencyMs}ms</span>
                  </div>
                </div>
              </div>

              {/* Retrieved Sources chunks list */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">BM25 Hybrid Retrieved Context Chunks</span>
                <div className="space-y-1.5">
                  {activeTrace.contexts.map((c, i) => (
                    <div key={i} className="p-2.5 bg-[#0d1117] border border-gray-800 rounded-lg space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-mono">
                        <span className="text-emerald-400 font-bold truncate pr-2">{c.source}</span>
                        <span className="text-gray-500 shrink-0">Score: {c.score}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-relaxed max-h-12 overflow-y-hidden text-ellipsis line-clamp-2">
                        {c.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
