"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { MapCanvas } from "@/components/map/MapCanvas";
import { MobileWorkspaceNav, type WorkspaceView } from "@/components/planner/MobileWorkspaceNav";
import { PlaceSearchPanel } from "@/components/planner/PlaceSearchPanel";
import { RoutePanel } from "@/components/planner/RoutePanel";
import { TripHeader } from "@/components/planner/TripHeader";
import { TripSettingsDrawer } from "@/components/planner/TripSettingsDrawer";
import { api } from "@/lib/api-client";
import { DEFAULT_TAGS, readTagLibrary, writeTagLibrary } from "@/lib/tag-library";
import type { GeoPlace, Place, Trip } from "@/lib/types";
import { useMapEditorStore } from "@/stores/map-editor-store";

const legacyCategories = ["attraction", "hotel", "restaurant", "transport", "shopping", "other"];

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
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [workspaceMessage, setWorkspaceMessage] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [addingPlace, setAddingPlace] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileView, setMobileView] = useState<WorkspaceView>("map");
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
      setSearchMessage(null);
      setWorkspaceMessage(null);
      setSaveState("已自动保存到本地");
    } catch (error) {
      setWorkspaceMessage(error instanceof Error ? error.message : "旅行加载失败");
      setSaveState("加载失败");
    }
  }

  async function load() {
    try {
      const nextTrips = await api<Trip[]>("/trips");
      setTrips(nextTrips);
      if (nextTrips.length) await loadTripData(nextTrips[0].id);
      else await createPlan();
    } catch (error) {
      setWorkspaceMessage(error instanceof Error ? error.message : "旅行加载失败");
      setSaveState("加载失败");
    }
  }

  useEffect(() => {
    if (initialLoadStarted.current) return;
    initialLoadStarted.current = true;
    load();
    setTags(readTagLibrary());
    return () => selectPlace(null);
    // The initial workspace bootstrap intentionally runs once per mounted page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectPlace]);

  async function updateTrip(fields: Partial<Trip>) {
    if (!trip) return;
    setSaveState("保存中…");
    try {
      const nextTrip = await api<Trip>(`/trips/${trip.id}`, { method: "PATCH", body: JSON.stringify(fields) });
      setTrip(nextTrip);
      setTrips((current) => current.map((item) => item.id === nextTrip.id ? nextTrip : item));
      setWorkspaceMessage(null);
      setSaveState("已自动保存到本地");
    } catch (error) {
      setWorkspaceMessage(error instanceof Error ? error.message : "旅行保存失败");
      setSaveState("保存失败");
    }
  }

  function changeCity(value: string) {
    setCity(value);
    setKeyword("");
    setResults([]);
    setSelectedResult(null);
    setSearchMessage(null);
  }

  async function createPlan() {
    setSaveState("创建计划中…");
    try {
      const created = await api<Trip>("/trips", { method: "POST", body: JSON.stringify({}) });
      setTrips((current) => [created, ...current]);
      await loadTripData(created.id);
      setSettingsOpen(true);
    } catch (error) {
      setWorkspaceMessage(error instanceof Error ? error.message : "创建旅行失败");
      setSaveState("创建失败");
    }
  }

  async function switchPlan(tripId: string) {
    if (!tripId || tripId === activeTripId) return;
    setSaveState("切换计划中…");
    await loadTripData(tripId);
  }

  async function deleteCurrentPlan() {
    if (!trip || !window.confirm(`确定删除“${trip.name || "未命名旅行"}”吗？`)) return;
    setSaveState("删除计划中…");
    try {
      await api(`/trips/${trip.id}`, { method: "DELETE" });
      setSettingsOpen(false);
      const remaining = trips.filter((item) => item.id !== trip.id);
      if (remaining.length) {
        setTrips(remaining);
        await loadTripData(remaining[0].id);
      } else {
        setTrips([]);
        await createPlan();
      }
    } catch (error) {
      setWorkspaceMessage(error instanceof Error ? error.message : "删除旅行失败");
      setSaveState("删除失败");
    }
  }

  function changeKeyword(value: string) {
    setKeyword(value);
    setResults([]);
    setSelectedResult(null);
    setSearchMessage(null);
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
        setSearchMessage(nextResults.length ? null : "没有找到匹配地点，请更换关键词或补充城市");
      } catch (error) {
        if (requestId === searchRequest.current) setSearchMessage(error instanceof Error ? error.message : "地点搜索失败");
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
      setSearchMessage(null);
      setMobileView("map");
    } catch (error) {
      setSearchMessage(error instanceof Error ? error.message : "地点添加失败");
    } finally {
      setAddingPlace(false);
    }
  }

  async function updatePlace(placeId: string, fields: Partial<Place>) {
    if (!trip) return;
    try {
      const place = await api<Place>(`/trips/${trip.id}/places/${placeId}`, { method: "PATCH", body: JSON.stringify(fields) });
      setPlaces((current) => current.map((item) => item.id === placeId ? place : item));
      setWorkspaceMessage(null);
    } catch (error) {
      setWorkspaceMessage(error instanceof Error ? error.message : "地点更新失败");
    }
  }

  async function removePlace(placeId: string) {
    if (!trip) return;
    try {
      await api(`/trips/${trip.id}/places/${placeId}`, { method: "DELETE" });
      setPlaces((current) => current.filter((place) => place.id !== placeId));
      if (selectedPlaceId === placeId) selectPlace(null);
      setWorkspaceMessage(null);
    } catch (error) {
      setWorkspaceMessage(error instanceof Error ? error.message : "地点删除失败");
    }
  }

  async function movePlace(placeId: string, direction: "up" | "down") {
    if (!trip) return;
    const sourceIndex = places.findIndex((place) => place.id === placeId);
    const targetIndex = direction === "up" ? sourceIndex - 1 : sourceIndex + 1;
    if (sourceIndex < 0 || targetIndex < 0 || targetIndex >= places.length) return;
    const previous = places;
    const reordered = [...places];
    [reordered[sourceIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[sourceIndex]];
    const normalized = reordered.map((place, index) => ({ ...place, sort_order: index }));
    setPlaces(normalized);
    try {
      await Promise.all([
        api<Place>(`/trips/${trip.id}/places/${normalized[sourceIndex].id}`, { method: "PATCH", body: JSON.stringify({ sort_order: sourceIndex }) }),
        api<Place>(`/trips/${trip.id}/places/${normalized[targetIndex].id}`, { method: "PATCH", body: JSON.stringify({ sort_order: targetIndex }) }),
      ]);
      setWorkspaceMessage(null);
    } catch (error) {
      setPlaces(previous);
      setWorkspaceMessage(error instanceof Error ? error.message : "地点排序失败");
    }
  }

  const categoryOptions = useMemo(
    () => Array.from(new Set([...legacyCategories, ...tags, ...places.map((place) => place.category)])),
    [places, tags],
  );

  if (!trip) {
    return <main className="workspace-loading"><span className="workspace-loading__mark">T</span><p>{workspaceMessage ?? "正在准备旅行工作区"}</p></main>;
  }

  return (
    <main className="planner-shell">
      <TripHeader trip={trip} saveState={saveState} onCreateTrip={createPlan} onOpenSettings={() => setSettingsOpen(true)} />

      <div className="workspace-bar">
        <label className="trip-switcher">
          <span>切换旅行</span>
          <select value={activeTripId ?? ""} onChange={(event) => switchPlan(event.target.value)}>
            {trips.map((item) => <option key={item.id} value={item.id}>{item.name || "未命名旅行"}{item.destination_city ? ` · ${item.destination_city}` : ""}</option>)}
          </select>
          <ChevronDown aria-hidden="true" />
        </label>
        {workspaceMessage && <p className="workspace-alert" role="alert"><AlertTriangle aria-hidden="true" />{workspaceMessage}</p>}
        <p className="workspace-hint">地点、地图与路线保持同步</p>
      </div>

      <div className="planner-workspace">
        <aside className="workspace-pane workspace-pane--places" data-mobile-active={mobileView === "places"}>
          <PlaceSearchPanel
            city={city} keyword={keyword} tags={tags} selectedTag={selectedTag} customTag={customTag}
            showCustomTag={showCustomTag} results={results} selectedResult={selectedResult}
            searching={searching} addingPlace={addingPlace} message={searchMessage}
            onCityChange={changeCity} onKeywordChange={changeKeyword} onTagSelect={setSelectedTag}
            onToggleCustomTag={() => setShowCustomTag((current) => !current)} onCustomTagChange={setCustomTag}
            onCustomTagSubmit={addCustomTag} onResultSelect={setSelectedResult} onAddPlace={addSelectedPlace}
          />
        </aside>

        <section className="workspace-pane workspace-pane--map" data-mobile-active={mobileView === "map"} aria-label="地图工作区">
          <div className="map-stage__label"><span>地图画布</span><strong>{places.length ? `${places.length} 个地点已定位` : "等待第一个地点"}</strong></div>
          <MapCanvas places={places} />
        </section>

        <aside className="workspace-pane workspace-pane--route" data-mobile-active={mobileView === "route"}>
          <RoutePanel trip={trip} places={places} selectedPlaceId={selectedPlaceId} categoryOptions={categoryOptions} onSelectPlace={selectPlace} onUpdatePlace={updatePlace} onMovePlace={movePlace} onRemovePlace={removePlace} />
        </aside>
      </div>

      <MobileWorkspaceNav value={mobileView} onChange={setMobileView} />
      <TripSettingsDrawer open={settingsOpen} trip={trip} onClose={() => setSettingsOpen(false)} onChange={setTrip} onCommit={updateTrip} onDeleteTrip={deleteCurrentPlan} />
    </main>
  );
}
