import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { SensorReading, TimePoint, WaterSource, Alert, RegionPrediction, Region } from '../data/mockData';
import {
  fetchRegions,
  fetchSensorReadings,
  fetchTimeSeries,
  fetchWaterSources,
  fetchAlerts,
  fetchPredictions,
} from '../services/api';

interface DataState {
  regions: Region[];
  currentReadings: SensorReading[];
  timeSeriesData: TimePoint[];
  waterSources: WaterSource[];
  recentAlerts: Alert[];
  regionPredictions: RegionPrediction[];
  loading: boolean;
  error: string | null;
}

const DataContext = createContext<DataState>({
  regions: [],
  currentReadings: [],
  timeSeriesData: [],
  waterSources: [],
  recentAlerts: [],
  regionPredictions: [],
  loading: true,
  error: null,
});

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataState>({
    regions: [],
    currentReadings: [],
    timeSeriesData: [],
    waterSources: [],
    recentAlerts: [],
    regionPredictions: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    Promise.all([
      fetchRegions(),
      fetchSensorReadings(),
      fetchTimeSeries(),
      fetchWaterSources(),
      fetchAlerts(),
      fetchPredictions(),
    ])
      .then(([regions, currentReadings, timeSeriesData, waterSources, recentAlerts, regionPredictions]) => {
        setState({
          regions,
          currentReadings,
          timeSeriesData,
          waterSources,
          recentAlerts,
          regionPredictions,
          loading: false,
          error: null,
        });
      })
      .catch((err: Error) => {
        setState(prev => ({ ...prev, loading: false, error: err.message }));
      });
  }, []);

  return <DataContext.Provider value={state}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
