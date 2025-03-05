export const LOG_LEVELS = {
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
} as const;

export type LogLevel = keyof typeof LOG_LEVELS;

export type ConsoleDirOptions = {
  depth?: number;
  colors?: boolean;
  showHidden?: boolean;
};

export const COLOR_MAP: Record<LogLevel, string> = {
  DEBUG: "green",
  INFO: "blue",
  WARN: "yellow",
  ERROR: "red",
};

/**
 * Overrides console with colors and filtering based on log level.
 * A drop-in replacement for console with log level filtering and color coding.
 *
 * @example
 * ```ts
 * import { CConsole, type LogLevel } from "@polyseam/cconsole";
 * const verbosity = Deno.env.get("EXAMPLE_VERBOSITY") as LogLevel;
 * const cconsole = new CConsole(verbosity);
 * cconsole.log("This is a log message");
 * cconsole.error("This is an error message");
 * cconsole.debug("This is a debug message"); // Will not log if verbosity is above DEBUG.
 * cconsole.info("This is an info message");
 * ```
 */
export class CConsole implements Console {
  private logLevel: number;
  private readonly oconsole: Console;

  constructor(logLevel: LogLevel) {
    this.oconsole = console;
    if (!LOG_LEVELS[logLevel]) {
      this.logLevel = LOG_LEVELS.DEBUG;
      this.debug(
        'CConsole instantiated with invalid log level, defaulting to "DEBUG"',
      );
    } else {
      this.logLevel = LOG_LEVELS[logLevel];
    }
  }

  // Private helper to determine if a message with a given level should be logged.
  private shouldLog(level: number): boolean {
    return level >= this.logLevel;
  }

  // Treat 'log' as equivalent to INFO.
  log(...args: unknown[]): void {
    if (!this.shouldLog(LOG_LEVELS.INFO)) return;
    this.oconsole.log("[LOG]", ...args);
  }

  debug(...args: unknown[]): void {
    if (!this.shouldLog(LOG_LEVELS.DEBUG)) return;
    this.oconsole.debug(`%c[DEBUG]`, `color:${COLOR_MAP.DEBUG}`, ...args);
  }

  info(...args: unknown[]): void {
    if (!this.shouldLog(LOG_LEVELS.INFO)) return;
    if (typeof this.oconsole.info === "function") {
      this.oconsole.info(`%c[INFO]`, `color:${COLOR_MAP.INFO}`, ...args);
    } else {
      this.oconsole.log(`%c[INFO]`, `color:${COLOR_MAP.INFO}`, ...args);
    }
  }

  warn(...args: unknown[]): void {
    if (!this.shouldLog(LOG_LEVELS.WARN)) return;
    this.oconsole.warn(`%c[WARN]`, `color:${COLOR_MAP.WARN}`, ...args);
  }

  error(...args: unknown[]): void {
    if (!this.shouldLog(LOG_LEVELS.ERROR)) return;
    this.oconsole.error(`%c[ERROR]`, `color:${COLOR_MAP.ERROR}`, ...args);
  }

  dir(
    object: unknown,
    options?: {
      depth?: number;
      colors?: boolean;
      showHidden?: boolean;
    },
  ): void {
    this.oconsole.dir(object, options);
  }

  table(data: unknown, columns?: string[]): void {
    this.oconsole.table(data, columns);
  }

  assert(condition?: boolean, ...data: unknown[]): void {
    if (!condition) {
      this.error("Assertion failed", ...data);
    }
  }

  clear(): void {
    this.oconsole.clear();
  }

  count(label?: string): void {
    this.oconsole.count(label);
  }

  countReset(label?: string): void {
    this.oconsole.countReset(label);
  }

  group(...data: unknown[]): void {
    this.oconsole.group(...data);
  }

  groupCollapsed(...data: unknown[]): void {
    this.oconsole.groupCollapsed(...data);
  }

  groupEnd(): void {
    this.oconsole.groupEnd();
  }

  time(label?: string): void {
    this.oconsole.time(label);
  }

  timeLog(label?: string, ...data: unknown[]): void {
    this.oconsole.timeLog(label, ...data);
  }

  timeEnd(label?: string): void {
    this.oconsole.timeEnd(label);
  }

  trace(...data: unknown[]): void {
    this.oconsole.trace(...data);
  }

  dirxml(...data: unknown[]): void {
    this.oconsole.dirxml(...data);
  }

  timeStamp(label?: string): void {
    if (typeof this.oconsole.timeStamp === "function") {
      this.oconsole.timeStamp(label);
    }
  }

  profile(label?: string): void {
    if (typeof this.oconsole.profile === "function") {
      this.oconsole.profile(label);
    }
  }

  profileEnd(label?: string): void {
    if (typeof this.oconsole.profileEnd === "function") {
      this.oconsole.profileEnd(label);
    }
  }

  /**
   * Dynamically update the log level.
   * @param newLevel The new log level to set.
   */
  setLogLevel(newLevel: LogLevel): void {
    if (LOG_LEVELS[newLevel] !== undefined) {
      this.logLevel = LOG_LEVELS[newLevel];
    } else {
      this.error(`Invalid log level "${newLevel}" provided to setLogLevel`);
    }
  }
}
