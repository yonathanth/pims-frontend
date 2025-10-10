// Debug logging utility for both dev and built environments
interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
}

class DebugLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Keep last 100 logs

  log(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    this.logs.push(entry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console log for development and debugging
    console[level](`[${entry.timestamp}] ${message}`, data || '');

    // Store in localStorage for built app debugging
    try {
      localStorage.setItem('pims-debug-logs', JSON.stringify(this.logs));
    } catch (error) {
      // Ignore localStorage errors
    }

    // For built Tauri apps, we'll rely on localStorage and the debug panel
    // Tauri logging can be added later if needed
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    try {
      localStorage.removeItem('pims-debug-logs');
    } catch (error) {
      // Ignore localStorage errors
    }
  }

  // Load logs from localStorage on initialization
  loadStoredLogs() {
    try {
      const stored = localStorage.getItem('pims-debug-logs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      // Ignore parsing errors
    }
  }
}

// Create singleton instance
export const debugLogger = new DebugLogger();

// Load any existing logs
debugLogger.loadStoredLogs();

// Log app initialization
debugLogger.info('Debug logger initialized', {
  userAgent: navigator.userAgent,
  location: window.location.href,
  timestamp: new Date().toISOString(),
});
