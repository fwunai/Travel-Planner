"use client";

import { CalendarDays, MapPin, Plus, Settings2, Users } from "lucide-react";
import { formatTripRange, getSaveTone } from "@/lib/planner-view";
import type { Trip } from "@/lib/types";

type TripHeaderProps = {
  trip: Trip;
  saveState: string;
  onCreateTrip: () => void;
  onOpenSettings: () => void;
};

export function TripHeader({ trip, saveState, onCreateTrip, onOpenSettings }: TripHeaderProps) {
  return (
    <header className="trip-header">
      <div className="trip-header__identity">
        <span className="trip-header__brand">Traveller</span>
        <div>
          <p className="trip-header__eyebrow">当前行程</p>
          <h1>{trip.name || "未命名旅行"}</h1>
        </div>
      </div>

      <dl className="trip-header__facts" aria-label="行程概览">
        <div><MapPin aria-hidden="true" /><dt>目的地</dt><dd>{trip.destination_city || "城市待定"}</dd></div>
        <div><CalendarDays aria-hidden="true" /><dt>日期</dt><dd>{formatTripRange(trip.start_date, trip.end_date)}</dd></div>
        <div><Users aria-hidden="true" /><dt>同行</dt><dd>{trip.travelers} 人同行</dd></div>
      </dl>

      <div className="trip-header__actions">
        <span className="save-indicator" data-tone={getSaveTone(saveState)}>{saveState}</span>
        <button className="icon-button" type="button" onClick={onCreateTrip} aria-label="新建旅行" title="新建旅行">
          <Plus aria-hidden="true" />
        </button>
        <button className="icon-button" type="button" onClick={onOpenSettings} aria-label="打开旅行设置" title="旅行设置">
          <Settings2 aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
