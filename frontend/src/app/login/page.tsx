"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api, setAccessToken } from "@/lib/api-client";
import type { User } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true); setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const result = await api<{ access_token: string; user: User }>("/auth/login", { method: "POST", body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
      setAccessToken(result.access_token);
      router.push("/trips");
    } catch (exception) { setError(exception instanceof Error ? exception.message : "登录失败"); }
    finally { setPending(false); }
  }

  return <main className="auth"><form onSubmit={submit}><h1>Travel Planner</h1><p>使用预置账号登录</p><label>邮箱<input name="email" type="email" required /></label><label>密码<input name="password" type="password" required /></label>{error && <p className="error">{error}</p>}<button disabled={pending}>{pending ? "登录中…" : "登录"}</button></form></main>;
}
