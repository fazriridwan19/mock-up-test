import { useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';
import type { ApiResponse } from '../types';

export type JobState = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';

export interface JobStatus {
  id: string;
  state: JobState;
  progress: number;
  result: unknown;
  error: string | null;
}

interface UseJobPollerOptions {
  /** jobId returned from the mutation API call. Pass null to disable. */
  jobId: string | null;
  /** Base API path for status polling. E.g. '/biodata/jobs' or '/admin/jobs' */
  basePath: string;
  /** Polling interval in ms. Default 800ms. */
  intervalMs?: number;
  /** Called once when the job reaches 'completed' state. */
  onCompleted?: (result: unknown) => void;
  /** Called once when the job reaches 'failed' state. */
  onFailed?: (error: string) => void;
}

/**
 * Polls a backend job status endpoint until the job is completed or failed.
 * Returns a cancel function that can be used to stop polling early.
 */
export function useJobPoller({
  jobId,
  basePath,
  intervalMs = 800,
  onCompleted,
  onFailed,
}: UseJobPollerOptions): { cancel: () => void } {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(false);

  const cancel = useCallback(() => {
    activeRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!jobId) return;

    activeRef.current = true;

    const poll = async () => {
      if (!activeRef.current) return;

      try {
        const { data } = await api.get<ApiResponse<JobStatus>>(
          `${basePath}/${jobId}`,
        );
        const status = data.data;

        if (status.state === 'completed') {
          activeRef.current = false;
          onCompleted?.(status.result);
          return;
        }

        if (status.state === 'failed') {
          activeRef.current = false;
          onFailed?.(status.error ?? 'Operasi gagal');
          return;
        }

        // Still pending — schedule next poll
        if (activeRef.current) {
          timerRef.current = setTimeout(poll, intervalMs);
        }
      } catch {
        // Network hiccup — retry
        if (activeRef.current) {
          timerRef.current = setTimeout(poll, intervalMs * 2);
        }
      }
    };

    // Start first poll immediately
    void poll();

    return () => cancel();
  }, [jobId, basePath, intervalMs, onCompleted, onFailed, cancel]);

  return { cancel };
}
