"use client";

import type { WizardFormState } from "./use-create-election-wizard";
import { formatDateLong, formatTime12h } from "@/lib/utils";

interface StepScheduleProps {
  form: WizardFormState;
  onChange: (patch: Partial<WizardFormState>) => void;
}

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200";
const labelClass = "mb-1.5 block text-sm font-medium text-neutral-700";

// A short, common list — swap for the full IANA list or the project's
// existing timezone picker if one exists.
const TIMEZONES = [
  "Africa/Lagos",
  "UTC",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Dubai",
];

export function StepSchedule({ form, onChange }: StepScheduleProps) {
  const hasFullSchedule = form.startDate && form.startTime && form.endDate && form.endTime;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="start-date">
            Start date
          </label>
          <input
            id="start-date"
            type="date"
            value={form.startDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="start-time">
            Start time
          </label>
          <input
            id="start-time"
            type="time"
            value={form.startTime}
            onChange={(e) => onChange({ startTime: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="end-date">
            End date
          </label>
          <input
            id="end-date"
            type="date"
            value={form.endDate}
            onChange={(e) => onChange({ endDate: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="end-time">
            End time
          </label>
          <input
            id="end-time"
            type="time"
            value={form.endTime}
            onChange={(e) => onChange({ endTime: e.target.value })}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="timezone">
            Timezone
          </label>
          <select
            id="timezone"
            value={form.timezone}
            onChange={(e) => onChange({ timezone: e.target.value })}
            className={inputClass}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasFullSchedule && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Duration</p>
          <p className="mt-1 text-neutral-900">
            {formatDateLong(form.startDate)}
            {form.endDate !== form.startDate ? ` → ${formatDateLong(form.endDate)}` : ""}
          </p>
          <p className="text-neutral-500">
            {formatTime12h(form.startTime)} → {formatTime12h(form.endTime)} ({form.timezone})
          </p>
        </div>
      )}
    </div>
  );
}
