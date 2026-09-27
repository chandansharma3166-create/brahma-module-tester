'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Bookmark, CheckCircle2, ChevronRight, RotateCcw, AlertTriangle } from 'lucide-react';
import { Question, QuestionStatus, TestSettings, TestResult } from '../lib/types';

interface ExamEngineProps {
  questions: Question[];
  settings: TestSettings;
  onFinishTest: (result: TestResult, userAnswers: Record<number, number>) => void;
}

export default function ExamEngine({ questions, settings, onFinishTest }: ExamEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [reviewSet, setReviewSet] = useState<Set<number>>(new Set());
  const [visitedSet, setVisitedSet] = useState<Set<number>>(new Set([questions[0]?.id]));
  const [secondsRemaining, setSecondsRemaining] = useState(settings.durationMinutes * 60);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const currentQ = questions[currentIndex];

  // Live Timer Countdown
  useEffect(() => {
    if (secondsRemaining <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? `${h}:` : ''}${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Status mapping for the question palette
  const getStatus = (qId: number): QuestionStatus => {
    if (reviewSet.has(qId)) return 'marked_for_review';
    if (userAnswers[qId] !== undefined) return 'answered';
    if (visitedSet.has(qId)) return 'not_answered';
    return 'not_visited';
  };

  const selectQuestion = (index: number) => {
    setCurrentIndex(index);
    setVisitedSet((prev) => new Set(prev).add(questions[index].id));
  };

  const handleOptionSelect = (optionNumber: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionNumber,
    }));
  };

  const handleClearResponse = () => {
    setUserAnswers((prev) => {
      const updated = { ...prev };
      delete updated[currentQ.id];
      return updated;
    });
  };

  const handleSaveAndNext = () => {
    setReviewSet((prev) => {
      const updated = new Set(prev);
      updated.delete(currentQ.id);
      return updated;
    });

    if (currentIndex < questions.length - 1) {
      selectQuestion(currentIndex + 1);
    }
  };

  const handleMarkForReview = () => {
    setReviewSet((prev) => new Set(prev).add(currentQ.id));

    if (currentIndex < questions.length - 1) {
      selectQuestion(currentIndex + 1);
    }
  };

  const handleSubmit = () => {
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    questions.forEach((q) => {
      const selected = userAnswers[q.id];
      if (selected === undefined) {
        unattemptedCount += 1;
      } else if (q.correctOption !== undefined && selected === q.correctOption) {
        correctCount += 1;
      } else {
        incorrectCount += 1;
      }
    });

    const score =
      correctCount * settings.correctMarks -
      incorrectCount * settings.negativeMarks +
      unattemptedCount * settings.unattemptedMarks;

    const maxScore = questions.length * settings.correctMarks;
    const attempted = correctCount + incorrectCount;
    const accuracy = attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0;

    const result: TestResult = {
      id: Date.now().toString(),
      testTitle: settings.title,
      date: new Date().toLocaleDateString('en-GB'),
      score,
      maxScore,
      accuracy,
      totalQuestions: questions.length,
      correct: correctCount,
      incorrect: incorrectCount,
      unattempted: unattemptedCount,
      timeTakenSeconds: settings.durationMinutes * 60 - secondsRemaining,
    };

    onFinishTest(result, userAnswers);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{settings.title}</h2>
          <p className="text-xs text-slate-500">
            Total Questions: {questions.length} | Marking: +{settings.correctMarks}, -{settings.negativeMarks}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-lg text-amber-700 font-mono font-semibold text-base">
            <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition"
          >
            Submit Test
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Active Question Area */}
        <main className="flex-1 p-6 lg:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <span className="text-sm font-semibold tracking-wide uppercase text-slate-500">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
                QID #{currentQ.id}
              </span>
            </div>

            {/* Question Text */}
            <h3 className="text-lg font-medium text-slate-900 leading-relaxed whitespace-pre-line mb-6">
              {currentQ.question}
            </h3>

            {/* Options List */}
            <div className="space-y-3">
              {currentQ.options.map((opt, idx) => {
                const optNum = idx + 1;
                const isSelected = userAnswers[currentQ.id] === optNum;

                return (
                  <label
                    key={optNum}
                    onClick={() => handleOptionSelect(optNum)}
                    className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold text-xs transition ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-400 text-slate-600'
                      }`}
                    >
                      {optNum}
                    </div>
                    <span className="text-slate-800 text-sm leading-relaxed">{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="border-t border-slate-200 pt-5 mt-8 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkForReview}
                className="flex items-center gap-1.5 px-4 py-2 border border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm font-medium transition"
              >
                <Bookmark className="w-4 h-4" /> Mark for Review
              </button>
              <button
                type="button"
                onClick={handleClearResponse}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium transition"
              >
                <RotateCcw className="w-4 h-4" /> Clear Response
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveAndNext}
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
              >
                Save & Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>

        {/* Right: Question Palette Sidebar */}
        <aside className="w-full lg:w-80 bg-white border-l border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
              Question Palette
            </h4>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-5 border-b pb-4 text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-emerald-500 inline-block" /> Answered
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-rose-500 inline-block" /> Not Answered
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-purple-600 inline-block" /> Marked for Review
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-slate-200 inline-block" /> Not Visited
              </div>
            </div>

            {/* Palette Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const status = getStatus(q.id);
                const isCurrent = idx === currentIndex;

                let colorClasses = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
                if (status === 'answered') colorClasses = 'bg-emerald-500 text-white';
                else if (status === 'not_answered') colorClasses = 'bg-rose-500 text-white';
                else if (status === 'marked_for_review') colorClasses = 'bg-purple-600 text-white';

                return (
                  <button
                    key={q.id}
                    onClick={() => selectQuestion(idx)}
                    className={`h-9 w-9 rounded-lg font-medium text-xs flex items-center justify-center transition ${colorClasses} ${
                      isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 font-bold' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">Submit Test?</h3>
            <p className="text-sm text-slate-600 mt-2 mb-6">
              Are you sure you want to finish and view your score analysis?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  handleSubmit();
                }}
                className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 transition"
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}