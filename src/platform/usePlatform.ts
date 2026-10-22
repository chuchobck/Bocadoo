import { useEffect, useState } from "react";

export type PlatformType = "ios" | "android";

const PLATFORM_STORAGE_KEY = "bocadoo-platform-override";

/**
 * Detecta plataforma por User Agent con capacidad de override en demo.
 */
export function getInitialPlatform(): PlatformType {
  if (typeof window === "undefined") return "ios";
  const stored = localStorage.getItem(PLATFORM_STORAGE_KEY);
  if (stored === "ios" || stored === "android") return stored;

  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("android")) return "android";
  return "ios";
}

export function usePlatform(): {
  platform: PlatformType;
  setPlatform: (p: PlatformType) => void;
  isIos: boolean;
  isAndroid: boolean;
} {
  const [platform, setPlatformState] = useState<PlatformType>(getInitialPlatform);

  useEffect(() => {
    const handleStorage = () => {
      setPlatformState(getInitialPlatform());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setPlatform = (p: PlatformType) => {
    localStorage.setItem(PLATFORM_STORAGE_KEY, p);
    setPlatformState(p);
  };

  return {
    platform,
    setPlatform,
    isIos: platform === "ios",
    isAndroid: platform === "android",
  };
}
