"use client";

import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";

type Phase = {
  id: string;
  date: string;
  title: string;
  detail: string;
  daysRemaining: number;
  readinessPercent: number;
  blockers: { id: string; name: string }[];
};

export default function TimelineClient() {
  const [phases, setPhases] = useState<Phase[]>([]);

  useEffect(() => {
    fetch("/api/insights")
      .then((response) => response.json())
      .then((data) => setPhases(data.phases));
  }, []);

  return (
    <>
      <p className="label text-teal-700">Regulatory readiness</p>
      <h1 className="mt-2 mb-6 text-3xl font-bold text-[#10233f]">
        DPDP enforcement timeline
      </h1>
      <div className="grid gap-4">
        {phases.map((phase) => (
          <div className="card flex gap-5 p-6" key={phase.id}>
            <CalendarClock className="shrink-0 text-teal-700" />
            <div className="grow">
              <div className="flex justify-between gap-3">
                <div>
                  <b className="text-lg">{phase.title}</b>
                  <p className="text-sm text-slate-500">{phase.detail}</p>
                </div>
                <span
                  className={`badge ${phase.daysRemaining <= 0 ? "good" : "warn"}`}
                >
                  {phase.daysRemaining <= 0
                    ? "Active"
                    : `${phase.daysRemaining} days remaining`}
                </span>
              </div>
              <div className="mt-4 h-2 rounded bg-slate-100">
                <div
                  className="h-2 rounded bg-teal-600"
                  style={{ width: `${phase.readinessPercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Current contact readiness: {phase.readinessPercent}% | target date:{" "}
                {phase.date}
              </p>
              {phase.blockers.length > 0 && (
                <p className="mt-2 text-xs text-red-600">
                  Blocking contacts: {phase.blockers.map((contact) => contact.name).join(", ")}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-xs text-slate-500">
        Dates follow DPDP Rules, 2025 commencement clauses. Readiness is a
        product indicator, not legal certification.
      </p>
    </>
  );
}
