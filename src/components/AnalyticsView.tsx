'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Award, Calendar, RotateCcw, 
  Trash2, BookmarkCheck, ArrowLeft, CheckCircle2, XCircle 
} from 'lucide-react';
import { TestResult, BookmarkedQuestion } from '../lib/types';

interface AnalyticsViewProps {
  history: TestResult[];
  onBack: () => void;
  onReattemptFromHistory: (result: TestResult) => void;
  onClearHistory: () => void;
}

export default function AnalyticsView({
  history,
  onBack,
  onReattemptFromHistory,
  onClearHistory,
}: AnalyticsViewProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'bookmarks'>('analytics');
  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('brahma_bookmarked_questions');
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load bookmarks', e);
    }
  }, []);

  const removeBookmark = (id: string) => {
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    try {
      localStorage.setItem('brahma_bookmarked_questions', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update bookmarks', e);
    }
  };

  // Metrics calculation
  const totalTests = history.length;
  const avgAccuracy = totalTests > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.accuracy, 0) / totalTests) 
    : 0;
  const highestScore = totalTests > 0 
    ? Math.max(...history.map((h) => h.score)) 
    : 0;

  // Chart data (chronological order)
  const chartData = [...history].reverse();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-200/70 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
              activeTab === 'analytics'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Performance Analytics
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
              activeTab === 'bookmarks'
                ? 'bg-white text-amber-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            Revision Notebook ({bookmarks.length})
          </button>
        </div>
      </div>

      {activeTab === 'analytics' ? (
        <>
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-xs uppercase font-bold tracking-wider">Total Tests Attempted</span>
              </div>
              <p className="text-3xl font-extrabold text-slate-800">{totalTests}</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span className="text-xs uppercase font-bold tracking-wider">Average Accuracy</span>
              </div>
              <p className="text-3xl font-extrabold text-indigo-600">{avgAccuracy}%</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span className="text-xs uppercase font-bold tracking-wider">Peak Score</span>
              </div>
              <p className="text-3xl font-extrabold text-emerald-600">{highestScore}</p>
            </div>
          </div>

          {/* Visual Progress Bar Chart */}
          {chartData.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-6">
                Score Progression Over Time
              </h3>
              <div className="flex items-end gap-3 h-48 pt-6 border-b border-slate-100 overflow-x-auto">
                {chartData.map((item, idx) => {
                  const percentage = Math.max(0, Math.min(100, Math.round((item.score / (item.maxScore || 1)) * 100)));
                  return (
                    <div key={item.id} className="flex-1 min-w-[48px] flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-[11px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition">
                        {item.score}
                      </span>
                      <div
                        style={{ height: `${percentage}%` }}
                        className="w-full max-w-[36px] bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-md transition-all group-hover:brightness-110"
                      />
                      <span className="text-[10px] text-slate-400 truncate max-w-[48px]">{item.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Attempt Log */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b mb-4">
              <h3 className="text-base font-bold text-slate-800">Test History & Reattempt Log</h3>
              {history.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No tests attempted yet.</p>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl gap-4 hover:border-slate-300 transition"
                  >
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{item.testTitle}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Attempted on <span className="font-medium text-slate-700">{item.date}</span> • {item.totalQuestions} Questions • Accuracy: {item.accuracy}%
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
                        <span className="text-emerald-600">+{item.correct} Correct</span>
                        <span className="text-rose-600">-{item.incorrect} Wrong</span>
                        <span className="text-slate-400">{item.unattempted} Skipped</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                      <span className="text-xl font-extrabold text-blue-600">
                        {item.score} <span className="text-xs text-slate-400 font-normal">/ {item.maxScore}</span>
                      </span>

                      {item.questionsSnapshot && item.questionsSnapshot.length > 0 && (
                        <button
                          onClick={() => onReattemptFromHistory(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Reattempt
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Revision Bookmarks Notebook */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b pb-4">
            <h3 className="text-base font-bold text-slate-800">Saved Revision Questions</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review tricky concepts and bookmarked problems from previous tests.
            </p>
          </div>

          {bookmarks.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-10">
              No questions bookmarked yet. Click &quot;Bookmark for Revision&quot; during your test scorecard review.
            </p>
          ) : (
            <div className="space-y-4 divide-y divide-slate-100">
              {bookmarks.map((bm) => (
                <div key={bm.id} className="pt-4 first:pt-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {bm.testTitle} • QID #{bm.question.id}
                    </span>
                    <button
                      onClick={() => removeBookmark(bm.id)}
                      className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>

                  <p className="text-sm font-medium text-slate-900 mb-3 whitespace-pre-line">
                    {bm.question.question}
                  </p>

                  <div className="space-y-1.5">
                    {bm.question.options.map((opt, oIdx) => {
                      const optNum = oIdx + 1;
                      const isCorrect = bm.question.correctOption === optNum;
                      return (
                        <div
                          key={optNum}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                            isCorrect
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold'
                              : 'border-slate-200 bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span>
                            ({optNum}) {opt}
                          </span>
                          {isCorrect && (
                            <span className="text-[10px] uppercase font-bold text-emerald-700">Correct Answer</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}