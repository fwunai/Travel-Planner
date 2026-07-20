"use client";

import { ListFilter, Map, Route } from "lucide-react";

export type WorkspaceView = "map" | "places" | "route";

type MobileWorkspaceNavProps = {
  value: WorkspaceView;
  onChange: (value: WorkspaceView) => void;
};

const views = [
  { value: "map" as const, label: "地图", icon: Map },
  { value: "places" as const, label: "地点", icon: ListFilter },
  { value: "route" as const, label: "行程", icon: Route },
];

export function MobileWorkspaceNav({ value, onChange }: MobileWorkspaceNavProps) {
  return (
    <nav className="mobile-workspace-nav" role="tablist" aria-label="工作区视图">
      {views.map((view) => {
        const Icon = view.icon;
        return <button key={view.value} role="tab" type="button" aria-selected={value === view.value} onClick={() => onChange(view.value)}><Icon aria-hidden="true" /><span>{view.label}</span></button>;
      })}
    </nav>
  );
}
