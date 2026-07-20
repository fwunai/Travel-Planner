import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MobileWorkspaceNav } from "@/components/planner/MobileWorkspaceNav";

describe("MobileWorkspaceNav", () => {
  it("exposes stable controlled workspace tabs", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MobileWorkspaceNav value="map" onChange={onChange} />);

    expect(screen.getByRole("tab", { name: "地图" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "地点" })).toHaveAttribute("aria-selected", "false");
    await user.click(screen.getByRole("tab", { name: "行程" }));
    expect(onChange).toHaveBeenCalledWith("route");
  });
});
