"use client";

import { useState, useTransition } from "react";
import LocationAutocomplete, { type LocationSelection } from "@/app/(empresa)/empresa/cargas/nueva/_components/LocationAutocomplete";
import { useRouter } from "next/navigation";

const VEHICULOS = [
  { value: "camion", label: "Camión", emoji: "🚛" },
  { value: "cerealero", label: "Camión cerealero", emoji: "🌾" },
  { value: "acoplado", label: "Acoplado", emoji: "🚚" },
  { value: "camioneta", label: "Camioneta", emoji: "🛻" },
  { value: "utilitario", label: "Utilitario", emoji: "📦" },
  { value: "comisionista", label: "Comisionista", emoji: "💼" },
  { value: "otro", label: "Otro", emoji: "🚗" },
];

const RADIOS = [
  { value: 20, label: "20 km" },
  { value: 50, label: "50 km" },
  { value: 100, label: "100 km" },
  { value: null, label: "Sin límite" },
];

type Disponibilidad = {
  id: number;
  vehiculo: string;
  zona: string;
  lat: number;
  lng: number;
  radioKm: number | null;
  regresoVacio: boolean;
  buscaCarga: boolean;
  voyAPuerto: boolean;
  disponibleHoy: boolean;
  salidaDesde: string | null;
  salidaDestino: string | null;
  activo: boolean;
  actualizadoEn: string;
};

interface Props {
  inicial: Disponibilidad | null;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1.5px solid #E2E8E8",
  fontSize: "15px",
  outline: "none",
  backgroundColor: "#FFFFFF",
  color: "#111827",
};

