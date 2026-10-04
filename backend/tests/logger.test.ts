import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import { logger } from '../src/config/logger';

describe('Logger Format & Environment Togglability', () => {
  const originalLogFormat = process.env.LOG_FORMAT;

  afterEach(() => {
    if (originalLogFormat !== undefined) {
      process.env.LOG_FORMAT = originalLogFormat;
    } else {
      delete process.env.LOG_FORMAT;
    }
  });

  it('outputs structured JSON when LOG_FORMAT=json', () => {
    process.env.LOG_FORMAT = 'json';
    const output = logger.formatLog('info', {
      message: 'Database connection established',
      action: 'DB_CONNECT',
    });

    expect(output).toContain('"level":"info"');
    expect(output).toContain('"message":"Database connection established"');
    expect(output).toContain('"action":"DB_CONNECT"');
    const parsed = JSON.parse(output);
    expect(parsed.level).toBe('info');
    expect(parsed.message).toBe('Database connection established');
  });

  it('outputs color-coded pretty log with emoji when LOG_FORMAT=pretty', () => {
    process.env.LOG_FORMAT = 'pretty';
    const output = logger.formatLog('info', {
      message: 'Server started on port 3000',
      action: 'SERVER_START',
    });

    expect(output).toContain('ℹ️');
    expect(output).toContain('[INFO]');
    expect(output).toContain('Server started on port 3000');
    expect(output).toContain('\x1b['); // ANSI color codes present
  });

  it('outputs warning badge with emoji for warn level in pretty mode', () => {
    process.env.LOG_FORMAT = 'pretty';
    const output = logger.formatLog('warn', {
      message: 'High rate limit threshold reached',
    });

    expect(output).toContain('⚠️');
    expect(output).toContain('[WARN]');
    expect(output).toContain('High rate limit threshold reached');
  });
});
