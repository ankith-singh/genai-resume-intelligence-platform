/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface ResumeSectionExperience {
  role: string;
  company: string;
  duration: string;
  highlights: string[];
}

export interface ResumeSectionProject {
  title: string;
  technologies: string[];
  description: string;
  relevanceScore?: number;
}

export interface ResumeSectionEducation {
  degree: string;
  institution: string;
  year: string;
  gpa?: string;
}

export interface ParsedResume {
  id: string;
  userId: string;
  filename: string;
  version: number; // 1, 2, etc.
  uploadedAt: string;
  rawText: string;
  
  // Parsed Engine Sections
  skills: string[];
  experience: ResumeSectionExperience[];
  projects: ResumeSectionProject[];
  education: ResumeSectionEducation[];
  certifications: string[];
}

export interface ATSScoreBreakdown {
  skillsMatch: number;      // 30% weight
  keywordMatch: number;     // 20% weight
  experienceMatch: number;  // 25% weight
  educationMatch: number;   // 10% weight
  projectRelevance: number; // 15% weight
}

export interface ATSResult {
  id: string;
  resumeId: string;
  overallScore: number;
  breakdown: ATSScoreBreakdown;
  missingKeywords: string[];
  missingSkills: string[];
  improvementSuggestions: string[];
  roleTitleMatched?: string;
  createdAt: string;
}

export interface JobMatchResult {
  id: string;
  resumeId: string;
  jobTitle: string;
  jobDescription: string;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  recruiterInsights: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  retrievedContexts?: Array<{ text: string; source: string; score: number }>;
  evaluation?: {
    faithfulness: number;
    contextPrecision: number;
    contextRecall: number;
    answerRelevancy: number;
    hallucinationRate: number;
    latencyMs: number;
  };
}

export interface AgentStepTrace {
  agentId: "resume_analysis" | "ats" | "career_coach" | "interview" | "improvement";
  agentName: string;
  status: "pending" | "running" | "completed" | "failed";
  message: string;
  output?: any;
  timestamp: string;
}

export interface MultiAgentWorkflowResult {
  id: string;
  resumeId: string;
  overallHealthStatus: string; // e.g. "Excellent", "Needs Optimization"
  traces: AgentStepTrace[];
  agentSummaries: {
    analysis: string;
    ats: string;
    careerCoach: string;
    interview: string;
    improvement: string;
  };
  createdAt: string;
}

export interface LearningRoadmapNode {
  topic: string;
  duration: string;
  milestones: string[];
  suggestedResources: string[];
}

export interface CareerCoachResult {
  id: string;
  resumeId: string;
  skillGapAnalysis: string[];
  recommendedRoles: string[];
  learningRoadmap: LearningRoadmapNode[];
  weeklyLearningPlan: string[];
  createdAt: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  focusArea: string; // e.g. "React Hooks", "System Design"
  expectedConcepts: string[];
}

export interface MockInterviewAnswer {
  questionId: string;
  userAnswer: string;
  score: number;
  feedback: string;
  correctExplanation: string;
  evaluatedAt: string;
}

export interface MockInterviewResult {
  id: string;
  resumeId: string;
  skillsAssessed: string[];
  questions: InterviewQuestion[];
  answers: MockInterviewAnswer[];
  currentQuestionIndex: number;
  completed: boolean;
  overallPerformanceSummary?: string;
}

export interface VersionComparison {
  resumeV1Id: string;
  resumeV2Id: string;
  scoreImprovement: number; // differential
  skillsAdded: string[];
  skillsRemoved: string[];
  betterKeywords: string[];
  weakAreasAddressed: string[];
  v1Overall: number;
  v2Overall: number;
}

export interface AnalyticsSummary {
  totalAnalyzed: number;
  averageAtsScore: number;
  frequentMissingSkills: Array<{ name: string; count: number }>;
  targetedRolesBreakdown: Array<{ name: string; count: number }>;
  userActivityHistory: Array<{ date: string; uploads: number; matches: number }>;
  avgLatencyMs: number;
}

// Evaluation telemetry store
export interface DoubleEvalLog {
  id: string;
  timestamp: string;
  apiPath: string;
  metrics: {
    faithfulness: number;
    contextPrecision: number;
    contextRecall: number;
    answerRelevancy: number;
    hallucinationRate: number;
    latencyMs: number;
  };
}

export interface ResumeChunk {
  id: string;
  resumeId: string;
  text: string;
  embedding?: number[];
  metadata: {
    section: string;
    startIndex?: number;
    endIndex?: number;
    [key: string]: any;
  };
}

export interface EmbeddingStorageAdapter {
  saveChunk(chunk: ResumeChunk): Promise<void>;
  saveChunks(chunks: ResumeChunk[]): Promise<void>;
  searchSimilar(queryEmbedding: number[], limit?: number): Promise<Array<ResumeChunk & { score: number }>>;
}
