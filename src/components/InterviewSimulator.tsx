/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MockInterviewResult, ParsedResume } from "../types.js";
import { HelpCircle, RefreshCw, Send, CheckCircle, Award, Target, MessageSquare, ArrowRight, BookOpen } from "lucide-react";

interface InterviewSimulatorProps {
  token: string;
  resume: ParsedResume;
}

export default function InterviewSimulator({ token, resume }: InterviewSimulatorProps) {
  const [session, setSession] = useState<MockInterviewResult | null>(null);
  const [targetRole, setTargetRole] = useState("AI Engineer");
  const [userAnswer, setUserAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCritique, setShowCritique] = useState(false);

  const startSimulator = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSession(null);
    setShowCritique(false);

    try {
      const res = await fetch("/api/resume/interview/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ resumeId: resume.id, targetRole })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Cannot boot interviewer script.");
      }

      setSession(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to start interview simulator.");
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim() || !session) return;

    setIsEvaluating(true);
    setErrorMessage(null);

    const activeQuestion = session.questions[session.currentQuestionIndex];

    try {
      const res = await fetch("/api/resume/interview/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          resumeId: resume.id,
          questionId: activeQuestion.id,
          userAnswer
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to evaluate answer.");
      }

      setSession(data);
      setShowCritique(true);
      setUserAnswer("");
    } catch (err: any) {
      setErrorMessage(err.message || "Interviewer lost connection. Please submit again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const advanceInterviewer = () => {
    setShowCritique(false);
    setErrorMessage(null);
  };

  return (
    <div id="interview_simulator_workspace" className="bg-[#161b22] p-6 rounded-2xl border border-gray-800 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-400 animate-spin" />
            AI Technical Interview Simulator
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Validates your profile with custom-generated scenario questions, scoring answers and outputting technical evaluations.
          </p>
        </div>
        {!session && !isLoading && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Target Role: e.g. RAG Platform SDE"
              className="bg-[#0d1117] border border-gray-800 text-xs text-gray-300 rounded-lg px-3 py-1.5 outline-none focus:border-emerald-500"
            />
            <button
              id="start_mock_interview"
              onClick={startSimulator}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-[#0d1117] transition-colors shrink-0"
            >
              Start Interview
            </button>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="h-64 flex flex-col justify-center items-center text-center p-6 text-gray-500">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
          <span className="text-xs font-mono">Generating scenario tests from parsed skills and system highlights...</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-950/20 border border-red-900/50 text-red-400 rounded-xl text-xs">
          {errorMessage}
        </div>
      )}

      {!session && !isLoading && (
        <div className="h-44 border border-dashed border-gray-800 rounded-2xl flex flex-col justify-center items-center text-center p-6 bg-[#0d1117]/30">
          <HelpCircle className="w-10 h-10 text-gray-600 mb-2" />
          <span className="text-xs text-gray-400 font-medium font-mono">Interviewer Booth Idle</span>
          <span className="text-[10px] text-gray-500 mt-1">Define target candidate scope to trigger technical mock scenarios.</span>
        </div>
      )}

      {session && !isLoading && (
        <div id="active_interviewer_layout" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question and answer panel */}
          <div className="lg:col-span-2 space-y-4">
            {session.completed ? (
              <div id="interview_completion_card" className="p-6 bg-[#0d1117] border border-gray-850 rounded-2xl text-center space-y-4">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-500/10 text-emerald-400">
                  <Award className="w-8 h-8 animate-bounce" />
                </div>
                <h3 className="text-lg font-bold text-gray-100">Technical Interview Assessment Finished!</h3>
                <p className="text-xs text-gray-400 leading-relaxed max-w-lg mx-auto">
                  {session.overallPerformanceSummary}
                </p>
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-2">
                  <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800">
                    <div className="text-2xl font-bold text-emerald-400 font-mono">
                      {Math.round(session.answers.reduce((acc, curr) => acc + curr.score, 0) / session.answers.length || 0)}%
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase mt-1">Avg Score</div>
                  </div>
                  <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800">
                    <div className="text-2xl font-bold text-cyan-400 font-mono">{session.questions.length}</div>
                    <div className="text-[10px] text-gray-400 uppercase mt-1">Scenarios</div>
                  </div>
                  <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800">
                    <div className="text-2xl font-bold text-emerald-400 font-mono">PASS</div>
                    <div className="text-[10px] text-gray-400 uppercase mt-1">Status</div>
                  </div>
                </div>
                <button
                  onClick={startSimulator}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-[#0d1117] transition-colors"
                >
                  Restart Mocks Session
                </button>
              </div>
            ) : (
              <div id="active_question_card" className="space-y-4">
                {/* Active Question banner */}
                <div className="bg-[#0d1117] p-5 rounded-2xl border border-gray-800 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500" />
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-cyan-400 font-bold uppercase tracking-wider">{session.questions[session.currentQuestionIndex].focusArea}</span>
                    <span className="text-gray-500">QUESTION {session.currentQuestionIndex + 1} of {session.questions.length}</span>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed font-sans font-medium">
                    {session.questions[session.currentQuestionIndex].question}
                  </p>
                  <div className="text-[10px] text-gray-500 font-mono">
                    Must cover concepts: {session.questions[session.currentQuestionIndex].expectedConcepts.join(", ")}
                  </div>
                </div>

                {/* Answer area */}
                {!showCritique ? (
                  <div className="space-y-3.5">
                    <textarea
                      id="interviewer_answer_textarea"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Write your response, highlighting practical details, architectures, or metrics..."
                      className="w-full h-40 bg-[#0d1117] border border-gray-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-4 text-xs font-sans text-gray-350 outline-none transition-all duration-150 resize-y"
                    />
                    <div className="flex justify-end">
                      <button
                        id="submit_interviewer_answer"
                        onClick={submitAnswer}
                        disabled={isEvaluating || !userAnswer.trim()}
                        className="px-6 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-[#0d1117] flex items-center gap-2 transition-colors disabled:bg-gray-800 disabled:text-gray-600"
                      >
                        {isEvaluating ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-[#0d1117]" /> Evaluating Answer...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 text-[#0d1117]" /> Analyze & Submit response
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#0d1117] p-5 rounded-2xl border border-gray-800 space-y-4">
                    <div className="flex justify-between items-center pb-2.5 border-b border-gray-800/50">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-extrabold text-emerald-400 font-mono bg-emerald-500/5 border border-emerald-500/20 px-3.5 py-1 rounded-lg">
                          {session.answers[session.answers.length - 1].score}%
                        </span>
                        <span className="text-xs font-bold text-gray-200">Critique & Performance Grade</span>
                      </div>
                      <button
                        onClick={advanceInterviewer}
                        className="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      >
                        Advance Questions <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-3.5 text-xs font-sans">
                      <div className="space-y-1">
                        <div className="font-bold text-gray-300">Interviewer Critique Insights:</div>
                        <p className="text-gray-400 leading-relaxed text-[11.5px]">
                          {session.answers[session.answers.length - 1].feedback}
                        </p>
                      </div>

                      <div className="p-3.5 bg-emerald-950/10 border border-emerald-900/40 rounded-xl space-y-1.5">
                        <div className="font-bold text-emerald-300 flex items-center gap-1">
                          <BookOpen className="w-4 h-4" /> Recommended Elite Answer Strategy:
                        </div>
                        <p className="text-gray-400 leading-relaxed text-[11px]">
                          {session.answers[session.answers.length - 1].correctExplanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Side assessment tracker */}
          <div className="bg-[#0d1117] p-5 rounded-2xl border border-gray-800 h-[380px] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block border-b border-gray-800/40 pb-2">Completed Answers Ledger</span>
              <div className="space-y-2 pt-3 max-h-[260px] overflow-y-auto pr-1">
                {session.answers.length === 0 ? (
                  <div className="text-center py-12 text-gray-600 text-xs font-mono">Answers will appear sequentially here.</div>
                ) : (
                  session.answers.map((ans, idx) => (
                    <div key={idx} className="p-2.5 bg-[#161b22]/50 border border-gray-850 rounded-xl flex justify-between items-center text-xs">
                      <div className="space-y-0.5 max-w-[130px]">
                        <div className="font-bold text-gray-300 truncate">Q_{idx + 1}: focus metrics</div>
                        <div className="text-[10px] text-gray-500 truncate font-mono">Evaluated successfully.</div>
                      </div>
                      <span className="font-extrabold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 font-mono rounded border border-emerald-500/10">{ans.score}%</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="pt-2 border-t border-gray-800/40 mt-1">
              <span className="text-[9.5px] text-gray-500 font-mono block text-center">Interviewer calibration: active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
