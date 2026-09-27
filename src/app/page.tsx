'use client';

import React, { useState, useEffect } from 'react';
import TestSetup from '../components/TestSetup';
import ExamEngine from '../components/ExamEngine';
import TestAnalysis from '../components/TestAnalysis';
import AnalyticsView from '../components/AnalyticsView';
import { Question, TestSettings, TestResult, BookmarkedQuestion } from '../lib/types';
import { BarChart3, FileText, Trash2, History, Sprout } from 'lucide-react';

type AppScreen = 'setup' | 'exam' | 'analysis' | 'analytics';

export default function Home() {
  const [screen, setScreen] = useState<AppScreen>('setup');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [settings, setSettings] = useState<TestSettings | null>(null);
  const [currentResult, setCurrentResult] = useState<TestResult | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [history, setHistory] = useState<TestResult[]>([]);
  const [bookmarkCount, setBookmarkCount] = useState<number>(0);

  const refreshStorage = () => {
    try {
      const savedHistory = localStorage.getItem('brahma_test_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
      const savedBookmarks = localStorage.getItem('brahma_bookmarked_questions');
      if (savedBookmarks) {
        const parsed: BookmarkedQuestion[] = JSON.parse(savedBookmarks);
        setBookmarkCount(parsed.length);
      }
    } catch (e) {
      console.error('Failed to load local storage data', e);
    }
  };

  useEffect(() => {
    refreshStorage();
  }, [screen]);

  const handleStartTest = (parsedQuestions: Question[], testSettings: TestSettings) => {
    setQuestions(parsedQuestions);
    setSettings(testSettings);
    setScreen('exam');
  };

  const handleFinishTest = (result: TestResult, answers: Record<number, number>) => {
    const fullResult: TestResult = {
      ...result,
      timestamp: Date.now(),
      questionsSnapshot: questions,
      settingsSnapshot: settings || undefined,
    };

    setCurrentResult(fullResult);
    setUserAnswers(answers);
    setScreen('analysis');

    const updatedHistory = [fullResult, ...history];
    setHistory(updatedHistory);
    try {
      localStorage.setItem('brahma_test_history', JSON.stringify(updatedHistory));
    } catch (e) {
      console.error('Failed to save test result', e);
    }
  };

  const handleRetake = () => {
    setQuestions([]);
    setSettings(null);
    setCurrentResult(null);
    setUserAnswers({});
    setScreen('setup');
  };

  const handleReattempt = () => {
    if (questions.length > 0 && settings) {
      setUserAnswers({});
      setCurrentResult(null);
      setScreen('exam');
    }
  };

  const handleReattemptFromHistory = (item: TestResult) => {
    if (item.questionsSnapshot && item.questionsSnapshot.length > 0 && item.settingsSnapshot) {
      setQuestions(item.questionsSnapshot);
      setSettings(item.settingsSnapshot);
      setUserAnswers({});
      setCurrentResult(null);
      setScreen('exam');
    }
  };

  const handleDeleteTest = (id: string) => {
    if (confirm('Delete this test record?')) {
      const updated = history.filter((h) => h.id !== id);
      setHistory(updated);
      try {
        localStorage.setItem('brahma_test_history', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to delete item', e);
      }
    }
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your entire test history?')) {
      localStorage.removeItem('brahma_test_history');
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#332720] flex flex-col font-sans">
      {/* Top Navbar */}
      {screen !== 'exam' && (
        <header className="bg-[#FFFFFF] border-b border-[#E3D6C8] sticky top-0 z-30 shadow-2xs">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div
              onClick={() => setScreen('setup')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-[#2D5A27] text-[#FAF6F0] flex items-center justify-center font-bold text-base shadow-sm">
                <Sprout className="w-5 h-5 text-[#E6F3E6]" />
              </div>
              <div>
                <h1 className="text-base font-bold text-[#3B2B20] leading-tight">
                  Brahma Module Tester
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#1B6B76]">
                  NEET CBT Portal
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setScreen('setup')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition ${
                  screen === 'setup'
                    ? 'bg-[#EBF5E9] text-[#2D5A27] border border-[#C5E3BE]'
                    : 'text-[#5C4535] hover:text-[#2D5A27] hover:bg-[#FAF6F0]'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Create Test</span>
              </button>

              <button
                type="button"
                onClick={() => setScreen('analytics')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition ${
                  screen === 'analytics'
                    ? 'bg-[#1B6B76] text-[#FAF6F0] shadow-sm'
                    : 'bg-[#E2F4F6] border border-[#BBE3E8] text-[#1B6B76] hover:bg-[#D0EEF1]'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics & Notebook</span>
                {(history.length > 0 || bookmarkCount > 0) && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF6F0] text-[#1B6B76]">
                    {history.length + bookmarkCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Areas */}
      <main className="flex-1">
        {screen === 'setup' && (
          <div className="py-8 px-4">
            <TestSetup onStartTest={handleStartTest} />

            {/* Quick Practice History Card */}
            {history.length > 0 && (
              <div className="max-w-3xl mx-auto mt-10 p-6 bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#E3D6C8]">
                <div className="flex items-center justify-between border-b border-[#EFE7DE] pb-3.5 mb-4">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-[#6B4E3D]" />
                    <h2 className="text-base font-bold text-[#3B2B20]">Recent Practice Log</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setScreen('analytics')}
                      className="text-xs text-[#1B6B76] hover:underline font-semibold"
                    >
                      Deep Analytics →
                    </button>
                    <button
                      onClick={handleClearHistory}
                      className="flex items-center gap-1 text-xs text-[#9E3E3E] hover:text-[#7A2A2A] font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear All
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {history.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-[#FAF6F0] rounded-xl border border-[#EADBCE] hover:border-[#D0C0B0] transition"
                    >
                      <div>
                        <h4 className="font-semibold text-[#3B2B20] text-sm">{item.testTitle}</h4>
                        <p className="text-xs text-[#7A6657] mt-0.5">
                          {item.date} • {item.totalQuestions} Questions • Accuracy: {item.accuracy}%
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-lg font-bold text-[#1B6B76]">
                            {item.score} <span className="text-xs text-[#8C7A6D] font-normal">/ {item.maxScore}</span>
                          </span>
                          <p className="text-[11px] text-[#2D5A27] font-medium">
                            +{item.correct}, -{item.incorrect}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteTest(item.id)}
                          className="p-1.5 text-[#8C7A6D] hover:text-[#9E3E3E] hover:bg-[#FBEFEF] border border-[#EADBCE] rounded-lg transition"
                          title="Delete test"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {screen === 'exam' && settings && (
          <ExamEngine
            questions={questions}
            settings={settings}
            onFinishTest={handleFinishTest}
          />
        )}

        {screen === 'analysis' && currentResult && (
          <div className="py-8 px-4">
            <TestAnalysis
              result={currentResult}
              questions={questions}
              userAnswers={userAnswers}
              onRetake={handleRetake}
              onReattempt={handleReattempt}
            />
          </div>
        )}

        {screen === 'analytics' && (
          <div className="py-8 px-4">
            <AnalyticsView
              history={history}
              onBack={() => setScreen('setup')}
              onReattemptFromHistory={handleReattemptFromHistory}
              onClearHistory={handleClearHistory}
              onDeleteTest={handleDeleteTest}
            />
          </div>
        )}
      </main>
    </div>
  );
}