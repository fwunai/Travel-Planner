import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MapCanvas } from "@/components/map/MapCanvas";

const originalKey = process.env.NEXT_PUBLIC_AMAP_JS_KEY;

afterEach(() => {
  process.env.NEXT_PUBLIC_AMAP_JS_KEY = originalKey;
  delete window.AMap;
});

describe("MapCanvas", () => {
  it("keeps an accessible map region and explains missing configuration", async () => {
    delete process.env.NEXT_PUBLIC_AMAP_JS_KEY;
    render(<MapCanvas places={[]} />);

    expect(screen.getByRole("region", { name: "旅行地图" })).toBeInTheDocument();
    expect(await screen.findByRole("alert")).toHaveTextContent("地图服务尚未配置");
    expect(screen.getByText("加入地点后，地图会自动定位并连接你的旅行版图")).toBeInTheDocument();
  });
});
