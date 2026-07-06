/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { dbStore } from "./database_store.js";
import { generateInterviewQuestions, evaluateInterviewAnswer, generateInterviewSummary } from "./gemini_service.js";
import { MockInterviewResult, MockInterviewAnswer, ParsedResume } from "./types.js";
import { randomUUID } from "crypto";

export class InterviewSimulator {
  
  public async startSession(resume: ParsedResume, targetRole: string): Promise<MockInterviewResult> {
    const resumeText = resume.rawText;
    
    const questions = await generateInterviewQuestions(resumeText, targetRole);
    
    const session: MockInterviewResult = {
      id: "int_" + randomUUID(),
      resumeId: resume.id,
      skillsAssessed: resume.skills.slice(0, 5),
      questions,
      answers: [],
      currentQuestionIndex: 0,
      completed: false
    };

    dbStore.saveInterviewSession(session);
    return session;
  }

  public getSession(resumeId: string): MockInterviewResult | undefined {
    return dbStore.getInterviewSession(resumeId);
  }

  public async submitAnswer(resumeId: string, questionId: string, userAnswer: string): Promise<MockInterviewAnswer> {
    const session = dbStore.getInterviewSession(resumeId);
    if (!session) throw new Error("Session not found");
    if (session.completed) throw new Error("Session already completed");

    const question = session.questions.find(q => q.id === questionId);
    if (!question) throw new Error("Question not found");

    const evaluation = await evaluateInterviewAnswer(question.question, question.expectedConcepts, userAnswer);
    
    const answer: MockInterviewAnswer = {
      questionId,
      userAnswer,
      score: evaluation.score,
      feedback: evaluation.feedback,
      correctExplanation: evaluation.correctExplanation,
      evaluatedAt: new Date().toISOString()
    };

    session.answers.push(answer);
    
    if (session.answers.length >= session.questions.length) {
      session.completed = true;
      session.overallPerformanceSummary = await generateInterviewSummary(session.answers);
    } else {
      session.currentQuestionIndex++;
    }

    dbStore.saveInterviewSession(session);
    return answer;
  }
}

export const interviewSimulator = new InterviewSimulator();
