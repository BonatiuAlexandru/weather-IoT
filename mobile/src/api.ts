import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "./config";

export interface Reading {
  topic: string;
  source: string;
  temp: number | null;
  humidity: number | null;
  wind: number | null;
  code: number | null;
  ts: string;
}

const TOKEN_KEY = "token";
const CACHE_KEY = "cache_current";
const CACHE_HISTORY_KEY = "cache_history";

export const saveToken = (t: string) => SecureStore.setItemAsync(TOKEN_KEY, t);
export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY);
export const clearToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);

async function request(path: string, init: RequestInit = {}, auth = true) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const t = await getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(API_URL + path, { ...init, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `Eroare ${res.status}`);
  return body;
}

export async function login(username: string, password: string) {
  const r = await request("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }, false);
  await saveToken(r.token);
  return r.username as string;
}

export async function register(username: string, password: string) {
  await request("/auth/register", { method: "POST", body: JSON.stringify({ username, password }) }, false);
}

// Online + offline: incercam serverul; daca nu merge, folosim ultima valoare salvata local.
export async function getCurrent(): Promise<{ data: Reading | null; offline: boolean }> {
  try {
    const data = (await request("/weather/current")) as Reading;
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
    return { data, offline: false };
  } catch {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    return { data: cached ? JSON.parse(cached) : null, offline: true };
  }
}

export async function getHistory(): Promise<Reading[]> {
  try {
    const data = (await request("/weather/history?limit=24")) as Reading[];
    await AsyncStorage.setItem(CACHE_HISTORY_KEY, JSON.stringify(data));
    return data;
  } catch {
    const cached = await AsyncStorage.getItem(CACHE_HISTORY_KEY);
    return cached ? JSON.parse(cached) : [];
  }
}
