"use client";
import { FONT_URL } from "@/app/lib/constants";

export function GlobalStyles() {
  return (
    <style>{`@import url('${FONT_URL}');* { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important; box-sizing: border-box; }body { -webkit-font-smoothing: antialiased; }::-webkit-scrollbar { width: 5px; height: 5px; }::-webkit-scrollbar-track { background: transparent; }::-webkit-scrollbar-thumb { background: rgba(108,117,125,0.4); border-radius: 4px; }@keyframes spin { to { transform: rotate(360deg); } }@keyframes pulse { from{transform:scale(0.85);opacity:0.4} to{transform:scale(1.15);opacity:1} }`}</style>
  );
}
