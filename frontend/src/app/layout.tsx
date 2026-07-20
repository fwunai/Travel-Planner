import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Traveller | 城市行程工作台",
  description: "以地图为中心，搜索地点并编排清晰的城市旅行路线。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body><Providers>{children}</Providers></body></html>;
}
