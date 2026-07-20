import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PlaceSearchPanel } from "@/components/planner/PlaceSearchPanel";
import type { GeoPlace } from "@/lib/types";

const result = {
  provider_place_id: "poi-1",
  name: "西湖风景名胜区",
  address: "杭州市西湖区",
  longitude: 120.14,
  latitude: 30.25,
  category: "景点",
  rating: 4.8,
  opening_hours: null,
  photo_url: null,
  description: null,
} satisfies GeoPlace;

function renderPanel(overrides: Partial<React.ComponentProps<typeof PlaceSearchPanel>> = {}) {
  const props: React.ComponentProps<typeof PlaceSearchPanel> = {
    city: "杭州",
    keyword: "西湖",
    tags: ["景点", "美食"],
    selectedTag: "景点",
    customTag: "",
    showCustomTag: false,
    results: [result],
    selectedResult: null,
    searching: false,
    addingPlace: false,
    message: null,
    onCityChange: vi.fn(),
    onKeywordChange: vi.fn(),
    onTagSelect: vi.fn(),
    onToggleCustomTag: vi.fn(),
    onCustomTagChange: vi.fn(),
    onCustomTagSubmit: vi.fn(),
    onResultSelect: vi.fn(),
    onAddPlace: vi.fn(),
    ...overrides,
  };
  render(<PlaceSearchPanel {...props} />);
  return props;
}

describe("PlaceSearchPanel", () => {
  it("reports city and keyword changes", async () => {
    const user = userEvent.setup();
    const props = renderPanel();
    await user.type(screen.getByRole("textbox", { name: "城市范围" }), "市");
    await user.type(screen.getByRole("searchbox", { name: "搜索地点" }), "边");
    expect(props.onCityChange).toHaveBeenCalled();
    expect(props.onKeywordChange).toHaveBeenCalled();
  });

  it("keeps search feedback scoped inside the panel", () => {
    renderPanel({ searching: true, message: "地点服务暂时不可用", results: [] });
    expect(screen.getByRole("status")).toHaveTextContent("正在搜索地点");
    expect(screen.getByRole("alert")).toHaveTextContent("地点服务暂时不可用");
  });

  it("selects a result and only enables add when selection is complete", async () => {
    const user = userEvent.setup();
    const props = renderPanel();
    expect(screen.getByRole("button", { name: "加入行程" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /西湖风景名胜区/ }));
    expect(props.onResultSelect).toHaveBeenCalledWith(result);

    const selectedProps = renderPanel({ selectedResult: result });
    const addButton = screen.getAllByRole("button", { name: "加入行程" }).at(-1)!;
    expect(addButton).toBeEnabled();
    await user.click(addButton);
    expect(selectedProps.onAddPlace).toHaveBeenCalledOnce();
  });

  it("submits a custom tag form", () => {
    const props = renderPanel({ showCustomTag: true, customTag: "亲子" });
    fireEvent.submit(screen.getByRole("form", { name: "自定义标签" }));
    expect(props.onCustomTagSubmit).toHaveBeenCalled();
  });
});
