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

type CConsolePaddingOptions = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

type CConsoleColorsOptions = null | {
  LOG: null | string;
  DEBUG: null | string;
  INFO: null | string;
  WARN: null | string;
  ERROR: null | string;
};

export type CConsoleOptions = {
  padding: CConsolePaddingOptions;
  colors: CConsoleColorsOptions;
  prefixes: CConsolePrefixesOptions;
};

export type CConsolePrefixesOptions = {
  LOG: string;
  DEBUG: string;
  INFO: string;
  WARN: string;
  ERROR: string;
};

const SPACE = " ";
const NEWLINE = "\n";

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
  padding: CConsolePaddingOptions;
  colors: CConsoleColorsOptions;
  prefixes: CConsolePrefixesOptions;

  constructor(uLogLevel: LogLevel, options: CConsoleOptions = {
    padding: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    colors: {
      LOG: null, // base color, still visible
      DEBUG: "green",
      INFO: "blue",
      WARN: "yellow",
      ERROR: "red",
    },
    prefixes: {
      LOG: "[LOG]",
      DEBUG: "[DEBUG]",
      INFO: "[INFO]",
      WARN: "[WARN]",
      ERROR: "[ERROR]",
    },
  }) {
    this.oconsole = console;
    this.padding = options.padding;
    this.colors = options.colors;
    this.prefixes = options.prefixes;

    const logLevel = uLogLevel?.toUpperCase() as LogLevel;

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

  private getPrefix(level: LogLevel | "LOG"): string[] {

    const prefix = this.prefixes[level];
    const out: string[] = [];

    if (prefix === null) {
      return out;
    }

    if(this.colors?.[level]) {
      out.push(`%c${prefix}`, `color:${this.colors[level]}`);
    } else {
      out.push(prefix);
    }

    if (this.padding?.top) {
      out.unshift(NEWLINE.repeat(this.padding.top));
    }

    if (this.padding?.left) {
      out.unshift(SPACE.repeat(this.padding.left));
    }

    return out;
  }

  private getSuffix(): string[] {
    const out: string[] = [];

    if (this.padding?.right) {
      out.push(SPACE.repeat(this.padding.right));
    }

    if (this.padding?.bottom) {
      out.push(NEWLINE.repeat(this.padding.bottom));
    }

    return out;
  }

  // Treat 'log' as equivalent to INFO.
  log(...args: unknown[]): void {
    if (!this.shouldLog(LOG_LEVELS.INFO)) return;
    const out = [...this.getPrefix("LOG"), ...args, ...this.getSuffix()];
    this.oconsole.log(...out);
  }

  debug(...args: unknown[]): void {
    if (!this.shouldLog(LOG_LEVELS.DEBUG)) return;
    const out = [...this.getPrefix("DEBUG"), ...args, ...this.getSuffix()];
    this.oconsole.debug(...out);
  }

  info(...args: unknown[]): void {
    if (!this.shouldLog(LOG_LEVELS.INFO)) return;
    const out = [...this.getPrefix("INFO"), ...args, ...this.getSuffix()];
    this.oconsole.info(...out);
  }

  warn(...args: unknown[]): void {
    if (!this.shouldLog(LOG_LEVELS.WARN)) return;
    const out = [...this.getPrefix("WARN"), ...args, ...this.getSuffix()];
    this.oconsole.warn(...out);
  }

  error(...args: unknown[]): void {
    if (!this.shouldLog(LOG_LEVELS.ERROR)) return;
    const out = [...this.getPrefix("ERROR"), ...args, ...this.getSuffix()];
    this.oconsole.error(...out);
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
