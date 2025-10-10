import { useState, useEffect } from 'react';
import { Button } from '@carbon/react';
import { Copy, TrashCan, Download } from '@carbon/icons-react';
import { debugLogger } from '../utils/debugLogger';

interface DebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DebugPanel({ isOpen, onClose }: DebugPanelProps) {
  const [logs, setLogs] = useState(debugLogger.getLogs());
  const [filter, setFilter] = useState<
    'all' | 'error' | 'warn' | 'info' | 'debug'
  >('all');

  useEffect(() => {
    if (isOpen) {
      // Refresh logs when panel opens
      setLogs(debugLogger.getLogs());

      // Set up interval to refresh logs
      const interval = setInterval(() => {
        setLogs(debugLogger.getLogs());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const filteredLogs = logs.filter(
    (log) => filter === 'all' || log.level === filter,
  );

  const copyLogs = () => {
    const logText = filteredLogs
      .map(
        (log) =>
          `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}${log.data ? `\n${JSON.stringify(log.data, null, 2)}` : ''}`,
      )
      .join('\n\n');

    navigator.clipboard.writeText(logText).then(() => {
      debugLogger.info('Logs copied to clipboard');
    });
  };

  const downloadLogs = () => {
    const logText = filteredLogs
      .map(
        (log) =>
          `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}${log.data ? `\n${JSON.stringify(log.data, null, 2)}` : ''}`,
      )
      .join('\n\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pims-debug-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    debugLogger.clearLogs();
    setLogs([]);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-3/4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Debug Logs</h2>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded"
            >
              <option value="all">All</option>
              <option value="error">Errors</option>
              <option value="warn">Warnings</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
            <Button
              kind="secondary"
              size="sm"
              renderIcon={Copy}
              onClick={copyLogs}
            >
              Copy
            </Button>
            <Button
              kind="secondary"
              size="sm"
              renderIcon={Download}
              onClick={downloadLogs}
            >
              Download
            </Button>
            <Button
              kind="danger"
              size="sm"
              renderIcon={TrashCan}
              onClick={clearLogs}
            >
              Clear
            </Button>
            <Button kind="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {/* Logs Display */}
        <div className="flex-1 p-4 overflow-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No logs found for the selected filter.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border-l-4 ${
                    log.level === 'error'
                      ? 'bg-red-50 border-red-400'
                      : log.level === 'warn'
                        ? 'bg-yellow-50 border-yellow-400'
                        : log.level === 'info'
                          ? 'bg-blue-50 border-blue-400'
                          : 'bg-gray-50 border-gray-400'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-gray-500">
                          {log.timestamp}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            log.level === 'error'
                              ? 'bg-red-100 text-red-800'
                              : log.level === 'warn'
                                ? 'bg-yellow-100 text-yellow-800'
                                : log.level === 'info'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {log.level.toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-1 font-mono text-sm">
                        {log.message}
                      </div>
                      {log.data && (
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 text-sm text-gray-600">
          Showing {filteredLogs.length} of {logs.length} logs
        </div>
      </div>
    </div>
  );
}
