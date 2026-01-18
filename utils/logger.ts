/**
 * Structured logging system with multiple severity levels
 * Provides consistent logging interface with filtering and remote reporting
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: number;
  stackTrace?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private minLevel: LogLevel = 'info';
  private remoteEndpoint?: string;

  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    critical: 4
  };

  setLevel(level: LogLevel) {
    this.minLevel = level;
  }

  setRemoteEndpoint(endpoint: string) {
    this.remoteEndpoint = endpoint;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel];
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: Date.now(),
      stackTrace: error?.stack
    };

    this.logs.push(entry);

    // Maintain circular buffer
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output with appropriate styling
    const prefix = `[${level.toUpperCase()}]`;
    const style = this.getConsoleStyle(level);
    
    if (context) {
      console.log(`%c${prefix}`, style, message, context);
    } else {
      console.log(`%c${prefix}`, style, message);
    }

    // Send critical errors to remote endpoint
    if (level === 'critical' && this.remoteEndpoint) {
      this.sendToRemote(entry);
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    const styles: Record<LogLevel, string> = {
      debug: 'color: #9CA3AF; font-weight: normal',
      info: 'color: #3B82F6; font-weight: bold',
      warn: 'color: #F59E0B; font-weight: bold',
      error: 'color: #EF4444; font-weight: bold',
      critical: 'color: #DC2626; font-weight: bold; background: #FEE2E2; padding: 2px 4px'
    };
    return styles[level];
  }

  private async sendToRemote(entry: LogEntry) {
    try {
      await fetch(this.remoteEndpoint!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (err) {
      console.error('[Logger] Failed to send log to remote endpoint:', err);
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, any>, error?: Error) {
    this.log('error', message, context, error);
  }

  critical(message: string, context?: Record<string, any>, error?: Error) {
    this.log('critical', message, context, error);
  }

  getLogs(level?: LogLevel, limit = 100): LogEntry[] {
    let filtered = level 
      ? this.logs.filter(log => log.level === level)
      : this.logs;
    
    return filtered.slice(-limit);
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  clear() {
    this.logs = [];
  }
}

export const logger = new Logger();

// Set appropriate level based on environment
if (process.env.NODE_ENV === 'production') {
  logger.setLevel('warn');
} else {
  logger.setLevel('debug');
}
