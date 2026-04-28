"use client";
// 기존 window.storage 인터페이스(get/set/list/delete)를 그대로 보존하면서
// 내부 구현만 fetch('/api/...')로 라우팅하는 어댑터.
//
// 컴포넌트는 import { store } from "@/app/lib/store" 로 사용.
// 기존 jsx의 호출 사이트는 거의 변경 없이 동작 (await store.get/set).

const KEY_ROUTES = {
  // 단일 키
  teams: { type: "single", path: "/api/teams" },
  rates: { type: "single", path: "/api/rates" },
  categories: { type: "single", path: "/api/categories" },
  perms: { type: "single", path: "/api/perms" },
  session: { type: "single", path: "/api/auth/session" },
  proposal_revision_patterns: { type: "single", path: "/api/patterns" },
};
const PREFIX_ROUTES = [
  // prefix 기반
  { prefix: "customers:", build: (sub) => `/api/customers?userId=${encodeURIComponent(sub)}` },
  { prefix: "notes:", build: (sub) => `/api/notes/${encodeURIComponent(sub)}` },
];

function resolvePath(key) {
  if (KEY_ROUTES[key]) return KEY_ROUTES[key].path;
  for (const p of PREFIX_ROUTES) {
    if (key.startsWith(p.prefix)) return p.build(key.slice(p.prefix.length));
  }
  return null;
}

async function fetchJson(path, init) {
  try {
    const res = await fetch(path, { credentials: "same-origin", ...init });
    if (res.status === 204) return null;
    if (!res.ok) {
      // 404는 미존재로 간주
      if (res.status === 404) return null;
      const text = await res.text().catch(() => "");
      throw new Error(`API ${path} ${res.status}: ${text.slice(0, 120)}`);
    }
    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  } catch (e) {
    if (typeof window !== "undefined") console.warn("[store]", path, e.message);
    throw e;
  }
}

export const store = {
  // get(key, fallback) — 키 없거나 오류면 fallback 반환
  async get(key, fb = null) {
    try {
      const path = resolvePath(key);
      if (!path) return fb;
      const data = await fetchJson(path);
      return data == null ? fb : data;
    } catch (e) {
      return fb;
    }
  },

  async set(key, value) {
    try {
      const path = resolvePath(key);
      if (!path) return;
      await fetchJson(path, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });
    } catch (e) {
      // 실패해도 흐름 영향 없도록
    }
  },

  // list(prefix) — 알려진 키만 반환. 진짜 enumeration이 필요하면 /api/_keys 같은 엔드포인트가 필요한데
  // 현재 백업/복원 용도로만 쓰여서 KNOWN_KEYS만 반환해도 충분.
  async list(prefix = "") {
    try {
      const known = Object.keys(KEY_ROUTES);
      // customers/notes는 server에서 별도로 처리해야 하므로 dump 엔드포인트로 위임
      if (prefix === "" || prefix.startsWith("customers") || prefix.startsWith("notes")) {
        const dump = await fetchJson("/api/dump/keys");
        if (Array.isArray(dump)) {
          return dump.filter((k) => k.startsWith(prefix));
        }
      }
      return known.filter((k) => k.startsWith(prefix));
    } catch (e) {
      return [];
    }
  },

  async delete(key) {
    try {
      const path = resolvePath(key);
      if (!path) return;
      await fetchJson(path, { method: "DELETE" });
    } catch (e) {}
  },

  // 데이터 export (DataExportPanel용)
  async dumpAll() {
    try {
      return (await fetchJson("/api/dump")) || {};
    } catch (e) {
      return {};
    }
  },

  // 데이터 import (DataExportPanel용)
  async restore(payload, replace = false) {
    return await fetchJson("/api/dump", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ replace, data: payload }),
    });
  },
};
