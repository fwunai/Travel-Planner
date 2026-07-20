import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TripHeader } from "@/components/planner/TripHeader";
import type { Trip } from "@/lib/types";

const trip = {
  id: "trip-1",
  name: "杭州周末",
  destination_city: "杭州",
  start_date: "2026-10-01",
  end_date: "2026-10-03",
  travelers: 2,
} as Trip;

describe("TripHeader", () => {
  it("renders the current trip context and save state", () => {
    render(<TripHeader trip={trip} saveState="已自动保存到本地" onCreateTrip={() => {}} onOpenSettings={() => {}} />);

    expect(screen.getByRole("heading", { name: "杭州周末" })).toBeInTheDocument();
    expect(screen.getByText("杭州")).toBeInTheDocument();
    expect(screen.getByText("2026.10.01 - 10.03")).toBeInTheDocument();
    expect(screen.getByText("2 人同行")).toBeInTheDocument();
    expect(screen.getByText("已自动保存到本地")).toHaveAttribute("data-tone", "saved");
  });

  it("exposes labelled commands", async () => {
    const user = userEvent.setup();
    const onCreateTrip = vi.fn();
    const onOpenSettings = vi.fn();
    render(<TripHeader trip={trip} saveState="保存中…" onCreateTrip={onCreateTrip} onOpenSettings={onOpenSettings} />);

    await user.click(screen.getByRole("button", { name: "新建旅行" }));
    await user.click(screen.getByRole("button", { name: "打开旅行设置" }));

    expect(onCreateTrip).toHaveBeenCalledOnce();
    expect(onOpenSettings).toHaveBeenCalledOnce();
  });
});
