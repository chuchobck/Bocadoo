import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import {
  MapPin,
  Navigation,
  X,
  Compass,
  AlertCircle,
  Check,
  ChevronRight,
  Sparkles,
  UtensilsCrossed,
  Clock,
  Layers,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import {
  COMMERCIAL_ZONES,
  SUPPORTED_CITIES,
  haversineDistanceMeters,
  estimateWalkingTimeMinutes,
  type CommercialZone,
} from "../data/zones";
import type { RestaurantItem } from "../Screen";

export interface InteractiveMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurants: RestaurantItem[];
  selectedZone: string | null;
  onSelectZone: (zoneName: string) => void;
  onOpenFicha: (restaurant: RestaurantItem) => void;
}

type RangeOption = 100 | 200 | 500 | 1000 | null;

export const InteractiveMapModal: React.FC<InteractiveMapModalProps> = ({
  isOpen,
  onClose,
  restaurants,
  selectedZone,
  onSelectZone,
  onOpenFicha,
}) => {
  const [geoStatus, setGeoStatus] = useState<"PROMPTING" | "GRANTED" | "DENIED" | "CHOOSING_ZONE">(
    "PROMPTING",
  );
  const [selectedCity, setSelectedCity] = useState("quito");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [userZoneName, setUserZoneName] = useState<string>(selectedZone || "Frente a la PUCE");
  const [selectedRange, setSelectedRange] = useState<RangeOption>(500); // 500m por defecto
  const [promptRestaurant, setPromptRestaurant] = useState<RestaurantItem | null>(null);
  const [activeRouteRestaurant, setActiveRouteRestaurant] = useState<RestaurantItem | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const dinerMarkerRef = useRef<L.Marker | null>(null);
  const circleRangeRef = useRef<L.Circle | null>(null);
  const restaurantMarkersRef = useRef<L.Marker[]>([]);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  // Solicitar permiso de geolocalización al abrir
  useEffect(() => {
    if (!isOpen) {
      setPromptRestaurant(null);
      setActiveRouteRestaurant(null);
      return;
    }

    // Inicializar ubicación
    requestGeoPermission();
  }, [isOpen]);

  const requestGeoPermission = () => {
    setGeoStatus("PROMPTING");

    if (typeof window === "undefined" || !navigator.geolocation) {
      setGeoStatus("DENIED");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Si las coordenadas están en Ecuador o se permite
        setUserCoords({ lat: latitude, lng: longitude });
        setUserZoneName("Mi ubicación GPS actual");
        setGeoStatus("GRANTED");
        toast.success("📍 Ubicación GPS obtenida con éxito");
      },
      (err) => {
        console.warn("Geolocalización no permitida o no disponible:", err.message);
        setGeoStatus("DENIED");
      },
      { timeout: 7000, enableHighAccuracy: true },
    );
  };

  const handleSelectCommercialZone = (zone: CommercialZone) => {
    setUserCoords({ lat: zone.lat, lng: zone.lng });
    setUserZoneName(zone.name);
    onSelectZone(zone.name);
    setGeoStatus("GRANTED");
    toast.success(`📍 Ubicado en: ${zone.name}`);
  };

  // Coordenadas activas del comensal (reales o zona predefinida)
  const activeLat = userCoords?.lat ?? -0.2115;
  const activeLng = userCoords?.lng ?? -78.4912;

  // Restaurantes con distancias calculadas a la ubicación actual del comensal
  const restaurantsWithDistance = restaurants.map((r) => {
    // Buscar coordenadas del restaurante
    const zoneMatch = COMMERCIAL_ZONES.find(
      (z) => z.name.toLowerCase() === (r.zona || "").toLowerCase(),
    );
    const rLat =
      r.id === "r1"
        ? -0.2115
        : r.id === "r2"
        ? -0.2085
        : r.id === "r3"
        ? -0.203
        : r.id === "r4"
        ? -0.198
        : zoneMatch?.lat ?? -0.245;
    const rLng =
      r.id === "r1"
        ? -78.4912
        : r.id === "r2"
        ? -78.487
        : r.id === "r3"
        ? -78.4925
        : r.id === "r4"
        ? -78.435
        : zoneMatch?.lng ?? -78.521;

    const meters = haversineDistanceMeters(activeLat, activeLng, rLat, rLng);
    const walkingMinutes = estimateWalkingTimeMinutes(meters);

    return {
      ...r,
      calculatedLat: rLat,
      calculatedLng: rLng,
      distanceMeters: meters,
      walkingMinutes,
    };
  });

  // Filtrar restaurantes por el rango seleccionado
  const visibleRestaurants = restaurantsWithDistance.filter((r) => {
    if (selectedRange === null) return true;
    return r.distanceMeters <= selectedRange;
  });

  // Inicializar o centrar el mapa cuando geoStatus === "GRANTED"
  useEffect(() => {
    if (!isOpen || geoStatus !== "GRANTED" || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [activeLat, activeLng],
        zoom: selectedRange && selectedRange <= 200 ? 17 : 15,
        zoomControl: false,
      });

      // Capa de Google Maps Tiles (con fallback)
      L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        attribution: "Google Maps",
      }).addTo(map);

      // Control de zoom en la esquina inferior derecha
      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([activeLat, activeLng]);
    }

    // Dibujar Pin del Comensal con la ESFERA TIPO WHATSAPP / FACEBOOK COLOR MORADO
    if (dinerMarkerRef.current) {
      dinerMarkerRef.current.remove();
    }

    const dinerIcon = L.divIcon({
      className: "bocadoo-diner-marker",
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <!-- Esfera de pulso radar morado WhatsApp / Facebook -->
          <div style="position: absolute; width: 34px; height: 34px; border-radius: 9999px; background-color: rgba(124, 58, 237, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 26px; height: 26px; border-radius: 9999px; background-color: rgba(124, 58, 237, 0.25);"></div>
          <!-- Punto central morado con borde blanco -->
          <div style="position: relative; width: 18px; height: 18px; border-radius: 9999px; background-color: #7c3aed; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);"></div>
        </div>
      `,
    });

    const dinerMarker = L.marker([activeLat, activeLng], {
      icon: dinerIcon,
      zIndexOffset: 1000,
    }).addTo(mapInstanceRef.current);
    dinerMarkerRef.current = dinerMarker;

    return () => {
      // Limpieza en desmontaje
    };
  }, [isOpen, geoStatus, activeLat, activeLng]);

  // Actualizar círculo de rango y pines de restaurantes en el mapa
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || geoStatus !== "GRANTED") return;

    // Actualizar círculo de rango
    if (circleRangeRef.current) {
      circleRangeRef.current.remove();
      circleRangeRef.current = null;
    }

    if (selectedRange !== null) {
      const circle = L.circle([activeLat, activeLng], {
        radius: selectedRange,
        color: "#7c3aed",
        fillColor: "#7c3aed",
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: "4, 6",
      }).addTo(map);
      circleRangeRef.current = circle;
    }

    // Limpiar pines anteriores
    restaurantMarkersRef.current.forEach((m) => m.remove());
    restaurantMarkersRef.current = [];

    // Dibujar pines de restaurantes visibles
    visibleRestaurants.forEach((rest) => {
      const occBg =
        rest.occupancy === "LIBRE"
          ? "#10b981"
          : rest.occupancy === "MOVIDO"
          ? "#f59e0b"
          : "#ef4444";

      const restIcon = L.divIcon({
        className: "bocadoo-restaurant-marker",
        iconSize: [36, 46],
        iconAnchor: [18, 42],
        html: `
          <div style="position: relative; cursor: pointer; display: flex; flex-direction: column; align-items: center; transition: transform 0.15s ease;">
            <div style="background-color: #ffffff; border: 2px solid #7c3aed; border-radius: 14px; padding: 4px 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 4px;">
              <span style="font-size: 13px;">🍽️</span>
              <span style="font-size: 11px; font-weight: 900; color: #1e1b4b; max-width: 85px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${rest.name}</span>
              <span style="display: inline-block; width: 7px; height: 7px; border-radius: 9999px; background-color: ${occBg};"></span>
            </div>
            <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #7c3aed; margin-top: -1px;"></div>
          </div>
        `,
      });

      const marker = L.marker([rest.calculatedLat, rest.calculatedLng], {
        icon: restIcon,
      }).addTo(map);

      marker.on("click", () => {
        setPromptRestaurant(rest);
      });

      restaurantMarkersRef.current.push(marker);
    });

    // Auto-ajustar vista según rango
    if (selectedRange !== null) {
      if (selectedRange <= 200) {
        map.setView([activeLat, activeLng], 17);
      } else if (selectedRange <= 500) {
        map.setView([activeLat, activeLng], 16);
      } else {
        map.setView([activeLat, activeLng], 15);
      }
    }
  }, [geoStatus, selectedRange, visibleRestaurants.length, activeLat, activeLng]);

  // Manejar trazado de ruta con líneas entrecortadas de color morado más fuerte
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    if (activeRouteRestaurant) {
      const restLat = (activeRouteRestaurant as any).calculatedLat ?? -0.2115;
      const restLng = (activeRouteRestaurant as any).calculatedLng ?? -78.4912;

      // Generar puntos de ruta peatonal con un quiebre intermedio suave simulando calles de Quito
      const midLat = activeLat + (restLat - activeLat) * 0.55;
      const midLng = activeLng + (restLng - activeLng) * 0.45;

      const pathPoints: [number, number][] = [
        [activeLat, activeLng],
        [midLat, midLng],
        [restLat, restLng],
      ];

      // LÍNEA ENTRECORTADA DE COLOR MORADO MÁS FUERTE (#581c87 / #6d28d9)
      const polyline = L.polyline(pathPoints, {
        color: "#581c87", // Morado fuerte
        weight: 5,
        opacity: 0.95,
        dashArray: "8, 12", // Líneas entrecortadas
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      routePolylineRef.current = polyline;

      // Ajustar vista para encuadrar comensal y restaurante
      const bounds = L.latLngBounds([
        [activeLat, activeLng],
        [restLat, restLng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
    }
  }, [activeRouteRestaurant, activeLat, activeLng]);

  // Si el modal está cerrado, no renderizar
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg h-[92vh] max-h-[720px] bg-surface rounded-[32px] border border-border shadow-2xl overflow-hidden flex flex-col">
        {/* CABECERA DEL MODAL */}
        <header className="px-4 py-3 border-b border-border bg-surface flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-[15px] font-black text-foreground">Mapa de Restaurantes</h2>
              <p className="text-[11px] font-semibold text-muted-foreground truncate max-w-[200px]">
                {userZoneName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {geoStatus === "GRANTED" && (
              <button
                type="button"
                onClick={() => setGeoStatus("CHOOSING_ZONE")}
                className="px-2.5 py-1 text-[11px] font-bold text-primary bg-primary-container rounded-full hover:bg-primary-container/80 transition-all flex items-center gap-1"
                title="Cambiar de zona comercial o usar GPS"
              >
                <MapPin className="h-3 w-3" />
                <span>Zonas</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-background text-muted-foreground hover:text-foreground transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* PANTALLA 1: SOLICITANDO PERMISOS */}
        {geoStatus === "PROMPTING" && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-primary/20 animate-ping absolute inset-0" />
              <div className="relative h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                <Navigation className="h-8 w-8 animate-pulse" />
              </div>
            </div>
            <div className="space-y-1 max-w-xs">
              <h3 className="text-[17px] font-black text-foreground">
                Solicitando tu ubicación...
              </h3>
              <p className="text-[12px] text-muted-foreground font-medium">
                Por favor permite el acceso a la ubicación en tu dispositivo para ubicarte
                automáticamente en el mapa.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setGeoStatus("DENIED")}
              className="text-[12px] font-bold text-primary hover:underline pt-2"
            >
              Elegir zona comercial sin GPS →
            </button>
          </div>
        )}

        {/* PANTALLA 2: PERMISO DENEGADO O SELECCIÓN DE ZONAS COMERCIALES PREDEFINIDAS */}
        {(geoStatus === "DENIED" || geoStatus === "CHOOSING_ZONE") && (
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3.5">
            <div className="p-3.5 rounded-2xl bg-primary-container/30 border border-primary/20 space-y-2">
              <div className="flex items-center gap-2 text-primary font-black text-[13px]">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>Ubicaciones Comerciales Predefinidas</span>
              </div>
              <p className="text-[12px] text-muted-foreground font-medium">
                {geoStatus === "DENIED"
                  ? "No se otorgó permiso de GPS. Selecciona una zona comercial para posicionar tu pin en el mapa:"
                  : "Cambia tu ubicación seleccionando una zona comercial o reintenta con GPS:"}
              </p>
              <button
                type="button"
                onClick={requestGeoPermission}
                className="w-full py-2 px-3 rounded-xl bg-primary text-primary-foreground text-[12px] font-extrabold hover:bg-primary-hover active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Navigation className="h-3.5 w-3.5" />
                <span>Intentar con GPS del dispositivo</span>
              </button>
            </div>

            {/* Selector de Ciudad (Quito activo, extensible a Guayaquil y Cuenca) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Ciudad:
              </span>
              <div className="flex gap-2">
                {SUPPORTED_CITIES.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    disabled={!city.enabled}
                    onClick={() => setSelectedCity(city.id)}
                    className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
                      selectedCity === city.id
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : city.enabled
                        ? "bg-background text-foreground border border-border"
                        : "bg-background/40 text-muted-foreground/50 border border-border/40 cursor-not-allowed"
                    }`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Zonas Comerciales de Quito */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Zonas disponibles en Quito:
              </span>
              <div className="space-y-1.5">
                {COMMERCIAL_ZONES.filter((z) => z.city === selectedCity).map((zone) => {
                  const isSelected = userZoneName === zone.name;
                  return (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => handleSelectCommercialZone(zone)}
                      className={`w-full rounded-2xl p-3 text-left transition-all flex items-center justify-between active:scale-[0.99] ${
                        isSelected
                          ? "bg-primary-container text-foreground border border-primary shadow-xs"
                          : "bg-background text-foreground border border-border hover:bg-surface"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`grid h-8 w-8 place-items-center rounded-xl ${
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-primary-container text-primary"
                          }`}
                        >
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-[13px] block">{zone.name}</span>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            {zone.description}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* PANTALLA 3: MAPA INTERACTIVO (GOOGLE MAPS TILES + LEAFLET) */}
        {geoStatus === "GRANTED" && (
          <div className="relative flex-1 w-full h-full overflow-hidden">
            {/* CONTENEDOR DEL MAPA */}
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* FILTRO DE RANGOS EN LA PARTE SUPERIOR DERECHA */}
            <div className="absolute top-3 right-3 z-30 bg-surface/95 backdrop-blur-md rounded-2xl border border-border shadow-lg p-1.5 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground px-2 block">
                Radio de búsqueda
              </span>
              <div className="flex items-center gap-1">
                {(
                  [
                    { label: "100m", value: 100 },
                    { label: "200m", value: 200 },
                    { label: "500m", value: 500 },
                    { label: "1km", value: 1000 },
                    { label: "Todos", value: null },
                  ] as const
                ).map((opt) => {
                  const isCurrent = selectedRange === opt.value;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setSelectedRange(opt.value)}
                      className={`px-2 py-1 rounded-xl text-[11px] font-bold transition-all active:scale-95 ${
                        isCurrent
                          ? "bg-primary text-primary-foreground shadow-2xs font-black"
                          : "bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LEYENDA DEL PIN COMENSAL (ESFERA MORADA) */}
            <div className="absolute top-3 left-3 z-30 bg-surface/90 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-border shadow-xs flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <span className="h-3 w-3 rounded-full bg-[#7c3aed] border-2 border-white inline-block shadow-2xs" />
                <span className="absolute -inset-1 rounded-full bg-[#7c3aed]/40 animate-ping inline-block" />
              </div>
              <span className="text-[11px] font-extrabold text-foreground">Tu ubicación</span>
            </div>

            {/* MODAL / TARJETA FLOTANTE: "¿DESEAS VER LA RUTA HASTA EL RESTAURANTE?" */}
            {promptRestaurant && !activeRouteRestaurant && (
              <div className="absolute bottom-4 left-3 right-3 z-30 bg-surface/98 backdrop-blur-md rounded-[24px] border border-primary/30 p-4 shadow-2xl space-y-3 animate-in slide-in-from-bottom duration-200">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary">
                      Restaurante seleccionado
                    </span>
                    <h3 className="text-[16px] font-black text-foreground truncate mt-0.5">
                      {promptRestaurant.name}
                    </h3>
                    <p className="text-[12px] font-medium text-muted-foreground mt-0.5">
                      📍 A {(promptRestaurant as any).distanceMeters} m · ~
                      {(promptRestaurant as any).walkingMinutes} min a pie
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPromptRestaurant(null)}
                    className="p-1 rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-background border border-border text-[12px] flex items-center justify-between">
                  <span className="text-muted-foreground font-semibold truncate max-w-[200px]">
                    🍲 {promptRestaurant.featuredDish}
                  </span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      promptRestaurant.occupancy === "LIBRE"
                        ? "bg-success-container text-success"
                        : promptRestaurant.occupancy === "MOVIDO"
                        ? "bg-primary-container text-primary"
                        : "bg-danger-container text-on-danger-container"
                    }`}
                  >
                    {promptRestaurant.occupancy}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-[12px] font-bold text-foreground text-center">
                    ¿Deseas ver la ruta hasta {promptRestaurant.name}?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveRouteRestaurant(promptRestaurant);
                        setPromptRestaurant(null);
                        toast.success(`Ruta trazada hacia ${promptRestaurant.name}`);
                      }}
                      className="rounded-full bg-primary text-primary-foreground py-2.5 px-3 text-[12px] font-black shadow-xs hover:bg-primary-hover active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      <span>Ver ruta trazada</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onOpenFicha(promptRestaurant);
                        onClose();
                      }}
                      className="rounded-full bg-background border border-border text-foreground py-2.5 px-3 text-[12px] font-bold hover:bg-surface active:scale-95 transition-all flex items-center justify-center gap-1"
                    >
                      <UtensilsCrossed className="h-3.5 w-3.5" />
                      <span>Ver menú</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* BARRA FLOTANTE DE RUTA ACTIVA (LÍNEAS ENTRECORTADAS MORADAS TRAZADAS) */}
            {activeRouteRestaurant && (
              <div className="absolute bottom-4 left-3 right-3 z-30 bg-surface/98 backdrop-blur-md rounded-[24px] border border-primary p-3.5 shadow-2xl space-y-2.5 animate-in slide-in-from-bottom duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-[#581c87] text-white flex items-center justify-center font-bold shrink-0">
                      <Navigation className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-black text-foreground leading-tight">
                        Ruta hacia {activeRouteRestaurant.name}
                      </h4>
                      <p className="text-[11px] font-bold text-primary">
                        🚶‍♂️ ~{(activeRouteRestaurant as any).walkingMinutes} min a pie (
                        {(activeRouteRestaurant as any).distanceMeters} m)
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveRouteRestaurant(null)}
                    className="p-1 rounded-full text-muted-foreground hover:text-foreground"
                    title="Cerrar ruta"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/70">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenFicha(activeRouteRestaurant);
                      onClose();
                    }}
                    className="rounded-full bg-primary text-primary-foreground py-2 px-3 text-[12px] font-black shadow-xs hover:bg-primary-hover active:scale-95 transition-all text-center"
                  >
                    Ver ficha y pedir
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveRouteRestaurant(null)}
                    className="rounded-full bg-background border border-border text-foreground py-2 px-3 text-[12px] font-bold hover:bg-surface active:scale-95 transition-all text-center"
                  >
                    Quitar ruta
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

