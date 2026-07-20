import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TripSettingsDrawer } from "@/components/planner/TripSettingsDrawer";
import type { Trip } from "@/lib/types";

const trip = {
  id: "trip-1",
  name: "杭州周末",
  destination_city: "杭州",
  destination_adcode: null,
  start_date: "2026-10-01",
  end_date: "2026-10-03",
  travelers: 2,
  daily_start_time: "09:00:00",
  daily_end_time: "20:00:00",
  notes: null,
  map_provider: "amap",
  coordinate_system: "GCJ-02",
  status: "draft",
} satisfies Trip;

describe("TripSettingsDrawer", () => {
  it("does not render when closed", () => {
    render(<TripSettingsDrawer open={false} trip={trip} onClose={() => {}} onChange={() => {}} onCommit={() => {}} onDeleteTrip={() => {}} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("supports closing and committing edited fields", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onChange = vi.fn();
    const onCommit = vi.fn();
    render(<TripSettingsDrawer open trip={trip} onClose={onClose} onChange={onChange} onCommit={onCommit} onDeleteTrip={() => {}} />);

    expect(screen.getByRole("dialog", { name: "旅行设置" })).toBeInTheDocument();
    const nameInput = screen.getByRole("textbox", { name: "旅行名称" });
    await user.clear(nameInput);
    await user.type(nameInput, "西湖慢游");
    nameInput.blur();
    await user.click(screen.getByRole("button", { name: "关闭旅行设置" }));

    expect(onChange).toHaveBeenCalled();
    expect(onCommit).toHaveBeenCalledWith({ name: "西湖慢游" });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
