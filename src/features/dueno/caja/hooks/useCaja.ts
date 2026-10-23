import { useState, useEffect } from "react";
import { localRepository, type LocalConfig } from "@/data/repositories/local.repository";

export function useCaja() {
  const [config, setConfig] = useState<LocalConfig>(() => localRepository.getConfig());
  const [busyMinutesLeft, setBusyMinutesLeft] = useState(20);

  useEffect(() => {
    const unsub = localRepository.subscribe((newCfg) => setConfig(newCfg));
    return () => unsub();
  }, []);

  const toggleManualBusy = () => {
    if (config.isManualBusy) {
      const updated = localRepository.clearManualBusy();
      setConfig(updated);
    } else {
      const updated = localRepository.setManualBusy(20);
      setConfig(updated);
      setBusyMinutesLeft(20);
    }
  };

  return {
    config,
    singlePrice: config.singleLunchPriceFormatted,
    occupancy: config.occupancy,
    isManualBusy: config.isManualBusy,
    busyMinutesLeft,
    toggleManualBusy,
  };
}
