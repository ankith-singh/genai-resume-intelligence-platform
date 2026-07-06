/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Upload, FileText, CheckCircle, Database, ChevronRight, Play, RefreshCw } from "lucide-react";

interface UploadSectionProps {
  token: string;
  onUploadSuccess: (resume: any, atsResult: any) => void;
}

const SAMPLE_AI_ENGINEER = `NAME: ALEX CHEN
EMAIL: alex.chen@genai-systems.io
ROLE: Senior AI & GenAI Engineer

PROFESSIONAL SUMMARY:
Highly innovative Senior AI Systems Engineer with 5+ years of experience design and deploying enterprise-grade RAG pipelines, multi-agent frameworks, and high-performance microservices. Spearheaded deep neural integrations and optimized search latency by 40%. Exceptionally skilled at bridging LLMs with production workloads.

TECHNICAL SKILLS:
- Languages: Python, TypeScript, Java, Rust, SQL
- Frame-works & SDKs: FastAPI, Express, React, LangChain, LangGraph, LlamaIndex, TensorFlow
- Databases & Vectors: PostgreSQL, Redis, Pinecone, FAISS, Qdrant
- Infrastructure: AWS, Docker, Kubernetes, Terraform, CircleCI

EXPERIENCE:
Senior AI Platform Engineer | Cognitive Solutions Inc. (2022 - Present)
- Architected an enterprise-grade retrieval-augmented generation (RAG) system handling 1.5 million monthly search queries, optimizing context recall to 96%.
- Designed custom agent workflows using LangGraph and function calling to automate customer service triaging, reducing operations expenses by $180k.
- Oversaw transition of API endpoints from Flask to high-throughput FastAPI, which increased maximum transactions per second from 300 to 1400.

AI Engineer | Synthetix Technology (2020 - 2022)
- Built interactive fine-tuning pipelines using PyTorch for specialized legal and healthcare BERT model variants.
- Deployed scalable Docker cluster networks across AWS ECS clusters facilitating real-time semantic logs processing.

EDUCATION:
Master of Science in Computer Science | Stanford University (2020)
- Specialization: Artificial Intelligence & Distributed Databases. GPA: 3.9/4.0

CERTIFICATIONS:
- AWS Certified Solutions Architect - Professional
- Google Cloud Certified Professional Data Engineer`;

const SAMPLE_FULLSTACK = `NAME: SARAH JENKINS
EMAIL: sarah.j@tech-ventures.co
ROLE: Full-Stack Developer

SUMMARY:
Detail-oriented Software Developer with 3+ years experience building responsive web interfaces and APIs. Focused on scalable React state design and standard relational database setups.

TECHNICAL SKILLS:
- Frontend: React, JavaScript, CSS3, Tailwind, Next.js
- Backend: Node.js, Express, MySQL, PostgreSQL
- Tools: Git, npm, Docker, Netlify, REST APIs

EXPERIENCE:
Full-Stack Developer | Innovate Web Corp (2023 - Present)
- Created responsive SaaS dashboards using React and context architectures.
- Developed backend API routes using Express and secured query executions.

Junior Engineer | Creative Software (2021 - 2023)
- Maintained web styles and refined database tables.

EDUCATION:
B.S. in Computer Science | Western Tech (2021)`;

