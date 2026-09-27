'use client';

import React, { useState, useEffect } from 'react';
import { 
  Award, CheckCircle, XCircle, MinusCircle, 
  RotateCcw, Eye, ChevronDown, ChevronUp, 
  Bookmark, BookmarkCheck, Play 
} from 'lucide-react';
import { Question, TestResult, BookmarkedQuestion } from '../lib/types';

interface TestAnalysisProps {
  result: TestResult;
  questions: Question[];
  userAnswers: Record<number, number>;
  onRetake: () => void;
  onReattempt: () => void;
}

export default function TestAnalysis({ 
  result, 
  questions, 
  userAnswers, 
  onRetake, 
  onReattempt 
}: TestAnalysisProps) {
  const [showReview, setShowReview] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());

  // Load existing bookmarks for this session
  useEffect(() => {
    try {
      const stored = localStorage.getItem('brahma_bookmarked_questions');
      if (stored) {
        const bookmarks: BookmarkedQuestion[] = JSON.parse(stored);
        const ids = new Set(bookmarks.map((b) => b.question.id));
        setBookmarkedIds(ids);
      }
    } catch (e) {
      console.error('Failed to load bookmarks', e);
    }
  }, []);

  const toggleBookmark = (q: Question) => {
    try {
      const stored = localStorage.getItem('brahma_bookmarked_questions');
      let bookmarks: BookmarkedQuestion[] = stored ? JSON.parse(stored) : [];

      const alreadyBookmarked = bookmarks.some((b) => b.question.id === q.id && b.testTitle === result.testTitle);

      if (alreadyBookmarked) {
        bookmarks = bookmarks.filter((b) => !(b.question.id === q.id && b.testTitle === result.testTitle));
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.delete(q.id);
          return next;
        });
      } else {
        const newBookmark: BookmarkedQuestion = {
          id: `${result.testTitle}-${q.id}-${Date.now()}`,
          testTitle: result.testTitle,
          question: q,
          bookmarkedDate: new Date().toLocaleDateString('en-GB'),
        };
        bookmarks.unshift(newBookmark);
        setBookmarkedIds((prev) => new Set(prev).add(q.id));
      }

      localStorage.setItem('brahma_bookmarked_questions', JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Failed to update bookmarks', e);
    }
  };

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

        <div className="flex items-center gap-2">
          <button
            onClick={onReattempt}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition"
          >
            <Play className="w-4 h-4 fill-current" /> Reattempt Test
          </button>
          <button
            onClick={onRetake}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-sm font-semibold transition"
          >
            <RotateCcw className="w-4 h-4" /> New Test
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-center">
          <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Total Score</p>
          <p className="text-3xl font-extrabold text-blue-600">
            {result.score} <span className="text-sm font-normal text-slate-400">/ {result.maxScore}</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-center">
          <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Accuracy</p>
          <p className="text-3xl font-extrabold text-indigo-600">{result.accuracy}%</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1">
            <CheckCircle className="w-4 h-4" />
            <p className="text-xs font-semibold uppercase">Correct</p>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">{result.correct}</p>
        </div>

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

      {/* Question Review Section with Bookmarking */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <button
          onClick={() => setShowReview((prev) => !prev)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-bold text-slate-800">Detailed Question Review & Bookmarks</h2>
          </div>
          {showReview ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {showReview && (
          <div className="mt-6 space-y-6 divide-y divide-slate-100">
            {questions.map((q, idx) => {
              const selected = userAnswers[q.id];
              const isCorrect = q.correctOption !== undefined && selected === q.correctOption;
              const isUnattempted = selected === undefined;
              const isBookmarked = bookmarkedIds.has(q.id);

              return (
                <div key={q.id} className="pt-6 first:pt-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
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

                    {/* Bookmark Toggle Button */}
                    <button
                      type="button"
                      onClick={() => toggleBookmark(q)}
                      className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition font-medium ${
                        isBookmarked
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {isBookmarked ? (
                        <>
                          <BookmarkCheck className="w-4 h-4 text-amber-600" /> Bookmarked
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4 text-slate-400" /> Bookmark for Revision
                        </>
                      )}
                    </button>
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