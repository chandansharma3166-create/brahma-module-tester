'use client';

import React, { useState } from 'react';
import { Award, CheckCircle, XCircle, MinusCircle, RotateCcw, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { Question, TestResult } from '../lib/types';

interface TestAnalysisProps {
  result: TestResult;
  questions: Question[];
  userAnswers: Record<number, number>;
  onRetake: () => void;
}

export default function TestAnalysis({ result, questions, userAnswers, onRetake }: TestAnalysisProps) {
  const [showReview, setShowReview] = useState(true);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Scorecard</span>
            <h1 className="text-2xl font-bold text-slate-800">{result.testTitle}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Completed on {result.date} • Time Taken: {formatDuration(result.timeTakenSeconds)}
            </p>
          </div>
        </div>

        <button
          onClick={onRetake}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition"
        >
          <RotateCcw className="w-4 h-4" /> Take Another Test
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-center">
          <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Total Score</p>
          <p className="text-3xl font-extrabold text-blue-600">
            {result.score} <span className="text-sm font-normal text-slate-400">/ {result.maxScore}</span>
          </p>
        </div>

        {/* Accuracy */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-center">
          <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Accuracy</p>
          <p className="text-3xl font-extrabold text-indigo-600">{result.accuracy}%</p>
        </div>

        {/* Correct */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1">
            <CheckCircle className="w-4 h-4" />
            <p className="text-xs font-semibold uppercase">Correct</p>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">{result.correct}</p>
        </div>

        {/* Incorrect & Skipped */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1.5 text-rose-500 mb-1">
            <XCircle className="w-4 h-4" />
            <p className="text-xs font-semibold uppercase">Wrong / Unattempted</p>
          </div>
          <p className="text-2xl font-extrabold text-rose-500">
            {result.incorrect}{' '}
            <span className="text-sm font-normal text-slate-400">({result.unattempted} skipped)</span>
          </p>
        </div>
      </div>

      {/* Question Review Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <button
          onClick={() => setShowReview((prev) => !prev)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-bold text-slate-800">Detailed Question Review</h2>
          </div>
          {showReview ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {showReview && (
          <div className="mt-6 space-y-6 divide-y divide-slate-100">
            {questions.map((q, idx) => {
              const selected = userAnswers[q.id];
              const isCorrect = q.correctOption !== undefined && selected === q.correctOption;
              const isUnattempted = selected === undefined;

              return (
                <div key={q.id} className="pt-6 first:pt-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">Question {idx + 1}</span>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <CheckCircle className="w-3.5 h-3.5" /> Correct (+4)
                      </span>
                    ) : isUnattempted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                        <MinusCircle className="w-3.5 h-3.5" /> Unattempted (0)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect (-1)
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-medium text-slate-900 mb-3 whitespace-pre-line">{q.question}</p>

                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const optNum = optIdx + 1;
                      const isUserChoice = selected === optNum;
                      const isCorrectChoice = q.correctOption === optNum;

                      let rowStyle = 'border-slate-200 bg-slate-50 text-slate-700';
                      if (isCorrectChoice) {
                        rowStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium';
                      } else if (isUserChoice && !isCorrect) {
                        rowStyle = 'border-rose-400 bg-rose-50 text-rose-900';
                      }

                      return (
                        <div key={optNum} className={`flex items-start gap-3 p-3 rounded-lg border text-xs ${rowStyle}`}>
                          <span className="font-bold flex-shrink-0">Option {optNum}:</span>
                          <span className="flex-1">{opt}</span>
                          {isUserChoice && (
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-white/60 border border-current">
                              Your Choice
                            </span>
                          )}
                          {isCorrectChoice && (
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-600 text-white">
                              Correct Key
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}