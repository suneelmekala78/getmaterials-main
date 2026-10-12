"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Plus, Trash2 } from "lucide-react";

const DAYS = [
  { day: 1, label: "Monday" },
  { day: 2, label: "Tuesday" },
  { day: 3, label: "Wednesday" },
  { day: 4, label: "Thursday" },
  { day: 5, label: "Friday" },
  { day: 6, label: "Saturday" },
];

type Slot = {
  day: number;
  startTime: string;
  endTime: string;
  subjectName: string;
  room: string;
};

const emptySlot = (): Slot => ({
  day: 1,
  startTime: "09:00",
  endTime: "10:00",
  subjectName: "",
  room: "",
});

export function TimetableEditor() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [draft, setDraft] = useState<Slot>(emptySlot);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/study/timetable")
      .then((res) => res.json())
      .then((data) => setSlots(data.slots || []))
      .catch(() => setMessage("Could not load your timetable"))
      .finally(() => setLoading(false));
  }, []);

  const save = async (next: Slot[]) => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/study/timetable", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: next }),
      });
      if (!res.ok) throw new Error("Save failed");
      setMessage("Timetable saved");
    } catch {
      setMessage("Could not save timetable");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-sm font-semibold text-violet-700 flex items-center gap-2">
          <CalendarDays className="w-4 h-4" /> Your college week
        </p>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Timetable</h1>
        <p className="text-sm text-slate-500 mt-1">Add the classes you actually attend. Only you can see this.</p>
      </div>

      <form
        className="bg-white border border-slate-100 rounded-3xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.subjectName.trim()) return;
          const next = [...slots, { ...draft, subjectName: draft.subjectName.trim() }];
          setSlots(next);
          setDraft(emptySlot());
          save(next);
        }}
      >
        <label className="text-sm font-medium text-slate-700">
          Day
          <select
            value={draft.day}
            onChange={(event) => setDraft({ ...draft, day: Number(event.target.value) })}
            className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl"
          >
            {DAYS.map((day) => (
              <option key={day.day} value={day.day}>{day.label}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Subject
          <input
            value={draft.subjectName}
            onChange={(event) => setDraft({ ...draft, subjectName: event.target.value })}
            placeholder="Data Structures"
            className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Starts
          <input
            type="time"
            value={draft.startTime}
            onChange={(event) => setDraft({ ...draft, startTime: event.target.value })}
            className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Ends
          <input
            type="time"
            value={draft.endTime}
            onChange={(event) => setDraft({ ...draft, endTime: event.target.value })}
            className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl"
          />
        </label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">
          Room
          <input
            value={draft.room}
            onChange={(event) => setDraft({ ...draft, room: event.target.value })}
            placeholder="Optional"
            className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="sm:col-span-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {saving ? "Saving..." : "Add class"}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-slate-500">Loading timetable…</p>
      ) : (
        <div className="space-y-4">
          {DAYS.map((day) => {
            const items = slots.filter((slot) => slot.day === day.day);
            return (
              <section key={day.day} className="bg-white border border-slate-100 rounded-2xl p-4">
                <h2 className="text-sm font-bold text-slate-900">{day.label}</h2>
                {items.length === 0 ? (
                  <p className="text-xs text-slate-400 mt-2">No classes</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {items.map((slot, index) => (
                      <li key={`${slot.startTime}-${index}`} className="flex items-center justify-between gap-3 text-sm">
                        <span>
                          <span className="font-semibold text-slate-900">{slot.subjectName}</span>
                          <span className="text-slate-500"> · {slot.startTime}–{slot.endTime}</span>
                          {slot.room ? <span className="text-slate-400"> · {slot.room}</span> : null}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = slots.filter((item) => item !== slot);
                            setSlots(next);
                            save(next);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
      {message && <p className="text-sm text-slate-600">{message}</p>}
    </div>
  );
}
