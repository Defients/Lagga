import { invoke } from "@tauri-apps/api/core";

interface RawSystemMetrics {
  cpu_usage: number;
  memory_used_mb: number;
  memory_total_mb: number;
  memory_percent: number;
}

export interface SystemMetricsResponse {
  cpuUsage: number;
  memoryUsedMb: number;
  memoryTotalMb: number;
  memoryPercent: number;
}

export async function getSystemMetrics(): Promise<SystemMetricsResponse> {
  const raw = await invoke<RawSystemMetrics>("get_system_metrics");
  return {
    cpuUsage: raw.cpu_usage,
    memoryUsedMb: raw.memory_used_mb,
    memoryTotalMb: raw.memory_total_mb,
    memoryPercent: raw.memory_percent,
  };
}
