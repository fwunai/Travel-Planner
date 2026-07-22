"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, LoaderCircle, MapPinned } from "lucide-react";
import type { Place } from "@/lib/types";
import { useMapEditorStore } from "@/stores/map-editor-store";

declare global { interface Window { AMap?: any; _AMapSecurityConfig?: { securityJsCode: string } } }

function loadAmap() {
  if (window.AMap) return Promise.resolve();
  const key = process.env.NEXT_PUBLIC_AMAP_JS_KEY;
  if (!key) return Promise.reject(new Error("地图服务尚未配置，请添加 NEXT_PUBLIC_AMAP_JS_KEY"));
  window._AMapSecurityConfig = { securityJsCode: process.env.NEXT_PUBLIC_AMAP_JS_SECURITY_CODE ?? "" };
  return new Promise<void>((resolve, reject) => { const script = document.createElement("script"); script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}`; script.onload = () => resolve(); script.onerror = () => reject(new Error("高德地图加载失败")); document.head.appendChild(script); });
}

export function MapCanvas({ places }: { places: Place[] }) {
  const element = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const selectedPlaceId = useMapEditorStore((state) => state.selectedPlaceId);
  const selectPlace = useMapEditorStore((state) => state.selectPlace);

  useEffect(() => {
    const container = element.current;
    if (!container) return;
    let active = true;
    loadAmap()
      .then(() => {
        if (!active) return;
        map.current = new window.AMap.Map(container, { zoom: 11, center: [120.1551, 30.2741] });
        setReady(true);
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : "高德地图加载失败");
      });
    return () => {
      active = false;
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];
      map.current?.destroy();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ready || !map.current || !window.AMap) return;
    markers.current.forEach((marker) => marker.remove());
    markers.current = places.map((place, index) => {
      const marker = new window.AMap.Marker({
        position: [place.longitude, place.latitude],
        title: place.name,
        label: { content: `${index + 1}`, direction: "top" },
        zIndex: 100,
      });
      marker.on("click", () => selectPlace(place.id));
      marker.setMap(map.current);
      return marker;
    });
    if (places.length) map.current.setFitView(markers.current);
  }, [places, ready, selectPlace]);

  useEffect(() => {
    if (!ready) return;
    markers.current.forEach((marker, index) => {
      marker.setzIndex(places[index]?.id === selectedPlaceId ? 130 : 100);
    });
  }, [places, ready, selectedPlaceId]);

  return (
    <div className="map" role="region" aria-label="旅行地图" aria-busy={!ready && !error}>
      <div ref={element} className="map-canvas" />
      {!ready && !error && <div className="map-state map-state--loading" role="status"><LoaderCircle className="spin" aria-hidden="true" /><span>正在加载城市地图</span></div>}
      {!places.length && <div className="map-state map-state--empty"><MapPinned aria-hidden="true" /><strong>旅行版图等待第一站</strong><span>加入地点后，地图会自动定位并连接你的旅行版图</span></div>}
      {error && <div className="map-state map-state--error" role="alert"><AlertTriangle aria-hidden="true" /><strong>地图暂时不可用</strong><span>{error}</span></div>}
    </div>
  );
}
