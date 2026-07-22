import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RoutePanel } from "@/components/planner/RoutePanel";
import type { Place, Trip } from "@/lib/types";

const trip = { daily_start_time: "09:00:00" } as Trip;
const places = [
  {
    id: "place-1", name: "西湖", address: "西湖区", category: "attraction", priority: "must_visit", user_note: null, visit_time: "09:00:00", sort_order: 0,
    provider: "amap", provider_place_id: "poi-1", longitude: 120.14, latitude: 30.25, coordinate_system: "GCJ-02",
    rating: 4.8, opening_hours: null, photo_url: null, description: null,
  },
  {
    id: "place-2", name: "河坊街", address: "上城区", category: "美食", priority: "optional", user_note: "晚餐", visit_time: "18:30:00", sort_order: 1,
    provider: "amap", provider_place_id: "poi-2", longitude: 120.17, latitude: 30.24, coordinate_system: "GCJ-02",
    rating: null, opening_hours: null, photo_url: null, description: null,
  },
] satisfies Place[];

describe("RoutePanel", () => {
  it("renders the route summary and ordered planning slots", () => {
    render(<RoutePanel trip={trip} places={places} selectedPlaceId="place-1" categoryOptions={["attraction", "美食"]} onSelectPlace={() => {}} onUpdatePlace={() => {}} onMovePlace={() => {}} onRemovePlace={() => {}} />);
    expect(screen.getByText("2 站")).toBeInTheDocument();
    expect(screen.getByText("必去 1")).toBeInTheDocument();
    expect(screen.getByText("备选 1")).toBeInTheDocument();
    expect(screen.getByText("09:00")).toBeInTheDocument();
    expect(screen.getByText("18:30")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /第 1 站 西湖/ })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("heading", { name: "行程安排" })).toBeInTheDocument();
    expect(screen.queryByText("当日路线")).not.toBeInTheDocument();
  });

  it("renders direct empty guidance", () => {
    render(<RoutePanel trip={trip} places={[]} selectedPlaceId={null} categoryOptions={[]} onSelectPlace={() => {}} onUpdatePlace={() => {}} onMovePlace={() => {}} onRemovePlace={() => {}} />);
    expect(screen.getByText("先从左侧搜索并加入第一个地点")).toBeInTheDocument();
  });

  it("updates controls and confirms deletion with the place name", async () => {
    const user = userEvent.setup();
    const onUpdatePlace = vi.fn();
    const onRemovePlace = vi.fn();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<RoutePanel trip={trip} places={places} selectedPlaceId={null} categoryOptions={["attraction", "美食"]} onSelectPlace={() => {}} onUpdatePlace={onUpdatePlace} onMovePlace={() => {}} onRemovePlace={onRemovePlace} />);

    await user.click(screen.getByRole("button", { name: /第 1 站 西湖/ }));

    await user.selectOptions(screen.getByLabelText("西湖的优先级"), "optional");
    fireEvent.change(screen.getByLabelText("西湖的备注"), { target: { value: "上午游览" } });
    fireEvent.blur(screen.getByLabelText("西湖的备注"), { target: { value: "上午游览" } });
    await user.click(screen.getByRole("button", { name: "删除西湖" }));

    expect(onUpdatePlace).toHaveBeenCalledWith("place-1", { priority: "optional" });
    expect(onUpdatePlace).toHaveBeenCalledWith("place-1", { user_note: "上午游览" });
    expect(window.confirm).toHaveBeenCalledWith("从行程中删除“西湖”吗？");
    expect(onRemovePlace).toHaveBeenCalledWith("place-1");
  });

  it("keeps details collapsed until the station is opened", async () => {
    const user = userEvent.setup();
    render(<RoutePanel trip={trip} places={places} selectedPlaceId={null} categoryOptions={["attraction", "美食"]} onSelectPlace={() => {}} onUpdatePlace={() => {}} onMovePlace={() => {}} onRemovePlace={() => {}} />);

    expect(screen.queryByLabelText("西湖的优先级")).not.toBeInTheDocument();
    const station = screen.getByRole("button", { name: /第 1 站 西湖/ });
    expect(station).toHaveAttribute("aria-expanded", "false");
    await user.click(station);
    expect(station).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByLabelText("西湖的优先级")).toBeInTheDocument();
  });

  it("updates a station time and moves it within the route", async () => {
    const user = userEvent.setup();
    const onUpdatePlace = vi.fn();
    const onMovePlace = vi.fn();
    render(<RoutePanel trip={trip} places={places} selectedPlaceId={null} categoryOptions={["attraction", "美食"]} onSelectPlace={() => {}} onUpdatePlace={onUpdatePlace} onMovePlace={onMovePlace} onRemovePlace={() => {}} />);

    await user.click(screen.getByRole("button", { name: /第 1 站 西湖/ }));
    fireEvent.change(screen.getByLabelText("西湖的到访时间"), { target: { value: "10:15" } });
    expect(onUpdatePlace).toHaveBeenCalledWith("place-1", { visit_time: "10:15:00" });

    const secondStation = screen.getByRole("listitem", { name: "第 2 站 河坊街" });
    await user.click(within(secondStation).getByRole("button", { name: /第 2 站 河坊街/ }));
    await user.click(within(secondStation).getByRole("button", { name: "上移河坊街" }));
    expect(onMovePlace).toHaveBeenCalledWith("place-2", "up");
  });
});
