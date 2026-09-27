'use client';

import React, { useState, useEffect } from 'react';
import TestSetup from '../components/TestSetup';
import ExamEngine from '../components/ExamEngine';
import TestAnalysis from '../components/TestAnalysis';
import AnalyticsView from '../components/AnalyticsView';
import { Question, TestSettings, TestResult } from '../lib/types';
import { History, Trash2, BarChart2 } from 'lucide-react';

type AppScreen = 'setup' | 'exam' | 'analysis' | 'analytics';

export default function Home() {
  const [screen, setScreen] = useState<AppScreen>('setup');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [settings, setSettings] = useState<TestSettings | null>(null);
  const [currentResult, setCurrentResult] = useState<TestResult | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [history, setHistory] = useState<TestResult[]>([]);

  // Load test history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('brahma_test_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  }, []);

  const handleStartTest = (parsedQuestions: Question[], testSettings: TestSettings) => {
    setQuestions(parsedQuestions);
    setSettings(testSettings);
    setScreen('exam');
  };

  const handleFinishTest = (result: TestResult, answers: Record<number, number>) => {
    // Attach snapshots so tests can be reattempted from history anytime
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

  // Immediate reattempt of the current test
  const handleReattempt = () => {
    if (questions.length > 0 && settings) {
      setUserAnswers({});
      setCurrentResult(null);
      setScreen('exam');
    }
  };

  // Reattempt an older test from the Analytics History log
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {screen === 'setup' && (
        <div className="py-10 px-4">
          {/* Top Bar with Analytics Link */}
          <div className="max-w-3xl mx-auto mb-6 flex justify-end">
            <button
              onClick={() => setScreen('analytics')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-semibold text-slate-700 hover:text-blue-600 transition"
            >
              <BarChart2 className="w-4 h-4 text-blue-600" />
              View Analytics & Bookmarks
            </button>
          </div>

          <TestSetup onStartTest={handleStartTest} />

          {/* Quick Past Tests Overview */}
          {history.length > 0 && (
            <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-800">Recent Test Activity</h2>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setScreen('analytics')}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Deep Analytics →
                  </button>
                  <button
                    onClick={handleClearHistory}
                    className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {history.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{item.testTitle}</h4>
                      <p className="text-xs text-slate-500">
                        {item.date} • {item.totalQuestions} Questions • Accuracy: {item.accuracy}%
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-bold text-blue-600">
                        {item.score} <span className="text-xs text-slate-400">/ {item.maxScore}</span>
                      </span>
                      <p className="text-[11px] text-emerald-600 font-medium">
                        +{item.correct} correct, -{item.incorrect} wrong
                      </p>
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
        <div className="py-10 px-4">
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
        <div className="py-10 px-4">
          <AnalyticsView
            history={history}
            onBack={() => setScreen('setup')}
            onReattemptFromHistory={handleReattemptFromHistory}
            onClearHistory={handleClearHistory}
          />
        </div>
      )}
    </div>
  );
}