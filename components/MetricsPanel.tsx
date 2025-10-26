"use client";

/**
 * MetricsPanel - Event log display
 *
 * Shows a scrolling log of all UIMessages.
 * Exposes window.__pushMetric() for manual testing.
 */

import { useEffect, useState, useRef } from "react";
import { UIMessage } from "@/types";

export interface MetricsPanelProps {
  events?: UIMessage[];
}

// Extend window type for debug hook
declare global {
  interface Window {
    __pushMetric?: (message: UIMessage) => void;
  }
}

export function MetricsPanel({ events: externalEvents = [] }: MetricsPanelProps) {
  const [internalEvents, setInternalEvents] = useState<UIMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Merge external and internal events
  const allEvents = [...externalEvents, ...internalEvents];

  // Install debug hook on mount
  useEffect(() => {
    window.__pushMetric = (message: UIMessage) => {
      console.log("[MetricsPanel] Debug metric:", message);
      setInternalEvents((prev) => [...prev, message]);
    };

    return () => {
      delete window.__pushMetric;
    };
  }, []);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allEvents.length]);

  const clearEvents = () => {
    setInternalEvents([]);
  };

  return (
    <div className="metrics-panel">
      <div className="metrics-header">
        <h3>Event Log</h3>
        <div className="metrics-actions">
          <span className="event-count">{allEvents.length} events</span>
          <button onClick={clearEvents} className="clear-button">
            Clear
          </button>
        </div>
      </div>

      <div className="metrics-scroll" ref={scrollRef}>
        {allEvents.length === 0 ? (
          <div className="metrics-empty">No events yet</div>
        ) : (
          allEvents.map((event, idx) => (
            <div key={idx} className={`metric-item metric-${event.type}`}>
              <div className="metric-header">
                <span className="metric-type">{event.type}</span>
                <span className="metric-time">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
              {event.text && <div className="metric-text">{event.text}</div>}
              {event.payload !== undefined && (
                <details className="metric-payload">
                  <summary>Payload</summary>
                  <pre>{JSON.stringify(event.payload, null, 2)}</pre>
                </details>
              )}
            </div>
          ))
        )}
      </div>

      <div className="metrics-footer">
        <small>
          Debug: <code>window.__pushMetric({"{"} type: "note", timestamp: Date.now(), text: "test" {"}"})</code>
        </small>
      </div>
    </div>
  );
}
