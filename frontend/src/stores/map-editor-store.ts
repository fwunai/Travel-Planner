import { create } from "zustand";

type MapEditorState = { selectedPlaceId: string | null; selectPlace: (id: string | null) => void };
export const useMapEditorStore = create<MapEditorState>((set) => ({ selectedPlaceId: null, selectPlace: (selectedPlaceId) => set({ selectedPlaceId }) }));
