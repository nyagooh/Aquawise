import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNetworks } from '../hooks/useNetworkQueries';
import type { WaterNetwork } from '../types/api';

const STORAGE_KEY = 'aw-active-network';

interface NetworkContextValue {
  networks: WaterNetwork[];
  activeNetwork: WaterNetwork | null;
  setActiveNetwork: (network: WaterNetwork | null) => void;
  isLoading: boolean;
  hasNetworks: boolean; // true once fetch completed and at least one network exists
}

const NetworkContext = createContext<NetworkContextValue | null>(null);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const { data: networks = [], isLoading, isFetched } = useNetworks();
  const [activeNetwork, setActiveNetworkState] = useState<WaterNetwork | null>(null);

  // Rehydrate from localStorage, then confirm it's in the fetched list
  useEffect(() => {
    if (networks.length === 0) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const found = networks.find((n) => n.id === stored) ?? null;
      setActiveNetworkState(found ?? networks[0]);
    } else {
      setActiveNetworkState(networks[0]);
    }
  }, [networks]);

  const setActiveNetwork = useCallback((network: WaterNetwork | null) => {
    setActiveNetworkState(network);
    if (network) {
      localStorage.setItem(STORAGE_KEY, network.id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return (
    <NetworkContext.Provider value={{ networks, activeNetwork, setActiveNetwork, isLoading, hasNetworks: isFetched && networks.length > 0 }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork(): NetworkContextValue {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error('useNetwork must be used within NetworkProvider');
  return ctx;
}
