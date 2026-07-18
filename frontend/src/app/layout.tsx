import "./globals.css";
import { Providers } from "./providers";

export const metadata = { title: "Travel Planner", description: "地图优先的旅行规划工具" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body><Providers>{children}</Providers></body></html>;
}
