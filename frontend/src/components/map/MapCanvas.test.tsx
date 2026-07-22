import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MapCanvas } from "@/components/map/MapCanvas";
import type { Place } from "@/lib/types";
import { useMapEditorStore } from "@/stores/map-editor-store";

const originalKey = process.env.NEXT_PUBLIC_AMAP_JS_KEY;

afterEach(() => {
  process.env.NEXT_PUBLIC_AMAP_JS_KEY = originalKey;
  delete window.AMap;
  useMapEditorStore.getState().selectPlace(null);
});

const place = {
  id: "place-1", name: "西湖", longitude: 120.148, latitude: 30.245,
  address: "西湖区", category: "attraction", priority: "must_visit", user_note: null,
  provider: "amap", provider_place_id: "poi-1", coordinate_system: "GCJ02", rating: 4.8,
  opening_hours: null, photo_url: null, description: null, visit_time: "09:00:00", sort_order: 0,
} satisfies Place;

describe("MapCanvas", () => {
  it("keeps an accessible map region and explains missing configuration", async () => {
    delete process.env.NEXT_PUBLIC_AMAP_JS_KEY;
    render(<MapCanvas places={[]} />);

    expect(screen.getByRole("region", { name: "旅行地图" })).toBeInTheDocument();
    expect(await screen.findByRole("alert")).toHaveTextContent("地图服务尚未配置");
    expect(screen.getByText("加入地点后，地图会自动定位并连接你的旅行版图")).toBeInTheDocument();
  });

  it("keeps existing pins mounted when the selected place changes", async () => {
    const markerOptions: Array<Record<string, unknown>> = [];
    const markers: Marker[] = [];
    class Marker {
      on = vi.fn();
      setMap = vi.fn();
      remove = vi.fn();
      setzIndex = vi.fn();
      constructor(options: Record<string, unknown>) { markerOptions.push(options); markers.push(this); }
    }
    class Map {
      setFitView = vi.fn();
      destroy = vi.fn();
    }
    window.AMap = { Map, Marker };

    render(<MapCanvas places={[place]} />);

    await waitFor(() => expect(markerOptions).toHaveLength(1));
    act(() => useMapEditorStore.getState().selectPlace(place.id));

    await waitFor(() => expect(markers[0].setzIndex).toHaveBeenCalledWith(130));
    expect(markerOptions).toHaveLength(1);
    expect(markers[0].remove).not.toHaveBeenCalled();
  });
});
