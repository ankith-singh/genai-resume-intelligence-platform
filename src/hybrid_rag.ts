/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { generateEmbedding } from "./gemini_service.js";
import { dbStore } from "./database_store.js";
import { ResumeChunk, EmbeddingStorageAdapter } from "./types.js";
import { randomUUID } from "crypto";

function l2Distance(a: number[], b: number[]): number {
  if (!a || !b) return Infinity;
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - (b[i] || 0), 2), 0));
}

function reciprocalRankFusion(rankings: Array<Array<{ id: string; score: number }>>, k = 60): Array<{ id: string; score: number }> {
  const fusionScores: Record<string, number> = {};
  for (const ranking of rankings) {
    ranking.forEach((item, index) => {
      const rank = index + 1;
      fusionScores[item.id] = (fusionScores[item.id] || 0) + 1 / (k + rank);
    });
  }
  return Object.entries(fusionScores)
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score);
}

export class LocalEmbeddingAdapter implements EmbeddingStorageAdapter {
  async saveChunk(chunk: ResumeChunk): Promise<void> {
    dbStore.saveResumeChunk(chunk);
  }
  async saveChunks(chunks: ResumeChunk[]): Promise<void> {
    chunks.forEach(chunk => dbStore.saveResumeChunk(chunk));
  }
  async searchSimilar(queryEmbedding: number[], limit: number = 3): Promise<Array<ResumeChunk & { score: number }>> {
    const allChunks = Object.values(dbStore.getResumeChunks());
    const scoredChunks = allChunks.map(chunk => {
      const distance = chunk.embedding ? l2Distance(chunk.embedding, queryEmbedding) : Infinity;
      // Convert L2 distance to a similarity score where closer to 0 means higher score
      const score = distance === Infinity ? 0 : 1 / (1 + distance);
      return { ...chunk, score };
    });
    return scoredChunks.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}

export class HybridRAGEngine {
  private chunks: ResumeChunk[] = [];
  private resumeId: string;
  private adapter: EmbeddingStorageAdapter;
  
  // BM25 Variables
  private k1 = 1.2;
  private b = 0.75;
  private docLengths: number[] = [];
  private avgDocLength = 0;
  private docTermFreqs: Array<Record<string, number>> = [];
  private idf: Record<string, number> = {};

  constructor(resumeId: string, resumeText: string, parsedData: any) {
    this.resumeId = resumeId;
    this.adapter = new LocalEmbeddingAdapter();
    this.createChunks(resumeText, parsedData);
    this.initializeBM25();
  }

  public async initializeEmbeddings(): Promise<void> {
    const existingChunks = Object.values(dbStore.getResumeChunks()).filter(c => c.resumeId === this.resumeId);
    if (existingChunks.length >= this.chunks.length) {
      this.chunks = existingChunks;
      return;
    }

    // Generate embeddings for new chunks
    for (const chunk of this.chunks) {
      if (!chunk.embedding) {
        chunk.embedding = await generateEmbedding(chunk.text);
        await this.adapter.saveChunk(chunk);
      }
    }
  }

  private createChunks(rawText: string, parsed: any) {
    const existingChunks = Object.values(dbStore.getResumeChunks()).filter(c => c.resumeId === this.resumeId);
    if (existingChunks.length > 0) {
      this.chunks = existingChunks;
      return;
    }

    const tempChunks: Array<{ text: string; source: string }> = [];

    // 1. Chunk from Skills
    if (parsed.skills && parsed.skills.length > 0) {
      tempChunks.push({
        text: `Technical Skills and Core Competencies: ${parsed.skills.join(", ")}`,
        source: "Skills Profile"
      });
    }

    // 2. Chunk from Experience List
    if (parsed.experience && parsed.experience.length > 0) {
      parsed.experience.forEach((exp: any, index: number) => {
        const bulletsText = Array.isArray(exp.highlights) ? exp.highlights.join(" ") : "";
        tempChunks.push({
          text: `Professional Experience: Role: ${exp.role} at ${exp.company} (${exp.duration}). Responsibilities and metrics: ${bulletsText}`,
          source: `Experience: ${exp.company}`
        });
      });
    }

    // 3. Chunk from Projects
    if (parsed.projects && parsed.projects.length > 0) {
      parsed.projects.forEach((proj: any, index: number) => {
        tempChunks.push({
          text: `Technical Project: Title: ${proj.title}. Key stack: ${Array.isArray(proj.technologies) ? proj.technologies.join(", ") : ""}. Case study & goals: ${proj.description}`,
          source: `Project: ${proj.title}`
        });
      });
    }

    // 4. Chunk from Education
    if (parsed.education && parsed.education.length > 0) {
      parsed.education.forEach((edu: any, index: number) => {
        tempChunks.push({
          text: `Educational Record: Title: ${edu.degree} from ${edu.institution} (${edu.year}). GPA or Honors: ${edu.gpa || "N/A"}`,
          source: "Education Profile"
        });
      });
    }

    // Fallback: If no structured chunks extracted, break down the raw text into paragraphs
    if (tempChunks.length === 0) {
      const paragraphs = rawText.split(/\n\s*\n/).filter(p => p.trim().length > 20);
      paragraphs.forEach((para, index) => {
        tempChunks.push({
          text: para.trim(),
          source: `General Section #${index + 1}`
        });
      });
    }

    this.chunks = tempChunks.map(tc => ({
      id: randomUUID(),
      resumeId: this.resumeId,
      text: tc.text,
      metadata: { section: tc.source }
    }));
  }

