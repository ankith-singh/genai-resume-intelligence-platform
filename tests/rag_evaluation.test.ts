/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from "vitest";
import { calculateATSStats } from "../src/gemini_service.js";
import { HybridRAGEngine } from "../src/hybrid_rag.js";

describe("Resume Platform Automated Spec Checks", () => {
  const dummyResume = {
    id: "test",
    userId: "test",
    version: 1,
    filename: "alex_test.txt",
    uploadedAt: new Date().toISOString(),
    rawText: "Experienced Software Engineer. Designed Python microservices. Deployed Docker.",
    skills: ["Python", "Docker", "Git", "React"],
    experience: [
      {
        role: "Software SDE",
        company: "Venture Corp",
        duration: "2 years",
        highlights: ["Wrote high-throughput algorithms achieving 40% speed up metrics."]
      }
    ],
    projects: [],
    education: [],
    certifications: []
  };

  it("should verify static ATS rule weights successfully", () => {
    const stats = calculateATSStats(dummyResume);
    expect(stats.overallScore).toBeGreaterThan(40);
    expect(stats.overallScore).toBeLessThan(100);
    expect(stats.missingSkills.length).toBeGreaterThanOrEqual(1);
  });

  it("should evaluate hybrid index similarity ranking accurately", async () => {
    const engine = new HybridRAGEngine("test", dummyResume.rawText, dummyResume);
    await engine.initializeEmbeddings();
    const results = await engine.search("python backend deployments", 2);
    expect(results).toHaveLength(2);
    // Highest ranked match should naturally relate to keywords "Python" and "Deployed"
    expect(results[0].text.toLowerCase()).toContain("python");
  });
});
