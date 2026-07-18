"use client";

import { useEffect, useRef, useState } from "react";
import type { Place } from "@/lib/types";
import { useMapEditorStore } from "@/stores/map-editor-store";

declare global { interface Window { AMap?: any; _AMapSecurityConfig?: { securityJsCode: string } } }

function loadAmap() {
  if (window.AMap) return Promise.resolve();
  const key = process.env.NEXT_PUBLIC_AMAP_JS_KEY;
  if (!key) return Promise.reject(new Error("未配置 NEXT_PUBLIC_AMAP_JS_KEY"));
  window._AMapSecurityConfig = { securityJsCode: process.env.NEXT_PUBLIC_AMAP_JS_SECURITY_CODE ?? "" };
  return new Promise<void>((resolve, reject) => { const script = document.createElement("script"); script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}`; script.onload = () => resolve(); script.onerror = () => reject(new Error("高德地图加载失败")); document.head.appendChild(script); });
}

export function MapCanvas({ places }: { places: Place[] }) {
  const element = useRef<HTMLDivElement>(null); const map = useRef<any>(null); const markers = useRef<any[]>([]); const [error, setError] = useState<string | null>(null); const selectPlace = useMapEditorStore((state) => state.selectPlace);
  useEffect(() => { if (!element.current) return; loadAmap().then(() => { map.current = new window.AMap.Map(element.current, { zoom: 11, center: [120.1551, 30.2741] }); }).catch((reason) => setError(reason.message)); return () => map.current?.destroy(); }, []);
  useEffect(() => { if (!map.current || !window.AMap) return; markers.current.forEach((marker) => marker.remove()); markers.current = places.map((place) => { const marker = new window.AMap.Marker({ position: [place.longitude, place.latitude], title: place.name }); marker.on("click", () => selectPlace(place.id)); marker.setMap(map.current); return marker; }); if (places.length) map.current.setFitView(markers.current); }, [places, selectPlace]);
  return <div className="map">{error ? <div className="map-error">{error}</div> : <div ref={element} className="map-canvas" />}</div>;
}