export default function DisponibilidadForm({ inicial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deactivating, setDeactivating] = useState(false);

  const [vehiculo, setVehiculo] = useState(inicial?.vehiculo ?? "camion");
  const [zona, setZona] = useState(inicial?.zona ?? "");
  const [loc, setLoc] = useState<LocationSelection | null>(
    inicial ? { label: inicial.zona, lat: inicial.lat, lng: inicial.lng } : null,
  );
  const [radioKm, setRadioKm] = useState<number | null>(inicial?.radioKm ?? 50);
  const [regresoVacio, setRegresoVacio] = useState(inicial?.regresoVacio ?? false);
  const [buscaCarga, setBuscaCarga] = useState(inicial?.buscaCarga ?? false);
  const [voyAPuerto, setVoyAPuerto] = useState(inicial?.voyAPuerto ?? false);
  const [disponibleHoy, setDisponibleHoy] = useState(inicial?.disponibleHoy ?? false);
  const [salidaDesde, setSalidaDesde] = useState(inicial?.salidaDesde ?? "");
  const [salidaDestino, setSalidaDestino] = useState(inicial?.salidaDestino ?? "");
  const [error, setError] = useState("");
  const [activo, setActivo] = useState(inicial?.activo ?? false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!loc) { setError("Seleccioná una localidad de la lista."); return; }
    setError("");

    startTransition(async () => {
      const res = await fetch("/api/disponibilidad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehiculo,
          zona: loc.label,
          lat: loc.lat,
          lng: loc.lng,
          radioKm,
          regresoVacio,
          buscaCarga,
          voyAPuerto,
          disponibleHoy,
          salidaDesde: salidaDesde.trim() || null,
          salidaDestino: salidaDestino.trim() || null,
        }),
      });
      if (res.ok) {
        setActivo(true);
        router.refresh();
      } else {
        setError("Error al guardar. Intentá de nuevo.");
      }
    });
  }

  async function handleDesactivar() {
    setDeactivating(true);
    const res = await fetch("/api/disponibilidad", { method: "DELETE" });
    if (res.ok) {
      setActivo(false);
      router.refresh();
    }
    setDeactivating(false);
  }

  const labelStyle: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#6B7280",
    display: "block",
    marginBottom: "6px",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Status banner */}
      {activo && (
        <div
          className="rounded-xl px-4 py-3 flex items-center justify-between border"
          style={{ backgroundColor: "#DCFCE7", borderColor: "#86EFAC" }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-semibold" style={{ color: "#166534" }}>
              Estás marcado como disponible
            </span>
          </div>
          <button
            type="button"
            onClick={handleDesactivar}
            disabled={deactivating}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}
          >
            {deactivating ? "..." : "Desactivar"}
          </button>
        </div>
      )}

      {/* Tipo de vehículo */}
      <div>
        <span style={labelStyle}>Tipo de vehículo</span>
        <div className="grid grid-cols-2 gap-2">
          {VEHICULOS.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => setVehiculo(v.value)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all text-sm font-semibold"
              style={{
                backgroundColor: vehiculo === v.value ? "var(--primary-10)" : "#FFFFFF",
                borderColor: vehiculo === v.value ? "var(--primary)" : "#E2E8E8",
                color: vehiculo === v.value ? "var(--primary)" : "#374151",
              }}
            >
              <span className="text-xl">{v.emoji}</span>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Zona */}
      <div>
        <label style={labelStyle} htmlFor="zona-input">
          ¿Desde dónde salís a trabajar?
        </label>
        <p className="text-xs mb-2" style={{ color: "#6B7280" }}>
          Tu ciudad o localidad base — desde donde partís habitualmente
        </p>
        <LocationAutocomplete
          id="zona-input"
          name="zona"
          placeholder="Ej: Rosario, Santa Fe"
          required
          inputClass=""
          inputStyle={inputStyle}
          initialValue={zona}
          onValueChange={(v) => { setZona(v); if (!v) setLoc(null); }}
          onLocationSelect={(l) => setLoc(l)}
        />
        {!loc && zona.length > 0 && (
          <p className="text-xs mt-1" style={{ color: "#F59E0B" }}>
            Seleccioná una opción de la lista
          </p>
        )}
      </div>

      {/* Radio */}
      <div>
        <span style={labelStyle}>Radio de trabajo</span>
        <div className="flex gap-2 flex-wrap">
          {RADIOS.map((r) => (
            <button
              key={String(r.value)}
              type="button"
              onClick={() => setRadioKm(r.value)}
              className="px-4 py-2 rounded-xl border text-sm font-semibold transition-all"
              style={{
                backgroundColor: radioKm === r.value ? "var(--primary)" : "#FFFFFF",
                borderColor: radioKm === r.value ? "var(--primary)" : "#E2E8E8",
                color: radioKm === r.value ? "#FFFFFF" : "#374151",
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Badges opcionales */}
      <div>
        <span style={labelStyle}>Estado (opcional)</span>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "regresoVacio", label: "Regreso vacío", state: regresoVacio, set: setRegresoVacio },
            { key: "buscaCarga", label: "Busco carga", state: buscaCarga, set: setBuscaCarga },
            { key: "voyAPuerto", label: "Voy hacia puerto", state: voyAPuerto, set: setVoyAPuerto },
            { key: "disponibleHoy", label: "Disponible hoy", state: disponibleHoy, set: setDisponibleHoy },
          ].map((b) => (
            <button
              key={b.key}
              type="button"
              onClick={() => b.set(!b.state)}
              className="px-3 py-2 rounded-xl border text-sm font-semibold transition-all"
              style={{
                backgroundColor: b.state ? "var(--primary-10)" : "#FFFFFF",
                borderColor: b.state ? "var(--primary)" : "#E2E8E8",
                color: b.state ? "var(--primary)" : "#6B7280",
              }}
            >
              {b.state ? "✓ " : ""}{b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Salgo vacío desde */}
      <div>
        <span style={labelStyle}>Salgo vacío desde (opcional)</span>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="🚛 Ej: Rosario"
            value={salidaDesde}
            onChange={(e) => setSalidaDesde(e.target.value)}
            style={inputStyle}
          />
          {salidaDesde && (
            <input
              type="text"
              placeholder="📍 Destino (ej: Córdoba)"
              value={salidaDestino}
              onChange={(e) => setSalidaDestino(e.target.value)}
              style={inputStyle}
            />
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm font-semibold" style={{ color: "#DC2626" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !loc}
        className="w-full py-3.5 rounded-xl font-bold text-sm transition-opacity"
        style={{
          backgroundColor: "var(--primary)",
          color: "#FFFFFF",
          opacity: pending || !loc ? 0.6 : 1,
        }}
      >
        {pending ? "Guardando..." : activo ? "Actualizar disponibilidad" : "✓ Estoy disponible"}
      </button>
    </form>
  );
}
