"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { api, setAccessToken } from "@/lib/api-client";
import type { Trip } from "@/lib/types";

const today = new Date().toISOString().slice(0, 10);

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]); const [error, setError] = useState<string | null>(null);
  async function load() { try { setTrips(await api<Trip[]>("/trips")); } catch { location.assign("/login"); } }
  useEffect(() => { load(); }, []);
  async function createTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    try { await api<Trip>("/trips", { method: "POST", body: JSON.stringify({ name: form.get("name"), destination_city: form.get("city"), start_date: form.get("start"), end_date: form.get("end"), travelers: Number(form.get("travelers")), daily_start_time: "09:00:00", daily_end_time: "21:00:00" }) }); event.currentTarget.reset(); await load(); } catch (exception) { setError(exception instanceof Error ? exception.message : "创建失败"); }
  }
  return <main className="dashboard"><header><h1>我的旅行</h1><button onClick={() => { setAccessToken(null); location.assign("/login"); }}>退出</button></header><section className="create"><h2>创建旅行项目</h2><form onSubmit={createTrip}><input name="name" placeholder="旅行名称" required /><input name="city" placeholder="目的城市" required /><input name="start" type="date" defaultValue={today} required /><input name="end" type="date" defaultValue={today} required /><input name="travelers" type="number" min="1" defaultValue="1" required /><button>创建</button></form>{error && <p className="error">{error}</p>}</section><section><h2>最近编辑</h2><div className="cards">{trips.map((trip) => <Link href={`/trips/${trip.id}`} className="card" key={trip.id}><strong>{trip.name}</strong><span>{trip.destination_city} · {trip.start_date} 至 {trip.end_date}</span></Link>)}{!trips.length && <p>还没有旅行项目。</p>}</div></section></main>;
}
