'use client';

import React, { useState } from 'react';
import { Upload, Play, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Question, TestSettings } from '../lib/types';
import { parseDocxFile } from '../lib/parser';

interface TestSetupProps {
  onStartTest: (questions: Question[], settings: TestSettings) => void;
}

export default function TestSetup({ onStartTest }: TestSetupProps) {
  const [title, setTitle] = useState('NEET Mock Practice Test');
  const [durationMinutes, setDurationMinutes] = useState(180);
  const [correctMarks, setCorrectMarks] = useState(4);
  const [negativeMarks, setNegativeMarks] = useState(1);
  const [unattemptedMarks, setUnattemptedMarks] = useState(0);
  const [questionLimit, setQuestionLimit] = useState<number | ''>('');
  
  const [answerKeyText, setAnswerKeyText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a Word (.docx) file containing questions.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      let parsedQuestions = await parseDocxFile(buffer, answerKeyText);

      if (parsedQuestions.length === 0) {
        throw new Error('No questions could be extracted. Please check the document format.');
      }

      if (typeof questionLimit === 'number' && questionLimit > 0) {
        parsedQuestions = parsedQuestions.slice(0, questionLimit);
      }

      const settings: TestSettings = {
        title: title.trim() || 'NEET Practice Test',
        durationMinutes: Number(durationMinutes) || 180,
        correctMarks: Number(correctMarks),
        negativeMarks: Number(negativeMarks),
        unattemptedMarks: Number(unattemptedMarks),
        totalQuestionLimit: typeof questionLimit === 'number' ? questionLimit : undefined,
      };

      onStartTest(parsedQuestions, settings);
    } catch (err: any) {
      setError(err.message || 'Failed to parse file. Ensure it is a valid .docx document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Brahma Module Tester</h1>
        <p className="text-sm text-gray-600 mt-1">
          Upload your Word document, configure marking rules, and launch your CBT practice test.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleStart} className="space-y-6">
        {/* Test Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Test Title / Name
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="e.g. Physics Chapter 3 Mock"
            required
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Question Document (.docx)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            <input
              type="file"
              accept=".docx"
              onChange={handleFileChange}
              className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            {file && (
              <p className="mt-2 text-sm text-green-600 font-medium flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Selected: {file.name}
              </p>
            )}
          </div>
        </div>

        {/* Answer Key Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Answer Key (Optional text block)
          </label>
          <textarea
            value={answerKeyText}
            onChange={(e) => setAnswerKeyText(e.target.value)}
            rows={3}
            placeholder="Example: 1 (2) 2(3) 3(1) 4(2) 5(4)..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Format: question number followed by option in brackets, e.g., <code>1(2) 2(4)</code>.
          </p>
        </div>

        {/* Timing and Questions Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <Clock className="w-4 h-4" /> Duration (Minutes)
            </label>
            <input
              type="number"
              min="1"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Question Limit (Leave blank for all)
            </label>
            <input
              type="number"
              min="1"
              value={questionLimit}
              onChange={(e) => setQuestionLimit(e.target.value ? Number(e.target.value) : '')}
              placeholder="All questions"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Marking Scheme */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Marking Scheme Settings</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Correct (+)</label>
              <input
                type="number"
                value={correctMarks}
                onChange={(e) => setCorrectMarks(Number(e.target.value))}
                className="w-full px-3 py-1.5 border rounded-md text-sm bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Negative (-)</label>
              <input
                type="number"
                value={negativeMarks}
                onChange={(e) => setNegativeMarks(Number(e.target.value))}
                className="w-full px-3 py-1.5 border rounded-md text-sm bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Unattempted</label>
              <input
                type="number"
                value={unattemptedMarks}
                onChange={(e) => setUnattemptedMarks(Number(e.target.value))}
                className="w-full px-3 py-1.5 border rounded-md text-sm bg-white"
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
        >
          {loading ? (
            'Parsing Document...'
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" /> Start Test
            </>
          )}
        </button>
      </form>
    </div>
  );
}