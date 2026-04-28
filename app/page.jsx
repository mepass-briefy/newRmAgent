"use client";

import { useState, useEffect } from "react";
import { ThemeCtx, RatesCtx, CategoriesCtx } from "./lib/context";
import { store } from "./lib/store";
import {
  H, DEFAULT_CATEGORIES, DEFAULT_PERMS, DEFAULT_RATES, CATEGORIES_KEY, PATTERN_KEY,
} from "./lib/constants";
import { migrateRates } from "./lib/utils";
import { GlobalStyles } from "./components/GlobalStyles";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { RateCalculator } from "./components/RateCalculator";
import { FirstSetup } from "./components/auth/FirstSetup";
import { Login } from "./components/auth/Login";
import { Dashboard } from "./components/Dashboard";
import { Customers } from "./components/Customers";
import { Consulting } from "./components/Consulting";
import { Contract } from "./components/Contract";
import { Workers } from "./components/Workers";
import { Settings } from "./components/Settings";

export default function Page() {
  const [dark, setDark] = useState(false);
  const [team, setTeam] = useState([]);
  const [rates, setRates] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [perms, setPerms] = useState(DEFAULT_PERMS);
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [appState, setAppState] = useState("loading");
  const c = dark ? H.dark : H.light;
  const toggle = () => setDark(p => !p);

  useEffect(() => {
    (async () => {
      let savedTeam = [];
      let savedRates = null;
      let savedCategories = null;
      let savedPerms = null;
      let savedSession = null;

      try { savedTeam = await store.get("teams", []); } catch (e) { console.error("teams load:", e); }
      try { savedRates = await store.get("rates", null); } catch (e) { console.error("rates load:", e); }
      try { savedCategories = await store.get(CATEGORIES_KEY, null); } catch (e) { console.error("categories load:", e); }
      try { savedPerms = await store.get("perms", null); } catch (e) { console.error("perms load:", e); }
      try { savedSession = await store.get("session", null); } catch (e) { console.error("session load:", e); }

      // proposal_revision_patterns 초기화 (REQ-AI-005)
      try {
        const raw = await store.get(PATTERN_KEY, null);
        if (raw == null) await store.set(PATTERN_KEY, []);
        else if (!Array.isArray(raw)) {
          console.warn("proposal_revision_patterns 형식 오류 → 빈 배열로 리셋");
          await store.set(PATTERN_KEY, []);
        }
      } catch (e) {
        console.error("patterns init:", e);
        try { await store.set(PATTERN_KEY, []); } catch (e2) {}
      }

      try {
        if (savedCategories && Array.isArray(savedCategories) && savedCategories.length > 0) {
          setCategories(savedCategories);
        } else {
          setCategories(DEFAULT_CATEGORIES);
          store.set(CATEGORIES_KEY, DEFAULT_CATEGORIES).catch(() => {});
        }
      } catch (e) { console.error("categories init:", e); setCategories(DEFAULT_CATEGORIES); }

      try {
        if (savedRates && Array.isArray(savedRates) && savedRates.length > 0) {
          const migrated = migrateRates(savedRates);
          setRates(migrated);
          if (JSON.stringify(savedRates) !== JSON.stringify(migrated)) {
            store.set("rates", migrated).catch(() => {});
          }
        } else {
          setRates(DEFAULT_RATES);
          store.set("rates", DEFAULT_RATES).catch(() => {});
        }
      } catch (e) { console.error("rates init:", e); setRates(DEFAULT_RATES); }

      try {
        if (savedPerms) setPerms(savedPerms);
      } catch (e) { console.error("perms init:", e); }

      try {
        const list = Array.isArray(savedTeam) ? savedTeam : [];
        setTeam(list);
        const hasAuth = list.some(t => t && !t.tagOnly && t.password);
        if (!hasAuth) { setAppState("firstSetup"); return; }
        if (savedSession && savedSession.userId) {
          const user = list.find(t => t && t.id === savedSession.userId && !t.tagOnly && t.password);
          if (user) { setCurrentUser(user); setAppState("app"); return; }
        }
        setAppState("login");
      } catch (e) {
        console.error("app state init:", e);
        setAppState("firstSetup");
      }
    })();
  }, []);

  if (appState === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: c.textSub, fontSize: 13 }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid " + c.brand, borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
          초기화 중...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <ThemeCtx.Provider value={{ dark, toggle, c }}>
      <RatesCtx.Provider value={{ rates, setRates }}>
        <CategoriesCtx.Provider value={{ categories, setCategories }}>
          <GlobalStyles />
          {appState === "firstSetup" && (
            <FirstSetup
              onCreated={(t, a) => { setTeam(t); setCurrentUser(a); store.set("session", { userId: a.id }); setAppState("app"); }}
              dark={dark}
              toggleTheme={toggle}
            />
          )}
          {appState === "login" && (
            <Login
              team={team}
              onLogin={u => { setCurrentUser(u); store.set("session", { userId: u.id }); setAppState("app"); }}
              dark={dark}
              toggleTheme={toggle}
            />
          )}
          {appState === "app" && currentUser && (
            <div style={{ display: "flex", minHeight: "100vh", background: c.bg }}>
              <Sidebar
                page={page}
                setPage={setPage}
                onLogout={() => { setCurrentUser(null); store.set("session", null); setAppState("login"); }}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                currentUser={currentUser}
                perms={perms}
              />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <TopBar dark={dark} toggleTheme={toggle} currentUser={currentUser} onOpenCalc={() => setCalcOpen(true)} />
                <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
                  {page === "dashboard" && <Dashboard user={currentUser} />}
                  {page === "customers" && <Customers team={team} setTeam={setTeam} user={currentUser} />}
                  {page === "consulting" && <Consulting user={currentUser} />}
                  {page === "contract" && <Contract user={currentUser} />}
                  {page === "workers" && <Workers />}
                  {page === "settings" && <Settings team={team} setTeam={setTeam} currentUser={currentUser} perms={perms} setPerms={setPerms} />}
                </div>
              </div>
              <RateCalculator open={calcOpen} onClose={() => setCalcOpen(false)} />
            </div>
          )}
        </CategoriesCtx.Provider>
      </RatesCtx.Provider>
    </ThemeCtx.Provider>
  );
}