export default function UploadSection({ token, onUploadSuccess }: UploadSectionProps) {
  const [filename, setFilename] = useState("resume_profile.txt");
  const [rawText, setRawText] = useState("");
  const [progress, setProgress] = useState<"idle" | "uploading" | "parsing" | "analyzing" | "completed">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePresetSelect = (preset: "ai" | "fullstack") => {
    if (preset === "ai") {
      setRawText(SAMPLE_AI_ENGINEER);
      setFilename("alex_chen_ai_engineer.txt");
    } else {
      setRawText(SAMPLE_FULLSTACK);
      setFilename("sarah_jenkins_software_dev.txt");
    }
    setErrorMessage(null);
  };

  const startAnalysis = async () => {
    if (!rawText.trim()) {
      setErrorMessage("Please input resume content or load a preset first.");
      return;
    }

    setErrorMessage(null);
    setProgress("uploading");

    try {
      // Step A: Show realistic progress progression to simulate backend actions
      setTimeout(() => setProgress("parsing"), 500);
      setTimeout(() => setProgress("analyzing"), 1200);

      // Make actual post upload
      const res = await fetch("/api/resume/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ filename, rawText })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Execution failed.");
      }

      setProgress("completed");
      setTimeout(() => {
        onUploadSuccess(data.resume, data.atsResult);
        setProgress("idle");
      }, 500);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to process resume parser request.");
      setProgress("idle");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawText(text || "");
    };
    reader.readAsText(file);
    setErrorMessage(null);
  };

  return (
    <div id="upload_workspace" className="bg-[#161b22] p-6 rounded-2xl border border-gray-800 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            Resume Processing Terminal
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Provide profile details either via standard text input, presets, or custom file attachments.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            id="preset_ai"
            onClick={() => handlePresetSelect("ai")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/30 transition-colors"
          >
            Load AI Engineer Preset
          </button>
          <button
            id="preset_fs"
            onClick={() => handlePresetSelect("fullstack")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/30 transition-colors"
          >
            Load Fullstack Preset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Paste Resume/CV Text Markups</span>
            <span className="text-xs text-gray-500 font-mono">{filename}</span>
          </div>
          <textarea
            id="raw_resume_textarea"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Introduce raw profile components: Name, Skills, Job History, Certifications..."
            className="w-full h-80 bg-[#0d1117] border border-gray-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-4 text-sm font-mono text-gray-300 outline-none transition-all duration-150 resize-y"
          />
        </div>

        <div className="space-y-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Attachment Upload</span>
          
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-800 hover:border-emerald-500/50 rounded-2xl p-6 bg-[#0d1117]/50 cursor-pointer group transition-colors h-48 text-center">
            <div className="space-y-2">
              <Upload className="w-8 h-8 text-gray-500 group-hover:text-emerald-400 transition-colors mx-auto" />
              <div className="text-sm font-semibold text-gray-300">Choose file or drag here</div>
              <div className="text-xs text-gray-500">Supports (.txt, .md, custom text dumps)</div>
            </div>
            <input
              type="file"
              accept=".txt,.md,.json,.html"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <div className="p-4 bg-[#0d1117]/80 rounded-xl border border-gray-800 text-xs text-gray-400 space-y-2">
            <div className="font-bold text-gray-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              State Machine Operations Included:
            </div>
            <div className="flex items-center gap-1"><ChevronRight className="w-3 h-3 text-emerald-500" /> 1. Gemini AI parsing blocks</div>
            <div className="flex items-center gap-1"><ChevronRight className="w-3 h-3 text-emerald-500" /> 2. RAG FAISS & BM25 hybrid indices</div>
            <div className="flex items-center gap-1"><ChevronRight className="w-3 h-3 text-emerald-500" /> 3. 5-Agent multi-workflow simulation</div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-950/20 border border-red-900/50 text-red-400 rounded-xl text-xs">
          {errorMessage}
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-gray-500 flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          RAG and LLMOps evaluation telemetry logging fully active.
        </div>

        <button
          id="btn_trigger_analysis"
          onClick={startAnalysis}
          disabled={progress !== "idle"}
          className="px-6 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-xl flex items-center gap-2 transition-all duration-150"
        >
          {progress === "idle" && (
            <>
              <Play className="w-4 h-4" /> Trigger Parser Pipeline
            </>
          )}

          {progress !== "idle" && (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              {progress === "uploading" && "Uploading to Cloud..."}
              {progress === "parsing" && "Gemini Dissecting Sections..."}
              {progress === "analyzing" && "Structuring RAG Index..."}
              {progress === "completed" && "Completed!"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
