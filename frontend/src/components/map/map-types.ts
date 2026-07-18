export type Coordinate = { longitude: number; latitude: number };
export type MapMarker = Coordinate & { id: string; title: string; category: string; onClick?: () => void };

export interface MapRenderer {
  initialize(container: HTMLElement): Promise<void>;
  addMarker(marker: MapMarker): string;
  removeMarker(markerId: string): void;
  fitBounds(coordinates: Coordinate[]): void;
  destroy(): void;
}
