"use client";

import { useState } from "react";

interface StudentIdFormProps {
  onSubmit: (studentId: string) => void;
  disabled?: boolean;
}

export function StudentIdForm({ onSubmit, disabled }: StudentIdFormProps) {
  const [studentId, setStudentId] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (studentId.trim()) onSubmit(studentId.trim());
      }}
      className="flex w-full max-w-sm flex-col gap-3"
    >
      <label htmlFor="studentId" className="text-sm font-medium text-slate-700">
        Student ID
      </label>
      <input
        id="studentId"
        name="studentId"
        type="text"
        autoComplete="off"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        placeholder="e.g. S1001"
        className="rounded-lg border border-slate-300 px-4 py-2.5 text-base focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
        required
      />
      <button
        type="submit"
        disabled={disabled || !studentId.trim()}
        className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        Continue to camera
      </button>
    </form>
  );
}
