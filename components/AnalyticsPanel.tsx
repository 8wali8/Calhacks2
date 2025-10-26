"use client";

/**
 * Analytics Panel - displays live analytics at bottom of interview
 * Auto-starts when interview starts, shows metrics badges
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { createAnalyticsController } from '@/lib/analytics/analyticsController';
import { asrService } from '@/lib/analytics/asr';
import type { AnalyticsController, MetricsEvent } from '@/lib/analytics/types';
import { LiveBadges } from './LiveBadges';

export interface AnalyticsPanelProps {
  isInterviewRunning: boolean; // Controlled by parent
  onAnalyticsReady?: () => void;
  onSummary?: (summary: any) => void;
  onFinalize?: () => void;
}

interface SummaryStats {
  wpm: { mean: number } | null;
  fillers_per_min: { mean: number } | null;
  gaze_stability: { mean: number } | null;
}

export function AnalyticsPanel({
  isInterviewRunning,
  onAnalyticsReady,
  onSummary,
  onFinalize,
}: AnalyticsPanelProps) {
  const [controller, setController] = useState<AnalyticsController | null>(null);
  const [latestMetrics, setLatestMetrics] = useState<MetricsEvent | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const finalizingRef = useRef(false);

  // Initialize controller on mount
  useEffect(() => {
    const ctrl = createAnalyticsController();
    setController(ctrl);

    // Subscribe to metrics
    const unsubscribe = ctrl.onMetrics((metrics) => {
      setLatestMetrics(metrics);
    });

    onAnalyticsReady?.();

    return () => {
      unsubscribe();
      ctrl.stop();
    };
  }, [onAnalyticsReady]);

  // Start/stop analytics when interview state changes
  const finalizeSession = useCallback(async () => {
    if (!controller || finalizingRef.current) return;

    finalizingRef.current = true;
    setIsFinalizing(true);

    try {
      if (isRunning) {
        await controller.stop();
        setIsRunning(false);
      }

      const summaryData = controller.getMetricsSummary();
      setSummary({
        wpm: summaryData.speech.wpm,
        fillers_per_min: summaryData.speech.fillers_per_min,
        gaze_stability: summaryData.face.gaze_stability,
      });

      onSummary?.(summaryData);
      onFinalize?.();

      console.log('[Analytics] Session summary:', summaryData);
    } catch (err) {
      console.error('[Analytics] Finalize error:', err);
    } finally {
      setIsFinalizing(false);
      finalizingRef.current = false;
    }
  }, [controller, isRunning, onSummary, onFinalize]);

  useEffect(() => {
    if (!controller) return;

    const handleStart = async () => {
      if (isRunning || finalizingRef.current) return;

      try {
        setError(null);
        setSummary(null); // Clear previous summary
        await controller.start({
          videoEl: videoRef.current || undefined,
          canvasEl: canvasRef.current || undefined,
          useASR: true,
          faceFps: 12,
          metricsHz: 10,
        });
        setIsRunning(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to start analytics';
        setError(message);
        console.error('[Analytics] Start error:', err);
      }
    };

    if (isInterviewRunning) {
      handleStart();
    } else if (!isInterviewRunning && isRunning) {
      finalizeSession();
    }
  }, [isInterviewRunning, controller, isRunning, finalizeSession]);

  return (
    <div style={{
      padding: '20px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>
        Analytics
        {isRunning && <span style={{ marginLeft: '8px', color: '#10b981', fontSize: '14px' }}>● Live</span>}
        {!isRunning && summary && <span style={{ marginLeft: '8px', color: '#6b7280', fontSize: '14px' }}>● Completed</span>}
      </h3>

      {error && (
        <div style={{
          padding: '8px 12px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#991b1b',
          fontSize: '13px',
          marginBottom: '12px',
        }}>
          {error}
        </div>
      )}

      {isRunning && (
        <>
          {/* Hidden video element for analytics */}
          <div style={{ display: 'none' }}>
            <video ref={videoRef} autoPlay playsInline muted />
            <canvas ref={canvasRef} />
          </div>

          {/* Live metrics badges */}
          <LiveBadges
            metrics={latestMetrics}
            asrAvailable={asrService.available}
          />

          <button
            onClick={finalizeSession}
            disabled={isFinalizing}
            style={{
              marginTop: '16px',
              padding: '10px 12px',
              width: '100%',
              background: isFinalizing ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isFinalizing ? 'not-allowed' : 'pointer',
            }}
          >
            {isFinalizing ? 'Preparing Summary...' : 'End & Review'}
          </button>
        </>
      )}

      {/* Show summary after interview ends */}
      {!isRunning && summary && (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
        }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '13px',
            fontWeight: 600,
            color: '#374151',
          }}>
            Session Summary (Top 3 Metrics)
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
          }}>
            <div style={{
              padding: '12px',
              background: '#f9fafb',
              borderRadius: '6px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                Avg Speech Rate
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                {summary.wpm?.mean ? Math.round(summary.wpm.mean) : '—'}
              </div>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
                words/min
              </div>
            </div>
            <div style={{
              padding: '12px',
              background: '#f9fafb',
              borderRadius: '6px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                Avg Fillers
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                {summary.fillers_per_min?.mean ? Math.round(summary.fillers_per_min.mean) : '—'}
              </div>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
                per minute
              </div>
            </div>
            <div style={{
              padding: '12px',
              background: '#f9fafb',
              borderRadius: '6px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                Gaze Stability
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                {summary.gaze_stability?.mean ? Math.round(summary.gaze_stability.mean) : '—'}
              </div>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
                lower is better
              </div>
            </div>
          </div>
        </div>
      )}

      {!isRunning && !error && !summary && (
        <div style={{
          padding: '24px',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '14px',
        }}>
          Analytics will start automatically when interview begins
        </div>
      )}
    </div>
  );
}
