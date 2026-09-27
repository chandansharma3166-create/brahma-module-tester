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

export async function parseDocxFile(
  arrayBuffer: ArrayBuffer,
  answerKeyText: string
): Promise<Question[]> {
  const result = await mammoth.extractRawText({ arrayBuffer });
  const rawText = result.value || '';

  if (!rawText.trim()) {
    throw new Error('Word document appears to be empty or contains unreadable text.');
  }

  const lines = rawText
    .replace(/\u00A0/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const answerMap = parseAnswerKey(answerKeyText);
  const questions: Question[] = [];
  let currentQ: Question | null = null;

  // Question pattern: "1.", "2.", "Q1.", "Question 1:" (number not enclosed in brackets)
  const qRegex = /^(?:Q(?:uestion)?\.?\s*)?(\d+)[\.\:\-\)]\s*(.*)/i;

  // Option pattern: "(1)", "(2)", "[1]", "(A)", "(a)" (enclosed in brackets)
  const bracketOptRegex = /^[\(\[]\s*([1-4A-Da-d])\s*[\)\]]\s*(.*)/;

  // Fallback option pattern: "A)", "B)", "a.", "b."
  const letterOptRegex = /^([A-Da-d])[\.\)\-]\s*(.*)/;

  for (const line of lines) {
    const bracketMatch = line.match(bracketOptRegex);
    const letterMatch = line.match(letterOptRegex);
    const qMatch = line.match(qRegex);

    // If it's a bracketed option like (1), (2), (3), (4)
    if (bracketMatch && currentQ && currentQ.options.length < 4) {
      currentQ.options.push(bracketMatch[2].trim());
    } 
    // If it's a lettered option like A), B), C), D)
    else if (letterMatch && currentQ && currentQ.options.length < 4) {
      currentQ.options.push(letterMatch[2].trim());
    } 
    // If it starts with a question number like 1. or 2.
    else if (qMatch) {
      if (currentQ && currentQ.options.length > 0) {
        questions.push(currentQ);
      }
      const qNum = parseInt(qMatch[1], 10);
      currentQ = {
        id: qNum,
        question: (qMatch[2] || '').trim(),
        options: [],
        correctOption: answerMap[qNum] || undefined,
      };
    } 
    // Multiline continuation
    else if (currentQ) {
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