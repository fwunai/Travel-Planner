"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Clock3, MapPinned, MoreHorizontal, Trash2 } from "lucide-react";
import { buildRouteTime, categoryLabel, summarizePlaces } from "@/lib/planner-view";
import type { Place, Trip } from "@/lib/types";

type RoutePanelProps = {
  trip: Trip;
  places: Place[];
  selectedPlaceId: string | null;
  categoryOptions: string[];
  onSelectPlace: (placeId: string) => void;
  onUpdatePlace: (placeId: string, fields: Partial<Place>) => void;
  onMovePlace: (placeId: string, direction: "up" | "down") => void;
  onRemovePlace: (placeId: string) => void;
};

export function RoutePanel({ trip, places, selectedPlaceId, categoryOptions, onSelectPlace, onUpdatePlace, onMovePlace, onRemovePlace }: RoutePanelProps) {
  const summary = summarizePlaces(places);
  const [expandedPlaceId, setExpandedPlaceId] = useState<string | null>(null);

  function remove(place: Place) {
    if (window.confirm(`从行程中删除“${place.name}”吗？`)) onRemovePlace(place.id);
  }

  return (
    <section className="route-panel" aria-labelledby="route-title">
      <header className="panel-heading route-panel__heading">
        <div><h2 id="route-title">行程安排</h2></div>
        <button className="icon-button" type="button" aria-label="更多路线操作" title="更多路线操作"><MoreHorizontal aria-hidden="true" /></button>
      </header>

      <div className="route-summary" aria-label="路线汇总">
        <strong>{summary.total} 站</strong><span>必去 {summary.mustVisit}</span><span>备选 {summary.optional}</span>
      </div>

      {!places.length ? (
        <div className="route-empty"><MapPinned aria-hidden="true" /><strong>路线还没有站点</strong><p>先从左侧搜索并加入第一个地点</p></div>
      ) : (
        <ol className="route-spine">
          {places.map((place, index) => {
            const selected = place.id === selectedPlaceId;
            const expanded = place.id === expandedPlaceId;
            const displayTime = place.visit_time?.slice(0, 5) ?? buildRouteTime(trip.daily_start_time, index);
            return (
              <li className="route-node" data-selected={selected} data-expanded={expanded} key={place.id} aria-label={`第 ${index + 1} 站 ${place.name}`}>
                <div className="route-node__rail" aria-hidden="true"><span>{index + 1}</span></div>
                <article>
                  <button className="route-node__select" type="button" aria-current={selected ? "true" : undefined} aria-expanded={expanded} aria-label={`第 ${index + 1} 站 ${place.name}`} onClick={() => { onSelectPlace(place.id); setExpandedPlaceId(expanded ? null : place.id); }}>
                    <strong>{place.name}</strong>
                    <span className="route-node__time"><Clock3 aria-hidden="true" />{displayTime}</span>
                    <ChevronDown className="route-node__chevron" aria-hidden="true" />
                  </button>

                  {expanded && <div className="route-node__details">
                    <p className="route-node__address">{place.address ?? "地址待确认"}</p>
                    <div className="route-node__controls">
                      <label><span>到访时间</span><input type="time" aria-label={`${place.name}的到访时间`} value={displayTime} onChange={(event) => onUpdatePlace(place.id, { visit_time: `${event.target.value}:00` })} /></label>
                      <label><span>类型</span><select aria-label={`${place.name}的类型`} value={place.category} onChange={(event) => onUpdatePlace(place.id, { category: event.target.value })}>{categoryOptions.map((category) => <option key={category} value={category}>{categoryLabel(category)}</option>)}</select></label>
                      <label><span>优先级</span><select aria-label={`${place.name}的优先级`} value={place.priority} onChange={(event) => onUpdatePlace(place.id, { priority: event.target.value })}><option value="must_visit">必去</option><option value="optional">备选</option></select></label>
                    </div>
                    <div className="route-node__move" aria-label={`${place.name}的顺序`}>
                      <button type="button" aria-label={`上移${place.name}`} title="上移" disabled={index === 0} onClick={() => onMovePlace(place.id, "up")}><ChevronUp aria-hidden="true" /></button>
                      <button type="button" aria-label={`下移${place.name}`} title="下移" disabled={index === places.length - 1} onClick={() => onMovePlace(place.id, "down")}><ChevronDown aria-hidden="true" /></button>
                    </div>
                    <label className="route-node__note"><span>备注</span><textarea aria-label={`${place.name}的备注`} defaultValue={place.user_note ?? ""} placeholder="到访提示或预订信息" onBlur={(event) => onUpdatePlace(place.id, { user_note: event.target.value || null })} /></label>
                    <button className="route-node__delete" type="button" aria-label={`删除${place.name}`} onClick={() => remove(place)}><Trash2 aria-hidden="true" />删除站点</button>
                  </div>}
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
