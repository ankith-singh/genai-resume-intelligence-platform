# System Architecture & Design Blueprint

This document details the production-grade engineering design of the **GenAI Resume Intelligence Platform**.

## 1. RAG Retrieval Pipeline (Hybrid Search)

Standard vector retrieval is prone to omitting exact-match jargon tags (e.g., "FASTAPI", "AWS EC2") critical to corporate ATS systems. To address this, the platform implements a **BM25 & Vector Hybrid Retrieval RAG Pipeline**:

```
                  ┌────────────────────────────────────────┐
                  │          Uploaded Resume text          │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                        ┌──────────────────────────┐
                        │ Logical Section Chunking │
                        └─────────────┬────────────┘
                                      │
                   ┌──────────────────┴──────────────────┐
                   ▼                                     ▼
      ┌─────────────────────────┐           ┌────────────────────────┐
      │  Classical Lexical TF   │           │ Vector cosine metrics  │
      │  BM25 Keyword Scoring   │           │   Semantic Matchings   │
      └────────────────┬────────┘           └────────────┬───────────┘
                       │                                 │
                       └────────────────┬────────────────┘
                                        │ (Linear Reciprocal weights)
                                        ▼
                      ┌───────────────────────────────────┐
                      │    Hybrid Search Score Ranker     │
                      └─────────────────┬─────────────────┘
                                        │
                                        ▼ (Top 3 Context Nodes)
                      ┌───────────────────────────────────┐
                      │    Context-Aware Gemini Prompt    │
                      └─────────────────┬─────────────────┘
                                        ▼
                      ┌───────────────────────────────────┐
                      │  Dual RAGAS / DeepEval Evaluator │
                      └───────────────────────────────────┘
```

### Retrieval Formulas
- **BM25 Lexical Score**: 
  $$Score_{BM25}(D, Q) = \sum_{i=1}^{n} IDF(q_i) \cdot \frac{f(q_i, D) \cdot (k_1 + 1)}{f(q_i, D) + k_1 \cdot \left(1 - b + b \cdot \frac{|D|}{avgdl}\right)}$$
- **Semantic Score**: Normalised token occurrence synonym matching.
- **Combined Hybrid Score**:
  $$Score_{Hybrid} = 0.4 \cdot Score_{BM25\_Normalized} + 0.6 \cdot Score_{Semantic}$$

---

## 2. Multi-Agent Orchestration Nodes (LangGraph Model)

The multi-agent workflow is modeled using structured routing states, tracking nodes in chronological and cyclic conditions:

1. **Resume Analysis Agent**: Validates academic and highlights presence. Passes details to ATS.
2. **ATS Optimization Agent**: Compares action patterns. Passes recommendations.
3. **Career Coaching Agent**: Cross-references profiles for roadmap calibration.
4. **Interview simulator Agent**: Crafts scenario checkpoints.
5. **Resume Improver Agent**: Synthesizes and logs final telemetry parameters.

---

## 3. Telemetry Alignments (RAGAS & DeepEval)

During each RAG generation query, an LLM-assisted evaluating loop runs server-side to calculate alignment calibration scores:
- **Faithfulness**: Counts whether sentences in synthesized answer derive strictly from source chunks.
- **Context Precision**: Determines ranking position accuracy of keyword elements.
- **Answer Relevancy**: Verifies if answer matches query vectors.
- **Hallucination Rate**: Scores factual consistency.
- **Latency**: Monitors system processing bounds in milliseconds.
