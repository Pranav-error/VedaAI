'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import FileUpload from '@/components/create/FileUpload';
import QuestionTypeRow from '@/components/create/QuestionTypeRow';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import { createAssignment } from '@/lib/api';
import { QuestionType } from '@/types';

export default function CreateAssignmentPage() {
  const router = useRouter();
  const {
    formState,
    setFormTitle,
    setFormDueDate,
    setFormQuestionTypes,
    setFormAdditional,
    setFormFile,
    resetForm,
  } = useAssignmentStore();

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const dateRef = useRef<HTMLInputElement>(null);

  const totalQuestions = formState.questionTypes.reduce((s, qt) => s + (Number(qt.count) || 0), 0);
  const totalMarks = formState.questionTypes.reduce((s, qt) => s + (Number(qt.count) || 0) * (Number(qt.marks) || 0), 0);

  const handleQTChange = (index: number, field: keyof QuestionType, value: string | number) => {
    setFormQuestionTypes(
      formState.questionTypes.map((qt, i) => (i === index ? { ...qt, [field]: value } : qt))
    );
  };

  const handleQTRemove = (index: number) => {
    setFormQuestionTypes(formState.questionTypes.filter((_, i) => i !== index));
  };

  const handleAddQT = () => {
    setFormQuestionTypes([
      ...formState.questionTypes,
      { type: 'Short Questions', count: 5, marks: 2 },
    ]);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formState.title.trim()) errs.title = 'Assignment title is required.';
    if (!formState.additionalInstructions.trim())
      errs.additionalInstructions = 'Please describe the topic/subject for the question paper.';
    if (formState.questionTypes.length === 0)
      errs.questionTypes = 'Add at least one question type.';
    for (const qt of formState.questionTypes) {
      if (!qt.count || qt.count < 1) errs.questionTypes = 'Question count must be at least 1.';
      if (!qt.marks || qt.marks < 1) errs.questionTypes = 'Marks must be at least 1.';
    }
    return errs;
  };

  const handleBlur = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
  };

  const handleSubmit = async () => {
    setTouched({ title: true, additionalInstructions: true, questionTypes: true });
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      const { assignmentId } = await createAssignment({
        title: formState.title.trim(),
        dueDate: formState.dueDate,
        questionTypes: formState.questionTypes,
        additionalInstructions: formState.additionalInstructions,
        file: formState.file || undefined,
      });
      resetForm();
      router.push(`/assignments/${assignmentId}`);
    } catch {
      setErrors({ submit: 'Failed to create assignment. Make sure the backend is running.' });
      setSubmitting(false);
    }
  };

  const err = (field: string) =>
    touched[field] && errors[field] ? (
      <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
        <svg width="11" height="11" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
        {errors[field]}
      </p>
    ) : null;

  const inputCls = (field: string) =>
    `w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors bg-white ${
      touched[field] && errors[field]
        ? 'border-red-300 focus:border-red-400'
        : 'border-gray-200 focus:border-gray-400'
    }`;

  return (
    <div className="flex min-h-screen bg-[#f5f5f4]">
      <Sidebar />
      <div className="flex-1 ml-[240px] flex flex-col min-h-screen">
        <Header title="Assignment" showBack />

        <main className="flex-1 flex flex-col p-6 pb-10">
          {/* Page header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              <h1 className="text-lg font-semibold text-gray-900">Create Assignment</h1>
            </div>
            <p className="text-sm text-gray-500 ml-4">Set up a new assignment for your students.</p>
          </div>

          {/* ── Main card — fills all available width ────────────────────── */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">

            {/* Title + Section header */}
            <div className="px-7 pt-6 pb-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-0.5">Assignment Details</h2>
              <p className="text-xs text-gray-500">Basic information about your assignment</p>
            </div>

            <div className="flex-1 px-7 py-6 space-y-6 overflow-y-auto">

              {/* ── Title ─────────────────────────────────────────────── */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Assignment Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grade 8 Science — Electricity Quiz"
                  value={formState.title}
                  onChange={(e) => setFormTitle(e.target.value)}
                  onBlur={() => handleBlur('title')}
                  className={inputCls('title')}
                  maxLength={120}
                />
                {err('title')}
              </div>

              {/* ── File Upload ───────────────────────────────────────── */}
              <FileUpload file={formState.file} onFileChange={setFormFile} />

              {/* ── Due Date ──────────────────────────────────────────── */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="DD-MM-YYYY"
                    value={formState.dueDate}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9-]/g, '').slice(0, 10);
                      setFormDueDate(val);
                    }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 bg-white pr-11 transition-colors"
                  />
                  {/* Hidden date input anchored at left so native calendar opens within viewport */}
                  <input
                    ref={dateRef}
                    type="date"
                    className="absolute left-0 top-0 bottom-0 opacity-0 pointer-events-none w-px"
                    tabIndex={-1}
                    onChange={(e) => {
                      if (e.target.value) {
                        const [y, m, d] = e.target.value.split('-');
                        setFormDueDate(`${d}-${m}-${y}`);
                      }
                    }}
                  />
                  {/* Calendar icon button — triggers showPicker() */}
                  <button
                    type="button"
                    className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => dateRef.current?.showPicker()}
                  >
                    <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* ── Question Types ────────────────────────────────────── */}
              <div>
                {/* Table header */}
                <div className="flex items-center gap-3 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <span className="flex-1">Question Type</span>
                  <span className="w-7" />
                  <span className="w-28 text-center">No. of Questions</span>
                  <span className="w-28 text-center">Marks</span>
                </div>

                <div className="space-y-3">
                  {formState.questionTypes.map((qt, i) => (
                    <QuestionTypeRow
                      key={i}
                      row={qt}
                      index={i}
                      onChange={handleQTChange}
                      onRemove={handleQTRemove}
                      canRemove={formState.questionTypes.length > 1}
                    />
                  ))}
                </div>

                {err('questionTypes')}

                <div className="flex items-end justify-between mt-4">
                  <button
                    type="button"
                    onClick={handleAddQT}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors -ml-2"
                  >
                    <span className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-base leading-none font-light">+</span>
                    Add Question Type
                  </button>

                  <div className="text-right text-sm text-gray-600 space-y-0.5">
                    <div>Total Questions : <span className="font-semibold text-gray-900">{totalQuestions}</span></div>
                    <div>Total Marks : <span className="font-semibold text-gray-900">{totalMarks}</span></div>
                  </div>
                </div>
              </div>

              {/* ── Additional Instructions ───────────────────────────── */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Additional Information{' '}
                  <span className="font-normal text-gray-400">(For better output)</span>
                </label>
                <div className="relative">
                  <textarea
                    placeholder="e.g Generate a question paper for 3 hour exam duration..."
                    value={formState.additionalInstructions}
                    onChange={(e) => setFormAdditional(e.target.value)}
                    onBlur={() => handleBlur('additionalInstructions')}
                    rows={4}
                    maxLength={1000}
                    className={`${inputCls('additionalInstructions')} resize-none pb-8`}
                  />
                  {/* Mic icon */}
                  <button
                    type="button"
                    className="absolute bottom-3 right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Voice input (coming soon)"
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                      <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                  </button>
                  <span className="absolute bottom-3 left-4 text-xs text-gray-300 pointer-events-none">
                    {formState.additionalInstructions.length}/1000
                  </span>
                </div>
                {err('additionalInstructions')}
              </div>

            </div>

            {/* ── Footer: nav buttons ──────────────────────────────────── */}
            <div className="px-7 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
              {errors.submit && (
                <p className="text-sm text-red-500 flex items-center gap-1.5">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                  {errors.submit}
                </p>
              )}
              {!errors.submit && <span />}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Previous
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-7 py-2.5 bg-[#1A1A1A] text-white rounded-full text-sm font-medium hover:bg-gray-800 active:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      Next
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
