import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, Pressable, RefreshControl, SafeAreaView,
  ScrollView, StatusBar, StyleSheet, Text, TextInput, View,
} from "react-native";
import { clearToken, getCurrent, getHistory, getToken, login, register, type Reading } from "./src/api";
import { backgroundFor, describe } from "./src/weather";

export default function App() {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    getToken().then((t: string | null) => { if (t) setUser("utilizator"); }).finally(() => setBooting(false));
  }, []);

  if (booting) return <View style={s.center}><ActivityIndicator color="#fff" /></View>;
  if (!user) return <LoginScreen onLogin={setUser} />;
  return <WeatherScreen user={user} onLogout={async () => { await clearToken(); setUser(null); }} />;
}

function LoginScreen({ onLogin }: { onLogin: (u: string) => void }) {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      if (mode === "register") { await register(username, password); }
      onLogin(await login(username, password));
    } catch (e: any) {
      Alert.alert("Eroare", e.message);
    } finally { setBusy(false); }
  };

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: "#0f172a", justifyContent: "center" }]}>
      <StatusBar barStyle="light-content" />
      <Text style={s.logo}>🌤️ WeatherIoT</Text>
      <Text style={s.sub}>{mode === "login" ? "Autentificare" : "Creare cont"}</Text>
      <TextInput style={s.input} placeholder="Utilizator" placeholderTextColor="#94a3b8"
        autoCapitalize="none" value={username} onChangeText={setU} />
      <TextInput style={s.input} placeholder="Parolă (min. 6 caractere)" placeholderTextColor="#94a3b8"
        secureTextEntry value={password} onChangeText={setP} />
      <Pressable style={s.button} onPress={submit} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>{mode === "login" ? "Intră" : "Creează cont"}</Text>}
      </Pressable>
      <Pressable onPress={() => setMode(mode === "login" ? "register" : "login")}>
        <Text style={s.link}>{mode === "login" ? "Nu ai cont? Înregistrează-te" : "Ai deja cont? Autentifică-te"}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function WeatherScreen({ user, onLogout }: { user: string; onLogout: () => void }) {
  const [current, setCurrent] = useState<Reading | null>(null);
  const [hist, setHist] = useState<Reading[]>([]);
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [c, h] = await Promise.all([getCurrent(), getHistory()]);
    setCurrent(c.data); setOffline(c.offline); setHist(h);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const d = describe(current?.code ?? null);
  const updated = current ? new Date(current.ts).toLocaleString("ro-RO") : "—";

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: backgroundFor(current?.temp ?? null) }]}>
      <StatusBar barStyle="light-content" />
      <View style={s.topBar}>
        <Text style={s.sub}>Salut, {user}</Text>
        <Pressable onPress={onLogout}><Text style={s.link}>Log off</Text></Pressable>
      </View>
      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#fff" />}>
        {offline && <View style={s.badge}><Text style={s.badgeText}>Offline · ultimele date salvate</Text></View>}
        <Text style={s.city}>Cluj-Napoca</Text>
        <Text style={s.icon}>{d.icon}</Text>
        <Text style={s.temp}>{current?.temp !== null && current ? `${Math.round(current.temp!)}°` : "—"}</Text>
        <Text style={s.label}>{d.label}</Text>
        <Text style={s.updated}>Actualizat: {updated}</Text>

        <View style={s.cards}>
          <Card title="Umiditate" value={current?.humidity != null ? `${current.humidity}%` : "—"} />
          <Card title="Vânt" value={current?.wind != null ? `${current.wind} km/h` : "—"} />
          <Card title="Sursă" value={current?.source ?? "—"} />
        </View>

        <Text style={s.section}>Istoric (ultimele măsurători)</Text>
        {hist.slice(-12).map((r) => (
          <View key={r.ts + r.source} style={s.row}>
            <Text style={s.rowText}>{new Date(r.ts).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}</Text>
            <Text style={s.rowText}>{r.temp !== null ? `${Math.round(r.temp)}°C` : "—"}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const Card = ({ title, value }: { title: string; value: string }) => (
  <View style={s.card}><Text style={s.cardTitle}>{title}</Text><Text style={s.cardValue}>{value}</Text></View>
);

const s = StyleSheet.create({
  center: { flex: 1, backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center" },
  screen: { flex: 1, padding: 20 },
  logo: { fontSize: 36, fontWeight: "800", color: "#fff", textAlign: "center", marginBottom: 6 },
  sub: { color: "#cbd5e1", fontSize: 16, textAlign: "center", marginBottom: 12 },
  input: { backgroundColor: "#1e293b", color: "#fff", borderRadius: 14, padding: 14, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: "#3b82f6", borderRadius: 14, padding: 14, alignItems: "center", marginTop: 4 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  link: { color: "#bfdbfe", textAlign: "center", marginTop: 14 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  badge: { backgroundColor: "rgba(0,0,0,0.35)", borderRadius: 20, padding: 8, alignSelf: "center", marginTop: 8 },
  badgeText: { color: "#fde68a", fontWeight: "600" },
  city: { color: "#fff", fontSize: 26, fontWeight: "600", textAlign: "center", marginTop: 16 },
  icon: { fontSize: 72, textAlign: "center", marginTop: 8 },
  temp: { color: "#fff", fontSize: 96, fontWeight: "200", textAlign: "center" },
  label: { color: "#fff", fontSize: 20, textAlign: "center" },
  updated: { color: "#e2e8f0", fontSize: 12, textAlign: "center", marginTop: 6 },
  cards: { flexDirection: "row", gap: 10, marginTop: 24 },
  card: { flex: 1, backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 16, padding: 14 },
  cardTitle: { color: "#e2e8f0", fontSize: 12 },
  cardValue: { color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 4 },
  section: { color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 28, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.3)" },
  rowText: { color: "#fff", fontSize: 16 },
});
