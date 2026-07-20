"use client";

import { Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Trip } from "@/lib/types";

type TripSettingsDrawerProps = {
  open: boolean;
  trip: Trip;
  onClose: () => void;
  onChange: (trip: Trip) => void;
  onCommit: (fields: Partial<Trip>) => void;
  onDeleteTrip: () => void;
};

export function TripSettingsDrawer({ open, trip, onClose, onChange, onCommit, onDeleteTrip }: TripSettingsDrawerProps) {
  const [draft, setDraft] = useState(trip);

  useEffect(() => {
    if (open) setDraft(trip);
  }, [open, trip]);

  if (!open) return null;

  function change<K extends keyof Trip>(key: K, value: Trip[K]) {
    const nextTrip = { ...draft, [key]: value };
    setDraft(nextTrip);
    onChange(nextTrip);
  }

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="settings-drawer" role="dialog" aria-modal="true" aria-label="旅行设置">
        <header className="settings-drawer__header">
          <div><p>旅行档案</p><h2>旅行设置</h2></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="关闭旅行设置" title="关闭">
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="settings-drawer__body">
          <label>旅行名称<input value={draft.name ?? ""} onChange={(event) => change("name", event.target.value || null)} onBlur={(event) => onCommit({ name: event.target.value || null })} /></label>
          <label>目的城市<input value={draft.destination_city ?? ""} onChange={(event) => change("destination_city", event.target.value || null)} onBlur={(event) => onCommit({ destination_city: event.target.value || null })} /></label>
          <div className="field-grid">
            <label>开始日期<input type="date" value={draft.start_date ?? ""} onChange={(event) => { const value = event.target.value || null; change("start_date", value); onCommit({ start_date: value }); }} /></label>
            <label>结束日期<input type="date" value={draft.end_date ?? ""} onChange={(event) => { const value = event.target.value || null; change("end_date", value); onCommit({ end_date: value }); }} /></label>
          </div>
          <label>出行人数<input type="number" min="1" value={draft.travelers} onChange={(event) => change("travelers", Number(event.target.value))} onBlur={(event) => onCommit({ travelers: Number(event.target.value) })} /></label>
          <div className="field-grid">
            <label>每日开始<input type="time" value={draft.daily_start_time.slice(0, 5)} onChange={(event) => { const value = `${event.target.value}:00`; change("daily_start_time", value); onCommit({ daily_start_time: value }); }} /></label>
            <label>每日结束<input type="time" value={draft.daily_end_time.slice(0, 5)} onChange={(event) => { const value = `${event.target.value}:00`; change("daily_end_time", value); onCommit({ daily_end_time: value }); }} /></label>
          </div>
          <label>旅行备注<textarea value={draft.notes ?? ""} onChange={(event) => change("notes", event.target.value || null)} onBlur={(event) => onCommit({ notes: event.target.value || null })} placeholder="住宿、预算或需要提醒的安排" /></label>
        </div>

        <footer className="settings-drawer__footer">
          <button className="danger-command" type="button" onClick={onDeleteTrip}><Trash2 aria-hidden="true" />删除当前旅行</button>
          <button type="button" onClick={onClose}>完成</button>
        </footer>
      </section>
    </div>
  );
}
