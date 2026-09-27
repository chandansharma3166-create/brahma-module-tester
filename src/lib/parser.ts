import mammoth from 'mammoth';
import { Question } from './types';

/**
 * Parses answer key text formatted like: "1 (2) 2(3) 3(1) 4(2)" or "1(1) 2(2)"
 */
export function parseAnswerKey(text: string): Record<number, number> {
  const map: Record<number, number> = {};
  if (!text) return map;

  const pattern = /(\d+)\s*[\(\[]?\s*([1-4A-Da-d])\s*[\)\]]?/g;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    const qNum = parseInt(match[1], 10);
    const rawVal = match[2].toUpperCase();

    let optNum = 0;
    if (['1', '2', '3', '4'].includes(rawVal)) {
      optNum = parseInt(rawVal, 10);
    } else if (rawVal === 'A') optNum = 1;
    else if (rawVal === 'B') optNum = 2;
    else if (rawVal === 'C') optNum = 3;
    else if (rawVal === 'D') optNum = 4;

    if (optNum > 0) {
      map[qNum] = optNum;
    }
  }

  return map;
}

/**
 * Extracts questions and vertical options from a Word (.docx) ArrayBuffer
 */
export async function parseDocxFile(
  arrayBuffer: ArrayBuffer,
  answerKeyText: string
): Promise<Question[]> {
  const result = await mammoth.extractRawText({ arrayBuffer });
  const rawText = result.value || '';

  // Clean hidden non-breaking spaces and normalize line breaks
  const lines = rawText
    .replace(/\u00A0/g, ' ')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const answerMap = parseAnswerKey(answerKeyText);
  const questions: Question[] = [];

  let currentQ: Question | null = null;

  // Matches: "1.", "1)", "Q1.", "Q.1", "Question 1:"
  const qRegex = /^(?:Q(?:uestion)?\.?\s*)?(\d+)[\.\)]\s*(.*)/i;

  // Matches: "(1)", "(A)", "1)", "A)", "1.", "A."
  const optRegex = /^[\(\[]?([1-4A-Da-d])[\.\)\]]\s*(.*)/;

  for (const line of lines) {
    const optMatch = line.match(optRegex);
    const qMatch = line.match(qRegex);

    // Prioritize option matching if already inside a question block
    if (optMatch && currentQ) {
      const optText = optMatch[2]?.trim() || '';
      currentQ.options.push(optText);
    } else if (qMatch) {
      if (currentQ && currentQ.options.length > 0) {
        questions.push(currentQ);
      }
      const qNum = parseInt(qMatch[1], 10);
      currentQ = {
        id: qNum,
        question: qMatch[2]?.trim() || '',
        options: [],
        correctOption: answerMap[qNum] || undefined,
      };
    } else if (currentQ) {
      // Append multi-line question text or formula lines
      if (currentQ.options.length === 0) {
        currentQ.question += (currentQ.question ? ' ' : '') + line;
      } else {
        const lastIdx = currentQ.options.length - 1;
        currentQ.options[lastIdx] += ' ' + line;
      }
    }
  }

  if (currentQ && currentQ.options.length > 0) {
    questions.push(currentQ);
  }

  return questions;
}