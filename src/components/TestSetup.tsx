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
    <div className="max-w-3xl mx-auto p-6 md:p-8 bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#E3D6C8]">
      <div className="border-b border-[#EFE7DE] pb-4 mb-6">
        <h1 className="text-2xl font-bold text-[#3B2B20]">Test Configuration</h1>
        <p className="text-sm text-[#735F52] mt-1">
          Upload your Word question module, set marking rules, and launch your practice test.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#FBEFEF] border-l-4 border-[#C75A5A] text-[#852C2C] flex items-center gap-3 rounded-r-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleStart} className="space-y-6">
        {/* Test Name */}
        <div>
          <label className="block text-sm font-bold text-[#4A3728] mb-1.5">
            Test Title / Name
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 border border-[#D5C5B5] rounded-xl text-[#332720] font-medium placeholder-[#A8988B] bg-[#FAF6F0] focus:ring-2 focus:ring-[#1B6B76] focus:border-[#1B6B76] focus:outline-none shadow-xs"
            placeholder="e.g. Physics Chapter 3 Mock"
            required
          />
        </div>

        {/* File Upload Box */}
        <div>
          <label className="block text-sm font-bold text-[#4A3728] mb-1.5">
            Question Document (.docx)
          </label>
          <div className="border-2 border-dashed border-[#D5C5B5] bg-[#FAF6F0]/60 rounded-xl p-6 text-center hover:border-[#1B6B76] transition-colors">
            <Upload className="mx-auto h-9 w-9 text-[#8C7A6D] mb-2" />
            <input
              type="file"
              accept=".docx"
              onChange={handleFileChange}
              className="text-sm text-[#5C483A] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#EBF5E9] file:text-[#2D5A27] hover:file:bg-[#DDF0D9] cursor-pointer"
            />
            {file && (
              <p className="mt-2.5 text-xs text-[#2D5A27] font-semibold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Ready: {file.name}
              </p>
            )}
          </div>
        </div>

        {/* Answer Key */}
        <div>
          <label className="block text-sm font-bold text-[#4A3728] mb-1.5">
            Answer Key (Optional text block)
          </label>
          <textarea
            value={answerKeyText}
            onChange={(e) => setAnswerKeyText(e.target.value)}
            rows={3}
            placeholder="Example: 1 (2) 2(3) 3(1) 4(2)..."
            className="w-full px-4 py-2.5 border border-[#D5C5B5] rounded-xl text-[#332720] font-mono font-medium placeholder-[#A8988B] bg-[#FAF6F0] focus:ring-2 focus:ring-[#1B6B76] focus:border-[#1B6B76] focus:outline-none shadow-xs text-sm"
          />
          <p className="text-xs text-[#8C7A6D] mt-1 font-medium">
            Format: question number followed by option, e.g. <code className="bg-[#F0E6DC] text-[#4A3728] px-1 py-0.5 rounded">1(2) 2(4)</code>.
          </p>
        </div>

        {/* Timing and Questions Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[#4A3728] mb-1.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#1B6B76]" /> Duration (Minutes)
            </label>
            <input
              type="number"
              min="1"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-[#D5C5B5] rounded-xl text-[#332720] font-medium bg-[#FAF6F0] focus:ring-2 focus:ring-[#1B6B76] focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#4A3728] mb-1.5">
              Question Limit (Leave blank for all)
            </label>
            <input
              type="number"
              min="1"
              value={questionLimit}
              onChange={(e) => setQuestionLimit(e.target.value ? Number(e.target.value) : '')}
              placeholder="All questions"
              className="w-full px-4 py-2.5 border border-[#D5C5B5] rounded-xl text-[#332720] font-medium placeholder-[#A8988B] bg-[#FAF6F0] focus:ring-2 focus:ring-[#1B6B76] focus:outline-none"
            />
          </div>
        </div>

        {/* Marking Scheme */}
        <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#E3D6C8]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B4E3D] mb-3">Marking Scheme Settings</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#5C483A] mb-1">Correct (+)</label>
              <input
                type="number"
                value={correctMarks}
                onChange={(e) => setCorrectMarks(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#D5C5B5] rounded-lg text-sm font-bold text-[#2D5A27] bg-[#FFFFFF] focus:ring-2 focus:ring-[#2D5A27] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5C483A] mb-1">Negative (-)</label>
              <input
                type="number"
                value={negativeMarks}
                onChange={(e) => setNegativeMarks(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#D5C5B5] rounded-lg text-sm font-bold text-[#9E3E3E] bg-[#FFFFFF] focus:ring-2 focus:ring-[#9E3E3E] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5C483A] mb-1">Unattempted</label>
              <input
                type="number"
                value={unattemptedMarks}
                onChange={(e) => setUnattemptedMarks(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#D5C5B5] rounded-lg text-sm font-bold text-[#7A6657] bg-[#FFFFFF] focus:ring-2 focus:ring-[#7A6657] focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2D5A27] hover:bg-[#23481F] text-[#FAF6F0] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition duration-150 disabled:opacity-50 shadow-sm cursor-pointer"
        >
          {loading ? (
            'Parsing Document...'
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" /> Start Practice Test
            </>
          )}
        </button>
      </form>
    </div>
  );
}