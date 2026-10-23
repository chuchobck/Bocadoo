import React, { useState } from "react";
import { Settings, Shield, User, Store, AlertCircle, WifiOff, Loader2, ArrowLeft, CreditCard } from "lucide-react";
import { AJUSTES_COPY } from "./copy";
import { localRepository } from "@/data/repositories/local.repository";
import type { ComponentState } from "@/design-system";

export type RolDueno = "dueno" | "cajero";

export interface AjustesScreenProps {
  currentRole?: RolDueno;
  onRoleChange?: (role: RolDueno) => void;
  onMigrateCard?: () => void;
  onBack?: () => void;
  onRetry?: () => void;
  state?: ComponentState;
}

export const AjustesScreen: React.FC<AjustesScreenProps> = ({
  currentRole = "dueno",
  onRoleChange,
  onMigrateCard,
  onBack,
  onRetry,
  state = "exito",
}) => {
  const [activeRole, setActiveRole] = useState<RolDueno>(currentRole);
  const localConfig = localRepository.getConfig();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [currentLogo, setCurrentLogo] = useState<string | null>(localConfig.logoUrl || null);

  const getMonogram = (name: string): string => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "B";
    const first = parts[0] || "";
    if (parts.length === 1) return first.slice(0, 2).toUpperCase();
    const second = parts[1] || "";
    return ((first[0] || "") + (second[0] || "")).toUpperCase() || "B";
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Crop centered square
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 256, 256);

        // Max 60 KB: adjust quality
        let quality = 0.85;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);
        while (dataUrl.length > 60 * 1024 * 1.33 && quality > 0.3) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        setCurrentLogo(dataUrl);
        localRepository.updateConfig({ logoUrl: dataUrl });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSwitchRole = (role: RolDueno) => {
    setActiveRole(role);
    onRoleChange?.(role);
  };

  return (
    <div
      tabIndex={0}
      aria-label="Ajustes del local"
      className="flex h-full flex-col bg-white overflow-y-auto no-scrollbar focus:outline-hidden"
    >
      <header className="px-4 py-3 border-b border-[#E7E1F2] bg-white sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Volver a caja"
              className="grid h-9 w-9 place-items-center rounded-full bg-[#F5F3FA] text-[#4A0E78] active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-[22px] font-black text-[#4A0E78]">{AJUSTES_COPY.title}</h1>
        </div>
        <span className="text-[13px] font-bold text-[#6B5B7B]">
          {activeRole === "dueno" ? "Modo dueño" : "Modo cajero"}
        </span>
      </header>

      <main className="flex-1 p-4">
        {state === "cargando" && (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#7B2CBF]" />
            <h2 className="mt-3 text-[17px] font-extrabold text-[#4A0E78]">{AJUSTES_COPY.loadingTitle}</h2>
          </div>
        )}

        {state === "vacio" && (
          <div className="py-16 text-center">
            <Settings className="mx-auto h-12 w-12 text-[#6B5B7B] mb-2" />
            <h2 className="text-[17px] font-extrabold text-[#4A0E78]">{AJUSTES_COPY.emptyTitle}</h2>
            <p className="mt-1 text-[13px] font-semibold text-[#6B5B7B]">{AJUSTES_COPY.emptyDesc}</p>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-[28px] bg-[#FDEBEB] p-6 text-center text-[#C0392B] border border-[#C0392B]">
            <AlertCircle className="mx-auto h-10 w-10 mb-2" />
            <h2 className="text-[17px] font-extrabold">{AJUSTES_COPY.errorTitle}</h2>
            <p className="mt-1 text-[13px] font-semibold">{AJUSTES_COPY.errorDesc}</p>
            <button
              type="button"
              onClick={onRetry || (() => window.location.reload())}
              className="mt-4 rounded-full bg-[#C0392B] px-5 py-2 text-[13px] font-bold text-white active:scale-95"
            >
              Reintentar
            </button>
          </div>
        )}

        {state === "offline" && (
          <div className="mb-4 flex items-center justify-center gap-1.5 rounded-full bg-[#F5F3FA] py-1 text-[13px] font-bold text-[#6B5B7B]">
            <WifiOff className="h-3.5 w-3.5" />
            <span>{AJUSTES_COPY.offlineBadge}</span>
          </div>
        )}

        {(state === "exito" || state === "offline") && (
          <div className="space-y-4">
            {/* Selector de Rol activo */}
            <div className="rounded-[24px] bg-[#F5F3FA] p-4 border border-[#E7E1F2]">
              <span className="text-[13px] font-bold text-[#6B5B7B] uppercase tracking-wider block mb-2">
                {AJUSTES_COPY.roleLabel}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSwitchRole("dueno")}
                  aria-pressed={activeRole === "dueno"}
                  className={`rounded-2xl py-3 text-[14px] font-bold transition-all ${
                    activeRole === "dueno"
                      ? "bg-[#7B2CBF] text-white shadow-xs"
                      : "bg-white text-[#4A0E78] border border-[#E7E1F2]"
                  }`}
                >
                  {AJUSTES_COPY.ownerRole}
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchRole("cajero")}
                  aria-pressed={activeRole === "cajero"}
                  className={`rounded-2xl py-3 text-[14px] font-bold transition-all ${
                    activeRole === "cajero"
                      ? "bg-[#7B2CBF] text-white shadow-xs"
                      : "bg-white text-[#4A0E78] border border-[#E7E1F2]"
                  }`}
                >
                  {AJUSTES_COPY.cashierRole}
                </button>
              </div>
              <p className="mt-2 text-[13px] font-semibold text-[#6B5B7B]">
                {activeRole === "cajero"
                  ? AJUSTES_COPY.cashierScope
                  : AJUSTES_COPY.ownerScope}
              </p>
            </div>

            {/* Acción: Pasar cartulina en Más */}
            {onMigrateCard && (
              <div
                onClick={onMigrateCard}
                role="button"
                tabIndex={0}
                className="rounded-[24px] bg-white p-4 border border-[#E7E1F2] shadow-xs cursor-pointer hover:border-[#7B2CBF] transition-all flex items-center justify-between group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[#F3E8FF] text-[#7B2CBF] group-hover:scale-105 transition-transform">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-black text-[#4A0E78]">
                      {AJUSTES_COPY.migrateCardButton}
                    </h3>
                    <p className="text-[13px] font-semibold text-[#6B5B7B]">
                      {AJUSTES_COPY.migrateCardDesc}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[#F3E8FF] px-3 py-1 text-[13px] font-bold text-[#7B2CBF]">
                  Abrir
                </span>
              </div>
            )}

            {/* Logo del Restaurante (sube archivo -> recorte cuadrado 256px -> máx 60KB) */}
            <div className="rounded-[24px] bg-white p-4 border border-[#E7E1F2] shadow-xs space-y-3">
              <span className="text-[13px] font-bold text-[#6B5B7B] uppercase tracking-wider block">
                Logo del local
              </span>
              <div className="flex items-center gap-4">
                {currentLogo ? (
                  <img
                    src={currentLogo}
                    alt={localConfig.name}
                    className="h-14 w-14 rounded-2xl object-cover border border-[#E7E1F2]"
                  />
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#F3E8FF] text-[18px] font-black text-[#4A0E78]">
                    {getMonogram(localConfig.name)}
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-full bg-[#7B2CBF] px-4 py-2 text-[13px] font-bold text-white active:scale-95 transition-all shadow-xs"
                    >
                      {currentLogo ? "Cambiar logo" : "Subir logo"}
                    </button>
                    {currentLogo && (
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentLogo(null);
                          localRepository.updateConfig({ logoUrl: null });
                        }}
                        className="rounded-full bg-[#F5F3FA] px-3 py-2 text-[13px] font-bold text-[#C0392B] border border-[#E7E1F2] active:scale-95"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                  <span className="text-[13px] font-semibold text-[#6B5B7B] block">
                    Cuadrado · Máx. 60 KB
                  </span>
                </div>
              </div>
            </div>

            {/* Datos del Local leídos del repositorio */}
            <div className="rounded-[24px] bg-white p-4 border border-[#E7E1F2] shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[#F3E8FF] text-[#7B2CBF]">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-black text-[#4A0E78]">
                    {localConfig.name}
                  </h3>
                  <span className="text-[13px] font-semibold text-[#6B5B7B]">
                    {localConfig.address} · {localConfig.totalSeats} puestos
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
