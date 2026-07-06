/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, LogIn, Key, Compass, ShieldAlert, Sparkles, Send } from "lucide-react";

interface AuthScreenProps {
  onAuthSuccess: (token: string, user: any) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Quick preset account creator for immediate login ease (excellent for interviews)
  const handleQuickLogin = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      // First, attempt to login with a fallback user. If does not exist, register them on-the-fly!
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "guest.engineer@genai-intelligence.com", password: "preset_password" })
      });
      
      const loginData = await loginRes.json();
      if (loginRes.ok) {
        onAuthSuccess(loginData.token, loginData.user);
        return;
      }

      // Automatically register guest if not found
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Guest AI Engineer",
          email: "guest.engineer@genai-intelligence.com",
          password: "preset_password"
        })
      });
      const regData = await regRes.json();
      if (regRes.ok) {
        onAuthSuccess(regData.token, regData.user);
      } else {
        setFeedback({ message: regData.error || "Quick login failed.", isError: true });
      }
    } catch (e) {
      setFeedback({ message: "Network connection breakdown.", isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    const endpoint = isResetting 
      ? "/api/auth/reset-password" 
      : isRegistering 
        ? "/api/auth/register" 
        : "/api/auth/login";

    const payload = isResetting 
      ? { email } 
      : isRegistering 
        ? { email, password, name } 
        : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) {
        setFeedback({ message: data.error || "An error occurred.", isError: true });
      } else {
        if (isResetting) {
          setFeedback({ message: data.message || "Reset link dispatched.", isError: false });
        } else {
          onAuthSuccess(data.token, data.user);
        }
      }
    } catch (err) {
      setFeedback({ message: "Failed connectivity to resume authentication services.", isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="auth_container" className="min-h-screen bg-[#0d1117] text-gray-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Decorative clean ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl" />

      <div className="max-w-md w-full z-10 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-400 mb-2">
            <Compass className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            GenAI Resume Intelligence
          </h1>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Interactive RAG platform with hybrid search, weighted ATS evaluation, and multi-agent career planning.
          </p>
        </div>

        <div className="bg-[#161b22] p-8 rounded-2xl border border-gray-800 shadow-xl space-y-6">
          <div className="flex border-b border-gray-800 pb-1">
            <button
              id="tab_login"
              className={`flex-1 pb-3 text-sm font-semibold transition-colors duration-150 relative ${
                !isRegistering && !isResetting ? "text-emerald-400" : "text-gray-400 hover:text-gray-200"
              }`}
              onClick={() => {
                setIsRegistering(false);
                setIsResetting(false);
                setFeedback(null);
              }}
            >
              Sign In
              {!isRegistering && !isResetting && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />
              )}
            </button>
            <button
              id="tab_register"
              className={`flex-1 pb-3 text-sm font-semibold transition-colors duration-150 relative ${
                isRegistering && !isResetting ? "text-emerald-400" : "text-gray-400 hover:text-gray-200"
              }`}
              onClick={() => {
                setIsRegistering(true);
                setIsResetting(false);
                setFeedback(null);
              }}
            >
              Sign Up
              {isRegistering && !isResetting && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />
              )}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alexis Carter"
                    className="w-full bg-[#0d1117] border border-gray-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-100 outline-none transition-all duration-150"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <LogIn className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-[#0d1117] border border-gray-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-100 outline-none transition-all duration-150"
                />
              </div>
            </div>

            {!isResetting && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
                  {!isRegistering && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetting(true);
                        setFeedback(null);
                      }}
                      className="text-xs text-cyan-400 hover:underline hover:text-cyan-300"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0d1117] border border-gray-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-100 outline-none transition-all duration-150"
                  />
                </div>
              </div>
            )}

            {feedback && (
              <div className={`p-3 rounded-xl border flex items-start gap-2 text-xs ${
                feedback.isError 
                  ? "bg-red-950/20 border-red-900/50 text-red-400" 
                  : "bg-emerald-950/20 border-emerald-900/50 text-emerald-400"
              }`}>
                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{feedback.message}</span>
              </div>
            )}

            <button
              id="btn_auth_submit"
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium py-2.5 rounded-xl text-sm transition-all duration-150 shadow-md flex items-center justify-center gap-2"
            >
              {isLoading ? "Synchronizing..." : isResetting ? "Trigger Reset Link" : isRegistering ? "Create AI Studio Account" : "Access Platform"}
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-800"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-xs uppercase tracking-wider">Demo Quick Access</span>
            <div className="flex-grow border-t border-gray-800"></div>
          </div>

          <button
            id="btn_guest_login"
            onClick={handleQuickLogin}
            disabled={isLoading}
            className="w-full bg-[#1f2937]/50 border border-emerald-500/30 hover:bg-emerald-950/20 text-emerald-400 font-medium py-2.5 rounded-xl text-sm transition-all duration-150 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Launch Instant Interview Guest Role
          </button>
        </div>
      </div>
    </div>
  );
}
