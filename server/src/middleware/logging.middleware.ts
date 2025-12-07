import type { Request, Response, NextFunction } from 'express';

interface LogEntry {
  timestamp: string;
  method: string;
  path: string;
  status: number;
  duration: number;
  ip: string;
  userAgent?: string;
  userId?: string;
}

/**
 * HTTP request/response logging middleware
 * Logs method, path, status code, and response time
 */
export function loggingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  // Capture the original end function
  const originalEnd = res.end;

  // Override end to log after response is sent
  res.end = function (chunk?: unknown, encoding?: BufferEncoding | (() => void), callback?: () => void): Response {
    const duration = Date.now() - startTime;
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl || req.url,
      status: res.statusCode,
      duration,
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.get('user-agent'),
      userId: (req as Request & { user?: { id: string } }).user?.id,
    };

    // Color-coded console output
    const statusColor = getStatusColor(res.statusCode);
    const methodColor = getMethodColor(req.method);

    console.log(
      `${logEntry.timestamp} ${methodColor}${req.method.padEnd(7)}${resetColor} ` +
      `${statusColor}${res.statusCode}${resetColor} ` +
      `${logEntry.path} ` +
      `${dimColor}${duration}ms${resetColor}` +
      (logEntry.userId ? ` ${dimColor}[${logEntry.userId.slice(0, 8)}]${resetColor}` : '')
    );

    // Log errors with more detail
    if (res.statusCode >= 400) {
      console.error(`  Error: ${req.method} ${logEntry.path} returned ${res.statusCode}`);
    }

    // Call the original end function
    return originalEnd.call(this, chunk, encoding as BufferEncoding, callback);
  };

  next();
}

// ANSI color codes
const resetColor = '\x1b[0m';
const dimColor = '\x1b[2m';
const greenColor = '\x1b[32m';
const yellowColor = '\x1b[33m';
const redColor = '\x1b[31m';
const cyanColor = '\x1b[36m';
const magentaColor = '\x1b[35m';
const blueColor = '\x1b[34m';

function getStatusColor(status: number): string {
  if (status >= 500) return redColor;
  if (status >= 400) return yellowColor;
  if (status >= 300) return cyanColor;
  if (status >= 200) return greenColor;
  return resetColor;
}

function getMethodColor(method: string): string {
  switch (method) {
    case 'GET': return greenColor;
    case 'POST': return cyanColor;
    case 'PUT': return yellowColor;
    case 'PATCH': return magentaColor;
    case 'DELETE': return redColor;
    default: return blueColor;
  }
}

/**
 * Error logging middleware
 * Should be used after routes to catch unhandled errors
 */
export function errorLoggingMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(`${redColor}ERROR${resetColor} ${req.method} ${req.originalUrl || req.url}`);
  console.error(`  Message: ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(`  Stack: ${err.stack}`);
  }
  next(err);
}
