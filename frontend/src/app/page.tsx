"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { MapCanvas } from "@/components/map/MapCanvas";
import { api } from "@/lib/api-client";
import { DEFAULT_TAGS, readTagLibrary, writeTagLibrary } from "@/lib/tag-library";
import type { GeoPlace, Place, Trip } from "@/lib/types";
import { useMapEditorStore } from "@/stores/map-editor-store";

const legacyCategories = ["attraction", "hotel", "restaurant", "transport", "shopping", "other"];
const categoryLabels: Record<string, string> = {
  attraction: "景点",
  hotel: "住宿",
  restaurant: "美食",
  transport: "交通",
  shopping: "购物",
  other: "其他",
};

function categoryLabel(category: string) {
  return categoryLabels[category] ?? category;
}

export default function PlannerPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [results, setResults] = useState<GeoPlace[]>([]);
  const [city, setCity] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedResult, setSelectedResult] = useState<GeoPlace | null>(null);
  const [tags, setTags] = useState(DEFAULT_TAGS);
  const [selectedTag, setSelectedTag] = useState(DEFAULT_TAGS[0]);
  const [customTag, setCustomTag] = useState("");
  const [showCustomTag, setShowCustomTag] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [addingPlace, setAddingPlace] = useState(false);
  const [saveState, setSaveState] = useState("正在加载…");
  const searchRequest = useRef(0);
  const tripLoadRequest = useRef(0);
  const initialLoadStarted = useRef(false);
  const selectedPlaceId = useMapEditorStore((state) => state.selectedPlaceId);
  const selectPlace = useMapEditorStore((state) => state.selectPlace);

  async function loadTripData(tripId: string) {
    const requestId = ++tripLoadRequest.current;
    try {
      const [nextTrip, nextPlaces] = await Promise.all([
        api<Trip>(`/trips/${tripId}`),
        api<Place[]>(`/trips/${tripId}/places`),
      ]);
      if (requestId !== tripLoadRequest.current) return;
      setActiveTripId(tripId);
      setTrip(nextTrip);
      setPlaces(nextPlaces);
      setResults([]);
      setKeyword("");
      setSelectedResult(null);
      selectPlace(null);
      setMessage(null);
      setSaveState("已自动保存到本地");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "加载失败");
      setSaveState("加载失败");
    }
  }

  async function load() {
    try {
      const nextTrips = await api<Trip[]>("/trips");
      setTrips(nextTrips);
      if (nextTrips.length) {
        await loadTripData(nextTrips[0].id);
      } else {
        await createPlan();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "加载失败");
      setSaveState("加载失败");
    }
  }

  useEffect(() => {
    if (initialLoadStarted.current) return;
    initialLoadStarted.current = true;
    load();
    setTags(readTagLibrary());
    return () => selectPlace(null);
  }, [selectPlace]);

  async function updateTrip(fields: Partial<Trip>) {
    if (!trip) return;
    setSaveState("保存中…");
    try {
      const nextTrip = await api<Trip>(`/trips/${trip.id}`, { method: "PATCH", body: JSON.stringify(fields) });
      setTrip(nextTrip);
      setTrips((current) => current.map((item) => item.id === nextTrip.id ? nextTrip : item));
      setSaveState("已自动保存到本地");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败");
      setSaveState("保存失败");
    }
  }

  function changeCity(value: string) {
    setCity(value);
    setKeyword("");
    setResults([]);
    setSelectedResult(null);
  }

  async function createPlan() {
    setSaveState("创建计划中…");
    try {
      const created = await api<Trip>("/trips", { method: "POST", body: JSON.stringify({}) });
      setTrips((current) => [created, ...current]);
      await loadTripData(created.id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "创建计划失败");
      setSaveState("创建失败");
    }
  }

  async function switchPlan(tripId: string) {
    if (!tripId || tripId === activeTripId) return;
    setSaveState("切换计划中…");
    await loadTripData(tripId);
  }

  async function deleteCurrentPlan() {
    if (!trip || !window.confirm(`确定删除“${trip.name || "未命名计划"}”吗？`)) return;
    setSaveState("删除计划中…");
    try {
      await api(`/trips/${trip.id}`, { method: "DELETE" });
      const remaining = trips.filter((item) => item.id !== trip.id);
      if (remaining.length) {
        setTrips(remaining);
        await loadTripData(remaining[0].id);
      } else {
        setTrips([]);
        await createPlan();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "删除计划失败");
      setSaveState("删除失败");
    }
  }

  function changeKeyword(value: string) {
    setKeyword(value);
    setResults([]);
    setSelectedResult(null);
    setMessage(null);
  }

  useEffect(() => {
    const trimmedKeyword = keyword.trim();
    const requestId = ++searchRequest.current;
    if (trimmedKeyword.length < 2) {
      setSearching(false);
      setResults([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const cityParam = city.trim() ? `&city=${encodeURIComponent(city.trim())}` : "";
        const nextResults = await api<GeoPlace[]>(`/geo/places/search?keyword=${encodeURIComponent(trimmedKeyword)}${cityParam}`);
        if (requestId !== searchRequest.current) return;
        setResults(nextResults);
        setMessage(nextResults.length ? null : "没有找到匹配地点，请更换关键词或补充城市");
      } catch (error) {
        if (requestId === searchRequest.current) setMessage(error instanceof Error ? error.message : "搜索失败");
      } finally {
        if (requestId === searchRequest.current) setSearching(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [city, keyword]);

  function addCustomTag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = customTag.trim();
    if (!value) return;
    const nextTags = writeTagLibrary([...tags, value]);
    setTags(nextTags);
    setSelectedTag(value);
    setCustomTag("");
    setShowCustomTag(false);
  }

  async function addSelectedPlace() {
    if (!trip || !selectedResult || !selectedTag) return;
    setAddingPlace(true);
    try {
      const place = await api<Place>(`/trips/${trip.id}/places`, {
        method: "POST",
        body: JSON.stringify({ provider_place_id: selectedResult.provider_place_id, category: selectedTag }),
      });
      setPlaces((current) => [...current, place]);
      selectPlace(place.id);
      setKeyword("");
      setResults([]);
      setSelectedResult(null);
      setMessage(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "添加失败");
    } finally {
      setAddingPlace(false);
    }
  }

  async function updatePlace(placeId: string, fields: Partial<Place>) {
    if (!trip) return;
    try {
      const place = await api<Place>(`/trips/${trip.id}/places/${placeId}`, { method: "PATCH", body: JSON.stringify(fields) });
      setPlaces((current) => current.map((item) => item.id === placeId ? place : item));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "更新失败");
    }
  }

  async function removePlace(placeId: string) {
    if (!trip) return;
    try {
      await api(`/trips/${trip.id}/places/${placeId}`, { method: "DELETE" });
      setPlaces((current) => current.filter((place) => place.id !== placeId));
      if (selectedPlaceId === placeId) selectPlace(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "删除失败");
    }
  }

  const summary = useMemo(() => ({
    mustVisit: places.filter((place) => place.priority === "must_visit").length,
    optional: places.filter((place) => place.priority !== "must_visit").length,
  }), [places]);
  const categoryOptions = useMemo(
    () => Array.from(new Set([...legacyCategories, ...tags, ...places.map((place) => place.category)])),
    [places, tags],
  );

  if (!trip) return <main className="loading">{message ?? "正在准备你的旅行工作区…"}</main>;

  return <main className="planner">
    <header className="planner-header">
      <div><h1>Traveller</h1><p>{trip.name || "未命名计划"}</p></div>
      <span className={saveState === "保存失败" ? "error" : "save-state"}>{saveState}</span>
    </header>

    <aside className="metadata-panel">
      <div className="plan-selector">
        <label>旅行计划<select value={activeTripId ?? ""} onChange={(event) => switchPlan(event.target.value)}>{trips.map((item) => <option key={item.id} value={item.id}>{item.name || "未命名计划"}{item.destination_city ? ` · ${item.destination_city}` : ""}</option>)}</select></label>
        <div className="plan-actions"><button className="secondary" type="button" onClick={createPlan}>新建计划</button><button className="delete-plan" type="button" onClick={deleteCurrentPlan}>删除计划</button></div>
      </div>
      <details className="trip-details">
        <summary><span>旅行信息</span><small>{trip.destination_city || "未设置目的城市"}</small></summary>
        <div className="trip-details-content">
          <label>旅行名称<input value={trip.name ?? ""} onChange={(event) => setTrip({ ...trip, name: event.target.value || null })} onBlur={(event) => updateTrip({ name: event.target.value || null })} placeholder="例如：杭州周末游" /></label>
          <label>目的城市<input value={trip.destination_city ?? ""} onChange={(event) => setTrip({ ...trip, destination_city: event.target.value || null })} onBlur={(event) => updateTrip({ destination_city: event.target.value || null })} placeholder="例如：杭州" /></label>
          <div className="field-row"><label>开始日期<input type="date" value={trip.start_date ?? ""} onChange={(event) => { const value = event.target.value || null; setTrip({ ...trip, start_date: value }); updateTrip({ start_date: value }); }} /></label><label>结束日期<input type="date" value={trip.end_date ?? ""} onChange={(event) => { const value = event.target.value || null; setTrip({ ...trip, end_date: value }); updateTrip({ end_date: value }); }} /></label></div>
          <label>出行人数<input type="number" min="1" value={trip.travelers} onChange={(event) => setTrip({ ...trip, travelers: Number(event.target.value) })} onBlur={(event) => updateTrip({ travelers: Number(event.target.value) })} /></label>
          <div className="field-row"><label>每日开始<input type="time" value={trip.daily_start_time.slice(0, 5)} onChange={(event) => { const value = `${event.target.value}:00`; setTrip({ ...trip, daily_start_time: value }); updateTrip({ daily_start_time: value }); }} /></label><label>每日结束<input type="time" value={trip.daily_end_time.slice(0, 5)} onChange={(event) => { const value = `${event.target.value}:00`; setTrip({ ...trip, daily_end_time: value }); updateTrip({ daily_end_time: value }); }} /></label></div>
          <label>旅行备注<textarea value={trip.notes ?? ""} onChange={(event) => setTrip({ ...trip, notes: event.target.value || null })} onBlur={(event) => updateTrip({ notes: event.target.value || null })} placeholder="记录住宿、预算或想法…" /></label>
        </div>
      </details>
    </aside>

    <section className="map-area">
      <div className="map-tools">
        <div className="search-toolbar">
          <label className="toolbar-field city-field"><span>地区/城市</span><input value={city} onChange={(event) => changeCity(event.target.value)} placeholder="例如：杭州" /></label>
          <label className="toolbar-field place-field"><span>搜索地点</span><input value={keyword} onChange={(event) => changeKeyword(event.target.value)} placeholder="输入景点、餐厅或地标" /></label>
          <div className="toolbar-field tag-field"><span>标签</span><div className="tag-options">{tags.map((tag) => <button className={selectedTag === tag ? "tag-option active" : "tag-option"} key={tag} type="button" onClick={() => setSelectedTag(tag)}>{tag}</button>)}<button className="tag-custom-trigger" type="button" onClick={() => setShowCustomTag((current) => !current)}>+ 自定义</button></div></div>
          <button className="add-place-button" type="button" disabled={!selectedResult || !selectedTag || addingPlace} onClick={addSelectedPlace}>{addingPlace ? "添加中…" : "添加"}</button>
        </div>
        {showCustomTag && <form className="custom-tag-form" onSubmit={addCustomTag}><input value={customTag} onChange={(event) => setCustomTag(event.target.value)} placeholder="输入新标签" maxLength={30} autoFocus /><button type="submit">保存标签</button></form>}
        {searching && <p className="search-status">正在搜索地点…</p>}
        {message && <p className="error search-status">{message}</p>}
        {selectedResult && <p className="selected-result">已选择：{selectedResult.name} · {selectedResult.address ?? "地址未知"}</p>}
        {results.length > 0 && <div className="results">{results.map((result) => <button className={selectedResult?.provider_place_id === result.provider_place_id ? "result-option selected" : "result-option"} key={result.provider_place_id} type="button" onClick={() => setSelectedResult(result)}><strong>{result.name}</strong><span>{result.address ?? "地址未知"}</span></button>)}</div>}
      </div>
      <MapCanvas places={places} />
    </section>

    <aside className="plan-panel">
      <h2>地点规划</h2>
      <p className="summary">共 {places.length} 个地点 · 必去 {summary.mustVisit} · 备选 {summary.optional}</p>
      {places.map((place) => <article className={selectedPlaceId === place.id ? "selected" : ""} key={place.id} onClick={() => selectPlace(place.id)}><strong>{place.name}</strong><span>{place.address ?? "地点地址未知"}</span><div className="field-row"><select value={place.category} onChange={(event) => updatePlace(place.id, { category: event.target.value })}>{categoryOptions.map((category) => <option key={category} value={category}>{categoryLabel(category)}</option>)}</select><select value={place.priority} onChange={(event) => updatePlace(place.id, { priority: event.target.value })}><option value="must_visit">必去</option><option value="optional">备选</option></select></div><textarea value={place.user_note ?? ""} placeholder="地点备注" onChange={(event) => setPlaces((current) => current.map((item) => item.id === place.id ? { ...item, user_note: event.target.value || null } : item))} onBlur={(event) => updatePlace(place.id, { user_note: event.target.value || null })} /><button className="delete" type="button" onClick={(event) => { event.stopPropagation(); removePlace(place.id); }}>删除</button></article>)}
      {!places.length && <p>在上方搜索并添加地点。</p>}
    </aside>
  </main>;
}
