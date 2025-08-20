'use client';

import { useEffect, useState, useRef } from 'react';
import { Telemetry, type TelemetryEvent } from '@/lib/telemetry';
import { Button } from './Button';
import { Chip } from './Chip';

interface TelemetryLoggerProps {
  className?: string;
}

export function TelemetryLogger({ className = '' }: TelemetryLoggerProps) {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPersisting, setIsPersisting] = useState(true);
  const [eventCount, setEventCount] = useState(0);
  const [leadCount, setLeadCount] = useState(0);
  const eventsEndRef = useRef<HTMLDivElement>(null);
  const [maxEvents, setMaxEvents] = useState(100); // Limit events in memory

  useEffect(() => {
    // Load initial data
    setEvents(Telemetry.events.getAll());
    setEventCount(Telemetry.events.count());
    setLeadCount(Telemetry.leads.count());

    // Subscribe to new events
    const unsubscribe = Telemetry.events.subscribe((event) => {
      if (!isPaused) {
        setEvents(prev => {
          const newEvents = [...prev, event];
          // Keep only the last maxEvents
          return newEvents.slice(-maxEvents);
        });
        setEventCount(Telemetry.events.count());
      }
    });

    return unsubscribe;
  }, [isPaused, maxEvents]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (!isCollapsed && eventsEndRef.current) {
      eventsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events, isCollapsed]);

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleClear = () => {
    Telemetry.events.clear();
    setEvents([]);
    setEventCount(0);
  };

  const handleDownloadEvents = () => {
    Telemetry.events.download();
  };

  const handleDownloadLeads = () => {
    Telemetry.leads.download();
  };

  const handleClearLeads = () => {
    Telemetry.leads.clear();
    setLeadCount(0);
  };

  const handleTogglePersist = () => {
    setIsPersisting(!isPersisting);
    if (isPersisting) {
      Telemetry.disable();
    } else {
      Telemetry.enable();
    }
  };

  const formatTimestamp = (ts: string) => {
    return new Date(ts).toLocaleTimeString();
  };

  const getEventIcon = (type: TelemetryEvent['type']) => {
    switch (type) {
      case 'click': return '🖱️';
      case 'change': return '✏️';
      case 'submit': return '📝';
      case 'keypress': return '⌨️';
      case 'route': return '🔄';
      case 'custom': return '⚡';
      default: return '📊';
    }
  };

  const getEventColor = (type: TelemetryEvent['type']) => {
    switch (type) {
      case 'click': return 'bg-blue-500';
      case 'change': return 'bg-green-500';
      case 'submit': return 'bg-purple-500';
      case 'keypress': return 'bg-yellow-500';
      case 'route': return 'bg-indigo-500';
      case 'custom': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  if (isCollapsed) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <div className="bg-gray-900 text-white rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-3">
                      <div className="text-sm font-mono">
            📊 CExCIE Logger | {eventCount} interactions | 👥 {leadCount} prospects
          </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsCollapsed(false)}
              className="text-white hover:bg-gray-800"
            >
              📈
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 w-96 max-h-96 ${className}`}>
      <div className="bg-gray-900 text-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono font-bold">📊 CExCIE Logger</span>
            <Chip className="text-xs">
              {eventCount} interactions
            </Chip>
            <Chip className="text-xs">
              {leadCount} prospects
            </Chip>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsCollapsed(true)}
              className="text-white hover:bg-gray-700"
              title="Collapse Logger"
            >
              📉
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsCollapsed(true)}
              className="text-white hover:bg-gray-700"
              title="Minimize Logger"
            >
              ➖
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-700 px-4 py-2 flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant={isPaused ? "primary" : "secondary"}
            onClick={handlePauseResume}
            className="text-xs"
          >
            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClear}
            className="text-xs"
          >
            🗑️ Clear
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownloadEvents}
            className="text-xs"
          >
            📥 Interactions
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownloadLeads}
            className="text-xs"
          >
            📥 Prospects
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClearLeads}
            className="text-xs"
          >
            🗑️ Prospects
          </Button>
          
          <Button
            size="sm"
            variant={isPersisting ? "primary" : "secondary"}
            onClick={handleTogglePersist}
            className="text-xs"
          >
            {isPersisting ? '💾 On' : '💾 Off'}
          </Button>
        </div>

        {/* Events List */}
        <div className="max-h-64 overflow-y-auto bg-black p-2">
          {events.length === 0 ? (
            <div className="text-gray-500 text-center py-4 text-sm">
              No interactions captured yet...
            </div>
          ) : (
            <div className="space-y-1">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="text-xs font-mono bg-gray-900 p-2 rounded border-l-2 border-gray-700 hover:bg-gray-800"
                  style={{ borderLeftColor: getEventColor(event.type).replace('bg-', '').split('-')[0] === 'blue' ? '#3b82f6' : 
                          getEventColor(event.type).replace('bg-', '').split('-')[0] === 'green' ? '#10b981' :
                          getEventColor(event.type).replace('bg-', '').split('-')[0] === 'purple' ? '#8b5cf6' :
                          getEventColor(event.type).replace('bg-', '').split('-')[0] === 'yellow' ? '#eab308' :
                          getEventColor(event.type).replace('bg-', '').split('-')[0] === 'indigo' ? '#6366f1' :
                          getEventColor(event.type).replace('bg-', '').split('-')[0] === 'pink' ? '#ec4899' : '#6b7280' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{getEventIcon(event.type)}</span>
                    <span className="text-gray-400">{formatTimestamp(event.ts)}</span>
                    <span className="text-blue-400">{event.type}</span>
                  </div>
                
                {/* Semantic Information - Clean Business Data */}
                <div className="text-gray-300">
                  <span className="text-white font-semibold">📝 {event.semantic.label}</span>
                </div>
                
                {event.semantic.entityType && (
                  <div className="text-gray-300">
                    Type: <span className="text-blue-400">{event.semantic.entityType}</span>
                    {event.semantic.entityId && (
                      <> | ID: <span className="text-blue-400">{event.semantic.entityId}</span></>
                    )}
                  </div>
                )}
                
                {event.semantic.context && (
                  <div className="text-gray-300">
                    Context: <span className="text-indigo-400">{event.semantic.context}</span>
                  </div>
                )}
                
                {event.semantic.action && (
                  <div className="text-gray-300">
                    Action: <span className="text-green-400">{event.semantic.action}</span>
                  </div>
                )}
                
                {/* Business-Relevant Details Only */}
                {event.details?.key && (
                  <div className="text-gray-300">
                    Key: <span className="text-purple-400">{event.details.key}</span>
                  </div>
                )}
                
                {event.details?.route && (
                  <div className="text-gray-300">
                    Route: <span className="text-orange-400">{event.details.route.from} → {event.details.route.to}</span>
                  </div>
                )}
                
                {event.details?.custom && Object.keys(event.details.custom).length > 0 && (
                  <div className="text-gray-300">
                    Data: <span className="text-pink-400">{JSON.stringify(event.details.custom)}</span>
                  </div>
                )}
                </div>
              ))}
              <div ref={eventsEndRef} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400">
          <div className="flex justify-between items-center">
            <span>Session: {Telemetry.events.getSessionId().slice(0, 8)}...</span>
            <span>Max: {maxEvents}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
