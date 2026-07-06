/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ParsedResume, ATSResult } from "./types.js";
import { randomUUID } from "crypto";

export function calculateDeterministicATS(resume: ParsedResume): ATSResult {
  // Deterministic scoring logic:
  // Skills Match = 30%
  // Keyword Match = 30%
  // Experience Match = 20%
  // Education Match = 10%
  // Project Relevance = 10%

  // 1. Skills Match (30%)
  const hasHighdemandSkills = resume.skills.some(s => ["kubernetes", "docker", "aws", "ci/cd", "rust", "python", "typescript", "ai", "rag", "fastapi"].includes(s.toLowerCase()));
  const skillsCount = resume.skills.length;
  const skillsScore = Math.min(60 + (skillsCount * 1.5) + (hasHighdemandSkills ? 15 : 0), 100);

  // 2. Keyword Match (30%)
  const keywords = ["orchestrate", "modernize", "scale", "optimize", "secure", "pipeline", "collaborate", "deliver", "leadership", "design", "deploy"];
  const textLower = resume.rawText.toLowerCase();
  let keywordHits = 0;
  keywords.forEach(kw => {
    if (textLower.includes(kw)) keywordHits++;
  });
  const keywordScore = Math.min(50 + (keywordHits * 6), 100);

  // 3. Experience Match (20%)
  const experienceCount = resume.experience.length;
  let experienceScore = 50;
  if (experienceCount >= 3) experienceScore = 95;
  else if (experienceCount === 2) experienceScore = 85;
  else if (experienceCount === 1) experienceScore = 75;

  // 4. Education Match (10%)
  const educationScore = resume.education.length > 0 ? 95 : 40;

  // 5. Project Relevance (10%)
  const projectsCount = resume.projects.length;
  let projectScore = 50;
  if (projectsCount >= 3) projectScore = 95;
  else if (projectsCount === 2) projectScore = 85;
  else if (projectsCount === 1) projectScore = 70;

  const overallScore = Math.round(
    skillsScore * 0.3 +
    keywordScore * 0.3 +
    experienceScore * 0.2 +
    educationScore * 0.1 +
    projectScore * 0.1
  );

  const targetSkills = ["Python", "Docker", "Kubernetes", "AWS Cloud", "CI/CD Orchestration", "System Architecture", "Redis", "Unit Testing", "Microservices"];
  const missingSkills = targetSkills.filter(ts => !resume.skills.some(s => s.toLowerCase().includes(ts.toLowerCase()))).slice(0, 4);

  const missingKeywords = ["Architected", "Spearheaded", "Leveraged", "Bottleneck optimization", "Cloud Deployment"].filter(
    kw => !textLower.includes(kw.toLowerCase())
  );

  const improvementSuggestions = [
    "Elevate resume headers with clear visual hierarchies.",
    "Inject quantifiable highlights with absolute numeric metrics (e.g., speedups %, conversion rates).",
    "Define a concrete career summary containing technical leadership tags.",
    "Describe key systems and design architectural patterns clearly."
  ];

  if (missingSkills.length > 0) {
    improvementSuggestions.push(`Acquire and showcase expertise in ${missingSkills.join(", ")}.`);
  }

  return {
    id: "ats_" + randomUUID(),
    resumeId: resume.id,
    overallScore,
    breakdown: {
      skillsMatch: Math.round(skillsScore),
      keywordMatch: Math.round(keywordScore),
      experienceMatch: Math.round(experienceScore),
      educationMatch: Math.round(educationScore),
      projectRelevance: Math.round(projectScore)
    },
    missingKeywords,
    missingSkills,
    improvementSuggestions,
    roleTitleMatched: resume.experience?.[0]?.role || "Software Engineer",
    createdAt: new Date().toISOString()
  };
}
