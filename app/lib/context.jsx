"use client";
import { createContext, useContext } from "react";

export const ThemeCtx = createContext(null);
export const useTheme = () => useContext(ThemeCtx);

export const RatesCtx = createContext({ rates: [], setRates: () => {} });
export const useRates = () => useContext(RatesCtx);

export const CategoriesCtx = createContext({ categories: [], setCategories: () => {} });
export const useCategories = () => useContext(CategoriesCtx);
