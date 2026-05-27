import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type {
  WaterNetwork,
  EnhancedNetworkStats,
  PipeFeatureCollection,
  NodeFeatureCollection,
  ZoneFeatureCollection,
  AssetFeatureCollection,
  NetworkUpload,
} from '../types/api';

export function useNetworks(enabled = true) {
  return useQuery({
    queryKey: ['networks'],
    queryFn: () => api.get<WaterNetwork[]>('/networks/').then((r) => r.data),
    enabled,
    staleTime: 60_000,
  });
}

export function useNetworkDetail(networkId: string | null) {
  return useQuery({
    queryKey: ['network', networkId],
    queryFn: () => api.get<WaterNetwork>(`/networks/${networkId}/`).then((r) => r.data),
    enabled: !!networkId,
    staleTime: 60_000,
  });
}

export function useNetworkStats(networkId: string | null) {
  return useQuery({
    queryKey: ['network-stats', networkId],
    queryFn: () =>
      api.get<EnhancedNetworkStats>(`/networks/${networkId}/stats/`).then((r) => r.data),
    enabled: !!networkId,
    staleTime: 60_000,
  });
}

export function usePipes(networkId: string | null, bbox?: string) {
  return useQuery({
    queryKey: ['pipes', networkId, bbox ?? null],
    queryFn: () =>
      api
        .get<PipeFeatureCollection>(`/networks/${networkId}/pipes/`, {
          params: bbox ? { bbox } : undefined,
        })
        .then((r) => r.data),
    enabled: !!networkId,
    staleTime: Infinity, // pipe geometry rarely changes mid-session
  });
}

export function useNodes(networkId: string | null, bbox?: string) {
  return useQuery({
    queryKey: ['nodes', networkId, bbox ?? null],
    queryFn: () =>
      api
        .get<NodeFeatureCollection>(`/networks/${networkId}/nodes/`, {
          params: bbox ? { bbox } : undefined,
        })
        .then((r) => r.data),
    enabled: !!networkId,
    staleTime: Infinity,
  });
}

export function useZones(networkId: string | null) {
  return useQuery({
    queryKey: ['zones', networkId],
    queryFn: () =>
      api.get<ZoneFeatureCollection>(`/networks/${networkId}/zones/`).then((r) => r.data),
    enabled: !!networkId,
    staleTime: Infinity,
  });
}

export function useAssets(networkId: string | null, bbox?: string) {
  return useQuery({
    queryKey: ['assets', networkId, bbox ?? null],
    queryFn: () =>
      api
        .get<AssetFeatureCollection>(`/networks/${networkId}/assets/`, {
          params: bbox ? { bbox } : undefined,
        })
        .then((r) => r.data),
    enabled: !!networkId,
    staleTime: Infinity,
  });
}

export function useUploadStatus(uploadId: string | null) {
  return useQuery({
    queryKey: ['upload', uploadId],
    queryFn: () =>
      api.get<NetworkUpload>(`/networks/${uploadId}/validate/`).then((r) => r.data),
    enabled: !!uploadId,
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      if (!s || s === 'complete' || s === 'complete_warnings' || s === 'failed') return false;
      return 3_000;
    },
  });
}

export function useNetworkUploads(networkId: string | null) {
  return useQuery({
    queryKey: ['network-uploads', networkId],
    queryFn: () =>
      api.get<NetworkUpload[]>(`/networks/${networkId}/uploads/`).then((r) => r.data),
    enabled: !!networkId,
    staleTime: 30_000,
  });
}

export function useEpanetUpload(networkId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return api
        .post<{ upload_id: string; status: string }>(
          `/networks/${networkId}/epanet/`,
          form,
          { headers: { 'Content-Type': 'multipart/form-data' } },
        )
        .then((r) => r.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-uploads', networkId] });
      queryClient.invalidateQueries({ queryKey: ['nodes', networkId] });
      queryClient.invalidateQueries({ queryKey: ['network-stats', networkId] });
    },
  });
}
