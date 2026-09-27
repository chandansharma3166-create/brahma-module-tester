import mammoth from 'mammoth';
import { Question } from './types';

/**
 * Parses answer key text formatted like: "1 (2) 2(3) 3(1) 4(2)"
 * or line-by-line format.
 */
export function parseAnswerKey(text: string): Record<number, number> {
  const map: Record<number, number> = {};
  const pattern = /(\d+)\s*[\(\[]?([1-4A-Da-d])[\)\]]?/g;
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
  const rawText = result.value;
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  const answerMap = parseAnswerKey(answerKeyText);
  const questions: Question[] = [];

  let currentQ: Question | null = null;

  const qRegex = /^(?:Q(?:uestion)?\s*)?(\d+)[\.\)]\s*(.*)/i;
  const optRegex = /^[\(\[]?([A-Da-d1-4])[\.\)\]]\s*(.*)/;

  for (const line of lines) {
    const qMatch = line.match(qRegex);
    const optMatch = line.match(optRegex);

    if (qMatch && !optMatch) {
      if (currentQ && currentQ.options.length > 0) {
        questions.push(currentQ);
      }
      const qNum = parseInt(qMatch[1], 10);
      currentQ = {
        id: qNum,
        question: qMatch[2].trim(),
        options: [],
        correctOption: answerMap[qNum] || undefined,
      };
    } else if (optMatch && currentQ) {
      currentQ.options.push(optMatch[2].trim());
    } else if (currentQ) {
      // Append multi-line question text or formula lines
      if (currentQ.options.length === 0) {
        currentQ.question += ' ' + line;
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