import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RoutePanel } from "@/components/planner/RoutePanel";
import type { Place, Trip } from "@/lib/types";

const trip = { daily_start_time: "09:00:00" } as Trip;
const places = [
  {
    id: "place-1", name: "西湖", address: "西湖区", category: "attraction", priority: "must_visit", user_note: null,
    provider: "amap", provider_place_id: "poi-1", longitude: 120.14, latitude: 30.25, coordinate_system: "GCJ-02",
    rating: 4.8, opening_hours: null, photo_url: null, description: null,
  },
  {
    id: "place-2", name: "河坊街", address: "上城区", category: "美食", priority: "optional", user_note: "晚餐",
    provider: "amap", provider_place_id: "poi-2", longitude: 120.17, latitude: 30.24, coordinate_system: "GCJ-02",
    rating: null, opening_hours: null, photo_url: null, description: null,
  },
] satisfies Place[];

describe("RoutePanel", () => {
  it("renders the route summary and ordered planning slots", () => {
    render(<RoutePanel trip={trip} places={places} selectedPlaceId="place-1" categoryOptions={["attraction", "美食"]} onSelectPlace={() => {}} onUpdatePlace={() => {}} onRemovePlace={() => {}} />);
    expect(screen.getByText("2 站")).toBeInTheDocument();
    expect(screen.getByText("必去 1")).toBeInTheDocument();
    expect(screen.getByText("备选 1")).toBeInTheDocument();
    expect(screen.getByText("09:00")).toBeInTheDocument();
    expect(screen.getByText("10:30")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /第 1 站 西湖/ })).toHaveAttribute("aria-current", "true");
  });

  it("renders direct empty guidance", () => {
    render(<RoutePanel trip={trip} places={[]} selectedPlaceId={null} categoryOptions={[]} onSelectPlace={() => {}} onUpdatePlace={() => {}} onRemovePlace={() => {}} />);
    expect(screen.getByText("先从左侧搜索并加入第一个地点")).toBeInTheDocument();
  });

  it("updates controls and confirms deletion with the place name", async () => {
    const user = userEvent.setup();
    const onUpdatePlace = vi.fn();
    const onRemovePlace = vi.fn();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<RoutePanel trip={trip} places={places} selectedPlaceId={null} categoryOptions={["attraction", "美食"]} onSelectPlace={() => {}} onUpdatePlace={onUpdatePlace} onRemovePlace={onRemovePlace} />);

    await user.selectOptions(screen.getByLabelText("西湖的优先级"), "optional");
    fireEvent.change(screen.getByLabelText("西湖的备注"), { target: { value: "上午游览" } });
    fireEvent.blur(screen.getByLabelText("西湖的备注"), { target: { value: "上午游览" } });
    await user.click(screen.getByRole("button", { name: "删除西湖" }));

    expect(onUpdatePlace).toHaveBeenCalledWith("place-1", { priority: "optional" });
    expect(onUpdatePlace).toHaveBeenCalledWith("place-1", { user_note: "上午游览" });
    expect(window.confirm).toHaveBeenCalledWith("从行程中删除“西湖”吗？");
    expect(onRemovePlace).toHaveBeenCalledWith("place-1");
  });
});
