"use client";

import type { FormEventHandler } from "react";
import { LoaderCircle, MapPin, Plus, Search, Tag } from "lucide-react";
import type { GeoPlace } from "@/lib/types";

type PlaceSearchPanelProps = {
  city: string;
  keyword: string;
  tags: string[];
  selectedTag: string;
  customTag: string;
  showCustomTag: boolean;
  results: GeoPlace[];
  selectedResult: GeoPlace | null;
  searching: boolean;
  addingPlace: boolean;
  message: string | null;
  onCityChange: (value: string) => void;
  onKeywordChange: (value: string) => void;
  onTagSelect: (tag: string) => void;
  onToggleCustomTag: () => void;
  onCustomTagChange: (value: string) => void;
  onCustomTagSubmit: FormEventHandler<HTMLFormElement>;
  onResultSelect: (result: GeoPlace) => void;
  onAddPlace: () => void;
};

export function PlaceSearchPanel(props: PlaceSearchPanelProps) {
  const {
    city, keyword, tags, selectedTag, customTag, showCustomTag, results, selectedResult,
    searching, addingPlace, message, onCityChange, onKeywordChange, onTagSelect,
    onToggleCustomTag, onCustomTagChange, onCustomTagSubmit, onResultSelect, onAddPlace,
  } = props;

  return (
    <section className="place-search" aria-labelledby="place-search-title">
      <header className="panel-heading">
        <div><p>地点库</p><h2 id="place-search-title">找到下一站</h2></div>
        <span>输入至少两个字</span>
      </header>

      <div className="place-search__fields">
        <label>
          <span>城市范围</span>
          <div className="input-with-icon"><MapPin aria-hidden="true" /><input value={city} onChange={(event) => onCityChange(event.target.value)} placeholder="例如：杭州" /></div>
        </label>
        <label>
          <span>搜索地点</span>
          <div className="input-with-icon"><Search aria-hidden="true" /><input type="search" value={keyword} onChange={(event) => onKeywordChange(event.target.value)} placeholder="景点、餐厅或地标" /></div>
        </label>
      </div>

      <div className="tag-picker" aria-label="地点标签">
        <div className="tag-picker__label"><Tag aria-hidden="true" /><span>加入时标记为</span></div>
        <div className="tag-picker__options">
          {tags.map((tag) => <button key={tag} type="button" className="tag-button" aria-pressed={selectedTag === tag} onClick={() => onTagSelect(tag)}>{tag}</button>)}
          <button className="tag-button tag-button--custom" type="button" aria-expanded={showCustomTag} onClick={onToggleCustomTag}><Plus aria-hidden="true" />自定义</button>
        </div>
      </div>

      {showCustomTag && (
        <form className="custom-tag-form" aria-label="自定义标签" onSubmit={onCustomTagSubmit}>
          <label><span>新标签</span><input value={customTag} onChange={(event) => onCustomTagChange(event.target.value)} maxLength={30} autoFocus /></label>
          <button type="submit">保存标签</button>
        </form>
      )}

      <div className="search-feedback">
        {searching && <p className="inline-status" role="status"><LoaderCircle className="spin" aria-hidden="true" />正在搜索地点</p>}
        {message && <p className="inline-alert" role="alert">{message}</p>}
      </div>

      <div className="search-results" aria-label="地点搜索结果">
        {results.map((result) => {
          const selected = selectedResult?.provider_place_id === result.provider_place_id;
          return (
            <button key={result.provider_place_id} type="button" className="search-result" aria-pressed={selected} onClick={() => onResultSelect(result)}>
              <span className="search-result__marker"><MapPin aria-hidden="true" /></span>
              <span><strong>{result.name}</strong><small>{result.address ?? "地址待确认"}</small></span>
              {result.rating != null && <em>{result.rating.toFixed(1)}</em>}
            </button>
          );
        })}
      </div>

      <div className="selected-place-action" data-ready={Boolean(selectedResult && selectedTag)}>
        <div>
          <span>{selectedResult ? "已选地点" : "选择一个搜索结果"}</span>
          <strong>{selectedResult?.name ?? "尚未选择"}</strong>
        </div>
        <button type="button" disabled={!selectedResult || !selectedTag || addingPlace} onClick={onAddPlace}>
          {addingPlace ? <LoaderCircle className="spin" aria-hidden="true" /> : <Plus aria-hidden="true" />}
          {addingPlace ? "正在加入" : "加入行程"}
        </button>
      </div>
    </section>
  );
}
