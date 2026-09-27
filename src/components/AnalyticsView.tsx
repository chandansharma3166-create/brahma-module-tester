'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Award, Calendar, RotateCcw, 
  Trash2, BookmarkCheck, ArrowLeft 
} from 'lucide-react';
import { TestResult, BookmarkedQuestion } from '../lib/types';

interface AnalyticsViewProps {
  history: TestResult[];
  onBack: () => void;
  onReattemptFromHistory: (result: TestResult) => void;
  onClearHistory: () => void;
  onDeleteTest: (id: string) => void;
}

export default function AnalyticsView({
  history,
  onBack,
  onReattemptFromHistory,
  onClearHistory,
  onDeleteTest,
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

  const totalTests = history.length;
  const avgAccuracy = totalTests > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.accuracy, 0) / totalTests) 
    : 0;
  const highestScore = totalTests > 0 
    ? Math.max(...history.map((h) => h.score)) 
    : 0;

  const chartData = [...history].reverse();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 text-[#332720]">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs md:text-sm font-semibold text-[#5C483A] hover:text-[#3B2B20] bg-[#FFFFFF] border border-[#E3D6C8] px-4 py-2 rounded-xl shadow-xs transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#EADBCE]/50 p-1 rounded-xl border border-[#E3D6C8]">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition ${
              activeTab === 'analytics'
                ? 'bg-[#1B6B76] text-[#FAF6F0] shadow-xs'
                : 'text-[#5C483A] hover:text-[#3B2B20]'
            }`}
          >
            Performance Analytics
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition ${
              activeTab === 'bookmarks'
                ? 'bg-[#9A6233] text-[#FAF6F0] shadow-xs'
                : 'text-[#5C483A] hover:text-[#3B2B20]'
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
            <div className="bg-[#FFFFFF] border border-[#E3D6C8] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 text-[#8C7A6D] mb-1.5">
                <Calendar className="w-4 h-4 text-[#1B6B76]" />
                <span className="text-[11px] uppercase font-bold tracking-wider">Total Tests</span>
              </div>
              <p className="text-3xl font-black text-[#3B2B20]">{totalTests}</p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E3D6C8] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 text-[#8C7A6D] mb-1.5">
                <TrendingUp className="w-4 h-4 text-[#6B4E3D]" />
                <span className="text-[11px] uppercase font-bold tracking-wider">Average Accuracy</span>
              </div>
              <p className="text-3xl font-black text-[#6B4E3D]">{avgAccuracy}%</p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E3D6C8] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 text-[#8C7A6D] mb-1.5">
                <Award className="w-4 h-4 text-[#2D5A27]" />
                <span className="text-[11px] uppercase font-bold tracking-wider">Peak Score</span>
              </div>
              <p className="text-3xl font-black text-[#2D5A27]">{highestScore}</p>
            </div>
          </div>

          {/* Visual Progress Bar Chart */}
          {chartData.length > 0 && (
            <div className="bg-[#FFFFFF] border border-[#E3D6C8] rounded-2xl p-6 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B4E3D] mb-6">
                Score Progression Over Time
              </h3>
              <div className="flex items-end gap-3 h-48 pt-6 border-b border-[#EFE7DE] overflow-x-auto">
                {chartData.map((item) => {
                  const percentage = Math.max(0, Math.min(100, Math.round((item.score / (item.maxScore || 1)) * 100)));
                  return (
                    <div key={item.id} className="flex-1 min-w-[48px] flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-[11px] font-bold text-[#1B6B76] opacity-0 group-hover:opacity-100 transition">
                        {item.score}
                      </span>
                      <div
                        style={{ height: `${percentage}%` }}
                        className="w-full max-w-[34px] bg-gradient-to-t from-[#2D5A27] to-[#1B6B76] rounded-t-md transition-all group-hover:brightness-110"
                      />
                      <span className="text-[10px] text-[#8C7A6D] truncate max-w-[48px]">{item.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Attempt Log */}
          <div className="bg-[#FFFFFF] border border-[#E3D6C8] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE7DE] mb-4">
              <h3 className="text-base font-bold text-[#3B2B20]">Test History & Reattempt Log</h3>
              {history.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="flex items-center gap-1 text-xs text-[#9E3E3E] hover:text-[#7A2A2A] font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-sm text-[#8C7A6D] text-center py-8">No tests attempted yet.</p>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#FAF6F0] border border-[#EADBCE] rounded-xl gap-4 hover:border-[#D0C0B0] transition"
                  >
                    <div>
                      <h4 className="font-bold text-[#3B2B20] text-sm">{item.testTitle}</h4>
                      <p className="text-xs text-[#7A6657] mt-0.5">
                        Attempted on <span className="font-semibold text-[#3B2B20]">{item.date}</span> • {item.totalQuestions} Questions • Accuracy: {item.accuracy}%
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
                        <span className="text-[#2D5A27]">+{item.correct} Correct</span>
                        <span className="text-[#9E3E3E]">-{item.incorrect} Wrong</span>
                        <span className="text-[#8C7A6D]">{item.unattempted} Skipped</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <span className="text-xl font-black text-[#1B6B76]">
                        {item.score} <span className="text-xs text-[#8C7A6D] font-normal">/ {item.maxScore}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        {item.questionsSnapshot && item.questionsSnapshot.length > 0 && (
                          <button
                            type="button"
                            onClick={() => onReattemptFromHistory(item)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#2D5A27] hover:bg-[#23481F] text-[#FAF6F0] rounded-lg text-xs font-semibold transition"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Reattempt
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onDeleteTest(item.id)}
                          className="p-1.5 text-[#8C7A6D] hover:text-[#9E3E3E] hover:bg-[#FBEFEF] border border-[#D5C5B5] rounded-lg transition"
                          title="Delete test"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Revision Bookmarks Notebook */
        <div className="bg-[#FFFFFF] border border-[#E3D6C8] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-[#EFE7DE] pb-4">
            <h3 className="text-base font-bold text-[#3B2B20]">Saved Revision Questions</h3>
            <p className="text-xs text-[#7A6657] mt-0.5">
              Review difficult problems and tricky concepts saved from past mock tests.
            </p>
          </div>

          {bookmarks.length === 0 ? (
            <p className="text-sm text-[#8C7A6D] text-center py-10">
              No questions bookmarked yet. Click &quot;Bookmark for Revision&quot; on any scorecard review.
            </p>
          ) : (
            <div className="space-y-4 divide-y divide-[#EFE7DE]">
              {bookmarks.map((bm) => (
                <div key={bm.id} className="pt-4 first:pt-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#1B6B76] bg-[#E2F4F6] px-2.5 py-0.5 rounded-md">
                      {bm.testTitle} • QID #{bm.question.id}
                    </span>
                    <button
                      onClick={() => removeBookmark(bm.id)}
                      className="text-xs text-[#9E3E3E] hover:underline flex items-center gap-1 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>

                  <p className="text-sm font-medium text-[#3B2B20] mb-3 whitespace-pre-line">
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
                              ? 'border-[#2D5A27] bg-[#EBF5E9] text-[#2D5A27] font-semibold'
                              : 'border-[#E3D6C8] bg-[#FAF6F0] text-[#5C483A]'
                          }`}
                        >
                          <span>
                            ({optNum}) {opt}
                          </span>
                          {isCorrect && (
                            <span className="text-[10px] uppercase font-bold text-[#2D5A27]">Correct Answer</span>
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