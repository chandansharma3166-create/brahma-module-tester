'use client';

import React, { useState, useEffect } from 'react';
import TestSetup from '../components/TestSetup';
import ExamEngine from '../components/ExamEngine';
import TestAnalysis from '../components/TestAnalysis';
import AnalyticsView from '../components/AnalyticsView';
import { Question, TestSettings, TestResult, BookmarkedQuestion } from '../lib/types';
import { BarChart3, BookmarkCheck, FileText, Sparkles } from 'lucide-react';

type AppScreen = 'setup' | 'exam' | 'analysis' | 'analytics';

export default function Home() {
  const [screen, setScreen] = useState<AppScreen>('setup');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [settings, setSettings] = useState<TestSettings | null>(null);
  const [currentResult, setCurrentResult] = useState<TestResult | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [history, setHistory] = useState<TestResult[]>([]);
  const [bookmarkCount, setBookmarkCount] = useState<number>(0);

  // Load history and bookmark counts from localStorage
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
      console.error('Failed to load local data', e);
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

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your saved test history?')) {
      localStorage.removeItem('brahma_test_history');
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Permanent Top Navigation Bar (Hidden during active CBT exam) */}
      {screen !== 'exam' && (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div
              onClick={() => setScreen('setup')}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                B
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-800 leading-tight">
                  Brahma Module Tester
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600">
                  NEET CBT Portal
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setScreen('setup')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition ${
                  screen === 'setup'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics & Notebook</span>
                {(history.length > 0 || bookmarkCount > 0) && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-indigo-700">
                    {history.length + bookmarkCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Views */}
      <main className="flex-1">
        {screen === 'setup' && (
          <div className="py-8 px-4">
            <TestSetup onStartTest={handleStartTest} />
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
            />
          </div>
        )}
      </main>
    </div>
  );
}