  private initializeBM25() {
    const N = this.chunks.length;
    let totalLength = 0;
    const docTokens: string[][] = [];

    // Tokenize each chunk
    this.chunks.forEach((chunk) => {
      const tokens = chunk.text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter(t => t.length > 2);
      
      docTokens.push(tokens);
      this.docLengths.push(tokens.length);
      totalLength += tokens.length;

      // Calculate term frequencies
      const termFreq: Record<string, number> = {};
      tokens.forEach((t) => {
        termFreq[t] = (termFreq[t] || 0) + 1;
      });
      this.docTermFreqs.push(termFreq);
    });

    this.avgDocLength = N > 0 ? totalLength / N : 0;

    // Calculate document frequencies & IDF
    const docFreq: Record<string, number> = {};
    docTokens.forEach((tokens) => {
      const uniqueTokens = new Set(tokens);
      uniqueTokens.forEach((t) => {
        docFreq[t] = (docFreq[t] || 0) + 1;
      });
    });

    Object.entries(docFreq).forEach(([term, df]) => {
      this.idf[term] = Math.log(1 + (N - df + 0.5) / (df + 0.5));
    });
  }

  private computeBM25Score(chunkIndex: number, queryTerms: string[]): number {
    const docLen = this.docLengths[chunkIndex];
    const tfMap = this.docTermFreqs[chunkIndex];
    if (docLen === 0) return 0;

    let score = 0;
    queryTerms.forEach((term) => {
      const tf = tfMap[term] || 0;
      if (tf === 0) return;

      const idfWeight = this.idf[term] || 0;
      const numerator = tf * (this.k1 + 1);
      const denominator = tf + this.k1 * (1 - this.b + this.b * (docLen / this.avgDocLength));
      
      score += idfWeight * (numerator / denominator);
    });

    return score;
  }

  public async search(query: string, limit = 3) {
    const queryTerms = query
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(t => t.length > 2);

    // 1. BM25 Ranking
    const bm25Scores = this.chunks.map((chunk, index) => {
      const score = this.computeBM25Score(index, queryTerms);
      return { id: chunk.id, score };
    }).sort((a, b) => b.score - a.score);

    // 2. Vector Ranking (L2 Distance based)
    const queryEmbedding = await generateEmbedding(query);
    const vectorScores = this.chunks.map(chunk => {
      const distance = chunk.embedding ? l2Distance(chunk.embedding, queryEmbedding) : Infinity;
      const score = distance === Infinity ? 0 : 1 / (1 + distance);
      return { id: chunk.id, score };
    }).sort((a, b) => b.score - a.score);

    // 3. Reciprocal Rank Fusion
    const fusedRanking = reciprocalRankFusion([bm25Scores, vectorScores]);
    
    // 4. Return Top K chunks mapped to required output
    return fusedRanking.slice(0, limit).map(ranked => {
      const chunk = this.chunks.find(c => c.id === ranked.id)!;
      return {
        text: chunk.text,
        source: chunk.metadata.section,
        score: parseFloat(ranked.score.toFixed(3))
      };
    });
  }
}
